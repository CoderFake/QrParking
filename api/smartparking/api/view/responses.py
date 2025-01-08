from datetime import datetime, time
from typing import Any, Optional, Dict, List, Tuple
import pytz
import smartparking.model.composite as c
from pydantic import ConfigDict, Field
from pydantic.alias_generators import to_camel
from pydantic.dataclasses import dataclass
from typing_extensions import Self


# ----------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------
def to_lower_camel(name: str) -> str:
    """
    Convert a snake_case string to lowerCamelCase.
    """
    return "".join(
        [n.capitalize() if i > 0 else n for i, n in enumerate(name.split("_"))]
    )


config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
)


# ----------------------------------------------------------------
# Data Classes
# ----------------------------------------------------------------
@dataclass(config=config, frozen=True)
class Me:
    id: str = Field(description="Account ID.")
    balance: int = Field(description="Account balance.")
    date_joined: datetime = Field(description="Registration date and time.")
    last_login: datetime = Field(description="Last modification date and time.")

    @classmethod
    def of(cls, me: 'c.Me') -> Self:
        tz = pytz.timezone('Asia/Ho_Chi_Minh')

        date_joined = me.date_joined.astimezone(tz).strftime('%Y-%m-%dT%H:%M:%S%z')
        last_login = me.last_login.astimezone(tz).strftime('%Y-%m-%dT%H:%M:%S%z')

        return Me(
            id=str(me.id),
            balance=me.balance,
            date_joined=date_joined,
            last_login=last_login,
        )



@dataclass(config=config)
class Camera:
    id: str = Field(description="Camera ID.")
    name: str = Field(description="Camera name.")
    camera_ip: str = Field(description="Camera URL.")

    @classmethod
    def of(cls, camera: c.Camera) -> Self:
        return Camera(
            id=str(camera.id),
            name=camera.camera_name,
            camera_ip=camera.camera_ip,
        )


@dataclass(config=config)
class Timer:
    id: str = Field(description="Timer ID.")
    time_start: time = Field(description="Start time.")
    time_end: time = Field(description="End time.")

    @classmethod
    def of(cls, timer: c.Timer) -> Self:
        return Timer(
            id=str(timer.id),
            time_start=timer.time_start,
            time_end=timer.time_end,
        )


@dataclass(config=config)
class Vehicle:
    id: str = Field(description="Vehicle ID.")
    type: str = Field(description="Vehicle type.")
    day_price: int = Field(description="Day price.")
    night_price: int = Field(description="Night price.")

    @classmethod
    def of(cls, vehicle: c.Vehicle) -> Self:
        return Vehicle(
            id=str(vehicle.id),
            type=vehicle.type,
            day_price=vehicle.day_price,
            night_price=vehicle.night_price,
        )


@dataclass(config=config)
class MonthTicket:
    id: str = Field(description="Month ticket ID.")
    type: str = Field(description="Month ticket type.")
    price: int = Field(description="Month ticket price.")

    @classmethod
    def of(cls, month_ticket: c.MonthTicket) -> Self:
        return MonthTicket(
            id = str(month_ticket.id),
            type=month_ticket.type,
            price=month_ticket.price,
        )


@dataclass(config=config)
class Parking:
    id: str = Field(description="Parking ID.")
    parking_name: str = Field(description="Parking name.")
    parking_address: str = Field(description="Parking address.")
    parking_capacity: int = Field(description="Parking capacity.")

    @classmethod
    def of(cls, parking: c.Parking) -> Self:
        return Parking(
            id=parking.id,
            parking_name=parking.parking_name,
            parking_address=parking.parking_address,
            parking_capacity=parking.parking_capacity,
        )


@dataclass(config=config)
class ParkingInfor:
    parking: Parking = Field(description="Basic information about the parking.")
    cameras: Optional[List[Camera]] = Field(default_factory=list, description="List of cameras in the parking.")
    timers: Optional[List[Timer]] = Field(default_factory=list, description="List of timers in the parking.")
    vehicles: Optional[List[Vehicle]] = Field(default_factory=list, description="List of vehicles in the parking.")
    month_tickets: Optional[List[MonthTicket]] = Field(default_factory=list, description="List of monthly tickets available.")

    @classmethod
    def of(cls, parking_info: c.ParkingInfo) -> Self:

        return cls(
            parking=Parking(
                id=str(parking_info.id),
                parking_name=parking_info.parking_name,
                parking_address=parking_info.parking_address,
                parking_capacity=parking_info.parking_capacity,
            ),
            cameras=[
                Camera.of(camera) for camera in parking_info.cameras
            ] if parking_info.cameras else [],
            timers=[
                Timer.of(timer) for timer in parking_info.timers
            ] if parking_info.timers else [],
            vehicles=[
                Vehicle.of(vehicle) for vehicle in parking_info.vehicles
            ] if parking_info.vehicles else [],
            month_tickets=[
                MonthTicket.of(ticket) for ticket in parking_info.month_tickets
            ] if parking_info.month_tickets else [],
        )



@dataclass(config=config)
class TicketType:
    type: str = Field(description="Type of ticket (e.g., daily or monthly).")
    expired: Optional[datetime] = Field(default=None, description="Expiration date for monthly tickets.")


@dataclass(config=config)
class VehicleInfor:
    vehicle_type: List[str] = Field(default_factory=list, description="List of vehicle types (e.g., motorbike, car).")
    ticket_type: List[TicketType] = Field(default_factory=list, description="List of ticket types.")


@dataclass(config=config)
class UserData:
    users: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        description="Mapping of user accounts (identified by their ID) to vehicle and ticket information.",
    )

    @classmethod
    def of(cls, user_data: List[Tuple[c.Me, List[c.UserVehicle], List[c.UserTicket]]]) -> Self:
        users = {}

        for me, user_vehicles, user_tickets in user_data:
            user_id = str(me.id)

            if user_id not in users:
                users[user_id] = {
                    "account": Me.of(me),
                    "vehicles": [],
                    "tickets": []
                }

            if user_vehicles:
                for vehicle in user_vehicles:
                    users[user_id]["vehicles"].append({
                        "vehicle_id": str(vehicle.id),
                        "type": vehicle.type,
                    })

            if user_tickets:
                for ticket in user_tickets:
                    users[user_id]["tickets"].append({
                        "ticket_id": str(ticket.id),
                        "expired_at": ticket.expired_at.isoformat() if ticket.expired_at else None,
                        "type": "monthly" if ticket.type == 1 else "daily",
                        "vehicle_id": str(ticket.vehicle_id) if ticket.vehicle_id else None,
                    })

        return cls(users=users)

