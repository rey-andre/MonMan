# MonMan: Personal Finance & Crypto Tracker PWA

Aplikasi Personal Finance & Crypto Tracker dengan estetika autentik **Liquid Glassmorphism** berorientasi mobile (*mobile-first*). Dirancang sesuai spesifikasi [PRD.md](file:///Volumes/ExternalSSD/Project%20for%20life/monman/PRD.md), referensi UI [referensi-ui.html](file:///Volumes/ExternalSSD/Project%20for%20life/monman/referensi-ui.html), dan panduan arah visual [DESIGN.md](file:///Volumes/ExternalSSD/Project%20for%20life/monman/DESIGN.md).

---

## ✨ Fitur Utama & Desain Liquid Glass

### 1. 💎 Liquid Glass Design (Sesuai referensi-ui.html)
- **Ambient Lighting Orbs:** 3 bulatan gradien cair melayang di latar belakang (`#4f8cff`, `#ff9a4d`, `#a9cdff`) dengan efek *blur* 38px.
- **Frosted Glass Panels:** Panel kartu dengan `-webkit-backdrop-filter: blur(22px) saturate(160%)`, bayangan lembut `0 10px 30px rgba(79,140,255,0.14)`, dan inset border cahaya putih `inset 0 1px 0 rgba(255,255,255,0.9)`.
- **Palet Warna Asli:**
  - `--ink`: `#0f2547` (Teks kontras tinggi)
  - `--ink2`: `#41587f` (Label sekunder)
  - `--blue`: `#4f8cff` & `--sky`: `#a9cdff` (Aksen biru liquid)
  - `--orange`: `#ff9a4d` & `--peach`: `#ffd2ad` (Aksen oranye liquid)
- **Sparkline Interaktif:** Kurva SVG halus dengan gradien stroke (`#4f8cff` ke `#ff9a4d`) dan area fill gradien dengan filter rentang waktu (1W, 1M, 3M, 1Y).

### 2. 📱 Fixed Floating Glass Navigation (Mobile Viewport 100dvh)
- **Selalu Melayang di Layar HP:** Kontainer menggunakan ukuran viewport dinamis `100dvh` dengan *scrollable inner container* mandiri, sehingga bilah navigasi kaca (`glass-strong`) selalu melayang di bagian bawah layar HP (`bottom: calc(14px + env(safe-area-inset-bottom, 0px))`), tidak ikut terdorong ke bawah halaman.
- **Multi-Page Routing (Vue Router):**
  - `/` — **Beranda:** Kartu Net Worth gabungan, sparkline dinamis, tombol aksi cepat, pratinjau aset, dan riwayat aktivitas terkini.
  - `/insights` — **Analisis:** Donut chart pengeluaran per kategori, arus kas bulanan, dan kartu target dana darurat dengan progress bar gradien liquid.
  - `/wallets` — **Dompet & Kripto:** Manajemen rekening fiat (Bank, E-Wallet, Tunai) dan portofolio koin kripto presisi 10 desimal.
  - `/transactions` — **Riwayat Mutasi:** Daftar mutasi lengkap dengan pencarian, filter kategori/tipe, filter per rekening, dan fitur hapus (*rollback* saldo).

### 3. 🪙 Pelacakan Crypto Presisi Tinggi (Hingga 10 Desimal) & Live FreeCryptoAPI
- **Dukungan 10 Desimal:** Input dan tampilan angka desimal presisi tinggi (contoh: `0.0000231245 BTC`) menggunakan `step="0.0000000001"` dan `Intl.NumberFormat('id-ID', { maximumFractionDigits: 10 })`.
- **Integrasi FreeCryptoAPI:** Terhubung langsung dengan endpoint live menggunakan API Key dari `.env` (`uagr4uf46xxbzk6w2ua0`), mengambil harga pasar terkini (BTC ~$80.150 USD, ETH ~$2.325 USD, SOL ~$101 USD, BNB ~$742 USD, dll.) dan persentase perubahan 24 jam.
- **Konversi Kurs Otomatis:** Dikonversi ke Rupiah menggunakan kurs live dari `@fawazahmed0/currency-api` (~Rp 16.250).

### 4. 🏦 Manajemen Rekening Fiat & Mutasi Transaksi
- Tambah, edit, dan hapus rekening Bank, E-Wallet, dan Kas Tunai dengan saldo awal dan kode warna aksen.
- Modal pencatatan mutasi: Pengeluaran (*Expense*), Pemasukan (*Income*), dan Pindah Saldo (*Transfer*).
- Rollback otomatis saldo rekening saat transaksi dihapus.

### 5. 🤝 Manajemen Hutang & Piutang (Debts & Receivables)
- Pencatatan terpisah antara **Piutang** (hak tagih dari orang lain) dan **Hutang** (kewajiban bayar).
- Dilengkapi tanggal jatuh tempo, catatan keterangan, dan tombol checklist pelunasan langsung dari daftar.
- Tab filter: Semua, Piutang, Hutang, dan Lunas.
- Ringkasan kalkulasi selisih saldo bersih (*net balance*).

### 6. ☁️ Backend Supabase (PostgreSQL, Supabase Auth & RLS)
- **Autentikasi Pengguna:** Pendaftaran (*Sign Up*) dan Masuk (*Login*) dengan email dan kata sandi via Supabase Auth.
- **Row Level Security (RLS):** Keamanan tingkat baris pada seluruh tabel (`wallets`, `categories`, `transactions`, `crypto_assets`, `debts`, `profiles`).
- **Trigger Otomatis:** Akun baru secara otomatis dibuatkan rekening dan portofolio starter siap pakai.
- **Dukungan Offline/Tamu:** Tetap dapat digunakan dalam mode tamu lokal dengan penyimpanan `localStorage`.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Clone repository & Install dependencies:**
```bash
git clone git@github.com:rey-andre/MonMan.git
cd MonMan
npm install
```

2. **Konfigurasi Environment (`.env`):**
Salin `.env.example` ke `.env` dan masukkan kunci API yang diperlukan:
```bash
cp .env.example .env
```

3. **Jalankan Aplikasi:**
```bash
# Mode pengembangan lokal
npm run dev

# Build produksi & PWA
npm run build
npm run preview
```
Akses di browser: `http://localhost:5173`
