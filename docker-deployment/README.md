# 🐳 Docker Deployment Package - Java Migration Accelerator

This directory contains everything you need to deploy the Java Migration Accelerator application using Docker tar files on any system.

## 📦 Package Contents

```
docker-deployment/
├── README.md                                  # This file
├── BUILD_AND_TAR.md                          # Detailed tar build guide
├── DEPLOY.md                                 # Complete deployment instructions
├── docker-compose.yml                        # Docker Compose configuration
├── .env.example                              # Environment variables template
├── load-image.sh                             # Linux/Mac script to load Docker image
├── load-image.ps1                            # Windows PowerShell script
├── start-app.sh                              # Linux/Mac startup script
├── start-app.ps1                             # Windows startup script
└── build-tar.sh                              # Script to build tar file (Linux/Mac)
```

## 🚀 Quick Start

### For Linux/Mac Users

```bash
# 1. Load the Docker image
chmod +x load-image.sh
./load-image.sh

# 2. Configure environment
cp .env.example .env
# Edit .env with your GitHub/GitLab tokens
nano .env

# 3. Start the application
chmod +x start-app.sh
./start-app.sh -d

# 4. Access at http://localhost:8001
```

### For Windows Users

```powershell
# 1. Load the Docker image
.\load-image.ps1

# 2. Configure environment
Copy-Item .env.example .env
# Edit .env with your GitHub/GitLab tokens
notepad .env

# 3. Start the application
.\start-app.ps1 -d

# 4. Access at http://localhost:8001
```

## 🏗️ How to Build the Tar File (Original System)

### From Project Root

```bash
# 1. Build the Docker image
docker build -t java-migration-accelerator:latest -f Dockerfile .

# 2. Export as compressed tar file
docker save java-migration-accelerator:latest | gzip > java-migration-accelerator-latest.tar.gz

# 3. OR export without compression (for faster loading)
docker save java-migration-accelerator:latest > java-migration-accelerator-latest.tar

# 4. Copy tar file to deployment directory
cp java-migration-accelerator-latest.tar.gz docker-deployment/
```

### Or Using Provided Script (Linux/Mac)

```bash
# From project root
chmod +x docker-deployment/build-tar.sh
./docker-deployment/build-tar.sh
```

**Output Files:**
- `java-migration-accelerator-latest.tar.gz` (~2.5GB) - Compressed version
- `java-migration-accelerator-latest.tar` (~4GB) - Uncompressed version

## 📋 System Requirements

| Component | Requirement |
|-----------|------------|
| **OS** | Linux, macOS, Windows (Docker Desktop) |
| **Docker** | 20.10+ (25.0+ recommended) |
| **Docker Compose** | 1.29+ (optional, for docker-compose.yml) |
| **Disk Space** | 10GB+ (for image + migrations) |
| **RAM** | 4GB+ (2GB minimum) |
| **CPU** | 2+ cores (1 core minimum) |

## 🎯 Deployment Workflow

### Step 1: Prepare Tar File
```bash
# On source system where docker image is built
docker build -t java-migration-accelerator:latest .
docker save java-migration-accelerator:latest | gzip > app.tar.gz
```

### Step 2: Transfer Tar File
```bash
# Copy to target system via:
# - SCP: scp app.tar.gz user@target:/path/
# - FTP/SFTP
# - USB drive
# - Cloud storage (S3, Drive, etc.)
```

### Step 3: Load on Target System
```bash
# Linux/Mac
./load-image.sh

# Windows
.\load-image.ps1
```

### Step 4: Configure & Run
```bash
# All systems
cp .env.example .env
# Edit .env with tokens
docker-compose up -d
```

## 🔧 Configuration

### Essential Configuration (.env)

```env
# GitHub token (for accessing repos)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# GitLab token (for GitLab repos)
GITLAB_TOKEN=glpat_xxxxxxxxxxxxx

# Email notifications (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-password
```

### Optional Configuration

```env
# SonarQube (for code quality)
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=token

# FOSSA (for security scanning)
FOSSA_API_KEY=key

# API endpoints
BACKEND_URL=http://localhost:8001
FRONTEND_URL=http://localhost:8001
```

