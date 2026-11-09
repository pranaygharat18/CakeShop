/**
 * Siddhivinayak Cake Shop - Store Owner Administrative Dashboard Engine
 * Handles real-time Socket.io notifications, audio chimes, order approval flow,
 * UPI QR generation, and full CRUD for cakes and spotlight specials.
 */

let adminToken = localStorage.getItem('siddhivinayak_admin_token') || '';
let currentCakes = [];
let currentSpotlights = [];
let currentOrders = [];
let audioAlertsEnabled = true;
let audioContext = null;
let socket = null;

// Web Audio API Synthesizer Chime for browser-compliant notifications
function playOrderChimeSound() {
  if (!audioAlertsEnabled) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // 3-tone pleasant confectionery bakery chime (E5 -> G#5 -> B5)
    const notes = [659.25, 830.61, 987.77];
    notes.forEach((freq, idx) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.3, audioContext.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(audioContext.currentTime + idx * 0.12);
      osc.stop(audioContext.currentTime + idx * 0.12 + 0.45);
    });
  } catch (e) {
    console.warn('Audio chime playback notice:', e);
  }
}

function toggleAudioAlerts() {
  audioAlertsEnabled = !audioAlertsEnabled;
  const text = document.getElementById('audioStatusText');
  const icon = document.getElementById('audioIcon');
  if (audioAlertsEnabled) {
    text.textContent = 'Sound Alerts: ON';
    icon.setAttribute('data-lucide', 'volume-2');
    showToast('Sound Alerts On 🔔', 'You will hear a chime when customers place an order.');
    playOrderChimeSound();
  } else {
    text.textContent = 'Sound Alerts: MUTED';
    icon.setAttribute('data-lucide', 'volume-x');
    showToast('Muted', 'Audio chimes are muted.');
  }
  lucide.createIcons();
}

function showToast(title, msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMessage').textContent = msg;
  toast.classList.remove('translate-y-24', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3500);
}

function dismissOrderBanner() {
  document.getElementById('newOrderBanner').classList.add('hidden');
}

function viewNewOrdersTab() {
  dismissOrderBanner();
  switchTab('orders');
}

// 1. SOCKET.IO INTEGRATION
function initSocket() {
  if (typeof io === 'undefined') {
    console.warn('Socket.io library not loaded');
    return;
  }

  if (socket) return;

  socket = io();

  socket.on('connect', () => {
    console.log('⚡ Connected to Bakery Real-Time Socket Server');
  });

  socket.on('new-order', (order) => {
    console.log('🔔 NEW ORDER RECEIVED VIA SOCKET:', order);

    // 1. Play Audio Alert
    playOrderChimeSound();

    // 2. Display Visual Banner
    const banner = document.getElementById('newOrderBanner');
    document.getElementById('bannerOrderId').textContent = `Order #${order.orderId}`;
    document.getElementById('bannerCustomer').textContent = `Customer: ${order.customerName} (+91 ${order.customerPhone})`;
    document.getElementById('bannerTotal').textContent = `Amount: ₹${order.subtotal} (Advance: ₹${order.advanceRequired})`;
    banner.classList.remove('hidden');

    // 3. Refresh Orders Table
    if (adminToken) {
      fetchOrders();
    }
  });

  socket.on('order-updated', () => {
    if (adminToken) {
      fetchOrders();
    }
  });
}

// 2. AUTHENTICATION
async function handleLogin() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const errorMsg = document.getElementById('loginErrorMsg');

  errorMsg.classList.add('hidden');

  try {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success && data.token) {
      adminToken = data.token;
      localStorage.setItem('siddhivinayak_admin_token', adminToken);
      localStorage.setItem('siddhivinayak_admin_user', data.admin.username);
      checkAuth();
    } else {
      errorMsg.textContent = data.message || 'Authentication failed.';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = 'Server connection error. Ensure backend server is running.';
    errorMsg.classList.remove('hidden');
  }
}

function handleLogout() {
  adminToken = '';
  localStorage.removeItem('siddhivinayak_admin_token');
  localStorage.removeItem('siddhivinayak_admin_user');
  checkAuth();
}

