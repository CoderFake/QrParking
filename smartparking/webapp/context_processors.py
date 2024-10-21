from django.conf import settings


def base_url(request):
    return {
        'base_url': f"https://{settings.BUCKET_NAME}.s3.amazonaws.com/"
    }


def balance(request):
    if request.user.is_authenticated:
        return {
            'balance': int(request.user.balance)
        }
    return {'balance': None}
