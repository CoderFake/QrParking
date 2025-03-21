from uuid import uuid4
from django.db import models
from django.db.models import UUIDField
from django.utils import timezone

from account.models import User, QrCode


class TransactionType(models.IntegerChoices):
    MONTHLY_TICKET = 1, 'Vé tháng'
    DAILY_TICKET = 2, 'Vé ngày'
    DEDUCT_TICKET = 3, 'Trừ tiền vé'
    REFUND = 4, 'Hoàn tiền'


class TicketType(models.IntegerChoices):
    MONTHLY_TICKET = 1, 'Vé tháng'
    DAILY_TICKET = 2, 'Vé ngày'


class Order(models.Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_code = models.CharField(max_length=50)
    ticket_type = models.IntegerField(choices=TicketType.choices, default=TicketType.DAILY_TICKET)
    vehicle = models.ForeignKey(
        'vehicle.Vehicle',
        on_delete=models.CASCADE,
        related_name='order_vehicle',
        null=True,
        blank=True
    )
    parking = models.ForeignKey(
        'adminapp.ParkingSettings',
        on_delete=models.CASCADE,
        related_name='order_parking',
        null=True,
        blank=True
    )
    quantity = models.IntegerField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    status = models.BooleanField(default=False)


class Transaction(models.Model):
    class MethodTypes(models.TextChoices):
        PayOS = 'payos', 'PayOS'
        Momo = 'momo', 'Momo'
        VNPay = 'vnpay', 'VNPay'
        POINT = 'point', 'Điểm'

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    transaction_code = models.CharField(max_length=100, unique=True, verbose_name='Mã giao dịch')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transaction_user', verbose_name='Người dùng')
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='transaction_order',
        null=True,
        blank=True
    )
    type = models.IntegerField(choices=TransactionType.choices, verbose_name='Loại giao dịch')
    method = models.CharField(max_length=50, choices=MethodTypes.choices, default=MethodTypes.PayOS, verbose_name='Phương thức thanh toán')
    amount = models.DecimalField(max_digits=10, decimal_places=0, verbose_name='Số tiền')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Thời gian tạo')
    status = models.BooleanField(default=False, verbose_name='Trạng thái')

    class Meta:
        verbose_name = 'Quản lý giao dịch'
        verbose_name_plural = 'Quản lý giao dịch'


class Ticket(models.Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    parking_setting = models.ForeignKey(
        'adminapp.ParkingSettings',
        on_delete=models.CASCADE,
        related_name='ticket_parking',
        null=True,
        blank=True
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_user')
    qrcode = models.ForeignKey(
        QrCode,
        on_delete=models.CASCADE,
        related_name='ticket_qrcode',
        null=True,
        blank=True
    )
    vehicle = models.ForeignKey(
        'vehicle.Vehicle',
        on_delete=models.CASCADE,
        related_name='ticket_vehicle',
        null=True,
        blank=True
    )
    expired_at = models.DateTimeField(null=True, blank=True)
    type = models.IntegerField(choices=TicketType.choices)
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['vehicle', 'type'],
                name='unique_vehicle_ticket_type'
            )
        ]



