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
            return redirect("index")
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
                return Response({"status": "error", "message": "Username or Password is incorrect!"}, status=404)
            if user.status == "inactive":
                return Response({"status": "warning", "message": "User account is inactive!"}, status=403)

            login(request, user, backend='account.authentication.FirebaseAuthentication')
            user.last_login = timezone.now()
            user.save()
            return Response({"status": "success", "next": next_url}, status=200)

        id_token = request.data.get('idToken')
        if id_token == "":
            return Response({"status": "error", "message": "No idToken provided."}, status=400)

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
                    return Response({"status": "warning", "message": "User account is inactive."}, status=403)

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
                                    return Response({"status": "error", "message": "Error uploading profile picture."},
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
                        {"status": "error", "message": "User creation failed due to data integrity issues."},
                        status=500)
                except Exception as e:
                    logger.error(e)
                    return Response({"status": "error", "message": f"An error occurred: {str(e)}"}, status=500)

            try:
                login(request, user, backend='account.authentication.FirebaseAuthentication')
            except Exception as e:
                logger.error(e)

            return Response({"status": "success", "next": next_url}, status=200)

        except auth.InvalidIdTokenError as e:
            logger.error(e)
            return Response({"status": "error", "message": "Invalid token."}, status=401)
        except Exception as e:
            logger.error(e)
            return Response({"status": "error", "message": str(e)}, status=500)


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
                return JsonResponse({"status": "error", "message": "Email does not match!"}, status=400)

            if User.objects.filter(login_id=login_id).exists():
                return JsonResponse({"status": "error", "message": "User already exists!"}, status=400)
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

                    messages.success(request, "User created successfully!")
                    if signin_method == "password":
                        send_email(request, user)
                        messages.info(request, "Please verify your account via email!")

            except Exception as e:
                logger.error(e)
                return JsonResponse({"status": "error", "message": "Cannot create user!"}, status=400)

            return JsonResponse({"status": "success"}, status=200)

        except Exception as e:
            logger.error(e)
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

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

    mail_subject = "Activate your account"
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
            messages.error(request, "Token does not match!")
            return redirect("login")

    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
        logger.error(e)
        user = None

    if user is not None and default_token_generator.check_token(user, token):

        user.is_active = True
        user.status = "active"
        user.token = None
        user.save()

        messages.success(request, 'Your email has been successfully verified!')
    else:
        messages.success(request, 'The verification link is invalid or has expired!')
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
                        messages.error(request, "Phone number already in use by another account.")
                    else:
                        account.phone_number = phone
                if address and account.address != address:
                    account.address = address

                account.save()
                messages.success(request, 'Profile updated successfully!')

                base_url = reverse('profile')
                query_string = urlencode({'tab': 'general'})
                return redirect(f"{base_url}?{query_string}")

            import re
            if tab == "change-password":
                base_url = reverse('profile')
                query_string = urlencode({'tab': 'change-password'})

                password = request.POST.get('password', "")
                new_password = request.POST.get('new_password', "")
                confirm_password = request.POST.get('confirm_password', "")

                if not password or not authenticate(email=request.user.email, password=password):
                    messages.error(request, "Old password is incorrect!")
                    return redirect(f"{base_url}?{query_string}")

                if not new_password:
                    messages.error(request, "New password cannot be blank.")
                    return redirect(f"{base_url}?{query_string}")

                if password == new_password:
                    messages.error(request, "New password cannot be the same as the old password.")
                    return redirect(f"{base_url}?{query_string}")

                if len(new_password) < 8:
                    messages.error(request, "New password must be at least 8 characters long.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char.islower() for char in new_password):
                    messages.error(request, "New password must contain at least one lowercase letter.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char.isupper() for char in new_password):
                    messages.error(request, "New password must contain at least one uppercase letter.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char.isdigit() for char in new_password):
                    messages.error(request, "New password must contain at least one digit.")
                    return redirect(f"{base_url}?{query_string}")

                if not any(char in "@$!%*?&" for char in new_password):
                    messages.error(request, "New password must contain at least one special character (@$!%*?&).")
                    return redirect(f"{base_url}?{query_string}")

                if new_password != confirm_password:
                    messages.error(request, "New password doesn't match the confirmation password.")
                    return redirect(f"{base_url}?{query_string}")

                account.set_password(new_password)
                account.save()

                messages.success(request, "Password has been changed successfully!")
                return redirect(f"{base_url}?{query_string}")

            return HttpResponse(content="NOT FOUND", status=404)

    except User.DoesNotExist as e:
        logger.error(e)
        return HttpResponse({"status": "error", "message": "User does not exist!"}, status=404)

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
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=30,
        border=4,
    )

    qr.add_data(content)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert('RGB')

    buffer = BytesIO()

    img = img.resize((900, 900), Image.Resampling.LANCZOS)

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
                    return JsonResponse({"status": "error", "message": "OTP verification is invalid!"}, status=400)

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
                                    {"status": "error", "message": "An error occurred while deleting the old QR code."},
                                    status=400)

                        content = str(encrypt_data(str(data), key))
                        file_name, s3_path = qrcode_generate(content)

                    except Exception as e:
                        logger.error(e)
                        return JsonResponse({"status": "error", "messages": "An error occurred"}, status=400)

                    user_qrcode.key_image = s3_path
                    user_qrcode.key_code = str(key_code)
                    user_qrcode.content = content
                    user_qrcode.updated_at = now
                    user_qrcode.rendered_at = now
                    user_qrcode.save()

                    image_url = get_presigned_url(settings.BUCKET_NAME, s3_path, expiration=600)

                    messages.success(request, "New QR code generated successfully!")

                    return JsonResponse({
                        "status": "success",
                        "image_url": image_url
                    }, status=200)

                elif request.POST.get("type") == "hidden":
                    user_qrcode.rendered_at = timezone.now() - timedelta(minutes=11)
                    user_qrcode.save()
                    return JsonResponse({"status": "success"}, status=200)

                else:
                    return JsonResponse({"status": "error", "message": "Invalid request!"}, status=400)

            else:
                try:
                    image_url = get_presigned_url(settings.BUCKET_NAME, user_qrcode.key_image, expiration=600)
                    user_qrcode.rendered_at = timezone.now()
                    user_qrcode.save()
                except Exception as e:
                    logger.error(e)
                    return JsonResponse({"status": "error", "message": "An error occurred: " + str(e)}, status=400)

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
                messages.error(request, f"Could not download the file: {str(e)}")
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

                    messages.success(request, "New QR code generated successfully!")

                    return JsonResponse({
                        "status": "success",
                        "image_url": image_url
                    }, status=200)

                except Exception as e:
                    logger.error(e)
                    return JsonResponse({"status": "error", "message": f"An error occurred: {str(e)}"}, status=400)
            else:
                return JsonResponse({"status": "error", "message": "Invalid OTP!"}, status=400)

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
