# Product Requirement Document (PRD): MonMan (Personal Finance & Crypto Tracker PWA)

## 1. Project Overview & Objectives
**MonMan** adalah aplikasi web progresif (PWA) berorientasi mobile (*mobile-first*) untuk mencatat dan melacak seluruh aset finansial pribadi, baik uang tunai/bank (Fiat) maupun aset kripto (Crypto).

### Core Goals:
- **Agregasi Total Kekayaan (Net Worth):** Menampilkan total aset gabungan (Saldo Rekening/Dompet + Nilai Konversi Aset Crypto) dalam mata uang Rupiah (IDR), beserta rincian penempatannya.
- **Manajemen Rekening Fiat:** Menambah dan memantau saldo dari berbagai rekening bank, dompet digital (e-wallet), dan uang tunai.
- **Pencatatan Mutasi & Kategorisasi:** Mendukung transaksi Pemasukan (*Income*), Pengeluaran (*Expense*), dan Transfer Antar-Rekening (*Transfer*) lengkap dengan tag kategori.
- **Pelacakan Portofolio Crypto Real-time:** Mencatat kepemilikan jumlah unit koin crypto dengan presisi sangat tinggi (hingga **10 angka di belakang koma**) dan menghitung nilainya ke IDR secara otomatis melalui API harga pasar dan kurs mata uang terkini.
- **Aksesibilitas Multi-Device:** Berbasis PWA dan terhubung ke database cloud sehingga dapat diakses dari perangkat apa pun.

---

## 2. Tech Stack & External APIs
- **Frontend Framework:** Vue 3 (Composition API / `<script setup>`)
- **Styling:** Tailwind CSS (Mobile-first responsive layout, ukuran maksimal container mobile: ~430px)
- **State Management:** Pinia / Vue Reactive State
- **Build Tool & PWA:** Vite + `vite-plugin-pwa`
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **External APIs (Crypto & Kurs):**
  1. **FreeCryptoAPI (`https://freecryptoapi.com`):** Mengambil harga pasar koin crypto terkini dalam satuan USD (menggunakan autentikasi API Key di environment variable).
  2. **Exchange API (`@fawazahmed0/currency-api`):** Mengambil kurs nilai tukar 1 USD ke IDR terkini secara gratis tanpa API Key (`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`).
- **Deployment Platform:** Vercel / Netlify

---

## 3. Scope & Phased Implementation

Agar proses pembuatan kode oleh AI Agent berjalan rapi dan terukur, pengerjaan dibagi menjadi 2 tahap:

### Phase 1: Frontend Prototype & API Integration (Client-Side)
- Membangun seluruh halaman dan komponen UI mengikuti gambar referensi desain yang dilampirkan.
- Mengelola data rekening dan transaksi menggunakan *dummy data* / *local state* terlebih dahulu.
- Mengintegrasikan pemanggilan API eksternal (`FreeCryptoAPI` dan `Exchange API`) pada layanan frontend untuk menguji kalkulasi konversi koin Crypto -> USD -> IDR secara langsung di antarmuka.
- Memastikan seluruh interaksi berjalan baik: tambah dompet, tambah koin crypto (presisi 10 desimal), input mutasi (Expense/Income/Transfer), dan kalkulasi total aset gabungan.

### Phase 2: Backend Database (Supabase) & PWA Setup
- Menerapkan skema tabel PostgreSQL di Supabase (`wallets`, `categories`, `transactions`, `crypto_assets`).
- Menghubungkan frontend Vue 3 dengan `@supabase/supabase-js` untuk menggantikan *local state* dengan database cloud.
- Membuat logika mutasi saldo yang aman saat transaksi dibuat atau dihapus.
- Mengonfigurasi `manifest.json` dan *Service Worker* agar aplikasi dapat di-install di HP (*Add to Home Screen*).

---

## 4. Feature Specifications

