import json
import os
import tempfile

import requests
import random

from celery import shared_task
from django.core.files import File
from bank.models import RateList, Assets, ValuableMetalsList, Metals
from bank.services import positive_volatility_adjustment

#just run this functions in shell if you aren't working on unix

@shared_task
def update_rates_price(): # every day
    url = "https://www.floatrates.com/widget/00002437/8a6ad2754ab6255762d86bd115744bad/usd.json"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:

            json_data = response.json()

            json_file = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
            with open(json_file.name, 'w') as f:
                json.dump(json_data, f)

            with open(json_file.name, 'rb') as f:
                RateList.objects.create(data=File(f))

            json_file.close()
            os.unlink(json_file.name)
        else:
            raise ConnectionRefusedError(f"Failed to get data from the api. HTTP Status Code: {response.status_code}")
    except Exception as e:
        print(f'Exception during TASK update_rates_price:\n{e}')


@shared_task
def update_valuable_metals_price(): # every day | 100 requests per month
    url = "https://api.metalpriceapi.com/v1/latest?api_key=780f6268bb6e95f458ce1584fa8d564c&base=EUR&currencies=XPT,XAU,XAG,XPD"
    try:
        response = requests.get(url, timeout=10)
        response = response.json()
        if response["success"] is True:
            timestamp = response["timestamp"]
            vml = ValuableMetalsList.objects.all()
            if len(vml) > 4:
                for metal_code, metal_name in Metals.choices:
                    cost = response["rates"][f"EUR{metal_code}"]
                    vml = ValuableMetalsList.objects.get(metal=metal_code)
                    vml.cost = cost
                    vml.timestamp = timestamp
                    vml.save()
            else:
                for metal_code, metal_name in Metals.choices:
                    cost = response["rates"][f"EUR{metal_code}"]
                    ValuableMetalsList.objects.create(metal=metal_code, cost=cost, timestamp=timestamp)
        else:
            raise ConnectionRefusedError(f"Failed to get data from the api. HTTP Status Code: {response.json()}")
    except Exception as e:
        print(f'Exception during TASK update_valuable_metals_price:\n{e}')


@shared_task
def update_assets_price(): # every hour
    assets = Assets.objects.all()
    try:
        drift = 0.01
        positive_volatility = 0.045
        negative_probability = 1 / 3 + 0.0111111
        threshold = 300
        for asset in assets:
            file_path = asset.data
            with open(file_path, "r") as json_file:
                data = json.load(json_file)

            current_cost = data["contents"][-1].get('cost')

            random_direction = random.random()

            if random_direction < negative_probability: # negative step
                random_step = random.uniform(-positive_volatility, -positive_volatility * 2)
            else: # positive step
                adjusted_volatility = positive_volatility_adjustment(current_cost, positive_volatility, threshold)
                random_step = random.uniform(0, adjusted_volatility)

            new_price = round(current_cost * (1 + drift + random_step), 2)

            if new_price <= 0:
                new_price = 1
            asset.cost = new_price
            asset.save()
    except Exception as e:
        print(f"Exception during TASK update_assets_price:\n{e}")
