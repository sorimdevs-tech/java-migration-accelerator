@echo off
REM ================================================================
REM Java Migration Accelerator - Docker Build and Deploy Script
REM ================================================================
REM This script builds the Docker image and creates a tar file
REM Prerequisites: Docker Desktop must be installed and running
REM ================================================================

setlocal enabledelayedexpansion
set PROJECT_NAME=java-migration-accelerator
set VERSION=1.0.0
set TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%

echo.
echo ================================================================
echo Java Migration Accelerator - Docker Build Script
echo ================================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is installed and available
docker --version
echo.

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running
    echo Please start Docker Desktop
    echo.
    pause
    exit /b 1
)

echo [OK] Docker daemon is running
echo.

REM Check .env file
if not exist ".env" (
    echo [WARNING] .env file not found
    echo Creating template .env file...
    (
        echo # Git Platform Tokens
        echo GITHUB_TOKEN=your_token_here
        echo GITLAB_TOKEN=your_token_here
        echo.
        echo # Email Configuration
        echo SMTP_SERVER=smtp.gmail.com
        echo SMTP_PORT=587
        echo SMTP_USERNAME=your_email@gmail.com
        echo SMTP_PASSWORD=your_password
        echo.
        echo # SonarQube Configuration
        echo SONARQUBE_URL=https://sonarcloud.io
        echo SONARQUBE_TOKEN=your_token
        echo.
        echo # Application Settings
        echo WORK_DIR=/tmp/migrations
        echo NODE_ENV=production
    ) > .env
    echo [INFO] Created .env file - please update with your tokens
    echo.
)

REM Get user input
echo ================================================================
echo Build Options
echo ================================================================
echo.
set /p BUILD_TYPE="Choose build type (1=Full, 2=Backend only, 3=Frontend only): " || set BUILD_TYPE=1
set /p MAKE_TAR="Create tar.gz file for distribution? (Y/N): " || set MAKE_TAR=Y

echo.
echo ================================================================
echo Build Configuration
echo ================================================================
echo Project Name: %PROJECT_NAME%
echo Version: %VERSION%
echo Build Type: %BUILD_TYPE%
echo Create Tar: %MAKE_TAR%
echo.

REM Clean up old images
echo [INFO] Cleaning up old images...
docker image prune -f >nul 2>&1

REM Build Docker image
echo [INFO] Building Docker image...
echo Command: docker build -t %PROJECT_NAME%:%VERSION% -t %PROJECT_NAME%:latest .
echo.

docker build ^
    -t %PROJECT_NAME%:%VERSION% ^
    -t %PROJECT_NAME%:latest ^
    --progress=plain ^
    .

if errorlevel 1 (
    echo [ERROR] Docker build failed
    echo.
    pause
    exit /b 1
)

echo [OK] Docker image built successfully
echo.

REM Show image info
docker images | findstr %PROJECT_NAME%
echo.

REM Get image ID and size
for /f "tokens=3" %%i in ('docker images %PROJECT_NAME%:%VERSION% --no-trunc^| findstr %PROJECT_NAME%') do set IMAGE_ID=%%i
for /f "tokens=7" %%i in ('docker images %PROJECT_NAME%:%VERSION%^| findstr %PROJECT_NAME%') do set IMAGE_SIZE=%%i

echo Image ID: %IMAGE_ID%
echo Image Size: %IMAGE_SIZE%
echo.

REM Create tar file if requested
if /i "%MAKE_TAR%"=="Y" (
    echo ================================================================
    echo Creating Tar Distribution File
    echo ================================================================
    echo.
    
    set TAR_FILE=%PROJECT_NAME%-%VERSION%-%TIMESTAMP%.tar.gz
    set TAR_FILE_PLAIN=%PROJECT_NAME%-%VERSION%.tar
    
    echo [INFO] Exporting Docker image to tar file...
    echo File: !TAR_FILE!
    echo.
    
    REM Use PowerShell for gzip compression (more reliable on Windows)
    powershell -Command "docker save %PROJECT_NAME%:%VERSION% | gzip-Object -CompressionLevel Optimal > '!TAR_FILE!'"
    
    if errorlevel 1 (
        echo [WARNING] gzip compression failed, creating uncompressed tar...
        docker save -o !TAR_FILE_PLAIN! %PROJECT_NAME%:%VERSION%
        
        if exist "!TAR_FILE_PLAIN!" (
            echo [OK] Created uncompressed tar file: !TAR_FILE_PLAIN!
            for /F %%A in ('powershell -Command "(Get-Item '!TAR_FILE_PLAIN!').Length / 1MB"') do set TAR_SIZE=%%A
            echo File Size: !TAR_SIZE! MB
        )
    ) else if exist "!TAR_FILE!" (
        echo [OK] Created tar.gz file: !TAR_FILE!
        for /F %%A in ('powershell -Command "(Get-Item '!TAR_FILE!').Length / 1MB"') do set TAR_SIZE=%%A
        echo File Size: !TAR_SIZE! MB
    )
    echo.
)

REM Test the container
echo ================================================================
echo Testing Docker Container
echo ================================================================
echo.
echo [INFO] Starting test container...

docker run -d ^
    --name %PROJECT_NAME%-test ^
    -p 8001:8001 ^
    --env-file .env ^
    -v migrations_test:/tmp/migrations ^
    %PROJECT_NAME%:%VERSION%

if errorlevel 1 (
    echo [ERROR] Failed to start test container
    echo.
    pause
    exit /b 1
)

echo [OK] Test container started
echo Container ID: !CONTAINER_ID!
echo.

REM Wait for container to be ready
echo [INFO] Waiting for container to be ready...
timeout /t 5 /nobreak

REM Check health
echo [INFO] Checking container health...
docker exec %PROJECT_NAME%-test curl -f http://localhost:8001/health >nul 2>&1

if errorlevel 1 (
    echo [WARNING] Health check failed
    echo [INFO] Container logs:
    docker logs %PROJECT_NAME%-test
) else (
    echo [OK] Container health check passed
)

echo.
echo [INFO] Frontend accessible at: http://localhost:8001
echo [INFO] Backend API at: http://localhost:8001/docs
echo.

REM Stop test container
echo [INFO] Stopping test container...
docker stop %PROJECT_NAME%-test >nul 2>&1
docker rm %PROJECT_NAME%-test >nul 2>&1

echo ================================================================
echo Docker Build Complete!
echo ================================================================
echo.
echo Image Name: %PROJECT_NAME%:%VERSION%
echo Image Size: %IMAGE_SIZE%
echo.
if /i "%MAKE_TAR%"=="Y" (
    echo Tar File Created: !TAR_FILE!
    echo Distribution: Copy !TAR_FILE! to other machines
    echo Load Image: docker load -i !TAR_FILE!
    echo.
)
echo Next Steps:
echo 1. Update .env with your GitHub/GitLab tokens
echo 2. Start with docker-compose: docker-compose up -d
echo 3. Access at: http://localhost:8001
echo 4. View logs: docker-compose logs -f
echo.
echo To stop container:
echo   docker-compose down
echo.
echo To remove image:
echo   docker rmi %PROJECT_NAME%:%VERSION%
echo.

pause
