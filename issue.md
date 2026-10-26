# Laporan Pengujian & Daftar Masalah (Issues) - MonMan PWA

Dokumen ini memuat hasil pengujian menyeluruh terhadap aplikasi **MonMan (Personal Finance & Crypto Tracker PWA)**, perbandingan implementasi kode terhadap dokumen kebutuhan produk (**PRD.md**), analisis fitur hasil pengembangan git di luar PRD, serta daftar temuan masalah (*issues*) yang perlu diperbaiki.

---

## 1. Analisis Perubahan & Pengembangan di Luar PRD (Git Commits Beyond PRD)

Berdasarkan penelusuran riwayat commit git (`git log`), terdapat sejumlah fitur dan penyempurnaan penting yang telah diimplementasikan melampaui cakupan spesifikasi awal pada `PRD.md`:

| Fitur / Modul | Commit Terkait | Status di PRD Awal | Deskripsi Pengembangan Nyata |
| :--- | :--- | :--- | :--- |
| **Liquid Glass Dark Mode System** | `72d97aa`, `14a3a8e`, `ef8e47a` | *Tidak ada di PRD* (PRD hanya merujuk UI terang `referensi-ui.html`) | Implementasi tema gelap (*Dark Mode*) menyeluruh menggunakan `themeStore.js`, segmented control (Terang, Gelap, Sistem), sinkronisasi OS `prefers-color-scheme`, dan dokumentasi spesifikasi kontras WCAG AA di `DESIGN.md`. |
| **Privacy Mode (Sensor Nilai Sensitif)** | `8a028b1`, `f7c11a3` | *Tidak ada di PRD* | Fitur toggle sensor mata (*Privacy Eye*) di header dan modal profil untuk menyamarkan seluruh nominal finansial menjadi `Rp ••••••••`, `$••••••`, atau `••••••`. |
| **Universal Global Header** | `743c9a2` | *Tidak ada di PRD* (Awalnya terpisah per view) | Header terpadu di semua halaman yang memuat status koneksi (Cloud vs Tamu), judul dinamis, tombol privacy, tombol tema, tombol sync kurs, dan avatar profil. |
| **Halaman Analisis Finansial (`/insights`)** | `7c3dbbe`, `8e06bad` | *Tidak ada di PRD* (PRD hanya menyebut ringkasan dashboard) | Halaman mandiri analisis arus kas bulanan (*Net Cash Flow*), rasio tabungan (*Savings Rate*), grafik donat pengeluaran per kategori, dan rasio alokasi portofolio fiat vs kripto. |
| **Manajemen Hutang & Piutang (Debts & Receivables)** | `7c3dbbe` | *Hanya ada di skema SQL*, belum di spesifikasi fitur PRD | Dibuatkan fitur UI lengkap: `DebtModal.vue`, kartu Hutang & Piutang di dashboard, filter 4 status (Semua, Piutang, Hutang, Lunas), dan toggle pelunasan langsung. |
| **Mode Tamu (Guest Mode) & Onboarding Guard** | `4817ecf` | *Tidak ada di PRD* | Route guard yang mengarahkan pengguna baru ke halaman login, dengan opsi *"Gunakan mode tamu lokal tanpa login"* dan penyimpanan preferensi ke `localStorage`. |
| **Halaman Khusus Kripto & ROI / PnL (`/crypto`)** | `91b36a6` | *Awalnya hanya ada di Phase 1 client-side balance* | Diperluas menjadi halaman mandiri dengan pencatatan mutasi (Beli, Jual, Transfer) dan metrik pertumbuhan investasi (*Unrealized PnL*, ROI %, *Average Buy Price*). PRD diperbarui mencakup Bagian 4.5. |
| **Atribusi Pembuat (Rey0)** | `b5c5993`, `5be6ff8` | *Tidak ada di PRD* | Penambahan tautan portofolio pembuat `Rey(0)` di footer `AuthView.vue` dan metadata `index.html`. |

---

## 2. Ringkasan Hasil Pengujian Aplikasi

Pengujian dilakukan mencakup aspek fungsionalitas, performa *build*, integrasi API pihak ketiga, logika matematis akuntansi, serta validasi skema database:

1. **Build & Bundle Test (`npm run build`):**
   - **Hasil: PASS.**
   - Vite v5.4.21 dan `vite-plugin-pwa` v0.20.5 berhasil mengompilasi seluruh modul Vue, CSS, dan Service Worker tanpa galat sintaks maupun *unresolved imports*.
