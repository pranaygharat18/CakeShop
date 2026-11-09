const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Cake = require('./models/Cake');
const Spotlight = require('./models/Spotlight');
const AdminUser = require('./models/AdminUser');
const Order = require('./models/Order');
const Subscriber = require('./models/Subscriber');
const { initialSpotlights, initialCakes } = require('./data/seedData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/siddhivinayak_cakes';
const DB_FILE = path.join(__dirname, 'data', 'store.json');

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

async function seedDatabase() {
  console.log('🌱 Starting Siddhivinayak Bakery Database & Store Seeder...');

  // 1. Update file-backed persistent store (store.json)
  try {
    let existingStore = {};
    if (fs.existsSync(DB_FILE)) {
      existingStore = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    const updatedStore = {
      ...existingStore,
      cakes: initialCakes,
      spotlights: initialSpotlights,
      admin: existingStore.admin || {
        username: process.env.ADMIN_USERNAME || 'admin',
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
      },
      orders: existingStore.orders && existingStore.orders.length > 0 ? existingStore.orders : initialOrders,
      subscribers: existingStore.subscribers || []
    };

    if (!fs.existsSync(path.dirname(DB_FILE))) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(updatedStore, null, 2), 'utf8');
    console.log('✅ Updated store.json with 10 unique low-budget cakes and 4 daily spotlights.');
  } catch (err) {
    console.error('⚠️ Error updating store.json:', err.message);
  }

  // 2. Synchronize with MongoDB if available
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
    console.log('✅ Connected to MongoDB.');

    // Cakes
    await Cake.deleteMany({});
    const insertedCakes = await Cake.insertMany(initialCakes);
    console.log(`✅ MongoDB Seeded: ${insertedCakes.length} unique cakes with high-resolution imagery.`);

    // Spotlights
    await Spotlight.deleteMany({});
    const insertedSpots = await Spotlight.insertMany(initialSpotlights);
    console.log(`✅ MongoDB Seeded: ${insertedSpots.length} daily spotlights with unique imagery.`);

    // Admin User
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      const admin = new AdminUser({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
      await admin.save();
      console.log('✅ MongoDB Seeded: Default Admin User (admin / admin123).');
    }

    // Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(initialOrders);
      console.log('✅ MongoDB Seeded: Initial sample order.');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  } catch (err) {
    console.log(`ℹ️ MongoDB offline (${err.message}). File store (store.json) has been fully synchronized and seeded.`);
  }

  console.log('🎉 Seeder completed successfully!');
}

seedDatabase();

