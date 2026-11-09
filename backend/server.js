const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');

// Initialize Express App & HTTP Server
const app = express();
app.disable('x-powered-by');
const server = http.createServer(app);

// Socket.io Real-Time Engine Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Provide socket instance across routes
app.set('io', io);

// Socket Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Real-Time Socket: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected from Real-Time Socket: ${socket.id}`);
  });
});

// Security & Parsing Middlewares
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve Frontend Static Files
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// Import Modular API Routes
const cakeRoutes = require('./routes/cakeRoutes');
const spotlightRoutes = require('./routes/spotlightRoutes');
const orderRoutes = require('./routes/orderRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount API Routes
app.use('/api/cakes', cakeRoutes);
app.use('/api/spotlight', spotlightRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/admin', adminRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Known page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'admin.html'));
});

// API 404 Handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Frontend 404 Page for unmatched routes
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile(path.join(FRONTEND_DIR, '404.html'));
  }
  res.status(404).json({ success: false, message: 'Resource not found.' });
});

// Global Safe Error Handler (prevents stack trace leakage)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred. Please contact customer support.'
  });
});

// Connect to Database & Launch Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🎂 Siddhivinayak Bakery API & Real-Time Engine running on http://localhost:${PORT}`);
    console.log(`📁 Frontend serving from: ${FRONTEND_DIR}`);
  });
}

startServer();

module.exports = { app, server };

