import asyncio
import json
import logging
import requests
import paho.mqtt.client as mqtt
from smartparking.config import ApplicationSettings
from smartparking.ext.AES.base import AESEncryption, AESSettings


class MQTTClient:
    def __init__(self, settings: ApplicationSettings.MQTTSettings, logger: logging.Logger, aes: AESSettings):
        self.settings = settings
        self.logger = logger
        self.client = mqtt.Client(client_id=settings.client_id)
        self.aes = aes
        self.routes = settings.route.split(",") if settings.route else []
        self.encryption = AESEncryption(self.aes.password, self.aes.salt)
        self.loop = asyncio.get_event_loop()

        if settings.username and settings.password:
            self.client.username_pw_set(settings.username, settings.password)

        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message

    def connect(self):
        try:
            self.logger.info(f"Connecting to MQTT broker at {self.settings.broker_url}:{self.settings.broker_port}")
            self.client.connect(self.settings.broker_url, self.settings.broker_port)
        except Exception as e:
            self.logger.error(f"Failed to connect to MQTT broker: {e}")

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.logger.info("Connected to MQTT broker successfully.")
            self.loop.create_task(self._async_subscribe())
        else:
            self.logger.error(f"Failed to connect to MQTT broker. Code: {rc}")

    def on_disconnect(self, client, userdata, rc):
        if rc == 0:
            self.logger.info("Disconnected from MQTT broker successfully.")
        else:
            self.logger.error(f"Unexpected disconnection from MQTT broker. Code: {rc}")

    def on_message(self, client, userdata, message):
        try:
            topic = message.topic
            encrypted_payload = message.payload.decode()

            self.logger.info(f"Received message on topic {topic}")
            if encrypted_payload.startswith('"') and encrypted_payload.endswith('"'):
                encrypted_payload = json.loads(encrypted_payload)

            payload = self.encryption.decrypt(encrypted_payload)
            self.loop.create_task(self.forward_to_fastapi(topic, payload))
        except Exception as e:
            self.logger.error(f"Error processing message on topic {message.topic}: {e}")

    async def _async_subscribe(self):
        if not self.routes:
            self.logger.warning("No topics provided for subscription.")
            return

        for route in self.routes:
            topic = route.strip()
            if not topic:
                continue
            try:
                result, mid = await asyncio.to_thread(self.client.subscribe, topic)
                if result == mqtt.MQTT_ERR_SUCCESS:
                    self.logger.info(f"Subscribed to topic: {topic}")
                else:
                    self.logger.error(f"Failed to subscribe to topic: {topic}. Error code: {result}")
            except Exception as e:
                self.logger.error(f"Error subscribing to topic {topic}: {e}")

    async def forward_to_fastapi(self, topic: str, payload: dict):
        try:
            base_url = self.settings.base_url
            route = topic
            response = await asyncio.to_thread(
                requests.post,
                f"{base_url}/{route}",
                json=payload
            )
            self.logger.info(
                f"Forwarded to {base_url}/{route}, response: {response.status_code}, {response.text}"
            )
        except Exception as e:
            self.logger.error(f"Failed to forward message to FastAPI: {e}")

    async def start_loop(self):
        try:
            self.logger.info("Starting MQTT loop...")
            await asyncio.to_thread(self.client.loop_forever)
        except Exception as e:
            self.logger.error(f"Failed to start MQTT loop: {e}")

    async def stop_loop(self):
        try:
            self.client.loop_stop()
            self.logger.info("Stopped MQTT loop.")
        except Exception as e:
            self.logger.error(f"Failed to stop MQTT loop: {e}")

    async def close(self):

        try:
            self.client.disconnect()
            self.logger.info("Closed MQTT connection.")
        except Exception as e:
            self.logger.error(f"Failed to close MQTT connection: {e}")
