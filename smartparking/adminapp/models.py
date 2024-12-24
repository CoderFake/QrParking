from uuid import uuid4
from django.db import models


class ParkingSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    parking_name = models.CharField(max_length=255, verbose_name="Tên bãi đỗ")
    parking_address = models.TextField(verbose_name="Địa chỉ")
    parking_capacity = models.IntegerField(verbose_name="Sức chứa")
    status = models.BooleanField(default=True, verbose_name="Trạng thái")

    class Meta:
        verbose_name = 'Quản lý bãi đỗ'
        verbose_name_plural = 'Quản lý bãi đỗ'


class MonthTicketSettings(models.Model):
    class TicketTypes(models.TextChoices):
        BIKE = 'bike', 'Xe máy / Xe đạp'
        CAR = 'car', 'Ô tô'

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    parking = models.ForeignKey(ParkingSettings, on_delete=models.CASCADE, related_name='month_tickets', verbose_name='Bãi đỗ')
    type = models.CharField(max_length=20, choices=TicketTypes.choices, verbose_name='Loại vé')
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name='Giá vé (VNĐ)', default=0)

    class Meta:
        verbose_name = 'Cấu hình vé tháng'
        verbose_name_plural = ' Cấu hình vé tháng'


class VehicleSettings(models.Model):
    class VehicleTypes(models.TextChoices):
        BIKE = 'bike', 'Xe máy / Xe đạp'
        CAR = 'car', 'Ô tô'

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    parking = models.ForeignKey(ParkingSettings, on_delete=models.CASCADE, related_name='vehicles', verbose_name='Bãi đỗ')
    type = models.CharField(max_length=20, choices=VehicleTypes.choices, verbose_name='Loại xe')
    day_price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name='Giá vé theo ngày (VNĐ)')
    night_price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name='Giá vé qua đêm (VNĐ)')

    class Meta:
        verbose_name = 'Cấu hình giá vé'
        verbose_name_plural = 'Cấu hình giá vé'


class TimerSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    parking = models.ForeignKey(ParkingSettings, on_delete=models.CASCADE, related_name='timers', verbose_name='Bãi đỗ')
    time_start = models.TimeField(verbose_name='Giờ bắt đầu vé ngày')
    time_end = models.TimeField(verbose_name='Giờ kết thúc vé ngày')

    class Meta:
        unique_together = ('parking',)
        verbose_name = 'Cấu hình thời gian'
        verbose_name_plural = 'Cấu hình thời gian'


class CameraSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    parking = models.ForeignKey(ParkingSettings, on_delete=models.CASCADE, related_name='cameras', verbose_name='Bãi đỗ')
    camera_name = models.CharField(max_length=255, verbose_name='Tên camera')
    camera_ip = models.CharField(max_length=255, verbose_name='RTSP Url')

    class Meta:
        verbose_name = 'Quản lý camera'
        verbose_name_plural = 'Quản lý camera'



