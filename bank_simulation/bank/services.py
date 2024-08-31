import json
from decimal import Decimal

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from rest_framework.response import Response
from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, RateList, ForeignCurrencyWallet, \
    ConversionRate, InvestmentTransaction, AccountAsset, Assets, UserTransaction, ValuableMetalsList, Metals


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
        user_id = AccountAuthInfo.objects.only('id').get(uuid=account_uuid).pk
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
    if currency_type == "USD":
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

def get_objects_by_uuid(model, account_uuid):
    account_id = get_user_id(account_uuid=account_uuid)
    obj = model.objects.filter(account_id=account_id)
    return obj

def get_account_info(account_uuid):
    account_id = get_user_id(account_uuid)
    account = Account.objects.get(account_auth_info_id=account_id)
    return account

def get_user_transfers(account_uuid):
    account_id = get_user_id(account_uuid)
    transfers = Transfer.objects.filter(Q(sender_id=account_id) | Q(receiver_id=account_id))
    return transfers

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


def update_pay_credit_early(sender_uuid, money_for_repayment, credit_id):
    sender_id = get_user_id(sender_uuid)
    client_potential = check_client_potential(user_id=sender_id, amount=money_for_repayment)
    if client_potential:
        try:
            credit = Credit.objects.get(account_id=sender_id, id=credit_id)
        except ObjectDoesNotExist:
            raise CustomException("credit wasn't found")
        account = Account.objects.get(account_auth_info_id=sender_id)
        money_for_repayment = int(money_for_repayment)
        if account.balance >= money_for_repayment:
            if money_for_repayment < credit.to_pay:
                account.balance -= money_for_repayment
                credit.to_pay -= money_for_repayment
                credit.paid_in_total += money_for_repayment
                account.save(), credit.save()
            elif money_for_repayment >= credit.to_pay:
                account.balance -= credit.to_pay
                credit.credit_status = Credit.LoanStatus.CLOSED
                credit.paid_in_total += credit.to_pay
                credit.to_pay = 0
                account.save(), credit.save()
            return credit
    else:
        return client_potential


def create_new_wallet(account_uuid, currency):
    if currency == 'USD':
        raise CustomException("you already have a wallet with this currency by default")
    account_id = get_user_id(account_uuid)
    if check_user_wallet(account_id, currency):
        raise CustomException(f"you already have a wallet with {currency} currency")
    new_wallet = ForeignCurrencyWallet.objects.create(account_id=account_id, currency=currency)
    return new_wallet


def create_conversion(account_uuid, amount, starting_currency, final_currency):
    account_id = get_user_id(account_uuid)
    amount = int(amount)
    rate = RateList.objects.only('id').latest('timestamp').id
    if starting_currency != "USD":
        if not check_user_wallet(account_id, starting_currency):
            raise CustomException(f"you don't have a wallet with s {starting_currency} currency")
    if final_currency != "USD":
        if not check_user_wallet(account_id, final_currency):
            raise CustomException(f"you don't have a wallet with f {final_currency} currency")
    client_potential = check_client_potential(user_id=account_id, amount=amount)
    if client_potential:
        conversion = Conversion.objects.create(account_id=account_id, amount=amount,
                                               starting_currency=starting_currency, final_currency=final_currency)
        ConversionRate.objects.create(exchange_id=rate, conversion=conversion)
        if starting_currency == "USD":
            from_wallet = Account.objects.get(account_auth_info_id=account_id)
            to_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=final_currency)
            from_wallet.balance -= amount
            received_money = 0.01 * (100 - conversion.conversion_percentage) * amount
            to_wallet.balance += round(Decimal(received_money), 2)
            from_wallet.save(), to_wallet.save()
        elif final_currency == "USD":
            from_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=starting_currency)
            to_wallet = Account.objects.get(account_auth_info_id=account_id)
            from_wallet.balance -= amount
            received_money = 0.01 * (100 - conversion.conversion_percentage) * amount
            to_wallet.balance += round(Decimal(received_money), 2)
            from_wallet.save(), to_wallet.save()
        else:
            from_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=starting_currency)
            to_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=final_currency)
            from_wallet.balance -= amount
            received_money = 0.01 * (100 - conversion.conversion_percentage) * amount
            to_wallet.balance += round(Decimal(received_money), 2)
            from_wallet.save(), to_wallet.save()
        return conversion
    return client_potential

def create_new_transaction(account_uuid, amount, transaction_type, currency_type, asset_id):
    account_id = get_user_id(account_uuid)
    amount = int(amount)
    asset = Assets.objects.filter(id=asset_id)

    if not asset.exists():
        raise CustomException(f"there is no such assets like {asset_id}")
    if asset[0].currency_type != currency_type:
        raise CustomException(f"asset with id {asset_id} is sold in {asset[0].currency_type} currency, not in {currency_type}")
    if currency_type != "USD":
        if not check_user_wallet(account_id, currency_type):
            raise CustomException(f"you need a wallet with '{currency_type}' to make this deal")

    if transaction_type == "P": # purchase
        client_potential = check_client_potential_assets(user_id=account_id, amount=amount, currency_type=currency_type,
                                                         asset_id=asset_id)
        if isinstance(client_potential, int): # if user have enough money then it will return total cost
            transaction = InvestmentTransaction.objects.create(account_id=account_id, transaction_type=transaction_type,
                                                               currency_type=currency_type, amount=amount)
            UserTransaction.objects.create(user_id=account_id, securities_id=asset_id, transaction=transaction)

            user_assets = AccountAsset.objects.filter(account_id=account_id, asset_id=asset_id)
            if currency_type == "USD":
                account = Account.objects.get(account_auth_info_id=account_id)
                account.balance -= client_potential
                account.save()
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
                if currency_type == "USD":
                    account = Account.objects.get(account_auth_info_id=account_id)
                    account.balance += cost
                    account.save()
                else:
                    account = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=currency_type)
                    account.balance += cost
                    account.save()
                user_assets.amount -= amount
                user_assets.save()
                return transaction
            raise CustomException("you need more assets to make this deal")
