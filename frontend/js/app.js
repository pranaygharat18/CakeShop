/**
 * Siddhivinayak Cake Shop - Client Application Engine
 * Handles dynamic rendering, API sync, cart operations, real-time checkout, and interactive modals.
 */

// Data storage (synced dynamically with backend API)
let SPOTLIGHT_DATA = [
  {
    id: 'spotlight-1',
    day: 'Monday Special',
    tag: "CHEF'S DAILY PICK",
    batch: "Batch #B-301",
    title: "Royal Saffron Pistachio Dome",
    bakedTime: "Freshly Baked at 7:00 AM",
    stockLeft: "Only 4 Left Today",
    rating: 4.98,
    reviews: 148,
    desc: "Sublime Kashmiri saffron milk sponge layered with Iranian pistachio cream, fragrant edible rose petal jelly, and toasted almond praline crunch.",
    price: 499,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?w=700&auto=format&fit=crop&q=80",
    fallbackImg: "./assets/hero_cake.png",
    ingredients: ["100% Eggless Option", "Kashmiri Saffron", "Iranian Pistachios"]
  },
  {
    id: 'spotlight-2',
    day: 'Tuesday Special',
    tag: "DARK CHOCOLATE NOIR",
    batch: "Batch #B-302",
    title: "Belgian Noir Dark Truffle Gateau",
    bakedTime: "Freshly Baked at 8:15 AM",
    stockLeft: "Only 2 Left Today",
    rating: 4.97,
    reviews: 215,
    desc: "Triple layer 70% dark Belgian chocolate sponge infused with espresso velvet ganache, crowned with hand-rolled gold-dusted truffles and dark crisp pearls.",
    price: 549,
    originalPrice: 749,
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=700&auto=format&fit=crop&q=80",
    fallbackImg: "./assets/cake1.png",
    ingredients: ["70% Belgian Cocoa", "Pure Butter Ganache", "Gold Dust Pearls"]
  },
  {
    id: 'spotlight-3',
    day: "Wednesday Special",
    tag: "SIGNATURE FRUIT",
    batch: "Batch #B-303",
    title: "Alphonso Mango Mascarpone Bliss",
    bakedTime: "Freshly Baked at 7:30 AM",
    stockLeft: "Only 5 Left Today",
    rating: 4.95,
    reviews: 180,
    desc: "Layers of feather-light vanilla sponge soaked in natural mango coulis, layered with rich Italian mascarpone cream and fresh Alphonso mango rosettes.",
    price: 479,
    originalPrice: 679,
    image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=700&auto=format&fit=crop&q=80",
    fallbackImg: "./assets/cake2.png",
    ingredients: ["Fresh Alphonso Mangoes", "Italian Mascarpone", "100% Eggless Option"]
  },
  {
    id: 'spotlight-4',
    day: "Weekend Exclusive",
    tag: "EXOTIC BERRY",
    batch: "Batch #B-304",
    title: "Exotic Kashmiri Rose & Berry Velvet",
    bakedTime: "Freshly Baked at 6:45 AM",
    stockLeft: "Only 3 Left Today",
    rating: 4.96,
    reviews: 320,
    desc: "Silky crimson cocoa crumb layered with authentic Philadelphia cream cheese frosting, wild raspberry compote, and organic rosewater glaze.",
    price: 599,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=700&auto=format&fit=crop&q=80",
    fallbackImg: "./assets/cake3.png",
    ingredients: ["Wild Berry Compote", "Organic Rosewater", "Philadelphia Cream Cheese"]
  }
];

