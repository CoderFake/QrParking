import cv2
from PIL import Image
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import hashlib
import paho.mqtt.client as mqtt
from dotenv import load_dotenv
import os
from ultralytics import YOLO
from collections import Counter
import numpy as np
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
LOGGER = logging.getLogger(_name_)

load_dotenv()

MQTT_BROKER = os.getenv("MQTT_BROKER")
MQTT_PORT = int(os.getenv("MQTT_PORT"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_TOPIC_USER_ID = os.getenv("MQTT_TOPIC_USER_ID")
MQTT_TOPIC_PLATE_IMAGE = os.getenv("MQTT_TOPIC_PLATE_IMAGE")
MQTT_TOPIC_CROPPED_IMAGE = os.getenv("MQTT_TOPIC_CROPPED_IMAGE")
KEY_PASSWORD = os.getenv("KEY_PASSWORD")

client = mqtt.Client()
client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
client.connect(MQTT_BROKER, MQTT_PORT, 60)


def read_qr_code(image_path):
    img = cv2.imread(image_path)
    detector = cv2.QRCodeDetector()
    data, vertices_array, _ = detector.detectAndDecode(img)
    if vertices_array is not None:
        return data
    else:
        LOGGER.error("Không tìm thấy mã QR trong ảnh.")
        raise ValueError("Không tìm thấy mã QR trong ảnh.")


def generate_key_from_password(password):
    return hashlib.sha256(password.encode()).digest()


def decrypt_data(encrypted_data, key):
    iv = encrypted_data[:16]
    ciphertext = encrypted_data[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted_data = unpad(cipher.decrypt(ciphertext), AES.block_size)
    return decrypted_data.decode('utf-8')


def publish_to_mqtt(topic, message):
    client.publish(topic, message)


def publish_image_to_mqtt(topic, image):
    _, buffer = cv2.imencode('.jpg', image)
    image_bytes = buffer.tobytes()
    client.publish(topic, image_bytes)


def get_info():
    try:
        image_path = 'test.png'
        encrypted_qr_code = read_qr_code(image_path)

        key = generate_key_from_password(KEY_PASSWORD)
        encrypted_data = eval(encrypted_qr_code)
        decrypted_data = decrypt_data(encrypted_data, key)

        user_info = eval(decrypted_data)
        id = user_info.get('key_code')
        user_id = user_info.get('user_id')

        return id, user_id

    except Exception as e:
        LOGGER.error(f"Lỗi khi xử lý QR code: {e}")
        return None


def main():
    try:
        plate_model = YOLO('plate.pt')
        ocr_model = YOLO('ocr.pt')

        cap = cv2.VideoCapture(1)
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            cv2.imshow("Camera", frame)

            key = cv2.waitKey(1) & 0xFF
            if key != 255:
                LOGGER.info("Bắt đầu đọc QR code và xử lý...")
                break

        id, user_id = get_info()

        if not user_id:
            LOGGER.error("Không thể đọc thông tin từ QR code.")
            return

        captured_images = []
        results_list = []
        while len(captured_images) < 5:
            ret, frame = cap.read()
            if not ret:
                break

            captured_image = frame.copy()
            captured_images.append(captured_image)

        LOGGER.info("Bắt đầu nhận diện biển số...")

        for img in captured_images:
            plate_results = plate_model(img)

            for plate_result in plate_results:
                plate_boxes = plate_result.boxes.xyxy

                for box in plate_boxes:
                    x1, y1, x2, y2 = map(int, box)
                    width, height = x2 - x1, y2 - y1
                    aspect_ratio = width / height

                    plate_crop = img[y1:y2, x1:x2]
                    ocr_results = ocr_model(plate_crop)

                    for ocr_result in ocr_results:
                        ocr_boxes = ocr_result.boxes.xyxy
                        ocr_labels = ocr_result.boxes.cls

                        center_y = [(box[1] + box[3]) / 2 for box in ocr_boxes]
                        mean_y = sum(center_y) / len(center_y)
                        top_line = []
                        bottom_line = []

                        for i, (label, box) in enumerate(zip(ocr_labels, ocr_boxes)):
                            if aspect_ratio > 2:
                                top_line.append((label, box))
                            else:
                                if center_y[i] < mean_y:
                                    top_line.append((label, box))
                                else:
                                    bottom_line.append((label, box))

                        top_line_sorted = sorted(top_line, key=lambda x: x[1][0])
                        bottom_line_sorted = sorted(bottom_line, key=lambda x: x[1][0])
                        top_line_text = ''.join([ocr_model.names[int(label)] for label, _ in top_line_sorted])
                        bottom_line_text = ''.join([ocr_model.names[int(label)] for label, _ in bottom_line_sorted])

                        if aspect_ratio > 2:
                            license_plate = top_line_text
                        else:
                            license_plate = top_line_text + " " + bottom_line_text

                        results_list.append(license_plate)

        most_common_plate = Counter(results_list).most_common(1)[0][0]

        LOGGER.info(f"Thông tin id thẻ từ QR code: {id}")

        LOGGER.info(f"Thông tin user_id từ QR code: {user_id}")

        LOGGER.info(f'Biển số xe nhận diện được: {most_common_plate}')

        publish_to_mqtt(MQTT_TOPIC_USER_ID, user_id)
        publish_image_to_mqtt(MQTT_TOPIC_PLATE_IMAGE, frame)
        publish_image_to_mqtt(MQTT_TOPIC_CROPPED_IMAGE, plate_crop)
        LOGGER.info("Dữ liệu đã được gửi lên MQTT thành công!")

        captured_images = []
        results_list = []

        cap.release()
        cv2.destroyAllWindows()

    except Exception as e:
        LOGGER.error(f"Lỗi khi nhận diện biển số: {e}")
        return


if _name_ == "_main_":
    main()