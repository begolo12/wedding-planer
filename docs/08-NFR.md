# 08. Syarat Non-Fungsional

Dokumen ini berisi batas yang harus dipenuhi tanpa perlu user mengetahuinya. Kalau salah satu gagal, itu bug, bukan fitur yang belum selesai.

---

## Performa

| Metrik | Target | Cara ukur |
|---|---|---|
| Lighthouse Performance, mobile | Minimal 90 | Lighthouse 12, mode mobile, koneksi simulasi 3G |
| LCP | Di bawah 2,5 detik | Field data, koneksi 3G |
| INP | Di bawah 200 milidetik | Field data |
| CLS | Di bawah 0,1 | Field data |
| TTFB | Di bawah 800 milidetik | Server region Jakarta |
| Waktu buka aplikasi setelah install | Di bawah 2 detik | Cache service worker aktif |

Angka di atas mengikuti standar Core Web Vitals dari Google. Yang dipakai di sini adalah batas minimum yang umum, bukan rekor yang harus dipecahkan.

### Yang harus diukur

Lighthouse dijalankan untuk setiap halaman utama, bukan hanya untuk Beranda. Daftar tugas dan daftar tamu punya cara berbeda untuk memuat data, jadi bisa punya biaya yang berbeda.

Field data dikirim dari browser kalau ada cukup banyak penggunanya. Kalau belum ada, Lighthouse yang dipakai.

**Angka di atas tidak boleh diklaim tanpa hasil pengukuran nyata.** Kalau belum diukur, tulis "belum diukur" di dokumen ini.

---

## Keandalan

| Syarat | Target | Alasan |
|---|---|---|
| Ketersediaan | 99,5 persen per bulan | Pernikahannya satu kali, jadi memilih hari yang salah akan sangat merusak |
| Waktu pemulihan | Di bawah 1 jam | Provider VPS biasa |
| Backup database | Setiap hari, retensi 14 hari | Data plan tidak bisa hilang |
| Restore diuji | Setiap bulan | Backup yang belum pernah diuji bukan backup |
| Error monitoring | Error rate di bawah 1 persen | application session |

Application ini bukan sistem pembayaran, jadi tidak butuh SLA 99,99 persen. Yang penting data tidak hilang dan aplikasi tetap bisa dibuka saat DATABASE bermasalah.

---

## Aksesibilitas

Target: WCAG 2.1 level AA.

| Kriteria | Implementasi |
|---|---|
| 1.1.1 Konten non-teks | Semua ikon punya `aria-label`, dekorasi punya `aria-hidden` |
| 1.3.1 Info dan hubungan | Heading berurutan, label terhubung ke input |
| 1.4.3 Kontras minimum | Rasio minimal 4,5:1 untuk teks biasa, 3:1 untuk teks besar |
| 1.4.4 Resize teks | 200 persen tanpa kehilangan konten |
| 2.1.1 Keyboard | Semua fungsi tersedia lewat keyboard |
| 2.1.2 Tidak ada keyboard trap | Tidak ada fokus yang terkunci tanpa jalan keluar |
| 2.4.1 Lewati blok | Skip link ke konten utama |
| 2.4.7 Focus terlihat | Outline minimal 2px, kontras minimal 3:1 |
| 2.5.5 Ukuran target | Minimal 44x44px |
| 3.3.2 Label atau instruksi | Setiap input punya label yang jelas |
| 4.1.2 Nama, peran, nilai | Komponen interaktif punya nama aksesibel |

### Warna bukan satu-satunya penanda

Kategori tamu, status pembayaran, dan status tugas punya warna, tapi juga punya label teks atau bentuk ikon yang berbeda. Alasannya, sekitar 1 dari 12 pria dan 1 dari 200 wanita punya masalah penglihatan warna, dan tidak ada dari mereka yang bisa melihat plan mereka sendiri.

### Mode gelap bukan tambahan belakangan

