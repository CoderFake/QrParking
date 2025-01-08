import hashlib
import json
import os
from datetime import timedelta
from io import BytesIO
from urllib.parse import urlparse,  urlencode
import qrcode
import requests
from PIL import Image
from django.contrib.auth.hashers import make_password
from django.contrib.messages import get_messages
from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.urls import reverse
from django.core.mail import EmailMessage
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.crypto import get_random_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.sites.shortcuts import get_current_site
from django.db import IntegrityError, transaction
from .models import User
from django.http import JsonResponse, HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.renderers import TemplateHTMLRenderer, JSONRenderer
from rest_framework.response import Response
from django.utils import timezone
from .models import QrCode

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

import logging
from webapp.utils import S3Client

import firebase_admin
from firebase_admin import credentials, auth

logger = logging.getLogger(__name__)

if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)


def redirect_if_authenticated(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect("login")
        return view_func(request, *args, **kwargs)
    return wrapper


class FirebaseLogin(APIView):
    permission_classes = (AllowAny,)
    renderer_classes = [JSONRenderer, TemplateHTMLRenderer]
    template_name = 'webapp/accounts/login.html'

    def get(self, request):
        context = {'firebaseConfig': settings.FIREBASE_CONFIG}
        messages_list = [
            {"message": str(message), "tags": message.tags} for message in get_messages(request)
        ]
        context['messages'] = messages_list
        return Response(context, template_name=self.template_name, status=200)

    def post(self, request):
        next_url = request.data.get('next', '/')

        if request.data.get("email") and request.data.get("password"):
            email = request.data.get("email")
            password = request.data.get("password")

            user = authenticate(email=email, password=password)
            if not user:
                return Response({"status": "error", "message": "Email hoặc mật khẩu không đúng!"}, status=404)
            if user.status == "inactive":
                return Response({"status": "warning", "message": "Tài khoản của bạn chưa được kích hoạt!"}, status=403)

            login(request, user, backend='account.authentication.FirebaseAuthentication')
            user.last_login = timezone.now()
            user.save()
            return Response({"status": "success", "next": next_url}, status=200)

        id_token = request.data.get('idToken')
        if id_token == "":
            return Response({"status": "error", "message": "Không thể xác minh tài khoản, vui lòng thử lại sau!"}, status=400)

        try:
            decoded_token = auth.verify_id_token(id_token, clock_skew_seconds=5)
            email = decoded_token.get("email")
            login_id = decoded_token.get("sub", "")
            username = decoded_token.get("name", "")
            picture_url = decoded_token.get("picture", "")
            signin_method = decoded_token.get("firebase", {}).get("sign_in_provider", "")

            try:
                user = User.objects.get(login_id=login_id)
                if user.status == "inactive":
                    return Response({"status": "warning", "message": "Tài khoản của bạn chưa được kích hoạt"}, status=403)

                user.signin_method = signin_method
                user.save()

            except User.DoesNotExist:
                try:
                    with transaction.atomic():
                        extra_fields = {}
                        if picture_url:
                            response = requests.get(picture_url, stream=True)
                            if response.status_code == 200:
                                try:
                                    parsed_url = urlparse(picture_url)
                                    filename, file_extension = os.path.splitext(os.path.basename(parsed_url.path))

                                    s3 = S3Client()
                                    full_filename = f"{login_id}{file_extension}"

                                    with BytesIO(response.raw.read()) as img_data:
                                        s3.write(f"users/{full_filename}", img_data.getvalue(), public=True)
                                        extra_fields['picture_key'] = f"users/{full_filename}"

                                except Exception as e:
                                    logger.error(f"Error uploading profile picture: {e}")
                                    return Response({"status": "error", "message": "Đã có lỗi xảy ra khi cập nhật ảnh"},
                                                    status=500)

                        extra_fields['status'] = "active"
                        extra_fields['login_id'] = login_id
                        user = User.objects.create_user(
                            email=email,
                            username=username,
                            password=None,
                            **extra_fields
                        )
                except IntegrityError as e:
                    logger.error(e)
                    return Response(
                        {"status": "error", "message": "Tài khoản đã được đăng nhập bằng phưởng thức khác, vui lòng thử lại!"},
                        status=500)
                except Exception as e:
                    logger.error(e)
                    return Response({"status": "error", "message": f"Đã có lỗi xảy ra, vui lòng thử lại sau!"}, status=500)

            try:
                login(request, user, backend='account.authentication.FirebaseAuthentication')
            except Exception as e:
                logger.error(e)

            return Response({"status": "success", "next": next_url}, status=200)

        except auth.InvalidIdTokenError as e:
            logger.error(e)
            return Response({"status": "error", "message": "Xác minh tài khoản thất bại!"}, status=401)
        except Exception as e:
            logger.error(e)
            return Response({"status": "error", "message": "Đã có lỗi xảy ra vui lòng thử lại sau!"}, status=500)


def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            username = data.get('username')
            id_token = data.get('idToken')

            decoded_token = auth.verify_id_token(id_token)
            login_id = decoded_token.get("sub", "")
            signin_method = decoded_token.get("firebase", {}).get("sign_in_provider", "")

            if email != decoded_token.get("email", ""):
                return JsonResponse({"status": "error", "message": "Email không khớp!"}, status=400)

            if User.objects.filter(login_id=login_id).exists():
                return JsonResponse({"status": "error", "message": "Tài khoản đã tồn tại!"}, status=400)
            try:
                with transaction.atomic():
                    extra_fields = {}

                    extra_fields['login_id'] = login_id
                    extra_fields['signin_method'] = signin_method

                    password = data.get('password')
                    if signin_method != "password":
                        extra_fields["status"] = "active"
                        password = None

                    user = User.objects.create_user(
                        email=email,
                        username=username,
                        password=password,
                        **extra_fields
                    )

                    messages.success(request, "Tạo tài khoản thành công!")
                    if signin_method == "password":
                        send_email(request, user)
                        messages.info(request, "Hãy xác minh tài khoản qua email của bạn!")

            except Exception as e:
                logger.error(e)
                return JsonResponse({"status": "error", "message": "Không thể tạo tài khoản!"}, status=400)

            return JsonResponse({"status": "success"}, status=200)

        except Exception as e:
            logger.error(e)
            return JsonResponse({"status": "error", "message": "Đã có lỗi xảy ra vui lòng thử lại sau!"}, status=400)

    context = {
        'firebaseConfig': settings.FIREBASE_CONFIG
    }
    return render(request, 'webapp/accounts/register.html', context=context)


def send_email(request, user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    current_site = get_current_site(request).domain

    verify_url = reverse('verify_email', kwargs={'uid': uid, 'token': token})
    verification_link = f"{current_site}{verify_url}"

    mail_subject = "Kích hoạt tài khoản"
    parameters = {
        'name': user.username,
        'verification_link': verification_link,
        'app_name': settings.APP_NAME
    }

    mail_body = render_to_string('webapp/accounts/verify.html', parameters)

    mail = EmailMessage(
        subject=mail_subject,
        body=mail_body,
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email]
    )
    mail.content_subtype = "html"

    try:
        user.token = str(token)
        user.save()

        mail.send()
    except Exception as e:
        logger.error(e)
        raise ValueError(f"Error sending email: {e}")


def verify_email(request, uid, token):
    try:
        uid = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=uid)

        if user.token != token:
            messages.error(request, "Mã xác minh không khớp!")
            return redirect("login")

    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
        logger.error(e)
        user = None

    if user is not None and default_token_generator.check_token(user, token):

        user.is_active = True
        user.status = "active"
        user.token = None
        user.save()

        messages.success(request, 'Xác minh tài khoản thành công')
    else:
        messages.success(request, 'Mã xác thực đã hết hạn, vui lòng nhập mã mới')
    return redirect('login')