2. **External API Connectivity Test:**
   - **Exchange API (Fawaz Ahmed):** **PASS** (HTTP 200, mengembalikan kurs live USD ke IDR ~Rp 18.060).
   - **FreeCryptoAPI:** **PASS** (HTTP 200, Bearer token valid, harga live BTC, ETH, SOL berhasil diambil).
3. **Database & RLS Test (Supabase PostgreSQL):**
   - **Hasil: PASS.**
   - Koneksi Supabase klien aktif. Tabel `wallets`, `categories`, `transactions`, `crypto_assets`, `debts`, dan `crypto_transactions` terpasang dengan kebijakan Row Level Security (RLS).
4. **Presisi Desimal Kripto (10 Angka di Belakang Koma):**
   - **Hasil: PASS.**
   - Format `Intl.NumberFormat('id-ID', { maximumFractionDigits: 10 })` dan input `step="0.0000000001"` mampu menangani angka pecahan kecil (seperti `0.0000231245` dan `0.0000000001`) tanpa pembulatan prematur ke nol.

---

## 3. Daftar Temuan Masalah (Issue List)

Berikut adalah daftar masalah (*bugs*, ketidaksesuaian logika, dan celah integritas data) yang ditemukan selama pengujian:

---

### [HIGH] Issue 1: Formula Pengurangan Modal (*Cost Basis*) Saat Jual Kripto Keliru
- **File Terkait:** `src/stores/financeStore.js` (Baris 266–267)
- **Kode Saat Ini:**
  ```javascript
  } else if (t.type === 'SELL') {
    totalInvestedIdr = Math.max(0, totalInvestedIdr - fiatIdr)
  }
  ```
- **Deskripsi & Dampak:**
  Ketika pengguna menjual koin (`SELL`), sistem mengurangi total modal fiat (`totalInvestedIdr`) dengan seluruh hasil penjualan fiat (`fiatIdr`). Secara akuntansi portofolio, jika aset yang dijual sudah mengalami keuntungan (*capital gain*), nilai hasil penjualan akan lebih besar dari modal per unit koin yang dijual.
  **Contoh Kasus:**
  1. Pengguna membeli 1 BTC seharga \$20.000 (Modal = \$20.000).
  2. Harga BTC naik ke \$80.000.
  3. Pengguna menjual 0,5 BTC dan mendapatkan \$40.000.
  4. Perhitungan saat ini: `totalInvested = Math.max(0, 20.000 - 40.000) = 0`.
  5. Akibatnya, sisa koin 0,5 BTC yang masih dimiliki dianggap bermodal **\$0**, harga beli rata-rata (*Avg Buy Price*) menjadi **\$0**, dan persentase ROI serta PnL portofolio menjadi tidak valid.
- **Rekomendasi Perbaikan:**
  Saat menjual koin, kurangi modal secara proporsional terhadap rasio koin yang dijual terhadap kepemilikan sebelumnya:
  $$\text{Modal Baru} = \text{Modal Sebelumnya} \times \left(1 - \frac{\text{Jumlah Koin Terjual}}{\text{Total Koin Sebelumnya}}\right)$$
  atau kurangi sebesar `jumlahKoinTerjual * avgBuyPrice`.

---

### [MEDIUM] Issue 2: Tanda Transaksi Terima Koin (`TRANSFER_IN`) Tertulis Minus (`−`) di Riwayat Mutasi Kripto
- **File Terkait:** `src/views/CryptoView.vue` (Baris 231–233 dan 246–249)
- **Kode Saat Ini:**
  ```html
  <div class="text-[11.5px] text-[#41587f] font-mono mt-0.5 truncate">
    {{ store.isPrivacyMode ? '••••••' : (ctx.type === 'BUY' ? '+' : '−') + formatCryptoAmount(ctx.amount) }} {{ ctx.symbol }}
  </div>
  ```
- **Deskripsi & Dampak:**
  Pada tab *Mutasi Beli/Jual* di halaman `/crypto`, logika rendering hanya memeriksa apakah `ctx.type === 'BUY'`. Jika bukan `BUY` (termasuk `TRANSFER_IN` / Terima Koin), tanda nominal otomatis dijadikan minus (`−`) dan diwarnai merah (`text-rose-600`).
  Akibatnya, mutasi penambahan koin dari transfer masuk ditampilkan seolah-olah saldo berkurang (misal: `−0.5 ETH`), membingungkan pengguna.
