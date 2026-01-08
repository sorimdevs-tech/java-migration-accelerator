# Java Migration Accelerator - Production Docker Build
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY java-migration-backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code
COPY java-migration-backend/ ./backend/

# Copy frontend source code and build
COPY java-migration-frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm ci --only=production && npm run build

# Return to app directory
WORKDIR /app

# Copy deployment scripts
COPY docker/start.sh ./start.sh
RUN chmod +x ./start.sh

# Create necessary directories
RUN mkdir -p /tmp/migrations /app/logs

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV WORK_DIR=/tmp/migrations
ENV PYTHONUNBUFFERED=1

# Expose ports
EXPOSE 8001 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Change ownership to app user
RUN chown -R app:app /app /tmp/migrations
USER app

# Start the application
CMD ["./start.sh"]