### 4.1. Dashboard & Total Asset Aggregation
- **Total Net Worth Card:** Menampilkan jumlah keseluruhan aset dalam IDR:
  `Total Kekayaan (IDR) = Total Saldo Seluruh Dompet Fiat + Total Nilai IDR Seluruh Aset Crypto`.
- **Tab / Section View:** Memisahkan atau mengelompokkan tampilan antara daftar "Rekening & E-Wallet" dan "Portofolio Crypto" agar rincian aset terlihat jelas.

### 4.2. Fiat Wallet Management (Rekening & Dompet)
- **Atribut:** Nama Rekening (contoh: BCA, Mandiri, GoPay), Tipe (`Bank`, `E-Wallet`, `Cash`), Saldo Saat Ini (IDR), Warna/Ikon.
- **Fitur:** Tambah rekening baru, lihat detail saldo per rekening, edit/hapus rekening.

### 4.3. Transaction & Category Management
1. **Expense (Pengeluaran):** Mengurangi saldo rekening sumber yang dipilih. Wajib memilih kategori pengeluaran (Makanan, Transportasi, Tagihan, Belanja, Hiburan, dll.).
2. **Income (Pemasukan):** Menambah saldo rekening tujuan yang dipilih. Wajib memilih kategori pemasukan (Gaji, Freelance, Bonus, dll.).
3. **Transfer (Pindah Saldo):** Memilih rekening asal dan rekening tujuan. Mengurangi saldo rekening asal dan menambah saldo rekening tujuan dengan nominal yang sama.

### 4.4. Crypto Portfolio Management (Presisi 10 Desimal)
- **Atribut Input:**
  - `symbol`: Kode ticker koin (contoh: `BTC`, `ETH`, `SOL`).
  - `name`: Nama aset (contoh: Bitcoin, Ethereum).
  - `amount`: Jumlah koin yang dimiliki. Input dan tampilan **wajib mendukung angka desimal presisi tinggi hingga 10 angka di belakang koma** (contoh: `0.0000231245`).
- **Aturan Format Desimal Crypto:**
  - Gunakan atribut `step="0.0000000001"` atau `step="any"` pada elemen `<input>` agar browser tidak memblokir angka desimal 10 digit.
  - Gunakan konfigurasi `Intl.NumberFormat('id-ID', { maximumFractionDigits: 10 })` saat merender jumlah koin ke layar agar digit kecil tidak dibulatkan menjadi nol.
- **Alur Kalkulasi Harga Otomatis:**
  1. Ambil nilai tukar `USD_TO_IDR` dari endpoint Exchange API Fawaz Ahmed.
  2. Ambil harga per 1 koin dalam USD (`PRICE_USD`) dari endpoint FreeCryptoAPI berdasarkan `symbol`.
  3. Hitung nilai aset dalam IDR: `Nilai IDR = amount * PRICE_USD * USD_TO_IDR`.
- **Tampilan Detail Crypto:**
  - Menampilkan simbol & nama koin, jumlah unit koin hingga 10 desimal, harga pasar koin saat ini dalam USD, nilai tukar USD-IDR yang digunakan, serta nilai ekuivalen aset tersebut dalam Rupiah (IDR).
  - Menyediakan tombol **Refresh Harga** untuk memperbarui nilai pasar sewaktu-waktu.

### 4.5. Dedicated Crypto Page & Mutasi Beli/Jual Kripto (Pertumbuhan Investasi)
- **Halaman Khusus Kripto (`/crypto`):**
  - Halaman mandiri yang dapat diakses langsung dari bilah navigasi utama untuk memantau portofolio kripto dan pertumbuhan investasi secara mendalam.
