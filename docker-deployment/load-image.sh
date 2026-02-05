#!/bin/bash
#
# Java Migration Accelerator - Docker Image Loader (Linux/Mac)
# This script loads the Docker tar file into your Docker daemon
#

set -e

echo "=========================================="
echo "🐳 Java Migration Accelerator - Image Loader"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${BLUE}[1/4]${NC} Checking Docker daemon..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"
echo ""

# Find tar file
echo -e "${BLUE}[2/4]${NC} Locating Docker image tar file..."
TAR_FILE=""

if [ -f "java-migration-accelerator-latest.tar.gz" ]; then
    TAR_FILE="java-migration-accelerator-latest.tar.gz"
    IS_COMPRESSED=true
elif [ -f "java-migration-accelerator-latest.tar" ]; then
    TAR_FILE="java-migration-accelerator-latest.tar"
    IS_COMPRESSED=false
else
    echo -e "${RED}✗ Docker tar file not found!${NC}"
    echo "Expected: java-migration-accelerator-latest.tar.gz or .tar"
    echo "Current directory: $(pwd)"
    ls -lh
    exit 1
fi

echo -e "${GREEN}✓ Found tar file: ${TAR_FILE}${NC}"
FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
echo "  Size: $FILE_SIZE"
echo ""

# Load image
echo -e "${BLUE}[3/4]${NC} Loading Docker image..."
echo "This may take 5-15 minutes depending on system speed..."
echo ""

if [ "$IS_COMPRESSED" = true ]; then
    gunzip -c "$TAR_FILE" | docker load
else
    docker load < "$TAR_FILE"
fi

echo ""
echo -e "${GREEN}✓ Docker image loaded successfully${NC}"
echo ""

# Verify image
echo -e "${BLUE}[4/4]${NC} Verifying image..."
if docker image ls | grep -q "java-migration-accelerator"; then
    IMAGE_ID=$(docker image ls | grep java-migration-accelerator | awk '{print $3}')
    echo -e "${GREEN}✓ Image verified: $IMAGE_ID${NC}"
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✓ SUCCESS! Image ready to deploy${NC}"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Copy .env.example to .env"
    echo "  2. Edit .env with your configuration"
    echo "  3. Run: docker-compose up -d"
    echo ""
    echo "Or run directly:"
    echo "  docker run -p 8001:8001 java-migration-accelerator:latest"
    echo ""
else
    echo -e "${RED}✗ Image verification failed${NC}"
    exit 1
fi
