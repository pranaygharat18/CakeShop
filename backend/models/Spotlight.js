const mongoose = require('mongoose');

const spotlightSchema = new mongoose.Schema({
  spotlightId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  day: {
    type: String,
    required: true,
    trim: true
  },
  tag: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  bakedTime: {
    type: String,
    required: true,
    trim: true
  },
  stockLeft: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    default: 4.9,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 1,
    min: 0
  },
  desc: {
    type: String,
    required: true,
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
  image: {
    type: String,
    required: true,
    trim: true
  },
  fallbackImg: {
    type: String,
    default: './assets/hero_cake.png',
    trim: true
  },
  ingredients: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Spotlight || mongoose.model('Spotlight', spotlightSchema);

