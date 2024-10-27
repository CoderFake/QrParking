#!/bin/sh

echo "Installing Gunicorn..."
pip install gunicorn==23.0.0

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
gunicorn smartparking.wsgi:application --workers 3 --bind 0.0.0.0:8000
