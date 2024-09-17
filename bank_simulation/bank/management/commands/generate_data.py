import random
from django.core.management import BaseCommand

from bank.models import AccountAuthInfo, Credit, Currencies, Transfer, AccountActions, Assets, Account
from bank.services import create_new_transaction, create_conversion, create_new_wallet, check_client_potential, \
    CustomException
from bank.tasks import update_rates_price


class Command(BaseCommand): # 3
    help = "run this command once AFTER generating assets"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('generating data...'))
        users = []
        currencies = [currency.value for currency in Currencies if currency.value != "EUR"]
        update_rates_price()
        for i in range(50): # generating users with some additional wallets
            account = AccountAuthInfo.objects.create_user(username=f'djangobot{i}', password=f'djangobot{i}')
            user = Account.objects.get(account_auth_info=account)
            users.append(user)
            for currency in currencies:
                create_new_wallet(account_uuid=account.uuid, currency=currency)

        for user in users:
            account = user.account_auth_info
            for i in range(random.randint(1, 3)): # getting money(credits)
                if random.randint(1, 2) == 1:
                    credit_type = Credit.LoanType.CONSUMER_LOAN
                else:
                    credit_type = Credit.LoanType.BAIL_BOND
                Credit.objects.create(account=user, credit_type=credit_type)

            try:
                for i in range(100): # coversions
                    amount = random.randint(100, 1000)
                    if check_client_potential(user_id=account.id, amount=amount) is True:
                        final_currency = random.choice(currencies)
                        create_conversion(account_uuid=account.uuid, amount=amount, starting_currency="EUR",
                                          final_currency=final_currency)
                        user.refresh_from_db()
                    else:
                        break

                for i in range(100): # transfers
                    sender = user
                    amount = random.randint(100, 1000)
                    receiver = random.choice([obj for obj in users if obj != user])
                    client_potential = check_client_potential(user_id=account.id, amount=amount)
                    if client_potential is True:
                        Transfer.objects.create(sender_id=account.id, receiver_id=receiver.id, amount=amount)
                        sender.balance -= amount
                        receiver.balance += amount
                        sender.save(account_action=AccountActions.TRANSFERS_S, account_changing=-amount)
                        receiver.save(account_action=AccountActions.TRANSFERS_R, account_changing=amount)
                        user.refresh_from_db()
                    else:
                        break

                assets = Assets.objects.all()
                if assets:
                    for i in range(100): # buying assets
                        asset = random.choice(assets)
                        amount = random.randint(10, 100)
                        create_new_transaction(account_uuid=account.uuid, amount=amount, transaction_type='P',
                                               currency_type=Currencies.EUR, ticker=asset.ticker)
                        user.refresh_from_db()
            except CustomException:
                self.stdout.write(self.style.WARNING(f"User {account.username} runned out of money"))
                continue
            self.stdout.write(self.style.WARNING(f"User {account.username} completed setup"))
        self.stdout.write(self.style.SUCCESS('Succesfully') + ' generated data')