- **Pencatatan Mutasi Kripto (Buy / Sell / Transfer):**
  - Setiap pembelian atau penjualan koin dicatat dengan detail:
    - `type`: `BUY` (Beli), `SELL` (Jual), `TRANSFER_IN` (Terima Koin), `TRANSFER_OUT` (Kirim Koin).
    - `symbol`: Simbol koin yang ditransaksikan (contoh: BTC).
    - `amount`: Jumlah koin (presisi hingga 10 angka desimal).
    - `fiat_currency`: Pilihan mata uang fiat yang digunakan untuk membeli/menjual (`IDR` atau `USD`).
    - `fiat_amount`: Nilai modal/dana fiat yang diinvestasikan pada transaksi tersebut.
    - `price_per_coin`: Harga beli/jual efektif per 1 koin (otomatis terhitung `fiat_amount / amount` atau dapat disesuaikan).
    - `source_wallet_id`: Opsi pemotongan otomatis dari dompet fiat (misal potong saldo BCA/GoPay saat beli koin).
    - `transaction_date`: Tanggal transaksi.
    - `notes`: Catatan transaksi.
- **Kalkulasi & Metrik Pertumbuhan Investasi (ROI & PnL):**
  - **Total Modal Terinvestasi (*Total Cost Basis*):** Akumulasi seluruh dana fiat (dalam IDR) yang telah dibelanjakan untuk membeli koin.
  - **Nilai Portofolio Terkini (*Current Value*):** `Total Koin * Harga Pasar Terkini * Kurs IDR`.
  - **Keuntungan / Kerugian (*Unrealized Profit & Loss*):** `Nilai Portofolio Terkini − Total Modal Terinvestasi`. Ditampilkan dalam nominal Rupiah (`+Rp ...` / `−Rp ...`).
  - **Persentase Pertumbuhan (*Return on Investment / ROI %*):** `((Nilai Terkini − Modal) / Modal) * 100%`.
  - **Harga Beli Rata-Rata (*Average Buy Price*):** Menampilkan rata-rata harga beli per koin (dalam USD & IDR) untuk membandingkannya secara langsung dengan harga pasar saat ini (*Break Even Point*).
  - **Riwayat Mutasi Per Koin:** Pengguna dapat memfilter dan melihat histori riwayat beli/jual untuk tiap koin secara terpisah.

---

## 5. Database Schema Design (Supabase PostgreSQL)

Berikut adalah dokumentasi skema tabel yang harus dibuat pada tahap integrasi Supabase:

```sql
-- 1. Tabel Wallets (Rekening Bank / E-Wallet / Tunai)
create table public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('Bank', 'E-Wallet', 'Cash')),
  balance numeric(15, 2) not null default 0,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel Categories (Kategori Pemasukan & Pengeluaran)
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('EXPENSE', 'INCOME')),
  icon text
);

-- 3. Tabel Transactions (Riwayat Mutasi Uang)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('EXPENSE', 'INCOME', 'TRANSFER')),
  amount numeric(15, 2) not null check (amount > 0),
  source_wallet_id uuid references public.wallets(id) on delete cascade,
  target_wallet_id uuid references public.wallets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  notes text,
  transaction_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel Crypto Assets (Kepemilikan Koin Crypto)
-- Menggunakan numeric(20, 10) agar sanggup menyimpan hingga 10 digit di belakang koma secara akurat
create table public.crypto_assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  symbol text not null, -- Contoh: 'BTC', 'ETH'
  name text not null,   -- Contoh: 'Bitcoin'
  amount numeric(20, 10) not null check (amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel Crypto Transactions (Mutasi Beli / Jual Kripto & Nilai Fiat Investasi)
create table public.crypto_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  crypto_asset_id uuid references public.crypto_assets(id) on delete cascade,
  symbol text not null,
  type text not null check (type in ('BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT')),
  amount numeric(20, 10) not null check (amount > 0),
  fiat_currency text not null default 'IDR' check (fiat_currency in ('IDR', 'USD')),
  fiat_amount numeric(15, 2) not null default 0,
  price_per_coin numeric(20, 2) not null default 0,
  source_wallet_id uuid references public.wallets(id) on delete set null,
  notes text,
  transaction_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabel Debts (Hutang & Piutang)
create table public.debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  type text not null check (type in ('PIUTANG', 'HUTANG')),
  person text not null,
  amount numeric(15, 2) not null check (amount > 0),
  due_date date,
  is_paid boolean not null default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);