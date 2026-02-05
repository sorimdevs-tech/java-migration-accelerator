# 📦 Complete Guide: Building and Deploying Docker Tar File

## 🎯 Overview

This guide explains how to:
1. **Build** the Docker image from the Java Migration Accelerator project
2. **Export** it as a portable tar file
3. **Transfer** to any system
4. **Deploy** and run without any source code

**Total time to deployment: 30-45 minutes**

---

## PART 1: BUILD DOCKER TAR FILE

### Prerequisites (Source System)

- Docker 20.10+ installed and running
- 10GB+ free disk space
- 4GB+ RAM available
- Git repository cloned: `java-migration-accelerator`

### Step 1a: Build Tar File (Linux/Mac)

```bash
# Navigate to deployment directory
cd java-migration-accelerator/docker-deployment

# Make script executable
chmod +x build-tar.sh

# Build with compression (recommended)
./build-tar.sh

# Or build without compression (faster save time)
./build-tar.sh --no-compress

# Or build and cleanup Docker artifacts
./build-tar.sh --clean

# Or specify output directory
./build-tar.sh --output /mnt/external-drive
```

**What happens:**
1. Validates Docker is running
2. Checks Dockerfile exists
3. Builds image (10-20 minutes)
4. Exports as tar.gz (5-10 minutes)
5. Output: `java-migration-accelerator-latest.tar.gz` (~2.5GB)

### Step 1b: Build Tar File (Windows)

```powershell
# Navigate to deployment directory
cd java-migration-accelerator\docker-deployment

# Run build script
.\build-tar.bat

# Or with options
.\build-tar.bat --no-compress
.\build-tar.bat --clean
.\build-tar.bat --output C:\backup\docker
```

### Step 1c: Manual Build (All Platforms)

```bash
# From project root, build image
docker build -t java-migration-accelerator:latest -f Dockerfile .

# Export as compressed tar (recommended)
docker save java-migration-accelerator:latest | gzip -9 > java-migration-accelerator-latest.tar.gz

# OR export uncompressed (if gzip unavailable)
docker save java-migration-accelerator:latest > java-migration-accelerator-latest.tar

# Move to deployment directory
mv java-migration-accelerator-latest.tar.gz docker-deployment/
```

### Verification

```bash
# Check tar file was created
ls -lh java-migration-accelerator-latest.tar.gz

# Expected output:
# -rw-r--r-- 1 user group 2.5G java-migration-accelerator-latest.tar.gz

# Verify tar integrity
tar -tzf java-migration-accelerator-latest.tar.gz > /dev/null && echo "✓ Tar file OK"
```

---

## PART 2: TRANSFER TAR FILE

### Option A: Direct Copy (USB/External Drive)

```bash
# Copy to USB drive
cp java-migration-accelerator-latest.tar.gz /media/usb/

# Or Windows
copy java-migration-accelerator-latest.tar.gz D:\backup\
```

### Option B: SCP (Secure Copy - Linux/Mac)

```bash
# Transfer to remote server
scp java-migration-accelerator-latest.tar.gz user@target-server:/path/to/deployment/

# Or with specific port
scp -P 2222 java-migration-accelerator-latest.tar.gz user@target:/path/
```

### Option C: HTTP Server

```bash
# On source system, start simple HTTP server
python3 -m http.server 8000 --directory .

# On target system
wget http://source-ip:8000/java-migration-accelerator-latest.tar.gz
# Or with curl
curl -O http://source-ip:8000/java-migration-accelerator-latest.tar.gz
```

### Option D: Cloud Storage

```bash
# Upload to AWS S3
aws s3 cp java-migration-accelerator-latest.tar.gz s3://my-bucket/

# Upload to Google Drive
gdrive upload java-migration-accelerator-latest.tar.gz

# Or use web UI: drive.google.com, dropbox.com, onedrive.com
```

### Option E: Split for Large Files

```bash
# Split into 1GB chunks (for email/slow connections)
split -b 1G java-migration-accelerator-latest.tar.gz app.tar.gz.

# Transfer all parts

# On target, rejoin
cat app.tar.gz.* > java-migration-accelerator-latest.tar.gz
```

### File Transfer Checklist

- [ ] Tar file generated successfully
- [ ] File size verified (~2.5GB compressed or ~4GB uncompressed)
- [ ] Transfer method chosen
- [ ] File transferred completely
- [ ] File integrity verified on target system

---

## PART 3: LOAD ON TARGET SYSTEM

### Prerequisites (Target System)

- Docker 20.10+ installed and running
- 10GB+ free disk space
- 4GB+ RAM available
- Deployment directory from `docker-deployment/` folder

### Step 3a: Load Image (Linux/Mac)

