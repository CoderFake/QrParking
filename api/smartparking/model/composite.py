from typing import List

from . import db


#----------------------------------------------------------------
# Entities
#----------------------------------------------------------------
class Me(db.Account):
    pass

class UserVehicle(db.VehicleInfor):
    pass

class UserTicket(db.Ticket):
    pass

class Parking(db.ParkingSettings):
    pass

class MonthTicket(db.MonthTicketSettings):
    pass

class Vehicle(db.VehicleSettings):
    pass

class Timer(db.TimerSettings):
    pass

class Camera(db.CameraSettings):
    pass

class ParkingInfo:
    def __init__(
        self,
        parking: Parking,
        month_tickets: List[MonthTicket],
        vehicles: List[Vehicle],
        timers: List[Timer],
        cameras: List[Camera],
    ):
        self.id = str(parking.id)
        self.parking_name = parking.parking_name
        self.parking_address = parking.parking_address
        self.parking_capacity = parking.parking_capacity
        self.month_tickets = month_tickets
        self.vehicles = vehicles
        self.timers = timers
        self.cameras = cameras

    @classmethod
    def from_orm(cls, parking: Parking) -> "ParkingInfo":
        return cls(
            parking=parking,
            month_tickets=parking.month_tickets,
            vehicles=parking.vehicles,
            timers=parking.timers,
            cameras=parking.cameras,
        )

