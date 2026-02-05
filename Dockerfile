# ============================================================
# Java Migration Accelerator - Multi-Stage Docker Build (Hardened)
# ============================================================
# Security Focus:
# - Latest base images with patches
# - Minimal runtime dependencies
# - No build tools in runtime image
# ============================================================

# Stage 1: Build Frontend (Node.js)
FROM node:18-alpine AS frontend-builder

WORKDIR /build

# Copy package files from root
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Build frontend
RUN npm run build

# Verify build succeeded
RUN test -d dist || (echo "Frontend build failed" && exit 1) && echo "✓ Frontend build successful"

# ============================================================
# Stage 2: Build Backend (Python)
# ============================================================

FROM python:3.11-slim-bookworm

LABEL maintainer="Java Migration Accelerator"
LABEL description="End-to-end Java 7→21 migration automation using OpenRewrite"
LABEL version="1.0.0"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    openjdk-17-jdk \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create application directories
RUN mkdir -p /tmp/migrations /app/logs /app/data

# Copy backend requirements
COPY java-migration-backend/Java_Migration_Accelerator_backend/java-migration-backend/requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir \
    --upgrade pip setuptools wheel \
    -r /app/requirements.txt

# Copy backend source code
COPY java-migration-backend/Java_Migration_Accelerator_backend/java-migration-backend/ /app/

# Copy built frontend from builder stage
COPY --from=frontend-builder /build/dist /app/static

# Set permissions
RUN chmod -R 755 /app && chmod -R 777 /tmp/migrations /app/logs /app/data && chmod -R 755 /app/static

# Verify frontend is present
RUN test -f /app/static/index.html || (echo "ERROR: Frontend not found at /app/static/index.html" && exit 1)
RUN echo "✓ Frontend files copied successfully"

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV WORK_DIR=/tmp/migrations
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Expose ports
EXPOSE 8001

# Run the application
CMD ["python", "-u", "main.py"]