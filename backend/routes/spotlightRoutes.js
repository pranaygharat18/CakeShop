const express = require('express');
const router = express.Router();
const Spotlight = require('../models/Spotlight');
const { isMongoConnected, getStore } = require('../config/db');

// @route   GET /api/spotlight
// @desc    Fetch daily chef's specials
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const spotlights = await Spotlight.find().lean();
      return res.json({ success: true, count: spotlights.length, data: spotlights });
    } else {
      const store = getStore();
      return res.json({ success: true, count: store.spotlights.length, data: store.spotlights });
    }
  } catch (error) {
    console.error('Error fetching spotlights:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch spotlight specials.' });
  }
});

module.exports = router;

