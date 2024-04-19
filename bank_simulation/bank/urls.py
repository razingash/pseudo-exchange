from django.urls import path
from .views import *

urlpatterns = [
    path('v1/account-reg/', AccountRegisterApiView.as_view(), name='registration'), # post |0
    path('v1/account-auth/', AccountAuthApiView.as_view(), name='authentication'), # post |0
    path('v1/account/', AccountApiView.as_view(), name='account'), # get |1
    path('v1/transfer/', TransferApi.as_view(), name='transfer'), # get post |1
    path('v1/credits/', CreditApi.as_view(), name='transfer'), # get post patch |1
    path('v1/rates/', CurrentRatesApi.as_view(), name='rates'), # get |1
    path('v1/conversion/', ConversionApi.as_view(), name='conversion'), # get post
]


