from django.contrib.auth.admin import UserAdmin
from django.conf import settings
from account.forms import UserChangeFormCustom
from account.models import User
from adminapp.admin import admin_site


class AccountAdmin(UserAdmin):
    form = UserChangeFormCustom

    list_display = ('username', 'email', 'date_joined', 'last_login', 'status', 'is_staff', 'is_superuser')
    list_display_links = ('username', 'email')
    list_filter = ('is_staff', 'is_superuser', 'status', 'date_joined')
    search_fields = ('username', 'email')
    readonly_fields = ('date_joined', 'last_login')
    ordering = ('date_joined',)

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Thông tin cá nhân', {'fields': ('first_name', 'last_name', 'phone_number', 'address', 'picture_key')}),
        ('Quyền Hạn', {'fields': ('is_staff', 'is_superuser')}),
        ('Ngày đăng nhập / Khởi tạo', {'fields': ('last_login', 'date_joined')}),
        ('Trạng thái', {'fields': ('status',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'status', 'is_staff', 'is_superuser'),
        }),
    )

    list_per_page = 25

    def save_model(self, request, obj, form, change):
        default_superuser_email = getattr(settings, 'DJANGO_SUPERUSER_EMAIL', None)
        is_root_admin = request.user.email == default_superuser_email

        if obj == request.user:
            restricted_fields = {'is_staff', 'is_superuser', 'status', 'email'}
            changed_fields = set(form.changed_data)
            if changed_fields.intersection(restricted_fields):
                self.message_user(request, "Bạn không thể thay đổi quyền hạn hoặc email của chính mình.", level="error")
                return

        if not is_root_admin and obj.is_superuser:
            self.message_user(request, "Bạn không được phép thay đổi tài khoản Superuser khác.", level="error")
            return

        if not is_root_admin and request.user.is_superuser:
            allowed_fields = {'is_staff', 'status'}
            changed_fields = set(form.changed_data)
            if not changed_fields.issubset(allowed_fields):
                self.message_user(request, "Bạn chỉ được phép thay đổi trạng thái hoặc quyền hạn của nhân viên.", level="error")
                return

        if 'email' in form.changed_data:
            self.message_user(request, "Không được phép thay đổi email.", level="error")
            return

        super().save_model(request, obj, form, change)

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)

        class CustomForm(form):
            def __init__(inner_self, *args, **inner_kwargs):
                inner_kwargs.pop('user', None)
                super().__init__(*args, **inner_kwargs)
                inner_self.user = request.user

        return CustomForm


admin_site.register(User, AccountAdmin)
