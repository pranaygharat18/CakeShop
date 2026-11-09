const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { isMongoConnected, updateStore, getStore } = require('../config/db');

// @route   POST /api/subscribers
// @desc    Join Sweet VIP Club
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { phone } = req.body;
    const sanitizedPhone = String(phone || '').replace(/[^0-9]/g, '');

    if (sanitizedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'A valid 10-digit Indian mobile number is required.'
      });
    }

    const couponCode = 'SWEETVIP15';

    if (isMongoConnected()) {
      let subscriber = await Subscriber.findOne({ phone: sanitizedPhone });
      if (subscriber) {
        return res.json({
          success: true,
          message: 'You are already a valued VIP Club member!',
          couponCode: subscriber.couponCode || couponCode
        });
      }
      subscriber = await Subscriber.create({
        phone: sanitizedPhone,
        couponCode
      });
      return res.status(201).json({
        success: true,
        message: 'VIP Club Activated! 🎁 Welcome to Siddhivinayak Sweet Club.',
        couponCode
      });
    } else {
      const store = getStore();
      const existing = (store.subscribers || []).find(s => s.phone === sanitizedPhone);
      if (existing) {
        return res.json({
          success: true,
          message: 'You are already a valued VIP Club member!',
          couponCode: existing.couponCode || couponCode
        });
      }

      const newSub = {
        phone: sanitizedPhone,
        couponCode,
        status: 'Active',
        subscribedAt: new Date().toISOString()
      };

      updateStore(s => {
        if (!s.subscribers) s.subscribers = [];
        s.subscribers.unshift(newSub);
      });

      return res.status(201).json({
        success: true,
        message: 'VIP Club Activated! 🎁 Welcome to Siddhivinayak Sweet Club.',
        couponCode
      });
    }
  } catch (error) {
    console.error('Error subscribing phone:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process subscription. Please try again.'
    });
  }
});

module.exports = router;

