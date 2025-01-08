from datetime import datetime, time
from uuid import uuid4
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, DateTime, DECIMAL


class Base(DeclarativeBase):
    pass


# ----------------------------------------------------------------
# Account
# ----------------------------------------------------------------
class Account(Base):
    __tablename__ = "account_user"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    login_id: Mapped[str]
    username: Mapped[str]
    email: Mapped[str]
    balance: Mapped[int]
    date_joined: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="user")
    parking_histories: Mapped[list["ParkingHistory"]] = relationship("ParkingHistory", back_populates="user")
    tickets: Mapped[list["Ticket"]] = relationship("Ticket", back_populates="user")
    vehicles: Mapped[list["VehicleInfor"]] = relationship(
        "VehicleInfor",
        back_populates="user",
        primaryjoin="Account.id == VehicleInfor.user_id",
    )


# ----------------------------------------------------------------
# ParkingSettings
# ----------------------------------------------------------------
class ParkingSettings(Base):
    __tablename__ = "adminapp_parkingsettings"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parking_name: Mapped[str] = mapped_column(String(255), nullable=False)
    parking_address: Mapped[str] = mapped_column(String, nullable=False)
    parking_capacity: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    month_tickets: Mapped[list["MonthTicketSettings"]] = relationship("MonthTicketSettings", back_populates="parking")
    vehicles: Mapped[list["VehicleSettings"]] = relationship("VehicleSettings", back_populates="parking")
    timers: Mapped[list["TimerSettings"]] = relationship("TimerSettings", back_populates="parking")
    cameras: Mapped[list["CameraSettings"]] = relationship("CameraSettings", back_populates="parking")
    parking_histories: Mapped[list["ParkingHistory"]] = relationship("ParkingHistory", back_populates="parking")
    tickets = relationship("Ticket", back_populates="parking_setting")


# ----------------------------------------------------------------
# Ticket
# ----------------------------------------------------------------
class Ticket(Base):
    __tablename__ = "payment_ticket"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parking_setting_id: Mapped[UUID] = mapped_column(
        ForeignKey("adminapp_parkingsettings.id"), nullable=True
    )
    user_id: Mapped[UUID] = mapped_column(ForeignKey("account_user.id"), nullable=False)
    vehicle_id: Mapped[UUID] = mapped_column(ForeignKey("vehicle_vehicle.id"), nullable=True)
    expired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    type: Mapped[int] = mapped_column(nullable=False)  # 0: one-time, 1: monthly, etc.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now, nullable=False)

    parking_setting = relationship("ParkingSettings", back_populates="tickets")
    user = relationship("Account", back_populates="tickets")
    vehicle = relationship("VehicleInfor", back_populates="tickets")


# ----------------------------------------------------------------
# Vehicle
# ----------------------------------------------------------------
class VehicleInfor(Base):
    __tablename__ = "vehicle_vehicle"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("account_user.id"), nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)

    user = relationship("Account", back_populates="vehicles")
    tickets = relationship("Ticket", back_populates="vehicle")


# ----------------------------------------------------------------
# MonthTicketSettings
# ----------------------------------------------------------------
class MonthTicketSettings(Base):
    __tablename__ = "adminapp_monthticketsettings"

    VALID_TICKET_TYPES = {"bike", "car"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parking_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("adminapp_parkingsettings.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    price: Mapped[int] = mapped_column(DECIMAL(10, 0), default=0, nullable=False)

    parking: Mapped["ParkingSettings"] = relationship("ParkingSettings", back_populates="month_tickets")

    def __setattr__(self, key, value):
        if key == "type" and value not in self.VALID_TICKET_TYPES:
            raise ValueError(f"Invalid ticket type: {value}. Must be one of {self.VALID_TICKET_TYPES}")
        super().__setattr__(key, value)


# ----------------------------------------------------------------
# VehicleSettings
# ----------------------------------------------------------------
class VehicleSettings(Base):
    __tablename__ = "adminapp_vehiclesettings"

    VALID_VEHICLE_TYPES = {"bike", "car"}

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parking_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("adminapp_parkingsettings.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    day_price: Mapped[int] = mapped_column(nullable=False)
    night_price: Mapped[int] = mapped_column(nullable=False)

    parking: Mapped["ParkingSettings"] = relationship("ParkingSettings", back_populates="vehicles")
    parking_histories: Mapped[list["ParkingHistory"]] = relationship("ParkingHistory", back_populates="vehicle")

    def __setattr__(self, key, value):
        if key == "type" and value not in self.VALID_VEHICLE_TYPES:
            raise ValueError(f"Invalid vehicle type: {value}. Must be one of {self.VALID_VEHICLE_TYPES}")
        super().__setattr__(key, value)


# ----------------------------------------------------------------
# TimerSettings
# ----------------------------------------------------------------
class TimerSettings(Base):
    __tablename__ = "adminapp_timersettings"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parking_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("adminapp_parkingsettings.id"), nullable=False)
    time_start: Mapped[time] = mapped_column(nullable=False)
    time_end: Mapped[time] = mapped_column(nullable=False)

    parking: Mapped["ParkingSettings"] = relationship("ParkingSettings", back_populates="timers")


# ----------------------------------------------------------------
# CameraSettings
# ----------------------------------------------------------------
class CameraSettings(Base):
    __tablename__ = "adminapp_camerasettings"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parking_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("adminapp_parkingsettings.id"), nullable=False)
    camera_name: Mapped[str] = mapped_column(String(255), nullable=False)
    camera_ip: Mapped[str] = mapped_column(String(255), nullable=False)

    parking: Mapped["ParkingSettings"] = relationship("ParkingSettings", back_populates="cameras")


# ----------------------------------------------------------------
# Transaction
# ----------------------------------------------------------------
class Transaction(Base):
    __tablename__ = "payment_transaction"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("account_user.id"), nullable=False)
    type: Mapped[int]
    method: Mapped[str] = mapped_column(default="point", nullable=False)
    amount: Mapped[int] = mapped_column(DECIMAL(10, 0), default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now, nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("Account", back_populates="transactions")


# ----------------------------------------------------------------
# ParkingHistory
# ----------------------------------------------------------------
class ParkingHistory(Base):
    __tablename__ = "vehicle_parkinghistory"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("account_user.id"), nullable=False)
    vehicle_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("adminapp_vehiclesettings.id"), nullable=True)
    parking_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("adminapp_parkingsettings.id"), nullable=True)
    check_in: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now, nullable=False)
    check_out: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    price: Mapped[int] = mapped_column(DECIMAL(10, 0), default=0, nullable=False)
    license_number: Mapped[str] = mapped_column(String(50), nullable=True)
    image_check_in_key: Mapped[str] = mapped_column(String(255), nullable=True)
    image_check_out_key: Mapped[str] = mapped_column(String(255), nullable=True)

    user: Mapped["Account"] = relationship("Account", back_populates="parking_histories")
    vehicle: Mapped["VehicleSettings"] = relationship("VehicleSettings", back_populates="parking_histories")
    parking: Mapped["ParkingSettings"] = relationship("ParkingSettings", back_populates="parking_histories")
