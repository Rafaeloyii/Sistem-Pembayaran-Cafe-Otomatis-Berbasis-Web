from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error

app = FastAPI(title="API Warkop Digital - UAS AKPL")

# Kunci Pengaman (CORS) agar Frontend HTML bisa mengakses Backend Python ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfigurasi Koneksi ke MariaDB Linux Mint kamu
db_config = {
    'host': 'localhost',
    'user': 'root',       
    'password': '',       # Kosongkan jika user root kamu tidak pakai password
    'database': 'cafe_otomatis'
}

def get_db_connection():
    """Fungsi pembuka pintu koneksi ke database"""
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error koneksi ke database: {e}")
        raise HTTPException(status_code=500, detail="Gagal tersambung ke database server")

class LoginRequest(BaseModel):
    username: str
    password: str

# ========================================================
# ENDPOINT API (UNTUK DIKONSUMSI FRONTEND)
# ========================================================

# 1. API LOGIN
@app.post("/api/login")
def login(data: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT id, username, role FROM users WHERE username = %s AND password = %s"
    cursor.execute(query, (data.username, data.password))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if user:
        return {
            "status": "success",
            "message": f"Selamat datang {user['username']}!",
            "role": user['role']
        }
    else:
        raise HTTPException(status_code=401, detail="Username atau Password salah!")

# 2. API AMBIL MENU (Untuk Halaman Kasir)
@app.get("/api/menu")
def get_all_menu():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM menu")
    daftar_menu = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return daftar_menu

# 3. API DASHBOARD OWNER (Menyuplai Angka Grafik & Ringkasan)
@app.get("/api/owner/dashboard")
def get_dashboard_summary():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Hitung Omset & Total Antrean Pending
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN status_pesanan = 'Selesai' THEN total_pembayaran ELSE 0 END) AS total_penjualan,
            SUM(CASE WHEN status_pesanan = 'Pending' THEN 1 ELSE 0 END) AS total_pending
        FROM pesanan
    """)
    summary = cursor.fetchone()
    
    # Hitung Keuntungan Bersih (Harga Jual - Harga Modal)
    cursor.execute("""
        SELECT SUM(dp.subtotal - (m.harga_modal * dp.qty)) AS total_keuntungan
        FROM detail_pesanan dp
        JOIN menu m ON dp.menu_id = m.id
        JOIN pesanan p ON dp.pesanan_id = p.id
        WHERE p.status_pesanan = 'Selesai'
    """)
    keuntungan = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return {
        "total_penjualan": summary['total_penjualan'] or 0,
        "total_keuntungan": keuntungan['total_keuntungan'] or 0,
        "total_pending": summary['total_pending'] or 0
    }