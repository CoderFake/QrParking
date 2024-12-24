from django import forms
from django.contrib.auth.forms import UserChangeForm
from django.conf import settings
from .models import User


class UserChangeFormCustom(UserChangeForm):
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        user_instance = kwargs.get('instance')
        default_superuser_email = getattr(settings, 'DJANGO_SUPERUSER_EMAIL', None)

        if user_instance and self.user:
            if user_instance.pk == self.user.pk:
                restricted_fields = {'is_staff', 'is_superuser', 'status', 'email'}
                for field in restricted_fields:
                    if field in self.fields:
                        self.fields[field].widget = forms.HiddenInput()

            if user_instance.is_superuser and self.user.email != default_superuser_email:
                restricted_fields = {'is_staff', 'is_superuser', 'status'}
                for field in restricted_fields:
                    if field in self.fields:
                        self.fields[field].widget = forms.HiddenInput()

        if 'email' in self.fields:
            self.fields['email'].widget = forms.HiddenInput()

    class Meta:
        model = User
        fields = '__all__'