- **Rekomendasi Perbaikan:**
  Ubah kondisi tanda dan warna agar memeriksa tipe transaksi masuk:
  ```html
  {{ store.isPrivacyMode ? '••••••' : ((ctx.type === 'BUY' || ctx.type === 'TRANSFER_IN') ? '+' : '−') + formatCryptoAmount(ctx.amount) }} {{ ctx.symbol }}
  ```
  serta sesuaikan warna teks fiat:
  ```html
  :class="(ctx.type === 'BUY' || ctx.type === 'TRANSFER_IN') ? 'text-emerald-600' : 'text-rose-600'"
  ```

---

### [MEDIUM] Issue 3: Opsi Mutasi Kirim Kripto (`TRANSFER_OUT`) Tidak Tersedia di Antarmuka
- **File Terkait:** `src/components/modals/CryptoTransactionModal.vue` (Baris 22–56)
- **Deskripsi & Dampak:**
  Berdasarkan `PRD.md` Bagian 4.5 dan *constraint check* di database Supabase:
  `check (type in ('BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT'))`.
  Namun di dalam modal pencatatan mutasi kripto (`CryptoTransactionModal.vue`), hanya tersedia 3 tombol switcher: **Beli (Buy)**, **Jual (Sell)**, dan **Terima (Transfer In)**. Pengguna sama sekali tidak dapat mencatat mutasi kirim/transfer koin ke luar (*Transfer Out*).
- **Rekomendasi Perbaikan:**
  Tambahkan opsi tombol `TRANSFER_OUT` ("Kirim") pada pilihan tipe mutasi di `CryptoTransactionModal.vue` dan sesuaikan teks bantuan formulir.

---

### [MEDIUM] Issue 4: Tidak Ada Validasi Saldo Koin Saat Jual / Kirim Kripto (Potensi Duplikasi Saldo)
- **File Terkait:** `src/components/modals/CryptoTransactionModal.vue` & `src/stores/financeStore.js` (Baris 1016–1018, 1122–1124)
- **Deskripsi & Dampak:**
  Tidak terdapat validasi apakah jumlah koin yang dijual/ditransfer keluar melebihi saldo koin yang dimiliki pengguna. Jika pengguna memiliki `0.01 BTC` lalu menjual `1.0 BTC`:
  - Saldo koin di-clamp menjadi `0` oleh `Math.max(0, balance - amount)`.
  - Saldo dompet fiat bertambah sebesar hasil penjualan 1 BTC.
  - Jika transaksi jual tersebut kemudian dihapus (*delete mutation*), fungsi rollback menambahkan kembali `1.0 BTC` ke saldo koin (`0 + 1 = 1.0 BTC`). Pengguna yang awalnya hanya memiliki 0.01 BTC kini memiliki 1.0 BTC secara cuma-cuma.
- **Rekomendasi Perbaikan:**
  1. Tambahkan validasi pada `CryptoTransactionModal.vue`: jika tipe `SELL` atau `TRANSFER_OUT`, nilai `amount` tidak boleh melebihi saldo koin yang tersedia.
  2. Berikan pesan peringatan *"Jumlah koin melebihi saldo yang dimiliki"*.

---

### [MEDIUM] Issue 5: Transfer Saldo Antar-Rekening Melebihi Saldo Asal Menghasilkan Uang Gaib
- **File Terkait:** `src/stores/financeStore.js` (Baris 665–669, 728–732)
- **Kode Saat Ini:**
  ```javascript
  } else if (type === 'TRANSFER') {
    src = this.wallets.find(w => w.id === sourceWalletId)
    tgt = this.wallets.find(w => w.id === targetWalletId)
    if (src) src.balance = Math.max(0, (Number(src.balance) || 0) - parsedAmount)
    if (tgt) tgt.balance = (Number(tgt.balance) || 0) + parsedAmount
  }
  ```
- **Deskripsi & Dampak:**
  Jika rekening A memiliki saldo Rp 100.000, lalu pengguna melakukan transfer Rp 1.000.000 ke rekening B:
  - Rekening A di-clamp ke Rp 0.
  - Rekening B bertambah Rp 1.000.000.
  - Total Net Worth pengguna bertambah Rp 900.000 dari ketiadaan.
  - Jika transfer tersebut dibatalkan/dihapus, saldo rekening A di-rollback bertambah Rp 1.000.000 (menjadi Rp 1.000.000). Total saldo menjadi rusak permanen.
