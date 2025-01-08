import smartparking.service.mqtt as mt
from smartparking.api.commons import *
from smartparking.config import environment
from smartparking.ext.otp.base import OTPSetting

router = APIRouter()


settings = environment().settings
otp_setting = OTPSetting(
    access=settings.otp.access,
    secret=settings.otp.secret,
    interval=settings.otp.interval,
    digits=settings.otp.digits
)

@router.post(
    "/subscribe/parking",
    status_code=200,
    responses={
        200: {"description": "Parking information."},
        404: {"description": "Parking not found."},
    },
)
async def subscribe_parking(payload: vq.ParkingPayload) -> str:

    try:
        header = payload.header
        data = payload.data
    except Exception:
        return abort(status=400, message="Invalid payload.")

    await otp_auth_instance.auth_for_mqtt(header.api_access_key)

    await mt.subscribe_parking(data)

    return "success"

