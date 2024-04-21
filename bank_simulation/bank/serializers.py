import uuid

from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from bank.models import Account, AccountAuthInfo, Transfer, Credit, Conversion, ForeignCurrencyWallet
from bank.services import get_user_id, check_client_potential


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

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
    credit_type = serializers.CharField(source='get_credit_type_display')
    credit_status = serializers.ReadOnlyField(source='get_credit_status_display')
    amount = serializers.IntegerField()
    daily_debiting = serializers.ReadOnlyField()
    daily_growth = serializers.ReadOnlyField()
    to_pay = serializers.ReadOnlyField()

    def create(self, validated_data):
        sender_uuid = validated_data['account']['account_auth_info']['username']
        credit_type = validated_data['get_credit_type_display']
        try:
            uuid.UUID(sender_uuid, version=4)
        except ValueError:
            raise ObjectDoesNotExist
        sender_id = get_user_id(sender_uuid)
        new_credit = Credit.objects.create(account_id=sender_id, credit_type=credit_type)
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
