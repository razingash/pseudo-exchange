import uuid

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, RateList


class AuthenticationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAuthInfo
        fields = ('username', 'pin', 'uuid')


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAuthInfo
        fields = ('username', 'password', 'pin', 'uuid')


class GameStartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('account_auth_info', 'complexity')


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('balance', 'status')



class TransferSerializer(serializers.Serializer):
    sender = serializers.ReadOnlyField(source='sender.account_auth_info.username')
    receiver = serializers.ReadOnlyField(source='receiver.account_auth_info.username')
    amount = serializers.FloatField(min_value=100)
    time_stamp = serializers.DateTimeField(read_only=True)

    #def validate_sender(self, value):
    #    if not Account.objects.filter(uuid=value).exists():
    #        raise ValidationError("Sender must be a valid Account UUID.")
    #    return value
#
    #def validate_receiver(self, value):
    #    if not Account.objects.filter(uuid=value).exists():
    #        raise ValidationError("Receiver must be a valid Account UUID.")
    #    return value


class CreditSerializer(serializers.Serializer):
    account = serializers.ReadOnlyField(source='account.account_auth_info.username')
    credit_type = serializers.ReadOnlyField(source='get_credit_type_display')
    credit_status = serializers.ReadOnlyField(source='get_credit_status_display')
    amount = serializers.ReadOnlyField()
    daily_debiting = serializers.ReadOnlyField()
    daily_growth = serializers.ReadOnlyField()
    to_pay = serializers.ReadOnlyField()

    #def validate_account(self, value):
    #    if not Account.objects.filter(uuid=value).exists():
    #        raise ValidationError("Receiver must be a valid Account UUID.")
    #    return value


class ConversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversion
        fields = ('amount', 'time_stamp', 'starting_currency', 'final_currency', 'conversion_percentage')

