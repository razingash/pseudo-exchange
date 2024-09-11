from django.http import JsonResponse
from rest_framework import status
from rest_framework.authentication import get_authorization_header
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken

from bank.models import ForeignCurrencyWallet, Conversion, InvestmentTransaction, AccountAsset, Credit, Assets
from bank.serializers import AccountSerializer, TransferSerializer, CreditSerializer, ConversionSerializer, \
    ConversionGetSerializer, ForeignCurrencyWalletSerializer, ForeignCurrencyWalletsSerializer, \
    AccountTransactionsSerializer, AccountAssetsSerializer, AssetsListSerializer, GetUuidSerializer
from bank.services import get_user_transfers, update_pay_credit_early, get_currencies_rates_json, create_conversion, \
    create_new_wallet, get_account_info, create_new_transaction, get_asset_story, custom_exception, \
    get_objects_by_uuid, get_objects_list, get_metals_json, get_user_uuid


class LogoutView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        try:
            refresh_token = request.data['refresh_token']
            token = RefreshToken(refresh_token)

            if token.payload['user_id'] != request.user.id:
                return Response({"INFO": "Invalid token, clown"}, status=status.HTTP_403_FORBIDDEN)

            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except (TokenError, InvalidToken):
            return Response(status=status.HTTP_408_REQUEST_TIMEOUT)
        except KeyError:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)


class GetUserUuidApi(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request):  # get current account uuid
        key = get_authorization_header(request).decode('utf-8').split()[1]
        uuid = get_user_uuid(key)
        return Response(GetUuidSerializer(uuid, many=False).data)


class AccountApiView(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request, account_uuid):  # get current account info
        account = get_account_info(account_uuid)
        return Response(AccountSerializer(account, many=False).data)


class ForeignCurrencyWalletApi(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request, account_uuid): # get another wallets
        account = get_objects_by_uuid(model=ForeignCurrencyWallet, account_uuid=account_uuid)
        return Response(ForeignCurrencyWalletsSerializer(account, many=True).data)

    @custom_exception
    def post(self, request, account_uuid): # create another wallet
        serializer = ForeignCurrencyWalletSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fc_wallet = create_new_wallet(account_uuid=account_uuid, currency=request.data.get('currency'))

        return Response(ForeignCurrencyWalletSerializer(fc_wallet, many=False).data)


class TransferApi(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request, account_uuid): # user transfers
        transfers = get_user_transfers(account_uuid)
        return Response(TransferSerializer(transfers, many=True).data)

    @custom_exception
    def post(self, request, account_uuid):
        data = request.data.copy()
        data['sender'] = account_uuid

        serializer = TransferSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({'transfer': serializer.data})


class CreditApi(APIView): #mb later change this api to two different - with getting concrete credit and list of credits
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request, account_uuid): # get current credit
        credit = get_objects_by_uuid(model=Credit, account_uuid=account_uuid)
        return Response(CreditSerializer(credit, many=True).data)

    @custom_exception
    def post(self, request, account_uuid): # take new credit
        request.data['account'] = account_uuid
        serializer = CreditSerializer(data=request.data, context={'method': 'POST'})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    @custom_exception
    def patch(self, request, account_uuid): # pay for the credit early
        request.data['account'] = account_uuid
        serializer = CreditSerializer(data=request.data, context={'method': 'PATCH'})
        serializer.is_valid(raise_exception=True)

        money_for_repayment = request.data.get('amount')
        credit_uuid = request.data.get('credit_uuid')

        credit = update_pay_credit_early(sender_uuid=account_uuid, money_for_repayment=money_for_repayment,
                                         credit_uuid=credit_uuid)

        return Response(CreditSerializer(credit, many=False).data)


class ConversionApi(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request, account_uuid): # get conversions
        conversion = get_objects_by_uuid(model=Conversion, account_uuid=account_uuid)
        return Response(ConversionGetSerializer(conversion, many=True).data)

    @custom_exception
    def post(self, request, account_uuid): # convert currency
        serializer = ConversionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = request.data.get('amount')
        starting_currency = request.data.get('starting_currency')
        final_currency = request.data.get('final_currency')

        conversion = create_conversion(account_uuid=account_uuid, amount=amount, starting_currency=starting_currency,
                                       final_currency=final_currency)

        return Response(ConversionSerializer(conversion, many=False).data)


class TransactionsApi(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request, account_uuid):
        transactions = get_objects_by_uuid(model=InvestmentTransaction, account_uuid=account_uuid)
        return Response(AccountTransactionsSerializer(transactions, many=True).data)

    @custom_exception
    def post(self, request, account_uuid): # buy assets
        request.data['account'] = account_uuid
        serializer = AccountTransactionsSerializer(data=request.data, context={'method': 'POST'})
        serializer.is_valid(raise_exception=True)

        ticker = request.data.get('ticker')
        amount = request.data.get('amount')
        transaction_type = request.data.get('transaction_type')
        currency_type = request.data.get('currency_type')

        current_transaction = create_new_transaction(account_uuid=account_uuid, amount=amount, ticker=ticker,
                                                     currency_type=currency_type, transaction_type=transaction_type)
        return Response(AccountTransactionsSerializer(current_transaction, many=False).data)


class AssetsListApiView(APIView):
    @custom_exception
    def get(self, request):
        amount = request.query_params.get('amount')
        user_assets = get_objects_list(model=Assets, amount=amount)
        return Response(AssetsListSerializer(user_assets, many=True).data)


class AccountAssetsApi(APIView):
    permission_classes = (IsAuthenticated, )

    @custom_exception
    def get(self, request, account_uuid):
        user_assets = get_objects_by_uuid(model=AccountAsset, account_uuid=account_uuid)
        return Response(AccountAssetsSerializer(user_assets, many=True).data)

class AssetStoryApi(APIView):
    @custom_exception
    def get(self, request, asset_ticker):
        asset_story = get_asset_story(asset_ticker)
        return JsonResponse(asset_story)


class CurrentRatesApi(APIView): # mb add later new custom permission for limited update
    def get(self, request):
        json_rates = get_currencies_rates_json()
        return Response(json_rates)


class PreciousMetalsRatesApi(APIView):
    def get(self, request):
        metals = get_metals_json()
        return Response(metals)