@login_required
def account_logout(request):
    logout(request)
    return render(request, 'webapp/home/index.html')


@login_required
def profile(request):
    tab = request.GET.get("tab", "general")
    if tab not in ["general", "change-password"]:
        return HttpResponse(status=404)

    try:
        account = User.objects.get(email=request.user.email)
        if tab == "change-password" and account.signin_method != "password":
            return HttpResponse(status=404)

        if request.method == "POST":
            if tab == "general":
                username = request.POST.get('username', "")
                phone = request.POST.get('phone', "")
                address = request.POST.get('address', "")

                if account.signin_method == "password":
                    if username:
                        account.username = username

                    if request.FILES.get('profile_picture'):
                        file = request.FILES.get('profile_picture')
                        file_extension = file.name.split('.')[-1].lower()
                        filename = f"{account.login_id}.{file_extension}"

                        s3 = S3Client()
                        s3.write(f"users/{filename}", file.read(), public=True)
                        account.picture_key = f"users/{filename}"

                if phone and account.phone_number != phone:
                    if User.objects.filter(phone_number=phone).exclude(pk=account.pk).exists():
                        messages.error(request, "Số điện thoại đã tồn tại!")
                    else:
                        account.phone_number = phone
                if address and account.address != address:
                    account.address = address

                account.save()
                messages.success(request, 'Cập nhật thông tin thành công!')

                base_url = reverse('profile')
                query_string = urlencode({'tab': 'general'})
                return redirect(f"{base_url}?{query_string}")

            import re
            if tab == "change-password":
                base_url = reverse('profile')
                query_string = urlencode({'tab': 'change-password'})

                password = request.POST.get('old_password', "")
                new_password = request.POST.get('new_password', "")
                confirm_password = request.POST.get('confirm_password', "")

                if not password or not authenticate(email=request.user.email, password=password):
                    messages.error(request, "Mật khẩu cũ không chính xác!")
                    return redirect(f"{base_url}?{query_string}")

                if not new_password:
                    messages.error(request, "Mật khẩu mới không được để trống!")
                    return redirect(f"{base_url}?{query_string}")

                if password == new_password:
                    messages.error(request, "Mật khẩu mới không được giống mật khẩu cũ")
                    return redirect(f"{base_url}?{query_string}")

                if len(new_password) < 8:
                    messages.error(request, "Mật khẩu mới phải chứa ít nhất 8 ký tự.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char.islower() for char in new_password):
                    messages.error(request, "Mật khẩu mới phải chứa ít nhất một chữ cái thường.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char.isupper() for char in new_password):
                    messages.error(request, "Mật khẩu mới phải chứa ít nhất một chữ cái hoa.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char.isdigit() for char in new_password):
                    messages.error(request, "Mật khẩu mới phải chứa ít nhất một chữ số.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char in "@$!%*?&" for char in new_password):
                    messages.error(request, "Mật khẩu mới phải chứa ít nhất một ký tự đặc biệt.")
                    return redirect(f"{base_url}?{query_string}")

                if new_password != confirm_password:
                    messages.error(request, "Mật khẩu xác nhận không khớp!")
                    return redirect(f"{base_url}?{query_string}")

                account.set_password(new_password)
                account.save()

                messages.success(request, "Đổi mật khẩu thành công!")
                return redirect(f"{base_url}?{query_string}")

            return HttpResponse(content="NOT FOUND", status=404)

    except User.DoesNotExist as e:
        logger.error(e)
        return HttpResponse({"status": "error", "message": "Tài khoản không tồn tại!"}, status=404)

    context = {
        "account": account,
        "tab": tab
    }

    return render(request, 'webapp/accounts/profile.html', context)


def s3_delete(file_key):
    try:
        s3 = S3Client()
        s3.delete(file_key)
        return True
    except Exception as e:
        logger.error(e)
        return False


def s3_save_file(file, file_name, file_extension):
    s3 = S3Client()
    s3.write(f"qrcodes/{file_name}.{file_extension}", file.read(), public=True)
    return f"qrcodes/{file_name}.{file_extension}"


def generate_key_from_password(password):
    hash_func = getattr(hashlib, settings.QRCODE_HASH)
    return hash_func(password.encode()).digest()


def encrypt_data(data, key):
    cipher = AES.new(key, AES.MODE_CBC)
    iv = cipher.iv
    encrypted_data = cipher.encrypt(pad(data.encode('utf-8'), AES.block_size))
    return iv + encrypted_data


def qrcode_generate(content):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )

    qr.add_data(content)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert('RGB')

    buffer = BytesIO()

    img = img.resize((450, 450), Image.Resampling.LANCZOS)

    img.save(buffer, format="PNG")

    file_name = f"qr_code_{get_random_string(8)}"
    file_extension = "png"

    buffer.seek(0)
    s3_path = s3_save_file(buffer, file_name, file_extension)

    return file_name, s3_path



def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


def get_presigned_url(bucket_name, object_key, expiration=600):

    s3 = S3Client()
    return s3.urlize(object_key, expiration=expiration)


@login_required
def get_qrcode(request):
    try:
        user_qrcode = QrCode.objects.get(user=request.user)

        if request.method == "POST" and is_ajax(request):
            otp_key = request.POST.get("otp", "")

            if (timezone.now() - user_qrcode.rendered_at).total_seconds() > 600:
                if not QrCode.verify_otp(user_qrcode, otp_key):
                    return JsonResponse({"status": "error", "message": "OTP không đúng!"}, status=400)

            if request.POST.get("type"):
                if request.POST.get("type") == "new_qr":
                    key_password = settings.QRCODE_SECRET_KEY
                    key = generate_key_from_password(key_password)

                    now = timezone.now()

                    key_code = now.strftime("%Y%m%d%H%M%S%f")

                    data = {
                        'key_code': str(key_code),
                        'user_id': str(user_qrcode.user.id)
                    }

                    try:
                        if user_qrcode.key_image:
                            delete_success = s3_delete(user_qrcode.key_image)
                            if not delete_success:
                                return JsonResponse(
                                    {"status": "error", "message": "Đã có lỗi xảy ra khi xoá QR cũ!"},
                                    status=400)

                        content = str(encrypt_data(str(data), key))
                        file_name, s3_path = qrcode_generate(content)

                    except Exception as e:
                        logger.error(e)
                        return JsonResponse({"status": "error", "messages": "Đã có lỗi xảy ra, vui lòng thử lại sau!"}, status=400)

                    user_qrcode.key_image = s3_path
                    user_qrcode.key_code = str(key_code)
                    user_qrcode.content = content
                    user_qrcode.updated_at = now
                    user_qrcode.rendered_at = now
                    user_qrcode.save()

                    image_url = get_presigned_url(settings.BUCKET_NAME, s3_path, expiration=600)

                    messages.success(request, "QR code mới đã được tạo!")

                    return JsonResponse({
                        "status": "success",
                        "image_url": image_url
                    }, status=200)

                elif request.POST.get("type") == "hidden":
                    user_qrcode.rendered_at = timezone.now() - timedelta(minutes=11)
                    user_qrcode.save()
                    return JsonResponse({"status": "success"}, status=200)

                else:
                    return JsonResponse({"status": "error", "message": "Yêu cầu không hợp lệ!"}, status=400)

            else:
                try:
                    image_url = get_presigned_url(settings.BUCKET_NAME, user_qrcode.key_image, expiration=600)
                    user_qrcode.rendered_at = timezone.now()
                    user_qrcode.save()
                except Exception as e:
                    logger.error(e)
                    return JsonResponse({"status": "error", "message": "Đã có lỗi xảy ra!"}, status=400)

                return JsonResponse({"status": "success", "image_url": image_url}, status=200)
        elif request.method == "POST":
            s3 = S3Client()

            try:
                file_content = s3.read(user_qrcode.key_image)

                response = HttpResponse(file_content, content_type='image/png')
                response['Content-Disposition'] = f'attachment; filename="{user_qrcode.key_code}.png"'

                user_qrcode.rendered_at = timezone.now()
                user_qrcode.save()

                return response

            except Exception as e:
                logger.error(e)
                messages.error(request, f"Không thể tải xuống ảnh: {str(e)}")
                redirect('qrcode')

    except QrCode.DoesNotExist:
        if request.method == "POST":

            otp = request.POST.get("otp")
            confirm_otp = request.POST.get("confirm_otp")

            if otp and confirm_otp and otp == confirm_otp and len(otp) == 6 and otp.isdigit():
                try:
                    key_password = settings.QRCODE_SECRET_KEY
                    key = generate_key_from_password(key_password)

                    now = timezone.now()
                    key_code = now.strftime("%Y%m%d%H%M%S%f")

                    data = {
                        'key_code': str(key_code),
                        'user_id': str(request.user.id)
                    }

                    content = str(encrypt_data(str(data), key))
                    file_name, s3_path = qrcode_generate(content)

                    user_qrcode = QrCode.objects.create(
                        user=request.user,
                        key_image=s3_path,
                        key_code=key_code,
                        content=content,
                        password_otp=make_password(otp),
                        created_at=now,
                        updated_at=now,
                        rendered_at=now
                    )

                    image_url = get_presigned_url(settings.BUCKET_NAME, s3_path, expiration=600)

                    messages.success(request, "QR code mới đã được tạo!")

                    return JsonResponse({
                        "status": "success",
                        "image_url": image_url
                    }, status=200)

                except Exception as e:
                    logger.error(e)
                    return JsonResponse({"status": "error", "message": f"Đã có lỗi xảy ra, vui lòng thử lại sau!"}, status=400)
            else:
                return JsonResponse({"status": "error", "message": "OTP không tồn tại!"}, status=400)

    user_qrcode = QrCode.objects.filter(user=request.user).first()

    qrcode_create = False
    context = {"qrcode_create": qrcode_create}

    if user_qrcode:
        qrcode_create = True
        context = {
            "qrcode_create": qrcode_create,
            "qrcode_id": user_qrcode.key_code,
            "created_at": user_qrcode.created_at,
            "modified_at": user_qrcode.updated_at,
            "rendered_at": (timezone.now() - user_qrcode.rendered_at).total_seconds() * 1000
        }

    return render(request, "webapp/accounts/qrcode.html", context=context)
