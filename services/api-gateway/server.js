const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

console.log('🔗 Service URLs:');
console.log('📡 User Service:', USER_SERVICE_URL);
console.log('📦 Product Service:', PRODUCT_SERVICE_URL);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() });
});

// Proxy configurations
const userServiceProxy = createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users',
  },
  onError: (err, req, res) => {
    console.error('User service proxy error:', err.message);
    res.status(503).json({ error: 'User service unavailable', details: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} to User Service`);
  }
});

const productServiceProxy = createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/api/products',
  },
  onError: (err, req, res) => {
    console.error('Product service proxy error:', err.message);
    res.status(503).json({ error: 'Product service unavailable', details: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} to Product Service`);
  }
});

// Route proxying
app.use('/api/users', userServiceProxy);
app.use('/api/products', productServiceProxy);

// Default route
app.get('/api', (req, res) => {
  res.json({
    message: 'Fresh Bonds API Gateway',
    version: '1.0.0',
    services: {
      users: '/api/users',
      products: '/api/products'
    },
    endpoints: {
      health: '/health',
      userLogin: '/api/users/login',
      userProfile: '/api/users/profile',
      products: '/api/products',
      productById: '/api/products/:id'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 User Service: ${USER_SERVICE_URL}`);
  console.log(`📦 Product Service: ${PRODUCT_SERVICE_URL}`);
});