let CAKES_DATABASE = [
  {
    id: 'cake-1',
    cakeId: 'cake-1',
    name: 'Chocolate Truffle Cake',
    category: 'birthday',
    price: 399,
    originalPrice: 549,
    rating: 4.9,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake1.png',
    badge: 'Bestseller'
  },
  {
    id: 'cake-2',
    cakeId: 'cake-2',
    name: 'Red Velvet Raspberry Cake',
    category: 'anniversary',
    price: 429,
    originalPrice: 599,
    rating: 4.8,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake2.png',
    badge: 'Couple Favorite'
  },
  {
    id: 'cake-3',
    cakeId: 'cake-3',
    name: 'Fresh Ratnagiri Mango Cake',
    category: 'celebrations',
    price: 449,
    originalPrice: 620,
    rating: 4.85,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake3.png',
    badge: 'Seasonal Pick'
  },
  {
    id: 'cake-4',
    cakeId: 'cake-4',
    name: 'Belgian Dark Chocolate Ganache',
    category: 'anniversary',
    price: 499,
    originalPrice: 699,
    rating: 4.9,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake4.png',
    badge: 'Pure Indulgence'
  },
  {
    id: 'cake-5',
    cakeId: 'cake-5',
    name: 'Classic Pineapple Gateau',
    category: 'birthday',
    price: 349,
    originalPrice: 499,
    rating: 4.7,
    reviews: 85,
    image: 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake5.png',
    badge: 'Tropical Classic'
  },
  {
    id: 'cake-6',
    cakeId: 'cake-6',
    name: 'Butterscotch Caramel Crunch',
    category: 'birthday',
    price: 379,
    originalPrice: 520,
    rating: 4.75,
    reviews: 90,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake1.png',
    badge: 'Nutty Toffee'
  },
  {
    id: 'cake-7',
    cakeId: 'cake-7',
    name: 'Blueberry Cheesecake',
    category: 'celebrations',
    price: 549,
    originalPrice: 750,
    rating: 4.9,
    reviews: 110,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake2.png',
    badge: 'Chef Signature'
  },
  {
    id: 'cake-8',
    cakeId: 'cake-8',
    name: 'Tiered Wedding Elegance Gateau',
    category: 'wedding',
    price: 999,
    originalPrice: 1499,
    rating: 5.0,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/hero_cake.png',
    badge: 'Grand Tier'
  },
  {
    id: 'cake-9',
    cakeId: 'cake-9',
    name: 'Pastel Strawberry Cream Cake',
    category: 'babyshower',
    price: 399,
    originalPrice: 549,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake3.png',
    badge: 'Pastel Blush'
  },
  {
    id: 'cake-10',
    cakeId: 'cake-10',
    name: 'Rich Hazelnut Nutella Crunch',
    category: 'birthday',
    price: 499,
    originalPrice: 699,
    rating: 4.92,
    reviews: 135,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80',
    fallbackImg: './assets/cake4.png',
    badge: 'Nutella Supreme'
  }
];

let currentSpotlightIndex = 0;
let cart = [];

// Helper: Safe HTML escape to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 1. LIVE API SYNCHRONIZATION
async function syncDataFromApi() {
  try {
    const [cakesRes, spotRes] = await Promise.all([
      fetch('/api/cakes').catch(() => null),
      fetch('/api/spotlight').catch(() => null)
    ]);

    if (cakesRes && cakesRes.ok) {
      const cakesJson = await cakesRes.json();
      if (cakesJson.success && Array.isArray(cakesJson.data) && cakesJson.data.length > 0) {
        CAKES_DATABASE = cakesJson.data.map(c => ({
          ...c,
          id: c.cakeId || c._id
        }));
        const activeFilter = document.querySelector('.filter-btn.active-filter')?.getAttribute('data-filter') || 'all';
        renderCakesGrid(activeFilter);
      }
    }

    if (spotRes && spotRes.ok) {
      const spotJson = await spotRes.json();
      if (spotJson.success && Array.isArray(spotJson.data) && spotJson.data.length > 0) {
        SPOTLIGHT_DATA = spotJson.data.map(s => ({
          ...s,
          id: s.spotlightId || s._id
        }));
        renderSpotlight();
      }
    }
  } catch (err) {
    console.log('Operating with local client fallback store:', err.message);
  }
}

