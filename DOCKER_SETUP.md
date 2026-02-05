# Docker Setup Guide - Java Migration Accelerator

## Prerequisites

### 1. Install Docker Desktop
- **Windows 11 Pro/Enterprise/Education**: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- **Windows 10 Home**: Use [Docker Desktop WSL 2 backend](https://docs.docker.com/desktop/windows/install/)
- **Alternative**: Use [Rancher Desktop](https://rancherdesktop.io/) or [Podman](https://podman.io/)

### 2. System Requirements
- **RAM**: Minimum 4GB, recommended 8GB+
- **Disk Space**: 15-20GB for Docker images and containers
- **CPU**: 2+ cores recommended
- **OS**: Windows 10 (build 19041+) or Windows 11

### 3. Enable WSL 2 (Windows 10/11)
```powershell
# Run as Administrator
wsl --install
wsl --set-default-version 2
```

## Installation Steps

### Step 1: Install Docker Desktop
1. Download from [docker.com](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Choose WSL 2 backend during installation
4. Restart your computer
5. Verify installation:
```powershell
docker --version
docker run hello-world
```

### Step 2: Configure Environment Variables
Create/update `.env` file in project root:

```env
# Git Platform Tokens (REQUIRED for real repositories)
GITHUB_TOKEN=ghp_your_token_here
GITLAB_TOKEN=glpat_your_token_here
GITLAB_URL=https://gitlab.com

# Email Configuration (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SonarQube Configuration (Optional)
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your_sonar_token

# Application Settings
WORK_DIR=/tmp/migrations
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8001
AUTH_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Building the Docker Image

### Option 1: Using docker-compose (Recommended)

```powershell
cd c:\Users\MSI\java-migration-accelerator

# Build the image
docker-compose build

# Or build with specific tag
docker build -t java-migration-accelerator:1.0.0 .
```

### Option 2: Direct Docker build

```powershell
cd c:\Users\MSI\java-migration-accelerator

# Build with version tag
docker build -t java-migration-accelerator:1.0.0 -t java-migration-accelerator:latest .

# View build progress
docker build --progress=plain -t java-migration-accelerator:1.0.0 .
```

## Running the Container

### Option 1: Using docker-compose (Recommended)

```powershell
cd c:\Users\MSI\java-migration-accelerator

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f java-migration-app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Option 2: Direct Docker run

```powershell
# Run with environment file
docker run -d \
  --name java-migration-accelerator \
  -p 8001:8001 \
  --env-file .env \
  -v migrations_data:/tmp/migrations \
  -v app_logs:/app/logs \
  -v app_data:/app/data \
  --memory=4g \
  --cpus=2 \
  java-migration-accelerator:1.0.0

# View logs
docker logs -f java-migration-accelerator

# Stop container
docker stop java-migration-accelerator

# Remove container
docker rm java-migration-accelerator
```

### Option 3: Development Mode with volume mount

```powershell
# Mount local directories for development
docker run -d \
  --name java-migration-dev \
  -p 8001:8001 \
  -p 5173:5173 \
  --env-file .env \
  -v ${PWD}:/app \
  -v /app/node_modules \
  -v migrations_data:/tmp/migrations \
  -e NODE_ENV=development \
  java-migration-accelerator:1.0.0
```

## Accessing the Application

Once container is running:

- **Frontend**: http://localhost:5173 (or http://localhost:8001 if served from backend)
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## Creating a Tar File for Distribution

### Option 1: Export running container

```powershell
# Commit container to image
docker commit java-migration-accelerator java-migration-accelerator:1.0.0-exported

# Save image to tar file
docker save java-migration-accelerator:1.0.0 | gzip -c > java-migration-accelerator-1.0.0.tar.gz

# File size: ~800MB-1.2GB (compressed)
```

### Option 2: Direct save from image

```powershell
# Save image directly to tar
docker save java-migration-accelerator:1.0.0 | gzip -c > java-migration-accelerator-1.0.0.tar.gz

# Uncompressed tar file (larger)
docker save -o java-migration-accelerator-1.0.0.tar java-migration-accelerator:1.0.0

# File size: ~2-3GB (uncompressed)
```

### Verify tar file

```powershell
# Check tar file details
tar -tzf java-migration-accelerator-1.0.0.tar.gz | head -20

# Get tar file size
(Get-Item java-migration-accelerator-1.0.0.tar.gz).Length / 1GB
```

## Loading Tar File on Another Machine

### Step 1: Transfer tar file
```powershell
# Copy to another machine via USB, network, etc.
# File: java-migration-accelerator-1.0.0.tar.gz
```

### Step 2: Load image
```powershell
# Decompress and load
docker load -i java-migration-accelerator-1.0.0.tar.gz

# Or if using uncompressed tar
docker load -i java-migration-accelerator-1.0.0.tar

# Verify image loaded
docker images | grep java-migration-accelerator
```

### Step 3: Run container
```powershell
# Create .env file with tokens
# Then run container
docker-compose up -d

# Or
docker run -d \
  --name java-migration-accelerator \
  -p 8001:8001 \
  --env-file .env \
  -v migrations_data:/tmp/migrations \
  java-migration-accelerator:1.0.0
```

## Troubleshooting

### Docker build fails

```powershell
# Check Docker daemon
docker version

# Check available disk space
Get-Volume

# Build with verbose output
docker build --progress=plain -t java-migration-accelerator:1.0.0 .

# Check build logs
docker buildx du
```

### Container won't start

```powershell
# Check container logs
docker logs java-migration-accelerator

# Check container status
docker ps -a | grep java-migration-accelerator

# Inspect container
docker inspect java-migration-accelerator

# Check health
docker exec java-migration-accelerator curl -f http://localhost:8001/health
```

### Port already in use

```powershell
# Find process using port 8001
netstat -ano | findstr :8001

# Kill process (if PID is 12345)
taskkill /PID 12345 /F

# Or change port in docker-compose.yml
# Change "8001:8001" to "8002:8001"
```

### Memory issues

```powershell
# Increase Docker memory allocation
# Docker Desktop → Settings → Resources → Memory: increase to 4GB or more

# Check container resource usage
docker stats java-migration-accelerator
```

## Performance Optimization

### Build optimization
```powershell
# Use buildkit for faster builds
$env:DOCKER_BUILDKIT=1
docker build -t java-migration-accelerator:1.0.0 .
```

### Image size optimization
```powershell
# Check image size
docker image ls | grep java-migration-accelerator

# Check layer sizes
docker history java-migration-accelerator:1.0.0
```

## Common Commands

```powershell
# View all containers
docker ps -a

# View all images
docker images

# Remove image
docker rmi java-migration-accelerator:1.0.0

# Remove unused resources
docker system prune -a

# View container stats
docker stats java-migration-accelerator

# Execute command in container
docker exec java-migration-accelerator ls -la /app

# View environment variables
docker exec java-migration-accelerator env

# Check health
docker exec java-migration-accelerator curl -v http://localhost:8001/health
```

## Security Best Practices

1. **Use specific image tags**: Don't use `latest` in production
2. **Scan for vulnerabilities**: `docker scan java-migration-accelerator:1.0.0`
3. **Use secrets management**: Store tokens in secure .env or Docker secrets
4. **Limit resources**: Set memory and CPU limits (already done in docker-compose.yml)
5. **Read-only filesystem**: Consider using `--read-only` flag for production
6. **Non-root user**: Container should not run as root (add to Dockerfile if needed)

## Next Steps

1. Install Docker Desktop
2. Update `.env` file with your tokens
3. Build image: `docker build -t java-migration-accelerator:1.0.0 .`
4. Run with compose: `docker-compose up -d`
5. Access at http://localhost:8001
6. View logs: `docker-compose logs -f`

For more information, see [Docker Documentation](https://docs.docker.com/)
