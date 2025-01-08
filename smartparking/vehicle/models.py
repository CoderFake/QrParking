from django.db import models
from uuid import uuid4
from account.models import User


class VehicleTypes(models.TextChoices):
    BIKE = 'bike', 'Xe máy / Xe đạp'
    CAR = 'car', 'Ô tô'

class Vehicle(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE,blank=True, null=True, related_name='vehicle_user')
    type = models.CharField(max_length=20, choices=VehicleTypes.choices)


class ParkingHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parking_history_user')
    parking = models.ForeignKey('adminapp.ParkingSettings', on_delete=models.CASCADE, related_name='parking_history_parking', null=True, blank=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='parking_history_vehicle', null=True, blank=True)
    check_in = models.DateTimeField(auto_now_add=True)
    check_out = models.DateTimeField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    license_number = models.CharField(max_length=50)
    image_check_in_key = models.CharField(max_length=255, null=True, blank=True)
    image_check_out_key = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['vehicle'],
                condition=models.Q(check_out__isnull=True),
                name='unique_vehicle_parking_active'
            )
        ]

