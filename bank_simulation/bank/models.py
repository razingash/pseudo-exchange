import json
import os
from datetime import datetime
from uuid import uuid4

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, FileExtensionValidator, MinLengthValidator, MaxLengthValidator
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.signals import post_save
from django.dispatch import receiver


class TransactionTypes(models.TextChoices):
    PURCHASE = 'P', 'purchase'
    SALE = 'S', 'sale'

class Currencies(models.TextChoices):
    BYN = 'BYN', 'Belarusian ruble'
    CNY = 'CNY', 'Chinese Yuan'
    CZK = 'CZK', 'Czech koruna'
    EUR = 'EUR', 'euro'
    INR = 'INR', 'Indian Rupee'
    JPY = 'JPY', 'Japanese yen'
    KRW = 'KRW', 'South Korean won'
    PLN = 'PLN', 'Polish zloty'
    SEK = 'SEK', 'Swedish krona'
    USD = 'USD', 'U.S. dollar'


def validate_file_size(value):
    max_size = 1 * 512 * 512
    if value.size > max_size:
        raise ValidationError(f'Maximum file size mustn\'t exceed {max_size} bytes.')

def exchange_rates_upload(instance, filename):
    date = datetime.today()
    year, month, day = date.year, date.month, date.day
    filename = f'{day}.json'
    file_path = f'json_data/{year}/{month}/{filename}'
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
    if os.path.exists(full_path):
        os.remove(full_path)
    return file_path


class AccountAuthInfo(AbstractUser):
    uuid = models.UUIDField(primary_key=False, default=uuid4, editable=False, unique=True)
    pin = models.CharField(max_length=4, validators=[MinLengthValidator(4), MaxLengthValidator(4)])

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'dt_AccountAuthInfo'
        constraints = [
            UniqueConstraint(fields=['username'], name='unique_customuser_username')
        ]


class Account(models.Model):
    class UserStatusChoices(models.TextChoices):
        FREE = '0', 'Free'
        FINISHED = '1', 'finished'
        BANNED = '9', 'Banned'

    account_auth_info = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.DecimalField(default=150000, max_digits=16, decimal_places=2, blank=False, null=False)
    status = models.CharField(max_length=1, choices=UserStatusChoices.choices,
                              default=UserStatusChoices.FREE, verbose_name='account status')

    class Meta:
        db_table = 'dt_Account'

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_description(sender, instance, created, **kwargs):
    if created:
        Account.objects.create(account_auth_info=instance)


