@echo off
REM ════════════════════════════════════════════════════════════════════════════════
REM Java Migration Accelerator - Docker Rebuild & Fix Script (Batch)
REM ════════════════════════════════════════════════════════════════════════════════
REM Purpose: Fix GitHub token and rebuild Docker image completely
REM Usage: rebuild-and-fix.bat
REM ════════════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM ════════════════════════════════════════════════════════════════════════════════
REM Colors and utilities
REM ════════════════════════════════════════════════════════════════════════════════

cls
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo  Java Migration Accelerator - Docker Rebuild Script
echo ════════════════════════════════════════════════════════════════════════════════
echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 0: Verify Docker is running
REM ════════════════════════════════════════════════════════════════════════════════

echo [INFO] Checking Docker daemon...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 1: Check/Get GitHub Token
REM ════════════════════════════════════════════════════════════════════════════════

echo [STEP 1] GitHub Token Setup
echo ════════════════════════════════════════════════════════════════════════════════
echo.

set "ENV_FILE=java-migration-backend\Java_Migration_Accelerator_backend\java-migration-backend\.env"

if not exist "%ENV_FILE%" (
    echo [ERROR] .env file not found at: %ENV_FILE%
    pause
    exit /b 1
)

echo [INFO] .env file found at: %ENV_FILE%

REM Read current token from .env
for /f "tokens=2 delims==" %%A in ('findstr /R "^GITHUB_TOKEN=" "%ENV_FILE%"') do (
    set "CURRENT_TOKEN=%%A"
)

REM Remove quotes if present
set "CURRENT_TOKEN=!CURRENT_TOKEN:"=!"

echo [INFO] Current token length: !CURRENT_TOKEN:~0,-1! chars
echo.

REM Check if token is valid (should be 40+ chars)
if "!CURRENT_TOKEN:~0,-1!" neq "" (
    set "TOKEN_LENGTH=0"
    for /l %%A in (0,1,100) do (
        if "!CURRENT_TOKEN:~%%A,1!" neq "" set /a TOKEN_LENGTH=%%A
    )
    
    if !TOKEN_LENGTH! lss 40 (
        echo [WARNING] Token is INVALID (only !TOKEN_LENGTH! chars, need 40+)
        echo.
        echo [INFO] To fix this:
        echo   1. Go to: https://github.com/settings/tokens
        echo   2. Generate new token (classic)
        echo   3. Name: Java Migration Accelerator
        echo   4. Scopes: repo, read:user
        echo   5. Copy the full token
        echo.
        set /p NEW_TOKEN="Paste your new GitHub token: "
        
        if "!NEW_TOKEN!" neq "" (
            set "CURRENT_TOKEN=!NEW_TOKEN!"
        ) else (
            echo [ERROR] No token provided!
            pause
            exit /b 1
        )
    ) else (
        echo [OK] Token appears valid (!TOKEN_LENGTH! chars)
    )
)

echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 2: Update .env file
REM ════════════════════════════════════════════════════════════════════════════════

echo [STEP 2] Updating .env file
echo ════════════════════════════════════════════════════════════════════════════════

(
    for /f "delims=" %%A in ('type "%ENV_FILE%"') do (
        echo %%A | findstr /R "^GITHUB_TOKEN=" >nul
        if errorlevel 1 (
            echo %%A
        ) else (
            echo GITHUB_TOKEN=!CURRENT_TOKEN!
        )
    )
) > "%ENV_FILE%.tmp"

move /y "%ENV_FILE%.tmp" "%ENV_FILE%" >nul
echo [OK] .env updated with new token
echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 3: Stop existing containers
REM ════════════════════════════════════════════════════════════════════════════════

echo [STEP 3] Stop existing containers
echo ════════════════════════════════════════════════════════════════════════════════

docker ps | findstr "java-migration" >nul
if errorlevel 1 (
    echo [INFO] No running containers found
) else (
    echo [INFO] Stopping containers...
    docker-compose down -v >nul 2>&1
    timeout /t 3 >nul
    echo [OK] Containers stopped
)
echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 4: Clean Docker resources
REM ════════════════════════════════════════════════════════════════════════════════

echo [STEP 4] Clean Docker resources
echo ════════════════════════════════════════════════════════════════════════════════

echo [INFO] Removing old image...
docker rmi java-migration-accelerator:latest >nul 2>&1

echo [INFO] Pruning unused resources...
docker system prune -f >nul 2>&1

echo [OK] Docker resources cleaned
echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 5: Build Docker image
REM ════════════════════════════════════════════════════════════════════════════════

echo [STEP 5] Building Docker image
echo ════════════════════════════════════════════════════════════════════════════════
echo [INFO] This may take 15-25 minutes...
echo.

docker build -t java-migration-accelerator:latest -f Dockerfile .
if errorlevel 1 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)
echo.
echo [OK] Docker image built successfully
echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 6: Start containers
REM ════════════════════════════════════════════════════════════════════════════════

echo [STEP 6] Starting containers
echo ════════════════════════════════════════════════════════════════════════════════

docker-compose up -d >nul 2>&1
echo [OK] Containers started

echo [INFO] Waiting for application to start...
timeout /t 5 >nul
echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 7: Verify
REM ════════════════════════════════════════════════════════════════════════════════

echo [STEP 7] Verification
echo ════════════════════════════════════════════════════════════════════════════════

docker ps | findstr "java-migration" >nul
if errorlevel 1 (
    echo [ERROR] Containers are not running!
    pause
    exit /b 1
) else (
    echo [OK] Containers are running
)

echo [INFO] Checking logs...
docker logs java-migration-app | findstr "Token length" 2>nul
if not errorlevel 1 (
    echo [OK] Token appears to be loaded
)

echo.

REM ════════════════════════════════════════════════════════════════════════════════
REM STEP 8: Final instructions
REM ════════════════════════════════════════════════════════════════════════════════

echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo [SUCCESS] Rebuild Complete!
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo Next steps:
echo.
echo 1. Open your browser and visit:
echo    Frontend: http://localhost:8001
echo    API Docs: http://localhost:8001/docs
echo.
echo 2. Test the app:
echo    - Paste a GitHub repo URL
echo    - Should work WITHOUT 400/401 errors
echo.
echo 3. Watch the logs:
echo    docker logs java-migration-app -f
echo.
echo 4. To stop the application:
echo    docker-compose down
echo.
pause
