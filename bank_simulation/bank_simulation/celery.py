from celery import Celery
from celery.schedules import crontab
from django.conf import settings
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bank_simulation.settings')

app = Celery('bank_simulation')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'update-rates-every-night': {
        'task': 'bank.tasks.update_rates_price',
        'schedule': crontab(hour='4'),
        'options': {'expires': 180}
    },
    'update-assets-cost-every-hour': {
        'task': 'bank.tasks.update_assets_price',
        'schedule': crontab(hour='*/1'),
        'options': {'expires': 180}
    },
}