- **Rekomendasi Perbaikan:**
  Tambahkan validasi di `TransactionModal.vue` dan `addTransaction` bahwa untuk tipe `TRANSFER`, nominal tidak boleh melebihi saldo rekening sumber, atau izinkan saldo negatif tanpa clamping nol yang sepihak.

---

### [MEDIUM] Issue 6: Pembelian Kripto dengan Potong Saldo Fiat Tidak Masuk ke Riwayat Mutasi Rekening
- **File Terkait:** `src/stores/financeStore.js` (Baris 1030–1047)
- **Deskripsi & Dampak:**
  Saat pengguna mencatat pembelian kripto (`BUY`) dan memilih dompet pemotongan (`sourceWalletId`), saldo rekening fiat memang terpotong. Namun, transaksi tersebut **hanya disimpan di tabel `crypto_transactions`** dan tidak dibuatkan entri mutasi di tabel `transactions`.
  Dampaknya:
  - Di halaman *Riwayat Mutasi* (`TransactionsView.vue`) dan *Aktivitas Terkini* (`HomeView.vue`), tidak ada catatan mutasi fiat yang menjelaskan mengapa saldo rekening tersebut berkurang.
  - Di halaman *Analisis Finansial* (`InsightsView.vue`), pengeluaran modal beli koin tersebut tidak terdata dalam arus kas bulanan.
- **Rekomendasi Perbaikan:**
  Saat `sourceWalletId` dipilih pada mutasi beli kripto, buatkan entri mutasi terkait di `transactions` (dengan kategori investasi atau tipe transfer investasi) atau gabungkan tampilan transaksi fiat dan mutasi kripto di riwayat aktivitas.

---

### [LOW] Issue 7: Penambahan Koin Manual Mengizinkan Duplikasi Simbol Koin yang Sama
- **File Terkait:** `src/stores/financeStore.js` (Baris 850–877)
- **Deskripsi & Dampak:**
  Pada fungsi `saveCryptoAsset` saat menambah koin baru, tidak ada pengecekan apakah simbol koin (misal `BTC`) sudah ada di daftar `cryptoAssets`. Jika pengguna menambahkannya lagi melalui `CryptoModal.vue`, akan ada dua baris koin dengan simbol yang sama. Hal ini menyebabkan perhitungan PnL dan kepemilikan koin dihitung ganda.
- **Rekomendasi Perbaikan:**
  Cek keberadaan koin berdasarkan `symbol`. Jika simbol sudah ada, perbarui jumlah kepemilikan (*update*) alih-alih membuat entri koin baru (*push*).

---

### [LOW] Issue 8: Potensi Pergeseran Tanggal Bulan (*Timezone Bug*) pada Cashflow `NetWorthCard.vue`
- **File Terkait:** `src/components/NetWorthCard.vue` (Baris 117–134)
- **Kode Saat Ini:**
  ```javascript
  store.transactions.forEach(tx => {
    const d = new Date(tx.date)
    if (d.getFullYear() === curYear && d.getMonth() === curMonth) { ... }
  })
  ```
- **Deskripsi & Dampak:**
  Di `NetWorthCard.vue`, pengecekan bulan dilakukan dengan `new Date(tx.date).getMonth()`. Karena format tanggal transaksi adalah `YYYY-MM-DD`, JavaScript memperlakukannya sebagai UTC midnight. Pada perangkat pengguna dengan zona waktu negatif (misal UTC-5) atau pergantian waktu, tanggal 1 setiap bulan (misal `2026-10-01`) akan bergeser ke hari sebelumnya (`2026-09-30`), sehingga transaksi tanggal 1 tidak terhitung ke dalam *cashflow* bulan berjalan.
