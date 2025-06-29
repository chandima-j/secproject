const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@dev.qzhiudx.mongodb.net/fresh_bonds?retryWrites=true&w=majority&appName=Dev';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // Create sample products if they don't exist
    createSampleProducts();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📦 ${req.method} ${req.path}`, {
    body: req.method !== 'GET' ? req.body : undefined,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer [HIDDEN]' : undefined
    }
  });
  next();
});

// Create sample products
async function createSampleProducts() {
  try {
    const existingProducts = await Product.countDocuments();
    if (existingProducts === 0) {
      console.log('🌱 Creating sample products...');
      
      const sampleProducts = [
        {
          name: 'Organic Heirloom Tomatoes',
          description: 'Fresh, juicy heirloom tomatoes grown using organic methods. Perfect for salads, sandwiches, or cooking.',
          price: 6.99,
          category: 'Vegetables',
          image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
          farmerId: '1',
          farmerName: 'Sarah Thompson',
          farmerLocation: 'Sonoma County, CA',
          farmerMobile: '+1-555-0123',
          inStock: true,
          isVisible: true,
          harvestDate: new Date('2025-01-15'),
          organic: true,
          quantity: '2',
          unit: 'lbs'
        },
        {
          name: 'Fresh Organic Eggs',
          description: 'Farm-fresh eggs from free-range chickens. Rich, golden yolks and superior taste.',
          price: 8.50,
          category: 'Dairy & Eggs',
          image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800',
          farmerId: '1',
          farmerName: 'Sarah Thompson',
          farmerLocation: 'Sonoma County, CA',
          farmerMobile: '+1-555-0123',
          inStock: true,
          isVisible: true,
          harvestDate: new Date('2025-01-16'),
          organic: true,
          quantity: '12',
          unit: 'count'
        },
        {
          name: 'Crisp Lettuce Mix',
          description: 'A delightful mix of fresh lettuce varieties. Perfect for salads and sandwiches.',
          price: 4.25,
          category: 'Vegetables',
          image: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg?auto=compress&cs=tinysrgb&w=800',
          farmerId: '1',
          farmerName: 'Sarah Thompson',
          farmerLocation: 'Sonoma County, CA',
          farmerMobile: '+1-555-0123',
          inStock: true,
          isVisible: true,
          harvestDate: new Date('2025-01-14'),
          organic: true,
          quantity: '1',
          unit: 'head'
        },
        {
          name: 'Sweet Strawberries',
          description: 'Juicy, sweet strawberries picked at peak ripeness. Perfect for eating fresh or desserts.',
          price: 7.99,
          category: 'Fruits',
          image: 'https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&cs=tinysrgb&w=800',
          farmerId: '1',
          farmerName: 'Sarah Thompson',
          farmerLocation: 'Sonoma County, CA',
          farmerMobile: '+1-555-0123',
          inStock: true,
          isVisible: true,
          harvestDate: new Date('2025-01-15'),
          organic: true,
          quantity: '1',
          unit: 'pint'
        },
        {
          name: 'Artisan Honey',
          description: 'Pure, raw honey harvested from our own beehives. Complex floral flavor, unfiltered and unpasteurized.',
          price: 12.99,
          category: 'Pantry',
          image: 'https://images.pexels.com/photos/316908/pexels-photo-316908.jpeg?auto=compress&cs=tinysrgb&w=800',
          farmerId: '1',
          farmerName: 'Sarah Thompson',
          farmerLocation: 'Sonoma County, CA',
          farmerMobile: '+1-555-0123',
          inStock: true,
          isVisible: true,
          harvestDate: new Date('2025-01-05'),
          organic: true,
          quantity: '12',
          unit: 'oz'
        }
      ];

      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Product Service', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString() 
  });
});

// Get all visible products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Getting all visible products');
    const products = await Product.find({ isVisible: true })
      .sort({ createdAt: -1 });
    
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      farmerMobile: product.farmerMobile,
      inStock: product.inStock,
      isVisible: product.isVisible,
      harvestDate: product.harvestDate,
      organic: product.organic,
      quantity: product.quantity,
      unit: product.unit,
      createdAt: product.createdAt
    }));

    console.log(`✅ Found ${formattedProducts.length} visible products`);
    res.json(formattedProducts);
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get all products (admin only)
app.get('/api/products/all', async (req, res) => {
  try {
    console.log('📦 Getting all products (admin)');
    const products = await Product.find({})
      .sort({ createdAt: -1 });
    
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      farmerMobile: product.farmerMobile,
      inStock: product.inStock,
      isVisible: product.isVisible,
      harvestDate: product.harvestDate,
      organic: product.organic,
      quantity: product.quantity,
      unit: product.unit,
      createdAt: product.createdAt
    }));

    console.log(`✅ Found ${formattedProducts.length} total products`);
    res.json(formattedProducts);
  } catch (error) {
    console.error('❌ Get all products error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Getting product by ID:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid product ID format:', id);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      console.log('❌ Product not found:', id);
      return res.status(404).json({ error: 'Product not found' });
    }

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      farmerMobile: product.farmerMobile,
      inStock: product.inStock,
      isVisible: product.isVisible,
      harvestDate: product.harvestDate,
      organic: product.organic,
      quantity: product.quantity,
      unit: product.unit,
      createdAt: product.createdAt
    };

    console.log('✅ Product found:', product.name);
    res.json(formattedProduct);
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get products by farmer
app.get('/api/products/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log('📦 Getting products for farmer:', farmerId);
    
    const products = await Product.find({ farmerId })
      .sort({ createdAt: -1 });
    
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      farmerMobile: product.farmerMobile,
      inStock: product.inStock,
      isVisible: product.isVisible,
      harvestDate: product.harvestDate,
      organic: product.organic,
      quantity: product.quantity,
      unit: product.unit,
      createdAt: product.createdAt
    }));

    console.log(`✅ Found ${formattedProducts.length} products for farmer ${farmerId}`);
    res.json(formattedProducts);
  } catch (error) {
    console.error('❌ Get farmer products error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Create new product
app.post('/api/products', async (req, res) => {
  try {
    console.log('📦 Creating new product:', req.body);
    const productData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category', 'farmerId', 'farmerName', 'farmerLocation', 'quantity', 'unit', 'harvestDate'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields,
        message: `The following fields are required: ${missingFields.join(', ')}` 
      });
    }

    // Validate price
    if (isNaN(productData.price) || productData.price <= 0) {
      console.log('❌ Invalid price:', productData.price);
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    // Validate harvest date
    const harvestDate = new Date(productData.harvestDate);
    if (isNaN(harvestDate.getTime())) {
      console.log('❌ Invalid harvest date:', productData.harvestDate);
      return res.status(400).json({ error: 'Invalid harvest date format' });
    }

    const product = new Product({
      ...productData,
      harvestDate,
      price: parseFloat(productData.price),
      inStock: productData.inStock !== undefined ? productData.inStock : true,
      isVisible: productData.isVisible !== undefined ? productData.isVisible : true,
      organic: productData.organic || false
    });

    await product.save();

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      farmerMobile: product.farmerMobile,
      inStock: product.inStock,
      isVisible: product.isVisible,
      harvestDate: product.harvestDate,
      organic: product.organic,
      quantity: product.quantity,
      unit: product.unit,
      createdAt: product.createdAt
    };

    console.log('✅ Product created successfully:', product.name);
    res.status(201).json(formattedProduct);
  } catch (error) {
    console.error('❌ Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors.join(', '),
        validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Updating product:', id, req.body);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid product ID format:', id);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const updateData = { ...req.body };
    
    // Validate price if provided
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price);
      if (isNaN(updateData.price) || updateData.price <= 0) {
        console.log('❌ Invalid price:', req.body.price);
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
    }

    // Validate harvest date if provided
    if (updateData.harvestDate) {
      const harvestDate = new Date(updateData.harvestDate);
      if (isNaN(harvestDate.getTime())) {
        console.log('❌ Invalid harvest date:', updateData.harvestDate);
        return res.status(400).json({ error: 'Invalid harvest date format' });
      }
      updateData.harvestDate = harvestDate;
    }

    updateData.updatedAt = new Date();
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      console.log('❌ Product not found for update:', id);
      return res.status(404).json({ error: 'Product not found' });
    }

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      farmerMobile: product.farmerMobile,
      inStock: product.inStock,
      isVisible: product.isVisible,
      harvestDate: product.harvestDate,
      organic: product.organic,
      quantity: product.quantity,
      unit: product.unit,
      createdAt: product.createdAt
    };

    console.log('✅ Product updated successfully:', product.name);
    res.json(formattedProduct);
  } catch (error) {
    console.error('❌ Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors.join(', '),
        validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Toggle product visibility
app.patch('/api/products/:id/visibility', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Toggling visibility for product:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid product ID format:', id);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      console.log('❌ Product not found for visibility toggle:', id);
      return res.status(404).json({ error: 'Product not found' });
    }

    product.isVisible = !product.isVisible;
    product.updatedAt = new Date();
    await product.save();

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
      farmerMobile: product.farmerMobile,
      inStock: product.inStock,
      isVisible: product.isVisible,
      harvestDate: product.harvestDate,
      organic: product.organic,
      quantity: product.quantity,
      unit: product.unit,
      createdAt: product.createdAt
    };

    console.log('✅ Product visibility toggled:', product.name, 'visible:', product.isVisible);
    res.json(formattedProduct);
  } catch (error) {
    console.error('❌ Toggle visibility error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Deleting product:', id);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid product ID format:', id);
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      console.log('❌ Product not found for deletion:', id);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('✅ Product deleted successfully:', id);
    res.json({ message: 'Product deleted successfully', productName: product.name });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Product service error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📦 Product Service running on port ${PORT}`);
  console.log(`🔗 MongoDB URI: ${MONGODB_URI ? 'Connected' : 'Not configured'}`);
});