import paho.mqtt.client as mqtt
import logging

logger = logging.getLogger(__name__)

class MQTTClient:
    def __init__(self, broker, port, username=None, password=None, client_id=None):
        self.broker = broker
        self.port = port
        self.username = username
        self.password = password
        self.client_id = client_id
        self.client = mqtt.Client()

        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message

        if self.username and self.password:
            self.client.username_pw_set(self.username, self.password)

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected successfully to MQTT broker!")
        else:
            logger.error(f"Failed to connect, return code {rc}")

    def on_disconnect(self, client, userdata, rc):
        logger.warning("Disconnected from MQTT broker")

    def on_message(self, client, userdata, message):
        logger.info(f"Received message: {message.payload.decode()} on topic {message.topic}")

    def connect(self):
        try:
            self.client.connect(self.broker, self.port)
            self.client.loop_start()
            logger.info(f"Connecting to MQTT broker at {self.broker}:{self.port}")
        except Exception as e:
            logger.error(f"Error connecting to MQTT broker: {e}")

    def disconnect(self):
        try:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("Disconnected from MQTT broker")
        except Exception as e:
            logger.error(f"Error disconnecting from MQTT broker: {e}")

    def publish(self, topic, message):
        try:
            result = self.client.publish(topic, message)
            status = result[0]
            if status == 0:
                logger.info(f"Message `{message}` sent to topic `{topic}`")
            else:
                logger.error(f"Failed to send message to topic `{topic}`")
        except Exception as e:
            logger.error(f"Error publishing message: {e}")

    def subscribe(self, topic):
        try:
            self.client.subscribe(topic)
            logger.info(f"Subscribed to topic `{topic}`")
        except Exception as e:
            logger.error(f"Error subscribing to topic `{topic}`: {e}")
