# Generated by Django 5.1.2 on 2024-10-20 09:58

import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('account', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('order_code', models.CharField(max_length=50)),
                ('amount', models.DecimalField(decimal_places=0, max_digits=10)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', models.BooleanField(default=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('price', models.DecimalField(decimal_places=0, max_digits=10)),
                ('expired_at', models.DateTimeField(blank=True, null=True)),
                ('type', models.IntegerField(choices=[(1, 'Monthly Ticket'), (2, 'Daily Ticket')])),
                ('created_at', models.DateTimeField(auto_now=True)),
                ('qrcode', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_qrcode', to='account.qrcode')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('transaction_code', models.CharField(max_length=100, unique=True)),
                ('type', models.IntegerField(choices=[(1, 'Monthly Ticket'), (2, 'Daily Ticket'), (3, 'Deduct Ticket'), (4, 'Refund')])),
                ('method', models.CharField(max_length=100)),
                ('amount', models.DecimalField(decimal_places=0, max_digits=10)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', models.BooleanField(default=False)),
                ('order', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='transaction_order', to='payment.order')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transaction_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
