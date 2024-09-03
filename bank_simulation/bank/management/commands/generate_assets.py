from django.core.management import BaseCommand
from bank.models import Assets


class Command(BaseCommand):
    help = "run this command once to generate basic assets"

    def handle(self, *args, **options):
        assets = [
            {"ticker": "TBAM", "name": "Mithril"},
            {"ticker": "TBAA", "name": "Adamantium"},
            {"ticker": "TBAO", "name": "Orichalcum"},
            {"ticker": "TBTA", "name": "Towing Alliance"},
            {"ticker": "TBAEC", "name": "Alpha Electric"},
            {"ticker": "TBAES", "name": "Alto Elevators"},
            {"ticker": "TBASG", "name": "Army Surplus General"},
            {"ticker": "TBBMP", "name": "Blue Mountain Pioneering"},
            {"ticker": "TBBLU", "name": "Builders League United"},
            {"ticker": "TBBBC", "name": "BLU Blast Complex"},
            {"ticker": "TBCR", "name": "Cerveza Royale"},
            {"ticker": "TBCDG", "name": "Chaps Dry Goods"},
            {"ticker": "TBEET", "name": "Elliphany Electric Trains"},
            {"ticker": "TBFAT", "name": "Freeman Airboat Tours"},
            {"ticker": "TBMC", "name": "Mann Co."}
        ]

        for asset in assets:
            Assets.objects.create(ticker=asset.get("ticker"), name=asset.get("name"))
        self.stdout.write(self.style.SUCCESS('Succesfully') + ' created basic assets')