function checkAuth() {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const userBadge = document.getElementById('adminUserBadge');

  if (adminToken) {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userBadge.classList.remove('hidden');
    document.getElementById('loggedAdminName').textContent = localStorage.getItem('siddhivinayak_admin_user') || 'admin';
    initSocket();
    refreshData();
  } else {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    userBadge.classList.add('hidden');
  }
  lucide.createIcons();
}

// 3. TAB MANAGEMENT
function switchTab(tab) {
  const tabOrdersBtn = document.getElementById('tabOrdersBtn');
  const tabCakesBtn = document.getElementById('tabCakesBtn');
  const tabSpotlightsBtn = document.getElementById('tabSpotlightsBtn');

  const tabOrdersContent = document.getElementById('tabOrdersContent');
  const tabCakesContent = document.getElementById('tabCakesContent');
  const tabSpotlightsContent = document.getElementById('tabSpotlightsContent');

  [tabOrdersBtn, tabCakesBtn, tabSpotlightsBtn].forEach(btn => {
    btn.className = "px-5 py-2.5 rounded-full text-sm font-bold bg-white text-stoneGrey hover:text-primary border border-borderSubtle flex items-center gap-2 transition-all whitespace-nowrap";
  });
  tabOrdersContent.classList.add('hidden');
  tabCakesContent.classList.add('hidden');
  tabSpotlightsContent.classList.add('hidden');

  if (tab === 'orders') {
    tabOrdersBtn.className = "px-5 py-2.5 rounded-full text-sm font-bold bg-primary text-white shadow-sm flex items-center gap-2 transition-all whitespace-nowrap";
    tabOrdersContent.classList.remove('hidden');
  } else if (tab === 'cakes') {
    tabCakesBtn.className = "px-5 py-2.5 rounded-full text-sm font-bold bg-primary text-white shadow-sm flex items-center gap-2 transition-all whitespace-nowrap";
    tabCakesContent.classList.remove('hidden');
  } else {
    tabSpotlightsBtn.className = "px-5 py-2.5 rounded-full text-sm font-bold bg-primary text-white shadow-sm flex items-center gap-2 transition-all whitespace-nowrap";
    tabSpotlightsContent.classList.remove('hidden');
  }
  lucide.createIcons();
}

async function refreshData() {
  if (!adminToken) return;
  await Promise.all([fetchOrders(), fetchCakes(), fetchSpotlights()]);
}

