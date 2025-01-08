from uuid import uuid4
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.sites.shortcuts import get_current_site
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer, JSONRenderer
from payos import PayOS
from django.conf import settings
from django.utils import timezone
from django.shortcuts import render, redirect
import random
from payos import PaymentData, ItemData
from django.urls import reverse
from django.db import transaction
from account.models import QrCode
from adminapp.models import ParkingSettings, MonthTicketSettings
from vehicle.models import Vehicle
from .models import Transaction, Ticket, Order, TicketType
from account.views import redirect_if_authenticated

import logging

logger = logging.getLogger(__name__)

try:
    payOS = PayOS(
        client_id=settings.PAYOS_CLIENT_ID,
        api_key=settings.PAYOS_API_KEY,
        checksum_key=settings.PAYOS_CHECKSUM_KEY
    )
    logger.info("payOS initialized successfully.")
except Exception as e:
    logger.error("Failed to initialize payOS: %s", e)


@method_decorator(redirect_if_authenticated, name='dispatch')
class Payment(APIView):
    def post(self, request):
        try:
            data = request.data
            data = payOS.verifyPaymentWebhookData(data)

            if data.description in ['Ma giao dich thu nghiem', "VQRIO123"]:
                return Response({
                        "error": 0,
                        "message": "Ok",
                        "data": None
                    })

            return Response({
                        "error": 0,
                        "message": "Ok",
                        "data": None
                    })
        except Exception as e:
            logger.error(e)
            return Response({
                "error": -1,
                "message": e,
                "data": None
                })


@method_decorator(redirect_if_authenticated, name='dispatch')
class OrderCreate(APIView):
    def post(self, request):
        try:
            body = request.data
            item = ItemData(name=body["productName"], quantity=1, price=body["price"])

            paymentData = PaymentData(
                orderCode=timezone.now().strftime("%Y%m%d%H%M%S%f"), amount=body["price"],
                description=body["description"],
                items=[item], cancelUrl=body["cancelUrl"],
                returnUrl=body["returnUrl"]
            )

            payosCreateResponse = payOS.createPaymentLink(paymentData)
            return Response({
                "error": 0,
                "message": "success",
                "data": payosCreateResponse.to_json()
            })
        except Exception as e:
            logger.error(e)
            return Response({
                "error": -1,
                "message": "Fail",
                "data": None
            })


@method_decorator(redirect_if_authenticated, name='dispatch')
class OrderManage(APIView):
    def get(self, request, pk):
        try:
            data = payOS.getPaymentLinkInfomation(pk)
            return Response(
                {
                    "error": 0,
                    "message": "Ok",
                    "data": data.to_json()
                }
            )
        except Exception as e:
            logger.error(e)
            return Response(
                {
                    "error": -1,
                    "message": "Fail",
                    "data": None
                }
            )

    def put(self, request, pk):
        try:
            order = payOS.cancelPaymentLink(pk)
            return Response(
                {
                    "error": 0,
                    "message": "Ok",
                    "data": order.to_json()
                }
            )
        except Exception as e:
            logger.error(e)
            return Response(
                {
                    "error": -1,
                    "message": "Fail",
                    "data": None
                }
            )


class Webhook(APIView):
    def post(self, request):
        try:
            webhookUrl = request.data["webhook_url"]
            payOS.confirmWebhook(webhookUrl)
            return Response(
                {
                    "error": 0,
                    "message": "Ok",
                    "data": None
                }
            )
        except Exception as e:
            logger.error(e)
            return Response(
                {
                    "error": -1,
                    "message": "Fail",
                    "data": None
                }
            )


@login_required
def success(request):
    order_id = request.GET.get("orderCode", "")
    with transaction.atomic():
        try:
            order = Order.objects.get(order_code=order_id)
            order.status = True
            order.save()
        except Order.DoesNotExist:
            return HttpResponse(status=404)

        Transaction.objects.create(
            id=uuid4(),
            transaction_code=order_id,
            user=request.user,
            order=order,
            type=order.ticket_type,
            amount=order.amount,
            status=True
        )

        user = request.user
        user.balance += order.amount
        user.save()

        try:
            ticket = Ticket.objects.get(
                user=request.user,
                parking_setting=order.parking,
                type=order.ticket_type
            )
            if order.ticket_type == TicketType.MONTHLY_TICKET:
                expired_at = ticket.expired_at
                if expired_at > timezone.now():
                    ticket.expired_at = expired_at + timezone.timedelta(days=30 * order.quantity)
                else:
                    ticket.expired_at = timezone.now().replace(hour=23, minute=59, second=59) + timezone.timedelta(
                        days=30 * order.quantity)
            ticket.save()
        except Ticket.DoesNotExist:
            Ticket.objects.create(
                id=uuid4(),
                parking_setting=order.parking,
                user=request.user,
                qrcode=QrCode.objects.get(user=request.user),
                vehicle=order.vehicle,
                expired_at=timezone.now().replace(hour=23, minute=59, second=59) + timezone.timedelta(
                    days=30 * order.quantity) if order.ticket_type == TicketType.MONTHLY_TICKET else None,
                type=order.ticket_type,
                created_at=timezone.now()
            )

    return redirect(f"{reverse('payment_history')}?tab=ticket")


@login_required
def cancel(request):
    order_id = request.GET.get("orderCode", "")
    try:
        order = Order.objects.get(order_code=order_id)
    except Order.DoesNotExist:
        return HttpResponse(status=404)

    Transaction.objects.create(
        id=uuid4(),
        transaction_code=order_id,
        user=request.user,
        order=order,
        type=order.ticket_type,
        amount=order.amount,
        status=False
    )

    messages.error(request, "Thanh toán không thành công!")
    return redirect(f"{reverse('payment_history')}?tab=ticket")


