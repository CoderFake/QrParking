from django.contrib import admin
from .models import Transaction
from adminapp.admin import admin_site


class AdminTransaction(admin.ModelAdmin):

    list_display = ('transaction_code', 'user', 'method', 'amount', 'status', 'created_at')
    readonly_fields = ('transaction_code', 'user', 'order', 'type', 'method', 'amount', 'created_at', 'status')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


admin_site.register(Transaction, AdminTransaction)