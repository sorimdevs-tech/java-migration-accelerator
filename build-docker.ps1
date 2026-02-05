#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Java Migration Accelerator - Docker Build and Deploy Script
.DESCRIPTION
    Builds Docker image, creates tar file for distribution, and tests container
.PARAMETER BuildType
    1 = Full build (Default), 2 = Backend only, 3 = Frontend only
.PARAMETER CreateTar
    Create tar.gz file for distribution (Default: true)
.PARAMETER TestContainer
    Run container test after build (Default: true)
.EXAMPLE
    .\build-docker.ps1 -BuildType 1 -CreateTar $true -TestContainer $true
#>

param(
    [ValidateSet(1, 2, 3)][int]$BuildType = 1,
    [bool]$CreateTar = $true,
    [bool]$TestContainer = $true
)

$ErrorActionPreference = "Stop"

# Configuration
$ProjectName = "java-migration-accelerator"
$Version = "1.0.0"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Color codes
$Colors = @{
    "OK"      = "Green"
    "ERROR"   = "Red"
    "WARNING" = "Yellow"
    "INFO"    = "Cyan"
}

function Write-Status {
    param(
        [Parameter(Mandatory = $true)][string]$Type,
        [Parameter(Mandatory = $true)][string]$Message
    )
    $Color = $Colors[$Type]
    Write-Host "[$Type] $Message" -ForegroundColor $Color
}

function Test-DockerInstalled {
    try {
        $version = docker --version 2>&1
        Write-Status "OK" "Docker is installed: $version"
        return $true
    }
    catch {
        Write-Status "ERROR" "Docker is not installed or not in PATH"
        Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        return $false
    }
}

function Test-DockerRunning {
    try {
        docker info *> $null
        Write-Status "OK" "Docker daemon is running"
        return $true
    }
    catch {
        Write-Status "ERROR" "Docker daemon is not running"
        Write-Host "Please start Docker Desktop" -ForegroundColor Yellow
        return $false
    }
}

function Test-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Status "WARNING" ".env file not found"
        Write-Status "INFO" "Creating template .env file..."
        
        $envContent = @"
# Git Platform Tokens
GITHUB_TOKEN=your_token_here
GITLAB_TOKEN=your_token_here

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_password

# SonarQube Configuration
SONARQUBE_URL=https://sonarcloud.io
SONARQUBE_TOKEN=your_token

# Application Settings
WORK_DIR=/tmp/migrations
NODE_ENV=production
"@
        
        Set-Content -Path ".env" -Value $envContent
        Write-Status "INFO" "Created .env file - please update with your tokens"
    }
}

function Build-DockerImage {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "Building Docker Image" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Status "INFO" "Cleaning up old images..."
    docker image prune -f *> $null
    
    Write-Status "INFO" "Building Docker image: $ProjectName`:$Version"
    Write-Host ""
    
    try {
        docker build `
            -t "$ProjectName`:$Version" `
            -t "$ProjectName`:latest" `
            --progress=plain `
            .
        
        Write-Status "OK" "Docker image built successfully"
    }
    catch {
        Write-Status "ERROR" "Docker build failed: $_"
        return $false
    }
    
    # Display image info
    Write-Host ""
    docker images | Select-String $ProjectName
    return $true
}

