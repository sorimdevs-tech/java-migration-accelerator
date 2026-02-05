# Docker Quick Reference - Java Migration Accelerator

## 🚀 Quick Start (After Docker Desktop Installation)

### 1. Build Docker Image
```powershell
cd c:\Users\MSI\java-migration-accelerator

# Use PowerShell script (recommended)
.\build-docker.ps1

# Or use batch script
build-docker.bat

# Or direct Docker command
docker build -t java-migration-accelerator:1.0.0 .
```

### 2. Run with Docker Compose
```powershell
# Update .env with your GitHub token
# Then run:
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 3. Access Application
- **Frontend/Backend**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

---

## 📦 Creating Tar File for Distribution

### Option 1: Using build script
```powershell
.\build-docker.ps1 -CreateTar $true
```

### Option 2: Manual tar creation
```powershell
# Compressed (recommended - ~800MB-1.2GB)
docker save java-migration-accelerator:1.0.0 | gzip -c > java-migration-accelerator-1.0.0.tar.gz

# Uncompressed (larger - ~2-3GB)
docker save -o java-migration-accelerator-1.0.0.tar java-migration-accelerator:1.0.0
```

### Load Tar on Another Machine
```powershell
# From tar.gz
docker load -i java-migration-accelerator-1.0.0.tar.gz

# From tar
docker load -i java-migration-accelerator-1.0.0.tar

# Verify
docker images | grep java-migration-accelerator

# Run
docker-compose up -d
```

---

## 🔧 Common Commands

### Build & Image Management
```powershell
# Build image
docker build -t java-migration-accelerator:1.0.0 .

# List images
docker images

# Remove image
docker rmi java-migration-accelerator:1.0.0

# Remove unused resources
docker system prune -a

# View image history
docker history java-migration-accelerator:1.0.0
```

### Container Management
```powershell
# View running containers
docker ps

# View all containers
docker ps -a

# Stop container
docker stop java-migration-accelerator

# Start container
docker start java-migration-accelerator

# Remove container
docker rm java-migration-accelerator

# View container logs
docker logs java-migration-accelerator

# Real-time logs
docker logs -f java-migration-accelerator

# Last 100 lines
docker logs --tail 100 java-migration-accelerator
```

### Container Inspection
```powershell
# Inspect container
docker inspect java-migration-accelerator

# Execute command
docker exec java-migration-accelerator ls -la /app

# Interactive shell
docker exec -it java-migration-accelerator /bin/bash

# View environment variables
docker exec java-migration-accelerator env

# Check resource usage
docker stats java-migration-accelerator
```

### Docker Compose Commands
```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f java-migration-app

# Build images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Restart service
docker-compose restart java-migration-app

# Execute command in service
docker-compose exec java-migration-app curl http://localhost:8001/health

# View running services
docker-compose ps
```

---

## 🐛 Troubleshooting

### Docker not found
```powershell
# Check if Docker is installed
docker --version

# Add Docker to PATH or use full path
"C:\Program Files\Docker\Docker\resources\bin\docker" --version

# Or install Docker Desktop
```

### Port already in use
```powershell
# Find process using port 8001
netstat -ano | findstr :8001

# Kill process (replace 12345 with PID)
taskkill /PID 12345 /F

# Or change port in docker-compose.yml
# Change "8001:8001" to "8002:8001"
```

### Container won't start
```powershell
# Check container logs
docker logs java-migration-accelerator

# Inspect container
docker inspect java-migration-accelerator

# Check health
docker exec java-migration-accelerator curl -f http://localhost:8001/health

# Restart Docker daemon
# Docker Desktop → Restart
```

### Build fails
```powershell
# Check disk space
Get-Volume

# Increase Docker memory
# Docker Desktop → Settings → Resources → Memory: 4GB+

# Clear Docker cache and rebuild
docker system prune -a
docker build --no-cache -t java-migration-accelerator:1.0.0 .

# Check build logs
docker buildx du
```

### Memory issues
```powershell
# Check resource usage
docker stats

# View container memory limit
docker inspect java-migration-accelerator | Select-String Memory

# Stop and increase allocation
docker-compose down
# Docker Desktop → Settings → Resources → Memory: 4GB or more
docker-compose up -d
```

### Health check failing
```powershell
# Check if backend is responding
docker exec java-migration-accelerator curl -v http://localhost:8001/health

# Check logs
docker logs java-migration-accelerator

# Increase timeout in docker-compose.yml if needed
```

---

## 📊 Performance Optimization

### Build Optimization
```powershell
# Enable BuildKit (faster builds)
$env:DOCKER_BUILDKIT=1
docker build -t java-migration-accelerator:1.0.0 .
```

### Image Size
```powershell
# Check image size
docker images java-migration-accelerator

# View layer sizes
docker history java-migration-accelerator:1.0.0

# Remove unused images
docker image prune

# Remove dangling images
docker image prune -a
```

### Container Performance
```powershell
# Monitor resource usage
docker stats java-migration-accelerator

# Limit resources
docker run --memory=4g --cpus=2 ...

# Check memory usage
docker exec java-migration-accelerator free -h

# Check CPU usage
docker exec java-migration-accelerator top -b -n 1
```

---

## 🔐 Security Tips

1. **Always use specific tags**, never `:latest` in production
2. **Scan for vulnerabilities**: `docker scan java-migration-accelerator:1.0.0`
3. **Keep .env secure** - add to .gitignore
4. **Use secrets management** for production deployments
5. **Set resource limits** (already in docker-compose.yml)
6. **Run container as non-root** (add to Dockerfile if needed)
7. **Use read-only filesystem** for critical data

---

## 📝 Configuration Files

### .env File
Required environment variables - create/update before running:
```bash
GITHUB_TOKEN=ghp_...
GITLAB_TOKEN=glpat_...
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_password
```

### docker-compose.yml
Main orchestration file - defines services, volumes, networks

### Dockerfile
Multi-stage build:
- Stage 1: Node frontend builder
- Stage 2: Python backend with system dependencies

---

## 🚀 Deployment Scenarios

### Local Development
```powershell
docker-compose up -d
# Access at http://localhost:8001
```

### Testing
```powershell
docker build -t java-migration-accelerator:test .
docker run -p 8001:8001 java-migration-accelerator:test
```

### Production (with tar file)
```powershell
# On production machine
docker load -i java-migration-accelerator-1.0.0.tar.gz
docker-compose up -d
```

### Cloud Deployment (Railway, Render, etc.)
```bash
# Push to registry
docker tag java-migration-accelerator:1.0.0 registry.com/java-migration:1.0.0
docker push registry.com/java-migration:1.0.0

# Cloud provider pulls and runs from registry
```

---

## 📚 More Information

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **FastAPI Docker**: https://fastapi.tiangolo.com/deployment/docker/
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/

---

**For detailed setup instructions, see: [DOCKER_SETUP.md](DOCKER_SETUP.md)**
