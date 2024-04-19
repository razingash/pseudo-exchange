import json

from django.contrib.auth import authenticate
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from bank.models import Account, AccountAuthInfo, Credit

from bank.serializers import AccountSerializer, AuthenticationSerializer, RegistrationSerializer, GameStartSerializer, \
    TransferSerializer, CreditSerializer
from bank.services import get_account_info, get_user_transfers, \
    create_new_transfer, get_current_credit, create_new_credit, update_pay_credit_early, get_fresh_rates

# Create your views here.
"""
сделать чтобы при посылке запросов было два словаря:
1) uuid с uuid
2) core с остальным
"""
#class AccountApiView(generics.ListAPIView):
#    queryset = Account.objects.all()
#    serializer_class = AccountSerializer

class AccountRegisterApiView(APIView): # account_auth_info
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_account = AccountAuthInfo.objects.create_user(
            username=request.data.get('username'),
            password=request.data.get('password'),
            pin=request.data.get('pin')
        )
        return Response({'post': RegistrationSerializer(new_account).data})

class AccountAuthApiView(APIView): # broken... # account_auth_info
    def post(self, request):
        username = request.data.get('username')
        pin = request.data.get('pin')
        user = authenticate(username=username, pin=pin)
        print(user)
        if user is not None:
            return Response({'user': AuthenticationSerializer(user).data})
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class AccountApiView(APIView): # account | ready
    def get(self, request): # get current account info
        account_uuid = request.data.get('uuid')
        if not account_uuid:
            return Response({"error": "'uuid' is required"}, status=400)
        try:
            account = get_account_info(account_uuid)
        except Account.DoesNotExist:
            return Response({"error": "Account not found"}, status=404)
        return Response({'accounts': AccountSerializer(account, many=False).data})


class TransferApi(APIView): # ready
    def get(self, request): # user transfers
        account_uuid = request.data.get('uuid')
        if not account_uuid:
            return Response({"error": "'uuid' is required"}, status=400)
        transfers = get_user_transfers(account_uuid)
        return Response({'transfers': TransferSerializer(transfers, many=True).data})

    def post(self, request):
        data = request.data.get('core')[0]
        serializer = TransferSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        transfer = create_new_transfer(sender_uuid=data['sender'], receiver_uuid=data['receiver'], amount=data['amount'])

        return Response({'transfer': TransferSerializer(transfer, many=False).data})


class CreditApi(APIView): # CreditSerializer
    def get(self, request): # get current credit
        account_uuid = request.data.get('uuid')
        if not account_uuid:
            return Response({"error": "'uuid' is required"}, status=400)
        try:
            credit = get_current_credit(account_uuid)
        except Credit.DoesNotExist:
            return Response({"error": "Credit not found"}, status=404)
        return Response({'credit': CreditSerializer(credit, many=False).data})

    def post(self, request): # take new credit
        data = request.data.get('core')[0]
        account_uuid = request.data.get('uuid')
        if not account_uuid:
            return Response({"error": "'uuid' is required"}, status=400)

        serializer = CreditSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        new_credit = create_new_credit(sender_uuid=account_uuid, credit_type=data['credit_type'])

        return Response({'post': CreditSerializer(new_credit, many=False).data})

    def patch(self, request): # pay for the credit early | ready
        account_uuid = request.data.get('uuid')
        if not account_uuid:
            return Response({"error": "'uuid' is required"}, status=400)
        data = request.data.get('core')[0]
        try:
            money_for_repayment = data['money']
        except KeyError:
            return Response({"error": "'money' is required"}, status=400)
        try:
            credit_id = data['credit_id']
        except KeyError:
            return Response({"error": "'credit' is required"}, status=400)

        serializer = CreditSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        credit = update_pay_credit_early(sender_uuid=account_uuid, money_for_repayment=money_for_repayment,
                                         credit_id=credit_id)

        return Response({'patch': CreditSerializer(credit, many=False).data})


class CurrentRatesApi(APIView):
    def get(self, request):
        rates = get_fresh_rates()
        with open(rates, 'r') as json_file:
            json_data = json.load(json_file)
        return Response({'current rates': json_data})


class ConversionApi(APIView):
    def get(self, request): # get conversions
        account_uuid = request.data.get('uuid')
        if not account_uuid:
            return Response({"error": "'uuid' is required"}, status=400)
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        data = data[0]


