# Java Migration Accelerator - Docker Image Loader (Windows PowerShell)
# This script loads the Docker tar file into your Docker daemon

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🐳 Java Migration Accelerator - Image Loader" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/4] Checking Docker daemon..." -ForegroundColor Blue
try {
    docker ps > $null 2>&1
    Write-Host "✓ Docker daemon is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again"
    exit 1
}
Write-Host ""

# Find tar file
Write-Host "[2/4] Locating Docker image tar file..." -ForegroundColor Blue
$tarFile = ""
$isCompressed = $false

if (Test-Path "java-migration-accelerator-latest.tar.gz") {
    $tarFile = "java-migration-accelerator-latest.tar.gz"
    $isCompressed = $true
} elseif (Test-Path "java-migration-accelerator-latest.tar") {
    $tarFile = "java-migration-accelerator-latest.tar"
    $isCompressed = $false
} else {
    Write-Host "✗ Docker tar file not found!" -ForegroundColor Red
    Write-Host "Expected: java-migration-accelerator-latest.tar.gz or .tar"
    Write-Host "Current directory: $(Get-Location)"
    Get-ChildItem
    exit 1
}

$fileSize = (Get-Item $tarFile).Length / 1GB
Write-Host "✓ Found tar file: $tarFile" -ForegroundColor Green
Write-Host "  Size: $([math]::Round($fileSize, 2)) GB"
Write-Host ""

# Load image
Write-Host "[3/4] Loading Docker image..." -ForegroundColor Blue
Write-Host "This may take 5-15 minutes depending on system speed..."
Write-Host ""

try {
    if ($isCompressed) {
        # For compressed tar.gz files
        Write-Host "Decompressing and loading..." -ForegroundColor Yellow
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo.FileName = "cmd.exe"
        $process.StartInfo.Arguments = "/c type `"$tarFile`" | docker load"
        # Alternative: using native PowerShell compression
        Get-Content $tarFile -ReadCount 0 -AsByteStream | Expand-Archive -DestinationPath . -ErrorAction SilentlyContinue
        # Fallback: use WinRAR or 7-Zip if available, or direct docker load
        docker load -i $tarFile
    } else {
        docker load -i $tarFile
    }
    Write-Host ""
    Write-Host "✓ Docker image loaded successfully" -ForegroundColor Green
} catch {
    Write-Host "Error loading image: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verify image
Write-Host "[4/4] Verifying image..." -ForegroundColor Blue
$imageExists = docker image ls | Select-String "java-migration-accelerator"

if ($imageExists) {
    $imageLine = docker image ls | Select-String "java-migration-accelerator" | Select-Object -First 1
    Write-Host "✓ Image verified: $imageLine" -ForegroundColor Green
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✓ SUCCESS! Image ready to deploy" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Copy .env.example to .env"
    Write-Host "  2. Edit .env with your configuration"
    Write-Host "  3. Run: docker-compose up -d"
    Write-Host ""
    Write-Host "Or run directly:"
    Write-Host "  docker run -p 8001:8001 java-migration-accelerator:latest"
    Write-Host ""
} else {
    Write-Host "✗ Image verification failed" -ForegroundColor Red
    exit 1
}
