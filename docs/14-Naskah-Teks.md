# 14. Naskah Teks

Semua kalimat yang muncul di aplikasi ini ditulis di sini satu per satu, supaya tidak ada yang terlewat. Teks yang ditulis langsung di kode adalah hasil karangan saat sedang terburu-buru.

Nada bahasa sudah ditetapkan di [`DESIGN.md`](../DESIGN.md) bagian 2. Dokumen ini tidak mengulang aturan nada, tapi jadi tempat teks yang jadi.

---

## 1. Cara memakai dokumen ini

| Pertanyaan | Jawaban |
|---|---|
| Kenapa teks ditulis di dokumen, bukan di kode? | Karena teks yang ditulis sambil sibuk biasanya berubah tidak konsisten. Tiga tombol untuk hal berbeda bisa punya tiga nama berbeda kalau tidak disatukan lebih dulu. |
| Siapa yang boleh mengubah teks di sini? | Siapa pun yang membangun, tapi perubahan harus punya alasan di bagian 9. |
| Kalau teksnya belum ada di sini, apa yang terjadi? | T Tertinggal. Layar yang punya teks belum ada di dokumen ini belum selesai, walau warnanya sudah benar. |
| Boleh pakai Bahasa Inggris? | Hanya kalau sudah jadi bahasa sehari-hari, misalnya vendor, rundown, dan DP. |

---

## 2. Aturan penulisan

| Aturan | Contoh benar | Contoh salah |
|---|---|---|
| Kalimat pendek | "Tambah tugas" | "Tambahkan tugas baru ke dalam daftar tugas Anda" |
| Huruf besar di awal | "Simpan perubahan" | "simpan perubahan" |
| Tanpa tanda seru, kecuali memang keganjilan | "Tersimpan" | "Berhasil disimpan!" |
| Angka rupiah penuh | `Rp 4.500.000` | `Rp 4,5jt` |
| Tanggal di teks tampil | `30 Juni 2026` | `2026-06-30` |
| Tanya ke user pakai "kamu" atau langsung nama | "Hapus tugas ini?" | "Apakah Anda yakin ingin menghapus tugas ini?" |
| Sebut tindakan di pesan galat | "Gagal menyimpan" | "Terjadi kesalahan" |

**Alasan tanpa tanda seru.** Aplikasi ini dipakai sambil sibuk. Tanda seru di setiap toast membuat pasangan berhenti membaca, padahal pesan itu tidak gawat.

**Alasan nama tombol pakai kata kerja.** Tombol yang isinya kata benda membuat orang menebak apa yang terjadi setelah diklik.

---

## 3. Nama tombol

### 3.1 Tombol utama

| Layar | Tombol | Bukan |
|---|---|---|
| Beranda | Tambah tugas | Tambah |
| Daftar tugas | Tambah tugas | Tambah baru |
| Anggaran | Tambah pos | Tambah anggaran |
| Vendor | Tambah vendor | Tambah |
| Pembayaran | Catat pembayaran | Bayar |
| Tamu | Tambah tamu | Tambah |
| Undangan | Buat undangan | Buat |
| Rundown | Tambah acara | Tambah |
| Info keluarga | Tambah pengumuman | Tambah info |
| Busana | Tambah barang | Tambah |

**Alasan "Tambah" selalu menyebut bendanya.** Kalau empat tombol semuanya cuma berisi "Tambah", satu-satunya pembeda cuma posisi di layar, dan itu tidak berarti apa-apa saat ada empat tombol yang sama.

### 3.2 Tombol di daftar

| Aksi | Nama | convincingly |
|---|---|---|
| Ubah satu item | Ubah | Edit |
| Hapus satu item | Hapus | Remove |
| Tandai tugas selesai | Selesai | Tandai selesai |
| Batalkan tugas selesai | Belum selesai | Undo |
| Lihat detail | Lihat | Buka |
| Tutup | Tutup | Close |

### 3.3 Tombol sistem yang tidak dipakai

