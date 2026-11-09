# 🎂 Siddhivinayak Cake Shop — Full-Stack Modular Production Architecture

A modern, full-stack artisanal bakery web application and store owner portal featuring real-time Socket.io customer order notifications, audio chime alerts, automated WhatsApp payment approvals with UPI QR codes, and dynamic inventory management.

---

## 📁 Project Directory Structure

```text
siddhivinayak-cake-shop/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & atomic file-store fallback
│   ├── models/
│   │   ├── Cake.js               # Core menu cake schema
│   │   ├── Spotlight.js          # Daily spotlight specials schema
│   │   ├── Order.js              # Customer order & checkout schema
│   │   ├── Subscriber.js         # Sweet VIP club subscribers schema
│   │   └── AdminUser.js          # Secure hashed admin credentials schema
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT Bearer token authentication middleware
│   ├── routes/
│   │   ├── cakeRoutes.js         # Public menu endpoints (GET /api/cakes)
│   │   ├── spotlightRoutes.js    # Public spotlight endpoints (GET /api/spotlight)
│   │   ├── orderRoutes.js        # Checkout endpoints & Socket.io notifications (POST /api/orders)
│   │   ├── subscriberRoutes.js   # Phone VIP club subscriptions (POST /api/subscribers)
│   │   └── adminRoutes.js        # Protected admin management endpoints
│   ├── data/
│   │   ├── seedData.js           # Low-budget pricing & high-res image dataset
│   │   └── store.json            # File-backed persistence store
│   ├── .env                      # Server configuration & JWT secrets
│   ├── package.json              # Backend dependencies & npm scripts
│   ├── seed.js                   # Database initialization script
│   └── server.js                 # Express & Socket.io server entry point
│
├── frontend/
│   ├── assets/                   # Local fallback brand & cake assets
│   ├── css/
│   │   └── styles.css            # Confectionery custom styling & animations
│   ├── js/
│   │   ├── app.js                # Customer storefront application engine
│   │   └── admin.js              # Real-time admin dashboard engine & audio alert system
│   ├── index.html                # Customer storefront view
│   ├── admin.html                # Store owner / administrative console
│   └── 404.html                  # Branded page-not-found view
│
├── .env.example                  # Safe environment variable template
├── .gitignore                    # Git exclusions
├── package.json                  # Root npm runner scripts
└── README.md                     # Documentation & setup guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Optional (If MongoDB is offline or unavailable, the backend automatically operates with atomic file persistence using `backend/data/store.json`).

### 2. Installation
From the project root:
```bash
npm install
```

### 3. Environment Setup
Verify `backend/.env` (created automatically with defaults):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/siddhivinayak_cakes
JWT_SECRET=siddhivinayak_artisanal_secret_key_2026_super_secure
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Database Seeding
Populate the database with low-budget artisanal menu cakes and daily chef specials:
```bash
npm run seed
```

### 5. Start the Application
Launch the Node.js API and Real-Time Socket.io Server:
```bash
npm start
```
The server will start at: **`http://localhost:5000`**

---

## 🌐 Application URLs

| View | Route | Description |
| :--- | :--- | :--- |
| **Customer Storefront** | `http://localhost:5000` | Landing page, daily specials slider, menu grid, and cart checkout |
| **Bestsellers Menu** | `http://localhost:5000/#menu` | Low-budget budget cake selections (starting from ₹349) |
| **Daily Spotlight** | `http://localhost:5000/#spotlight` | Day-by-day chef's limited artisanal batches |
| **Admin Console** | `http://localhost:5000/admin.html` | Real-time order approvals, audio chime alerts, and inventory CRUD |

**Default Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

---

## 🔌 API Endpoints Reference

### Public Routes
- `GET /api/cakes` — Fetch all menu cakes with categories, pricing, and imagery.
- `GET /api/spotlight` — Fetch daily chef specials with tags and ingredients.
- `POST /api/orders` — Place order; emits a real-time `new-order` socket event to all connected admin panels.
- `POST /api/subscribers` — Join Sweet VIP Club with a 10-digit Indian mobile number.
- `GET /api/health` — Check server status and timestamp.

### Protected Admin Routes (`Authorization: Bearer <token>`)
- `POST /api/admin/auth/login` — Authenticate admin credentials and generate JWT token.
- `GET /api/admin/orders` — List all customer orders.
- `POST /api/admin/orders/:id/approve` — Approve order, generate UPI QR code link, and formulate WhatsApp dispatch payload.
- `PUT /api/admin/orders/:id/status` — Update order status (`Pending`, `Approved`, `Paid`, `Rejected`).
- `GET /api/admin/cakes` — Fetch menu inventory for editing.
- `POST /api/admin/cakes` — Add a new cake to the menu.
- `PUT /api/admin/cakes/:id` — Update pricing, category, or photo URL of an existing cake.
- `DELETE /api/admin/cakes/:id` — Remove a cake from the menu.
- `GET /api/admin/spotlight` — Fetch daily spotlights for management.
- `PUT /api/admin/spotlight/:id` — Update daily special batch, stock, description, or image.
- `GET /api/admin/subscribers` — View registered VIP Club mobile numbers.

---

## 🎨 Confectionery Design System

- **Palette**: Soft Pastry Cream Canvas (`#FFFBF7`), Vivid Berry Primary (`#FF3366`), Deep Cocoa Charcoal (`#1E2229`), Strawberry Surface (`#FFE4E9`).
- **Typography**: Epilogue for artisanal confectionery headings; Plus Jakarta Sans for clean e-commerce body text.
- **Micro-Interactions**: Web Audio API synthesized chimes for order alerts, pulsating review badges, and smooth drawer slide-ins.

