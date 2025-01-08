import json
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Util.Padding import pad, unpad
import base64
from pydantic_settings import BaseSettings

class AESSettings(BaseSettings):
    password: str
    salt: str


class AESEncryption:
    def __init__(self, password: str, salt: str):
        salt_bytes = salt.encode('utf-8')
        self.key = PBKDF2(password, salt_bytes, dkLen=32)

    def encrypt(self, data: dict) -> str:
        try:
            cipher = AES.new(self.key, AES.MODE_CBC)
            data_json = json.dumps(data)
            encrypted_data = cipher.encrypt(pad(data_json.encode('utf-8'), AES.block_size))

            iv = base64.b64encode(cipher.iv).decode('utf-8')
            encrypted_data = base64.b64encode(encrypted_data).decode('utf-8')
            return json.dumps({'iv': iv, 'data': encrypted_data})
        except Exception as e:
            raise ValueError(f"Error encrypting data: {e}")

    def decrypt(self, encrypted_data: str) -> dict:
        try:
            data = json.loads(encrypted_data)
            iv = base64.b64decode(data['iv'])
            encrypted_data = base64.b64decode(data['data'])

            cipher = AES.new(self.key, AES.MODE_CBC, iv)
            decrypted_data = unpad(cipher.decrypt(encrypted_data), AES.block_size)
            return json.loads(decrypted_data.decode('utf-8'))
        except Exception as e:
            raise ValueError(f"Error decrypting data: {e}")