#!/bin/bash

# Build Docker images for all services
echo "Building Fresh Bonds microservices images..."

# Build API Gateway
echo "Building API Gateway..."
docker build -t fresh-bonds/api-gateway:latest ./services/api-gateway

# Build User Service
echo "Building User Service..."
docker build -t fresh-bonds/user-service:latest ./services/user-service

# Build Product Service
echo "Building Product Service..."
docker build -t fresh-bonds/product-service:latest ./services/product-service

# Build Frontend
echo "Building Frontend..."
docker build -t fresh-bonds/frontend:latest ./services/frontend

echo "All images built successfully!"

# Tag images for registry (optional)
# docker tag fresh-bonds/api-gateway:latest your-registry/fresh-bonds/api-gateway:latest
# docker tag fresh-bonds/user-service:latest your-registry/fresh-bonds/user-service:latest
# docker tag fresh-bonds/product-service:latest your-registry/fresh-bonds/product-service:latest
# docker tag fresh-bonds/frontend:latest your-registry/fresh-bonds/frontend:latest

echo "To push to registry, uncomment and modify the registry URLs in this script"