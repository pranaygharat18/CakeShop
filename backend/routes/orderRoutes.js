const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isMongoConnected, updateStore } = require('../config/db');

// @route   POST /api/orders
// @desc    Customer places order with phone number, basket items, and delivery notes
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { customerPhone, customerName, deliveryNotes, items } = req.body;

    // Validate 10-digit Indian mobile number
    const sanitizedPhone = String(customerPhone || '').replace(/[^0-9]/g, '');
    if (sanitizedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'A valid 10-digit Indian WhatsApp mobile number is required.'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your order basket is empty. Please select at least one cake.'
      });
    }

    // Sanitize items and securely compute subtotal on server
    let subtotal = 0;
    const sanitizedItems = items.map(item => {
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      const price = Math.max(0, parseFloat(item.price) || 0);
      subtotal += price * qty;
      return {
        name: String(item.name || item.title || 'Artisanal Cake').trim(),
        price: price,
        qty: qty,
        image: String(item.image || './assets/cake1.png').trim()
      };
    });

    // Advance payment calculation (50% standard policy)
    const advanceRequired = Math.round(subtotal * 0.5);

    // Generate unique order ID: ORD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randomSuffix}`;

    const newOrderData = {
      orderId,
      customerPhone: sanitizedPhone,
      customerName: String(customerName || 'Celebration Host').trim(),
      deliveryNotes: String(deliveryNotes || '').trim(),
      items: sanitizedItems,
      subtotal,
      advanceRequired,
      status: 'Pending',
      whatsappNotificationSent: false,
      whatsappMessageContent: '',
      paymentQrUrl: '',
      createdAt: new Date().toISOString()
    };

    let createdOrder;
    if (isMongoConnected()) {
      createdOrder = await Order.create(newOrderData);
    } else {
      updateStore(store => {
        store.orders.unshift(newOrderData);
      });
      createdOrder = newOrderData;
    }

    // EMIT REAL-TIME SOCKET.IO EVENT TO CONNECTED ADMIN DASHBOARDS
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', {
        orderId: createdOrder.orderId,
        customerPhone: createdOrder.customerPhone,
        customerName: createdOrder.customerName,
        subtotal: createdOrder.subtotal,
        advanceRequired: createdOrder.advanceRequired,
        itemsCount: createdOrder.items.length,
        items: createdOrder.items,
        createdAt: createdOrder.createdAt
      });
      console.log(`🔔 Socket Event 'new-order' emitted: ${createdOrder.orderId} from +91 ${sanitizedPhone} (₹${subtotal})`);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Awaiting owner confirmation.',
      order: {
        orderId: createdOrder.orderId,
        subtotal: createdOrder.subtotal,
        status: createdOrder.status,
        customerPhone: createdOrder.customerPhone
      }
    });

  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process order request. Please try again or WhatsApp us directly.'
    });
  }
});

module.exports = router;

