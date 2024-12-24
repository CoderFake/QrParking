from django.urls import path
from . import views


urlpatterns = [
    path('payos_transfer_handler', views.Payment.as_view()),

    path('create', views.OrderCreate.as_view()),
    path('<int:pk>', views.OrderManage.as_view()),
    path('confirm-webhook', views.Webhook.as_view()),

    path('payment-history', views.payment_history, name="payment_history"),
    path('get-month-ticket-price', views.get_month_ticket_price, name="get_month_ticket_price"),
    path('buy-ticket', views.Checkout.as_view(), name="payment_index"),
    path('success', views.success, name="payment_success"),
    path('cancel', views.cancel, name="payment_cancel")
]