// 2. RENDER SPOTLIGHT SECTION
function renderSpotlight() {
  const item = SPOTLIGHT_DATA[currentSpotlightIndex];
  if (!item) return;

  document.getElementById('spotlightTag').textContent = item.tag;
  document.getElementById('spotlightBatch').textContent = item.batch;
  document.getElementById('spotlightTitle').textContent = item.title;
  document.getElementById('spotlightRating').textContent = item.rating;
  document.getElementById('spotlightReviews').textContent = `(${item.reviews} reviews)`;
  document.getElementById('spotlightDesc').textContent = item.desc;
  document.getElementById('spotlightBakedTime').innerHTML = `<i data-lucide="clock" class="w-3.5 h-3.5 text-primary"></i> ${escapeHtml(item.bakedTime)}`;
  document.getElementById('spotlightStock').innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5"></i> ${escapeHtml(item.stockLeft)}`;
  document.getElementById('spotlightPrice').textContent = `₹${item.price}`;
  document.getElementById('spotlightOriginalPrice').textContent = `₹${item.originalPrice}`;

  const img = document.getElementById('spotlightImage');
  img.src = item.image;
  img.alt = item.title;
  img.onerror = () => { img.src = item.fallbackImg || './assets/hero_cake.png'; };

  const ingContainer = document.getElementById('spotlightIngredients');
  ingContainer.innerHTML = (item.ingredients || []).map(ing => `
    <span class="px-3 py-1 bg-surfaceSubtle text-primary text-xs font-semibold rounded-full flex items-center gap-1.5 border border-primary/15">
      <i data-lucide="check" class="w-3.5 h-3.5"></i> ${escapeHtml(ing)}
    </span>
  `).join('');

  document.getElementById('spotlightCounter').textContent = `${currentSpotlightIndex + 1} of ${SPOTLIGHT_DATA.length} Specials`;

  renderDayTabs();
  lucide.createIcons();
}

function renderDayTabs() {
  const tabsContainer = document.getElementById('dayTabsContainer');
  tabsContainer.innerHTML = SPOTLIGHT_DATA.map((item, idx) => {
    const isActive = idx === currentSpotlightIndex;
    return `
      <button onclick="switchSpotlight(${idx})" class="p-2.5 rounded-2xl text-left border transition-all ${
        isActive 
          ? 'bg-surfaceSubtle border-primary text-primary shadow-sm font-bold' 
          : 'bg-canvas border-borderSubtle text-stoneGrey hover:border-primary/40 font-medium'
      }">
        <span class="text-[10px] block opacity-80 uppercase tracking-wider">${escapeHtml(item.day)}</span>
        <span class="text-xs truncate block font-bold mt-0.5 text-charcoal">${escapeHtml(item.title)}</span>
      </button>
    `;
  }).join('');
}

function switchSpotlight(index) {
  currentSpotlightIndex = index;
  renderSpotlight();
}

// 3. RENDER BEST SELLERS GRID
function renderCakesGrid(filter = 'all') {
  const grid = document.getElementById('cakesGrid');
  const filtered = filter === 'all' 
    ? CAKES_DATABASE 
    : CAKES_DATABASE.filter(c => c.category === filter);

  grid.innerHTML = filtered.map(cake => `
    <div class="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-pink-100/70 shadow-sm hover:shadow-level-2 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div class="w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#FBF7F4] mb-2 sm:mb-3 relative">
          <span class="absolute top-2 left-2 z-10 bg-white/95 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-borderSubtle">
            ${escapeHtml(cake.badge)}
          </span>
          <img src="${cake.image}" 
               alt="${escapeHtml(cake.name)}" 
               class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
               onerror="this.onerror=null; this.src='${cake.fallbackImg || './assets/cake1.png'}';">
        </div>

        <div class="text-center px-0.5">
          <h3 class="text-xs sm:text-sm font-semibold text-charcoal line-clamp-1 mb-1">
            ${escapeHtml(cake.name)}
          </h3>
          <p class="font-display text-sm sm:text-base font-extrabold text-[#2D1B22] mb-1">
            ₹ ${cake.price}
          </p>
          <div class="flex items-center justify-center space-x-1 text-amber-400 text-[10px] sm:text-xs mb-3" aria-label="${cake.rating} rating from ${cake.reviews} reviews">
            <span class="tracking-tighter">★★★★★</span>
            <span class="text-[10px] sm:text-[11px] font-medium text-[#7C8290] ml-1">
              ${cake.rating} (${cake.reviews})
            </span>
          </div>
        </div>
      </div>

      <button onclick="addToCart('${cake.id}')" type="button" class="w-full py-2 px-3 rounded-full bg-primary hover:bg-primaryHover active:scale-[0.98] text-white text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-pill focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Add ${escapeHtml(cake.name)} to basket">
        <svg class="w-3.5 h-3.5 fill-none stroke-current stroke-2 shrink-0" viewBox="0 0 24 24">
          <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <span class="truncate">Add to Cart</span>
      </button>
    </div>
  `).join('');

  lucide.createIcons();
}

