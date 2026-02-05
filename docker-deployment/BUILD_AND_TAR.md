# 🐳 Docker Tar File Build Guide for Java Migration Accelerator

## Overview
This guide explains how to build and export the Java Migration Accelerator as a Docker tar file that can be deployed on any system without requiring the application source code.

## Prerequisites
- Docker 20.10+ installed and running
- 10GB+ free disk space
- 4GB+ RAM available

## Step 1: Build the Docker Image

From the project root directory:

```bash
# Build the Docker image
docker build -t java-migration-accelerator:latest -f Dockerfile .
```

**Build Time**: 8-15 minutes (first build), depends on internet speed

## Step 2: Export Docker Image as Tar File

Create a tar archive of the built image:

```bash
# Export as tar file (single compressed file ~2.5GB)
docker save java-migration-accelerator:latest | gzip > java-migration-accelerator-latest.tar.gz

# OR without compression (faster, larger ~4GB)
docker save java-migration-accelerator:latest > java-migration-accelerator-latest.tar
```

**File Size**:
- With gzip compression: ~2.5GB
- Without compression: ~4GB

## Step 3: Prepare Deployment Package

The deployment directory includes:
- `java-migration-accelerator-latest.tar.gz` - The Docker image
- `docker-compose.yml` - Container orchestration
- `.env.example` - Environment configuration template
- `DEPLOY.md` - Deployment instructions
- `load-image.sh` / `load-image.ps1` - Image loading scripts
- `start-app.sh` / `start-app.ps1` - Application startup scripts

## Step 4: Transfer Tar File to Target System

```bash
# Option 1: Copy via SCP (Linux/Mac)
scp java-migration-accelerator-latest.tar.gz user@target-system:/path/to/deployment

# Option 2: Copy via USB/External drive
# Simply copy the tar file to external storage

# Option 3: Upload to cloud storage
# AWS S3, Google Drive, Azure Blob Storage, etc.
```

## Step 5: Load Image on Target System

On the target system:

### Linux/Mac
```bash
cd /path/to/deployment
./load-image.sh
```

### Windows (PowerShell)
```powershell
cd C:\path\to\deployment
.\load-image.ps1
```

**Loading Time**: 5-10 minutes depending on system speed

## Step 6: Start the Application

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Using Docker Directly
```bash
docker run -d \
  -p 8001:8001 \
  --name java-migration-app \
  java-migration-accelerator:latest
```

## Access the Application

- **Frontend**: http://localhost:5173 (within container, proxied through port 8001)
- **Backend API**: http://localhost:8001/api
- **API Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## Environment Configuration

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# GitHub/GitLab Tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITLAB_TOKEN=glpat_xxxxxxxxxxxxx

# Email Configuration (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SonarQube (Optional)
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your-token
```

Load environment:
```bash
# Linux/Mac
export $(cat .env | xargs)
docker-compose up -d

# Windows PowerShell
Get-Content .env | ForEach-Object { $name, $value = $_ -split '='; [Environment]::SetEnvironmentVariable($name, $value) }
docker-compose up -d
```

## Verification

Check if the application is running:

```bash
# View running containers
docker ps

# Check logs
docker logs java-migration-app -f

# Test API
curl http://localhost:8001/health

# Test frontend (should return HTML)
curl http://localhost:8001
```

## Troubleshooting

### Image fails to load
```bash
# Check available space
df -h  # Linux/Mac
Get-Volume  # Windows

# Increase Docker storage if needed
docker system prune -a  # Clean up old images
```

### Application won't start
```bash
# Check logs
docker logs java-migration-app

# Check port conflicts
docker ps | grep 8001

# Try with different port
docker run -p 9001:8001 java-migration-accelerator:latest
```

### Memory/CPU issues
```bash
# Reduce resource limits in docker-compose.yml
# Or increase Docker resources in Docker Desktop settings
```

## File Transfer Examples

### Using gzip compression (recommended for large transfers)
```bash
# Compress
docker save java-migration-accelerator:latest | gzip -9 > app.tar.gz

# Transfer via curl
curl -X POST -F "file=@app.tar.gz" https://target-system/upload

# Or via sftp
sftp user@target-system
put app.tar.gz
quit
```

### Using split for large files
```bash
# Split tar into chunks (e.g., 1GB each)
docker save java-migration-accelerator:latest | split -b 1G - app.tar.

# On target, rejoin
cat app.tar.* | docker load

# Or combine and gzip
cat app.tar.* | gzip > app.tar.gz
docker load < app.tar.gz
```

## Performance Tips

1. **Build optimization**: Use `--cache-from` if building multiple versions
   ```bash
   docker build --cache-from java-migration-accelerator:latest \
     -t java-migration-accelerator:v2 -f Dockerfile .
   ```

2. **Loading optimization**: Use multithreaded gzip
   ```bash
   docker save image | pigz -p 8 > image.tar.gz  # 8 threads
   pigz -d image.tar.gz  # Faster decompression
   ```

3. **Network optimization**: Use `--progress=plain` for better logs
   ```bash
   docker build --progress=plain -t java-migration-accelerator:latest .
   ```

## Security Notes

- 🔐 Keep `.env` file secure (contains sensitive tokens)
- 🔒 Don't commit `.env` to git
- 🛡️ Use environment-specific secrets management in production
- 📋 Review `Dockerfile` before deployment

## Support

For issues or questions:
- Check `DEPLOY.md`
- Review Docker logs: `docker logs java-migration-app`
- Visit: https://github.com/yourusername/java-migration-accelerator/issues

---

**Ready to deploy! Follow DEPLOY.md on the target system.**
