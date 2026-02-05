# ════════════════════════════════════════════════════════════════════════════════
# Java Migration Accelerator - Docker Rebuild & Fix Script (PowerShell)
# ════════════════════════════════════════════════════════════════════════════════
# Purpose: Fix GitHub token and rebuild Docker image completely
# Usage: .\rebuild-and-fix.ps1
# ════════════════════════════════════════════════════════════════════════════════

param(
    [string]$Token = ""
)

# Color output
function Write-Status { Write-Host $args[0] -ForegroundColor Cyan }
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Error { Write-Host $args[0] -ForegroundColor Red }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }

# ════════════════════════════════════════════════════════════════════════════════
# STEP 0: Verify Docker is running
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n🔍 Checking Docker daemon..."
$dockerStatus = docker ps 2>&1 | Select-Object -First 1
if ($dockerStatus -like "*Cannot connect*" -or $dockerStatus -like "*error*") {
    Write-Error "❌ Docker is not running!"
    Write-Warning "Please start Docker Desktop and try again."
    exit 1
}
Write-Success "✓ Docker is running"

# ════════════════════════════════════════════════════════════════════════════════
# STEP 1: Check/Get GitHub Token
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n📋 STEP 1: GitHub Token Setup"
Write-Status "════════════════════════════════════════════════════════════════════════════════"

$envPath = ".\java-migration-backend\Java_Migration_Accelerator_backend\java-migration-backend\.env"

if (-not (Test-Path $envPath)) {
    Write-Error "❌ .env file not found at: $envPath"
    exit 1
}

# Read current token
$envContent = Get-Content $envPath -Raw
$currentToken = ""
if ($envContent -match 'GITHUB_TOKEN=(.+?)(?:\r?\n|$)') {
    $currentToken = $matches[1].Trim('"')
}

Write-Host "Current token length: $($currentToken.Length) chars"

if ($currentToken.Length -lt 40) {
    Write-Warning "⚠️  Token is INVALID (only $($currentToken.Length) chars, need 40+)"
} else {
    Write-Success "✓ Token appears valid ($($currentToken.Length) chars)"
}

# Prompt for new token if needed
if ($Token -eq "" -and $currentToken.Length -lt 40) {
    Write-Host ""
    Write-Host "🔗 Open this link to generate a new token:"
    Write-Host "   https://github.com/settings/tokens" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Instructions:"
    Write-Host "  1. Click: Generate new token → Generate new token (classic)"
    Write-Host "  2. Name: Java Migration Accelerator"
    Write-Host "  3. Expiration: 90 days"
    Write-Host "  4. Scopes: Check 'repo' and 'read:user'"
    Write-Host "  5. Copy the full token (won't show again!)"
    Write-Host ""
    $Token = Read-Host "Paste your new GitHub token"
}

if ($Token -eq "") {
    Write-Warning "⚠️  No token provided, using existing token"
    $Token = $currentToken
}

# Validate token format
if ($Token -notmatch '^ghp_[A-Za-z0-9]{36,50}$') {
    Write-Error "❌ Invalid token format!"
    Write-Host "   Expected format: ghp_[40-50 characters]"
    Write-Host "   Got: $($Token.Substring(0, [Math]::Min(20, $Token.Length)))..."
    exit 1
}

Write-Success "✓ Token validated ($($Token.Length) chars)"

# Update .env file
Write-Status "`n📝 Updating .env file..."
$newEnvContent = $envContent -replace 'GITHUB_TOKEN=.+?(?=\r?\n|$)', "GITHUB_TOKEN=$Token"
Set-Content -Path $envPath -Value $newEnvContent -NoNewline
Write-Success "✓ .env updated with new token"

# ════════════════════════════════════════════════════════════════════════════════
# STEP 2: Stop existing containers
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n🛑 STEP 2: Stop existing containers"
Write-Status "════════════════════════════════════════════════════════════════════════════════"

