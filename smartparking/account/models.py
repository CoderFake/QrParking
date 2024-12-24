from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError(_('Email không được để trống'))

        if not username:
            raise ValueError(_('Username không được để trống'))

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))

        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        if not password:
            raise ValueError(_("Superusers must have a password."))

        user = self.create_user(email, username, password, **extra_fields)
        user.save(using=self._db)
        return user


class User(AbstractUser, PermissionsMixin):
    id = models.UUIDField(max_length=40, primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=False, blank=False, null=False, verbose_name=_("Tên tài khoản"))
    login_id = models.CharField(max_length=150, unique=True, blank=False, null=False, verbose_name=_("Mã đăng nhập"))
    email = models.EmailField(verbose_name=_("Email"), max_length=254, unique=True)
    phone_number = models.CharField(verbose_name=_("Số điện thoại"), unique=True, max_length=100, blank=True, null=True)
    signin_method = models.CharField(verbose_name=_("Phương thức đăng nhập"), max_length=100, blank=True, null=True)
    address = models.TextField(verbose_name=_("Địa chỉ"), blank=True, null=True)
    picture_key = models.CharField(verbose_name=_("Ảnh"), max_length=254, blank=True, null=True)
    token = models.CharField(max_length=1000, blank=True, null=True)
    status = models.CharField(max_length=50, choices=[
        ('inactive', 'Chưa kích hoạt'),
        ('active', 'Kích hoạt'),
        ('block', 'Bị khoá'),
        ('delete', 'Đã bị xoá'),
    ], default='inactive', verbose_name=_('Trạng thái'))
    is_staff = models.BooleanField(default=False, verbose_name=_('Nhân viên'))
    is_superuser = models.BooleanField(default=False, verbose_name=_('Quản trị viên'))
    date_joined = models.DateTimeField(default=timezone.now, verbose_name=_('Ngày tạo'))
    balance = models.DecimalField(max_digits=20, decimal_places=2, default=0, blank=True, null=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='account_users',
        blank=True,
        verbose_name=_('Nhóm'),
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='account_user_permissions',
        blank=True,
        verbose_name=_('Nhóm quyền tài khoản'),
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = _('Quản lý tài khoản')
        verbose_name_plural = _('Quản lý tài khoản')

    def __str__(self):
        return self.email

    @property
    def formatted_last_login(self):
        if self.last_login:
            local_last_login = timezone.localtime(self.last_login)
            return local_last_login.strftime('%H:%M:%S %d-%m-%Y')
        return _("Tài khoản chưa đăng nhập")


class QrCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, related_name='user_qrcode', on_delete=models.CASCADE, null=True, blank=True)
    key_image = models.CharField(max_length=200)
    key_code = models.CharField(max_length=200)
    content = models.CharField(max_length=1024)
    password_otp = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rendered_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.password_otp.startswith('pbkdf2_sha256$'):
            self.password_otp = make_password(self.password_otp)
        super(QrCode, self).save(*args, **kwargs)

    @staticmethod
    def verify_otp(qr_code_instance, input_otp):
        return check_password(input_otp, qr_code_instance.password_otp)


class EmailNotification(models.Model):
    class EmailCategory(models.TextChoices):
        PARKING_LOT = 'parking_lot', _('Parking lot')
        BALANCE_FLUCTUATION = 'balance_fluctuation', _('Balance Fluctuation')
        TICKET_BILLING = 'ticket_billing', _('Ticket Billing')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name='user_email_notification', on_delete=models.CASCADE, null=True, blank=True)
    category = models.CharField(max_length=50, choices=EmailCategory.choices, default=EmailCategory.PARKING_LOT)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Thông báo email')
        verbose_name_plural = _('Thông báo email')

    def __str__(self):
        return self.category