// 4. CART INTERACTIONS & CONTROLS
function addToCart(cakeId) {
  let item = CAKES_DATABASE.find(c => c.id === cakeId);
  if (!item) {
    item = SPOTLIGHT_DATA.find(s => s.id === cakeId) || SPOTLIGHT_DATA[currentSpotlightIndex];
  }

  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  updateCartUI();
  showToast('Added to Cart! 🍰', `${item.name || item.title} has been added to your basket.`);
}

function updateCartUI() {
  const badge = document.getElementById('cartCountBadge');
  const drawerCount = document.getElementById('drawerItemCount');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalCount;
  drawerCount.textContent = totalCount;

  const list = document.getElementById('cartItemsList');
  const footer = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotal');

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div class="w-16 h-16 rounded-full bg-surfaceSubtle flex items-center justify-center text-primary">
          <i data-lucide="shopping-bag" class="w-8 h-8"></i>
        </div>
        <div>
          <h4 class="font-display font-bold text-charcoal text-base">Your cart is empty</h4>
          <p class="text-xs text-stoneGrey mt-1">Looks like you haven't added any sweet treats yet!</p>
        </div>
        <a href="#menu" onclick="closeCart();" class="px-6 py-2.5 bg-primary text-white font-bold rounded-full text-xs shadow-pill">
          Explore Menu
        </a>
      </div>
    `;
    footer.classList.add('hidden');
  } else {
    footer.classList.remove('hidden');
    let subtotal = 0;

    list.innerHTML = cart.map((item, index) => {
      subtotal += item.price * item.qty;
      return `
        <div class="flex items-center gap-3 p-3 bg-canvas rounded-2xl border border-borderSubtle">
          <img src="${item.image}" alt="${escapeHtml(item.name || item.title)}" class="w-14 h-14 object-cover rounded-xl bg-white p-1 border border-borderSubtle shrink-0" onerror="this.onerror=null; this.src='${item.fallbackImg || './assets/cake1.png'}';">
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-bold text-charcoal truncate">${escapeHtml(item.name || item.title)}</h5>
            <p class="font-display text-xs text-primary font-extrabold mt-0.5">₹${item.price}</p>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="changeQty(${index}, -1)" class="w-6 h-6 rounded-full bg-white border border-borderSubtle text-charcoal text-xs flex items-center justify-center hover:bg-surfaceAccent" aria-label="Decrease quantity">-</button>
              <span class="text-xs font-bold text-charcoal">${item.qty}</span>
              <button onclick="changeQty(${index}, 1)" class="w-6 h-6 rounded-full bg-white border border-borderSubtle text-charcoal text-xs flex items-center justify-center hover:bg-surfaceAccent" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button onclick="removeFromCart(${index})" class="text-stoneGrey hover:text-primary p-2" aria-label="Remove item">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    }).join('');

    subtotalEl.textContent = `₹${subtotal}`;
  }

  lucide.createIcons();
}

