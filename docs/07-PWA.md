# 07. PWA

Aplikasi ini harus tetap berguna di tempat sinyal jelek. Di perkawinan di Indonesia, lokasi hari-H sering di desa dengan sinyal 1 bar atau tidak ada sama sekali. Rundown dipakai di tempat itu.

---

## Manifest

`app/manifest.ts` dengan isi berikut.

| Field | Nilai | Alasan |
|---|---|---|
| `name` | `Aisyah & Bagas` | Nama plan default, diganti setelah user mengisinya |
| `short_name` | `Aisyah` | Maksimal 12 karakter agar tidak terpotong di home screen |
| `start_url` | `/` | Mengalways ke Beranda, bukan halaman terakhir yang dibuka |
| `display` | `standalone` | Tanpa address bar, terasa seperti aplikasi biasa |
| `background_color` | `#FBF9F6` | Sama dengan base palette agar tidak ada kedipan putih |
| `theme_color` | `#FBF9F6` | Mobile browser memakai ini untuk address bar |
| `orientation` | `portrait-primary` | Mobile adalah target utama |
| `lang` | `id-ID` | Mematikan terjemahan otomatis browser |
| `categories` | `lifestyle`, `productivity` | Untuk penempatan di home screen Android |
| `icons` | 192, 512, 512 maskable | Android butuh maskable untuk adaptive icon |

`background_color` harus sama persis dengan `background_color` di CSS. Kalau beda, memasang aplikasi di home screen akan menampilkan layar putih sesaat sebelum app termuat.

---

## Strategi cache

Service worker ditulis tangan di `public/sw.js`. Alasannya, strategi cache di sini spesifik: data plan di-cache per `planId`, dan share link tidak boleh pernah di-cache.

Empat strategi, satu per jenis request:

| Jenis | Strategi | Kenapa |
|---|---|---|
| Navigasi halaman | Network first, fallback ke cache | Halaman harus selalu paling baru, tapi harus tetap terbuka luring |
| Aset statis (`/_next/static/`) | Cache first | Nama file sudah mengandung hash, jadi tidak pernah berubah |
| Font | Cache first, dengan batas ukuran | Font tidak berubah dalam masa pakai aplikasi |
| Request `/api/` | Network only, dengan antrean luring | Data plan harus benar, tidak boleh dari cache basi |

### Kenapa API tidak pernah cache first

Kalau pembayaran dicache, user bisa melihat pembayaran sudah tercatat padahal server belum menerima. Untuk data keuangan, data basi lebih berbahaya daripada data tidak ada.

### Navigasi: network first dengan fallback

```
1. Coba ambil dari network, dengan timeout 3 detik
2. Kalau berhasil, perbarui cache, kirim ke client
3. Kalau gagal atau timeout, ambil dari cache
4. Kalau tidak ada di cache, kirim halaman luring yang explains apa yang terjadi
```

Halaman luring bukan `error.html` generik. Isinya menjelaskan aplikasi masih bisa dipakai untuk apa, dan tombol ke rundown, karena itu satu-satunya layar yang benar-benar berguna tanpa koneksi.

---

## Apa yang harus tersedia luring

| Layar | Luring? | Alasan |
|---|---|---|
| Rundown | Ya, wajib | Dipakai di lokasi saat sinyal hilang |
| Info untuk keluarga | Ya, kalau sudah dibuka | Frequently dibaca oleh keluarga |
| Daftar tugas | Ya, read-only | Langkah cepat di tempat |
| Daftar tamu | Ya, read-only | Pengecekan jumlah di lokasi |
| Anggaran | Ya, read-only | Mengecek perkiraan di lokasi |
| Tambah atau ubah data | Antrean, kirim nanti | Butuh konfirmasi user, jadi tidak boleh diam-diam |
| Login | Tidak | Sesi harus diverifikasi server |

Read-only luring berarti data tampil dari cache, tapi tombol tambah disembunyikan, bukan diklik dan gagal. Tombol yang tidak bisa bekerja lebih baik disembunyikan.

---

## Antrean luring

Perubahan saat luring masuk ke IndexedDB, bukan `localStorage`. Alasannya, `localStorage` tidak bisa menangani banyak entri dengan aman dan tidak ada transaksi.

Struktur antrean:

| Kolom | Isi |
|---|---|
| `id` | UUID |
| `method` | `POST`, `PATCH`, `DELETE` |
| `path` | Path endpoint |
| `body` | Body request |
| `createdAt` | Waktu dibuat, untuk mengurutkan |
| `attempts` | Berapa kali sudah dicoba |
| `lastError` | Galat terakhir, nullable |

Alur pengiriman ulang:

```
1. Service worker menangkap request yang gagal karena luring
2. Body dibaca sebagai teks, lalu disimpan di antrean
3. Client diberi tahu "menyimpan, kirim nanti"
4. Saat online, antrean dikirim berurutan dari yang paling lama
5. Kalau berhasil, item dihapus
6. Kalau gagal karena konflik, item ditahan dan client diberi tahu
7. Kalau gagal karena galat server, coba lagi dengan jeda bertambah
8. Setelah 5 kali gagal, item ditahan dan ditandai perlu perhatian manual
```

Urutan pengiriman penting. Kalau user menambah tugas lalu menghapus di luring, antrean harus mengirim tambah dulu baru hapus. Kalau urutan acak, hapus bisa tiba lebih dulu dan tambah menggantung.

**Alasannya** antrean yang tidak urut bisa menghasilkan data yang tidak pernah ada di layar user.

### Batas antrean

