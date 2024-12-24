from django.contrib import admin
from .models import ParkingSettings, MonthTicketSettings, VehicleSettings, CameraSettings, TimerSettings
from django.contrib.admin import AdminSite


class MonthTicketSettingsInline(admin.TabularInline):
    model = MonthTicketSettings
    extra = 1
    verbose_name = "Vé tháng"
    verbose_name_plural = "Vé tháng"


class VehicleSettingsInline(admin.TabularInline):
    model = VehicleSettings
    extra = 1
    verbose_name = "Cấu hình giá vé"
    verbose_name_plural = "Cấu hình giá vé"


class CameraSettingsInline(admin.TabularInline):
    model = CameraSettings
    extra = 1
    verbose_name = "Camera"
    verbose_name_plural = "Danh sách Camera"


class TimerInline(admin.TabularInline):
    model = TimerSettings
    extra = 1
    verbose_name = "Cấu hình thời gian tính vé ngày"
    verbose_name_plural = "Cấu hình thời gian tính vé ngày"


class ParkingSettingsAdmin(admin.ModelAdmin):
    inlines = [MonthTicketSettingsInline, VehicleSettingsInline, TimerInline, CameraSettingsInline]
    list_display = ('parking_name', 'parking_address', 'parking_capacity', 'status')
    search_fields = ('parking_name', 'parking_address')
    list_filter = ('status',)
    ordering = ('parking_name',)
    fieldsets = (
        ("Thông tin bãi đỗ", {
            "fields": ("parking_name", "parking_address", "parking_capacity", "status")
        }),
    )

    class Meta:
        verbose_name = "Cài đặt bãi đỗ"
        verbose_name_plural = "Cài đặt bãi đỗ"


class CustomAdminSite(AdminSite):
    def get_app_list(self, request):
        app_list = super().get_app_list(request)
        return app_list


admin_site = CustomAdminSite(name="admin")


for model in [MonthTicketSettings, VehicleSettings, TimerSettings, CameraSettings]:
    if model in admin_site._registry:
        admin_site.unregister(model)


admin_site.register(ParkingSettings, ParkingSettingsAdmin)