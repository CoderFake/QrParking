from .commons import *
from smartparking.api.shared.errors import abort
from smartparking.api.view.requests import ParkingData
from .types import ParkingType, TicketType

from datetime import datetime
import pytz
from uuid import uuid4
import random


def to_timezone_aware(dt, tz="Asia/Ho_Chi_Minh"):

    if not dt:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt)
        except ValueError:
            raise ValueError("Invalid datetime format. Expected ISO 8601 format.")
    timezone = pytz.timezone(tz)
    if dt.tzinfo is None:
        return timezone.localize(dt)
    return dt.astimezone(timezone)


@service
async def subscribe_parking(data: ParkingData) -> None:
    try:
        time_in = to_timezone_aware(data.check_in_out.time_in)
        time_out = to_timezone_aware(data.check_in_out.time_out)

        print(time_in, time_out)

        if data.type not in [ParkingType.CHECK_IN.value, ParkingType.CHECK_OUT.value]:
            raise abort(status=400, message="Invalid parking type.")

        if not data.license_number or not data.license_number.strip():
            raise abort(status=400, message="License number is required.")

        if data.type == ParkingType.CHECK_OUT.value:
            result = await r.tx.execute(
                select(m.ParkingHistory.id, m.ParkingHistory.check_in)
                .where(
                    and_(
                        m.ParkingHistory.license_number == data.license_number,
                        m.ParkingHistory.check_out == None
                    )
                )
                .order_by(m.ParkingHistory.check_in.desc())
                .limit(1)
            )

            row = result.first()

            if not row:
                raise abort(status=404, message="No active parking history found for the given license number.")

            existing_id, existing_check_in = row

            if time_out <= existing_check_in:
                raise abort(status=400, message="Check-out time must be greater than check-in time.")

            if data.ticket_type == TicketType.DAY.value:
                user_balance = await r.tx.scalar(
                    select(m.Account.balance).where(m.Account.id == data.uid)
                )
                if user_balance is None or user_balance < int(data.price):
                    raise abort(status=400, message="Insufficient balance.")

                await r.tx.execute(
                    update(m.Account)
                    .where(m.Account.id == data.uid)
                    .values(balance=user_balance - int(data.price))
                )

            await r.tx.execute(
                update(m.ParkingHistory)
                .where(m.ParkingHistory.id == existing_id)
                .values(
                    check_out=time_out,
                    image_check_out_key=data.check_in_out.image_out
                )
            )

            await r.tx.execute(
                insert(m.Transaction).values(
                    id=str(uuid4()),
                    user_id=data.uid,
                    transaction_code=str(datetime.now().strftime("%H%M%S%f")) + str(random.randint(10, 999)),
                    type=int(TicketType.MONTH.value if int(data.price) != 0 else TicketType.DAY.value),
                    amount=int(data.price) ,
                    status=True
                )
            )
        else:
            active_parking = await r.tx.scalar(
                select(m.ParkingHistory.id)
                .where(
                    and_(
                        m.ParkingHistory.license_number == data.license_number,
                        m.ParkingHistory.check_out == None
                    )
                )
            )
            if active_parking:
                raise abort(status=400, message="License number already checked in.")

            await r.tx.execute(
                insert(m.ParkingHistory).values(
                    id=str(uuid4()),
                    user_id=data.uid,
                    parking_id=data.id,
                    check_in=time_in,
                    price=int(data.price),
                    license_number=data.license_number,
                    image_check_in_key=data.check_in_out.image_in
                )
            )

        await r.tx.commit()

    except Exception as e:
        await r.tx.rollback()
        r.logger.error(f"Error in subscribe_parking: {e}")
        raise abort(status=500, message="Internal server error")