Semua warna punya pasangan dark, bukan sekadar dibalik. Warna accent di dark mode dinaikkan sedikit supaya tetap terbaca di latar gelap. Hasilnya harus diuji per halaman, bukan diasumsikan.

---

## Keamanan

### Autentikasi

| Aspek | Implementasi |
|---|---|
| Password | Hash dengan scrypt (default Better Auth) |
| Sesi | Cookie httpOnly, sameSite lax, secure di produksi |
| Sesi kedaluwarsa | 30 hari |
| Verifikasi email | Wajib sebelum bisa membuat plan |
| Reset password | Via email, token sekali pakai |

### Otorisasi

Semua query wajib punya dua pemeriksaan:

1. Plan dengan `planId` itu milik user yang sedang login
2. Data dengan `id` itu milik plan tersebut

Pemeriksaan satu tanpa yang lain membuka celah. Data diambil berdasarkan `id` saja berarti pasangan bisa mengedit data pasangan lain kalau tahu `id`-nya.

### Unggah file

| Aspek | Aturan |
|---|---|
| Ukuran maksimum | 5MB untuk bukti transfer |
| Format | Hanya `image/jpeg` dan `image/png` |
| Nama file | Di-generate ulang, nama asli tidak dipakai |
| Penyimpanan | Nama acak di object storage, bukan di path asli |
| Konten | Divalidasi dari isi file, bukan dari header |

### Rate limit

| Endpoint | Batas |
|---|---|
| Login | 10 percobaan per 15 menit per IP |
| Register | 5 per jam per IP |
| Share link | 30 request per menit per token |
| API umum | 120 request per menit per user |
| Upload | 20 file per jam per user |

Rate limit memakai token bucket, bukan counter sederhana. Alasannya, counter sederhana menahan pengguna yang pemakaiannya naik-turun, sementara token bucket menyimpan rata-rata.

---

## Privasi

### Landasan hukum

Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, disingkat UU PDP. Persetujuan harus eksplisit dan bisa ditarik kapan saja.

### Data yang dikumpulkan

| Data | Tujuan | Persetujuan |
|---|---|---|
| Nama dan email | Login | Wajib |
| Nama pasangan, pasangan, tamu | Fungsi inti | Wajib |
| Tanggal wedding | Fungsi inti | Wajib |
| Nominal pembayaran | Fungsi inti | Wajib |
| Foto bukti transfer | Fungsi inti | Wajib |

Tidak ada data yang dikumpulkan untuk keperluan iklan. Tidak ada analytics pihak ketiga. Tidak ada pixel.

### Hak pengguna

| Hak | Implementasi |
|---|---|
| Akses | Semua data bisa dilihat dan diunduh dari aplikasi |
| Koreksi | Semua data bisa diubah kapan saja |
| Hapus | Hapus plan menghapus semua data turunannya |
| Ekspor | Unduh semua data sebagai JSON |
| Tarik persetujuan | Hapus akun |

Hapus akun menghapus `users` dan semua `plans` beserta turunannya. Karena cascade sudah diatur di foreign key, tidak perlu kode penghapusan manual. Satu query sudah cukup.

### Retensi

Akun yang tidak aktif selama 24 bulan dihapus otomatis, dengan pengingat email 30 hari sebelumnya.

**Batas ini dipilih karena satu rencana perbaikan berlangsung kurang dari satu tahun.** Akun yang masih ada setelah dua tahun kemungkinan besar sudah tidak terpakai, dan menyimpan data pribadi orang yang sudah tidak ada hubungannya selama itu tidak wajar.

### Cookie

| Cookie | Tujuan | Jenis |
|---|---|---|
| Session | Menyimpan login | Fungsional, wajib |
| `aisyah-theme` | Menyimpan pilihan tema | Fungsional, wajib |

Tidak ada cookie iklan, tidak ada cookie pelacak, tidak ada pihak ketiga. Kalau ini berubah, itu perubahan kebijakan yang perlu ditulis di sini.

---

## Kompatibilitas

