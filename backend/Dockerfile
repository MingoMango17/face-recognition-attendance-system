# Django Backend Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies including CMake for dlib
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        libopenblas-dev \
        liblapack-dev \
        libx11-dev \
        libgtk-3-dev \
        libboost-python-dev \
        libboost-system-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Create data directory for SQLite
RUN mkdir -p /app/data

# Create staticfiles directory
RUN mkdir -p /app/staticfiles

# Create a non-root user and set permissions
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Run the application (collectstatic will run in docker-compose command)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "your_project.wsgi:application"]