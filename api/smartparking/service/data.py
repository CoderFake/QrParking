from typing import List, Tuple
from sqlalchemy.orm import joinedload, selectinload

from .commons import *

@service
async def get_parking_infor(parking_id: str) -> Optional[c.ParkingInfo]:

    result = await r.tx.execute(
        select(m.ParkingSettings)
        .options(
            joinedload(m.ParkingSettings.month_tickets).raiseload('*'),
            joinedload(m.ParkingSettings.vehicles).raiseload('*'),
            joinedload(m.ParkingSettings.timers).raiseload('*'),
            joinedload(m.ParkingSettings.cameras).raiseload('*'),
        )
        .filter(m.ParkingSettings.id == parking_id)
    )

    parking = result.scalar()

    if not parking:
        return None

    return c.ParkingInfo.from_orm(parking)


@service
async def get_user_data() -> List[Tuple[c.Me, List[c.UserVehicle], List[c.UserTicket]]]:
    result = await r.tx.execute(
        select(m.Account)
        .options(
            selectinload(m.Account.vehicles).selectinload(m.VehicleInfor.tickets),
            selectinload(m.Account.tickets)
        )
    )

    accounts_with_details = []
    for account in result.scalars():
        vehicles = account.vehicles
        tickets = [ticket for vehicle in vehicles for ticket in vehicle.tickets]
        accounts_with_details.append((account, vehicles, tickets))

    return accounts_with_details




