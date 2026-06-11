/* ==========================================================================
   LOGIKA UTAMA PEMESANAN (Cafe CP 55 - Dinamis & Sinkron)
   ========================================================================== */

// 1. Database Dummy (Urutan Atas Otomatis Best Seller)
const DATA_MENU = [
    { id: 1, nama: "Kopi Susu Instan", kategori: "minuman", harga: 7000, isBestSeller: true },
    { id: 2, nama: "Es Teh Manis Jumbo", kategori: "minuman", harga: 4000, isBestSeller: true },
    { id: 3, nama: "Indomie Goreng Aceh", kategori: "makanan", harga: 10000, isBestSeller: true },
    { id: 4, nama: "Tempe Mendoan (Porsi)", kategori: "cemilan", harga: 8000, isBestSeller: true },
    { id: 5, nama: "Kopi Hitam Murni", kategori: "minuman", harga: 5000, isBestSeller: false },
    { id: 6, nama: "Nasi Goreng Warkop", kategori: "makanan", harga: 12000, isBestSeller: false },
    { id: 7, nama: "Gorengan Anget (Isi 3)", kategori: "cemilan", harga: 5000, isBestSeller: false }
];

let keranjang = [];
let metodeBayarAktif = "";

// 2. Fungsi Mengisi Menu Secara Otomatis Saat Web Dibuka
function renderMenuKatalog() {
    const containerMakanan = document.getElementById('makanan-container');
    const containerMinuman = document.getElementById('minuman-container');
    const containerCemilan = document.getElementById('cemilan-container');

    if(containerMakanan) containerMakanan.innerHTML = '';
    if(containerMinuman) containerMinuman.innerHTML = '';
    if(containerCemilan) containerCemilan.innerHTML = '';

    // Sortir: Yang 'isBestSeller: true' nangkring paling atas kategori
    const menuTersortir = [...DATA_MENU].sort((a, b) => b.isBestSeller - a.isBestSeller);

    menuTersortir.forEach(item => {
        const itemHTML = `
            <div class="menu-item">
                <div class="menu-info">
                    <div class="menu-title-wrapper">
                        <span class="menu-name">${item.nama}</span>
                        ${item.isBestSeller ? '<span class="badge-best-seller">Best Seller</span>' : ''}
                    </div>
                    <span class="menu-price">Rp ${item.harga.toLocaleString('id-ID')}</span>
                </div>
                <button class="btn btn-brand" onclick="tambahKeKeranjang(${item.id})">+ Tambah</button>
            </div>
        `;

        if (item.kategori === 'makanan' && containerMakanan) containerMakanan.innerHTML += itemHTML;
        if (item.kategori === 'minuman' && containerMinuman) containerMinuman.innerHTML += itemHTML;
        if (item.kategori === 'cemilan' && containerCemilan) containerCemilan.innerHTML += itemHTML;
    });

    // Set tombol filter 'Semua Menu' aktif pertama kali
    setActiveButtonFilter('all');
}

// 3. Fungsi Filter Kategori Aktif Atas
window.filterKategori = function(kategori) {
    const secMakanan = document.getElementById('sec-makanan');
    const secMinuman = document.getElementById('sec-minuman');
    const secCemilan = document.getElementById('sec-cemilan');

    if (kategori === 'all') {
        secMakanan.style.display = 'block';
        secMinuman.style.display = 'block';
        secCemilan.style.display = 'block';
    } else {
        secMakanan.style.display = (kategori === 'makanan') ? 'block' : 'none';
        secMinuman.style.display = (kategori === 'minuman') ? 'block' : 'none';
        secCemilan.style.display = (kategori === 'cemilan') ? 'block' : 'none';
    }
    setActiveButtonFilter(kategori);
};

function setActiveButtonFilter(kategori) {
    const tombol = {
        all: document.getElementById('btn-cat-all'),
        makanan: document.getElementById('btn-cat-makanan'),
        minuman: document.getElementById('btn-cat-minuman'),
        cemilan: document.getElementById('btn-cat-cemilan')
    };

    for (let key in tombol) {
        if (tombol[key]) {
            tombol[key].style.backgroundColor = 'var(--bg-surface)';
            tombol[key].style.color = 'var(--text-primary)';
        }
    }

    if (tombol[kategori]) {
        tombol[kategori].style.backgroundColor = 'var(--color-brand)';
        tombol[kategori].style.color = '#000000';
    }
}

// 4. Manajemen Keranjang Belanja Belakang Layar
window.tambahKeKeranjang = function(idMenu) {
    const produk = DATA_MENU.find(item => item.id === idMenu);
    const itemDiKeranjang = keranjang.find(item => item.id === idMenu);

    if (itemDiKeranjang) {
        itemDiKeranjang.qty += 1;
    } else {
        keranjang.push({ ...produk, qty: 1 });
    }
    updateLiveCartPanel();
};