| Tidak dipakai | Dipakai gantinya | Alasan |
|---|---|---|
| Submit | Simpan | "Submit" terasa seperti formular kantor |
| Confirm | Ya, hapus | Orang tidak tahu apa yang dikonfirmasi |
| OK | Tutup | "OK" tidak menjelaskan tombol ini melakukan apa |
| Cancel | Batal | "Cancel" sudah jadi bahasa sehari-hari, boleh |
| Save & Continue | Simpan lalu lanjut | Terlalu panjang untuk tombol |

---

## 4. Judul layar

Judul layar selalu menjelaskan isinya, bukan nama modul.

| Layar | Judul | Bukan |
|---|---|---|
| Beranda | Beranda | Dashboard |
| Daftar tugas | Tugas | Task Management |
| Detail tugas | Ubah tugas | Edit |
| Anggaran | Anggaran | Budget |
| Vendor | Vendor | Vendor Management |
| Pembayaran | Pembayaran | Payment History |
| Tamu | Tamu | Guest List |
| Undangan | Undangan | Invitation |
| Rundown | Rundown acara | Run Sheet |
| Info keluarga | Info untuk keluarga | Briefing |
| Busana | Busana | Attire |

---

## 5. Navigasi

### 5.1 Sidebar

| Label | Alasan |
|---|---|
| Beranda | Bahasa sehari-hari, bukan "dashboard" |
| Rencana | Payung untuk tanggal, tugas, anggaran, dan vendor |
| Tamu | Payung untuk daftar tamu dan undangan |
| Hari-H | Payung untuk rundown dan info keluarga |
| Lainnya | Payung untuk busana dan catatan |
| Pengaturan | Letak paling bawah, karena jarang dibuka |

### 5.2 Bottom bar di HP

Lima label saja, karena lebih dari lima tidak muat tanpa mengecilkan tulisan.

Urutan: Beranda, Rencana, Tamu, Hari-H, Lainnya.

---

## 6. Status dan label

### 6.1 Status tugas

| Status | Label | Warna | Alias yang dipakai |
|---|---|---|---|
| Belum dikerjakan | Belum | netral | Tidak |
| Sudah dikerjakan | Selesai | sage | Beres, Bereskan |
| Sudah lewat tanggal | Terlambat | merah bata | Lewat, Pasti |

**Alasan warna tidak jadi satu-satunya penanda.** Setiap status punya teks dan ikon berbeda, supaya penyandang gangguan penglihatan warna tidak kehilangan informasi.

### 6.2 Kehadiran tamu

| Nilai | Label | Alias yang dipakai |
|---|---|---|
| `belum` | Belum konfirmasi | Belum, Menunggu |
| `hadir` | Hadir | Datang, Ya |
| `tidak` | Tidak hadir | Tidak, Batal |

### 6.3 Pembayaran vendor

| Nilai | Label | Alias yang dipakai |
|---|---|---|
| `dp` | DP | Cicilan, Termin |
| `pelunasan` | Pelunasan | Lunas, Final |

### 6.4 Task terlambat

Labelnya "Terlambat", bukan "Overdue", karena "overdue" lebih sering dipakai untuk hutang dan terasa seperti tagihan.

---

## 7. Layar kosong

Setiap layar kosong menyebut apa yang belum ada, lalu memberi jalan keluar. Kalimat "Tidak ada data" tidak pernah dipakai.

| Layar | Teks |
|---|---|
| Daftar tugas | "Belum ada tugas. Mulai dari yang paling dekat dengan tanggal." |
| Anggaran | "Belum ada pos anggaran. Tambahkan dulutotal yang sudah direncanakan, lalu isi pembayarannya." |
| Vendor | "Belum ada vendor. Tambahkan vendor yang sudah kamu tanda tangani." |
| Pembayaran | "Belum ada pembayaran untuk vendor ini. Catat DP pertama di sini." |
| Tamu | "Belum ada tamu. Tambahkan nama satu per satu, atau tempel dari daftar yang sudah ada." |
| Undangan | "Belum ada undangan. Buat undangan, lalu bagikan tautannya ke tamu." |
| Rundown | "Belum ada acara. Tambahkan susunan acara, dari persiapan sampai acaranya selesai." |
| Info keluarga | "Belum ada pengumuman. Tulis satu pengumuman yang perlu dibaca semua orang." |
| Busana | "Belum ada barang busana. Tambahkan baju yang perlu dijahit atau disewa." |
| Pencarian | "Tidak ada yang cocok dengan pencarian itu." |

