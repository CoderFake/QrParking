import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.contrib.auth import login as django_login
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from account.models import User



if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        user = self.get_user_from_firebase(request)
        if user is not None:
            return (user, 'account.authentication.FirebaseAuthentication')
        return None

    @staticmethod
    def get_user_from_firebase(request):
        if hasattr(request, '_cached_user'):
            return request._cached_user

        id_token = request.headers.get('Authorization')
        if not id_token:
            return None

        if id_token.startswith('Bearer '):
            id_token = id_token.split('Bearer ')[1]

        try:
            decoded_token = auth.verify_id_token(id_token, clock_skew_seconds=5)
        except auth.ExpiredIdTokenError:
            raise AuthenticationFailed('Mã token đã hết hạn')
        except auth.InvalidIdTokenError:
            raise AuthenticationFailed('Mã token không hợp lệ')
        except Exception as e:
            raise AuthenticationFailed(f'Xác thực không thành công: {str(e)}')

        email = decoded_token.get('email')
        login_id = decoded_token.get('sub')

        if not email or not login_id:
            raise AuthenticationFailed('Mã token không hợp lệ')

        try:
            user = User.objects.get(email=email, login_id=login_id)
            if not user.is_active:
                raise AuthenticationFailed('Tài khoản chưa được kích hoạt')
            request._cached_user = user
        except User.DoesNotExist:
            raise AuthenticationFailed('Không tồn tại tài khoản')

        return request._cached_user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return False

    @staticmethod
    def login_user(request, user):
        django_login(request, user, backend='account.authentication.FirebaseAuthentication')
        request.user = user


def FirebaseAuthenticationMiddleware(get_response):
    def middleware(request):
        result = FirebaseAuthentication().authenticate(request)
        if result is not None:
            user, _ = result
            request.user = user
        return get_response(request)

    return middleware