function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function openCart() {
  const backdrop = document.getElementById('cartDrawerBackdrop');
  const drawer = document.getElementById('cartDrawer');
  backdrop.classList.remove('hidden');
  setTimeout(() => {
    drawer.classList.remove('translate-x-full');
  }, 10);
}

function closeCart() {
  const backdrop = document.getElementById('cartDrawerBackdrop');
  const drawer = document.getElementById('cartDrawer');
  drawer.classList.add('translate-x-full');
  setTimeout(() => {
    backdrop.classList.add('hidden');
  }, 300);
}

function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Your sweet basket is empty! Please add a cake first.");
    return;
  }
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById('checkoutSubtotal').textContent = `₹${subtotal}`;
  document.getElementById('checkoutAdvanceRequired').textContent = `₹${Math.round(subtotal * 0.5)}`;
  document.getElementById('checkoutModalBackdrop').classList.remove('hidden');
  closeCart();
}

function closeCheckoutModal() {
  document.getElementById('checkoutModalBackdrop').classList.add('hidden');
}

function closeSuccessModal() {
  document.getElementById('orderSuccessModalBackdrop').classList.add('hidden');
}

async function submitCustomerOrder() {
  const phoneInput = document.getElementById('orderCustomerPhone');
  const sanitizedPhone = phoneInput.value.replace(/[^0-9]/g, '');

  if (sanitizedPhone.length !== 10) {
    alert("Please enter a valid 10-digit Indian WhatsApp mobile number.");
    return;
  }

  const name = document.getElementById('orderCustomerName').value;
  const notes = document.getElementById('orderDeliveryNotes').value;
  const submitBtn = document.getElementById('submitOrderBtn');

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Submitting Request...</span>`;

  const payload = {
    customerPhone: sanitizedPhone,
    customerName: name || 'Valued Customer',
    deliveryNotes: notes || '',
    items: cart.map(item => ({
      name: item.name || item.title,
      price: item.price,
      qty: item.qty,
      image: item.image
    }))
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success && data.order) {
      closeCheckoutModal();
      document.getElementById('confirmedOrderId').textContent = data.order.orderId;
      document.getElementById('confirmedOrderTotal').textContent = `₹${data.order.subtotal}`;
      document.getElementById('orderSuccessModalBackdrop').classList.remove('hidden');

      cart = [];
      updateCartUI();
      lucide.createIcons();
    } else {
      alert(data.message || 'Failed to place order.');
    }
  } catch (err) {
    alert('Network or server error while placing order. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Place Order Request</span><i data-lucide="check" class="w-4 h-4"></i>`;
    lucide.createIcons();
  }
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

// 5. VIP CLUB SUBSCRIPTION
async function handleSweetClubSubmit() {
  const phoneInput = document.getElementById('vipPhone');
  const sanitizedPhone = phoneInput.value.replace(/[^0-9]/g, '');

  if (sanitizedPhone.length !== 10) {
    alert("Please enter a valid 10-digit Indian mobile number.");
    return;
  }

  try {
    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: sanitizedPhone })
    });
    const data = await res.json();
    phoneInput.value = '';
    showToast('VIP Club Activated! 🎁', data.message || 'Welcome to Siddhivinayak Sweet Club!');
  } catch (err) {
    phoneInput.value = '';
    showToast('VIP Club Activated! 🎁', 'Welcome to Siddhivinayak Sweet Club! Your 15% discount coupon is on its way.');
  }
}

