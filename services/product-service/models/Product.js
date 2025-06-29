const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Herbs', 'Dairy & Eggs', 'Meat & Poultry', 'Grains & Cereals', 'Pantry', 'Flowers', 'Other']
  },
  image: {
    type: String,
    required: true
  },
  farmerId: {
    type: String,
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  farmerLocation: {
    type: String,
    required: true
  },
  farmerMobile: {
    type: String,
    required: false
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  organic: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['lbs', 'oz', 'kg', 'g', 'count', 'dozen', 'bunch', 'head', 'pint', 'quart', 'gallon', 'bag', 'box']
  }
}, {
  timestamps: true
});

// Index for better performance
productSchema.index({ farmerId: 1 });
productSchema.index({ isVisible: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);