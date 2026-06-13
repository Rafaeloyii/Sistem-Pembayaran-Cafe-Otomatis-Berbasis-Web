// --- DATA INITIAL SEED (15 VARIASI MENU BARU CAFE CP 55) ---
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Kopi Hitam (Murni)", price: 5000, stock: 100, category: "Minuman" },
    { id: 2, name: "Kopi Susu Instan", price: 7000, stock: 80, category: "Minuman" },
    { id: 3, name: "Es Teh Manis Jumbo", price: 4000, stock: 150, category: "Minuman" },
    { id: 4, name: "Nutrisari Es (Susu/Jeruk)", price: 5000, stock: 60, category: "Minuman" },
    { id: 5, name: "Susu Jahe Hangat (STMJ)", price: 8000, stock: 40, category: "Minuman" },
    { id: 6, name: "Gorengan", price: 2000, stock: 200, category: "Snack" },
    { id: 7, name: "Tempe Mendoan Porsi (Isi 4)", price: 8000, stock: 30, category: "Snack" },
    { id: 8, name: "Kentang Goreng Curah", price: 10000, stock: 40, category: "Snack" },
    { id: 9, name: "Cireng Goreng Bumbu Rujak", price: 10000, stock: 35, category: "Snack" },
    { id: 10, name: "Roti Bakar Indomilk", price: 12000, stock: 25, category: "Snack" },
    { id: 11, name: "Indomie Goreng Tanpa Telur", price: 8000, stock: 100, category: "Makanan" },
    { id: 12, name: "Indomie Rebus Telur Intermesem", price: 12000, stock: 80, category: "Makanan" },
    { id: 13, name: "Nasi Kucing / Nasi Bungkus", price: 6000, stock: 50, category: "Makanan" },
    { id: 14, name: "Nasi Goreng Mawut Warkop", price: 15000, stock: 30, category: "Makanan" },
    { id: 15, name: "Magelangan (Mie + Nasi)", price: 16000, stock: 30, category: "Makanan" }
];

let state = {
    currentUser: null, 
    products: [],
    cart: [],
    orders: [],
    expenses: [],
    dailyRecaps: [],
    selectedCategory: 'Semua'
};

