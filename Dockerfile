# Java Migration Accelerator - Simple Railway Build
FROM python:3.11-slim

# Install basic system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY java-migration-backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY java-migration-backend/ ./

# Copy frontend source code
COPY java-migration-frontend/ ./frontend/

# Build frontend (install Node.js if needed)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    cd frontend && \
    npm install && \
    npm run build && \
    cd .. && \
    rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /tmp/migrations /app/logs

# Set environment variables
ENV PYTHONPATH=/app
ENV WORK_DIR=/tmp/migrations
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8001

# Start the application
CMD ["python", "main.py"]
