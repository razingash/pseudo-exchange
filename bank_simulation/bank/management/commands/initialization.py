from django.core.management import BaseCommand, call_command
from bank.tasks import update_valuable_metals_price

class Command(BaseCommand):
    help = "run this command only once!"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Initialization...'))

        call_command('makemigrations')
        call_command('migrate')
        call_command('generate_assets')
        call_command('update_assets')
        call_command('generate_data')

        update_valuable_metals_price()

        self.stdout.write(self.style.SUCCESS('Initialization completed'))