```bash
# Navigate to deployment directory with all files
cd /path/to/deployment

# Make script executable
chmod +x load-image.sh

# Run load script
./load-image.sh

# Expected output:
# ✓ Docker daemon is running
# ✓ Found tar file: java-migration-accelerator-latest.tar.gz
# ✓ Docker image loaded successfully
# ✓ Image verified
# ✓ SUCCESS! Image ready to deploy
```

### Step 3b: Load Image (Windows PowerShell)

```powershell
# Navigate to deployment directory
cd C:\path\to\deployment

# Run PowerShell script
.\load-image.ps1

# If script execution is disabled:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\load-image.ps1
```

### Step 3c: Manual Load

```bash
# Extract and load from tar.gz
gunzip -c java-migration-accelerator-latest.tar.gz | docker load

# Or from uncompressed tar
docker load < java-migration-accelerator-latest.tar

# Verify image loaded
docker image ls | grep java-migration-accelerator
```

### Image Loading Verification

```bash
# Check image exists
docker image ls | grep java-migration-accelerator

# Expected output:
# REPOSITORY                        TAG       IMAGE ID       CREATED        SIZE
# java-migration-accelerator        latest    abcd1234ef56   2 days ago     4.2GB

# Check image details
docker image inspect java-migration-accelerator:latest
```

---

## PART 4: CONFIGURE & DEPLOY

### Step 4a: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env              # Linux/Mac
code .env             # VS Code
notepad .env          # Windows Notepad
```

### Step 4b: Essential Configuration

Edit `.env` with:

```env
# GitHub/GitLab Tokens (REQUIRED)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITLAB_TOKEN=glpat_xxxxxxxxxxxxx

# Email (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SonarQube (Optional)
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your-token
```

### Step 4c: Start Application

**Using Docker Compose (Recommended):**
```bash
docker-compose up -d
```

**Using Startup Script (Linux/Mac):**
```bash
chmod +x start-app.sh
./start-app.sh -d      # Detached mode
./start-app.sh         # Foreground with logs
```

**Using Startup Script (Windows):**
```powershell
.\start-app.ps1 -d     # Detached mode
.\start-app.ps1        # Foreground with logs
```

**Direct Docker:**
```bash
docker run -d \
  --name java-migration-app \
  -p 8001:8001 \
  --env-file .env \
  -v migrations_data:/tmp/migrations \
  -v app_logs:/app/logs \
  -v app_data:/app/data \
  java-migration-accelerator:latest
```

### Startup Verification

```bash
# Check container is running
docker ps | grep java-migration

# View logs
docker logs java-migration-app -f

# Test API endpoint
curl http://localhost:8001/health

# Expected response:
# {"status":"healthy","timestamp":"2024-02-05T10:00:00"}
```

---

## PART 5: ACCESS & USE

### Web Interface

Open in browser:
```
http://localhost:8001
```

### Available Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| **Dashboard** | http://localhost:8001 | Main UI |
| **API Docs** | http://localhost:8001/docs | Interactive API |
| **OpenAPI** | http://localhost:8001/openapi.json | Spec file |
| **Health** | http://localhost:8001/health | Status check |

### First Steps

1. Open http://localhost:8001
2. Sign in or add tokens
3. Select repository (GitHub/GitLab)
4. Choose migration type
5. Preview changes
6. Execute migration
7. Download report

---

## TROUBLESHOOTING

### Build Issues

**Issue: "Docker build failed"**
```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# Restart Docker
docker restart

# Try again with verbose output
docker build --progress=plain -t java-migration-accelerator:latest .
```

**Issue: "Dockerfile not found"**
```bash
# Ensure running from project root
ls Dockerfile

# Or specify full path
docker build -f /path/to/Dockerfile .
```

### Transfer Issues

**Issue: "File transfer interrupted"**
```bash
# Verify tar integrity
tar -tzf java-migration-accelerator-latest.tar.gz > /dev/null

# If corrupted, rebuild and retransfer
# Or use split method for large files
```

### Load Issues

**Issue: "Docker image not found after load"**
```bash
# Check if image loaded
docker image ls

# Retry load with verbose
docker load -i java-migration-accelerator-latest.tar -v

# Check docker volume space
docker system df
```

**Issue: "gunzip: command not found"**
```bash
# On Windows, use PowerShell instead
# Or install gzip utility
```

### Runtime Issues

**Issue: "Port 8001 already in use"**
```bash
# Use different port
docker run -p 9001:8001 java-migration-accelerator:latest

# Or find and stop conflicting container
lsof -i :8001
docker stop <container-id>
```

**Issue: "Cannot connect to localhost:8001"**
```bash
# Check container is running
docker ps

# Check logs
docker logs java-migration-app

# Test inside container
docker exec java-migration-app curl http://localhost:8001/health

# Check firewall
netstat -an | grep 8001
```

**Issue: "Out of memory"**
```bash
# Increase Docker memory
# Docker Desktop: Preferences → Resources → Memory

