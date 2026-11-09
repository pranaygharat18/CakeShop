const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema({
  cakeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['birthday', 'anniversary', 'wedding', 'celebrations', 'babyshower'],
    lowercase: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 1,
    min: 0
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  fallbackImg: {
    type: String,
    default: './assets/cake1.png',
    trim: true
  },
  badge: {
    type: String,
    default: 'Artisanal Fresh',
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Cake || mongoose.model('Cake', cakeSchema);

