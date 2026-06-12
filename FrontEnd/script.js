// --- DATA INITIAL SEED (15 VARIASI MENU BARU CAFE CP 55) ---
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Kopi Hitam (Murni)", price: 5000, stock: 100, isBest: false, category: "Minuman" },
    { id: 2, name: "Kopi Susu Instan", price: 7000, stock: 80, isBest: true, category: "Minuman" },
    { id: 3, name: "Es Teh Manis Jumbo", price: 4000, stock: 150, isBest: true, category: "Minuman" },
    { id: 4, name: "Nutrisari Es (Susu/Jeruk)", price: 5000, stock: 60, isBest: false, category: "Minuman" },
    { id: 5, name: "Susu Jahe Hangat (STMJ)", price: 8000, stock: 40, isBest: false, category: "Minuman" },
    { id: 6, name: "Gorengan Anget (Goreng Sendiri)", price: 2000, stock: 200, isBest: true, category: "Snack" },
    { id: 7, name: "Tempe Mendoan Porsi (Isi 4)", price: 8000, stock: 30, isBest: true, category: "Snack" },
    { id: 8, name: "Kentang Goreng Curah", price: 10000, stock: 40, isBest: false, category: "Snack" },
    { id: 9, name: "Cireng Goreng Bumbu Rujak", price: 10000, stock: 35, isBest: false, category: "Snack" },
    { id: 10, name: "Roti Bakar Indomilk", price: 12000, stock: 25, isBest: false, category: "Snack" },
    { id: 11, name: "Indomie Goreng Tante (Tanpa Telur)", price: 8000, stock: 100, isBest: false, category: "Makanan" },
    { id: 12, name: "Indomie Rebus Telur Intermesem", price: 12000, stock: 80, isBest: true, category: "Makanan" },
    { id: 13, name: "Nasi Kucing / Nasi Bungkus", price: 6000, stock: 50, isBest: true, category: "Makanan" },
    { id: 14, name: "Nasi Goreng Mawut Warkop", price: 15000, stock: 30, isBest: false, category: "Makanan" },
    { id: 15, name: "Magelangan (Mie + Nasi)", price: 16000, stock: 30, isBest: true, category: "Makanan" }
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

    // Jalankan pengecekan ulang jika ukuran jendela browser diubah
    window.addEventListener('resize', handleMobileNoticeDisplay);
}

