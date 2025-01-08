from pydantic.dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Header:
    api_access_key: str


@dataclass
class CheckInOut:
    time_in: Optional[datetime]
    time_out: Optional[datetime]
    image_in: Optional[str]
    image_out: Optional[str]


@dataclass
class ParkingData:
    id: str
    uid: str
    type: str
    ticket_type: int
    vehicle_type: str
    check_in_out: CheckInOut
    license_number: Optional[str]
    price: Optional[int]


@dataclass
class ParkingPayload:
    header: Header
    data: ParkingData
