#!/bin/bash
#
# Java Migration Accelerator - Application Startup Script (Linux/Mac)
# Starts the Docker container with proper environment configuration
#

set -e

echo "=========================================="
echo "🚀 Java Migration Accelerator - Startup"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if image exists
echo -e "${BLUE}[1/4]${NC} Checking Docker image..."
if ! docker image ls | grep -q "java-migration-accelerator"; then
    echo -e "${RED}✗ Docker image not found${NC}"
    echo "Please run ./load-image.sh first"
    exit 1
fi
echo -e "${GREEN}✓ Image found${NC}"
echo ""

# Check if .env exists
echo -e "${BLUE}[2/4]${NC} Checking configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}⚠ .env not found, creating from .env.example${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠ Edit .env with your GitHub/GitLab tokens before first use${NC}"
    else
        echo -e "${YELLOW}⚠ Creating minimal .env${NC}"
        cat > .env << 'EOF'
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
EOF
        echo -e "${YELLOW}⚠ Created .env file - please configure it with your tokens${NC}"
    fi
fi
echo -e "${GREEN}✓ Configuration ready${NC}"
echo ""

# Stop existing container if running
echo -e "${BLUE}[3/4]${NC} Checking for running containers..."
if docker ps | grep -q "java-migration"; then
    echo -e "${YELLOW}⚠ Stopping existing container...${NC}"
    docker stop java-migration-app 2>/dev/null || true
    sleep 2
fi
echo -e "${GREEN}✓ Ready to start${NC}"
echo ""

# Start container
echo -e "${BLUE}[4/4]${NC} Starting application..."
echo ""

if [ "$1" = "-d" ] || [ "$1" = "--daemon" ]; then
    # Detached mode
    docker run -d \
        --name java-migration-app \
        -p 8001:8001 \
        --env-file .env \
        -v migrations_data:/tmp/migrations \
        -v app_logs:/app/logs \
        -v app_data:/app/data \
        --restart unless-stopped \
        java-migration-accelerator:latest
    
    echo -e "${GREEN}✓ Application started in background${NC}"
    echo ""
    echo "View logs:"
    echo "  docker logs java-migration-app -f"
else
    # Interactive mode
    docker run -it \
        --name java-migration-app \
        -p 8001:8001 \
        --env-file .env \
        -v migrations_data:/tmp/migrations \
        -v app_logs:/app/logs \
        -v app_data:/app/data \
        --restart unless-stopped \
        java-migration-accelerator:latest
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Application is running!${NC}"
echo "=========================================="
echo ""
echo "Access the application:"
echo "  Frontend/Dashboard: http://localhost:8001"
echo "  API Documentation: http://localhost:8001/docs"
echo "  Health Check: http://localhost:8001/health"
echo ""
echo "Useful commands:"
echo "  docker logs java-migration-app -f      # View logs"
echo "  docker ps                              # Check container status"
echo "  docker stop java-migration-app         # Stop container"
echo "  docker rm java-migration-app           # Remove container"
echo ""
