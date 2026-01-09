@echo off
REM Java Migration Accelerator - Docker Build & Push Script (Batch Version)
REM Run this script to build and push your Docker image to GitHub

echo 🚀 Java Migration Accelerator - Docker Build & Push Script
echo ==========================================================
echo.

REM Set Docker PATH
set "PATH=%PATH%;C:\Program Files\Docker\Docker\resources\bin"

REM Check if Docker is running
echo 📋 Checking Docker status...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not accessible. Please ensure Docker Desktop is running.
    echo    Start Docker Desktop from your Windows Start menu and try again.
    pause
    exit /b 1
)
echo ✅ Docker is available
echo.

REM Build the Docker image
echo 🔨 Building Docker image...
docker build -f Dockerfile.backend -t java-migration-accelerator:latest .
if errorlevel 1 (
    echo ❌ Failed to build Docker image
    pause
    exit /b 1
)
echo ✅ Docker image built successfully!
echo.

REM Check the built image
echo 📦 Checking built image...
docker images java-migration-accelerator:latest
echo.

REM Login to GitHub Container Registry
echo 🔐 Logging into GitHub Container Registry...
echo Please enter your GitHub Personal Access Token:
set /p github_token="Token: "

echo %github_token% | docker login ghcr.io -u sorimdevs-tech --password-stdin
if errorlevel 1 (
    echo ❌ Failed to login to GitHub Container Registry
    pause
    exit /b 1
)
echo ✅ Successfully logged into GitHub Container Registry!
echo.

REM Tag the image
echo 🏷️ Tagging image for GitHub...
docker tag java-migration-accelerator:latest ghcr.io/sorimdevs-tech/java-migration-accelerator:latest
echo.

REM Push to GitHub
echo 📤 Pushing image to GitHub Container Registry...
docker push ghcr.io/sorimdevs-tech/java-migration-accelerator:latest
if errorlevel 1 (
    echo ❌ Failed to push to GitHub
    pause
    exit /b 1
)
echo ✅ Successfully pushed to GitHub Container Registry!
echo 🌐 Image available at: https://github.com/sorimdevs-tech/java-migration-accelerator/pkgs/container/java-migration-accelerator
echo.

echo.
echo 🎉 Docker image build and push completed!
echo ==================================================
echo 📋 Next steps:
echo    1. Deploy to Railway: railway up
echo    2. Check your public URL: railway domain
echo    3. Access API docs: https://your-url.up.railway.app/docs
echo ==================================================
echo.
pause