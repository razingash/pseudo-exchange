from django.contrib import admin

from bank.models import Conversion, ConversionRate, RateList, Assets

# Register your models here.

admin.site.register(RateList)
admin.site.register(Conversion)
admin.site.register(ConversionRate)
admin.site.register(Assets)
