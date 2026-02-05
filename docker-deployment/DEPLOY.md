# 🚀 Deploy Java Migration Accelerator from Docker Tar File

## Quick Start (All Systems)

### Step 1: Load Docker Image (Choose your platform)

**Linux/Mac:**
```bash
chmod +x load-image.sh
./load-image.sh
```

**Windows (PowerShell):**
```powershell
.\load-image.ps1
```

### Step 2: Configure Environment

```bash
# Copy example configuration
cp .env.example .env

# Edit with your tokens
nano .env          # Linux/Mac
notepad .env       # Windows
```

**Required Configuration:**
```env
# Get from GitHub/GitLab
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITLAB_TOKEN=glpat_xxxxxxxxxxxxx

# Optional: Email notifications
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 3: Start Application

**Using Docker Compose (Recommended):**
```bash
docker-compose up -d
```

**Linux/Mac Script:**
```bash
chmod +x start-app.sh
./start-app.sh -d    # Background mode
./start-app.sh       # Foreground (shows logs)
```

**Windows PowerShell:**
```powershell
.\start-app.ps1 -d   # Background mode
.\start-app.ps1      # Foreground (shows logs)
```

**Direct Docker Command:**
```bash
docker run -d \
  -p 8001:8001 \
  --name java-migration-app \
  --env-file .env \
  -v migrations_data:/tmp/migrations \
  java-migration-accelerator:latest
```

## Access the Application

| Component | URL |
|-----------|-----|
| **Frontend Dashboard** | http://localhost:8001 |
| **API Documentation** | http://localhost:8001/docs |
| **Health Check** | http://localhost:8001/health |
| **OpenAPI Spec** | http://localhost:8001/openapi.json |

## Verification

Check if everything is working:

```bash
# View running containers
docker ps

# Check application logs
docker logs java-migration-app -f

# Test API
curl http://localhost:8001/health

# See container details
docker inspect java-migration-app
```

## System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **Disk Space** | 5GB | 10GB |
| **RAM** | 2GB | 4GB |
| **CPU** | 1 core | 2+ cores |
| **Docker Version** | 20.10+ | 25.0+ |

## Troubleshooting

### "Docker image not found"
```bash
# Verify image was loaded
docker image ls | grep java-migration

# Re-run load script
./load-image.sh  # Linux/Mac
.\load-image.ps1 # Windows
```

### "Port 8001 already in use"
```bash
# Find process using port
lsof -i :8001          # Linux/Mac
Get-Process -Id (Get-NetTCPConnection -LocalPort 8001).OwningProcess  # Windows

# Use different port
docker run -p 9001:8001 java-migration-accelerator:latest

# Or stop existing container
docker stop java-migration-app
```

### "Cannot connect to Docker daemon"
```bash
# Start Docker service
# Linux (systemd):
sudo systemctl start docker

# Mac: Start Docker Desktop app

# Windows: Start Docker Desktop app
```

### "Out of memory" errors
```bash
# Increase Docker memory limits
# Docker Desktop → Preferences/Settings → Resources → Memory

# Or reduce via docker-compose.yml:
# Reduce: cpus: '2' → cpus: '1'
#         memory: 4G → memory: 2G
```

### "Git/Maven not found in container"
The container includes all required tools. If you see errors:
```bash
# Rebuild image with all dependencies
docker image rm java-migration-accelerator:latest
docker build -t java-migration-accelerator:latest -f Dockerfile .
```

## Common Operations

### View Real-time Logs
```bash
docker logs java-migration-app -f
```

### Stop Application
```bash
docker-compose down      # With docker-compose
docker stop java-migration-app  # Direct Docker
```

### Restart Application
```bash
docker restart java-migration-app
```

### Remove Application & Data
```bash
docker stop java-migration-app
docker rm java-migration-app
docker volume rm migrations_data app_logs app_data
```

### Access Container Shell
```bash
docker exec -it java-migration-app /bin/bash
```

### Check Container Stats
```bash
docker stats java-migration-app
```

## Data Persistence

Application data is stored in Docker volumes:

| Volume | Purpose |
|--------|---------|
| `migrations_data` | Migration job files |
| `app_logs` | Application logs |
| `app_data` | Application state |

**Backup volumes:**
```bash
docker run --rm -v migrations_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/migrations-backup.tar.gz -C /data .
```

**Restore volumes:**
```bash
docker run --rm -v migrations_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/migrations-backup.tar.gz -C /data
```

## Network Configuration

### Expose to External Network
```bash
# Allow external access (use with caution)
docker run -p 0.0.0.0:8001:8001 java-migration-accelerator:latest
```

### Use Custom Network
```bash
docker network create migration-net
docker run --network migration-net java-migration-accelerator:latest
```

## Performance Tuning

### Enable BuildKit for Faster Builds (if rebuilding)
```bash
DOCKER_BUILDKIT=1 docker build -t java-migration-accelerator:latest .
```

### Optimize Resource Usage
Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'      # Limit to 1 CPU
      memory: 2G     # Limit to 2GB RAM
```

## Production Deployment

For production use:

1. **Use Docker secrets** instead of .env
2. **Enable HTTPS** with reverse proxy (nginx, Traefik)
3. **Set resource limits** in docker-compose.yml
4. **Configure logging** to external service
5. **Use volume backups** for migrations_data
6. **Enable health checks** (already configured)
7. **Monitor with Docker stats** or Prometheus

Example production setup:
```yaml
# Use secrets
docker secret create app_env .env

# Run with health checks
docker run \
  --name java-migration-app \
  --health-cmd='curl -f http://localhost:8001/health || exit 1' \
  --health-interval=30s \
  --health-retries=3 \
  java-migration-accelerator:latest
```

## Next Steps

1. ✅ Load Docker image
2. ✅ Configure .env file
3. ✅ Start application
4. 🔗 Visit http://localhost:8001
5. 🔑 Add GitHub/GitLab tokens in UI
6. 🚀 Start your first migration!

## Support & Documentation

- **API Docs**: http://localhost:8001/docs
- **GitHub Issues**: https://github.com/yourusername/java-migration-accelerator
- **FAQs**: See BUILD_AND_TAR.md for detailed build information

---

**Questions?** Check the logs: `docker logs java-migration-app -f`
