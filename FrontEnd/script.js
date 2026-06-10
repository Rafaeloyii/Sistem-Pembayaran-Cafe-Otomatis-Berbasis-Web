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

// --- RUN SYSTEM WITH CYCLIC CHECKER ---
window.onload = function() {
    // Jalankan pengecekan jika lokal storage kosong, maka isi dengan 15 data di atas
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

// --- KONTROL SIKLUS BULANAN ---
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
    let todayRevenue = 0;
    state.orders.forEach(o => todayRevenue += o.total);

    let todayExpenses = 0;
    state.expenses.forEach(e => todayExpenses += e.amount);

    let netProfit = todayRevenue - todayExpenses;
    const existingDayIndex = state.dailyRecaps.findIndex(r => r.date === todayStr);

    const dataDay = { date: todayStr, revenue: todayRevenue, expenses: todayExpenses, profit: netProfit };

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

// --- CONTROLLER TAMPILAN SIDEBAR & LOGIN ---
function checkSession() {
    const savedUser = sessionStorage.getItem('cp55_session');
    if(savedUser) {
        state.currentUser = savedUser;
        showMainLayout();
    } else {
        showLoginLayout();
    }
}

function login() {
    const userIn = document.getElementById('username').value.trim();
    const passIn = document.getElementById('password').value.trim();

    if(userIn === 'owner55' && passIn === 'owner123') {
        state.currentUser = 'Owner';
    } else if(userIn === 'kasir55' && passIn === 'kasir123') {
        state.currentUser = 'Kasir';
    } else {
        alert('⚠️ Username atau Password salah!');
        return;
    }

    sessionStorage.setItem('cp55_session', state.currentUser);
    showMainLayout();
}

function logout() {
    sessionStorage.removeItem('cp55_session');
    state.currentUser = null;
    showLoginLayout();
}

function showLoginLayout() {
    document.getElementById('page-login').style.display = 'block';
    document.getElementById('app-sidebar').style.display = 'none';
    document.querySelector('.main-content').style.marginLeft = '0';
    switchTab('login');
}

function showMainLayout() {
    document.getElementById('page-login').style.display = 'none';
    document.getElementById('app-sidebar').style.display = 'flex';
    document.querySelector('.main-content').style.marginLeft = 'var(--sidebar-width)';
    document.getElementById('current-role').innerText = state.currentUser;

    const ownerTab = document.getElementById('tab-owner');
    if(state.currentUser === 'Owner') {
        ownerTab.style.display = 'block';
    } else {
        ownerTab.style.display = 'none';
    }
    switchTab('pos');
}

// --- SIDEBAR TAB LINK CONTROLLER ---
function switchTab(tabName) {
    const pages = ['login', 'pos', 'status', 'history', 'owner'];
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

    if(tabName === 'pos') renderPOSCatalog();
    if(tabName === 'status') renderKitchenDashboard();
    if(tabName === 'history') renderHistoryList();
    if(tabName === 'owner') renderOwnerDashboard();
}

// --- POS ENGINE ---
function filterCategory(category, element) {
    state.selectedCategory = category;
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderPOSCatalog();
}

function renderPOSCatalog() {
    const container = document.getElementById('pos-menu-render');
    container.innerHTML = '';
    const filtered = state.products.filter(p => state.selectedCategory === 'Semua' || p.category === state.selectedCategory);

    filtered.forEach(p => {
        const isLowStock = p.stock <= 5;
        const bestBadge = p.isBest ? `<span class="badge-best">⭐ BEST</span>` : '';
        const stockBadge = isLowStock ? `<span class="badge-low">⚠️ Stok Menipis</span>` : '';
        
        container.innerHTML += `
            <div class="menu-item">
                <div class="menu-info">
                    <div class="menu-title">${p.name} ${bestBadge} ${stockBadge}</div>
                    <div class="menu-meta">Kategori: ${p.category} | Harga: Rp ${p.price.toLocaleString('id-ID')}</div>
                    <div class="menu-meta" style="font-weight: bold; color: ${p.stock === 0 ? 'red' : '#2c3e50'}">Stok Sedia: ${p.stock}</div>
                </div>
                <div>
                    <button class="btn-plus" onclick="addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>+</button>
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
        list.innerHTML = `<p style="color:#999; text-align:center; padding-top:20px;">Keranjang kosong.</p>`;
        document.getElementById('cart-grand-total').innerText = 'Rp 0';
        return;
    }

    state.cart.forEach(item => {
        const total = item.price * item.qty;
        grandTotal += total;
        list.innerHTML += `<div class="cart-item"><span>${item.name} (x${item.qty})</span><span>Rp ${total.toLocaleString('id-ID')}</span></div>`;
    });
    document.getElementById('cart-grand-total').innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

function togglePaymentLayout() {
    const method = document.getElementById('cart-payment-method').value;
    document.getElementById('qris-payment-box').style.display = (method === 'qris') ? 'block' : 'none';
}

function checkoutOrder() {
    const customerName = document.getElementById('cart-customer-name').value.trim();
    if(!customerName) { alert('⚠️ Silahkan isi nama pembeli terlebih dahulu.'); return; }
    if(state.cart.length === 0) { alert('⚠️ Keranjang belanja anda masih kosong!'); return; }

    const paymentMethod = document.getElementById('cart-payment-method').value;
    let totalPayment = 0;
    state.cart.forEach(i => totalPayment += (i.price * i.qty));

    const orderId = 'CP-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});

    const newOrder = { id: orderId, time: now, customer: customerName, items: [...state.cart], total: totalPayment, method: paymentMethod.toUpperCase(), status: 'Antri' };

    state.orders.push(newOrder);
    syncOrdersStorage();
    syncProductsStorage();
    updateDailyRecapData();

    state.cart = [];
    document.getElementById('cart-customer-name').value = '';
    document.getElementById('cart-payment-method').value = 'cash';
    document.getElementById('qris-payment-box').style.display = 'none';
    
    renderCart();
    renderPOSCatalog();
    openReceiptModal(newOrder);
}

// --- NOTA DIGITAL WINDOW ---
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
        <div class="receipt-meta-row"><span>Pelanggan: ${order.customer}</span><span>Kasir: Active</span></div>
        <div class="receipt-divider"></div>
        ${itemRowsHtml}
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

// --- OPERATIONS & DASHBOARD ---
function renderKitchenDashboard() {
    const tbody = document.getElementById('table-kitchen-body');
    tbody.innerHTML = '';
    if(state.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada antrean pesanan masuk.</td></tr>`;
        return;
    }
    [...state.orders].reverse().forEach(order => {
        let itemsString = order.items.map(i => `${i.name} (x${i.qty})`).join(', ');
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
    tbody.innerHTML = '';
    if(state.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada riwayat nota.</td></tr>`;
        return;
    }
    [...state.orders].reverse().forEach(o => {
        tbody.innerHTML += `<tr><td>${o.time}</td><td><strong>${o.id}</strong></td><td>${o.customer}</td><td>Rp ${o.total.toLocaleString('id-ID')}</td><td>${o.method}</td><td><button class="btn-action" style="background:#16a085; color:white;" onclick="showSavedReceipt('${o.id}')">Lihat Nota</button></td></tr>`;
    });
}

function addExpenseByOwner() {
    const descIn = document.getElementById('expense-desc').value.trim();
    const amountIn = parseInt(document.getElementById('expense-amount').value);
    if(!descIn || isNaN(amountIn) || amountIn <= 0) { alert('⚠️ Mohon lengkapi data pengeluaran dengan benar!'); return; }

    state.expenses.push({ id: 'EXP-' + Date.now(), description: descIn, amount: amountIn });
    syncExpensesStorage();
    updateDailyRecapData();

    document.getElementById('expense-desc').value = '';
    document.getElementById('expense-amount').value = '';
    renderOwnerDashboard();
    alert(`✔ Pengeluaran "${descIn}" berhasil dicatat!`);
}

function addNewMenuByOwner() {
    const nameIn = document.getElementById('new-menu-name').value.trim();
    const catIn = document.getElementById('new-menu-category').value;
    const priceIn = parseInt(document.getElementById('new-menu-price').value);
    const stockIn = parseInt(document.getElementById('new-menu-stock').value);

    if(!nameIn || isNaN(priceIn) || isNaN(stockIn) || priceIn <= 0 || stockIn < 0) { alert('⚠️ Mohon isi seluruh formulir valid!'); return; }
    const nextId = state.products.length > 0 ? Math.max(...state.products.map(p => p.id)) + 1 : 1;

    state.products.push({ id: nextId, name: nameIn, price: priceIn, stock: stockIn, isBest: false, category: catIn });
    syncProductsStorage();
    
    document.getElementById('new-menu-name').value = '';
    document.getElementById('new-menu-price').value = '';
    document.getElementById('new-menu-stock').value = '';
    renderOwnerDashboard();
    alert(`✔ Menu "${nameIn}" berhasil ditambahkan!`);
}

function renderOwnerDashboard() {
    updateDailyRecapData();
    let totalGrossRevenue = 0; state.orders.forEach(o => totalGrossRevenue += o.total);
    let totalExpenses = 0; state.expenses.forEach(e => totalExpenses += e.amount);
    let netProfit = totalGrossRevenue - totalExpenses;

    document.getElementById('owner-revenue-display').innerText = `Rp ${totalGrossRevenue.toLocaleString('id-ID')}`;
    document.getElementById('owner-expenses-display').innerText = `Rp ${totalExpenses.toLocaleString('id-ID')}`;
    document.getElementById('owner-net-profit-display').innerText = `Rp ${netProfit.toLocaleString('id-ID')}`;

    const tbodyRecap = document.getElementById('table-recap-body');
    tbodyRecap.innerHTML = '';
    if(state.dailyRecaps.length === 0) {
        tbodyRecap.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada rekapan harian.</td></tr>`;
    } else {
        [...state.dailyRecaps].reverse().forEach(r => {
            tbodyRecap.innerHTML += `<tr><td><strong>${r.date}</strong></td><td style="color:#2ecc71; font-weight:600;">Rp ${r.revenue.toLocaleString('id-ID')}</td><td style="color:#e74c3c; font-weight:600;">Rp ${r.expenses.toLocaleString('id-ID')}</td><td style="color:${r.profit >= 0 ? '#16a085' : '#c0392b'}; font-weight:bold;">Rp ${r.profit.toLocaleString('id-ID')}</td><td><span class="status-badge" style="background:#e1f5fe; color:#0288d1; font-size:0.75rem;">Aktif Ter-arsip</span></td></tr>`;
        });
    }

    const tbodyStock = document.getElementById('table-stock-body');
    tbodyStock.innerHTML = '';
    state.products.forEach(p => {
        tbodyStock.innerHTML += `<tr><td><strong>${p.name}</strong> ${p.isBest ? '⭐' : ''}</td><td>${p.category}</td><td>Rp ${p.price.toLocaleString('id-ID')}</td><td style="font-weight:bold; color:${p.stock <= 5 ? '#e67e22' : '#2c3e50'}">${p.stock} pcs</td><td><input type="number" id="input-stock-${p.id}" style="width:60px; padding:4px;" min="1" value="10"><button class="btn-action" style="background:#27ae60; color:white; margin-left:5px;" onclick="restockItem(${p.id})">Tambah</button></td></tr>`;
    });
}

function restockItem(productId) {
    const inputVal = parseInt(document.getElementById(`input-stock-${productId}`).value);
    if(isNaN(inputVal) || inputVal <= 0) { alert('⚠️ Masukkan jumlah suplai valid.'); return; }
    const product = state.products.find(p => p.id === productId);
    if(product) { product.stock += inputVal; syncProductsStorage(); renderOwnerDashboard(); alert(`✔ Stok ${product.name} berhasil ditambah!`); }
}