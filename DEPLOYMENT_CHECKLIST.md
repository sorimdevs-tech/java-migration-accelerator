# Deployment Checklist - Java Migration Accelerator

## ✅ Pre-Deployment Checklist

### System Requirements
- [ ] Windows 10 (build 19041+) or Windows 11
- [ ] 8GB+ RAM available
- [ ] 20GB+ free disk space
- [ ] 2+ CPU cores
- [ ] Stable internet connection

### Software Installation
- [ ] Docker Desktop installed from docker.com
- [ ] Docker daemon running (check: `docker --version`)
- [ ] Git installed (for cloning repos during migration)
- [ ] PowerShell 5.1+ (for build scripts)

### Configuration Files
- [ ] `.env` file created with required tokens
  - [ ] GITHUB_TOKEN populated (or GITLAB_TOKEN)
  - [ ] SMTP credentials configured (optional)
  - [ ] SonarQube token configured (optional)
  - [ ] FOSSA API key configured (optional)

### Source Code
- [ ] Repository cloned/pulled to latest main branch
- [ ] All files present in root directory:
  - [ ] Dockerfile (89+ lines)
  - [ ] docker-compose.yml (100+ lines)
  - [ ] .env or .env.example
  - [ ] requirements.txt (backend)
  - [ ] package.json (frontend)

## 🔨 Build Preparation

### Verify Build Files
```powershell
# Check Dockerfile
Test-Path Dockerfile
Get-Content Dockerfile | Measure-Object -Line

# Check docker-compose.yml
Test-Path docker-compose.yml
Get-Content docker-compose.yml | Measure-Object -Line

# Check .env
Test-Path .env
```

### Backend Files Check
```powershell
# Verify backend path structure
Test-Path "java-migration-backend\Java_Migration_Accelerator_backend\java-migration-backend\requirements.txt"
Test-Path "java-migration-backend\Java_Migration_Accelerator_backend\java-migration-backend\main.py"
Test-Path "java-migration-backend\Java_Migration_Accelerator_backend\java-migration-backend\services\migration_service.py"
```

### Frontend Files Check
```powershell
# Verify frontend files
Test-Path "package.json"
Test-Path "tsconfig.json"
Test-Path "vite.config.ts"
Test-Path "src\main.tsx"
```

## 🏗️ Build Execution

### Method 1: Automated Build (Recommended)
```powershell
# Run PowerShell build script
.\build-docker.ps1

# Or with specific options
.\build-docker.ps1 -BuildType 1 -CreateTar $true -TestContainer $true

# Script will:
# ✓ Check Docker installation
# ✓ Verify Docker daemon
# ✓ Create .env template if missing
# ✓ Build Docker image
# ✓ Create tar.gz for distribution
# ✓ Test container
# ✓ Display summary
```

### Method 2: Batch Build Script
```powershell
.\build-docker.bat

# Interactive prompts for build options
```

### Method 3: Manual Docker Build
```powershell
cd c:\Users\MSI\java-migration-accelerator

# Clean old images
docker system prune -a

# Build image
docker build -t java-migration-accelerator:1.0.0 -t java-migration-accelerator:latest .

# Verify build
docker images | grep java-migration-accelerator

# Create tar file
docker save java-migration-accelerator:1.0.0 | gzip -c > java-migration-accelerator-1.0.0.tar.gz
```

## ✨ Post-Build Verification

### Image Verification
- [ ] Image built successfully (check: `docker images`)
- [ ] Image size reasonable (800MB-1.2GB)
- [ ] Image layers correct:
  - [ ] Node.js build layer present
  - [ ] Python runtime layer present
  - [ ] System dependencies installed
  - [ ] Health check configured

### Tar File Verification
- [ ] Tar file created (if enabled)
- [ ] Tar file size 800MB-1.2GB (compressed)
- [ ] File accessible and readable
- [ ] Tar file can be extracted (test on sample machine)

### Container Test
- [ ] Container started successfully
- [ ] Container running without errors
- [ ] Health check passed
- [ ] Logs show no critical errors
- [ ] API responsive on port 8001
- [ ] Frontend accessible

## 🚀 Deployment Steps

### Local Deployment
```powershell
# 1. Update environment
cp .env .env.backup  # Backup current .env
# Edit .env with deployment tokens

# 2. Start services
docker-compose up -d

# 3. Verify deployment
docker ps  # Should show java-migration-app running

# 4. Check health
curl http://localhost:8001/health  # Should return OK

# 5. Access application
# Frontend: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

### Verification Checklist
- [ ] Container is running: `docker ps | grep java-migration-accelerator`
- [ ] Port 8001 is listening: `netstat -ano | findstr :8001`
- [ ] Health check passing: `docker exec java-migration-app curl http://localhost:8001/health`
- [ ] Logs show no errors: `docker logs java-migration-app`
- [ ] Frontend loads: `curl http://localhost:8001`
- [ ] API docs accessible: `curl http://localhost:8001/docs`

