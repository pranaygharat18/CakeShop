const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    trim: true,
    default: './assets/cake1.png'
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  customerName: {
    type: String,
    trim: true,
    default: 'Celebration Host'
  },
  deliveryNotes: {
    type: String,
    trim: true,
    default: ''
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one item is required in order.']
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  advanceRequired: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending'
  },
  whatsappNotificationSent: {
    type: Boolean,
    default: false
  },
  whatsappMessageContent: {
    type: String,
    default: ''
  },
  paymentQrUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

