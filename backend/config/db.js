const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '..', 'data', 'store.json');
let isConnected = false;
let memoryStore = null;

const initialOrders = [
  {
    orderId: 'ORD-101',
    customerPhone: '9876543210',
    customerName: 'Aarav Mehta',
    deliveryNotes: 'Please add happy anniversary topper card',
    items: [
      { name: 'Red Velvet Raspberry Cake', price: 429, qty: 1, image: './assets/cake2.png' }
    ],
    subtotal: 429,
    advanceRequired: 215,
    status: 'Pending',
    whatsappNotificationSent: false,
    whatsappMessageContent: '',
    paymentQrUrl: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  }
];

function loadFileStore() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.orders) {
        parsed.orders = [...initialOrders];
      }
      if (!parsed.subscribers) {
        parsed.subscribers = [];
      }
      return parsed;
    }
  } catch (err) {
    console.error('⚠️ Error loading file store:', err.message);
  }

  const { initialSpotlights, initialCakes } = require('../data/seedData');
  const defaultStore = {
    cakes: [...initialCakes],
    spotlights: [...initialSpotlights],
    orders: [...initialOrders],
    subscribers: [],
    admin: {
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
    }
  };
  saveFileStore(defaultStore);
  return defaultStore;
}

function saveFileStore(storeData) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(storeData, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Error saving file store:', err.message);
  }
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/siddhivinayak_cakes';
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.log(`ℹ️ MongoDB offline (${err.message}). Operating with atomic file-backed store (store.json).`);
    return null;
  }
}

function getStore() {
  return loadFileStore();
}

function updateStore(fn) {
  const store = getStore();
  fn(store);
  saveFileStore(store);
  return store;
}

module.exports = {
  connectDB,
  isMongoConnected: () => isConnected,
  getStore,
  updateStore,
  saveFileStore
};

