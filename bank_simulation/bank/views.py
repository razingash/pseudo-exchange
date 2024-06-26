from json import load

from django.db import transaction
from django.http import JsonResponse
from rest_framework.authentication import get_authorization_header
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bank.permissions import IsUuidProvided

from bank.serializers import AccountSerializer, TransferSerializer, CreditSerializer, ConversionSerializer, \
    ConversionGetSerializer, ForeignCurrencyWalletSerializer, ForeignCurrencyWalletsSerializer, GetUuidSerializer, \
    AccountTransactionsSerializer, AccountAssetsSerializer, AssetsListSerializer
from bank.services import get_user_transfers, get_current_credit, update_pay_credit_early, get_fresh_rates, \
    get_user_conversions, create_conversion, get_additional_wallets, create_new_wallet, get_account_info, \
    get_user_uuid, get_user_transaction, get_user_assets, create_new_transaction, get_assets, get_asset_story, \
    custom_exception


class AccountApiView(APIView): # account
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request):  # get current account info
        account_uuid = request.data.get('uuid')
        account = get_account_info(account_uuid)
        return Response({'accounts': AccountSerializer(account, many=False).data})


class GetUserUuidApi(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request):  # get current account uuid
        key = get_authorization_header(request).decode('utf-8').split()[1]
        uuid = get_user_uuid(key)
        return Response(GetUuidSerializer(uuid, many=False).data)


class ForeignCurrencyWalletApi(APIView): #
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request): # get another wallets
        account_uuid = request.data.get('uuid')
        account = get_additional_wallets(account_uuid)
        return Response({'accounts': ForeignCurrencyWalletsSerializer(account, many=True).data})

    @custom_exception
    def post(self, request): # create another wallet
        account_uuid = request.data.get('uuid')
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        data = data[0]
        serializer = ForeignCurrencyWalletSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        fc_wallet = create_new_wallet(account_uuid=account_uuid, currency=data['currency'])

        return Response({'transfer': ForeignCurrencyWalletSerializer(fc_wallet, many=False).data})


class CurrentRatesApi(APIView):
    permission_classes = (IsAuthenticated, IsUuidProvided)

    def get(self, request):
        rates = get_fresh_rates()
        with open(rates, 'r') as json_file:
            json_data = load(json_file)
        return Response({'current rates': json_data})


class TransferApi(APIView): # ready
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request): # user transfers
        account_uuid = request.data.get('uuid')
        transfers = get_user_transfers(account_uuid)
        return Response({'transfers': TransferSerializer(transfers, many=True).data})

    @custom_exception
    def post(self, request):
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        data = data[0]
        if data['sender'] != request.data.get('uuid'):
            return Response({"error": "sender uuid isn't equal to receiver"}, status=400)

        serializer = TransferSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({'transfer': serializer.data})


class CreditApi(APIView):
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request): # get current credit
        account_uuid = request.data.get('uuid')
        credit = get_current_credit(account_uuid)
        return Response({'credits': CreditSerializer(credit, many=True).data})

    @custom_exception
    def post(self, request): # take new credit
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        if data[0]['account'] != request.data.get('uuid'):
            return Response({"error": "sender uuid isn't equal to receiver"}, status=400)

        serializer = CreditSerializer(data=data[0], context={'method': 'POST'})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({'new credit': serializer.data})

    @custom_exception
    def patch(self, request): # pay for the credit early
        account_uuid = request.data.get('uuid')
        data = request.data.get('core')[0]
        if data['account'] != account_uuid:
            return Response({"error": "sender uuid isn't equal to receiver"}, status=400)

        serializer = CreditSerializer(data=data, context={'method': 'PATCH'})
        serializer.is_valid(raise_exception=True)

        money_for_repayment = data['amount']
        credit_id = data['credit_id']

        credit = update_pay_credit_early(sender_uuid=account_uuid, money_for_repayment=money_for_repayment,
                                         credit_id=credit_id)

        return Response({'updated credit': CreditSerializer(credit, many=False).data})


class ConversionApi(APIView):
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request): # get conversions
        account_uuid = request.data.get('uuid')
        conversion = get_user_conversions(account_uuid)
        return Response({'conversions': ConversionGetSerializer(conversion, many=True).data})

    @transaction.atomic
    @custom_exception
    def post(self, request): # convert currency
        account_uuid = request.data.get('uuid')
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        data = data[0]

        serializer = ConversionSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        amount = data['amount']
        starting_currency = data['starting_currency']
        final_currency = data['final_currency']

        conversion = create_conversion(account_uuid=account_uuid, amount=amount, starting_currency=starting_currency,
                                       final_currency=final_currency)

        return Response({'conversion': ConversionSerializer(conversion, many=False).data})


class AssetsListApiView(APIView): # ready
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request):
        user_assets = get_assets()
        return Response({'assets': AssetsListSerializer(user_assets, many=True).data})


class TransactionsApi(APIView):
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request):
        account_uuid = request.data.get('uuid')
        transactions = get_user_transaction(account_uuid)
        return Response({'transactions': AccountTransactionsSerializer(transactions, many=True).data})

    @transaction.atomic
    @custom_exception
    def post(self, request): # buy assets
        account_uuid = request.data.get('uuid')
        data = request.data.get('core')
        asset_id = request.data.get('asset_id')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        if not asset_id:
            return Response({"error": "'asset_id' is required"}, status=400)
        data = data[0]

        serializer = AccountTransactionsSerializer(data=data, context={'method': 'POST'})
        serializer.is_valid(raise_exception=True)

        amount = data['amount']
        transaction_type = data['transaction_type']
        currency_type = data['currency_type']

        current_transaction = create_new_transaction(account_uuid=account_uuid, amount=amount, asset_id=asset_id,
                                                     currency_type=currency_type, transaction_type=transaction_type)
        return Response({'transaction': AccountTransactionsSerializer(current_transaction, many=False).data})


class AccountAssetsApi(APIView):
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request):
        account_uuid = request.data.get('uuid')
        user_assets = get_user_assets(account_uuid)
        return Response({'user assets': AccountAssetsSerializer(user_assets, many=True).data})

class AssetStoryApi(APIView):
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @custom_exception
    def get(self, request):
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        try:
            asset_id = data[0]['asset_id']
        except KeyError:
            return Response({"error": "'asset_id' is requiered"}, status=400)

        asset_story = get_asset_story(asset_id)
        return JsonResponse(asset_story)
