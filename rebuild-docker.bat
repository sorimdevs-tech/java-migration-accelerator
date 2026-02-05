@echo off
REM ========================================================================
REM GitHub Token Fix & Docker Rebuild Script
REM ========================================================================

echo.
echo ========================================
echo GitHub Token Fix & Docker Rebuild
echo ========================================
echo.

REM Get current token
echo [1/5] Checking current GitHub token...
for /f "tokens=2 delims==" %%A in ('findstr "GITHUB_TOKEN" java-migration-backend\Java_Migration_Accelerator_backend\java-migration-backend\.env') do (
    set CURRENT_TOKEN=%%A
)

if "!CURRENT_TOKEN!"=="" (
    echo ⚠ WARNING: No GitHub token found in .env
    echo.
    echo Visit: https://github.com/settings/tokens
    echo Create a new token with these scopes:
    echo   ✓ repo (full control of private repositories)
    echo   ✓ read:user (read user profile)
    echo.
    echo Then run this script again after adding token to .env
    echo.
    pause
    exit /b 1
)

echo Current token length: !CURRENT_TOKEN:~0,10!... (!CURRENT_TOKEN!_LENGTH! chars)
echo.

REM Check if token is valid length
set TOKEN_LENGTH=0
for /l %%A in (0,1,100) do (
    if not "!CURRENT_TOKEN:~%%A,1!"=="" set /a TOKEN_LENGTH=%%A+1
)

echo Token analysis: !TOKEN_LENGTH! characters
if !TOKEN_LENGTH! LSS 35 (
    echo.
    echo ❌ ERROR: Token is too short (!TOKEN_LENGTH! chars)
    echo GitHub tokens should be 40-50+ characters starting with "ghp_"
    echo.
    echo SOLUTION:
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Generate new token (classic)
    echo 3. Copy ENTIRE token (including ghp_ prefix)
    echo 4. Update .env file
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✓ Token length OK: !TOKEN_LENGTH! chars
echo.

REM Step 2: Stop Docker
echo [2/5] Stopping Docker container...
docker-compose down
if errorlevel 1 (
    echo ⚠ Docker compose down had issues, continuing...
)
timeout /t 3 /nobreak
echo ✓ Docker stopped
echo.

REM Step 3: Clean Docker
echo [3/5] Cleaning Docker system...
docker system prune -f > nul 2>&1
echo ✓ Docker cleaned
echo.

REM Step 4: Build Docker image
echo [4/5] Building Docker image (this may take 15-25 minutes)...
cd /d "%cd%"
docker build -t java-migration-accelerator:latest -f Dockerfile .
if errorlevel 1 (
    echo ❌ Docker build FAILED
    pause
    exit /b 1
)
echo ✓ Docker image built successfully
echo.

REM Step 5: Start Docker
echo [5/5] Starting Docker container...
docker-compose up -d
timeout /t 5 /nobreak
echo.
echo ========================================
echo ✓ BUILD COMPLETE!
echo ========================================
echo.
echo Verifying...
docker logs java-migration-app | find "[INIT]" | find "GitHub token"
echo.
echo Access at: http://localhost:8001
echo.
echo View logs:
echo   docker logs java-migration-app -f
echo.
pause