$runningContainers = docker ps --format "{{.Names}}" | Select-String "java-migration"
if ($runningContainers) {
    Write-Host "Stopping containers..."
    docker-compose down -v 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    Write-Success "✓ Containers stopped"
} else {
    Write-Host "ℹ️  No running containers found"
}

# ════════════════════════════════════════════════════════════════════════════════
# STEP 3: Clean Docker resources
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n🧹 STEP 3: Clean Docker resources"
Write-Status "════════════════════════════════════════════════════════════════════════════════"

Write-Host "Removing old image..."
docker rmi java-migration-accelerator:latest 2>&1 | Out-Null
Write-Host "Pruning unused resources..."
docker system prune -f 2>&1 | Out-Null
Write-Success "✓ Docker resources cleaned"

# ════════════════════════════════════════════════════════════════════════════════
# STEP 4: Build Docker image
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n🔨 STEP 4: Building Docker image"
Write-Status "════════════════════════════════════════════════════════════════════════════════"
Write-Host "⏳ This may take 15-25 minutes..."
Write-Host ""

$buildOutput = docker build -t java-migration-accelerator:latest -f Dockerfile . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Docker build failed!"
    Write-Host $buildOutput
    exit 1
}

Write-Success "✓ Docker image built successfully"

# ════════════════════════════════════════════════════════════════════════════════
# STEP 5: Start containers
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n🚀 STEP 5: Starting containers"
Write-Status "════════════════════════════════════════════════════════════════════════════════"

docker-compose up -d 2>&1 | Out-Null
Write-Success "✓ Containers started"

# Wait for containers to stabilize
Write-Host "⏳ Waiting for application to start..."
Start-Sleep -Seconds 5

# ════════════════════════════════════════════════════════════════════════════════
# STEP 6: Verify
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n✅ STEP 6: Verification"
Write-Status "════════════════════════════════════════════════════════════════════════════════"

# Check if containers are running
$running = docker ps --format "{{.Names}}" | Select-String "java-migration"
if ($running) {
    Write-Success "✓ Containers are running"
} else {
    Write-Error "❌ Containers are not running"
    exit 1
}

# Wait a bit more for startup
Start-Sleep -Seconds 5

# Check token in logs
Write-Host "Checking token in logs..."
$logs = docker logs java-migration-app 2>&1
$tokenLine = $logs | Select-String "Token length:" | Select-Object -Last 1
if ($tokenLine) {
    Write-Host $tokenLine
    if ($tokenLine -match "40|4[1-9]|5[0-9]") {
        Write-Success "✓ Token is valid (40+ chars)"
    } else {
        Write-Warning "⚠️  Token length unexpected - check logs"
    }
}

# Check if API is responding
Write-Host "Testing API..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/java-versions" -ErrorAction Stop
    Write-Success "✓ Backend API is responding"
} catch {
    Write-Warning "⚠️  Backend may still be starting..."
}

# ════════════════════════════════════════════════════════════════════════════════
# STEP 7: Final instructions
# ════════════════════════════════════════════════════════════════════════════════

Write-Status "`n🎉 STEP 7: Next Steps"
Write-Status "════════════════════════════════════════════════════════════════════════════════"

Write-Host "✓ Rebuild complete! Your application is starting..."
Write-Host ""
Write-Host "📍 Access the application at:"
Write-Host "   Frontend: http://localhost:8001" -ForegroundColor Blue
Write-Host "   API Docs: http://localhost:8001/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "🧪 Test the fix:"
Write-Host "   1. Open http://localhost:8001"
Write-Host "   2. Paste a GitHub repo URL"
Write-Host "   3. Should work without 400/401 errors!"
Write-Host ""
Write-Host "📋 Watch the logs:"
Write-Host "   docker logs java-migration-app -f" -ForegroundColor Blue
Write-Host ""
Write-Host "🛑 To stop the application:"
Write-Host "   docker-compose down" -ForegroundColor Blue
Write-Host ""

Write-Success "✅ All done!"
