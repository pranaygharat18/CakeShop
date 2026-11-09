const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const AdminUser = require('../models/AdminUser');
const Cake = require('../models/Cake');
const Spotlight = require('../models/Spotlight');
const Order = require('../models/Order');
const Subscriber = require('../models/Subscriber');
const { verifyAdmin, JWT_SECRET } = require('../middleware/authMiddleware');
const { isMongoConnected, getStore, updateStore } = require('../config/db');

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================

// @route   POST /api/admin/auth/login
// @desc    Admin login & JWT generation
// @access  Public
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required strings.'
      });
    }

    let isValid = false;
    const cleanUsername = username.trim().toLowerCase();

    if (isMongoConnected()) {
      const admin = await AdminUser.findOne({ username: cleanUsername });
      if (admin) {
        isValid = await admin.comparePassword(password);
      }
    } else {
      const store = getStore();
      if (cleanUsername === store.admin.username) {
        isValid = await bcrypt.compare(password, store.admin.passwordHash);
      }
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    const token = jwt.sign(
      { username: cleanUsername, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: { username: cleanUsername, role: 'admin' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Authentication process failed.' });
  }
});

// ==========================================
// 2. ORDER MANAGEMENT & APPROVAL FLOW
// ==========================================

// @route   GET /api/admin/orders
// @desc    List all customer orders
// @access  Protected
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: orders.length, data: orders });
    } else {
      const store = getStore();
      return res.json({ success: true, count: store.orders.length, data: store.orders });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// @route   POST /api/admin/orders/:id/approve
// @desc    Approve order and formulate advance payment QR link
// @access  Protected
router.post('/orders/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    let order;
    let orderIndex = -1;

    if (isMongoConnected()) {
      order = await Order.findOne({
        $or: [{ orderId: orderId }, { _id: mongoose.isValidObjectId(orderId) ? orderId : null }]
      });
    } else {
      const store = getStore();
      orderIndex = store.orders.findIndex(o => o.orderId === orderId || o._id === orderId);
      if (orderIndex !== -1) order = store.orders[orderIndex];
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const upiPayee = 'siddhivinayakcakes@upi';
    const upiAmount = order.advanceRequired || Math.round(order.subtotal * 0.5);
    const upiNote = encodeURIComponent(`Advance for ${order.orderId} Siddhivinayak Cakes`);
    const upiLink = `upi://pay?pa=${upiPayee}&pn=SiddhivinayakCakeShop&am=${upiAmount}&tn=${upiNote}&cu=INR`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&bgcolor=FFFBF7&color=16233B&qzone=2`;
    const whatsappMessage = `Hello! Your order (#${order.orderId}) at Siddhivinayak Cake Shop has been approved. Please complete your advance payment using this secure QR Scanner: ${qrImageUrl}`;
    const whatsappApiLink = `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    if (isMongoConnected()) {
      order.status = 'Approved';
      order.whatsappNotificationSent = true;
      order.whatsappMessageContent = whatsappMessage;
      order.paymentQrUrl = qrImageUrl;
      await order.save();
    } else {
      updateStore(store => {
        store.orders[orderIndex].status = 'Approved';
        store.orders[orderIndex].whatsappNotificationSent = true;
        store.orders[orderIndex].whatsappMessageContent = whatsappMessage;
        store.orders[orderIndex].paymentQrUrl = qrImageUrl;
      });
      order = getStore().orders[orderIndex];
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('order-updated', {
        orderId: order.orderId,
        status: 'Approved',
        whatsappNotificationSent: true
      });
    }

    return res.json({
      success: true,
      message: `Order #${order.orderId} approved successfully and automated WhatsApp payment notification dispatched.`,
      order: {
        orderId: order.orderId,
        status: order.status,
        customerPhone: order.customerPhone,
        advanceRequired: upiAmount,
        whatsappMessage: whatsappMessage,
        paymentQrUrl: qrImageUrl,
        whatsappApiLink: whatsappApiLink
      }
    });

  } catch (error) {
    console.error('Error approving order:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve order.' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Protected
router.put('/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const allowed = ['Pending', 'Approved', 'Rejected', 'Paid'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    if (isMongoConnected()) {
      const updated = await Order.findOneAndUpdate(
        { $or: [{ orderId: orderId }, { _id: mongoose.isValidObjectId(orderId) ? orderId : null }] },
        { $set: { status: status } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: 'Order not found.' });

      const io = req.app.get('io');
      if (io) io.emit('order-updated', { orderId: updated.orderId, status: updated.status });
      return res.json({ success: true, message: 'Order status updated.', order: updated });
    } else {
      const store = getStore();
      const index = store.orders.findIndex(o => o.orderId === orderId || o._id === orderId);
      if (index === -1) return res.status(404).json({ success: false, message: 'Order not found.' });

      updateStore(s => {
        s.orders[index].status = status;
      });

      const io = req.app.get('io');
      if (io) io.emit('order-updated', { orderId: store.orders[index].orderId, status: status });
      return res.json({ success: true, message: 'Order status updated.', order: store.orders[index] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// ==========================================
// 3. CAKE INVENTORY CRUD
// ==========================================

// @route   GET /api/admin/cakes
// @desc    Fetch all cakes for admin
// @access  Protected
router.get('/cakes', verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const cakes = await Cake.find().sort({ createdAt: -1 }).lean();
      return res.json({ success: true, data: cakes });
    } else {
      const store = getStore();
      return res.json({ success: true, data: store.cakes });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve cakes.' });
  }
});

// @route   POST /api/admin/cakes
// @desc    Create new menu cake
// @access  Protected
router.post('/cakes', verifyAdmin, async (req, res) => {
  try {
    const { name, category, price, originalPrice, rating, reviews, image, fallbackImg, badge } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required fields.'
      });
    }

    const validCategories = ['birthday', 'anniversary', 'wedding', 'celebrations', 'babyshower'];
    const cleanCategory = String(category).toLowerCase().trim();
    if (!validCategories.includes(cleanCategory)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const newCakeId = 'cake-' + Date.now();
    const cakeObj = {
      cakeId: newCakeId,
      name: String(name).trim(),
      category: cleanCategory,
      price: Number(price),
      originalPrice: Number(originalPrice || Math.round(Number(price) * 1.3)),
      rating: Number(rating || 4.8),
      reviews: Number(reviews || 1),
      image: String(image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80').trim(),
      fallbackImg: String(fallbackImg || './assets/cake1.png').trim(),
      badge: String(badge || 'Artisanal Fresh').trim()
    };

    if (isMongoConnected()) {
      const created = await Cake.create(cakeObj);
      return res.status(201).json({ success: true, message: 'Cake created successfully.', data: created });
    } else {
      updateStore(store => {
        store.cakes.push(cakeObj);
      });
      return res.status(201).json({ success: true, message: 'Cake created successfully.', data: cakeObj });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create cake.' });
  }
});

// @route   PUT /api/admin/cakes/:id
// @desc    Update menu cake
// @access  Protected
router.put('/cakes/:id', verifyAdmin, async (req, res) => {
  try {
    const cakeId = req.params.id;
    const updates = req.body;
    const allowed = ['name', 'category', 'price', 'originalPrice', 'rating', 'reviews', 'image', 'fallbackImg', 'badge'];
    const safeUpdates = {};

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'price' || key === 'originalPrice' || key === 'rating' || key === 'reviews') {
          safeUpdates[key] = Number(updates[key]);
        } else {
          safeUpdates[key] = String(updates[key]).trim();
        }
      }
    }

    if (safeUpdates.category) {
      const validCategories = ['birthday', 'anniversary', 'wedding', 'celebrations', 'babyshower'];
      safeUpdates.category = safeUpdates.category.toLowerCase();
      if (!validCategories.includes(safeUpdates.category)) {
        return res.status(400).json({ success: false, message: 'Invalid category supplied.' });
      }
    }

    if (isMongoConnected()) {
      const updated = await Cake.findOneAndUpdate(
        { $or: [{ cakeId: cakeId }, { _id: mongoose.isValidObjectId(cakeId) ? cakeId : null }] },
        { $set: safeUpdates },
        { new: true }
      ).lean();

      if (!updated) return res.status(404).json({ success: false, message: 'Cake item not found.' });
      return res.json({ success: true, message: 'Cake updated successfully.', data: updated });
    } else {
      const store = getStore();
      const index = store.cakes.findIndex(c => c.cakeId === cakeId || c._id === cakeId);
      if (index === -1) return res.status(404).json({ success: false, message: 'Cake item not found.' });

      updateStore(s => {
        s.cakes[index] = { ...s.cakes[index], ...safeUpdates };
      });
      return res.json({ success: true, message: 'Cake updated successfully.', data: getStore().cakes[index] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update cake item.' });
  }
});

// @route   DELETE /api/admin/cakes/:id
// @desc    Remove cake item
// @access  Protected
router.delete('/cakes/:id', verifyAdmin, async (req, res) => {
  try {
    const cakeId = req.params.id;

    if (isMongoConnected()) {
      const deleted = await Cake.findOneAndDelete({
        $or: [{ cakeId: cakeId }, { _id: mongoose.isValidObjectId(cakeId) ? cakeId : null }]
      });
      if (!deleted) return res.status(404).json({ success: false, message: 'Cake item not found.' });
      return res.json({ success: true, message: 'Cake item deleted successfully.' });
    } else {
      const store = getStore();
      const index = store.cakes.findIndex(c => c.cakeId === cakeId || c._id === cakeId);
      if (index === -1) return res.status(404).json({ success: false, message: 'Cake item not found.' });

      updateStore(s => {
        s.cakes.splice(index, 1);
      });
      return res.json({ success: true, message: 'Cake item deleted successfully.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete cake item.' });
  }
});

// ==========================================
// 4. SPOTLIGHT MANAGEMENT
// ==========================================

// @route   GET /api/admin/spotlight
// @desc    Fetch spotlights for admin
// @access  Protected
router.get('/spotlight', verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const spotlights = await Spotlight.find().lean();
      return res.json({ success: true, data: spotlights });
    } else {
      const store = getStore();
      return res.json({ success: true, data: store.spotlights });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve spotlights.' });
  }
});

// @route   PUT /api/admin/spotlight/:id
// @desc    Update daily spotlight
// @access  Protected
router.put('/spotlight/:id', verifyAdmin, async (req, res) => {
  try {
    const spotlightId = req.params.id;
    const updates = req.body;
    const allowed = [
      'day', 'tag', 'batch', 'title', 'bakedTime', 'stockLeft',
      'rating', 'reviews', 'desc', 'price', 'originalPrice', 'image', 'fallbackImg', 'ingredients'
    ];
    const safeUpdates = {};

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'price' || key === 'originalPrice' || key === 'rating' || key === 'reviews') {
          safeUpdates[key] = Number(updates[key]);
        } else if (key === 'ingredients' && Array.isArray(updates[key])) {
          safeUpdates[key] = updates[key].map(i => String(i).trim());
        } else {
          safeUpdates[key] = String(updates[key]).trim();
        }
      }
    }

    if (isMongoConnected()) {
      const updated = await Spotlight.findOneAndUpdate(
        { $or: [{ spotlightId: spotlightId }, { _id: mongoose.isValidObjectId(spotlightId) ? spotlightId : null }] },
        { $set: safeUpdates },
        { new: true }
      ).lean();

      if (!updated) return res.status(404).json({ success: false, message: 'Spotlight item not found.' });
      return res.json({ success: true, message: 'Spotlight updated successfully.', data: updated });
    } else {
      const store = getStore();
      const index = store.spotlights.findIndex(s => s.spotlightId === spotlightId || s._id === spotlightId);
      if (index === -1) return res.status(404).json({ success: false, message: 'Spotlight item not found.' });

      updateStore(s => {
        s.spotlights[index] = { ...s.spotlights[index], ...safeUpdates };
      });
      return res.json({ success: true, message: 'Spotlight updated successfully.', data: getStore().spotlights[index] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update spotlight.' });
  }
});

// ==========================================
// 5. VIP SUBSCRIBERS LIST
// ==========================================

// @route   GET /api/admin/subscribers
// @desc    Fetch all VIP subscribers
// @access  Protected
router.get('/subscribers', verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const subscribers = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
      return res.json({ success: true, count: subscribers.length, data: subscribers });
    } else {
      const store = getStore();
      return res.json({ success: true, count: (store.subscribers || []).length, data: store.subscribers || [] });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscribers.' });
  }
});

module.exports = router;