class ForeignCurrencyWallet(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    currency = models.CharField(choices=Currencies.choices, max_length=3, blank=False, null=False)
    balance = models.DecimalField(default=0, max_digits=16, decimal_places=2, blank=False, null=False)

    class Meta:
        db_table = 'dt_FC_Wallet'


class Credit(models.Model): # добавить списывание каждый день в зависимости от времени
    class LoanType(models.TextChoices):
        CONSUMER_LOAN = '1', 'consumer loan'
        BAIL_BOND = '2', 'loan on bail, bail bond'

    class LoanStatus(models.TextChoices):
        OPENED = '1', 'opened'
        CLOSED = '9', 'closed'

    uuid = models.UUIDField(primary_key=False, default=uuid4, editable=False, unique=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    credit_type = models.CharField(choices=LoanType.choices, max_length=1, blank=False, null=False)
    credit_status = models.CharField(choices=LoanStatus.choices, max_length=1, default=LoanStatus.OPENED, blank=False, null=False,)
    amount = models.PositiveSmallIntegerField(blank=False, null=False)
    daily_debiting = models.PositiveSmallIntegerField(blank=False, null=False)
    daily_growth = models.PositiveSmallIntegerField(blank=False, null=False)
    to_pay = models.PositiveSmallIntegerField(blank=False, null=False)
    paid_in_total = models.PositiveSmallIntegerField(blank=False, null=False, default=0)

    def clean(self):
        if self._state.adding:
            if self.credit_type == Credit.LoanType.CONSUMER_LOAN:
                self.amount = 100000
                self.to_pay = 100000
                self.daily_debiting = 10000
                self.daily_growth = 1000
                account = self.account
                account.balance += self.amount
                account.save()
            elif self.credit_type == Credit.LoanType.BAIL_BOND:
                self.amount = 200000
                self.to_pay = 200000
                self.daily_debiting = 10000
                self.daily_growth = 1000
                account = self.account
                account.balance += self.amount
                account.save()
            super().clean()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'dt_Credit'


class Transfer(models.Model):
    amount = models.FloatField(blank=False, null=False, validators=[MinValueValidator(100)])
    time_stamp = models.DateTimeField(auto_now_add=True, blank=False, null=False)
    sender = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='receiver')

    class Meta:
        db_table = 'dt_Transfer'


class Conversion(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=16, decimal_places=2, blank=False, null=False, validators=[MinValueValidator(10)])
    time_stamp = models.DateTimeField(auto_now_add=True, blank=False, null=False)
    starting_currency = models.CharField(max_length=3, choices=Currencies.choices, blank=False, null=False)
    final_currency = models.CharField(max_length=3, choices=Currencies.choices, blank=False, null=False)
    conversion_percentage = models.PositiveSmallIntegerField(blank=False, null=False, default=1)

    def clean(self):
        if self.starting_currency == self.final_currency:
            raise ValidationError("Starting currency and final currency cannot be the same.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'dt_Conversion'


class RateList(models.Model):
    measurement_date = models.DateField(auto_now_add=True, blank=False, null=False)
    data = models.FileField(validators=[validate_file_size, FileExtensionValidator(['json'])], blank=False,
                            null=False, upload_to=exchange_rates_upload)

    class Meta:
        db_table = 'dt_RateList'


class ConversionRate(models.Model):
    conversion = models.ForeignKey(Conversion, on_delete=models.CASCADE)
    exchange = models.ForeignKey(RateList, on_delete=models.CASCADE)

    class Meta:
        db_table = 'dt_ConversionRate'


class InvestmentTransaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.DO_NOTHING)
    transaction_type = models.CharField(max_length=1, choices=TransactionTypes.choices, blank=False, null=False)
    time_stamp = models.DateTimeField(auto_now_add=True, blank=False, null=False)
    amount = models.PositiveSmallIntegerField(blank=False, null=False, validators=[MinValueValidator(1)])
    currency_type = models.CharField(max_length=3, choices=Currencies.choices, blank=False, null=False)

    class Meta:
        db_table = 'dt_InvestmentTransaction'


class Assets(models.Model):
    ticker = models.CharField(max_length=6, blank=False, null=False)
    name = models.CharField(max_length=50, blank=False, null=False)
    cost = models.PositiveSmallIntegerField(default=100, blank=False, null=False)
    currency_type = models.CharField(choices=Currencies.choices, default=Currencies.USD, max_length=3,
                                     blank=False, null=False)
    dividends = models.PositiveSmallIntegerField(default=2, blank=False, null=False)
    measurement_date = models.DateTimeField(auto_now=True, blank=False, null=False)
    data = models.FilePathField(blank=True, null=True, path=os.path.join(settings.MEDIA_ROOT, 'assets'),
                                allow_files=True, match='.*\.json$')

    class Meta:
        db_table = 'dt_Assets'

@receiver(post_save, sender=Assets)
def create_json_template(sender, instance, created, **kwargs):
    json_path = os.path.join(
        settings.MEDIA_ROOT, 'assets', f"{instance.ticker}.json"
    )
    if created:
        json_schema = {
            "ticker": instance.ticker,
            "name": instance.name,
            "currency_type": instance.currency_type,
            "dividends": instance.dividends,
            "contents": []
        }

        with open(json_path, 'w') as json_file:
            json.dump(json_schema, json_file, indent=4)

        instance.data = json_path
        instance.save()
    else:
        with open(json_path, 'r') as json_file:
            json_data = json.load(json_file)

        json_data["contents"].append({
            "measurement_date": str(instance.measurement_date),
            "cost": instance.cost
        })

        with open(json_path, 'w') as json_file:
            json.dump(json_data, json_file, indent=4)

        if not instance.data:
            instance.data = json_path
            instance.save()


class UserTransaction(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    securities = models.ForeignKey(Assets, on_delete=models.CASCADE)
    transaction = models.ForeignKey(InvestmentTransaction, on_delete=models.CASCADE)

    class Meta:
        db_table = 'dt_UserTransaction'


class AccountAsset(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    asset = models.ForeignKey(Assets, on_delete=models.DO_NOTHING)
    amount = models.PositiveSmallIntegerField(blank=False, null=False)

    class Meta:
        db_table = 'dt_AccountAsset'