| Peramban | Versi minimum | Alasan |
|---|---|---|
| Chrome Android | 90 | Mayoritas pengguna Android di Indonesia |
| Chrome Desktop | 90 | |
| Safari iOS | 15 | Persentase pengguna iOS yang tidak bisa diabaikan |
| Safari macOS | 15 | |
| Samsung Internet | 15 | Banyak dipakai di Android kelas menengah |
| Firefox Desktop | 90 | |

Peramban di bawah versi minimum tetap bisa membuka aplikasi, tapi tidak dapat dipasang. Alasannya, menulis penyiasatan untuk peramban lama yang tidak terlalu banyak dipakai, tapi membuat kode utama lebih buruk.

Fitur yang wajib punya fallback: service worker, IndexedDB, dan `clamp()`. Ketiganya punya fallback, dan fallback-nya sudah ditulis, bukan baru ada saat pengujian.

---

## Pemantauan

| Yang dipantau | Alat | Alasan |
|---|---|---|
| Error server | Log ke stdout, dikirim ke aggregator log | Standar di platform hosting |
| Error client | Diterima server, disimpan di tabel `client_errors` | Tidak perlu alat pihak ketiga |
| Response time | Log satu baris per request | Cukup untuk melihat regresi |
| Health check | `GET /api/health`, cek koneksi database | Dipakai platform untuk memutuskan |

**Sentry dan alat serupa tidak dipakai di Fase 1.** Alasannya, satu produk dengan beberapa ribu pengguna belum butuh sistem pemantauan kelas besar, dan menambah vendor berarti menambah biaya dan satu hal yang harus dipercaya.

Kalau jumlah error tidak bisa dibaca dari log biasa, itu tanda aplikasinya belum cukup jelas, bukan tanda perlu alat yang lebih besar.

Tabel `client_errors`:

| Kolom | Isi |
|---|---|
| `id` | UUID |
| `userId` | FK, nullable untuk error sebelum login |
| `message` | Pesan galat, dibatasi 500 karakter |
| `stack` | Stack trace, nullable |
| `url` | URL tempat galat terjadi |
| `userAgent` | User agent, nullable |
| `createdAt` | Waktu |

Data ini tidak pernah ditampilkan ke user, dan bisa dihapus user bersama akunnya.

---

## Batas yang disengaja

| Yang tidak ada | Alasan |
|---|---|
| Multi-region | Mayoritas pengguna di satu negara, satu region cukup |
| CDN untuk gambar | Gambar hanya bukti transfer, jumlahnya sedikit |
| Rate limiting terdistribusi | Satu instance, in-memory token bucket cukup |
| Auto-scaling sederhana | Traffic di hari-H memang tidak merata, jadi scaling sederhana sudah cukup |
| Multi-region backup | Backup lokal cukup, restore diuji bulanan |
| Cakupan test yang wajar | Yang penting jalur kritis, menulis test untuk setiap getter tidak ada gunanya |

---

## Rencana pengukuran

Apa yang harus diukur sebelum rilis, dan apa yang boleh ditunda:

| Item | Kapan | Status |
|---|---|---|
| Lighthouse semua halaman | Sebelum rilis | Belum diukur |
| LCP di 3G | Sebelum rilis | Belum diukur |
| Uji keyboard penuh | Sebelum rilis | Belum diuji |
| Uji dengan screen reader | Sebelum rilis | Belum diuji |
| Dark mode per halaman | Sebelum rilis | Belum diuji |
| Install PWA di iOS dan Android | Sebelum rilis | Belum diuji |
| Uji luring di desa bersinyal lemah | Sebelum rilis | Belum diuji |
| Uji beban | Setelah rilis | Belum diukur |
| Field data Core Web Vitals | Setelah rilis | Belum ada |

Semua baris terakhir ditulis "belum", karena memang belum ada aplikasinya untuk diukur. Kalau tabel ini diisi dengan angka sebelum aplikasi ada, itu karangan.