# Fresh Bonds - Farm to Table Marketplace (Microservices)

A microservices-based farm-to-table marketplace connecting local farmers with customers.

## Architecture Overview

- **Frontend Service**: React.js web application
- **API Gateway**: Express.js gateway routing requests
- **User Service**: Authentication and user management
- **Product Service**: Product catalog and management
- **Database**: PostgreSQL with persistent storage

## Services

### 1. Frontend Service (Port 3000)
- React.js application with Tailwind CSS
- Serves the web interface for customers, farmers, and admins

### 2. API Gateway (Port 8080)
- Express.js gateway
- Routes requests to appropriate microservices
- Handles CORS and request logging

### 3. User Service (Port 3001)
- User authentication and authorization
- Role-based access control (Guest, Farmer, Admin)

### 4. Product Service (Port 3002)
- Product catalog management
- CRUD operations for products
- Visibility and inventory management

### 5. Database Service
- PostgreSQL database
- Persistent storage for users and products

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl CLI

### Local Development with Docker Compose
```bash
docker-compose up --build
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/
```

## API Endpoints

### User Service
- POST /api/users/login - User authentication
- GET /api/users/profile - Get user profile
- POST /api/users/logout - User logout

### Product Service
- GET /api/products - Get all visible products
- GET /api/products/:id - Get product by ID
- POST /api/products - Create new product (Farmer only)
- PUT /api/products/:id - Update product (Farmer/Admin)
- DELETE /api/products/:id - Delete product (Farmer/Admin)
- PATCH /api/products/:id/visibility - Toggle visibility (Admin only)

## Environment Variables

Each service uses environment variables for configuration:
- Database connection strings
- Service URLs
- JWT secrets
- Port configurations