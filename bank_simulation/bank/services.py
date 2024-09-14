import json
import uuid
from decimal import Decimal

from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, RateList, ForeignCurrencyWallet, \
    ConversionRate, InvestmentTransaction, AccountAsset, Assets, UserTransaction, ValuableMetalsList, Metals, \
    AccountActions


class CustomException(Exception):
    def __init__(self, message):
        super().__init__(message)

def custom_exception(func: callable):
    def wrapper(request, *args, **kwargs):
        try:
            return func(request, *args, **kwargs)
        except CustomException as e:
            return Response({"error": f"{e}"}, status=400)
    return wrapper

def to_int(value):
    try:
        value = int(value)
    except (ValueError, TypeError):
        return None
    else:
        return value


def positive_volatility_adjustment(price, base_volatility, threshold):
    if price > threshold:
        reduction_factor = 1 / ((price - threshold) // 50 + 1)
        return base_volatility * reduction_factor
    else:
        return base_volatility


def get_user_id(account_uuid):
    try:
        account_uuid = uuid.UUID(str(account_uuid))
    except (ValueError, TypeError):
        raise CustomException("invalid uuid")
    try:
        user_id = AccountAuthInfo.objects.only('id').get(uuid=account_uuid).pk
    except ObjectDoesNotExist:
        raise CustomException("Account not found")
    return user_id


def get_user_uuid(token_key):
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']

        user_uuid = AccountAuthInfo.objects.only('uuid').get(id=user_id)
    except TokenError:
        raise APIException("Invalid token")
    except ObjectDoesNotExist:
        raise CustomException("Account not found")

    return user_uuid

def get_user_id_by_account_number(account_number):
    try:
        user_id = Account.objects.only('id', 'account_number',
                                       'account_auth_info_id').get(account_number=account_number).account_auth_info_id
    except ObjectDoesNotExist:
        raise CustomException("Account not found")
    return user_id


def check_client_potential(user_id, amount):
    client_balance = int(Account.objects.only('balance').get(id=user_id).balance)
    if client_balance >= int(amount):
        return True
    else:
        raise CustomException("you don't have enough money")

def check_client_potential_assets(user_id, amount, currency_type, asset_id):
    asset = Assets.objects.get(id=asset_id)
    cost = int(amount) * asset.cost
    if currency_type == "EUR":
        client_balance = int(Account.objects.only('balance').get(id=user_id).balance)
        if client_balance >= cost:
            return cost
        else:
            raise CustomException("you don't have enough money")
    else:
        if ForeignCurrencyWallet.objects.filter(account_id=user_id, currency=currency_type).exists():
            client_balance = int(ForeignCurrencyWallet.objects.get(account_id=user_id, currency=currency_type))
            if client_balance >= cost:
                return cost
            else:
                raise CustomException("you don't have enough money")
        else:
            raise CustomException(f"you need a wallet with '{currency_type}' to make this deal")

def check_user_wallet(user_id, currency):
    if ForeignCurrencyWallet.objects.filter(currency=currency, account_id=user_id).exists():
        return True
    return False

def get_objects_list(model, amount):
    data = model.objects.all()[:to_int(amount)].order_by('-id')
    return data

def get_account_info(account_uuid):
    account_id = get_user_id(account_uuid)
    account = Account.objects.get(account_auth_info_id=account_id)
    return account


def get_objects_by_uuid(model, account_uuid, page, limit=10):
    account_id = get_user_id(account_uuid=account_uuid)
    obj = model.objects.filter(account_id=account_id).order_by('id')
    paginator = Paginator(obj, limit)
    page = int(page) if page is not None else 1
    obj = paginator.get_page(page)
    has_next = obj.has_next()
    return obj, has_next

def get_user_transfers(account_uuid, page, limit=10):
    account_id = get_user_id(account_uuid)
    transfers = Transfer.objects.filter(Q(sender_id=account_id) | Q(receiver_id=account_id)).order_by('id')
    paginator = Paginator(transfers, limit)
    page = int(page) if page is not None else 1
    transfers = paginator.get_page(page)
    has_next = transfers.has_next()
    return transfers, has_next

def get_currencies_rates_json(): # currencies
    rates = RateList.objects.latest('measurement_date').data.path
    with open(rates, 'r') as json_file:
        rates = json.load(json_file)
    return rates

def get_metals_json():
    metals = []
    for metal_code, metal_name in Metals.choices:
        metal = ValuableMetalsList.objects.get(metal=metal_code).data.path
        with open(metal, 'r') as json_file:
            metals.append(json.load(json_file))
    return metals


def get_asset_story(asset_ticker):
    try:
        asset_path = Assets.objects.get(ticker=asset_ticker).data
    except ObjectDoesNotExist:
        raise CustomException("asset not found")
    else:
        with open(asset_path, 'r') as json_file:
            json_data = json.load(json_file)
        return json_data

def get_account_history(sender_uuid):
    user_id = get_user_id(sender_uuid)
    try:
        data_path = Account.objects.only('account_auth_info', 'history').get(account_auth_info_id=user_id).history
    except ObjectDoesNotExist:
        raise CustomException('account history not found')
    else:
        with open(data_path, 'r') as json_file:
            json_data = json.load(json_file)
        return json_data


def update_pay_credit_early(sender_uuid, money_for_repayment, credit_uuid):
    sender_id = get_user_id(sender_uuid)
    client_potential = check_client_potential(user_id=sender_id, amount=money_for_repayment)
    if client_potential:
        try:
            credit = Credit.objects.get(account_id=sender_id, uuid=credit_uuid)
        except ObjectDoesNotExist:
            raise CustomException("credit wasn't found")
        account = Account.objects.get(account_auth_info_id=sender_id)
        money_for_repayment = int(money_for_repayment)
        if account.balance >= money_for_repayment:
            if money_for_repayment < credit.to_pay:
                account.balance -= money_for_repayment
                credit.to_pay -= money_for_repayment
                credit.paid_in_total += money_for_repayment
                account.save(account_action=AccountActions.CREDITS_TAKING_OUT, account_changing=-money_for_repayment), credit.save()
            elif money_for_repayment >= credit.to_pay:
                account.balance -= credit.to_pay
                credit.credit_status = Credit.LoanStatus.CLOSED
                credit.paid_in_total += credit.to_pay
                credit.to_pay = 0
                account.save(account_action=AccountActions.CREDITS_TAKING_OUT, account_changing=-credit.to_pay), credit.save()
            return credit
    else:
        return client_potential


def create_new_wallet(account_uuid, currency):
    if currency == 'EUR':
        raise CustomException("you already have a wallet with this currency by default")
    account_id = get_user_id(account_uuid)
    if check_user_wallet(account_id, currency):
        raise CustomException(f"you already have a wallet with {currency} currency")
    new_wallet = ForeignCurrencyWallet.objects.create(account_id=account_id, currency=currency)
    return new_wallet


def create_conversion(account_uuid, amount, starting_currency, final_currency):
    account_id = get_user_id(account_uuid)
    amount = int(amount)
    rate = RateList.objects.only('id').latest('measurement_date').id
    if starting_currency != "EUR":
        if not check_user_wallet(account_id, starting_currency):
            raise CustomException(f"you don't have a wallet with s {starting_currency} currency")
    if final_currency != "EUR":
        if not check_user_wallet(account_id, final_currency):
            raise CustomException(f"you don't have a wallet with f {final_currency} currency")
    client_potential = check_client_potential(user_id=account_id, amount=amount)
    if client_potential:
        conversion = Conversion.objects.create(account_id=account_id, amount=amount,
                                               starting_currency=starting_currency, final_currency=final_currency)
        ConversionRate.objects.create(exchange_id=rate, conversion=conversion)
        if starting_currency == "EUR":
            from_wallet = Account.objects.get(account_auth_info_id=account_id)
            to_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=final_currency)
            from_wallet.balance -= amount
            received_money = 0.01 * (100 - conversion.conversion_percentage) * amount
            converted_money = round(Decimal(received_money), 2)
            to_wallet.balance += converted_money
            from_wallet.save(account_action=AccountActions.CONVERSION_FE, account_changing=-int(converted_money)), to_wallet.save()
        elif final_currency == "EUR":
            from_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=starting_currency)
            to_wallet = Account.objects.get(account_auth_info_id=account_id)
            from_wallet.balance -= amount
            received_money = 0.01 * (100 - conversion.conversion_percentage) * amount
            converted_money = round(Decimal(received_money), 2)
            to_wallet.balance += converted_money
            from_wallet.save(account_action=AccountActions.CONVERSION_TE, account_changing=int(converted_money)), to_wallet.save()
        else:
            from_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=starting_currency)
            to_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=final_currency)
            from_wallet.balance -= amount
            received_money = 0.01 * (100 - conversion.conversion_percentage) * amount
            to_wallet.balance += round(Decimal(received_money), 2)
            from_wallet.save(), to_wallet.save()
        return conversion
    return client_potential