// 4. ORDER MANAGEMENT
async function fetchOrders() {
  try {
    const res = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status === 401) { handleLogout(); return; }
    const data = await res.json();
    if (data.success) {
      currentOrders = data.data;
      renderAdminOrders();
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
}

function renderAdminOrders() {
  const tbody = document.getElementById('ordersTableBody');
  document.getElementById('ordersCountSpan').textContent = currentOrders.length;

  if (currentOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-stoneGrey">
          No orders received yet. Active orders will appear here automatically with real-time sound notifications.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = currentOrders.map(order => {
    const itemsList = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');
    const isPending = order.status === 'Pending';
    const isApproved = order.status === 'Approved';

    let statusBadge = '';
    if (order.status === 'Pending') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold border border-amber-200">Pending Review</span>`;
    } else if (order.status === 'Approved') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200">Approved & QR Sent</span>`;
    } else if (order.status === 'Paid') {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">Paid & Baking</span>`;
    } else {
      statusBadge = `<span class="px-2.5 py-1 rounded-full bg-gray-100 text-stoneGrey font-bold">${order.status}</span>`;
    }

    return `
      <tr class="hover:bg-canvas/50 transition-colors">
        <td class="p-4">
          <span class="font-display font-extrabold text-sm text-charcoal block">#${order.orderId}</span>
          <span class="text-[11px] text-stoneGrey">${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          ${order.deliveryNotes ? `<p class="text-[10px] text-primary italic mt-0.5">Note: ${order.deliveryNotes}</p>` : ''}
        </td>

        <td class="p-4">
          <span class="font-bold text-charcoal block">${order.customerName || 'Customer'}</span>
          <a href="tel:+91${order.customerPhone}" class="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mt-0.5">
            <i data-lucide="phone" class="w-3 h-3"></i> +91 ${order.customerPhone}
          </a>
        </td>

        <td class="p-4 max-w-xs">
          <span class="text-charcoal font-medium line-clamp-2">${itemsList}</span>
        </td>

        <td class="p-4">
          <span class="font-display font-extrabold text-sm text-charcoal block">₹${order.subtotal}</span>
          <span class="text-[10px] text-stoneGrey">Advance: <strong class="text-primary font-bold">₹${order.advanceRequired || Math.round(order.subtotal * 0.5)}</strong></span>
        </td>

        <td class="p-4">
          ${statusBadge}
        </td>

        <td class="p-4 text-right">
          <div class="flex items-center justify-end gap-2">
            ${isPending ? `
              <button onclick="approveOrder('${order.orderId || order._id}')" class="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>Approve & Send Payment Link</span>
              </button>
            ` : `
              <button onclick="viewScannerModal('${order.orderId || order._id}')" class="px-3 py-1.5 bg-canvas hover:bg-surfaceAccent text-charcoal rounded-full text-xs font-bold border border-borderSubtle flex items-center gap-1.5">
                <i data-lucide="qr-code" class="w-3.5 h-3.5 text-primary"></i>
                <span>View QR Scanner</span>
              </button>
            `}

            ${isApproved ? `
              <button onclick="updateOrderStatus('${order.orderId || order._id}', 'Paid')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Mark Paid
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

async function approveOrder(orderId) {
  if (!confirm(`Approve order #${orderId} and dispatch automated WhatsApp advance payment QR?`)) return;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.order) {
      showToast('Order Approved! 🚀', `Advance payment QR generated & dispatched for #${data.order.orderId}.`);
      fetchOrders();
      openScannerModalWithData(data.order);
    } else {
      alert(data.message || 'Failed to approve order.');
    }
  } catch (err) {
    alert('Server communication error.');
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Status Updated', `Order #${orderId} marked as ${newStatus}.`);
      fetchOrders();
    }
  } catch (err) {
    alert('Failed to update order status.');
  }
}

