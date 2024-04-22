from json import load
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bank.permissions import IsUuidProvided

from bank.serializers import AccountSerializer, TransferSerializer, CreditSerializer, ConversionSerializer,\
    ConversionGetSerializer, ForeignCurrencyWalletSerializer, ForeignCurrencyWalletsSerializer
from bank.services import get_user_transfers, get_current_credit, update_pay_credit_early, get_fresh_rates, \
    get_user_conversions, create_conversion, get_additional_wallets, create_new_wallet, get_account_info, \
    object_does_not_exist, value_error_not_enough_money, index_error_credit_was_not_found


class AccountApiView(APIView): # account
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @object_does_not_exist
    def get(self, request):  # get current account info
        account_uuid = request.data.get('uuid')
        account = get_account_info(account_uuid)
        return Response({'accounts': AccountSerializer(account, many=False).data})


class ForeignCurrencyWalletApi(APIView): #
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @object_does_not_exist
    def get(self, request): # get another wallets
        account_uuid = request.data.get('uuid')
        account = get_additional_wallets(account_uuid)
        return Response({'accounts': ForeignCurrencyWalletsSerializer(account, many=True).data})

    @object_does_not_exist
    def post(self, request): # create another wallet
        account_uuid = request.data.get('uuid')
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        data = data[0]
        serializer = ForeignCurrencyWalletSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        fc_wallet = create_new_wallet(account_uuid=account_uuid, currency=data['currency'])

        if fc_wallet is False:
            return Response({"error": f"you already have a wallet with {data['currency']} currency"}, status=400)
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

    @object_does_not_exist
    def get(self, request): # user transfers
        account_uuid = request.data.get('uuid')
        transfers = get_user_transfers(account_uuid)
        return Response({'transfers': TransferSerializer(transfers, many=True).data})

    @value_error_not_enough_money
    @object_does_not_exist
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

    @object_does_not_exist
    def get(self, request): # get current credit
        account_uuid = request.data.get('uuid')
        credit = get_current_credit(account_uuid)
        return Response({'credits': CreditSerializer(credit, many=True).data})

    @index_error_credit_was_not_found
    @object_does_not_exist
    def post(self, request): # take new credit
        data = request.data.get('core')
        if not data:
            return Response({"error": "'core' is required"}, status=400)
        if data[0]['account'] != request.data.get('uuid'):
            return Response({"error": "sender uuid isn't equal to receiver"}, status=400)

        serializer = CreditSerializer(data=data[0], context={'method': 'POST'})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({'post': serializer.data})

    @index_error_credit_was_not_found
    @value_error_not_enough_money
    @object_does_not_exist
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

        return Response({'patch': CreditSerializer(credit, many=False).data})


class ConversionApi(APIView):
    permission_classes = (IsAuthenticated, IsUuidProvided)

    @object_does_not_exist
    def get(self, request): # get conversions
        account_uuid = request.data.get('uuid')
        conversion = get_user_conversions(account_uuid)
        return Response({'conversions': ConversionGetSerializer(conversion, many=True).data})

    @value_error_not_enough_money
    @object_does_not_exist
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

        if conversion is True:
            return Response({"error": f"you don't have a wallet with s {starting_currency} currency"}, status=400)
        if conversion is False:
            return Response({"error": f"you don't have a wallet with f {final_currency} currency"}, status=400)

        return Response({'conversion': ConversionSerializer(conversion, many=False).data})