Batas 200 item. Kalau lewat, item tertua dibuang dan user diberi tahu. Alasannya, antrean yang membengkak tanpa batas akan memperlambat setiap pengiriman, dan 200 perubahan luring sudah jauh melebihi yang realistis.

---

## Konflik saat sinkron

Kalau server mengembalikan `409`, client menampilkan dialog dengan dua pilihan: pakai versi server atau pakai versi lokal. Gaya kalimatnya:

| Opsi | Contoh teks |
|---|---|
| Pakai versi server | "Tugas ini sudah diubah di perangkat lain. Pakai versi yang terbaru?" |
| Pakai versi lokal | "Simpan perubahan dari perangkat ini" |

`last-write-wins` tidak dipakai. Alasannya, kalau pasangan dan istrinya edit tugas yang sama di perangkat berbeda, menimpa tanpa bertanya berarti salah satu kehilangan datanya tanpa sadari.

---

## Install prompt

### Di Android / Chrome

Chrome menampilkan banner install sendiri kalau seluruh syarat terpenuhi. Yang perlu dipenuhi:

| Syarat | Kenapa |
|---|---|
| Dijalankan dari HTTPS | Service worker butuh secure context |
| Ada service worker aktif | Chrome hanya menawarkan kalau ada |
| Ada `manifest.json` yang valid | |
| APK dengan `start_url` di-cache | |
| Pengguna belum pernah install atau dismiss | |

Kalau banner bawaan tidak muncul, tombol Install tetap bisa ditampilkan sebagai cadangan, tapi harus menyebut alasan. Contoh: "Install dulu biar bisa dibuka tanpa internet." Bukan tombol yang diam-diam tidak bekerja.

### Di iOS / Safari

iOS tidak punya API install prompt. Satu-satunya cara adalah tombol Bagikan lalu "Tambah ke Layar Utama". Jadi di iOS tampilkan instruksi, bukan tombol install yang mengira dirinya akan memasang aplikasi.

**Teksnya harus jujur.** Kalau iOS, tulis: "Ketuk Bagikan, lalu pilih Tambah ke Layar Utama."

---

## Update dan versi

Service worker punya dua versi cache: `current` dan `previous`. Saat versi baru terpasang, cache lama tetap ada sampai semua tab yang memakai versi lama ditutup.

Aturan:

| Nama aset | Pola |
|---|---|
| Aset statis | Versi baru langsung replaces yang lama |
| Navigasi | Versi baru replaces yang lama |
| API cache | Tidak pernah replaces, selalu dibuang saat update |

Alur update:

```
1. Service worker baru terpasang dan masuk status waiting
2. Tidak langsung aktif, tunggu semua tab lama ditutup
3. Saat aktif, hapus cache lama
4. Tampilkan pengingat "Ada versi baru" yang bisa ditutup
```

Jangan perbarui paksa di tengah pemakaian, karena user mungkin sedang isi form.

---

## Offline detection

`navigator.onLine` tidak bisa dipercaya. Browser sering melaporkan online di Wi-Fi yang tidak punya internet.

Cara yang dipakai: coba request kecil ke endpoint sendiri. Kalau gagal, anggap luring. Dicek setiap 30 detik, dan setiap kali tab regain focus.

Indikator luring di UI:

| Lokasi | Isi |
|---|---|
| Bawah bar navigasi | Bar tipis dengan teks "Luring. Perubahan disimpan dan dikirim nanti." |
| Layar rundown | Banner kecil dengan teks "Buka ini luring. Tekan 'Simpan' untuk kirim setelah ada internet." |

Indikatornya harus kelihatan jelas tanpa memenuhi layar. Teks, bukan cuma ikon, karena ikon saja tidak selalu dimengerti.

---

## Data plan saat luring

Cache API untuk luring hanya menyimpan data yang sudah pernah dibuka. Jadi:

| Layar | Data yang di-cache |
|---|---|
| Beranda | `/overview` |
| Daftar tugas | 50 tugas pertama |
| Daftar tamu | 50 tamu pertama |
| Rundown | Semua item, karena ini yang paling dibutuhkan |
| Anggaran | Semua pos, jumlahnya kecil |

Tidak ada proses sync periodik untuk mengisi cache. Alasannya, satu proses sync yang berjalan diam-diam akan memakai kuota data user tanpa diminta. Cache diisi saat layar dibuka.

---

## Batas PWA

| Tidak ada | Alasan |
|---|---|
| Push notification | Butuh server, dan belum ada kebutuhan yang jelas |
| Background sync API | Dukungan browser belum merata, antrean di service worker sudah cukup |
| Periodic background sync | Sama, tidak konsisten antar browser |
| Workbox atau library cache | Strategi di sini spesifik, dan menulis sendiri lebih mudah diubah |

**Workbox ditolak karena menambah sekitar 20KB dan API yang harus dipelajari, untuk sesuatu yang hanya butuh lima handler.** Ini bukan soal performa, tapi soal berapa banyak yang perlu dipahami orang berikutnya.

---

## Checklist sebelum dianggap selesai

| Item | Status |
|---|---|
| Manifest valid, install di Android dan iOS | |
| Rundown terbuka penuh tanpa internet | |
| Indikator luring muncul saat koneksi hilang | |
| Perubahan saat luring masuk antrean, bukan hilang | |
| Antrean terkirim setelah koneksi kembali, dengan urutan benar | |
| Konflik menawarkan dua pilihan, bukan menimpa diam-diam |
| Service worker aktif hanya di produksi | Tidak di `next dev`, karena cache akan menyembunyikan perubahan terbaru |
| Versi cache increase setiap release | |
| Hanya HTTPS | |