function loadDataFromStorage() {
    state.products = JSON.parse(localStorage.getItem('cp55_products'));
    state.orders = JSON.parse(localStorage.getItem('cp55_orders'));
    state.expenses = JSON.parse(localStorage.getItem('cp55_expenses'));
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
        if(o.dateKey === todaySimple || (!o.dateKey && o.time)) {
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

// --- LOGIC: MOBILE MODE RESTRICTIONS ---
function handleMobileNoticeDisplay() {
    const notice = document.getElementById('mobile-notice');
    if(!notice) return;
    if(window.innerWidth <= 600) {
        notice.style.display = 'block';
    } else {
        notice.style.display = 'none';
    }
}

// --- SESSION CONTROLLER ---
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
        // Aturan Proteksi Mobile Mode (Owner Only)
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
    
    // Reset input form
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

    if(tabName === 'pembeli') renderPOSCatalog();
    if(tabName === 'status') renderKitchenDashboard();
    if(tabName === 'history') renderHistoryList();
    if(tabName.startsWith('owner-')) renderOwnerDashboard(tabName);
}

// --- PEMBELI / CATALOG ENGINE (MODERN GRID CARDS) ---
function filterCategory(category, element) {
    state.selectedCategory = category;
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderPOSCatalog();
}

function renderPOSCatalog() {
    const container = document.getElementById('pos-menu-render');
    if(!container) return;
    container.innerHTML = '';
    const filtered = state.products.filter(p => state.selectedCategory === 'Semua' || p.category === state.selectedCategory);

    if(filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 30px; color:#999;">Menu tidak ditemukan.</p>`;
        return;
    }

    filtered.forEach(p => {
        const isLowStock = p.stock <= 5 && p.stock > 0;
        const isOut = p.stock === 0;
        const bestBadge = p.isBest ? `<span class="badge-best">⭐ BEST</span>` : '';
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
        if(cartItem) { cartItem.qty += 1; } else { state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 }); }
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
    document.getElementById('cart-grand-total').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

function togglePaymentLayout() {
    const method = document.getElementById('cart-payment-method').value;
    document.getElementById('qris-payment-box').style.display = (method === 'qris') ? 'block' : 'none';
}

function checkoutOrder() {
    const customerName = document.getElementById('cart-customer-name').value.trim();
    if(!customerName) { alert('⚠️ Silakan isi nama pembeli terlebih dahulu.'); return; }
    if(state.cart.length === 0) { alert('⚠️ Keranjang belanja anda masih kosong!'); return; }

    const paymentMethod = document.getElementById('cart-payment-method').value;
    const notes = document.getElementById('cart-cashier-notes').value.trim();
    
    let totalPayment = 0;
    state.cart.forEach(i => totalPayment += (i.price * i.qty));

    const orderId = 'CP-' + Math.floor(1000 + Math.random() * 9000);
    const nowTime = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
    const nowDateKey = getSimpleDate();

    const newOrder = { 
        id: orderId, 
        time: nowTime, 
        dateKey: nowDateKey,
        customer: customerName, 
        items: [...state.cart], 
        total: totalPayment, 
        method: paymentMethod.toUpperCase(), 
        status: 'Antri',
        notes: notes || '-' 
    };

    state.orders.push(newOrder);
    syncOrdersStorage();
    syncProductsStorage();
    updateDailyRecapData();

    state.cart = [];
    document.getElementById('cart-customer-name').value = '';
    document.getElementById('cart-cashier-notes').value = '';
    document.getElementById('cart-payment-method').value = 'cash';
    document.getElementById('qris-payment-box').style.display = 'none';
    
    renderCart();
    renderPOSCatalog();
    openReceiptModal(newOrder);
}

// --- NOTA KASIR / PEMBELI ---
function openReceiptModal(order) {
    const area = document.getElementById('receipt-print-area');
    let itemRowsHtml = '';
    order.items.forEach(i => {
        itemRowsHtml += `
            <div class="receipt-item-block">
                <div class="receipt-item-title">${i.name}</div>
                <div class="receipt-item-detail">
                    <span>${i.qty} x Rp ${i.price.toLocaleString('id-ID')}</span>
                    <span>Rp ${(i.qty * i.price).toLocaleString('id-ID')}</span>
                </div>
            </div>
        `;
    });

    area.innerHTML = `
        <div class="receipt-header">
            <h4>CAFE CP 55</h4>
            <p>Jl. Raya Universitas Internasional Semen Indonesia</p>
            <p>Gresik, Jawa Timur</p>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-meta-row"><span>ID Struk: ${order.id}</span><span>Jam: ${order.time}</span></div>
        <div class="receipt-meta-row"><span>Pelanggan: ${order.customer}</span><span>Kasir: Sistem Digital</span></div>
        <div class="receipt-divider"></div>
        ${itemRowsHtml}
        <div class="receipt-divider"></div>
        <div class="receipt-meta-row" style="flex-direction:column; align-items:flex-start; margin-bottom:8px;">
            <span style="font-size:0.8rem; text-transform:uppercase; color:#555;">Catatan Kasir:</span>
            <span style="font-style:italic; font-weight:600; padding-left:5px;">"${order.notes || '-'}"</span>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-total-block">
            <div class="receipt-total-row"><span>Total Akhir:</span><strong>Rp ${order.total.toLocaleString('id-ID')}</strong></div>
            <div class="receipt-total-row"><span>Metode:</span><span>${order.method}</span></div>
            <div class="receipt-total-row"><span>Status:</span><span style="font-weight: bold; color: #16a085;">LUNAS</span></div>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-footer"><p>Terima Kasih Atas Kunjungan Anda</p><p>-- Pelayanan Sat-Set Khas CP 55 --</p></div>
    `;
    document.getElementById('modal-receipt').style.display = 'flex';
}

function showSavedReceipt(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if(order) openReceiptModal(order);
}

function closeReceiptModal() { document.getElementById('modal-receipt').style.display = 'none'; }

// --- KASIR ENGINE ---
function renderKitchenDashboard() {
    const tbody = document.getElementById('table-kitchen-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    if(state.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada antrean pesanan masuk.</td></tr>`;
        return;
    }
    [...state.orders].reverse().forEach(order => {
        let itemsString = order.items.map(i => `${i.name} (x${i.qty})`).join(', ');
        if(order.notes && order.notes !== '-') {
            itemsString += ` <br><small style="color:var(--accent); font-weight:bold;">📝 NB: ${order.notes}</small>`;
        }
        let badgeClass = order.status === 'Dimasak' ? 'status-process' : (order.status === 'Selesai Saji' ? 'status-complete' : 'status-pending');
        let actionBtn = order.status === 'Antri' ? `<button class="btn-action" style="background:#0984e3; color:white;" onclick="changeOrderStatus('${order.id}', 'Dimasak')">Masak</button>` : (order.status === 'Dimasak' ? `<button class="btn-action" style="background:#222f3e; color:white;" onclick="changeOrderStatus('${order.id}', 'Selesai Saji')">Sajikan</button>` : `<span style="font-size:0.85rem; color:#27ae60;">✔ Selesai</span>`);

        tbody.innerHTML += `<tr><td><strong>${order.id}</strong></td><td>${order.customer}</td><td>${itemsString}</td><td><span class="role-badge" style="background:#7f8c8d;">${order.method}</span></td><td><span class="status-badge ${badgeClass}">${order.status}</span></td><td>${actionBtn}</td></tr>`;
    });
}

function changeOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if(order) { order.status = newStatus; syncOrdersStorage(); renderKitchenDashboard(); }
}

function renderHistoryList() {
    const tbody = document.getElementById('table-history-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    if(state.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada riwayat nota.</td></tr>`;
        return;
    }
    [...state.orders].reverse().forEach(o => {
        tbody.innerHTML += `<tr><td>${o.time}</td><td><strong>${o.id}</strong></td><td>${o.customer}</td><td>Rp ${o.total.toLocaleString('id-ID')}</td><td>${o.method}</td><td><button class="btn-action" style="background:#16a085; color:white;" onclick="showSavedReceipt('${o.id}')">Lihat Nota</button></td></tr>`;
    });
}

// --- OWNER ENGINE ---
function renderOwnerDashboard(activeSubTab) {
    updateDailyRecapData();

    let totalGrossRevenue = 0; 
    state.orders.forEach(o => totalGrossRevenue += o.total);

    let totalExpenses = 0; 
    state.expenses.forEach(e => totalExpenses += e.amount);

    let netProfit = totalGrossRevenue - totalExpenses;

    const revDisp = document.getElementById('owner-revenue-display');
    const expDisp = document.getElementById('owner-expenses-display');
    const profDisp = document.getElementById('owner-net-profit-display');

    if(revDisp) revDisp.innerText = `Rp ${totalGrossRevenue.toLocaleString('id-ID')}`;
    if(expDisp) expDisp.innerText = `Rp ${totalExpenses.toLocaleString('id-ID')}`;
    if(profDisp) profDisp.innerText = `Rp ${netProfit.toLocaleString('id-ID')}`;

    if (activeSubTab === 'owner-summary') {
        const chartZone = document.getElementById('daily-charts-render-zone');
        if(chartZone) {
            chartZone.innerHTML = '';
            if(state.dailyRecaps.length === 0) {
                chartZone.innerHTML = `<p style="text-align:center; padding: 20px; color:#999;">Belum ada tren data perhari terkumpul.</p>`;
            } else {
                [...state.dailyRecaps].reverse().forEach(day => {
                    const localMax = Math.max(day.revenue, day.expenses, 1);
                    const revPct = (day.revenue / localMax) * 100;
                    const expPct = (day.expenses / localMax) * 100;

                    chartZone.innerHTML += `
                        <div class="daily-chart-row">
                            <div class="daily-chart-date">📅 ${day.date}</div>
                            
                            <div class="daily-bar-wrapper">
                                <span class="daily-bar-label" style="color:#2ecc71;">Pemasukan</span>
                                <div class="daily-bar-track">
                                    <div class="daily-bar-fill" style="background:#2ecc71; width:${revPct}%;"></div>
                                </div>
                                <span class="daily-bar-val">Rp ${day.revenue.toLocaleString('id-ID')}</span>
                            </div>

                            <div class="daily-bar-wrapper">
                                <span class="daily-bar-label" style="color:#e74c3c;">Pengeluaran</span>
                                <div class="daily-bar-track">
                                    <div class="daily-bar-fill" style="background:#e74c3c; width:${expPct}%;"></div>
                                </div>
                                <span class="daily-bar-val">Rp ${day.expenses.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    `;
                });
            }
        }
    }

    if (activeSubTab === 'owner-expense') {
        const tbodyExpense = document.getElementById('table-expense-body');
        if (tbodyExpense) {
            tbodyExpense.innerHTML = '';
            if (state.expenses.length === 0) {
                tbodyExpense.innerHTML = `<tr><td colspan="4" style="text-align:center;">Belum ada catatan pengeluaran barang.</td></tr>`;
            } else {
                [...state.expenses].reverse().forEach(e => {
                    tbodyExpense.innerHTML += `
                        <tr>
                            <td>${e.datetime || '-'}</td>
                            <td><strong>${e.description}</strong></td>
                            <td style="color:#e74c3c; font-weight:bold;">Rp ${e.amount.toLocaleString('id-ID')}</td>
                            <td>
                                <button class="btn-action" style="background:#e74c3c; color:white; padding:3px 8px; font-size:0.8rem;" onclick="deleteExpense('${e.id}')">Hapus</button>
                            </td>
                        </tr>
                    `;
                });
            }
        }
    }

    if (activeSubTab === 'owner-recap') {
        const tbodyRecap = document.getElementById('table-recap-body');
        if(tbodyRecap) {
            tbodyRecap.innerHTML = '';
            if(state.dailyRecaps.length === 0) {
                tbodyRecap.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada rekapan harian.</td></tr>`;
            } else {
                [...state.dailyRecaps].reverse().forEach(r => {
                    tbodyRecap.innerHTML += `<tr><td><strong>${r.date}</strong></td><td style="color:#2ecc71; font-weight:600;">Rp ${r.revenue.toLocaleString('id-ID')}</td><td style="color:#e74c3c; font-weight:600;">Rp ${r.expenses.toLocaleString('id-ID')}</td><td style="color:${r.profit >= 0 ? '#16a085' : '#c0392b'}; font-weight:bold;">Rp ${r.profit.toLocaleString('id-ID')}</td><td><span class="status-badge" style="background:#e1f5fe; color:#0288d1; font-size:0.75rem;">Aktif Ter-arsip</span></td></tr>`;
                });
            }
        }
    }

    if (activeSubTab === 'owner-stock') {
        const tbodyStock = document.getElementById('table-stock-body');
        if(tbodyStock) {
            tbodyStock.innerHTML = '';
            state.products.forEach(p => {
                tbodyStock.innerHTML += `<tr><td><strong>${p.name}</strong> ${p.isBest ? '⭐' : ''}</td><td>${p.category}</td><td>Rp ${p.price.toLocaleString('id-ID')}</td><td style="font-weight:bold; color:${p.stock <= 5 ? '#e67e22' : '#2c3e50'}">${p.stock} pcs</td><td><input type="number" id="input-stock-${p.id}" style="width:60px; padding:4px;" min="1" value="10"><button class="btn-action" style="background:#27ae60; color:white; margin-left:5px;" onclick="restockItem(${p.id})">Tambah</button></td></tr>`;
            });
        }
    }
}

function addExpenseByOwner() {
    const descIn = document.getElementById('expense-desc').value.trim();
    const amountIn = parseInt(document.getElementById('expense-amount').value);
    if(!descIn || isNaN(amountIn) || amountIn <= 0) { alert('⚠️ Mohon lengkapi nama barang dan harga dengan benar!'); return; }

    const now = new Date();
    const formattedDateTime = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateKey = getSimpleDate();

    state.expenses.push({ 
        id: 'EXP-' + Date.now(), 
        description: descIn, 
        amount: amountIn,
        datetime: formattedDateTime,
        dateKey: dateKey
    });
    
    syncExpensesStorage();
    
    document.getElementById('expense-desc').value = '';
    document.getElementById('expense-amount').value = '';
    
    renderOwnerDashboard('owner-expense');
    alert(`✔ Sukses mencatat pengeluaran: "${descIn}"`);
}

function deleteExpense(expenseId) {
    if(confirm("Apakah Anda yakin ingin menghapus catatan barang pengeluaran ini?")) {
        state.expenses = state.expenses.filter(e => e.id !== expenseId);
        syncExpensesStorage();
        renderOwnerDashboard('owner-expense');
    }
}

function addNewMenuByOwner() {
    const nameIn = document.getElementById('new-menu-name').value.trim();
    const catIn = document.getElementById('new-menu-category').value;
    const priceIn = parseInt(document.getElementById('new-menu-price').value);
    const stockIn = parseInt(document.getElementById('new-menu-stock').value);

    if(!nameIn || isNaN(priceIn) || isNaN(stockIn) || priceIn <= 0 || stockIn < 0) { alert('⚠️ Mohon isi seluruh formulir dengan benar!'); return; }
    const nextId = state.products.length > 0 ? Math.max(...state.products.map(p => p.id)) + 1 : 1;

    state.products.push({ id: nextId, name: nameIn, price: priceIn, stock: stockIn, isBest: false, category: catIn });
    syncProductsStorage();
    
    document.getElementById('new-menu-name').value = '';
    document.getElementById('new-menu-price').value = '';
    document.getElementById('new-menu-stock').value = '';
    renderOwnerDashboard('owner-addmenu');
    alert(`✔ Menu "${nameIn}" berhasil ditambahkan!`);
}

function restockItem(productId) {
    const inputVal = parseInt(document.getElementById(`input-stock-${productId}`).value);
    if(isNaN(inputVal) || inputVal <= 0) { alert('⚠️ Masukkan jumlah suplai valid.'); return; }
    const product = state.products.find(p => p.id === productId);
    if(product) { product.stock += inputVal; syncProductsStorage(); renderOwnerDashboard('owner-stock'); alert(`✔ Stok ${product.name} berhasil ditambah!`); }
}