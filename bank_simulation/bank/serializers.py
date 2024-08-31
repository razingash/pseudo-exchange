import uuid

from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from rest_framework import serializers

from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, ForeignCurrencyWallet, \
    AccountAsset, Assets, Currencies, TransactionTypes
from bank.services import get_user_id, check_client_potential


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value, self.instance)
        return value

    def validate_username(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("username field must contain at least 5 symbols")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    class Meta:
        model = AccountAuthInfo
        fields = ('username', 'password', 'uuid')


class GetUuidSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAuthInfo
        fields = ('uuid', )

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('balance', 'status')


class ForeignCurrencyWalletsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForeignCurrencyWallet
        fields = ('currency', 'balance')

class ForeignCurrencyWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForeignCurrencyWallet
        fields = ('currency', )


class TransferSerializer(serializers.Serializer):
    sender = serializers.CharField(source='sender.account_auth_info.username')
    receiver = serializers.CharField(source='receiver.account_auth_info.username')
    amount = serializers.FloatField(min_value=100)
    time_stamp = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        sender_id = get_user_id(validated_data['sender']['account_auth_info']['username'])
        receiver_id = get_user_id(validated_data['receiver']['account_auth_info']['username'])
        amount = int(validated_data['amount'])
        client_potential = check_client_potential(user_id=sender_id, amount=amount)
        if client_potential:
            transfer = Transfer.objects.create(sender_id=sender_id, receiver_id=receiver_id, amount=amount)
            sender = Account.objects.get(id=sender_id)
            receiver = Account.objects.get(id=receiver_id)
            sender.balance -= amount
            receiver.balance += amount
            sender.save(), receiver.save()

            return transfer
        else:
            return client_potential

    def validate(self, data):
        sender = data['sender']
        receiver = data['receiver']

        if not sender and not receiver:
            raise serializers.ValidationError("'sender' and 'receiver' with uuid is required.")
        if not sender:
            raise serializers.ValidationError("'sender' with uuid is required.")
        if not receiver:
            raise serializers.ValidationError("'receiver' with uuid is required.")
        if sender == receiver:
            raise serializers.ValidationError("ClownError: check both sender and receiver")

        return data


class CreditSerializer(serializers.Serializer): # добавить отдельный uuid для кредита
    id = serializers.IntegerField(read_only=True)
    account = serializers.CharField(source='account.account_auth_info.username')
    credit_type = serializers.CharField(source='get_credit_type_display', read_only=False, max_length=1)
    credit_status = serializers.ReadOnlyField(source='get_credit_status_display')
    amount = serializers.IntegerField(read_only=False)
    daily_debiting = serializers.ReadOnlyField()
    daily_growth = serializers.ReadOnlyField()
    to_pay = serializers.ReadOnlyField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'context' in kwargs:
            if 'method' in kwargs['context']:
                if kwargs['context']['method'] == 'POST':
                    self.fields['amount'].read_only = True
                if kwargs['context']['method'] == 'PATCH':
                    self.fields['credit_type'].read_only = True

    def create(self, validated_data):
        sender_uuid = validated_data['account']['account_auth_info']['username']
        credit_type = validated_data['get_credit_type_display']
        try:
            uuid.UUID(sender_uuid, version=4)
        except ValueError:
            raise serializers.ValidationError("invalid uuid")
        sender_id = get_user_id(sender_uuid)
        try:
            new_credit = Credit.objects.create(account_id=sender_id, credit_type=credit_type)
        except IntegrityError:
            raise serializers.ValidationError(f"there is no such credit type like {credit_type}")
        return new_credit


class ConversionGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversion
        fields = ('amount', 'time_stamp', 'starting_currency', 'final_currency', 'conversion_percentage')

class ConversionSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if attrs['starting_currency'] == attrs['final_currency']:
            raise serializers.ValidationError("Starting currency and final currency cannot be the same.")
        return attrs

    class Meta:
        model = Conversion
        fields = ('amount', 'starting_currency', 'final_currency')


class AccountTransactionsSerializer(serializers.Serializer):
    account = serializers.CharField(source='account.account_auth_info.username', read_only=True)
    transaction_type = serializers.CharField(source='get_transaction_type_display', max_length=1)
    currency_type = serializers.CharField(source='get_currency_type_display')
    time_stamp = serializers.DateTimeField(read_only=True)
    amount = serializers.IntegerField(read_only=False)

    def validate_transaction_type(self, value):
        allowed_choices = [choice.value for choice in TransactionTypes]

        if value not in allowed_choices:
            raise serializers.ValidationError(f"invalid transaction type: {value}")

        return value

    def validate_currency_type(self, value):
        allowed_choices = [choice.value for choice in Currencies]

        if value not in allowed_choices:
            raise serializers.ValidationError(f"invalid currency type: {value}")

        return value

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'context' in kwargs:
            if 'method' in kwargs['context']:
                if kwargs['context']['method'] == 'GET':
                    self.fields['amount'].read_only = True


class AccountAssetsSerializer(serializers.ModelSerializer):
    account = serializers.CharField(source='account.account_auth_info.username')
    asset = serializers.CharField(source='asset.ticker')

    class Meta:
        model = AccountAsset
        fields = ("account", 'asset', 'amount')


class AssetsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assets
        fields = ('ticker', 'name', 'cost', 'currency_type', 'dividends', 'timestamp')