window.onload = function() {
    if(!localStorage.getItem('cp55_products')) {
        localStorage.setItem('cp55_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if(!localStorage.getItem('cp55_orders')) {
        localStorage.setItem('cp55_orders', JSON.stringify([]));
    }
    if(!localStorage.getItem('cp55_expenses')) {
        localStorage.setItem('cp55_expenses', JSON.stringify([]));
    }
    if(!localStorage.getItem('cp55_daily_recaps')) {
        localStorage.setItem('cp55_daily_recaps', JSON.stringify([]));
    }
    
    loadDataFromStorage();
    checkMonthlyResetCycle();
    checkSession();
    handleMobileNoticeDisplay();

    window.addEventListener('resize', handleMobileNoticeDisplay);
}

function loadDataFromStorage() {
    state.products = JSON.parse(localStorage.getItem('cp55_products'));
    state.orders = JSON.parse(localStorage.getItem('cp55_orders'));
    state.expenses = JSON.parse(localStorage.getItem('cp55_expenses')) || [];
    state.dailyRecaps = JSON.parse(localStorage.getItem('cp55_daily_recaps'));
}

function syncProductsStorage() { localStorage.setItem('cp55_products', JSON.stringify(state.products)); }
function syncOrdersStorage() { localStorage.setItem('cp55_orders', JSON.stringify(state.orders)); }
function syncExpensesStorage() { localStorage.setItem('cp55_expenses', JSON.stringify(state.expenses)); }
function syncRecapsStorage() { localStorage.setItem('cp55_daily_recaps', JSON.stringify(state.dailyRecaps)); }

function getSimpleDate(dateObj = new Date()) {
    return dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getFormattedDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
}

function getCurrentMonthYearKey() {
    const d = new Date();
    return `${d.getMonth() + 1}-${d.getFullYear()}`;
}

function checkMonthlyResetCycle() {
    const currentMonthKey = getCurrentMonthYearKey();
    const savedMonthKey = localStorage.getItem('cp55_last_month_cycle');

    if (savedMonthKey && savedMonthKey !== currentMonthKey) {
        state.orders = [];
        state.expenses = [];
        state.dailyRecaps = [];
        localStorage.setItem('cp55_orders', JSON.stringify([]));
        localStorage.setItem('cp55_expenses', JSON.stringify([]));
        localStorage.setItem('cp55_daily_recaps', JSON.stringify([]));
    }
    localStorage.setItem('cp55_last_month_cycle', currentMonthKey);
}

function updateDailyRecapData() {
    const todayStr = getFormattedDate();
    const todaySimple = getSimpleDate();
    
    let todayRevenue = 0;
    state.orders.forEach(o => {
        if(o.status === 'Completed' && (o.dateKey === todaySimple || (!o.dateKey && o.time))) {
            todayRevenue += o.total;
        }
    });

    let todayExpenses = 0;
    state.expenses.forEach(e => {
        if(e.dateKey === todaySimple) {
            todayExpenses += e.amount;
        }
    });

    let netProfit = todayRevenue - todayExpenses;
    const existingDayIndex = state.dailyRecaps.findIndex(r => r.date === todayStr);
    const dataDay = { date: todayStr, dateKey: todaySimple, revenue: todayRevenue, expenses: todayExpenses, profit: netProfit };

    if (existingDayIndex >= 0) {
        state.dailyRecaps[existingDayIndex] = dataDay;
    } else {
        state.dailyRecaps.push(dataDay);
    }
    syncRecapsStorage();
}

function downloadRecapCSV() {
    if (state.dailyRecaps.length === 0) {
        alert("⚠️ Belum ada data rekapitulasi harian!");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Hari dan Tanggal,Pemasukan Kotor (Rp),Pengeluaran Operasional (Rp),Pendapatan Bersih (Rp)\n";
    state.dailyRecaps.forEach(r => {
        csvContent += `"${r.date}",${r.revenue},${r.expenses},${r.profit}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Keuangan_CP55_${getCurrentMonthYearKey()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleMobileNoticeDisplay() {
    const notice = document.getElementById('mobile-notice');
    if(!notice) return;
    if(window.innerWidth <= 600) {
        notice.style.display = 'block';
    } else {
        notice.style.display = 'none';
    }
}

function checkSession() {
    const savedUser = sessionStorage.getItem('cp55_session');
    if(savedUser) {
        state.currentUser = savedUser;
        showMainLayout();
    } else {
        state.currentUser = null;
        showPembeliLayout();
    }
}

function login() {
    const userIn = document.getElementById('username').value.trim();
    const passIn = document.getElementById('password').value.trim();
    const isMobile = window.innerWidth <= 600;

    if(userIn === 'owner55' && passIn === 'owner123') {
        state.currentUser = 'Owner';
    } else if(userIn === 'kasir55' && passIn === 'kasir123') {
        if(isMobile) {
            alert('❌ Akses Ditolak!\nAkun Kasir hanya bisa diakses via PC/Tablet untuk keperluan efisiensi monitor dapur.');
            return;
        }
        state.currentUser = 'Kasir';
    } else {
        alert('⚠️ Username atau Password salah!');
        return;
    }

    sessionStorage.setItem('cp55_session', state.currentUser);
    showMainLayout();
    
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function logout() {
    sessionStorage.removeItem('cp55_session');
    state.currentUser = null;
    showPembeliLayout();
}

function showPembeliLayout() {
    document.getElementById('app-sidebar').style.display = 'none';
    document.querySelector('.main-content').style.marginLeft = '0';
    switchTab('pembeli');
}

function backToPembeli() {
    logout();
}

function showMainLayout() {
    const sidebar = document.getElementById('app-sidebar');
    const menuContainer = document.getElementById('sidebar-menu-items');
    document.getElementById('current-role').innerText = state.currentUser;
    
    sidebar.style.display = 'flex';
    document.querySelector('.main-content').style.marginLeft = window.innerWidth > 768 ? 'var(--sidebar-width)' : '0';
    menuContainer.innerHTML = '';

    if (state.currentUser === 'Kasir') {
        menuContainer.innerHTML = `
            <div class="menu-item-link" id="tab-status" onclick="switchTab('status')">
                <span class="icon">🍳</span> Status Dapur
            </div>
            <div class="menu-item-link" id="tab-history" onclick="switchTab('history')">
                <span class="icon">📄</span> Riwayat Nota
            </div>
        `;
        switchTab('status');
    } else if (state.currentUser === 'Owner') {
        menuContainer.innerHTML = `
            <div class="menu-item-link" id="tab-owner-summary" onclick="switchTab('owner-summary')">
                <span class="icon">📊</span> Ringkasan Keuangan
            </div>
            <div class="menu-item-link" id="tab-owner-recap" onclick="switchTab('owner-recap')">
                <span class="icon">📅</span> Laporan Harian & CSV
            </div>
            <div class="menu-item-link" id="tab-owner-expense" onclick="switchTab('owner-expense')">
                <span class="icon">💸</span> Catat Pengeluaran
            </div>
            <div class="menu-item-link" id="tab-owner-addmenu" onclick="switchTab('owner-addmenu')">
                <span class="icon">➕</span> Variasi Menu Baru
            </div>
            <div class="menu-item-link" id="tab-owner-stock" onclick="switchTab('owner-stock')">
                <span class="icon">📦</span> Manajemen Stok
            </div>
        `;
        switchTab('owner-summary');
    }
}

function switchTab(tabName) {
    const pages = ['pembeli', 'login', 'status', 'history', 'owner-summary', 'owner-recap', 'owner-expense', 'owner-addmenu', 'owner-stock'];
    
    if (tabName === 'pembeli' || tabName === 'status') {
        document.body.classList.add('pos-layout-active');
    } else {
        document.body.classList.remove('pos-layout-active');
    }

    pages.forEach(p => {
        const element = document.getElementById(`page-${p}`);
        if(element) element.classList.remove('active');
        
        const tabElement = document.getElementById(`tab-${p}`);
        if(tabElement) tabElement.classList.remove('active');
    });

    const activePage = document.getElementById(`page-${tabName}`);
    if(activePage) activePage.classList.add('active');
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    if(activeTab) activeTab.classList.add('active');

    if(tabName === 'pembeli') {
        renderPOSCatalog();
        switchCartSubTab('list');
    }
    if(tabName === 'status') renderKitchenDashboard();
    if(tabName === 'history') renderHistoryList();
    if(tabName.startsWith('owner-')) renderOwnerDashboard(tabName);
}

function filterCategory(category, element) {
    state.selectedCategory = category;
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderPOSCatalog();
}

// LOGIKA PINTAR: Syarat Best Seller harus terjual > 5 Porsi, Maksimal diambil 4 teratas
function getBestSellerProductIds() {
    let productSalesMap = {};
    state.orders.forEach(o => {
        if (o.status === 'Completed') {
            o.items.forEach(item => {
                if (!productSalesMap[item.id]) {
                    productSalesMap[item.id] = 0;
                }
                productSalesMap[item.id] += item.qty;
            });
        }
    });

    let salesArray = Object.keys(productSalesMap).map(id => {
        return { id: parseInt(id), qty: productSalesMap[id] };
    });

    // Filter: Pembelian minimal harus DI ATAS 5 porsi agar masuk kategori Best Seller
    return salesArray
        .filter(item => item.qty > 5)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 4) // Batasi maksimal hanya 4 menu terlaris dalam satu siklus rekap harian/mingguan
        .map(item => item.id);
}

function renderPOSCatalog() {
    const container = document.getElementById('pos-menu-render');
    if(!container) return;
    container.innerHTML = '';
    
    // Filter kategori awal
    let filtered = state.products.filter(p => state.selectedCategory === 'Semua' || p.category === state.selectedCategory);

    if(filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 30px; color:#999;">Menu tidak ditemukan.</p>`;
        return;
    }

    const bestSellers = getBestSellerProductIds();

    // FITUR UTAMA: Urutkan agar menu Best Seller otomatis naik ke deretan paling atas
    filtered.sort((a, b) => {
        const aIsBest = bestSellers.includes(a.id) ? 1 : 0;
        const bIsBest = bestSellers.includes(b.id) ? 1 : 0;
        return bIsBest - aIsBest; // Pemenang Best Seller didahulukan ke atas indeks
    });

    filtered.forEach(p => {
        const isLowStock = p.stock <= 5 && p.stock > 0;
        const isOut = p.stock === 0;
        const isProductBest = bestSellers.includes(p.id);
        const bestBadge = isProductBest ? `<span class="badge-best">⭐ BEST</span>` : '';
        const stockBadge = isOut ? `<span class="badge-out">🚫 Habis</span>` : (isLowStock ? `<span class="badge-low">⚠️ Tipis</span>` : '');
        
        container.innerHTML += `
            <div class="menu-card ${isOut ? 'disabled-card' : ''}">
                <div class="menu-card-header">
                    <span class="menu-card-category">${p.category}</span>
                    <div class="menu-badges">${bestBadge}${stockBadge}</div>
                </div>
                <h4 class="menu-card-title">${p.name}</h4>
                <div class="menu-card-price">Rp ${p.price.toLocaleString('id-ID')}</div>
                <div class="menu-card-footer">
                    <span class="stock-info">Stok: <strong>${p.stock}</strong></span>
                    <button class="btn-card-add" onclick="addToCart(${p.id})" ${isOut ? 'disabled' : ''}>
                        ${isOut ? 'Kosong' : '+ Tambah'}
                    </button>
                </div>
            </div>
        `;
    });
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if(product && product.stock > 0) {
        product.stock -= 1;
        const cartItem = state.cart.find(item => item.id === productId);
        if(cartItem) {
            cartItem.qty += 1;
        } else {
            state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
        }
        renderPOSCatalog();
        renderCart();
    }
}

function renderCart() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = '';
    let grandTotal = 0;
    if(state.cart.length === 0) {
        list.innerHTML = `<div class="empty-cart-state">🛒 Keranjang belanja kosong</div>`;
        document.getElementById('cart-mini-total').innerText = 'Rp 0';
        document.getElementById('cart-grand-total').innerText = 'Rp 0';
        return;
    }
    state.cart.forEach(item => {
        const total = item.price * item.qty;
        grandTotal += total;
        list.innerHTML += `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-qty">x${item.qty}</span>
                </div>
                <span class="cart-item-price">Rp ${total.toLocaleString('id-ID')}</span>
            </div>
        `;
    });
    document.getElementById('cart-mini-total').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    document.getElementById('cart-grand-total').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

function switchCartSubTab(subTab) {
    document.getElementById('cart-tab-list').classList.remove('active');
    document.getElementById('cart-tab-pay').classList.remove('active');
    document.getElementById('cart-sub-page-list').classList.remove('active');
    document.getElementById('cart-sub-page-pay').classList.remove('active');

    if (subTab === 'list') {
        document.getElementById('cart-tab-list').classList.add('active');
        document.getElementById('cart-sub-page-list').classList.add('active');
    } else {
        document.getElementById('cart-tab-pay').classList.add('active');
        document.getElementById('cart-sub-page-pay').classList.add('active');
    }
}

function goToPaymentTab() {
    const name = document.getElementById('cart-customer-name').value.trim();
    if(!name) { alert('⚠️ Mohon tulis nama pembeli terlebih dahulu!'); return; }
    if(state.cart.length === 0) { alert('⚠️ Keranjang masih kosong!'); return; }
    switchCartSubTab('pay');
}

function selectPaymentMethod(method) {
    document.getElementById('pay-btn-cash').classList.remove('active');
    document.getElementById('pay-btn-qris').classList.remove('active');
    document.getElementById('cart-payment-method').value = method;

    if(method === 'cash') {
        document.getElementById('pay-btn-cash').classList.add('active');
        document.getElementById('qris-payment-box').style.display = 'none';
    } else {
        document.getElementById('pay-btn-qris').classList.add('active');
        document.getElementById('qris-payment-box').style.display = 'block';
    }
}

function checkoutOrder() {
    const custName = document.getElementById('cart-customer-name').value.trim();
    const notes = document.getElementById('cart-cashier-notes').value.trim();
    const method = document.getElementById('cart-payment-method').value;

    if(!custName || state.cart.length === 0) return;
    
    let grandTotal = 0;
    state.cart.forEach(i => grandTotal += (i.price * i.qty));

    const nextId = state.orders.length > 0 ? Math.max(...state.orders.map(o => o.id)) + 1 : 1001;
    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
        id: nextId,
        customer: custName,
        items: [...state.cart],
        total: grandTotal,
        method: method.toUpperCase(),
        notes: notes || '-',
        status: 'Pending',
        time: timeString,
        dateKey: getSimpleDate()
    };

    state.orders.push(newOrder);
    syncOrdersStorage();
    syncProductsStorage();

    // Reset Form Belanja
    state.cart = [];
    document.getElementById('cart-customer-name').value = '';
    document.getElementById('cart-cashier-notes').value = '';
    selectPaymentMethod('cash');
    renderCart();
    renderPOSCatalog();

    showReceiptModal(newOrder);
}

function showReceiptModal(order) {
    const wrapper = document.getElementById('receipt-print-area');
    let itemsHtml = '';
    order.items.forEach(i => {
        itemsHtml += `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                <span>${i.name} (x${i.qty})</span>
                <span>Rp ${(i.price * i.qty).toLocaleString('id-ID')}</span>
            </div>
        `;
    });

    wrapper.innerHTML = `
        <div style="text-align: center; margin-bottom: 15px;">
            <h3 style="margin-bottom:2px;">CAFE CP 55</h3>
            <p style="font-size:0.75rem; color:#666; margin-bottom:5px;">Gresik, Jawa Timur</p>
            <div style="border-top:1px dashed #ccc; margin-top:10px;"></div>
        </div>
        <div style="font-size:0.8rem; color:#444; margin-bottom:12px; line-height:1.4;">
            <div><strong>No. Nota:</strong> #${order.id}</div>
            <div><strong>Waktu:</strong> ${order.dateKey} - ${order.time}</div>
            <div><strong>Pelanggan:</strong> ${order.customer}</div>
            <div><strong>Metode:</strong> ${order.method}</div>
            <div><strong>Notes:</strong> ${order.notes}</div>
        </div>
        <div style="border-top:1px dashed #ccc; padding-top:10px; margin-bottom:10px;">
            ${itemsHtml}
        </div>
        <div style="border-top:1px dashed #ccc; padding-top:10px; display:flex; justify-content:space-between; font-weight:bold; font-size:1rem; color:var(--primary);">
            <span>TOTAL BAYAR:</span>
            <span>Rp ${order.total.toLocaleString('id-ID')}</span>
        </div>
        <div style="text-align:center; margin-top:20px; font-size:0.75rem; color:#777; font-style:italic;">
            Terima kasih atas kunjungan Anda!<br>Pesanan sedang diteruskan ke dapur monitor.
        </div>
    `;
    document.getElementById('modal-receipt').style.display = 'flex';
}

// FIX UTAMA: Pengecekan pendaratan halaman asal secara pintar saat menutup nota
function closeReceiptModal() {
    document.getElementById('modal-receipt').style.display = 'none';
    
    if (state.currentUser === 'Kasir') {
        switchTab('history');
    } else if (state.currentUser === 'Owner') {
        switchTab('owner-summary');
    } else {
        switchTab('pembeli');
    }
}

function renderKitchenDashboard() {
    const container = document.getElementById('kitchen-cards-render');
    if(!container) return;
    container.innerHTML = '';

    const activeOrders = state.orders.filter(o => o.status === 'Pending' || o.status === 'Cooking');
    if(activeOrders.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:50px; color:var(--text-muted);">
                <span style="font-size:3rem;">📭</span>
                <p style="margin-top:10px; font-weight:600;">Belum ada pesanan masuk ke antrean dapur saat ini.</p>
            </div>
        `;
        return;
    }

    activeOrders.forEach(o => {
        let itemsListHtml = '';
        o.items.forEach(i => {
            itemsListHtml += `<li><strong>${i.qty}x</strong> ${i.name}</li>`;
        });

        const statusLabel = o.status === 'Pending' ? 'Antrean Baru' : 'Sedang Dimasak';
        const statusClass = o.status === 'Pending' ? 'status-pending' : 'status-cooking';
        
        container.innerHTML += `
            <div class="kitchen-card ${o.status === 'Cooking' ? 'border-cooking' : ''}">
                <div class="k-card-header">
                    <div>
                        <span class="k-id">#${o.id}</span>
                        <span class="k-time">⏰ ${o.time}</span>
                    </div>
                    <span class="k-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="k-customer">Pelanggan: <strong>${o.customer}</strong></div>
                <ul class="k-items">${itemsListHtml}</ul>
                <div class="k-notes">💡 Catatan: <span>${o.notes}</span></div>
                <div class="k-actions">
                    ${o.status === 'Pending' ? `
                        <button class="k-btn btn-cook" onclick="updateOrderStatus(${o.id}, 'Cooking')">Mulai Masak 🍳</button>
                    ` : `
                        <button class="k-btn btn-done" onclick="updateOrderStatus(${o.id}, 'Completed')">Siap Sajikan ✔</button>
                    `}
                </div>
            </div>
        `;
    });
}

function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if(order) {
        order.status = newStatus;
        syncOrdersStorage();
        updateDailyRecapData();
        if(state.currentUser === 'Kasir') renderKitchenDashboard();
        if(state.currentUser === 'Owner') renderOwnerDashboard('owner-summary');
    }
}

function renderHistoryList() {
    const tbody = document.getElementById('table-history-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    if(state.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#aaa;">Belum ada riwayat transaksi nota penjualan.</td></tr>`;
        return;
    }

    [...state.orders].reverse().forEach(o => {
        let itemsSummary = o.items.map(i => `${i.name} (${i.qty})`).join(', ');
        let pillColor = o.status === 'Completed' ? '#2ecc71' : (o.status === 'Cooking' ? '#f1c40f' : '#e67e22');
        if(o.status === 'Cancelled') pillColor = '#e74c3c';

        tbody.innerHTML += `
            <tr>
                <td><strong>#${o.id}</strong></td>
                <td>${o.dateKey || ''} ${o.time}</td>
                <td>${o.customer}</td>
                <td style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsSummary}">${itemsSummary}</td>
                <td><strong>Rp ${o.total.toLocaleString('id-ID')}</strong></td>
                <td><span class="pay-method-badge">${o.method}</span></td>
                <td><span class="status-pill" style="background:${pillColor}">${o.status}</span></td>
                <td>
                    <button style="padding:4px 8px; font-size:0.75rem; cursor:pointer;" onclick="reprintReceiptById(${o.id})">Lihat Nota 📄</button>
                    ${(o.status !== 'Completed' && o.status !== 'Cancelled') ? `
                        <button style="padding:4px 8px; font-size:0.75rem; background:var(--accent); color:white; border:none; border-radius:3px; cursor:pointer;" onclick="cancelOrderFromHistory(${o.id})">Batal</button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
}

function reprintReceiptById(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if(order) showReceiptModal(order);
}

function cancelOrderFromHistory(orderId) {
    if(confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Stok akan dikembalikan otomatis.')) {
        const order = state.orders.find(o => o.id === orderId);
        if(order) {
            order.status = 'Cancelled';
            order.items.forEach(item => {
                const product = state.products.find(p => p.id === item.id);
                if(product) product.stock += item.qty;
            });
            syncOrdersStorage();
            syncProductsStorage();
            updateDailyRecapData();
            renderHistoryList();
        }
    }
}

function renderOwnerDashboard(activeTabName) {
    updateDailyRecapData();

    if(activeTabName === 'owner-summary') {
        let totalRevenue = 0;
        state.orders.forEach(o => { if(o.status === 'Completed') totalRevenue += o.total; });

        let totalExpenses = 0;
        state.expenses.forEach(e => totalExpenses += e.amount);
        
        let netProfit = totalRevenue - totalExpenses;

        document.getElementById('stat-revenue').innerText = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
        document.getElementById('stat-expenses').innerText = `Rp ${totalExpenses.toLocaleString('id-ID')}`;
        document.getElementById('stat-profit').innerText = `Rp ${netProfit.toLocaleString('id-ID')}`;

        // Render Trend Chart Harian
        const dailyChartContainer = document.getElementById('chart-daily-render');
        dailyChartContainer.innerHTML = '';
        
        if(state.dailyRecaps.length === 0) {
            dailyChartContainer.innerHTML = '<p style="color:#999; text-align:center; padding-top:20px;">Belum ada data rekap harian.</p>';
        } else {
            let maxProfit = Math.max(...state.dailyRecaps.map(r => Math.abs(r.profit)), 1);
            state.dailyRecaps.forEach(r => {
                const percentage = Math.min((Math.abs(r.profit) / maxProfit) * 100, 100);
                const barColor = r.profit >= 0 ? 'var(--secondary)' : 'var(--accent)';
                dailyChartContainer.innerHTML += `
                    <div class="daily-chart-row">
                        <div class="daily-chart-date">${r.date}</div>
                        <div class="daily-bar-wrapper">
                            <span class="daily-bar-label">Profit Bersih</span>
                            <div class="daily-bar-track">
                                <div class="daily-bar-fill" style="width: ${percentage}%; background-color: ${barColor};"></div>
                            </div>
                            <span class="daily-bar-val" style="color:${barColor}">Rp ${r.profit.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                `;
            });
        }

        // FIX UTAMA: Batasi Grafik Terlaris di dashboard Owner maksimal HANYA "Top 5" menu teratas
        const bestChartContainer = document.getElementById('chart-best-render');
        bestChartContainer.innerHTML = '';
        
        let itemQuantities = {};
        state.orders.forEach(o => {
            if(o.status === 'Completed') {
                o.items.forEach(i => {
                    itemQuantities[i.name] = (itemQuantities[i.name] || 0) + i.qty;
                });
            }
        });

        let topItems = Object.keys(itemQuantities).map(name => {
            return { name: name, qty: itemQuantities[name] };
        });
        topItems.sort((a,b) => b.qty - a.qty);

        // Batasi hanya memotong 5 data teratas saja
        let finalTop5Items = topItems.slice(0, 5);

        if(finalTop5Items.length === 0) {
            bestChartContainer.innerHTML = '<p style="color:#999; text-align:center; padding-top:20px;">Belum ada menu terjual.</p>';
        } else {
            let maxQty = Math.max(...finalTop5Items.map(i => i.qty), 1);
            finalTop5Items.forEach(item => {
                const percentage = (item.qty / maxQty) * 100;
                bestChartContainer.innerHTML += `
                    <div class="daily-chart-row">
                        <div class="daily-chart-date" style="color:var(--primary); font-size:0.9rem;">${item.name}</div>
                        <div class="daily-bar-wrapper">
                            <span class="daily-bar-label">Terjual</span>
                            <div class="daily-bar-track">
                                <div class="daily-bar-fill" style="width: ${percentage}%; background-color: #27ae60;"></div>
                            </div>
                            <span class="daily-bar-val" style="color:#27ae60">${item.qty} Porsi</span>
                        </div>
                    </div>
                `;
            });
        }
    }

    if(activeTabName === 'owner-recap') {
        const tbody = document.getElementById('table-recap-body');
        tbody.innerHTML = '';
        if(state.dailyRecaps.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#aaa; padding:20px;">Belum ada log rekap harian bulan ini.</td></tr>`;
            return;
        }
        [...state.dailyRecaps].reverse().forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${r.date}</strong></td>
                    <td style="color:#27ae60; font-weight:600;">+ Rp ${r.revenue.toLocaleString('id-ID')}</td>
                    <td style="color:var(--accent);"> - Rp ${r.expenses.toLocaleString('id-ID')}</td>
                    <td style="font-weight:700; color:${r.profit >= 0 ? 'var(--primary)' : 'var(--accent)'}">Rp ${r.profit.toLocaleString('id-ID')}</td>
                </tr>
            `;
        });
    }

    if(activeTabName === 'owner-expense') {
        renderExpensesListTable();
    }

    if(activeTabName === 'owner-stock') {
        const tbody = document.getElementById('table-stock-body');
        tbody.innerHTML = '';
        state.products.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td><span class="pay-method-badge">${p.category}</span></td>
                    <td>Rp ${p.price.toLocaleString('id-ID')}</td>
                    <td>
                        <span style="font-weight:bold; color:${p.stock <= 5 ? 'var(--accent)' : 'inherit'}">
                            ${p.stock} Tersedia
                        </span>
                    </td>
                    <td>
                        <div style="display:flex; gap:5px; align-items:center;">
                            <input type="number" id="input-stock-${p.id}" class="form-control" style="width:70px; padding:4px;" placeholder="Qty" min="1">
                            <button style="padding:5px 10px; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;" onclick="restockItem(${p.id})">Pasok 📦</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
}

function submitExpenseByOwner() {
    const nameIn = document.getElementById('expense-name').value.trim();
    const amountIn = parseInt(document.getElementById('expense-amount').value);

    if(!nameIn || isNaN(amountIn) || amountIn <= 0) {
        alert('⚠️ Mohon isi deskripsi keperluan belanja dan nominal rupiah secara benar!');
        return;
    }

    const nextId = state.expenses.length > 0 ? Math.max(...state.expenses.map(e => e.id)) + 1 : 1;
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    state.expenses.push({
        id: nextId,
        name: nameIn,
        amount: amountIn,
        time: timeStr,
        dateKey: getSimpleDate()
    });

    syncExpensesStorage();
    updateDailyRecapData();

    document.getElementById('expense-name').value = '';
    document.getElementById('expense-amount').value = '';
    
    renderExpensesListTable();
    alert('✔ Pengeluaran operasional berhasil disimpan!');
}

function renderExpensesListTable() {
    const tbody = document.getElementById('table-expense-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    const currentTodayTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const currentTodayDate = getSimpleDate();

    if(state.expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td style="color:#8e8076; font-size: 0.85rem;">${currentTodayDate} - ${currentTodayTime}</td>
                <td style="color:#9e9e9e; font-style:italic;">Belum ada pengeluaran operasional tercatat hari ini.</td>
                <td style="color:#9e9e9e; font-weight:600;">Rp 0</td>
                <td>-</td>
            </tr>
        `;
        return;
    }

    [...state.expenses].reverse().forEach(e => {
        tbody.innerHTML += `
            <tr>
                <td>${e.dateKey} - ${e.time}</td>
                <td><strong>${e.name}</strong></td>
                <td style="color:var(--accent); font-weight:600;">- Rp ${e.amount.toLocaleString('id-ID')}</td>
                <td>
                    <button style="padding:3px 8px; background:var(--accent); color:white; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem;" onclick="deleteExpenseById(${e.id})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

function deleteExpenseById(id) {
    if(confirm('Hapus catatan pengeluaran operasional ini?')) {
        state.expenses = state.expenses.filter(e => e.id !== id);
        syncExpensesStorage();
        updateDailyRecapData();
        renderExpensesListTable();
    }
}

function addNewMenuByOwner() {
    const nameIn = document.getElementById('new-menu-name').value.trim();
    const catIn = document.getElementById('new-menu-category').value;
    const priceIn = parseInt(document.getElementById('new-menu-price').value);
    const stockIn = parseInt(document.getElementById('new-menu-stock').value);

    if(!nameIn || isNaN(priceIn) || isNaN(stockIn) || priceIn <= 0 || stockIn < 0) { 
        alert('⚠️ Mohon isi seluruh formulir dengan benar!'); 
        return; 
    }
    const nextId = state.products.length > 0 ? Math.max(...state.products.map(p => p.id)) + 1 : 1;

    state.products.push({ id: nextId, name: nameIn, price: priceIn, stock: stockIn, category: catIn });
    syncProductsStorage();
    
    document.getElementById('new-menu-name').value = '';
    document.getElementById('new-menu-price').value = '';
    document.getElementById('new-menu-stock').value = '';
    switchTab('owner-stock');
    alert(`✔ Menu "${nameIn}" berhasil ditambahkan!`);
}

function restockItem(productId) {
    const inputVal = parseInt(document.getElementById(`input-stock-${productId}`).value);
    if(isNaN(inputVal) || inputVal <= 0) { alert('⚠️ Masukkan jumlah pasokan stok secara valid!'); return; }
    
    const product = state.products.find(p => p.id === productId);
    if(product) {
        product.stock += inputVal;
        syncProductsStorage();
        document.getElementById(`input-stock-${productId}`).value = '';
        renderOwnerDashboard('owner-stock');
        alert(`✔ Berhasil menambah stok untuk ${product.name}!`);
    }
}