@login_required
def get_month_ticket_price(request):
    vehicle_type = request.GET.get("vehicle_type", "")
    parking_name = request.GET.get("parking_name", "")

    if vehicle_type not in ["car", "bike"]:
        return HttpResponse(status=404)
    try:
        ticket = MonthTicketSettings.objects.get(parking__parking_name=parking_name, type=vehicle_type)
        price = ticket.price if ticket.price is not None else 0
    except ParkingSettings.DoesNotExist:
        return HttpResponse(status=404)
    except MonthTicketSettings.DoesNotExist:
        price = 0

    return JsonResponse({"status": "success", "price": price})


@method_decorator(redirect_if_authenticated, name='dispatch')
class Checkout(APIView):
    permission_classes = (AllowAny,)
    renderer_classes = [JSONRenderer, TemplateHTMLRenderer]
    template_name = 'webapp/payment/index.html'

    def get(self, request):
        order_id = int(str(timezone.now().strftime("%H%M%S%f")) + str(random.randint(10, 999)))
        request.session["order_id"] = order_id
        try:
            qrcode = QrCode.objects.get(user=request.user)
        except QrCode.DoesNotExist:
            messages.info(request, "Tạo mã QR trước khi thanh toán!")
            return redirect("qrcode")

        query = request.GET.get("query", "daily-ticket")
        if query not in ["daily-ticket", "month-ticket"]:
            return HttpResponse(status=404)

        context = {}

        if query == "month-ticket":
            parking = [p.parking_name for p in ParkingSettings.objects.all()]
            price = MonthTicketSettings.objects.filter(type="bike", parking__parking_name=parking[0]).first().price
            context = {
                "parking_names": parking,
                "init_price": price,
            }

        description = "Hoá đơn thanh toán vé ngày" if query == "daily-ticket" \
            else "Hoá đơn thanh toán vé tháng"

        context.update({
            "order_id": order_id,
            "description": description,
            "type": query,
            "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        })

        return Response(context, template_name=self.template_name, status=200)

    def post(self, request):
        order_id = request.POST.get("order_id", "")
        price = request.POST.get("price", "")
        type = request.POST.get("type", "")
        vehicle_type = request.POST.get("vehicle_type", "")

        if order_id != str(request.session.get("order_id", "")):
            messages.error(request, "Mã đơn hàng không hợp lệ!")
            return redirect(f"{reverse('payment_index')}?query={type or 'daily-ticket'}")

        if type not in ["daily-ticket", "month-ticket"] or vehicle_type not in ["car", "bike"]:
            logger.error("missing ticket type")
            messages.error(request, "Không tồn tại loại vé!")
            return redirect(f"{reverse('payment_index')}?query=daily-ticket")

        parking_name = None
        month_quantity = ""
        if type == "month-ticket":
            parking_name = request.POST.get("parking_name", "")
            month_quantity = request.POST.get("month", "")
            price = int(price.split(" ")[0])

        try:
            price = int(price)
        except ValueError:
            logger.error("price is not a number")
            messages.error(request, "Giá vé không hợp lệ!")
            return redirect(f"{reverse('payment_index')}?query={type}")

        if price is None or int(price) < 10000:
            logger.error("missing price")
            messages.error(request, "Giá vé không hợp lệ!")
            return redirect(f"{reverse('payment_index')}?query={type}")

        des_type = "vé ngày" if type == "daily-ticket" \
            else "vé tháng"

        description = request.POST.get("description", des_type)
        description += f" - {month_quantity} thang " if month_quantity != "" else " "

        try:
            item = ItemData(name=description, quantity=1, price=int(price))
            current_site = get_current_site(request)

            paymentData = PaymentData(
                orderCode=int(order_id),
                amount=int(price),
                description=description,
                items=[item],
                cancelUrl=f"{current_site}/payment/cancel",
                returnUrl=f"{current_site}/payment/success"
            )

            vehicle = Vehicle.objects.filter(user=request.user, type=vehicle_type).first()
            if vehicle is None:
                vehicle = Vehicle.objects.create(
                    id=uuid4(),
                    user=request.user,
                    type=vehicle_type
                )

            Order.objects.create(
                id=uuid4(),
                user=request.user,
                ticket_type=TicketType.MONTHLY_TICKET if type == "month-ticket" else TicketType.DAILY_TICKET,
                vehicle=vehicle,
                parking=ParkingSettings.objects.get(parking_name=parking_name) if parking_name is not None else None,
                order_code=str(order_id),
                quantity=int(month_quantity) if month_quantity != "" else None,
                amount=int(price),
                description=description,
                status=False
            )

            payosCreateResponse = payOS.createPaymentLink(paymentData)
            return redirect(payosCreateResponse.checkoutUrl)

        except Exception as e:
            logger.error(e)
            return redirect(f"{reverse('payment_index')}?query={type}")


@login_required
def payment_history(request):
    tab = request.GET.get("tab", "all")
    context = {
        "tab": tab
    }
    if tab not in ["all", "parking", "ticket"]:
        return HttpResponse(status=404)

    transactions = []
    if tab == "all":
        transactions = Transaction.objects.filter(user=request.user)
    elif tab == "parking":
        transactions = Transaction.objects.filter(user=request.user, order__isnull=True)
    elif tab == "ticket":
        transactions = Transaction.objects.filter(user=request.user, order__isnull=False)

    context.update({
        "transactions": transactions
    })

    return render(request, "webapp/payment/payment-history.html", context=context)