## 🌐 Access Points

Once running:

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:8001 | Web UI for migrations |
| **API Docs** | http://localhost:8001/docs | Interactive API documentation |
| **OpenAPI** | http://localhost:8001/openapi.json | OpenAPI specification |
| **Health** | http://localhost:8001/health | Health check endpoint |

## 📊 Included Features

✅ **Java Version Migrations** - 7→8→11→17→21
✅ **Framework Upgrades** - Spring Boot 2→3, JUnit 4→5
✅ **Code Quality** - Null safety, performance improvements
✅ **Multi-Platform** - GitHub & GitLab support
✅ **Quality Reports** - HTML reports + metrics
✅ **Email Integration** - Migration summaries
✅ **SonarQube Integration** - Code quality analysis
✅ **Security Scanning** - Dependency analysis

## 🆘 Troubleshooting

### Docker image not found
```bash
./load-image.sh     # Re-run load script
docker image ls     # Verify image exists
```

### Port 8001 already in use
```bash
# Edit docker-compose.yml or use different port:
docker run -p 9001:8001 java-migration-accelerator:latest
```

### Memory issues
```bash
# Reduce resource limits in docker-compose.yml
# Or increase Docker memory allocation
```

### Gradle/Maven not found
```bash
# Container includes all tools. If missing:
docker exec java-migration-app apt-get update && apt-get install -y maven gradle
```

For more troubleshooting, see **DEPLOY.md**.

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit .env to git** - Add to .gitignore
2. **Keep tokens secure** - Use GitHub/GitLab scoped tokens
3. **Use HTTPS in production** - Set up reverse proxy (nginx)
4. **Backup volumes regularly** - `migrations_data`, `app_logs`, `app_data`
5. **Monitor logs** - `docker logs java-migration-app -f`
6. **Use secrets management** - For production deployments

## 📈 Performance Optimization

### For Better Build Speed
```bash
# Use BuildKit (faster builds)
DOCKER_BUILDKIT=1 docker build -t java-migration-accelerator:latest .

# Use cache
docker build --cache-from java-migration-accelerator:latest \
  -t java-migration-accelerator:v2 .
```

### For Better Runtime Performance
```yaml
# Optimize resources in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'      # Adjust to your hardware
      memory: 4G     # Increase if needed
```

## 🚢 Deployment Platforms

Supported cloud deployments:

- **Railway** - `railway up`
- **Render** - Use `render.yaml`
- **Heroku** - Use Docker image
- **AWS ECS** - Push to ECR, deploy via ECS
- **Google Cloud Run** - Compatible with container
- **Azure Container Instances** - Direct container deployment
- **DigitalOcean App Platform** - Docker image compatible

## 📚 Documentation

- **BUILD_AND_TAR.md** - Detailed tar file building
- **DEPLOY.md** - Complete deployment guide
- **README.md** (root) - Project overview

## 🆘 Support

For issues:
1. Check DEPLOY.md troubleshooting section
2. Review Docker logs: `docker logs java-migration-app -f`
3. Verify .env configuration
4. Check Docker is running: `docker ps`
5. Visit GitHub issues: https://github.com/yourusername/java-migration-accelerator

## ✅ Verification Checklist

Before deploying:

- [ ] Docker installed and running
- [ ] Tar file downloaded/transferred
- [ ] Sufficient disk space (10GB+)
- [ ] Sufficient RAM (4GB+)
- [ ] GitHub/GitLab tokens available
- [ ] Port 8001 available (or alternative)

After deployment:

- [ ] Container is running: `docker ps`
- [ ] API responds: `curl http://localhost:8001/health`
- [ ] Frontend loads: http://localhost:8001
- [ ] Logs look normal: `docker logs java-migration-app`

## 🎉 Success!

Your Java Migration Accelerator is ready!

**Next Steps:**
1. Open http://localhost:8001 in your browser
2. Configure GitHub/GitLab tokens in the UI
3. Select a repository
4. Choose migration options
5. Start your first migration!

---

**Built with ❤️ for seamless Java migrations**

*For more information, see DEPLOY.md and BUILD_AND_TAR.md*
