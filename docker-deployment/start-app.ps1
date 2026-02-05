# Java Migration Accelerator - Application Startup (Windows PowerShell)
# Starts the Docker container with proper environment configuration

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Java Migration Accelerator - Startup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if image exists
Write-Host "[1/4] Checking Docker image..." -ForegroundColor Blue
$imageExists = docker image ls | Select-String "java-migration-accelerator"

if (-not $imageExists) {
    Write-Host "✗ Docker image not found" -ForegroundColor Red
    Write-Host "Please run .\load-image.ps1 first"
    exit 1
}
Write-Host "✓ Image found" -ForegroundColor Green
Write-Host ""

# Check if .env exists
Write-Host "[2/4] Checking configuration..." -ForegroundColor Blue
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "⚠ .env not found, creating from .env.example" -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "⚠ Edit .env with your GitHub/GitLab tokens before first use" -ForegroundColor Yellow
    } else {
        Write-Host "⚠ Creating minimal .env" -ForegroundColor Yellow
        $envContent = @"
GITHUB_TOKEN=
GITLAB_TOKEN=
GITLAB_URL=https://gitlab.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=
FOSSA_API_KEY=
WORK_DIR=/tmp/migrations
NODE_ENV=production
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
"@
        Set-Content -Path ".env" -Value $envContent
        Write-Host "⚠ Created .env file - please configure it with your tokens" -ForegroundColor Yellow
    }
}
Write-Host "✓ Configuration ready" -ForegroundColor Green
Write-Host ""

# Stop existing container if running
Write-Host "[3/4] Checking for running containers..." -ForegroundColor Blue
$runningContainer = docker ps | Select-String "java-migration"

if ($runningContainer) {
    Write-Host "⚠ Stopping existing container..." -ForegroundColor Yellow
    docker stop java-migration-app 2> $null
    Start-Sleep -Seconds 2
}
Write-Host "✓ Ready to start" -ForegroundColor Green
Write-Host ""

# Start container
Write-Host "[4/4] Starting application..." -ForegroundColor Blue
Write-Host ""

try {
    $detached = $args -contains "-d" -or $args -contains "--daemon"
    
    $dockerArgs = @(
        "run"
        if ($detached) { "-d" } else { "-it" }
        "--name", "java-migration-app"
        "-p", "8001:8001"
        "--env-file", ".env"
        "-v", "migrations_data:/tmp/migrations"
        "-v", "app_logs:/app/logs"
        "-v", "app_data:/app/data"
        "--restart", "unless-stopped"
        "java-migration-accelerator:latest"
    )
    
    & docker @dockerArgs
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✓ Application is running!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application:"
    Write-Host "  Frontend/Dashboard: http://localhost:8001"
    Write-Host "  API Documentation: http://localhost:8001/docs"
    Write-Host "  Health Check: http://localhost:8001/health"
    Write-Host ""
    Write-Host "Useful commands:"
    Write-Host "  docker logs java-migration-app -f      # View logs"
    Write-Host "  docker ps                              # Check container status"
    Write-Host "  docker stop java-migration-app         # Stop container"
    Write-Host "  docker rm java-migration-app           # Remove container"
    Write-Host ""
    
} catch {
    Write-Host "Error starting application: $_" -ForegroundColor Red
    exit 1
}