function updateLiveCartPanel() {
    const containerLiveCart = document.getElementById('live-cart-items');
    const txtTotalHarga = document.getElementById('cart-total-price');
    
    if (keranjang.length === 0) {
        containerLiveCart.innerHTML = '<p class="empty-text">Belum ada menu yang dipilih.</p>';
        txtTotalHarga.innerText = 'Rp 0';
        return;
    }

    containerLiveCart.innerHTML = '';
    let total = 0;

    keranjang.forEach(item => {
        total += (item.harga * item.qty);
        containerLiveCart.innerHTML += `
            <div class="cart-live-item">
                <div>
                    <span style="font-weight:600;">${item.nama}</span>
                    <br><span style="font-size:0.85rem; color:var(--text-secondary);">${item.qty} x Rp ${item.harga.toLocaleString('id-ID')}</span>
                </div>
                <span style="font-weight:600; color:var(--color-brand);">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
            </div>
        `;
    });

    txtTotalHarga.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// 5. Fungsi Mengaktifkan Tombol Metode Pembayaran & Munculkan Box QRIS
window.pilihMetodeBayar = function(metode) {
    metodeBayarAktif = metode;
    const btnCash = document.getElementById('btn-pay-cash');
    const btnQris = document.getElementById('btn-pay-qris');
    const qrisBox = document.getElementById('qris-box-area');

    if (metode === 'CASH') {
        btnCash.style.backgroundColor = 'var(--color-success)';
        btnCash.style.color = '#000000';
        btnQris.style.backgroundColor = '#333';
        btnQris.style.color = '#ffffff';
        qrisBox.style.display = 'none';
    } else if (metode === 'QRIS') {
        btnQris.style.backgroundColor = 'var(--color-brand)';
        btnQris.style.color = '#000000';
        btnCash.style.backgroundColor = '#333';
        btnCash.style.color = '#ffffff';
        qrisBox.style.display = 'block';
    }
};

// 6. Validasi & Proses Cetak Nota Digital Pop-up
window.prosesKeNotaDigital = function() {
    const namaPembeli = document.getElementById('buyer-name').value.trim();
    const catatanPesanan = document.getElementById('order-notes').value.trim() || "-";

    if (keranjang.length === 0) {
        alert("Pilih menu warkop dulu baru bayar, jal!");
        return;
    }
    if (!namaPembeli) {
        alert("Isi dulu nama pembeli atas namanya!");
        return;
    }
    if (!metodeBayarAktif) {
        alert("Silahkan pilih metode bayar Cash atau QRIS!");
        return;
    }

    const totalHarga = keranjang.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    const waktuSekarang = new Date().toLocaleString('id-ID');
    const noNota = "CP55-" + Math.floor(1000 + Math.random() * 9000);

    let itemStrukHTML = '';
    keranjang.forEach(item => {
        itemStrukHTML += `
            <div class="receipt-item-block">
                <div class="receipt-item-title">${item.nama}</div>
                <div class="receipt-item-detail">
                    <span>${item.qty} x Rp ${item.harga.toLocaleString('id-ID')}</span>
                    <span>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
                </div>
            </div>
        `;
    });

    const strukLengkapHTML = `
        <div class="receipt-header">
            <h4>CAFE CP 55</h4>
            <p>Kawasan UISI, Gresik</p>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-meta-row"><span>No. Nota:</span><span>${noNota}</span></div>
        <div class="receipt-meta-row"><span>Waktu   :</span><span>${waktuSekarang}</span></div>
        <div class="receipt-meta-row"><span>Pemesan :</span><strong>${namaPembeli}</strong></div>
        <div class="receipt-meta-row"><span>Catatan :</span><span>${catatanPesanan}</span></div>
        <div class="receipt-meta-row"><span>Metode  :</span><span><strong>${metodeBayarAktif}</strong></span></div>
        <div class="receipt-divider"></div>
        ${itemStrukHTML}
        <div class="receipt-divider"></div>
        <div class="receipt-total-row"><span>TOTAL LUNAS</span><span>Rp ${totalHarga.toLocaleString('id-ID')}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-header" style="margin-top:10px; margin-bottom:0;">
            <p style="font-weight:bold; color:#16a085;">SUKSES (TERCATAT DI DAPUR)</p>
        </div>
    `;

    document.getElementById('print-area-nota').innerHTML = strukLengkapHTML;
    document.getElementById('modal-nota').style.display = 'flex';
};

// 7. Reset Form Setelah Selesai Transaksi Transaksi
window.selesaiTransaksi = function() {
    keranjang = [];
    metodeBayarAktif = "";
    document.getElementById('buyer-name').value = '';
    document.getElementById('order-notes').value = '';
    document.getElementById('qris-box-area').style.display = 'none';
    
    document.getElementById('btn-pay-cash').style.backgroundColor = '#333';
    document.getElementById('btn-pay-cash').style.color = '#ffffff';
    document.getElementById('btn-pay-qris').style.backgroundColor = '#333';
    document.getElementById('btn-pay-qris').style.color = '#ffffff';

    document.getElementById('modal-nota').style.display = 'none';
    filterKategori('all');
    updateLiveCartPanel();
};

// Jalankan saat file html kelar load
document.addEventListener('DOMContentLoaded', () => {
    renderMenuKatalog();
});