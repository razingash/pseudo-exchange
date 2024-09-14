from django.urls import path
from djoser.views import UserViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import *

urlpatterns = [
    path('v1/registration/', UserViewSet.as_view({'post': 'create'}), name='registrer'), # post
    path('v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('v1/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('v1/logout/', LogoutView.as_view(), name='logout'),
    path('v1/get-uuid/', GetUserUuidApi.as_view(), name='user_uuid'), # get
    path('v1/account/<str:account_uuid>/', AccountApiView.as_view(), name='account'), # get
    path('v1/account/<str:account_uuid>/history/', AccountHistoryApi.as_view(), name='account history'), # get
    path('v1/wallets/<str:account_uuid>/', ForeignCurrencyWalletApi.as_view(), name='wallets'), # get | post
    path('v1/transfers/<str:account_uuid>/', TransferApi.as_view(), name='transfer'), # get | post
    path('v1/credits/<str:account_uuid>/', CreditApi.as_view(), name='credit'), # get | post | patch
    path('v1/conversions/<str:account_uuid>/', ConversionApi.as_view(), name='conversion'), # get | post
    path('v1/transactions/<str:account_uuid>/', TransactionsApi.as_view(), name='user_transactions'), # get | post
    path('v1/assets/', AssetsListApiView.as_view(), name='assets_list'), # get
    path('v1/user-assets/<str:account_uuid>/', AccountAssetsApi.as_view(), name='user_assets'), # get
    path('v1/asset-story/<str:asset_ticker>/', AssetStoryApi.as_view(), name='asset_story'), # get
    path('v1/rates/', CurrentRatesApi.as_view(), name='rates'), # get
    path('v1/metals/', PreciousMetalsRatesApi.as_view(), name='precious metals'), # get
]
