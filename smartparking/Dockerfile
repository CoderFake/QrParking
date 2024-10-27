# Base image
FROM python:3.12

# Create directory
RUN mkdir -p /home/QrParking/smartparking

# Set work directory
WORKDIR /home/QrParking/smartparking

# Install dependencies
ADD requirements.txt /home/QrParking/smartparking
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
ADD . /home/QrParking/smartparking

# Base image
FROM python:3.12

# Create directory
RUN mkdir -p /home/QrParking/smartparking

# Set work directory
WORKDIR /home/QrParking/smartparking

# Install dependencies
ADD requirements.txt /home/QrParking/smartparking
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
ADD . /home/QrParking/smartparking

# Add shell permission
RUN chmod -R +x /home/QrParking/smartparking/shell

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
