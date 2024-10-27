#!/bin/sh

echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput --no-post-process

echo "Setting permissions for static files..."
chown -R www-data:www-data /home/QrParking/smartparking/staticfiles

echo "Creating superuser and site..."
python create_superuser_and_site.py

echo "Starting Gunicorn server..."
python manage.py runserver 0.0.0.0:8000