## 🔧 Production Deployment

### Pre-Production Checklist
- [ ] All sensitive data in .env (not in code)
- [ ] GITHUB_TOKEN with appropriate scopes
- [ ] SMTP credentials verified
- [ ] SonarQube integration tested (if enabled)
- [ ] Database/storage volumes configured
- [ ] Logging configured and tested
- [ ] Backups strategy in place

### Production Configuration
```bash
# .env for production should include:
GITHUB_TOKEN=<production-token>
GITLAB_TOKEN=<production-token>
SMTP_SERVER=<production-smtp>
SMTP_USERNAME=<production-email>
SMTP_PASSWORD=<production-password>
SONARQUBE_URL=<production-sonarqube>
NODE_ENV=production
WORK_DIR=/mnt/migrations  # Persistent storage
```

### Production Deployment
```powershell
# 1. Load image from tar file
docker load -i java-migration-accelerator-1.0.0.tar.gz

# 2. Deploy using compose
docker-compose up -d

# 3. Monitor deployment
docker stats
docker logs -f java-migration-app

# 4. Verify all endpoints
curl http://localhost:8001/health
curl http://localhost:8001/docs
```

## 📊 Monitoring & Maintenance

### Container Monitoring
```powershell
# Real-time resource usage
docker stats java-migration-accelerator

# View recent logs
docker logs --tail 50 java-migration-accelerator

# Follow logs
docker logs -f java-migration-accelerator

# Check container status
docker inspect java-migration-accelerator
```

### Health Checks
```powershell
# Manual health check
docker exec java-migration-accelerator curl -f http://localhost:8001/health

# Check API endpoints
curl http://localhost:8001/docs
curl http://localhost:8001/api/migration/start

# Verify database connectivity
docker exec java-migration-accelerator python -c "import sqlite3"
```

### Maintenance Tasks
- [ ] Regular log review (weekly)
- [ ] Disk space monitoring (weekly)
- [ ] Security updates (monthly)
- [ ] Backup volumes (daily)
- [ ] Performance monitoring (continuous)

## 🆘 Troubleshooting Checklist

### Build Failures
- [ ] Check Docker version: `docker --version`
- [ ] Verify disk space: `Get-Volume`
- [ ] Clear Docker cache: `docker system prune -a`
- [ ] Check build logs: `docker buildx du`
- [ ] Rebuild with verbose: `docker build --progress=plain ...`

### Runtime Failures
- [ ] Check logs: `docker logs java-migration-accelerator`
- [ ] Verify .env: `Test-Path .env`
- [ ] Test health: `curl http://localhost:8001/health`
- [ ] Check ports: `netstat -ano | findstr :8001`
- [ ] Restart service: `docker-compose restart`

### Connectivity Issues
- [ ] Verify network: `docker inspect java-migration-accelerator | Select-String NetworkSettings`
- [ ] Check DNS: `docker exec java-migration-accelerator nslookup github.com`
- [ ] Test GitHub token: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`

## 📝 Deployment Log

Record deployment details for future reference:

```
Date: _______________
Time: _______________
Environment: (Local / Production / Staging)
Build Script Used: (Automated / Manual)
Tar File: _______________
Docker Version: _______________
Build Duration: _______________
Test Result: (Pass / Fail)
Deployment Status: (Success / Partial / Failed)
Issues Encountered: _______________
Resolution: _______________
Notes: _______________
```

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Docker image builds without errors
- ✅ Container starts successfully
- ✅ Health check endpoint responds with 200 OK
- ✅ Frontend loads at http://localhost:8001
- ✅ API documentation available at http://localhost:8001/docs
- ✅ Repository analysis endpoints respond correctly
- ✅ No critical errors in logs
- ✅ Container stays running without restarts
- ✅ Response times acceptable (<500ms for endpoints)
- ✅ Resource usage within limits (CPU <2 cores, Memory <4GB)

## 📚 Quick Reference Links

- [Docker Setup Guide](DOCKER_SETUP.md)
- [Docker Quick Reference](DOCKER_QUICK_REFERENCE.md)
- [README.md](README.md)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Support

For issues or questions:
1. Check [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md) troubleshooting section
2. Review container logs: `docker logs java-migration-accelerator`
3. Check Docker daemon status: `docker info`
4. Verify system resources: `Get-Volume`, `wmic logicaldisk get name,freespace`
5. Consult Docker documentation: https://docs.docker.com/

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintainer**: Java Migration Accelerator Team
