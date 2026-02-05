# ========================================================================
# GitHub Token Fix & Docker Rebuild Script (PowerShell)
# ========================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "GitHub Token Fix & Docker Rebuild" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check current token
Write-Host "[1/5] Checking current GitHub token..." -ForegroundColor Blue
$envFile = "java-migration-backend/Java_Migration_Accelerator_backend/java-migration-backend/.env"
$envContent = Get-Content $envFile -Raw
$tokenMatch = $envContent | Select-String "GITHUB_TOKEN=(.+)" -AllMatches

if ($tokenMatch) {
    $currentToken = $tokenMatch.Matches[0].Groups[1].Value.Trim()
    $tokenLength = $currentToken.Length
    
    Write-Host "Current token: $($currentToken.Substring(0, [Math]::Min(15, $tokenLength)))... ($tokenLength chars)" -ForegroundColor Yellow
    
    if ($tokenLength -lt 35) {
        Write-Host "`n❌ ERROR: Token is too short ($tokenLength chars)" -ForegroundColor Red
        Write-Host "GitHub tokens should be 40-50+ characters starting with 'ghp_'" -ForegroundColor Red
        Write-Host "`nSOLUTION:" -ForegroundColor Green
        Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor White
        Write-Host "2. Generate new token (classic)" -ForegroundColor White
        Write-Host "3. Copy ENTIRE token (including ghp_ prefix)" -ForegroundColor White
        Write-Host "4. Update .env file" -ForegroundColor White
        Write-Host "5. Run this script again" -ForegroundColor White
        Read-Host "`nPress Enter to open GitHub tokens page..."
        Start-Process "https://github.com/settings/tokens"
        exit 1
    }
    
    Write-Host "✓ Token length OK: $tokenLength chars" -ForegroundColor Green
} else {
    Write-Host "⚠ WARNING: No GitHub token found in .env" -ForegroundColor Yellow
    Write-Host "`nVisit: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "Create a new token with scopes: repo, read:user" -ForegroundColor Cyan
    Read-Host "`nPress Enter to exit..."
    exit 1
}

Write-Host "`n[2/5] Stopping Docker container..." -ForegroundColor Blue
docker-compose down | Out-Null
Start-Sleep -Seconds 2
Write-Host "✓ Docker stopped" -ForegroundColor Green

Write-Host "`n[3/5] Cleaning Docker system..." -ForegroundColor Blue
docker system prune -f | Out-Null
Write-Host "✓ Docker cleaned" -ForegroundColor Green

Write-Host "`n[4/5] Building Docker image..." -ForegroundColor Blue
Write-Host "⏳ This may take 15-25 minutes on first build..." -ForegroundColor Yellow

$buildResult = docker build -t java-migration-accelerator:latest -f Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Docker build FAILED" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host "`n✓ Docker image built successfully" -ForegroundColor Green

Write-Host "`n[5/5] Starting Docker container..." -ForegroundColor Blue
docker-compose up -d

Start-Sleep -Seconds 5

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Verifying token..." -ForegroundColor Cyan
$logs = docker logs java-migration-app 2>$null | Select-String "Token length"
if ($logs) {
    Write-Host "✓ $logs" -ForegroundColor Green
} else {
    Write-Host "ℹ Logs not yet available (container starting)" -ForegroundColor Yellow
}

Write-Host "`nAccess at: http://localhost:8001" -ForegroundColor Green
Write-Host "`nView logs:" -ForegroundColor Cyan
Write-Host "  docker logs java-migration-app -f" -ForegroundColor White

Write-Host "`nCheck status:" -ForegroundColor Cyan
Write-Host "  docker ps | Select-String java-migration" -ForegroundColor White

Write-Host "`n" -ForegroundColor White
Read-Host "Press Enter to finish"
