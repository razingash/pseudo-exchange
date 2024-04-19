from django.db.models import Q, F

from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, RateList


def get_user_uuid(account_id):
    user_uuid = str(AccountAuthInfo.objects.only('uuid').get(id=account_id).uuid) #mb str убрать
    return user_uuid

def get_user_id(account_uuid):
    user_id = AccountAuthInfo.objects.only('id').get(uuid=account_uuid).pk
    return user_id


def check_client_potential(user_id, amount):
    client_balance = int(Account.objects.only('balance').get(id=user_id).balance)
    if client_balance >= int(amount):
        return True
    else:
        return False


def get_account_info(account_uuid):
    account_id = get_user_id(account_uuid)
    account = Account.objects.get(id=account_id)
    return account


def get_user_transfers(account_uuid):
    account_id = get_user_id(account_uuid)
    transfers = Transfer.objects.filter(Q(sender_id=account_id) | Q(receiver_id=account_id))
    return transfers


def get_current_credit(account_uuid):
    account_id = get_user_id(account_uuid)
    credit = Credit.objects.get(account_id=account_id) #
    return credit


def get_fresh_rates():
    rates = RateList.objects.latest('measurement_date').data.path
    return rates

def get_user_conversions(account_uuid):
    account_id = get_user_id(account_uuid)
    conversions = Conversion.objects.filter(account_id=account_id)







def update_pay_credit_early(sender_uuid, money_for_repayment, credit_id): # ready
    sender_id = get_user_id(sender_uuid)
    if check_client_potential(user_id=sender_id, amount=money_for_repayment):
        credit = Credit.objects.get(account_id=sender_id, id=credit_id)
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
        return False





def create_new_credit(sender_uuid, credit_type):
    sender_id = get_user_id(sender_uuid)
    new_credit = Credit.objects.create(account_id=sender_id, credit_type=credit_type) #
    return new_credit


def create_new_transfer(sender_uuid, receiver_uuid, amount):
    sender_id = get_user_id(sender_uuid)
    receiver_id = get_user_id(receiver_uuid)
    amount = int(amount)
    if check_client_potential(user_id=sender_id, amount=amount):
        transfer = Transfer.objects.create(sender_id=sender_id, receiver_id=receiver_id, amount=amount)
        sender = Account.objects.get(id=sender_id)
        receiver = Account.objects.get(id=receiver_id)
        sender.balance -= amount
        receiver.balance += amount
        sender.save(), receiver.save()

        return transfer
    else:
        return False

