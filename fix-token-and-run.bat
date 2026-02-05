@echo off
REM ════════════════════════════════════════════════════════════════════════════════
REM Fix GitHub Token and Rebuild Docker - Batch Version
REM ════════════════════════════════════════════════════════════════════════════════

cls
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo             FIX GITHUB TOKEN ^& REBUILD DOCKER - BATCH VERSION
echo ════════════════════════════════════════════════════════════════════════════════
echo.

REM STEP 1: Get new token
echo [STEP 1] GENERATE NEW GITHUB TOKEN
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo Your current token is INVALID. Follow these steps to get a new one:
echo.
echo 1. Open: https://github.com/settings/tokens
echo 2. Click: "Generate new token" ^-> "Generate new token (classic)"
echo 3. Configure:
echo    - Token name: Java Migration Accelerator
echo    - Expiration: 90 days
echo    - Scopes: [X] repo, [X] read:user
echo 4. Click: "Generate token"
echo 5. COPY THE FULL TOKEN IMMEDIATELY (won't show again!)
echo.
echo ════════════════════════════════════════════════════════════════════════════════
echo.

set /p token="Paste your NEW GitHub token (starts with ghp_): "

if "%token%"=="" (
    echo [ERROR] No token provided!
    pause
    exit /b 1
)

echo.
echo [OK] Token received: %token:~0,10%...***
echo.

REM STEP 2: Update .env file
echo [STEP 2] UPDATE .env FILE
echo ════════════════════════════════════════════════════════════════════════════════
echo.

set "ENV_FILE=c:\Users\MSI\java-migration-accelerator\.env"

if not exist "%ENV_FILE%" (
    echo [ERROR] .env file not found at: %ENV_FILE%
    pause
    exit /b 1
)

echo [INFO] Reading current .env file...

REM Create new .env with updated token
setlocal enabledelayedexpansion
(
    for /f "delims=" %%A in ('type "%ENV_FILE%"') do (
        echo %%A | findstr /R "^GITHUB_TOKEN=" >nul
        if errorlevel 1 (
            echo %%A
        ) else (
            echo GITHUB_TOKEN=%token%
        )
    )
) > "%ENV_FILE%.tmp"

move /y "%ENV_FILE%.tmp" "%ENV_FILE%" >nul

echo [OK] .env file updated with new token
echo.

REM STEP 3: Restart Docker
echo [STEP 3] RESTART DOCKER CONTAINERS
echo ════════════════════════════════════════════════════════════════════════════════
echo.

cd /d c:\Users\MSI\java-migration-accelerator

echo [INFO] Stopping containers...
docker-compose down >nul 2>&1
timeout /t 3 >nul

echo [INFO] Starting containers...
docker-compose up -d >nul 2>&1

echo [OK] Containers restarted
echo.

echo [INFO] Waiting for application to start...
timeout /t 5 >nul

REM STEP 4: Verify
echo.
echo [STEP 4] VERIFICATION
echo ════════════════════════════════════════════════════════════════════════════════
echo.

docker ps | findstr "java-migration-accelerator" >nul
if errorlevel 1 (
    echo [ERROR] Container is not running!
    pause
    exit /b 1
) else (
    echo [OK] Container is running
)

echo.
echo [INFO] Checking token in logs...
for /f "delims=" %%A in ('docker logs java-migration-accelerator 2^>nul ^| findstr "Token length"') do (
    echo   %%A
)

echo.
echo [STEP 5] COMPLETION
echo ════════════════════════════════════════════════════════════════════════════════
echo.
echo [SUCCESS] Setup complete!
echo.
echo Your application is ready! Access it at:
echo   Frontend: http://localhost:8001
echo   API Docs: http://localhost:8001/docs
echo.
echo Next steps:
echo   1. Open http://localhost:8001 in your browser
echo   2. Try analyzing a GitHub repository
echo   3. Should work WITHOUT 401/403 errors!
echo.
echo To check logs:
echo   docker logs java-migration-accelerator -f
echo.
echo To stop everything:
echo   docker-compose down
echo.
pause
