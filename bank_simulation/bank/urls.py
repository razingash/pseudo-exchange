from django.urls import path, include
from .views import *

urlpatterns = [
    path('v1/account-auth/', include('djoser.urls')), # post
    path('v1/auth/', include('djoser.urls.authtoken')), # post( login and logout )
    path('v1/account/', AccountApiView.as_view(), name='account'), # get
    path('v1/wallets/', ForeignCurrencyWalletApi.as_view(), name='wallets'), # get post
    path('v1/transfer/', TransferApi.as_view(), name='transfer'), # get post
    path('v1/credits/', CreditApi.as_view(), name='transfer'), # get post patch
    path('v1/rates/', CurrentRatesApi.as_view(), name='rates'), # get
    path('v1/conversion/', ConversionApi.as_view(), name='conversion'), # get post
]