function viewScannerModal(orderId) {
  const order = currentOrders.find(o => o.orderId === orderId || o._id === orderId);
  if (!order) return;

  const upiPayee = 'siddhivinayakcakes@upi';
  const upiAmount = order.advanceRequired || Math.round(order.subtotal * 0.5);
  const upiNote = encodeURIComponent(`Advance for ${order.orderId} Siddhivinayak Cakes`);
  const upiLink = `upi://pay?pa=${upiPayee}&pn=SiddhivinayakCakeShop&am=${upiAmount}&tn=${upiNote}&cu=INR`;
  const qrImageUrl = order.paymentQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&bgcolor=FFFBF7&color=16233B&qzone=2`;
  const whatsappMessage = order.whatsappMessageContent || `Hello! Your order (#${order.orderId}) at Siddhivinayak Cake Shop has been approved. Please complete your advance payment using this secure QR Scanner: ${qrImageUrl}`;
  const whatsappApiLink = `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  openScannerModalWithData({
    orderId: order.orderId,
    customerPhone: order.customerPhone,
    advanceRequired: upiAmount,
    paymentQrUrl: qrImageUrl,
    whatsappMessage: whatsappMessage,
    whatsappApiLink: whatsappApiLink
  });
}

function openScannerModalWithData(orderData) {
  document.getElementById('scannerOrderId').textContent = `ORDER #${orderData.orderId} APPROVED`;
  document.getElementById('scannerCustomerPhone').textContent = `+91 ${orderData.customerPhone}`;
  document.getElementById('scannerAdvanceAmount').textContent = `₹${orderData.advanceRequired}`;
  document.getElementById('scannerQrImage').src = orderData.paymentQrUrl;
  document.getElementById('scannerMessagePreview').textContent = `WhatsApp Message: "${orderData.whatsappMessage}"`;
  document.getElementById('scannerWhatsAppDirectLink').href = orderData.whatsappApiLink;
  document.getElementById('paymentScannerModal').classList.remove('hidden');
  lucide.createIcons();
}

function closeScannerModal() {
  document.getElementById('paymentScannerModal').classList.add('hidden');
}

// 5. CAKES MANAGEMENT
async function fetchCakes() {
  const res = await fetch('/api/admin/cakes', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  if (data.success) {
    currentCakes = data.data;
    renderAdminCakes();
  }
}

function renderAdminCakes() {
  const container = document.getElementById('adminCakesGrid');
  document.getElementById('cakeCountSpan').textContent = currentCakes.length;

  container.innerHTML = currentCakes.map(cake => `
    <div class="bg-white rounded-2xl p-4 border border-borderSubtle shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div class="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-canvas mb-3">
          <span class="absolute top-2 left-2 bg-white/90 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-borderSubtle">
            ${cake.category}
          </span>
          <img src="${cake.image}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${cake.fallbackImg || './assets/cake1.png'}';">
        </div>
        <h4 class="font-bold text-sm text-charcoal line-clamp-1">${cake.name}</h4>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="font-extrabold text-base text-primary">₹${cake.price}</span>
          <span class="text-xs text-stoneGrey line-through">₹${cake.originalPrice}</span>
        </div>
        <p class="text-[11px] text-stoneGrey mt-1">Badge: <span class="font-medium text-charcoal">${cake.badge || 'None'}</span></p>
      </div>

      <div class="pt-3 mt-3 border-t border-borderSubtle flex items-center justify-between gap-2">
        <button onclick="openEditCakeModal('${cake.cakeId || cake._id}')" class="px-3 py-1.5 rounded-full bg-surfaceAccent text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors flex items-center gap-1">
          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i> Edit
        </button>
        <button onclick="deleteCake('${cake.cakeId || cake._id}', '${cake.name}')" class="px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-bold transition-colors flex items-center gap-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function openNewCakeModal() {
  document.getElementById('cakeModalTitle').textContent = 'Add New Cake';
  document.getElementById('cakeFormId').value = '';
  document.getElementById('cakeFormName').value = '';
  document.getElementById('cakeFormCategory').value = 'birthday';
  document.getElementById('cakeFormBadge').value = 'Artisanal Fresh';
  document.getElementById('cakeFormPrice').value = '399';
  document.getElementById('cakeFormOriginalPrice').value = '549';
  document.getElementById('cakeFormImage').value = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';
  document.getElementById('cakeModal').classList.remove('hidden');
}

function openEditCakeModal(id) {
  const cake = currentCakes.find(c => c.cakeId === id || c._id === id);
  if (!cake) return;
  document.getElementById('cakeModalTitle').textContent = 'Edit Cake Item';
  document.getElementById('cakeFormId').value = id;
  document.getElementById('cakeFormName').value = cake.name;
  document.getElementById('cakeFormCategory').value = cake.category;
  document.getElementById('cakeFormBadge').value = cake.badge || '';
  document.getElementById('cakeFormPrice').value = cake.price;
  document.getElementById('cakeFormOriginalPrice').value = cake.originalPrice;
  document.getElementById('cakeFormImage').value = cake.image;
  document.getElementById('cakeModal').classList.remove('hidden');
}

function closeCakeModal() {
  document.getElementById('cakeModal').classList.add('hidden');
}

async function saveCake() {
  const id = document.getElementById('cakeFormId').value;
  const cakeData = {
    name: document.getElementById('cakeFormName').value,
    category: document.getElementById('cakeFormCategory').value,
    badge: document.getElementById('cakeFormBadge').value,
    price: Number(document.getElementById('cakeFormPrice').value),
    originalPrice: Number(document.getElementById('cakeFormOriginalPrice').value),
    image: document.getElementById('cakeFormImage').value
  };

  const url = id ? `/api/admin/cakes/${id}` : '/api/admin/cakes';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(cakeData)
    });
    const data = await res.json();
    if (data.success) {
      closeCakeModal();
      showToast('Success!', id ? 'Cake details updated.' : 'New cake added to menu.');
      fetchCakes();
    } else {
      alert(data.message || 'Failed to save cake.');
    }
  } catch (err) {
    alert('Server request failed.');
  }
}

async function deleteCake(id, name) {
  if (!confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;

  try {
    const res = await fetch(`/api/admin/cakes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Deleted', `Removed ${name} from menu.`);
      fetchCakes();
    } else {
      alert(data.message || 'Failed to delete cake.');
    }
  } catch (err) {
    alert('Server request failed.');
  }
}

// 6. SPOTLIGHT MANAGEMENT
async function fetchSpotlights() {
  const res = await fetch('/api/admin/spotlight', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  if (data.success) {
    currentSpotlights = data.data;
    renderAdminSpotlights();
  }
}

function renderAdminSpotlights() {
  const container = document.getElementById('adminSpotlightsGrid');
  document.getElementById('spotlightCountSpan').textContent = currentSpotlights.length;

  container.innerHTML = currentSpotlights.map(spot => `
    <div class="bg-white rounded-2xl p-5 border border-borderSubtle shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="px-3 py-0.5 bg-surfaceAccent text-primary text-xs font-bold rounded-full">${spot.day}</span>
          <span class="text-xs font-semibold text-stoneGrey bg-gray-100 px-2 py-0.5 rounded-full">${spot.batch}</span>
        </div>

        <div class="flex items-center gap-4 my-3">
          <img src="${spot.image}" class="w-20 h-20 object-cover rounded-xl bg-canvas p-1 border border-borderSubtle" onerror="this.onerror=null; this.src='${spot.fallbackImg || './assets/hero_cake.png'}';">
          <div class="flex-1">
            <h4 class="font-bold text-base text-charcoal leading-snug">${spot.title}</h4>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-extrabold text-lg text-primary">₹${spot.price}</span>
              <span class="text-xs text-stoneGrey line-through">₹${spot.originalPrice}</span>
            </div>
            <span class="inline-block mt-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              ${spot.stockLeft}
            </span>
          </div>
        </div>

        <p class="text-xs text-stoneGrey line-clamp-2 leading-relaxed">${spot.desc}</p>
      </div>

      <div class="pt-4 mt-3 border-t border-borderSubtle flex items-center justify-end">
        <button onclick="openEditSpotlightModal('${spot.spotlightId || spot._id}')" class="px-4 py-2 rounded-full bg-primary hover:bg-primaryHover text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Update Spotlight
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function openEditSpotlightModal(id) {
  const spot = currentSpotlights.find(s => s.spotlightId === id || s._id === id);
  if (!spot) return;
  document.getElementById('spotlightFormId').value = id;
  document.getElementById('spotlightFormDay').value = spot.day;
  document.getElementById('spotlightFormTag').value = spot.tag;
  document.getElementById('spotlightFormTitle').value = spot.title;
  document.getElementById('spotlightFormBatch').value = spot.batch;
  document.getElementById('spotlightFormStock').value = spot.stockLeft;
  document.getElementById('spotlightFormPrice').value = spot.price;
  document.getElementById('spotlightFormOriginalPrice').value = spot.originalPrice;
  document.getElementById('spotlightFormDesc').value = spot.desc;
  document.getElementById('spotlightFormImage').value = spot.image;
  document.getElementById('spotlightModal').classList.remove('hidden');
}

function closeSpotlightModal() {
  document.getElementById('spotlightModal').classList.add('hidden');
}

async function saveSpotlight() {
  const id = document.getElementById('spotlightFormId').value;
  const spotData = {
    day: document.getElementById('spotlightFormDay').value,
    tag: document.getElementById('spotlightFormTag').value,
    title: document.getElementById('spotlightFormTitle').value,
    batch: document.getElementById('spotlightFormBatch').value,
    stockLeft: document.getElementById('spotlightFormStock').value,
    price: Number(document.getElementById('spotlightFormPrice').value),
    originalPrice: Number(document.getElementById('spotlightFormOriginalPrice').value),
    desc: document.getElementById('spotlightFormDesc').value,
    image: document.getElementById('spotlightFormImage').value
  };

  try {
    const res = await fetch(`/api/admin/spotlight/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(spotData)
    });
    const data = await res.json();
    if (data.success) {
      closeSpotlightModal();
      showToast('Updated!', 'Daily spotlight refreshed successfully.');
      fetchSpotlights();
    } else {
      alert(data.message || 'Failed to update spotlight.');
    }
  } catch (err) {
    alert('Server request failed.');
  }
}

// 7. INITIALIZE ON LOAD
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

