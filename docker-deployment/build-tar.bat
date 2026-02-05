@echo off
REM Java Migration Accelerator - Build and Create Docker Tar File (Windows)
REM This script builds the Docker image and exports it as a tar file
REM
REM Usage: build-tar.bat [options]
REM   --no-compress     Export uncompressed tar (faster, larger)
REM   --output PATH     Specify output directory (default: current)
REM   --clean           Remove intermediate images after build
REM   --help            Show this help message

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo 🐳 Java Migration Accelerator - Tar Builder
echo ==========================================
echo.

REM Default options
set COMPRESS=true
set OUTPUT_DIR=.
set CLEAN=false
set HELP=false

REM Parse arguments
:parse_args
if "%1"=="" goto args_done
if "%1"=="--no-compress" (
    set COMPRESS=false
    shift
    goto parse_args
)
if "%1"=="--output" (
    set OUTPUT_DIR=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--clean" (
    set CLEAN=true
    shift
    goto parse_args
)
if "%1"=="--help" (
    set HELP=true
    shift
    goto parse_args
)
shift
goto parse_args

:args_done
if "%HELP%"=="true" (
    echo Usage: %0 [options]
    echo.
    echo Options:
    echo   --no-compress     Export uncompressed tar (faster, larger ~4GB^)
    echo   --output PATH     Specify output directory (default: current^)
    echo   --clean           Remove intermediate images after build
    echo   --help            Show this help message
    echo.
    echo Examples:
    echo   %0                              :: Build with compression
    echo   %0 --no-compress                :: Build without compression
    echo   %0 --output C:\deploy --clean   :: Build and cleanup
    echo.
    exit /b 0
)

REM Create output directory
if not exist "%OUTPUT_DIR%" (
    echo [1/5] Creating output directory: %OUTPUT_DIR%
    mkdir "%OUTPUT_DIR%"
)

REM Check if Docker is running
echo [1/5] Checking Docker daemon...
docker ps >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ✗ Docker is not running
    color 0F
    echo Please start Docker Desktop and try again
    exit /b 1
)
color 0A
echo ✓ Docker daemon is running
color 0F
echo.

REM Navigate to project root if running from docker-deployment
echo [2/5] Checking Dockerfile...
if not exist "Dockerfile" (
    if exist "..\Dockerfile" (
        cd ..
        echo Navigated to project root
    ) else (
        color 0C
        echo ✗ Dockerfile not found!
        color 0F
        echo Please run this script from the project root directory or docker-deployment directory
        exit /b 1
    )
)
color 0A
echo ✓ Dockerfile found
color 0F
echo.

REM Build Docker image
echo [3/5] Building Docker image...
echo This may take 10-20 minutes on first build...
echo.

set DOCKER_BUILDKIT=1
docker build -t java-migration-accelerator:latest -f Dockerfile .
if errorlevel 1 (
    color 0C
    echo ✗ Docker build failed
    color 0F
    exit /b 1
)
echo.
color 0A
echo ✓ Docker image built successfully
color 0F

REM Get image info
for /f "tokens=3" %%i in ('docker image ls ^| findstr java-migration-accelerator ^| findstr latest') do set IMAGE_ID=%%i
echo Image ID: %IMAGE_ID%
echo.

REM Export tar file
echo [4/5] Exporting Docker image as tar file...
echo.

if "%COMPRESS%"=="true" (
    set TAR_FILE=%OUTPUT_DIR%\java-migration-accelerator-latest.tar.gz
    color 0E
    echo Mode: Compressed (gzip)
    color 0F
    echo Output: %TAR_FILE%
    echo.
    echo Saving and compressing (this may take 10-15 minutes)...
    
    REM Note: Docker Desktop includes gzip, but we'll use direct tar for compatibility
    docker save java-migration-accelerator:latest -o "%OUTPUT_DIR%\java-migration-accelerator-latest.tar" 2>nul
    
    if exist "%OUTPUT_DIR%\java-migration-accelerator-latest.tar" (
        echo Compressing...
        REM Use PowerShell for compression if available
        powershell -Command "Compress-Archive -Path '%OUTPUT_DIR%\java-migration-accelerator-latest.tar' -DestinationPath '%TAR_FILE%' -Force 2>$null; if ($?) { Remove-Item '%OUTPUT_DIR%\java-migration-accelerator-latest.tar' }" 2>nul
        
        if not errorlevel 1 (
            color 0A
            echo ✓ Tar file created successfully
            color 0F
            for /f "%%i in ('dir /s /-c "%TAR_FILE%" ^| find "bytes"') do echo Size: %%i
        ) else (
            REM Fallback: keep uncompressed
            set TAR_FILE=%OUTPUT_DIR%\java-migration-accelerator-latest.tar
            color 0A
            echo ✓ Tar file created (uncompressed fallback)
            color 0F
        )
    )
) else (
    set TAR_FILE=%OUTPUT_DIR%\java-migration-accelerator-latest.tar
    color 0E
    echo Mode: Uncompressed
    color 0F
    echo Output: %TAR_FILE%
    echo.
    echo Saving (this may take 5-10 minutes)...
    
    docker save java-migration-accelerator:latest -o "%TAR_FILE%" 2>nul
    if errorlevel 1 (
        color 0C
        echo ✗ Failed to create tar file
        color 0F
        exit /b 1
    )
    
    color 0A
    echo ✓ Tar file created successfully
    color 0F
    for /f "%%i in ('dir /s /-c "%TAR_FILE%" ^| find "bytes"') do echo Size: %%i
)
echo.

REM Cleanup if requested
if "%CLEAN%"=="true" (
    echo [5/5] Cleaning up...
    echo Removing dangling images and build artifacts...
    
    docker system prune -f >nul 2>&1
    
    color 0A
    echo ✓ Cleanup complete
    color 0F
) else (
    echo [5/5] Build complete (skipping cleanup)
    color 0F
    echo.
    echo To free up space, run:
    echo   docker system prune -a
)

echo.
echo ==========================================
color 0A
echo ✓ SUCCESS!
color 0F
echo ==========================================
echo.
echo Tar file ready for deployment:
echo   📦 %TAR_FILE%
echo.
echo Next steps:
echo   1. Transfer tar file to target system
echo   2. Run: .\load-image.ps1
echo   3. Run: docker-compose up -d
echo.
echo Transfer examples:
echo   # Via cloud storage:
echo   # AWS S3, Google Drive, Azure Blob Storage
echo.
echo   # Via HTTP server (Python):
echo   # python -m http.server 8000
echo   # Then on target: wget http://source:8000/(filename)
echo.
echo To load on target system:
echo   .\load-image.ps1
echo.

endlocal