function Create-TarFile {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "Creating Tar Distribution File" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $TarFile = "$ProjectName-$Version-$Timestamp.tar.gz"
    $TarFilePlain = "$ProjectName-$Version.tar"
    
    Write-Status "INFO" "Exporting Docker image to tar file..."
    Write-Status "INFO" "File: $TarFile"
    Write-Host ""
    
    try {
        # Try compressed version first
        $process = @{
            FilePath       = "docker"
            ArgumentList   = "save", "$ProjectName`:$Version"
            NoNewWindow    = $true
            RedirectStandardOutput = $true
        }
        
        $dockerSave = Start-Process @process -PassThru
        $TarPath = (Get-Location).Path + "\$TarFile"
        
        Get-Content "\\.\pipe\$($dockerSave.Id)_stdout" | 
            & { 
                param($null)
                [System.IO.Compression.GzipStream]::new(
                    [System.IO.File]::Create($TarPath),
                    [System.IO.Compression.CompressionMode]::Compress
                ).Dispose()
            }
        
        # Fallback to uncompressed if needed
        if (-not (Test-Path $TarPath) -or (Get-Item $TarPath).Length -eq 0) {
            Write-Status "WARNING" "Compressed tar failed, creating uncompressed tar..."
            docker save -o $TarFilePlain "$ProjectName`:$Version"
            
            if (Test-Path $TarFilePlain) {
                $TarPath = $TarFilePlain
                Write-Status "OK" "Created uncompressed tar file: $TarFilePlain"
            }
        }
        else {
            Write-Status "OK" "Created compressed tar file: $TarFile"
        }
        
        if (Test-Path $TarPath) {
            $TarSize = (Get-Item $TarPath).Length / 1MB
            Write-Status "INFO" "File Size: $([Math]::Round($TarSize, 2)) MB"
            Write-Host "Location: $(Get-Item $TarPath | Select-Object -ExpandProperty FullName)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Status "WARNING" "Failed to create tar file: $_"
    }
}

function Test-Container {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "Testing Docker Container" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $TestContainerName = "$ProjectName-test"
    
    try {
        Write-Status "INFO" "Starting test container..."
        docker run -d `
            --name $TestContainerName `
            -p 8001:8001 `
            --env-file .env `
            -v migrations_test:/tmp/migrations `
            "$ProjectName`:$Version" *> $null
        
        Write-Status "OK" "Test container started"
        Write-Host ""
        
        Write-Status "INFO" "Waiting for container to be ready (5 seconds)..."
        Start-Sleep -Seconds 5
        
        # Check health
        Write-Status "INFO" "Checking container health..."
        try {
            docker exec $TestContainerName curl -f http://localhost:8001/health *> $null
            Write-Status "OK" "Container health check passed"
            Write-Host ""
            Write-Host "✓ Frontend accessible at: http://localhost:8001" -ForegroundColor Green
            Write-Host "✓ Backend API at: http://localhost:8001/docs" -ForegroundColor Green
            Write-Host "✓ API Swagger UI available" -ForegroundColor Green
        }
        catch {
            Write-Status "WARNING" "Health check failed"
            Write-Status "INFO" "Container logs:"
            docker logs $TestContainerName
        }
        
        Write-Host ""
        Write-Status "INFO" "Stopping test container..."
        docker stop $TestContainerName *> $null
        docker rm $TestContainerName *> $null
        Write-Status "OK" "Test container cleaned up"
    }
    catch {
        Write-Status "ERROR" "Container test failed: $_"
        docker stop $TestContainerName *> $null -ErrorAction SilentlyContinue
        docker rm $TestContainerName *> $null -ErrorAction SilentlyContinue
    }
}

function Show-Summary {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "Docker Build Complete!" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Get image info
    $ImageInfo = docker images "$ProjectName`:$Version" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Select-Object -Skip 1
    
    if ($ImageInfo) {
        Write-Host "Image Information:" -ForegroundColor Yellow
        Write-Host "  Name: $ProjectName`:$Version" -ForegroundColor Gray
        Write-Host "  Size: $(($ImageInfo -split '\s+')[2])" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Update .env file with your GitHub/GitLab tokens" -ForegroundColor Gray
    Write-Host "  2. Start container: docker-compose up -d" -ForegroundColor Gray
    Write-Host "  3. Access frontend: http://localhost:8001" -ForegroundColor Gray
    Write-Host "  4. View API docs: http://localhost:8001/docs" -ForegroundColor Gray
    Write-Host "  5. View logs: docker-compose logs -f" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "Useful Commands:" -ForegroundColor Yellow
    Write-Host "  Stop container:      docker-compose down" -ForegroundColor Gray
    Write-Host "  Remove image:        docker rmi $ProjectName`:$Version" -ForegroundColor Gray
    Write-Host "  View container logs: docker logs $ProjectName" -ForegroundColor Gray
    Write-Host "  Execute command:     docker exec $ProjectName ps aux" -ForegroundColor Gray
    
    Write-Host ""
}

# Main execution
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Java Migration Accelerator - Docker Build Script" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Prerequisites checks
if (-not (Test-DockerInstalled)) { exit 1 }
if (-not (Test-DockerRunning)) { exit 1 }

Write-Host ""
Test-EnvFile

# Build
if (-not (Build-DockerImage)) { exit 1 }

# Create tar file
if ($CreateTar) {
    Create-TarFile
}

# Test container
if ($TestContainer) {
    Test-Container
}

# Show summary
Show-Summary

Write-Host "Press Enter to exit..."
$null = Read-Host
