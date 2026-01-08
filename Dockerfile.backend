# Backend Only - Railway Deployment
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY java-migration-backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY java-migration-backend/ ./

# Create necessary directories
RUN mkdir -p /tmp/migrations /app/logs

# Set environment variables
ENV PYTHONPATH=/app
ENV WORK_DIR=/tmp/migrations
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8001

# Start the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]