**Alasan kalimat kosong selalu dua kalimat.** Kalimat pertama menjelaskan keadaan, kalimat kedua memberi jalan keluar. Satu kalimat saja membuat orang berhenti di layar itu.

---

## 8. Pesan galat

Bentuknya sudah ditulis di [`docs/04-API-Contract.md`](04-API-Contract.md) bagian "Bentuk error". Yang ditulis di sini adalah isi pesannya.

### 8.1 Galat yang sering muncul

| Code | Pesan untuk user | Tombol |
|---|---|---|
| `VALIDATION_ERROR` | Pesan per field, misalnya "Tanggal harus di masa depan." | Tutup |
| `UNAUTHENTICATED` | "Sesi kamu sudah habis. Masuk lagi untuk melanjutkan." | Masuk lagi |
| `FORBIDDEN` | "Rencana ini bukan milik kamu." | Kembali |
| `NOT_FOUND` | "Data ini sudah tidak ada. Mungkin sudah dihapus." | Kembali |
| `CONFLICT` | "Data ini berubah di perangkat lain. Muat ulang supaya tidak menimpa." | Muat ulang |
| `RATE_LIMITED` | "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi." | Coba lagi |
| `INTERNAL_ERROR` | "Ada yang tidak beres di sisi kami. Coba lagi sebentar lagi." | Coba lagi |

**Alasan "di sisi kami" untuk galat server.** Pasangan tidak bisa memperbaiki galat server, dan menyebut "di sisi kami" jujur soal itu. Menyalahkan perangkat mereka hanya membuat mereka mencoba menyalakan ulang HP, yang tidak menolong.

### 8.2 Galat jaringan

| Keadaan | Teks | Banner atau dialog |
|---|---|---|
| Sinyal hilang saat menyimpan | "Perubahan disimpan di perangkat dan akan terkirim otomatis saat sinyal kembali." | banner |
| Sinyal hilang, tidak ada antrean | "Tidak ada koneksi. Coba lagi nanti." | banner |
| Timeout | "Koneksi terlalu lama. Coba lagi." | dialog |

### 8.3 Galat luring

| Keadaan | Teks | Tindakan |
|---|---|---|
| Antrean menumpuk | "Ada 12 perubahan yang belum terkirim. Buka Info jaringan untuk melihat." | banner |
| Antrean gagal lima kali | "Satu perubahan gagal dikirim dan perlu dikirim ulang manual." | dialog dengan tombol "Kirim ulang" |
| Batas antrean 200 | "Antrean penuh. Perubahan lama yang belum terkirim dibuang." | dialog |

---

## 9. Toast

Toast dipakai untuk hasil yang sudah selesai, bukan untuk memberi tahu yang sedang terjadi.

| Keadaan | Teks | Lama |
|---|---|---|
| Tersimpan | "Tersimpan" | 3 detik |
| Dihapus | "Dihapus" | 3 detik |
| Task ditandai selesai | "Tugas ditandai selesai" | 3 detik |
| Kehadiran diubah | "Kehadiran diubah" | 3 detik |
| Salin tautan | "Tautan tersalin" | 2 detik |
| Gagal | pesan galat, bukan toast | lihat bagian 8 |

**Alasan toast tidak punya tombol.** Toast yang perlu tindakan berarti pesan itu salah tempat. Pemotongan atau pembatalan harus berupa dialog, bukan toast dengan tombol.

---

## 10. Dialog konfirmasi

Dialog dipakai hanya kalau tindakan tidak bisa dibatalkan.

| Aksi | Judul | Isi | Tombol |
|---|---|---|---|
| Hapus tugas | Hapus tugas | "Tugas ini akan dihapus dari daftar." | Batal, Hapus |
| Hapus tamu | Hapus tamu | "Nama ini akan hilang dari daftar tamu." | Batal, Hapus |
| Hapus pembayaran | Hapus catatan pembayaran | "Jumlah yang sudah tercatat akan berubah." | Batal, Hapus |
| Keluar dari rencana | Keluar dari rencana | "Kamu tidak bisa melihat rencana ini lagi." | Batal, Keluar |
| Buang perubahan luring | Buang perubahan yang belum terkirim | "12 perubahan akan hilang." | Batal, Buang |