// 6. LEGAL MODAL
function openLegalModal(type) {
  const modal = document.getElementById('legalModalBackdrop');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  if (type === 'privacy') {
    title.textContent = 'Privacy Policy';
    body.innerHTML = `
      <p><strong>Effective Date:</strong> January 2026</p>
      <p>At Siddhivinayak Cake Shop, we respect your privacy. We only collect the necessary contact details strictly required to prepare and dispatch your cake orders.</p>
      <p><strong>Data Usage:</strong> We do not sell or trade your personal information. All WhatsApp updates or order notifications are directly sent from our bakery.</p>
      <p>For inquiries, email us at <a href="mailto:orders@siddhivinayakcakes.com" class="text-primary underline">orders@siddhivinayakcakes.com</a>.</p>
    `;
  } else if (type === 'terms') {
    title.textContent = 'Terms of Service';
    body.innerHTML = `
      <p><strong>1. Fresh Baking & Delivery:</strong> All cakes are baked fresh to order. Standard celebration cakes require 3-4 hours advance notice.</p>
      <p><strong>2. Custom Orders:</strong> Anniversary and tiered wedding cakes require 24 hours prior confirmation.</p>
      <p><strong>3. Cancellation Policy:</strong> Due to perishable freshly baked goods, cancellations must be requested at least 4 hours before scheduled dispatch time.</p>
    `;
  } else if (type === 'fssai') {
    title.textContent = 'FSSAI License & Food Safety';
    body.innerHTML = `
      <p><strong>Food Safety and Standards Authority of India (FSSAI)</strong></p>
      <p>Siddhivinayak Cake Shop operates under strict hygiene standards compliant with the Food Safety and Standards Act of India.</p>
      <p><strong>Facility Hygiene:</strong> Temperature-controlled refrigeration, daily sanitization of baking stations, 100% pure vegetarian / eggless separation, and certified food-grade packaging.</p>
    `;
  }

  modal.classList.remove('hidden');
}

function closeLegalModal() {
  document.getElementById('legalModalBackdrop').classList.add('hidden');
}

// 7. INITIALIZATION & EVENT BINDINGS
document.addEventListener('DOMContentLoaded', () => {
  // Dynamic current year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderSpotlight();
  renderCakesGrid('all');
  updateCartUI();
  lucide.createIcons();
  syncDataFromApi();

  // Spotlight navigation
  document.getElementById('prevSpotlightBtn')?.addEventListener('click', () => {
    currentSpotlightIndex = (currentSpotlightIndex - 1 + SPOTLIGHT_DATA.length) % SPOTLIGHT_DATA.length;
    renderSpotlight();
  });

  document.getElementById('nextSpotlightBtn')?.addEventListener('click', () => {
    currentSpotlightIndex = (currentSpotlightIndex + 1) % SPOTLIGHT_DATA.length;
    renderSpotlight();
  });

  document.getElementById('orderSpotlightBtn')?.addEventListener('click', () => {
    const item = SPOTLIGHT_DATA[currentSpotlightIndex];
    addToCart(item.id);
    openCart();
  });

  // Category filter tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-primary', 'text-white', 'shadow-pill', 'active-filter');
        b.classList.add('bg-white', 'text-stoneGrey', 'border-borderSubtle');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('bg-primary', 'text-white', 'shadow-pill', 'active-filter');
      btn.classList.remove('bg-white', 'text-stoneGrey');
      btn.setAttribute('aria-selected', 'true');

      const category = btn.getAttribute('data-filter');
      renderCakesGrid(category);
    });
  });

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Cart toggles
  document.getElementById('openCartBtn')?.addEventListener('click', openCart);
  document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
  document.getElementById('cartDrawerBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'cartDrawerBackdrop') closeCart();
  });

  // Search & Profile header buttons
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    const query = prompt("Search for your favorite cake (e.g. Truffle, Mango, Red Velvet, Cheesecake):");
    if (query) {
      const matched = CAKES_DATABASE.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
      if (matched.length > 0) {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
      } else {
        alert(`No cakes found matching "${query}". Browse our bestselling menu below!`);
      }
    }
  });

  document.getElementById('userBtn')?.addEventListener('click', () => {
    alert("👋 Welcome to Siddhivinayak Cake Shop! Sign in to view past celebration orders & sweet points.");
  });

  // Legal modal backdrop click
  document.getElementById('legalModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'legalModalBackdrop') closeLegalModal();
  });
});

