# Epik dan Story

Daftar pekerjaan yang sudah dipecah sampai bisa dikerjakan satu per satu.

Formatnya mengikuti [BMAD](https://docs.bmad-method.org/) supaya mudah dipindahkan ke scrum atau kanban nanti, tapi tidak memakai jargon scrum yang tidak perlu.

---

## Cara baca dokumen ini

| Kata | Arti |
|---|---|
| Epik | Satu kelompok pekerjaan besar yang menghasilkan satu hasil yang bisa dilihat |
| Story | Satu pekerjaan yang selesai dalam satu sampai tiga hari |
| P0 | Harus selesai sebelum produk bisa disebut jadi |
| P1 | Penting, tapi bisa menyusul |
| P2 | Bagus kalau ada, tidak jadi masalah kalau tidak ada |

---

## Peta epik

```text
E1  Pondasi      -> aplikasi jalan, tema jalan
     |
     +-- E2  Identitas  -> orang bisa daftar, masuk, keluar
     |
     +-- E3  Rencana    -> tanggal, tugas, anggaran
     |
     +-- E4  Vendor     -> catatan vendor dan pembayaran
     |
     +-- E5  Tamu       -> daftar tamu dan undangan
     |
     +-- E6  Hari-H     -> rundown, info keluarga, laporan
     |
     +-- E7  PWA       -> bisa diinstall, jalan tanpa sinyal
     |
     +-- E8  Kualitas   -> performa, aksesibilitas, keamanan
```

E1 sampai E3 harus dikerjakan berurutan. E4 sampai E6 bisa setelah E3 selesai. E7 bisa kapan saja setelah E1. E8 berjalan terus selama proyek.

---

## E1. Pondasi

**Hasil:** aplikasi jalan dengan tema yang benar, dan ada tempat untuk menulis kode.

**Kenapa pertama:** semua epik lain menempel di sini. Menunda pondasi berarti menunda semuanya.

### Story E1.1. Inisialisasi proyek

- **Purpose:** Supaya ada proyek Next.js yang jalan dengan TypeScript dan Tailwind
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** perintah `npm run dev` jalan, `npm run build` jalan tanpa error, TypeScript aktif
- **Diterima kalau:** build sukses, tidak ada error TypeScript

### Story E1.2. Warna dan tipografi design system

- **Purpose:** Supaya semua warna dan font berasal dari satu sumber
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** token warna dan font ada di satu file, mode terang dan gelap keduanya terpasang
- **Diterima kalau:** warnanya persis sama dengan `DESIGN.md`, mode gelap dibaca dengan kontras 4,5:1

### Story E1.3. Tema tanpa kedipan warna

- **Purpose:** Supaya tidak ada layar putih sesaat sebelum tema gelap tampil
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** tema dibaca dari penyimpanan lokal sebelum halaman pertama digambar
- **Diterima kalau:** tidak ada kedipan putih saat membuka di mode gelap

### Story E1.4. Layout dasar dan navigasi

- **Purpose:** Supaya ada kerangka halaman dan cara pindah halaman
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** navigasi bawah di HP, navigasi samping di desktop, tombol lompat ke konten ada
- **Diterima kalau:** semua halaman bisa dicapai dari navigasi, urutannya sama di HP dan desktop

### Story E1.5. Koneksi database dan migrasi pertama

- **Purpose:** Supaya data bisa disimpan dan diambil
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** migrasi pertama jalan, ada satu tabel uji, bisa dibaca dan ditulis
- **Diterima kalau:** perintah migrasi jalan di database kosong tanpa error

**Selesai kalau:** aplikasi jalan, dua tema aktif, migrasi jalan, semua halaman bisa dicapai.

---

## E2. Identitas

**Hasil:** orang bisa membuat akun, masuk, dan keluar.

### Story E2.1. Daftar akun

- **Purpose:** Supaya pasangan bisa punya akun
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** seseorang bisa daftar pakai nama, email, dan kata sandi
- **Diterima kalau:** email ganda ditolak dengan pesan jelas, kata sandi lemah ditolak

### Story E2.2. Masuk dan keluar

- **Purpose:** Supaya orang bisa kembali ke plansnya
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** seseorang bisa masuk dan keluar, sesi bertahan 30 hari
- **Diterima kalau:** sesi hilang setelah keluar, halaman tidak bisa diakses setelah keluar

### Story E2.3. Verifikasi email

- **Purpose:** Supaya tidak ada akun palsu dan email bisa dihubungi
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** email verifikasi dikirim, akun belum verifikasi tidak bisa membuat plan
- **Diterima kalau:** tautan verifikasi hanya bisa dipakai sekali

### Story E2.4. Buat plan pertama

- **Purpose:** Supaya ada tempat menyimpan semua isi pernikahan
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** setelah daftar, orang langsung diminta nama pasangan dan tanggal pernikahan
- **Diterima kalau:** tanggal wajib diisi, plan otomatis terhubung ke akun

---

## E3. Rencana

**Hasil:** tanggal penting, daftar tugas, dan anggaran bisa dikelola.

### Story E3.1. Daftar tanggal penting

- **Purpose:** Supaya semua tanggal ada di satu tempat
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** tanggal bisa ditambah, diubah, dihapus, dengan pengingat
- **Diterima kalau:** tanggal yang sudah lewat ditandai, tanggal turunannya dihitung mundur

### Story E3.2. Daftar tugas

- **Purpose:** Supaya orang tahu apa yang belum dikerjakan
- **Ukuran:** dua hari
- **Prioritas:** P0
- **Selesai kalau:** tugas dikelompokkan waktu, bisa dicentang selesai, bisa ditambah dan diubah
- **Diterima kalau:** tujuh kategori tugas Indonesia sudah tersedia sebagai template

### Story E3.3. Template tugas bawaan

- **Purpose:** Supaya orang tidak mulai dari nol
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** satu klik mengisi tugas KUA, tugas akad nikah, tugas venue
- **Diterima kalau:** template Indonesia, bukan daftar tugas umum

### Story E3.4. Daftar anggaran

- **Purpose:** Supaya orang tahu sudah berapa dan sisa berapa
- **Ukuran:** satu setengah hari
- **Prioritas:** P0
- **Selesai kalau:** pos anggaran bisa ditambah dengan batas, total dihitung otomatis
- **Diterima kalau:** total dihitung di server, angkanya sama di semua tempat

### Story E3.5. Batas anggaran dan tanda peringatan

- **Purpose:** Supaya orang tahu kapan harus lebih hati-hati
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** pos yang lewat batas ditandai, sisa anggaran terlihat
- **Diterima kalau:** warna bukan satu-satunya penanda, ada teksnya juga

### Story E3.6. Hapus tugas

- **Purpose:** Supaya tugas yang tidak jadi dikerjakan bisa dibuang
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** tugas bisa dihapus, dengan konfirmasi
- **Diterima kalau:** menghapus tidak bisa dibatalkan tanpa sengaja

---

## E4. Vendor dan pembayaran

**Hasil:** catatan pembayaran tidak tercecer di WhatsApp.

### Story E4.1. Daftar vendor

- **Purpose:** Supaya semua vendor ada di satu tempat
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** vendor bisa ditambah dengan kategori dan kontak
- **Diterima kalau:** kategori Indonesia lengkap, yaitu dekorasi, catering, venue, dokumentasi, MUA, adat, tainment, WO

### Story E4.2. Catat pembayaran

- **Purpose:** Supaya riwayat pembayaran tidak hilang
- **Ukuran:** satu setengah hari
- **Prioritas:** P0
- **Selesai kalau:** pembayaran bisa dicatat dengan tanggal, jumlah, metode, dan bukti
- **Diterima kalau:** total terbayar per vendor dihitung otomatis, tidak ada kolom yang bisa diisi manual

### Story E4.3. Ringkasan per vendor

- **Purpose:** Supaya tahu sisa tagihan ke vendor mana
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** di tiap vendor ada jumlah tagihan, jumlah sudah bayar, dan sisa
- **Diterima kalau:** sisa negatif berarti lebih bayar, itu ditampilkan apa adanya

### Story E4.4. Saring pembayaran

- **Purpose:** Supaya pembayaran dari bulan lalu bisa dicari
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** bisa disaring per vendor dan per bulan
- **Diterima kalau:** filter bertahan saat pindah halaman

### Story E4.5. Hapus vendor dan pembayaran

- **Purpose:** Supaya data salah bisa dikoreksi
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** vendor dan pembayaran bisa dihapus, dengan konfirmasi
- **Diterima kalau:** menghapus vendor ikut menghapus pembayarannya, dan itu diminta konfirmasi terpisah

---

## E5. Tamu

**Hasil:** jumlah tamu dan undangan terkontrol.

### Story E5.1. Daftar tamu

- **Purpose:** Supaya tahu berapa tamu dan dari mana
- **Ukuran:** satu setengah hari
- **Prioritas:** P0
- **Selesai kalau:** tamu bisa ditambah dengan nama, kategori, jumlah orang
- **Diterima kalau:** enam kategori tersedia, yaitu keluarga pengantin, keluarga pihak lain, tetangga, kerja, teman, dan lain-lain

### Story E5.2. Tempel dari daftar teks

- **Purpose:** Supaya tidak harus menambah satu per satu
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** tempel daftar teks, lihat pratinjau, baru simpan
- **Diterima kalau:** baris yang tidak terbaca ditandai, bukan diam-diam dilewati

### Story E5.3. Hitung porsi dan kursi

- **Purpose:** Supaya tahu berapa porsi catering
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** jumlah orang dan kursi dihitung otomatis dari daftar tamu
- **Diterima kalau:** jumlah bisa dikoreksi manual kalau ada tamu yang tidak makan
---

## E6. Hari-H

**Hasil:** rundown yang bisa dibuka di lokasi, info yang bisa dibaca keluarga, dan laporan yang bisa dikirim ke siapa pun.

### Story E6.1. Template rundown enam adat

- **Purpose:** Supaya rundown sesuai adat, bukan generik
- **Ukuran:** satu setengah hari
- **Prioritas:** P0
- **Selesai kalau:** pilih adat, rundown terisi dengan acaranya
- **Diterima kalau:** enam adat tersedia, yaitu Muslim, Jawa, Minang, Sunda, Bali, dan modern

### Story E6.2. Edit rundown

- **Purpose:** Supaya rundown sesuai kenyataan
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** item bisa ditambah, diubah, dihapus, dan diurutkan ulang
- **Diterima kalau:** waktu boleh kosong, itu tidak dianggap error

### Story E6.3. Rundown tanpa sinyal

- **Purpose:** Supaya rundown tetap terbuka di lokasi yang sinyalnya hilang
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** rundown terbuka tanpa internet setelah pernah dibuka sekali
- **Diterima kalau:** status luring terlihat jelas, bukan error misterius

### Story E6.4. Info untuk keluarga tanpa login

- **Purpose:** Supaya keluarga bisa lihat jadwal tanpa daftar
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** tautan dengan kunci bisa dibuka siapa pun yang punya tautan
- **Diterima kalau:** halaman ini hanya bisa dibaca, tidak bisa diubah

### Story E6.5. Ganti template tanpa kehilangan suntingan

- **Purpose:** Supaya salah pilih adat bisa diperbaiki
- **Ukuran:** setengah hari
- **Prioritas:** P1
- **Selesai kalau:** ganti adat menampilkan peringatan kalau rundown sudah diubah manual
- **Diterima kalau:** ada pilihan untuk menyimpan suntingan lama

### Story E6.6. Halaman laporan keadaan

- **Purpose:** Supaya "sudah sejauh mana" bisa dijawab dalam sekali baca
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** halaman menampilkan hitung mundur, ringkasan uang, tugas, tamu, dan rundown hari ini
- **Diterima kalau:** semua angka sama persis dengan halaman lain, tidak ada angka yang disimpan terpisah

### Story E6.7. Bagikan laporan ke WhatsApp

- **Purpose:** Supaya orang tua tahu tanpa harus pasang aplikasi
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** tiga pilihan isi, teksnya disusun di server, dan pratinjau bisa diubah kalimatnya
- **Diterima kalau:** angka, tanggal, dan tautan tidak bisa diubah, teks tidak melebihi 800 karakter

### Story E6.8. Cetak laporan jadi PDF

- **Purpose:** Supaya laporan bisa dibawa dan dicetak tanpa pustaka baru
- **Ukuran:** satu hari
- **Prioritas:** P1
- **Selesai kalau:** dialog cetak bawaan bisa membuat PDF dari halaman laporan
- **Diterima kalau:** isinya sama dengan layar, muat di A4, dan terbaca saat dicetak hitam putih

### Story E6.9. Tautan laporan yang bisa dimatikan

- **Purpose:** Supaya tautan yang bocor bisa dicabut tanpa mematikan yang lain
- **Ukuran:** setengah hari
- **Prioritas:** P1
- **Selesai kalau:** maksimal lima tautan per plan, tiap tautan bisa dimatikan sendiri
- **Diterima kalau:** tautan yang dimatikan tidak bisa dibuka lagi, tautan lain tetap jalan

---

## E7. PWA

**Hasil:** aplikasi bisa diinstall di HP dan tetap berguna saat sinyal hilang.

### Story E7.1. Service worker dan cache

- **Purpose:** Supaya aset tidak diunduh ulang tiap kali dibuka
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** service worker terdaftar, aset disimpan, halaman terbuka dari cache
- **Diterima kalau:** respons API tidak pernah diambil dari cache

### Story E7.2. Antrean perubahan luring

- **Purpose:** Supaya perubahan saat sinyal hilang tidak ikut hilang
- **Ukuran:** satu setengah hari
- **Prioritas:** P0
- **Selesai kalau:** perubahan disimpan lalu dikirim ulang saat sinyal kembali, dengan urutan benar
- **Diterima kalau:** perubahan yang gagal tiga kali ditanyakan ke pengguna

### Story E7.3. Prompt install

- **Purpose:** Supaya orang tahu aplikasi ini bisa diinstall
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** Android menampilkan tombol install, iOS menampilkan petunjuk yang jujur
- **Diterima kalau:** tidak muncul kalau aplikasi sudah diinstall

### Story E7.4. Peringatan versi baru

- **Purpose:** Supaya orang tidak terjebak di versi lama yang rusak
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** versi baru terdeteksi, pengguna diminta muat ulang
- **Diterima kalau:** peringatan bisa ditutup dan tidak muncul berulang

### Story E7.5. Halaman luring

- **Purpose:** Supaya ada yang bisa dibaca saat tidak ada apa pun yang bisa dibuka
- **Ukuran:** setengah hari
- **Prioritas:** P0
- **Selesai kalau:** halaman luring menjelaskan apa yang masih bisa dipakai dan memberi jalan ke rundown
- **Diterima kalau:** bukan halaman error generik

---

## E8. Kualitas

**Hasil:** aplikasi layak dipakai orang sungguhan.

### Story E8.1. Performa

- **Purpose:** Supaya tidak lambat di HP yang middling atau tua
- **Ukuran:** dua hari
- **Prioritas:** P0
- **Selesai kalau:** Lighthouse mobile minimal 90, LCP di bawah 2,5 detik
- **Diterima kalau:** diukur di HP sungguhan, bukan di komputer yang dipakai untuk menulis kode

### Story E8.2. Aksesibilitas

- **Purpose:** Supaya semua orang bisa membaca plansnya sendiri
- **Ukuran:** dua hari
- **Prioritas:** P0
- **Selesai kalau:** semua teks kontras minimal 4,5:1, semua bisa dipakai keyboard
- **Diterima kalau:** warna bukan satu-satunya penanda, fokus terlihat saat dipindai keyboard

### Story E8.3. Keamanan data

- **Purpose:** Supaya plan satu orang tidak terlihat orang lain
- **Ukuran:** satu setengah hari
- **Prioritas:** P0
- **Selesai kalau:** setiap request dicek kepemilikannya
- **Diterima kalau:** ada test yang mencoba membuka plan orang lain dan gagal

### Story E8.4. Backup dan pemulihan

- **Purpose:** Supaya data tidak hilang kalau server rusak
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** backup harian, retensi 14 hari, ada cara memulihkan
- **Diterima kalau:** pernah ada percobaan memulihkan, bukan cuma backup-nya ada

### Story E8.5. Halaman akun dan hapus data

- **Purpose:** Supaya orang bisa mengambil atau menghapus datanya sendiri
- **Ukuran:** satu hari
- **Prioritas:** P0
- **Selesai kalau:** orang bisa unduh semua datanya sebagai JSON dan bisa minta hapus akun
- **Diterima kalau:** permintaan hapus dikonfirmasi dua kali, dan akun kosong di luar masa aktif dihapus setelah 24 bulan

---

## Story P0 yang jadi batas minimum

Tujuh story berikut adalah batas minimum. Kalau satu saja belum, produk belum bisa disebut jadi.

| # | Story | Hari |
|---|---|---|
| 1 | E1.1 Inisialisasi proyek | 0,5 |
| 2 | E1.2 Warna dan tipografi | 1 |
| 3 | E1.4 Layout dan navigasi | 1 |
| 4 | E2.1 Daftar akun | 1 |
| 5 | E2.4 Buat plan pertama | 1 |
| 6 | E3.2 Daftar tugas | 2 |
| 7 | E6.3 Rundown tanpa sinyal | 1 |

Alasan tujuh story ini dipilih: tanpa salah satunya, produk tidak bisa dipakai. Yang lain penting, tapi bisa menyusul.

---

## Ringkasan hari kerja

| Epik | Jumlah hari |
|---|---|
| E1 Pondasi | 4,5 |
| E2 Identitas | 3 |
| E3 Rencana | 7 |
| E4 Vendor dan pembayaran | 4 |
| E5 Tamu | 3,5 |
| E6 Hari-H | 5 |
| E7 PWA | 4,5 |
| E8 Kualitas | 7,5 |
| **Total** | **39 hari** |

Angka ini berlaku untuk satu orang yang bekerja penuh waktu. Kalau bekerja setengah waktu, kalikan dua.

Total di atas hanya menjumlah estimasi per story. Rencana sprint di [`11-Delivery-Plan.md`](11-Delivery-Plan.md) memakai 55 hari kerja, karena menambah pekerjaan yang tidak layak jadi story sendiri: laporan, cetak PDF, halaman luring, uji manual di perangkat sungguhan, dan jeda antar sprint.

---

## Yang sengaja tidak ada

| Tidak ada | Kenapa |
|---|---|
| Story untuk marketplace vendor | Itu produk terpisah dengan masalah jadwal dan dua sisi yang berbeda |
| Story untuk payment gateway | Butuh izin dan proses yang belum ada |
| Story untuk AI | Tidak ada masalah nyata yang benar-benar butuh AI |
| Story untuk organizer profesional | Pengguna sekunder, cukup dapat akses baca |
| Story untuk pembuat undangan digital penuh | Ditunda, Fase 1 cukup menyimpan tautan undangannya |
| Story untuk drag and drop meja | Tidak ada yang memintanya, dan biayanya besar |
