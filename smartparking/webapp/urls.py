from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('/language-setting', views.language_setting, name='language_setting'),
]
