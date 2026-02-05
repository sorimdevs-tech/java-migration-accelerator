# 📋 Docker Deployment Package - File Manifest

## Contents

### 📂 Files in `docker-deployment/` Directory

```
docker-deployment/
│
├── README.md                    ← START HERE! Overview & quick start
├── COMPLETE_GUIDE.md            ← Full end-to-end deployment guide
├── BUILD_AND_TAR.md             ← Detailed tar building instructions
├── DEPLOY.md                    ← Deployment & troubleshooting guide
│
├── docker-compose.yml           ← Container orchestration config
├── .env.example                 ← Environment variables template
│
├── load-image.sh                ← Linux/Mac image loading script
├── load-image.ps1               ← Windows PowerShell image loader
├── start-app.sh                 ← Linux/Mac application startup
├── start-app.ps1                ← Windows PowerShell startup
│
├── build-tar.sh                 ← Linux/Mac tar file builder
├── build-tar.bat                ← Windows batch tar builder
│
└── java-migration-accelerator-latest.tar.gz  ← Docker image tar (created by build script)
```

## File Descriptions

### Documentation

| File | Purpose | Audience |
|------|---------|----------|
| **README.md** | Quick start guide, package overview | Everyone (start here) |
| **COMPLETE_GUIDE.md** | Full step-by-step deployment workflow | Detailed reference |
| **BUILD_AND_TAR.md** | How to build and export tar file | System admins, DevOps |
| **DEPLOY.md** | Deployment, operations, troubleshooting | DevOps, engineers |

### Configuration

| File | Purpose | Usage |
|------|---------|-------|
| **docker-compose.yml** | Container setup & orchestration | Run: `docker-compose up -d` |
| **.env.example** | Environment variables template | Copy to `.env` and customize |

### Linux/Mac Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| **load-image.sh** | Load Docker image from tar | `chmod +x load-image.sh && ./load-image.sh` |
| **start-app.sh** | Start application | `./start-app.sh -d` (background) |
| **build-tar.sh** | Build tar file from image | `./build-tar.sh --clean` |

### Windows Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| **load-image.ps1** | Load Docker image (PowerShell) | `.\load-image.ps1` |
| **start-app.ps1** | Start application (PowerShell) | `.\start-app.ps1 -d` |
| **build-tar.bat** | Build tar file (batch) | `build-tar.bat --clean` |

### Docker Image

| File | Size | Purpose |
|------|------|---------|
| **java-migration-accelerator-latest.tar.gz** | ~2.5GB | Compressed Docker image (created by build script) |

## Quick Navigation

### I want to...

#### 📖 **Read Documentation**
1. Start with: [README.md](README.md)
2. For details: [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)
3. For troubleshooting: [DEPLOY.md](DEPLOY.md)

#### 🛠️ **Build Tar File**
- **Linux/Mac**: `chmod +x build-tar.sh && ./build-tar.sh`
- **Windows**: `build-tar.bat`
- **Manual**: See [BUILD_AND_TAR.md](BUILD_AND_TAR.md)

#### 📦 **Deploy to New System**
1. Copy `docker-deployment/` to target system
2. Copy `java-migration-accelerator-latest.tar.gz` to same directory
3. **Linux/Mac**: `./load-image.sh`
4. **Windows**: `.\load-image.ps1`
5. `cp .env.example .env` and customize
6. `docker-compose up -d`

#### 🚀 **Start Application**
- **Linux/Mac**: `./start-app.sh -d`
- **Windows**: `.\start-app.ps1 -d`
- **Manual**: `docker-compose up -d`

#### 🔧 **Troubleshoot Issues**
- Check [DEPLOY.md](DEPLOY.md) - Troubleshooting section
- Review logs: `docker logs java-migration-app -f`
- Run health check: `curl http://localhost:8001/health`

### Script Execution Permissions

#### Linux/Mac
```bash
# Make scripts executable
chmod +x load-image.sh start-app.sh build-tar.sh

# Then run
./load-image.sh
```

#### Windows PowerShell
```powershell
# Allow script execution (one-time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run
.\load-image.ps1
.\start-app.ps1
```

## Configuration

### .env File Setup

```bash
# Copy template
cp .env.example .env

# Edit with your configuration
nano .env

# Required values:
GITHUB_TOKEN=ghp_...
GITLAB_TOKEN=glpat_...
```

### Common Configurations