def create_new_transaction(account_uuid, amount, transaction_type, currency_type, ticker):
    account_id = get_user_id(account_uuid)
    amount = int(amount)
    asset = Assets.objects.filter(ticker=ticker)

    if not asset.exists():
        raise CustomException(f"there is no such assets like {ticker}")
    if asset[0].currency_type != currency_type:
        raise CustomException(f"asset with ticker {ticker} is sold in {asset[0].currency_type} currency, not in {currency_type}")
    if currency_type != "EUR":
        if not check_user_wallet(account_id, currency_type):
            raise CustomException(f"you need a wallet with '{currency_type}' to make this deal")

    asset_id = asset[0].id

    if transaction_type == "P": # purchase
        client_potential = check_client_potential_assets(user_id=account_id, amount=amount, currency_type=currency_type,
                                                         asset_id=asset_id)
        if isinstance(client_potential, int): # if user have enough money then it will return total cost
            transaction = InvestmentTransaction.objects.create(account_id=account_id, transaction_type=transaction_type,
                                                               currency_type=currency_type, amount=amount)
            UserTransaction.objects.create(user_id=account_id, securities_id=asset_id, transaction=transaction)

            user_assets = AccountAsset.objects.filter(account_id=account_id, asset_id=asset_id)
            if currency_type == "EUR":
                account = Account.objects.get(account_auth_info_id=account_id)
                account.balance -= client_potential
                account.save(account_action=AccountActions.ASSET_P, account_changing=-client_potential)
            else:
                account = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=currency_type)
                account.balance -= client_potential
                account.save()
            if user_assets.exists():
                user_assets = user_assets[0]
                user_assets.amount += amount
                user_assets.save()
            else:
                AccountAsset.objects.create(account_id=account_id, asset_id=asset_id, amount=amount)
            return transaction
        return client_potential
    elif transaction_type == "S": # sale
        transaction = InvestmentTransaction.objects.create(account_id=account_id, transaction_type=transaction_type,
                                                           currency_type=currency_type, amount=amount)
        UserTransaction.objects.create(user_id=account_id, securities_id=asset_id, transaction=transaction)
        user_assets = AccountAsset.objects.filter(account_id=account_id, asset_id=asset_id)

        if user_assets.exists():
            user_assets = user_assets[0]
            if user_assets.amount >= amount:
                asset_cost = int(Assets.objects.get(id=asset_id).cost)
                cost = amount * asset_cost
                if currency_type == "EUR":
                    account = Account.objects.get(account_auth_info_id=account_id)
                    account.balance += cost
                    account.save(account_action=AccountActions.ASSET_S, account_changing=cost)
                else:
                    account = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=currency_type)
                    account.balance += cost
                    account.save()
                user_assets.amount -= amount
                user_assets.save()
                return transaction
            raise CustomException("you need more assets to make this deal")
