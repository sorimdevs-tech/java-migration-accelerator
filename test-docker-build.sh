#!/bin/bash
# Test Docker build

echo "Building Docker image..."
docker build -t java-migration-accelerator:test .

if [ $? -eq 0 ]; then
    echo "✓ Build successful"
    echo "Running container..."
    docker run -d -p 8001:8001 --name java-migration-test java-migration-accelerator:test
    sleep 5
    
    echo "Testing frontend..."
    curl -s http://localhost:8001/ | head -20
    
    docker stop java-migration-test
    docker rm java-migration-test
else
    echo "✗ Build failed"
    exit 1
fi
