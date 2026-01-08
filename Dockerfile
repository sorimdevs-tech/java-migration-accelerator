# Multi-stage Docker build for Java Migration Accelerator

# Stage 1: Backend Build
FROM python:3.11-slim as backend-builder

WORKDIR /app/backend

# Install system dependencies for backend
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY java-migration-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY java-migration-backend/ .

# Stage 2: Frontend Build
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY java-migration-frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY java-migration-frontend/ .

# Build frontend
RUN npm run build

# Stage 3: Production Runtime
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

# Copy backend from builder stage
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

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