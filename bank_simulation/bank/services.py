import json

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from rest_framework.response import Response
from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, RateList, ForeignCurrencyWallet, \
    ConversionRate, InvestmentTransaction, AccountAsset, Assets, UserTransaction
from rest_framework.authtoken.models import Token

def object_does_not_exist(func: callable):
    def wrapper(request, *args, **kwargs):
        try:
            return func(request, *args, **kwargs)
        except ObjectDoesNotExist:
            return Response({"error": "Account not found"}, status=404)
    return wrapper

def value_error_not_enough_money(func: callable):
    def wrapper(request, *args, **kwargs):
        try:
            return func(request, *args, **kwargs)
        except ValueError:
            return Response({"error": "you don't have enough money"}, status=404)
    return wrapper

def index_error_credit_was_not_found(func: callable): # IndexError in reality is ObjectDoesNotExist if you check the code
    def wrapper(request, *args, **kwargs):
        try:
            return func(request, *args, **kwargs)
        except IndexError:
            return Response({"error": "credit wasn't found"}, status=404)
    return wrapper


def get_user_id(account_uuid):
    try:
        user_id = AccountAuthInfo.objects.only('id').get(uuid=account_uuid).pk
    except Account.DoesNotExist:
        raise ObjectDoesNotExist
    return user_id

def check_client_potential(user_id, amount):
    client_balance = int(Account.objects.only('balance').get(id=user_id).balance)
    if client_balance >= int(amount):
        return True
    else:
        raise ValueError

def check_client_potential_assets(user_id, amount, currency_type, asset_id):
    asset = Assets.objects.get(id=asset_id)
    cost = int(amount) * asset.cost
    if currency_type == "USD":
        client_balance = int(Account.objects.only('balance').get(id=user_id).balance)
        if client_balance >= cost:
            return cost
        else:
            raise ValueError
    else:
        if ForeignCurrencyWallet.objects.filter(account_id=user_id, currency=currency_type).exists():
            client_balance = int(ForeignCurrencyWallet.objects.get(account_id=user_id, currency=currency_type))
            if client_balance >= cost:
                return cost
            else:
                raise ValueError
        else:
            raise KeyError

def check_user_wallet(user_id, currency):
    if ForeignCurrencyWallet.objects.filter(currency=currency, account_id=user_id).exists():
        return True
    return False

def get_account_info(account_uuid):
    account_id = get_user_id(account_uuid)
    account = Account.objects.get(account_auth_info_id=account_id)
    return account

def get_user_uuid(key):
    try:
        user_id = Token.objects.only('user_id').get(key=key).user_id
        user_uuid = AccountAuthInfo.objects.only('uuid').get(id=user_id)
    except Token.DoesNotExist:
        raise ObjectDoesNotExist
    return user_uuid

def get_additional_wallets(account_uuid):
    account_id = get_user_id(account_uuid=account_uuid)
    wallets = ForeignCurrencyWallet.objects.filter(account_id=account_id)
    return wallets

def get_user_transfers(account_uuid):
    account_id = get_user_id(account_uuid)
    transfers = Transfer.objects.filter(Q(sender_id=account_id) | Q(receiver_id=account_id))
    return transfers


def get_current_credit(account_uuid):
    account_id = get_user_id(account_uuid)
    credit = Credit.objects.filter(account_id=account_id) #
    return credit


def get_fresh_rates():
    rates = RateList.objects.latest('measurement_date').data.path
    return rates

def get_assets():
    assets_list = Assets.objects.all()
    return assets_list

def get_user_conversions(account_uuid):
    account_id = get_user_id(account_uuid)
    conversions = Conversion.objects.filter(account_id=account_id)
    return conversions


def get_user_transaction(account_uuid):
    account_id = get_user_id(account_uuid)
    transactions = InvestmentTransaction.objects.filter(account_id=account_id)
    return transactions

def get_user_assets(account_uuid):
    account_id = get_user_id(account_uuid)
    assets = AccountAsset.objects.filter(account_id=account_id)
    return assets

def get_asset_story(asset_id):
    try:
        asset_path = Assets.objects.get(id=asset_id).data
    except ObjectDoesNotExist:
        return False
    else:
        with open(asset_path, 'r') as json_file:
            json_data = json.load(json_file)
        return json_data

def update_pay_credit_early(sender_uuid, money_for_repayment, credit_id): # ready
    sender_id = get_user_id(sender_uuid)
    client_potential = check_client_potential(user_id=sender_id, amount=money_for_repayment)
    if client_potential:
        try:
            credit = Credit.objects.get(account_id=sender_id, id=credit_id)
        except ObjectDoesNotExist:
            raise IndexError
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
    account_id = get_user_id(account_uuid)
    if check_user_wallet(account_id, currency):
        return False
    new_wallet = ForeignCurrencyWallet.objects.create(account_id=account_id, currency=currency)
    return new_wallet


def create_conversion(account_uuid, amount, starting_currency, final_currency):
    account_id = get_user_id(account_uuid)
    amount = int(amount)
    rate = RateList.objects.only('id').latest('measurement_date').id
    if starting_currency != "USD":
        if not check_user_wallet(account_id, starting_currency):
            return True
    if final_currency != "USD":
        if not check_user_wallet(account_id, final_currency):
            return False
    client_potential = check_client_potential(user_id=account_id, amount=amount)
    if client_potential:
        conversion = Conversion.objects.create(account_id=account_id, amount=amount,
                                               starting_currency=starting_currency, final_currency=final_currency)
        ConversionRate.objects.create(exchange_id=rate, conversion=conversion)
        if starting_currency == "USD":
            from_wallet = Account.objects.get(account_auth_info_id=account_id)
            to_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=final_currency)
            from_wallet.balance -= amount
            to_wallet.balance += amount
            from_wallet.save(), to_wallet.save()
        elif final_currency == "USD":
            from_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=starting_currency)
            to_wallet = Account.objects.get(account_auth_info_id=account_id)
            from_wallet.balance -= amount
            to_wallet.balance += amount
            from_wallet.save(), to_wallet.save()
        else:
            from_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=starting_currency)
            to_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=final_currency)
            from_wallet.balance -= amount
            to_wallet.balance += amount
            from_wallet.save(), to_wallet.save()
        return conversion
    return client_potential

def create_new_transaction(account_uuid, amount, transaction_type, currency_type, asset_id):
    account_id = get_user_id(account_uuid)
    amount = int(amount)
    if not Assets.objects.filter(id=asset_id).exists():
        return False
    if currency_type != "USD":
        if not check_user_wallet(account_id, currency_type):
            return True
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
            raise ArithmeticError