# Or reduce container limits in docker-compose.yml
# Change: memory: 4G → memory: 2G
```

---

## BEST PRACTICES

### Security
✓ Keep `.env` file secure
✓ Use scoped GitHub/GitLab tokens
✓ Don't commit `.env` to git
✓ Rotate tokens periodically
✓ Use HTTPS in production

### Performance
✓ Use compressed tar for transfers
✓ Use SSD for Docker storage
✓ Monitor resource usage
✓ Backup migrations data regularly
✓ Clean Docker system periodically

### Maintenance
✓ Keep Docker updated
✓ Review application logs weekly
✓ Backup migration history
✓ Test disaster recovery
✓ Document custom configurations

---

## REFERENCE COMMANDS

### Docker Commands
```bash
docker ps                                 # List running containers
docker logs java-migration-app -f         # View logs (follow)
docker exec -it java-migration-app bash   # Access container shell
docker stop java-migration-app            # Stop container
docker start java-migration-app           # Start container
docker restart java-migration-app         # Restart container
docker rm java-migration-app              # Remove container
docker image rm java-migration-accelerator:latest  # Remove image
docker system prune -a                    # Clean up Docker
```

### Docker Compose Commands
```bash
docker-compose up -d                      # Start in background
docker-compose up                         # Start in foreground
docker-compose down                       # Stop and remove
docker-compose logs -f                    # View logs
docker-compose restart                    # Restart services
docker-compose ps                         # List services
```

### File Operations
```bash
# Check tar integrity
tar -tzf file.tar.gz > /dev/null

# Extract tar
tar -xzf file.tar.gz

# Create tar with compression
tar -czf file.tar.gz directory/

# List tar contents
tar -tzf file.tar.gz | head -20
```

---

## DEPLOYMENT FLOWCHART

```
┌─────────────────────────────────────────────────────────┐
│ 1. BUILD TAR FILE (Source System)                       │
│ ├─ ./build-tar.sh                                       │
│ └─ Output: java-migration-accelerator-latest.tar.gz     │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 2. TRANSFER TAR FILE                                    │
│ ├─ USB drive / SCP / HTTP / Cloud                       │
│ └─ Verify: tar -tzf file.tar.gz > /dev/null             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 3. LOAD IMAGE (Target System)                           │
│ ├─ ./load-image.sh                                      │
│ └─ Verify: docker image ls | grep java-migration       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 4. CONFIGURE                                            │
│ ├─ cp .env.example .env                                 │
│ └─ Add tokens to .env                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 5. DEPLOY                                               │
│ ├─ docker-compose up -d                                 │
│ └─ Verify: curl http://localhost:8001/health            │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 6. ACCESS                                               │
│ └─ http://localhost:8001                                │
└─────────────────────────────────────────────────────────┘
```

---

## QUICK REFERENCE CHECKLIST

### Building
- [ ] Docker running
- [ ] 10GB+ free space
- [ ] Run `build-tar.sh` or `build-tar.bat`
- [ ] Tar file created (~2.5GB)
- [ ] Tar file integrity verified

### Transferring
- [ ] Transfer method chosen
- [ ] File transferred
- [ ] File integrity verified on target

### Loading
- [ ] Docker running on target system
- [ ] Run `load-image.sh` or `load-image.ps1`
- [ ] Image loaded successfully
- [ ] Image verified with `docker image ls`

### Configuring
- [ ] `.env.example` → `.env`
- [ ] GitHub token added
- [ ] GitLab token added (if using)
- [ ] SMTP settings configured (optional)

### Deploying
- [ ] Run `docker-compose up -d`
- [ ] Container starts successfully
- [ ] Health check responds
- [ ] Application accessible at http://localhost:8001

### Using
- [ ] Dashboard loads
- [ ] Tokens configured in UI
- [ ] Repository selected
- [ ] Migration started
- [ ] Report generated

---

## NEXT STEPS

After successful deployment:

1. **Configure integrations**
   - Add GitHub/GitLab tokens
   - Configure email (optional)
   - Set up SonarQube (optional)

2. **Run first migration**
   - Select repository
   - Choose target Java version
   - Select migrations to apply
   - Review changes
   - Execute

3. **Monitor and maintain**
   - Check logs regularly
   - Backup migration data
   - Update Docker image periodically
   - Manage API tokens

4. **Scale and optimize**
   - Add more resources if needed
   - Configure for production use
   - Set up CI/CD integration
   - Monitor performance

---

## SUPPORT

For issues:
1. Check this guide
2. Review DEPLOY.md
3. Check Docker logs: `docker logs java-migration-app -f`
4. Visit GitHub: https://github.com/yourusername/java-migration-accelerator

**You're all set! Happy migrating! 🚀**
