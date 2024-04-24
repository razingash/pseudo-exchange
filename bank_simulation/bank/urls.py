from django.urls import path, include
from .views import *

urlpatterns = [
    path('v1/registration/', include('djoser.urls')), # post
    path('v1/auth/', include('djoser.urls.authtoken')), # post( login and logout )
    path('v1/get_uuid/', GetUserUuidApi.as_view(), name='user_uuid'), # get
    path('v1/account/', AccountApiView.as_view(), name='account'), # get
    path('v1/wallets/', ForeignCurrencyWalletApi.as_view(), name='wallets'), # get post
    path('v1/transfer/', TransferApi.as_view(), name='transfer'), # get post
    path('v1/credits/', CreditApi.as_view(), name='transfer'), # get post patch
    path('v1/rates/', CurrentRatesApi.as_view(), name='rates'), # get
    path('v1/conversion/', ConversionApi.as_view(), name='conversion'), # get post
    path('v1/transactions/', TransactionsApi.as_view(), name='user_transactions'), # get post
    path('v1/assets/', AssetsListApiView.as_view(), name='assets_list'), # get
    path('v1/user-assets/', AccountAssetsApi.as_view(), name='user_assets'), # get
    path('v1/asset-story/', AssetStoryApi.as_view(), name='asset story') # get
]