#### Basic Setup
```env
GITHUB_TOKEN=your_token
GITLAB_TOKEN=your_token
```

#### With Email
```env
GITHUB_TOKEN=your_token
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

#### With SonarQube
```env
GITHUB_TOKEN=your_token
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your_token
SONAR_ORG=your_org_key
```

## Deployment Workflow

```
Step 1: Build Tar File (Source System)
  └─ ./build-tar.sh
  └─ Output: java-migration-accelerator-latest.tar.gz

Step 2: Transfer Tar File
  └─ Copy to target system (USB, SCP, HTTP, Cloud, etc.)

Step 3: Load Docker Image (Target System)
  └─ ./load-image.sh  (or .\load-image.ps1 on Windows)

Step 4: Configure Environment
  └─ cp .env.example .env
  └─ Edit .env with your tokens

Step 5: Start Application
  └─ docker-compose up -d
  └─ Or: ./start-app.sh -d

Step 6: Verify & Access
  └─ curl http://localhost:8001/health
  └─ Visit http://localhost:8001 in browser
```

## System Requirements

| Item | Minimum | Recommended |
|------|---------|-------------|
| OS | Linux/macOS/Windows | Modern OS (2020+) |
| Docker | 20.10+ | 25.0+ |
| Disk Space | 8GB | 15GB |
| RAM | 2GB | 4GB |
| CPU | 1 core | 2+ cores |

## Docker Commands Reference

```bash
# Check if image is loaded
docker image ls | grep java-migration-accelerator

# View application logs
docker logs java-migration-app -f

# Start application
docker-compose up -d

# Stop application
docker-compose down

# Check running containers
docker ps

# Access container shell
docker exec -it java-migration-app bash

# Check container stats
docker stats java-migration-app
```

## Troubleshooting Quick Links

- **Docker not running**: Install/start Docker Desktop
- **Port 8001 in use**: Use different port or kill conflicting process
- **Out of memory**: Increase Docker memory allocation
- **Image not loading**: Check tar file integrity
- **Can't access web UI**: Check firewall, verify container running

See [DEPLOY.md](DEPLOY.md) for detailed troubleshooting.

## Support Resources

- 📖 Full Guide: [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)
- 🛠️ Deployment: [DEPLOY.md](DEPLOY.md)
- 🔨 Build Info: [BUILD_AND_TAR.md](BUILD_AND_TAR.md)
- 🐳 Docker Docs: https://docs.docker.com
- 🚀 Project: https://github.com/yourusername/java-migration-accelerator

## File Permissions

### After Extracting on Linux/Mac

```bash
# Make scripts executable
chmod +x *.sh

# Verify
ls -la | grep "^-rwx"
```

### After Downloading on Windows

- No special permissions needed
- PowerShell may ask for script execution permission (one-time setup)

## Maintenance

### Regular Tasks

```bash
# Check logs
docker logs java-migration-app -f

# Monitor resources
docker stats

# Check disk usage
docker system df

# Clean up old data
docker system prune -a  # WARNING: Removes unused images/containers
```

### Updates

```bash
# To update the Docker image:
# 1. Build new tar file on source system
# 2. Transfer to target system
# 3. Stop running container: docker-compose down
# 4. Load new image: ./load-image.sh
# 5. Start: docker-compose up -d
```

## FAQ

**Q: Can I run this on any system?**
A: Yes, if Docker is installed. Works on Linux, macOS, Windows.

**Q: Do I need the source code?**
A: No, just the tar file and deployment files.

**Q: How big is the tar file?**
A: ~2.5GB (compressed), ~4GB (uncompressed).

**Q: How long does it take to load?**
A: 5-10 minutes depending on system speed.

**Q: Can I customize the environment?**
A: Yes, edit .env file before starting.

**Q: Where is my data stored?**
A: In Docker volumes (migrations_data, app_logs, app_data).

**Q: How do I backup my migrations?**
A: Backup the `migrations_data` volume regularly.

---

## 🎉 Ready to Deploy!

1. ✅ Make sure you have the tar file
2. ✅ Copy the entire `docker-deployment/` directory
3. ✅ Run `load-image.sh` or `load-image.ps1`
4. ✅ Configure `.env` file
5. ✅ Run `docker-compose up -d`
6. ✅ Visit http://localhost:8001

**That's it! Your Java Migration Accelerator is ready to use!** 🚀

---

For detailed steps, see [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md)
