const express = require('express');
const router = express.Router();
const Cake = require('../models/Cake');
const { isMongoConnected, getStore } = require('../config/db');

// @route   GET /api/cakes
// @desc    Fetch all menu cakes
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const cakes = await Cake.find().lean();
      return res.json({ success: true, count: cakes.length, data: cakes });
    } else {
      const store = getStore();
      return res.json({ success: true, count: store.cakes.length, data: store.cakes });
    }
  } catch (error) {
    console.error('Error fetching cakes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cakes.' });
  }
});

module.exports = router;

