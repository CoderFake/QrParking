from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from adminapp.admin import admin_site

urlpatterns = [
    path('admin/', admin_site.urls),
    path("", include("webapp.urls")),
    path("account/", include("account.urls")),
    path("payment/", include("payment.urls")),
    path("vehicle/", include("vehicle.urls")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