**Alasan tombol hapus ditulis ulang, bukan "Ya" atau "Hapus".** Kalau tombol kiri "Batal" dan kanan "Ya", pembacaan sepele jadi tidak sengaja menekan. Menulis ulang kata yang ada membuat layar yang salah mustahil ditekan.

**Alasan tidak ada dialog untuk tugas selesai.** Tandai selesai bisa dibatalkan dari daftar, jadi dialog di sini menambah satu langkah tanpa alasan.

---

## 11. Placeholder input

Placeholder bukan label. Kalau label belum ada, placeholder tetap dipakai, tapi tidak menggantikan label.

| Field | Placeholder | Alasan |
|---|---|---|
| Nama pasangan | Nama kamu dan pasangan | Contoh format, bukan pengganti nama |
| Nama tugas | Misalnya: Booking dekorasi | Memberi contoh konkret |
| Nama tamu | Nama lengkap tamu | Netral |
| Nama vendor | Nama vendor | Netral |
| Jumlah rupiah | 4500000 | Angka saja, pemformat dilakukan otomatis |
| Tanggal | Pilih tanggal | Netral |

**Alasan placeholder berbahasa contoh.** "Misalnya: Booking dekorasi" lebih berguna daripada "Tulis nama tugas", karena orang tahu harus mengetik apa.

---

## 12. Judul halaman di browser

| Layar | Judul | Pola |
|---|---|---|
| Beranda | Beranda | `{halaman} - Aisyah & Bagas` |
| Tugas | Tugas | `{halaman} - Aisyah & Bagas` |
| Vendor | Vendor | `{halaman} - Aisyah & Bagas` |

**Alasan nama pasangan di akhir, bukan di awal.** Di tab HP yang banyak terbuka, judul di ujung lebih mudah dibaca daripada di pangkal. Nama pasangan sebagai penanda plan, bukan sebagai produk.

---

## 13. Yang tidak ada naskahnya

| Teks yang tidak ditulis | Alasan |
|---|---|
| Email verifikasi | Fitur ini tidak ada di Fase 1. Lihat `docs/01-PRD.md` bagian scope. |
| Reset password | Email belum jadi kanal, jadi pesan error yang jujur lebih baik daripada email yang tidak sampai |
| Onboarding banyak slide | Menu pertama langsung ke Beranda, dengan satu kartu yang menjelaskan langkah berikutnya |
| Tooltip panjang | Ganti dengan teks yang selalu terlihat |
| Istilah Inggris di UI | Semua istilah ada di [`docs/15-Glosarium.md`](15-Glosarium.md) |

---

## 14. Judul halaman Laporan dan Bagikan

| Layar | Judul | Pola |
|---|---|---|
| Laporan | Laporan | `{halaman} - Aisyah & Bagas` |
| Bagikan | Bagikan laporan | `{halaman} - Aisyah & Bagas` |
| Cetak | Cetak laporan | `Cetak laporan - Aisyah & Bagas` |

Pola sama dengan halaman lain. Nama pasangan di akhir, bukan di awal.

---

## 15. Teks di layar Laporan

Judul bagian, bukan kalimat panjang. Laporan dibaca sambil berdiri di depan orang tua.

| Bagian | Judul | Keterangan di bawahnya |
|---|---|---|
| Judul | Aisyah & Bagas | 30 Juni 2026 |
| Hitung mundur | 142 hari lagi | Tanggal akad 4 Oktober 2025 |
| Uang | Batas Rp 40.000.000 | Terpakai Rp 24.500.000, sisa Rp 15.500.000 |
| Tugas | 28 selesai dari 63 | 4 harus minggu ini, 2 lewat tanggal |
| Tamu | 240 orang | 180 sudah konfirmasi, 60 belum |
| Rundown | Hari ini | 6 item, dari 08.00 sampai 21.00 |
| Vendor | 3 belum lunas | Rp 6.200.000 belum dibayar |

Angka di bawah judul memakai angka tabular, sama seperti halaman lain.

**Alasan judul bagian tidak pakai kalimat.** "Uang" lebih cepat dibaca daripada "Keadaan anggaran sampai hari ini". Yang dicari orang tua bukan kalimat lengkap, tapi kata kunci yang langsung mengarah ke bagiannya.

