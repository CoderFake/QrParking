from django.urls import path
from . import views

urlpatterns = [
    path('parking-history/', views.parking_history_list, name='parking_history'),
]