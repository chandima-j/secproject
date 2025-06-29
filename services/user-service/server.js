const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@dev.qzhiudx.mongodb.net/fresh_bonds?retryWrites=true&w=majority&appName=Dev';

console.log('🔗 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // Create sample users if they don't exist
    createSampleUsers();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, {
    body: req.method !== 'GET' ? { ...req.body, password: req.body.password ? '[HIDDEN]' : undefined } : undefined,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Bearer [HIDDEN]' : undefined
    }
  });
  next();
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

// Create sample users
async function createSampleUsers() {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      console.log('🌱 Creating sample users...');
      
      const sampleUsers = [
        {
          name: 'Sarah Thompson',
          email: 'sarah@greenvalleys.com',
          password: 'farmer123',
          role: 'farmer',
          location: 'Sonoma County, CA',
          farmName: 'Green Valley Organic Farm',
          mobile: '+1-555-0123'
        },
        {
          name: 'Michael Chen',
          email: 'admin@freshbonds.com',
          password: 'admin123',
          role: 'admin',
          location: 'San Francisco, CA',
          mobile: '+1-555-0124'
        },
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'farmer123',
          role: 'farmer',
          location: 'Napa Valley, CA',
          farmName: 'Sunrise Farm',
          mobile: '+1-555-0125'
        }
      ];

      for (const userData of sampleUsers) {
        try {
          const user = new User(userData);
          await user.save();
          console.log(`✅ Created user: ${user.name} (${user.email})`);
        } catch (error) {
          if (error.code === 11000) {
            console.log(`⚠️ User already exists: ${userData.email}`);
          } else {
            console.error(`❌ Error creating user ${userData.email}:`, error.message);
          }
        }
      }
    } else {
      console.log(`ℹ️ Found ${existingUsers} existing users, skipping sample data creation`);
    }
  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'User Service', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString() 
  });
});

// Register endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.email);
    const { name, email, password, role, location, farmName, mobile } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!['farmer', 'admin'].includes(role)) {
      console.log('❌ Invalid role:', role);
      return res.status(400).json({ error: 'Role must be farmer or admin' });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (role === 'farmer' && !farmName) {
      console.log('❌ Missing farm name for farmer');
      return res.status(400).json({ error: 'Farm name is required for farmers' });
    }

    if (role === 'farmer' && !mobile) {
      console.log('❌ Missing mobile number for farmer');
      return res.status(400).json({ error: 'Mobile number is required for farmers' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      location: location ? location.trim() : null,
      farmName: role === 'farmer' ? (farmName ? farmName.trim() : null) : null,
      mobile: mobile ? mobile.trim() : null
    };

    console.log('💾 Creating user with data:', { ...userData, password: '[HIDDEN]' });
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const responseData = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        farmName: user.farmName,
        mobile: user.mobile
      },
      token
    };

    console.log('✅ Registration successful for:', user.name);
    res.status(201).json(responseData);
  } catch (error) {
    console.error('❌ Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('👤 User found:', { id: user._id, name: user.name, role: user.role });

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const responseData = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        farmName: user.farmName,
        mobile: user.mobile
      },
      token
    };

    console.log('✅ Login successful for:', user.name);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    console.log('👤 Profile request for user ID:', req.user.id);
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const responseData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      farmName: user.farmName,
      mobile: user.mobile
    };

    console.log('✅ Profile retrieved for:', user.name);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Profile update for user ID:', req.user.id);
    const { name, location, farmName, mobile } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name.trim();
    user.location = location ? location.trim() : null;
    user.mobile = mobile ? mobile.trim() : null;
    if (user.role === 'farmer') {
      user.farmName = farmName ? farmName.trim() : null;
    }

    await user.save();

    const responseData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      farmName: user.farmName,
      mobile: user.mobile
    };

    console.log('✅ Profile updated for:', user.name);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Change password
app.put('/api/users/password', authenticateToken, async (req, res) => {
  try {
    console.log('🔒 Password change for user ID:', req.user.id);
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed for user ID:', req.user.id);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Logout endpoint
app.post('/api/users/logout', (req, res) => {
  console.log('👋 User logout');
  res.json({ message: 'Logged out successfully' });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Invalid token:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ User service error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`👤 User Service running on port ${PORT}`);
  console.log(`🔗 MongoDB URI: ${MONGODB_URI ? 'Configured' : 'Not configured'}`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET ? 'Configured' : 'Not configured'}`);
});