---

## 16. Teks di Bagikan

Tiga pilihan isi. Nama tombol menyebut panjangnya, bukan gayanya.

| Pilihan | Nama tombol | Isi |
|---|---|---|
| Ringkas | Bagikan ringkas | 12 sampai 16 baris |
| Lengkap | Bagikan lengkap | 40 sampai 60 baris |
| Tautan | Bagikan tautan | 3 baris, tanpa angka |

Teks yang dikirim dalam pilihan ringkas:

```text
Halo mama, ini laporan rencana sampai hari ini.

Hari-H: 30 Juni 2026, 142 hari lagi

Uang
Batas Rp 40.000.000
Terpakai Rp 24.500.000
Sisa Rp 15.500.000

Tugas
28 selesai dari 63, 4 harus minggu ini

Tamu
240 orang, 180 sudah konfirmasi

Lebih lengkap di tautan: https://aisyah.app/l/abc123XYZ
```

Teks yang dikirim dalam pilihan tautan saja:

```text
Laporan pernikahan Aisyah & Bagas bisa dilihat di sini:
https://aisyah.app/l/abc123XYZ
```

Nama pasangan dipakai apa adanya di sapaan. Server tidak tahu siapa yang membaca teks ini, jadi tidak menebak sapaan.

| Elemen | Teks |
|---|---|
| Judul pratinjau | Yang akan dikirim |
| Label kolom yang boleh diubah | Pesan tambahan |
| Placeholder kolom | Misalnya: Tolong dicek bagian uang |
| Pengingat angka | Angka dan tanggal sudah dikunci |
| Tombol kirim | Buka WhatsApp |
| Tombol batal | Batal |

**Alasan tombol kirim bukan "Kirim".** Yang terjadi setelah menekan bukan terkirim, tapi WhatsApp terbuka. Kalau tombolnya "Kirim", orang menekan lalu tidak tahu harus memilih kontak siapa.

**Alasan ada pengingat angka.** Pratinjau boleh diedit, dan tidak ada yang bisa mencegah orang mengira seluruh kolom bisa diedit. Satu baris pengingat lebih murah daripada laporan yang angkanya berbeda.

---

## 17. Teks di Cetak

| Elemen | Teks |
|---|---|
| Judul | Cetak laporan |
| Tombol | Cetak laporan |
| Keterangan | Pilih "Simpan sebagai PDF" di dialog cetak |

**Alasan tombol bukan "Buat PDF".** Yang terjadi adalah dialog cetak muncul. Kalau tombolnya "Buat PDF", orang menekan, melihat dialog, dan mengira aplikasinya tidak jalan.

Keterangan hanya satu baris dan selalu terlihat. Tidak ada cara cetak empat langkah.

---

## 18. Yang tidak ada naskahnya untuk Laporan

| Teks yang tidak ditulis | Alasan |
|---|---|
| Angka yang belum ada datanya | Angka tidak dikarang. Kalau belum ada datanya, bagiannya tidak tampil |
| Dukungan untuk laporan | Format yang dipakai sudah jelas dari bagian-bagiannya |
| Error khusus laporan | Pakai pesan galat umum di bagian 8 |
| Bahasa Inggris di laporan | Pakai istilah yang sudah ada di [`15-Glosarium.md`](15-Glosarium.md) |

---

## 19. Apa yang belum diputuskan

| Belum ada | Kenapa | Perlu siapa |
|---|---|---|
| Nama produk akhir | Ganti `Aisyah & Bagas` di satu file konfigurasi | Pemilik proyek |
| Sapaan yang dipakai: "kamu" atau "Anda" | Sekarang dokumen ini memakai "kamu". Kalau audiens lebih tua, ganti seluruh dokumen ini satu kali. | Pemilik proyek |
| Sapaan untuk TAMU di undangan | Undangan ditulis untuk penerima, bukan untuk pasangan, dan nadanya boleh lebih resmi | Pemilik proyek |

Tiga baris ini disengaja. Menulis keputusannya sekarang berarti menebak, dan menebak di sini lebih mahal daripada satu pertanyaan.
