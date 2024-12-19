from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .models import ParkingHistory
from webapp.utils import S3Client


@login_required
def parking_history_list(request):

    s3_client = S3Client()
    parking_histories = ParkingHistory.objects.filter(user=request.user).order_by('-check_in')

    history_list = []
    for history in parking_histories:
        check_in_image_url = s3_client.urlize(history.image_check_in_key) if history.image_check_in_key else None
        check_out_image_url = s3_client.urlize(history.image_check_out_key) if history.image_check_out_key else None

        history_list.append({
            'id': history.id,
            'check_in': history.check_in,
            'check_out': history.check_out,
            'price': history.price,
            'license_number': history.license_number,
            'image_check_in_url': check_in_image_url,
            'image_check_out_url': check_out_image_url,
        })

    context = {
        'parking_histories': history_list
    }

    return render(request, 'webapp/vehicle/index.html', context)
