#!/bin/bash
#
# Java Migration Accelerator - Build and Create Docker Tar File
# This script builds the Docker image and exports it as a tar file
#
# Usage: ./build-tar.sh [options]
#   --no-compress     Export uncompressed tar (faster, larger)
#   --output PATH     Specify output directory (default: current)
#   --clean           Remove intermediate images after build
#   --help            Show this help message

set -e

echo "=========================================="
echo "🐳 Java Migration Accelerator - Tar Builder"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default options
COMPRESS=true
OUTPUT_DIR="."
CLEAN=false
HELP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-compress)
            COMPRESS=false
            shift
            ;;
        --output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --help)
            HELP=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            HELP=true
            break
            ;;
    esac
done

if [ "$HELP" = true ]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --no-compress     Export uncompressed tar (faster, larger ~4GB)"
    echo "  --output PATH     Specify output directory (default: current)"
    echo "  --clean           Remove intermediate images after build"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                              # Build with compression"
    echo "  $0 --no-compress                # Build without compression"
    echo "  $0 --output /tmp/deploy --clean # Build and cleanup"
    exit 0
fi

# Create output directory
if [ ! -d "$OUTPUT_DIR" ]; then
    echo -e "${BLUE}Creating output directory: $OUTPUT_DIR${NC}"
    mkdir -p "$OUTPUT_DIR"
fi

# Check if Docker is running
echo -e "${BLUE}[1/5]${NC} Checking Docker daemon..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"
echo ""

# Check Dockerfile exists (navigate to project root if needed)
echo -e "${BLUE}[2/5]${NC} Checking Dockerfile..."
if [ ! -f "Dockerfile" ]; then
    if [ -f "../Dockerfile" ]; then
        cd ..
        echo -e "${YELLOW}Navigated to project root${NC}"
    else
        echo -e "${RED}✗ Dockerfile not found!${NC}"
        echo "Please run this script from the project root directory or docker-deployment directory"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Dockerfile found${NC}"
echo ""

# Build Docker image
echo -e "${BLUE}[3/5]${NC} Building Docker image..."
echo "This may take 10-20 minutes on first build..."
echo ""

if DOCKER_BUILDKIT=1 docker build -t java-migration-accelerator:latest \
    --progress=plain -f Dockerfile .; then
    echo ""
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo ""
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi
echo ""

# Get image size
IMAGE_ID=$(docker image ls | grep java-migration-accelerator | awk '{print $3}')
echo -e "${CYAN}Image ID: $IMAGE_ID${NC}"
echo ""

# Export tar file
echo -e "${BLUE}[4/5]${NC} Exporting Docker image as tar file..."
echo ""

if [ "$COMPRESS" = true ]; then
    TAR_FILE="$OUTPUT_DIR/java-migration-accelerator-latest.tar.gz"
    echo -e "${YELLOW}Mode: Compressed (gzip)${NC}"
    echo "Output: $TAR_FILE"
    echo ""
    echo "Saving and compressing (this may take 5-10 minutes)..."
    
    if docker save java-migration-accelerator:latest | gzip -9 > "$TAR_FILE"; then
        FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
        echo -e "${GREEN}✓ Tar file created successfully${NC}"
        echo "  File: $TAR_FILE"
        echo "  Size: $FILE_SIZE"
    else
        echo -e "${RED}✗ Failed to create tar file${NC}"
        exit 1
    fi
else
    TAR_FILE="$OUTPUT_DIR/java-migration-accelerator-latest.tar"
    echo -e "${YELLOW}Mode: Uncompressed${NC}"
    echo "Output: $TAR_FILE"
    echo ""
    echo "Saving (this may take 5-10 minutes)..."
    
    if docker save java-migration-accelerator:latest > "$TAR_FILE"; then
        FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
        echo -e "${GREEN}✓ Tar file created successfully${NC}"
        echo "  File: $TAR_FILE"
        echo "  Size: $FILE_SIZE"
    else
        echo -e "${RED}✗ Failed to create tar file${NC}"
        exit 1
    fi
fi
echo ""

# Cleanup if requested
if [ "$CLEAN" = true ]; then
    echo -e "${BLUE}[5/5]${NC} Cleaning up..."
    echo "Removing dangling images and build artifacts..."
    
    docker system prune -f > /dev/null
    
    echo -e "${GREEN}✓ Cleanup complete${NC}"
else
    echo -e "${BLUE}[5/5]${NC} Build complete (skipping cleanup)${NC}"
    echo ""
    echo "To free up space, run:"
    echo "  docker system prune -a"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ SUCCESS!${NC}"
echo "=========================================="
echo ""
echo "Tar file ready for deployment:"
echo "  📦 $TAR_FILE"
echo ""
echo "Next steps:"
echo "  1. Transfer tar file to target system"
echo "  2. Run: ./load-image.sh"
echo "  3. Run: docker-compose up -d"
echo ""
echo "Transfer examples:"
echo "  # Via SCP:"
echo "  scp $(basename $TAR_FILE) user@target:/path/"
echo ""
echo "  # Via HTTP server:"
echo "  python3 -m http.server 8000 --directory $OUTPUT_DIR"
echo "  # Then on target: wget http://source:8000/$(basename $TAR_FILE)"
echo ""
echo "Tar file info:"
echo "  Size: $(du -h "$TAR_FILE" | cut -f1)"
echo "  Compression: $([ "$COMPRESS" = true ] && echo "Yes (gzip)" || echo "No")"
echo ""
echo "To load on target system:"
echo "  ./load-image.sh"
echo ""