- **Rekomendasi Perbaikan:**
  Gunakan pengecekan string prefix yang aman dari pergeseran timezone (seperti yang sudah digunakan pada `financeStore.js` dan `InsightsView.vue`):
  ```javascript
  const yearMonthPrefix = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`
  if (tx.date && tx.date.startsWith(yearMonthPrefix)) { ... }
  ```

---

### [LOW] Issue 9: Duplikasi dan Inkonsistensi Fungsi `formatShortIdr`
- **File Terkait:**
  - `src/utils/formatters.js`
  - `src/views/CryptoView.vue` (Baris 290–296)
  - `src/views/InsightsView.vue` (Baris 388–394)
  - `src/components/AnalyticsCards.vue` (Baris 135–141)
- **Deskripsi & Dampak:**
  Terdapat 3 implementasi lokal fungsi `formatShortIdr` di dalam komponen yang menduplikasi modul utilitas `src/utils/formatters.js`. Di utilitas pusat, fungsi mengembalikan angka tanpa `"Rp "` (misal `1.5 Jt`), sedangkan implementasi lokal menambahkan `"Rp "` (misal `Rp 1.5 Jt`). Akibatnya, pada card yang sama, beberapa nominal ditampilkan dengan prefix `"Rp "` sedangkan nominal lainnya di sebelahnya tidak memiliki `"Rp "`.
- **Rekomendasi Perbaikan:**
  Hapus fungsi lokal di komponen dan gunakan satu fungsi utilitas terstandarisasi dari `@/utils/formatters.js` dengan opsi parameter `withPrefix = true`.

---

### [LOW] Issue 10: Rasio Hutang & Piutang di Dashboard Menampilkan Bar 50-50 Saat Data Kosong
- **File Terkait:** `src/components/AnalyticsCards.vue` (Baris 142–146)
- **Kode Saat Ini:**
  ```javascript
  const piutangRatio = computed(() => {
    const total = store.totalPiutang + store.totalHutang
    if (total <= 0) return 50
    return Math.round((store.totalPiutang / total) * 100)
  })
  ```
- **Deskripsi & Dampak:**
  Jika pengguna tidak memiliki hutang maupun piutang sama sekali (`total <= 0`), rasio di-hardcode mengembalikan `50`. Hal ini membuat progress bar menampilkan 50% biru (Piutang) dan 50% oranye (Hutang), memberikan persepsi keliru seolah-olah pengguna memiliki beban hutang dan piutang seimbang, padahal nilainya Rp 0.
- **Rekomendasi Perbaikan:**
  Tampilkan bar netral (warna abu-abu kaca kosong) jika `total <= 0`, atau sembunyikan bar jika tidak ada data aktif.

---

### [LOW] Issue 11: Komponen Tidak Terpakai (*Orphaned / Dead Code*)
- **File Terkait:**
  - `src/components/AssetTabs.vue`
  - `src/components/RecentTransactions.vue`
- **Deskripsi & Dampak:**
  Kedua komponen ini merupakan artefak dari iterasi desain sebelum aplikasi dipecah menjadi *dedicated views* (`WalletsView`, `CryptoView`, `TransactionsView`). Komponen ini tidak lagi diimpor atau dirender di bagian mana pun dalam aplikasi, namun tetap berada di dalam repositori sehingga menambah kebingungan pemeliharaan kode.
- **Rekomendasi Perbaikan:**
  Hapus kedua file komponen tersebut agar struktur proyek tetap bersih dan terawat.

---

### [LOW] Issue 12: Nilai Modal Kripto Menggunakan Kurs Berjalan, Bukan Kurs Saat Transaksi Dilakukan
- **File Terkait:** `src/stores/financeStore.js` (Baris 259–261)
- **Deskripsi & Dampak:**
  Jika pengguna mencatat pembelian kripto dalam mata uang USD (misal beli $100 sebulan lalu saat kurs Rp 15.000), modal dalam Rupiah (`fiatIdr`) dihitung ulang secara dinamis dengan mengalikan `usdToIdrRate` saat ini (misal Rp 18.000). Hal ini mengakibatkan nilai modal IDR historis ikut bergerak fluktuatif mengikuti kurs harian, padahal modal riil rupiah yang dikeluarkan pengguna saat itu bersifat tetap (*fixed cost*).
- **Rekomendasi Perbaikan:**
  Simpan nilai kurs tukar saat transaksi (`exchange_rate`) atau simpan nilai ekuivalen IDR pada saat mutasi dicatat ke dalam tabel `crypto_transactions`.

---

## 4. Status Penyelesaian Masalah (GitHub Issues Resolution)

Seluruh 12 masalah telah berhasil diselesaikan secara bertahap, diuji verifikasi build, dikomit satu per satu, dan di-push ke branch `main` pada repositori GitHub [`rey-andre/MonMan`](https://github.com/rey-andre/MonMan):

| Issue # | Judul & Tipe Perbaikan | Commit Hash | Status GitHub | Ringkasan Solusi |
| :---: | :--- | :---: | :---: | :--- |
| **#1** | `fix(crypto)`: Formula pengurangan modal (*cost basis*) saat jual kripto | `1e7be73` | **Closed** | Pengurangan modal proporsional kronologis sesuai rasio unit terjual. |
| **#2** | `fix(crypto)`: Simbol tanda transaksi `TRANSFER_IN` tertulis minus (−) | `ba33c9c` | **Closed** | Penanda tanda `+` dan warna hijau zamrud (*emerald*) untuk `TRANSFER_IN`. |
| **#3** | `feat(crypto)`: Opsi mutasi kirim kripto (`TRANSFER_OUT`) di modal | `4cacf8f` | **Closed** | Tombol 4-kolom mutasi di `CryptoTransactionModal` beserta penyesuaian label. |
| **#4** | `fix(crypto)`: Validasi saldo koin saat jual / kirim kripto | `386b4ad` | **Closed** | Validasi saldo koin real-time, tombol "Maks", dan penjagaan saldo di store. |
| **#5** | `fix(transactions)`: Validasi transfer saldo antar-rekening | `7c467a8` | **Closed** | Validasi saldo asal, pesan peringatan, dan update saldo transfer simetris. |
| **#6** | `feat(crypto)`: Catat mutasi fiat saat beli kripto dengan dompet fiat | `db758f1` | **Closed** | Pembuatan mutasi fiat terkait (kategori Investasi), integrasi rollback, dan validasi dana. |
| **#7** | `fix(crypto)`: Pencegahan duplikasi simbol koin pada penambahan manual | `3cbee14` | **Closed** | Update saldo koin yang ada jika simbol sama dimasukkan kembali. |
| **#8** | `refactor(formatters)`: Standardisasi utilitas `formatShortIdr` | `52bc954` | **Closed** | Penyatuan ke `@/utils/formatters.js` dengan opsi `withPrefix` dan hapus definisi lokal ganda. |
| **#9** | `fix(ui)`: Empty state netral pada bar rasio hutang piutang saat data kosong | `277f5a7` | **Closed** | Tampilan bar kaca netral dan teks "Belum ada catatan aktif" saat total 0. |
| **#10** | `chore`: Pembersihan komponen *dead-code* (`AssetTabs` & `RecentTransactions`) | `f683dae` | **Closed** | Menghapus kedua berkas komponen lama yang tidak terpakai dari repositori. |
| **#11** | `feat(crypto)`: Simpan nilai kurs historis transaksi USD untuk modal kripto | `ae238c4` | **Closed** | Menyimpan `exchangeRate` saat transaksi dicatat dan menggunakannya pada cost basis. |
| **#12** | `fix(insights)`: Pencegahan timezone bug pada cashflow NetWorthCard | `6d44385` | **Closed** | Menggunakan string prefix `YYYY-MM` yang kebal pergeseran zona waktu. |

---

## 5. Kesimpulan & Rekomendasi Prioritas

Aplikasi **MonMan** telah berhasil mengimplementasikan seluruh kebutuhan utama pada **PRD.md**, bahkan melampauinya dengan menambahkan fitur-fitur berkelas seperti *Liquid Glass Dark Mode*, *Privacy Mode*, *Universal Header*, dan *Analisis Finansial / Arus Kas*.

Prioritas perbaikan yang disarankan untuk ditindaklanjuti berikutnya adalah:
1. **Prioritas Utama (High):** Memperbaiki formula pemotongan modal pada transaksi `SELL` kripto (Issue 1) agar kalkulasi ROI dan PnL portofolio akurat.
2. **Prioritas Menengah (Medium):** Memperbaiki tanda terima koin `TRANSFER_IN` (Issue 2), menambahkan tipe `TRANSFER_OUT` di modal (Issue 3), menambahkan validasi saldo koin/fiat saat transaksi (Issue 4 & 5), dan menghubungkan pemotongan dompet kripto ke mutasi fiat (Issue 6).
3. **Prioritas Penyempurnaan (Low):** Standardisasi fungsi format rupiah singkat (Issue 9), penanganan pergeseran timezone tanggal (Issue 8), dan pembersihan komponen dead-code (Issue 11).
