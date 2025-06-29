#!/bin/bash

# Deploy Fresh Bonds to Kubernetes
echo "Deploying Fresh Bonds to Kubernetes..."

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Deploy database
echo "Deploying PostgreSQL database..."
kubectl apply -f k8s/postgres-configmap.yaml
kubectl apply -f k8s/postgres-secret.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-init-configmap.yaml
kubectl apply -f k8s/postgres-deployment.yaml

# Wait for database to be ready
echo "Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n fresh-bonds --timeout=300s

# Deploy services
echo "Deploying microservices..."
kubectl apply -f k8s/user-service-deployment.yaml
kubectl apply -f k8s/product-service-deployment.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress and load balancer
echo "Deploying ingress and load balancer..."
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/load-balancer.yaml

# Deploy HPA
echo "Deploying Horizontal Pod Autoscalers..."
kubectl apply -f k8s/hpa.yaml

# Wait for deployments
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment --all -n fresh-bonds --timeout=300s

echo "Deployment complete!"
echo ""
echo "To access the application:"
echo "1. Get the LoadBalancer IP:"
echo "   kubectl get svc fresh-bonds-loadbalancer -n fresh-bonds"
echo ""
echo "2. Add to /etc/hosts (for ingress):"
echo "   <EXTERNAL-IP> fresh-bonds.local"
echo ""
echo "3. Access the application:"
echo "   http://fresh-bonds.local (or http://<EXTERNAL-IP>)"
echo ""
echo "To check status:"
echo "   kubectl get pods -n fresh-bonds"
echo "   kubectl get svc -n fresh-bonds"