#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix GitHub Token and Rebuild Docker - Complete Solution
.DESCRIPTION
    This script will:
    1. Ask for your new GitHub token
    2. Update the .env file
    3. Restart Docker container
    4. Verify everything works
.EXAMPLE
    .\fix-token-and-run.ps1
#>

param()

# Colors
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Error { Write-Host $args[0] -ForegroundColor Red }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }
function Write-Info { Write-Host $args[0] -ForegroundColor Cyan }

Clear-Host

Write-Info "`n════════════════════════════════════════════════════════════════════════════════"
Write-Info "              🔧 FIX GITHUB TOKEN & REBUILD DOCKER"
Write-Info "════════════════════════════════════════════════════════════════════════════════`n"

Write-Host "STEP 1: GENERATE NEW GITHUB TOKEN"
Write-Host "═════════════════════════════════════════════════════════════════════════════`n"

Write-Host "Your current token is INVALID. Follow these steps to get a new one:`n"
Write-Host "1. Open: https://github.com/settings/tokens" -ForegroundColor Blue
Write-Host "2. Click: 'Generate new token' → 'Generate new token (classic)'"
Write-Host "3. Configure:"
Write-Host "   - Token name: Java Migration Accelerator"
Write-Host "   - Expiration: 90 days"
Write-Host "   - Scopes: ✓ repo, ✓ read:user"
Write-Host "4. Click: 'Generate token'"
Write-Host "5. COPY THE FULL TOKEN IMMEDIATELY (won't show again!)`n"

Write-Host "═════════════════════════════════════════════════════════════════════════════`n"

# Get token from user
$token = Read-Host "Paste your NEW GitHub token (starts with ghp_)"

# Validate token
if ($token -eq "") {
    Write-Error "❌ No token provided!"
    exit 1
}

if (-not ($token -match '^ghp_[A-Za-z0-9]{36,50}$')) {
    Write-Warning "⚠️  Token format may be invalid (should start with 'ghp_' and be 40+ chars)"
    Write-Host "Token length: $($token.Length) chars"
    $continue = Read-Host "Continue anyway? (yes/no)"
    if ($continue -ne "yes") {
        Write-Error "❌ Cancelled"
        exit 1
    }
}

Write-Success "✓ Token received: $($token.Substring(0, 10))...***(hidden)**`n"

# Update .env file
Write-Info "`nSTEP 2: UPDATE .env FILE"
Write-Info "═════════════════════════════════════════════════════════════════════════════`n"

$envPath = "c:\Users\MSI\java-migration-accelerator\.env"

if (-not (Test-Path $envPath)) {
    Write-Error "❌ .env file not found at: $envPath"
    exit 1
}

# Read current .env
$envContent = Get-Content $envPath -Raw

# Replace the token
$newEnvContent = $envContent -replace 'GITHUB_TOKEN=.+?(?=\r?\n|$)', "GITHUB_TOKEN=$token"

# Write back
Set-Content -Path $envPath -Value $newEnvContent -NoNewline
Write-Success "✓ .env file updated with new token`n"

# Docker operations
Write-Info "STEP 3: RESTART DOCKER"
Write-Info "═════════════════════════════════════════════════════════════════════════════`n"

Set-Location "c:\Users\MSI\java-migration-accelerator"

Write-Host "Stopping containers..."
docker-compose down 2>&1 | Out-Null
Start-Sleep -Seconds 3

Write-Host "Starting containers..."
docker-compose up -d 2>&1 | Out-Null
Write-Success "✓ Containers restarted`n"

Write-Host "Waiting for application to start..."
Start-Sleep -Seconds 5

# Verify
Write-Info "STEP 4: VERIFICATION"
Write-Info "═════════════════════════════════════════════════════════════════════════════`n"

# Check container status
$running = docker ps --format "{{.Names}}" | Select-String "java-migration-accelerator"
if ($running) {
    Write-Success "✓ Container is running"
} else {
    Write-Error "❌ Container is not running"
    exit 1
}

# Check logs
$logs = docker logs java-migration-accelerator 2>&1
$tokenLine = $logs | Select-String "Token length:" | Select-Object -Last 1
if ($tokenLine) {
    Write-Host "  $tokenLine"
}

$initLine = $logs | Select-String "\[INIT\] GitHub token loaded:" | Select-Object -Last 1
if ($initLine) {
    Write-Host "  $initLine"
}

# Test API
Write-Host "`nTesting API..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/java-versions" -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Success "✓ Backend API responding (200 OK)"
    }
} catch {
    Write-Warning "⚠️  API test failed - container may still be starting"
}

# Final summary
Write-Info "`n════════════════════════════════════════════════════════════════════════════════"
Write-Info "                    ✅ SETUP COMPLETE!"
Write-Info "════════════════════════════════════════════════════════════════════════════════`n"

Write-Host "Your application is ready! 🚀`n"
Write-Host "Access it at: http://localhost:8001" -ForegroundColor Blue
Write-Host "API Docs at: http://localhost:8001/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open http://localhost:8001 in your browser"
Write-Host "2. Try analyzing a GitHub repository"
Write-Host "3. Should work WITHOUT 401/403 errors!"
Write-Host ""
Write-Host "If you still get errors:"
Write-Host "  • Check logs: docker logs java-migration-accelerator -f"
Write-Host "  • Verify token: docker logs java-migration-accelerator | Select-String 'Token'"
Write-Host "  • Stop all: docker-compose down"
Write-Host ""

Write-Success "✅ All done! Enjoy your Java Migration Accelerator! 🎉`n"
