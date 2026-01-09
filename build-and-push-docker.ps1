# Java Migration Accelerator - Docker Build & Push Script
# Run this script to build and push your Docker image to GitHub

Write-Host "🚀 Java Migration Accelerator - Docker Build & Push Script" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Yellow

# Set Docker PATH
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"

# Check if Docker is running
Write-Host "📋 Checking Docker status..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is available: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not accessible. Please ensure Docker Desktop is running." -ForegroundColor Red
    Write-Host "   Start Docker Desktop from your Windows Start menu and try again." -ForegroundColor Yellow
    exit 1
}

# Build the Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Cyan
try {
    docker build -f Dockerfile.backend -t java-migration-accelerator:latest .
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build Docker image: $_" -ForegroundColor Red
    exit 1
}

# Check the built image
Write-Host "📦 Checking built image..." -ForegroundColor Cyan
docker images java-migration-accelerator:latest

# Login to GitHub Container Registry
Write-Host "🔐 Logging into GitHub Container Registry..." -ForegroundColor Cyan
Write-Host "Please enter your GitHub Personal Access Token:" -ForegroundColor Yellow
$githubToken = Read-Host -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($githubToken))

try {
    $tokenPlain | docker login ghcr.io -u sorimdevs-tech --password-stdin
    Write-Host "✅ Successfully logged into GitHub Container Registry!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to login to GitHub Container Registry: $_" -ForegroundColor Red
    exit 1
}

# Tag the image
Write-Host "🏷️ Tagging image for GitHub..." -ForegroundColor Cyan
docker tag java-migration-accelerator:latest ghcr.io/sorimdevs-tech/java-migration-accelerator:latest

# Push to GitHub
Write-Host "📤 Pushing image to GitHub Container Registry..." -ForegroundColor Cyan
try {
    docker push ghcr.io/sorimdevs-tech/java-migration-accelerator:latest
    Write-Host "✅ Successfully pushed to GitHub Container Registry!" -ForegroundColor Green
    Write-Host "🌐 Image available at: https://github.com/sorimdevs-tech/java-migration-accelerator/pkgs/container/java-migration-accelerator" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to push to GitHub: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Docker image build and push completed!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "   1. Deploy to Railway: railway up" -ForegroundColor White
Write-Host "   2. Check your public URL: railway domain" -ForegroundColor White
Write-Host "   3. Access API docs: https://your-url.up.railway.app/docs" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Yellow