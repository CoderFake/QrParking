from django.apps import AppConfig
from .mqtt_client import MQTTClient
from django.conf import settings


class MqttConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "mqtt"

    def ready(self):

        broker = settings.MQTT_BROKER
        port = settings.MQTT_PORT
        username = settings.MQTT_USERNAME
        password = settings.MQTT_PASSWORD
        client_id = settings.MQTT_CLIENT_ID

        mqtt_client = MQTTClient(broker, port, username, password, client_id)
        mqtt_client.connect()

