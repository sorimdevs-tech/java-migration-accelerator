@echo off
REM Java Migration Accelerator - Direct Railway Deployment
REM Deploy directly to Railway without Docker issues

echo 🚀 Java Migration Accelerator - Railway Deployment
echo ==================================================
echo.

REM Check Railway CLI
echo 📋 Checking Railway CLI...
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
    echo ✅ Railway CLI installed
) else (
    echo ✅ Railway CLI available
)
echo.

REM Check Railway login
echo 🔐 Checking Railway authentication...
railway whoami >nul 2>&1
if errorlevel 1 (
    echo 🔑 Please login to Railway...
    echo.
    echo After logging in, run this script again.
    echo.
    railway login
    pause
    exit /b 0
) else (
    echo ✅ Already logged into Railway
)
echo.

REM Initialize Railway project
echo 🏗️ Initializing Railway project...
railway init --name "java-migration-accelerator"
if errorlevel 1 (
    echo ℹ️ Project may already exist, continuing...
)
echo ✅ Railway project ready
echo.

REM Set environment variables
echo ⚙️ Configuring environment variables...
echo.

REM GitHub Token
set /p github_token="Enter your GitHub Personal Access Token: "
if defined github_token (
    railway variables set GITHUB_TOKEN=%github_token%
    echo ✅ GitHub token set
) else (
    echo ❌ GitHub token is required
    pause
    exit /b 1
)
echo.

REM Optional GitLab Token
set /p gitlab_token="Enter your GitLab Personal Access Token (optional - press Enter to skip): "
if defined gitlab_token (
    railway variables set GITLAB_TOKEN=%gitlab_token%
    echo ✅ GitLab token set
)
echo.

REM Deploy
echo 🚀 Deploying to Railway...
railway up
if errorlevel 1 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)
echo ✅ Deployment initiated
echo.

REM Get the public URL
echo 🌐 Getting your public URL...
timeout /t 15 >nul
railway domain > temp_domain.txt 2>nul
set /p domain=<temp_domain.txt
del temp_domain.txt 2>nul

echo.
echo ==================================================
echo 🎉 Your Java Migration Accelerator is LIVE!
echo ==================================================
if defined domain (
    echo 🌐 Public URL: %domain%
    echo 📖 API Docs: %domain%/docs
    echo 🔧 Backend API: %domain%
) else (
    echo 🌐 Check your Railway dashboard for the public URL
    echo 🔗 https://railway.app/dashboard
)
echo ==================================================
echo.
echo 📋 Available endpoints:
echo    GET  /health           - Health check
echo    POST /api/migration/start - Start migration
echo    GET  /api/github/repos - List GitHub repos
echo    GET  /api/gitlab/repos - List GitLab repos
echo ==================================================
echo.
echo 💡 Your server is now accessible from anywhere!
echo 🚀 Ready to migrate Java applications worldwide!
echo.
pause