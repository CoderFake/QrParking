import pyotp
from pydantic_settings import BaseSettings


class OTPSetting(BaseSettings):
    access: str
    secret: str
    interval: int
    digits: int


class OTP:
    def __init__(self, settings: OTPSetting):
        self.settings = settings

    async def validate_otp(self, otp_code: str) -> bool:

        totp = pyotp.TOTP(
            self.settings.secret,
            digits=self.settings.digits,
            interval=self.settings.interval,
        )
        is_valid = totp.verify(otp_code, valid_window=0)
        return is_valid
