from django.core.management import BaseCommand

from bank.tasks import update_assets_price


class Command(BaseCommand): # 2
    help = "updates existing assets --n number of times"

    def add_arguments(self, parser):
        parser.add_argument('--amount', type=int, help="amount of the updates")

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('updating assets...'))
        amount = options['amount']

        if not amount:
            for i in range(100): # I reccomend this method
                update_assets_price()
            self.stdout.write(self.style.SUCCESS('Successfully') + ' assets updated 100 times')
            return
        else:
            for i in range(amount):
                update_assets_price()
            self.stdout.write(self.style.SUCCESS('Successfully') + f' assets updated {amount} times')
            return
