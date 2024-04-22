from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, RateList, ForeignCurrencyWallet, \
    ConversionRate


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

def check_user_wallet(user_id, currency):
    if ForeignCurrencyWallet.objects.filter(currency=currency).exists():
        return True
    return False

def get_account_info(account_uuid):
    account_id = get_user_id(account_uuid)
    account = Account.objects.get(id=account_id)
    return account

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

def get_user_conversions(account_uuid):
    account_id = get_user_id(account_uuid)
    conversions = Conversion.objects.filter(account_id=account_id)
    return conversions


def update_pay_credit_early(sender_uuid, money_for_repayment, credit_id): # ready
    sender_id = get_user_id(sender_uuid)
    client_potential = check_client_potential(user_id=sender_id, amount=money_for_repayment)
    if client_potential:
        try:
            credit = Credit.objects.get(account_id=sender_id, id=credit_id)
        except ObjectDoesNotExist:
            raise IndexError
        account = Account.objects.get(id=sender_id)
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
            from_wallet = Account.objects.get(id=account_id)
            to_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=final_currency)
            from_wallet.balance -= amount
            to_wallet.balance += amount
            from_wallet.save(), to_wallet.save()
        elif final_currency == "USD":
            from_wallet = ForeignCurrencyWallet.objects.get(account_id=account_id, currency=starting_currency)
            to_wallet = Account.objects.get(id=account_id)
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

