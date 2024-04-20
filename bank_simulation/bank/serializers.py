import uuid

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, RateList, ForeignCurrencyWallet


class AuthenticationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAuthInfo
        fields = ('username', 'pin', 'uuid')


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAuthInfo
        fields = ('username', 'password', 'pin', 'uuid')


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

    def validate(self, data):
        print(data)
        sender = data['sender']
        receiver = data['receiver']

        if not sender and not receiver:
            raise serializers.ValidationError("'sender' and 'receiver' with uuid is required.")
        if not sender:
            raise serializers.ValidationError("'sender' with uuid is required.")
        if not receiver:
            raise serializers.ValidationError("'receiver' with uuid is required.")

        return data


class CreditSerializer(serializers.Serializer): # добавить отдельный uuid для кредита
    id = serializers.IntegerField(read_only=True)
    account = serializers.CharField(source='account.account_auth_info.username')
    credit_type = serializers.CharField(source='get_credit_type_display')
    credit_status = serializers.ReadOnlyField(source='get_credit_status_display')
    amount = serializers.ReadOnlyField()
    daily_debiting = serializers.ReadOnlyField()
    daily_growth = serializers.ReadOnlyField()
    to_pay = serializers.ReadOnlyField()

    #def validate_account(self, value):
    #    if not Account.objects.filter(uuid=value).exists():
    #        raise ValidationError("Receiver must be a valid Account UUID.")
    #    return value


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
