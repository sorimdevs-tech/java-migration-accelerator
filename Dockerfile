# Java Migration Accelerator - Railway Compatible Build
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy and install Python dependencies first
COPY java-migration-backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code
COPY java-migration-backend/ ./backend/

# Copy frontend and build it
COPY java-migration-frontend/ ./frontend/
WORKDIR /app/frontend

# Install frontend dependencies and build
RUN npm install && npm run build

# Return to app directory
WORKDIR /app

# Copy deployment scripts
COPY docker/start.sh ./start.sh
RUN chmod +x ./start.sh

# Create necessary directories
RUN mkdir -p /tmp/migrations /app/logs

# Set environment variables
ENV PYTHONPATH=/app/backend:/app
ENV WORK_DIR=/tmp/migrations
ENV PYTHONUNBUFFERED=1

# Expose ports
EXPOSE 8001 5173

# Change ownership to app user
RUN chown -R app:app /app /tmp/migrations

# Switch to app user
USER app

# Start the application
CMD ["./start.sh"]
