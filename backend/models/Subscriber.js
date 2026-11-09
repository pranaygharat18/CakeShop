const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  couponCode: {
    type: String,
    default: 'SWEETVIP15'
  },
  status: {
    type: String,
    enum: ['Active', 'Unsubscribed'],
    default: 'Active'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);

