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
| Jam di teks tampil | `07.00` | `07:00:00`, `7.00` |
| Tanggal dan jam bersama | `30 Juni 2027 jam 10.00` | `30 Juni 2027 jam 10:00:00` |
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
| Beranda | Muat checklist | Muat template |
| Beranda | Catat Pengeluaran | Tambah pengeluaran |
| Beranda | Tamu Baru | Tambah |
| Beranda | Bagikan | Bagikan tautan |
| Beranda | Cetak laporan | Buat PDF |
| Beranda | Lihat rundown | Buka rundown |
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

| Aksi | Nama | Bukan |
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
| Submit | Simpan | "Submit" terasa seperti formulir kantor |
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

Label di bawah adalah label yang benar-benar dipakai di `src/components/nav.tsx`. Dulu dokumen ini menulis "Lainnya" dan "Pengaturan"; dua label itu diganti karena kode sudah memakai "Anggaran", "Vendor", "Laporan", dan "Akun", dan `docs/05-IA-dan-Layar.md` bagian 3 serta keputusan navigasi di `17-Rencana-Build.md` bagian 2 memutuskan empat item bawah tanpa "Lainnya". Kalau pemilik produk lebih suka "Pengaturan", itu perubahan di `src/components/nav.tsx` (berkas pemilik A2), bukan perubahan dokumen ini.

| Label | Alasan |
|---|---|
| Beranda | Bahasa sehari-hari, bukan "dashboard" |
| Rencana | Payung untuk tanggal, tugas, dan anggaran |
| Anggaran | Total, terpakai, dan sisa, karena paling sering ditanya |
| Tamu | Payung untuk daftar tamu dan undangan |
| Hari-H | Payung untuk rundown acara |
| Vendor | Daftar vendor dan pembayaran |
| Laporan | Laporan keadaan dan bagikan |
| Akun | Profil, tema, dan cadangan data, di letak paling bawah karena jarang dibuka |

### 5.2 Bottom bar di HP

Empat label saja, karena lebih dari empat membuat tulisan mengecil di layar 360px. Ini keputusan yang tertulis di `17-Rencana-Build.md` bagian 2 dan dijalankan oleh kode.

Urutan: Beranda, Rencana, Anggaran, Tamu.

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

### 6.5 Kelompok waktu daftar tugas

Daftar tugas dikelompokkan per waktu, bukan per kategori. Urutannya tetap:
paling mendesak dulu.

| Nilai di kode | Label | Isi |
|---|---|---|
| `lewat` | Lewat jatuh tempo | Tenggatnya sudah lewat dan belum selesai |
| `hariIni` | Hari ini | Tenggatnya hari ini |
| `mingguIni` | Minggu ini | Tenggatnya setelah hari ini, masih sampai hari Minggu pekan ini |
| `setelahMingguIni` | Setelah minggu ini | Tenggatnya punya tanggal dan jatuh setelah pekan ini |
| `tanpaTenggat` | Belum ada tenggat | Tugas yang benar-benar belum punya tanggal |
| `selesai` | Sudah selesai | Tugas berstatus selesai, disembunyikan secara bawaan |

**Alasan `setelahMingguIni` dipisah.** Sebelumnya tugas bertenggat jauh ikut masuk
"Belum ada tenggat", jadi barisnya menampilkan tanggal di bawah judul yang
berbunyi tidak ada tenggat. Label "Belum ada tenggat" sekarang hanya untuk tugas
tanpa tanggal, dan tugas bertanggal jauh punya judulnya sendiri.

---

## 7. Layar kosong

Setiap layar kosong menyebut apa yang belum ada, lalu memberi jalan keluar. Kalimat "Tidak ada data" tidak pernah dipakai.

| Layar | Teks |
|---|---|
| Daftar tugas | "Belum ada tugas. Mulai dari yang paling dekat dengan tanggal." |
| Anggaran | "Belum ada pos anggaran. Tambahkan dulu total yang sudah direncanakan, lalu isi pembayarannya." |
| Vendor | "Belum ada vendor. Tambahkan vendor yang sudah kamu tanda tangani." |
| Pembayaran | "Belum ada pembayaran untuk vendor ini. Catat DP pertama di sini." |
| Tamu | "Belum ada tamu. Tambahkan nama satu per satu, atau tempel dari daftar yang sudah ada." |
| Undangan | "Belum ada undangan. Buat undangan, lalu bagikan tautannya ke tamu." |
| Rundown | "Belum ada acara. Tambahkan susunan acara, dari persiapan sampai acaranya selesai." |
| Info keluarga | "Belum ada pengumuman. Tulis satu pengumuman yang perlu dibaca semua orang." |
| Busana | "Belum ada barang busana. Tambahkan baju yang perlu dijahit atau disewa." |
| Pencarian | "Tidak ada yang cocok dengan pencarian itu." |
| Laporan | "Belum ada isi untuk dilaporkan. Isi dulu tugas, anggaran, atau tamu, lalu laporan ini terisi sendiri dari data itu." |

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
| Cabut tautan pengumuman | Cabut tautan pengumuman | "Tautan lama tidak bisa dibuka lagi. Tautan baru dibuat untuk dibagikan ulang." | Batal, Cabut |
| Hapus akun | Hapus akun | "Semua rencana dan data kamu akan dihapus permanen. Masukkan kata sandi untuk mengonfirmasi." | Batal, Hapus akun |
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
| Beranda | Beranda | `{halaman} - Rapi Nikah` |
| Tugas | Tugas | `{halaman} - Rapi Nikah` |
| Vendor | Vendor | `{halaman} - Rapi Nikah` |

**Alasan nama produk di akhir, bukan di awal.** Di tab HP yang banyak terbuka, judul di ujung lebih mudah dibaca daripada di pangkal. Nama produk dipakai sebagai penanda aplikasi, bukan nama pasangan, karena metadata halaman harus bisa dirender sebelum tahu siapa yang masuk.

---

## 13. Yang tidak ada naskahnya

| Teks yang tidak ditulis | Alasan |
|---|---|
| Email verifikasi | Fitur ini tidak ada di Fase 1. Lihat `docs/01-PRD.md` bagian scope. |
| Reset password | Email belum jadi kanal, jadi pesan error yang jujur lebih baik daripada email yang tidak sampai |
| Langkah pertama banyak slide | Menu pertama langsung ke Beranda, dengan satu kartu yang menjelaskan langkah berikutnya |
| Tooltip panjang | Ganti dengan teks yang selalu terlihat |
| Istilah Inggris di UI | Semua istilah ada di [`docs/15-Glosarium.md`](15-Glosarium.md) |

---

## 14. Judul halaman Laporan dan Bagikan

| Layar | Judul | Pola |
|---|---|---|
| Laporan | Laporan | `{halaman} - Rapi Nikah` |
| Bagikan | Bagikan laporan | `{halaman} - Rapi Nikah` |
| Cetak | Cetak laporan | `Cetak laporan - Rapi Nikah` |

Pola sama dengan halaman lain. Nama pasangan di akhir, bukan di awal.

---

## 15. Teks di layar Laporan

Judul bagian, bukan kalimat panjang. Laporan dibaca sambil berdiri di depan orang tua.

| Bagian | Judul | Keterangan di bawahnya |
|---|---|---|
| Judul | Aisyah & Bagas | 30 Juni 2026 |
| Hitung mundur | 371 hari lagi | Tanggal pernikahan 30 Juni 2026 |
| Uang | Batas Rp 40.000.000 | Terpakai Rp 24.500.000, sisa Rp 15.500.000 |
| Tugas | 28 selesai dari 63 | 4 harus minggu ini, 2 lewat tanggal |
| Tamu | 312 orang | 150 kursi, 54 belum konfirmasi |
| Rundown | Hari ini | 4 item, dari 07.00 sampai 13.00 |
| Vendor | 2 belum lunas | Rp 17.000.000 belum dibayar |

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

Hari-H: 30 Juni 2026, 371 hari lagi

Uang
Batas Rp 40.000.000
Terpakai Rp 24.500.000
Sisa Rp 15.500.000

Tugas
28 selesai dari 63, 4 harus minggu ini

Tamu
312 orang, 150 kursi, 54 belum konfirmasi

Lebih lengkap di tautan: https://aisyah.app/bagikan/abc123XYZ
```

Teks yang dikirim dalam pilihan tautan saja:

```text
Laporan pernikahan Aisyah & Bagas bisa dilihat di sini:
https://aisyah.app/bagikan/abc123XYZ
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

Blok "TAMU KEPADA" yang dulu digambar di `12e-Wireframe-Laporan.md` bagian 2 tidak dipakai. Kontak dipilih di WhatsApp, sesuai `16-Laporan-dan-Bagikan.md` bagian 3.

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
| Sapaan yang dipakai: "kamu" atau "Anda" | Sekarang dokumen ini memakai "kamu". Kalau audiens lebih tua, ganti seluruh dokumen ini satu kali. | Pemilik proyek |
| Sapaan untuk TAMU di undangan | Undangan ditulis untuk penerima, bukan untuk pasangan, dan nadanya boleh lebih resmi | Pemilik proyek |

Dua baris ini disengaja. Menulis keputusannya sekarang berarti menebak, dan menebak di sini lebih mahal daripada satu pertanyaan. Nama produk sudah diputuskan ("Rapi Nikah"), jadi barisnya dihapus dari daftar ini.

---

## 20. Teks yang ditambahkan 2026-10-04

Teks di bawah ditambahkan bersamaan dengan perbaikan istilah dan tampilan. Alasannya ditulis singkat per kelompok.

### 20.1 Layar tamu dan laporan

| Tempat | Teks | Bukan |
|---|---|---|
| Beranda, judul kartu | Tugas | Checklist Rencana |
| Beranda, pil | Tidak hadir | Batal |
| Beranda, pil | Belum konfirmasi hadir | Belum Jawab |
| Tamu, label ringkasan | Total tamu terdata | Total undangan terdata |
| Tamu, jumlah per kategori | undangan | baris |
| Tamu, isian | Status kehadiran | Status kehadiran (RSVP) |
| Laporan, ringkasan | Total tamu (orang) | Perkiraan hadir (orang) |
| Laporan, ringkasan | Sudah pasti hadir (kursi) | Pasti hadir (kursi) |
| Laporan, baris | Belum konfirmasi hadir | Belum konfirmasi RSVP |
| Laporan, baris | Tamu belum diundang | Undangan belum dikirim |
| Tugas, dialog | Kategori tugas | Kategori checklist |
| Bagikan | tautan baca-saja | link baca-saja |
| Info keluarga | Audiens | Audien |
| Info keluarga | kode busana | dresscode |

**Alasan satuan.** Satu angka punya satu satuan. Undangan untuk jumlah baris, orang untuk jumlah jiwa, kursi untuk yang sudah pasti hadir. Angka "kalau semua hadir" tidak dipakai karena ikut menghitung tamu yang sudah menyatakan tidak hadir. Selengkapnya di [`15-Glosarium.md`](15-Glosarium.md) bagian 8.

**Alasan "tidak hadir".** "Batal" mudah dibaca sebagai membatalkan sesuatu, padahal maksudnya tamu menyatakan tidak datang. Layar Tamu sudah memakai "Tidak hadir", jadi layar Beranda disamakan.

### 20.2 Tombol "Muat checklist"

Tombol "Muat checklist" dan "Muat checklist bawaan" tetap ditulis begitu sesuai bagian 3.1. Yang diganti cuma label dialog "Kategori checklist" menjadi "Kategori tugas", supaya bendanya jelas.

### 20.3 Layar Busana

| Elemen | Teks |
|---|---|
| Label ringkasan | Total biaya busana |
| Tombol | Perbarui pos Busana / Buat pos Busana |
| Judul konfirmasi | Masukkan biaya busana ke anggaran |
| Isi konfirmasi, pos sudah ada | "Pos anggaran bernama Busana akan diisi Rp X. Nilainya diganti, bukan ditambah, supaya tidak terhitung dua kali." |
| Isi konfirmasi, pos belum ada | "Pos anggaran baru bernama Busana akan dibuat dengan nilai Rp X." |
| Tombol konfirmasi | Ganti nilai / Buat pos |

**Alasan nilai diganti.** Kalau ditambahkan, menekan tombol dua kali membuat biaya busana tercatat dobel di anggaran.

### 20.4 Halaman Kebijakan Privasi

| Elemen | Teks |
|---|---|
| Judul halaman dan tab | Kebijakan Privasi |
| Centang di layar Daftar | "Saya & pasangan setuju dengan Kebijakan Privasi Rapi Nikah" |
| Judul bagian | Data yang dikumpulkan dan untuk apa, Yang tidak kami lakukan, Hak kamu menurut UU PDP, Berapa lama data disimpan, Cara menghubungi pemilik produk |
| Tombol | Kembali ke pendaftaran, Masuk |

**Alasan tautan bisa diklik.** Dulu teksnya "Syarat & Kebijakan Manis" dan tidak bisa dibuka, karena halamannya belum ada. Sekarang teksnya menunjuk ke halaman `/kebijakan` yang benar-benar ada dan bisa dibuka tanpa masuk.

### 20.5 Kaki halaman cetak

| Elemen | Teks |
|---|---|
| Kaki cetak | "Dicetak dari rencana {nama pasangan}" dan tanggal cetak |

**Alasan tanpa nomor halaman.** Nomor halaman otomatis tidak bisa dibuat lewat CSS saja. Keputusan lengkapnya di [`16-Laporan-dan-Bagikan.md`](16-Laporan-dan-Bagikan.md) bagian 5.

### 20.6 Akun

Hitung mundur di Akun memakai tanggal hari-H yang sama dengan Beranda dan Laporan, yaitu milestone yang ditandai hari-H bila ada. Teksnya tidak berubah.

---

## 21. Teks yang ditambahkan 2026-10-04, putaran data tamu

Tanda tangan dari pekerja data sudah final. Porsi katering, kursi, sisi keluarga, dan tanggal kirim undangan sekarang tersedia dari server, jadi teks di bawah ditambahkan.

### 21.1 Layar Tamu

| Tempat | Teks |
|---|---|
| Ringkasan | Perkiraan porsi katering |
| Ringkasan | Kursi yang perlu disiapkan |
| Kotak status | Sudah pasti hadir |
| Kotak status | Belum konfirmasi |
| Kotak status | Tidak hadir |
| Ringkasan atas | "{baris} undangan, {hadir} orang sudah pasti hadir." |
| Saringan kehadiran | Semua kehadiran, Belum konfirmasi, Hadir, Tidak hadir |
| Saringan sisi | Semua pihak, Pihak pria, Pihak wanita, Bersama |
| Saringan undangan | Semua undangan, Undangan sudah dikirim, Belum dikirim |
| Baris tamu | "Undangan {tanggal}" atau "Belum diundang" |
| Tombol per baris | Tandai terkirim / Batalkan kirim, dengan nama aksesibel "Tandai undangan terkirim untuk {nama tamu}" |
| Tombol borongan | Tandai semua undangan terkirim |
| Judul konfirmasi | Tandai undangan terkirim |
| Isi konfirmasi | "{n} undangan yang belum punya tanggal kirim akan ditandai terkirim hari ini. Baris yang sudah pernah ditandai tidak diubah." |
| Tombol konfirmasi | Ya, tandai semua |
| Formulir | Pihak / Sisi keluarga, dengan pilihan Pihak pria, Pihak wanita, Bersama |

**Alasan "Belum konfirmasi" tanpa "RSVP".** Semua istilah Inggris di layar sudah diganti; RSVP ada di [`15-Glosarium.md`](15-Glosarium.md) bagian 7 sebagai kata yang tidak dipakai. Isi formulir kehadiran tetap dari `LABEL_STATUS_HADIR`.

**Alasan sisi jadi pilihan tetap.** Kontrak sekarang menolak teks bebas dengan 422, jadi kolomnya harus dropdown dari `SISI_TAMU`. Ada pilihan "Belum dipilih" supaya data lama yang sisinya kosong tidak dipaksa berubah saat disimpan ulang.

**Alasan tombol borongan.** Menandai satu per satu tidak praktis untuk daftar besar. Endpoint borongan hanya mengisi baris yang belum punya tanggal, jadi tanggal kirim yang sudah dicatat tidak tertimpa.

### 21.2 Beranda

| Tempat | Teks |
|---|---|
| Kartu Konfirmasi Tamu | Angka besar "perkiraan porsi katering" |
| Pil | "{hadir} Hadir", "{belumKonfirmasi} Belum konfirmasi hadir", "{tidakHadir} Tidak hadir" |

### 21.3 Laporan

| Tempat | Teks |
|---|---|
| Ringkasan tamu | Perkiraan porsi katering, Kursi perlu disiapkan |
| Baris | Total tamu, Sudah pasti hadir, Belum konfirmasi, Tidak hadir, Tamu belum diundang |
| Rincian per pihak | Pihak pria, Pihak wanita, Bersama |

### 21.4 Layar Tanggal Penting

| Tempat | Teks |
|---|---|
| Formulir | Tautan undangan (opsional) |
| Pesan galat | "Tautan undangan harus dimulai dengan http:// atau https://." |
| Baris acara | Buka tautan undangan |

### 21.5 Akun dan halaman Kebijakan

| Tempat | Teks |
|---|---|
| Akun, cadangan | "Unduh seluruh data rencanamu, termasuk nama dan nomor tamu, ke satu berkas JSON supaya kamu selalu punya salinannya." |
| Kebijakan, hak Ekspor | "Tombol cadangan di layar Akun mengunduh seluruh data rencanamu sebagai satu berkas JSON, termasuk daftar nama dan nomor tamu. Nama dan email akunmu sendiri tidak ikut di berkas itu karena bukan bagian dari rencana." |

**Alasan kalimat diperbarui.** Tombol cadangan pindah ke `GET /api/plans/{planId}/ekspor`, yang memuat baris tamu apa adanya. Kalimat lama cuma janji "seluruh data rencana" tanpa menyebut nomor tamu, jadi bisa dibaca lebih atau kurang dari yang benar-benar diunduh.

### 21.6 Label yang diambil dari konstanta

Metode bayar `qris` dan kategori anggaran `administrasi` tidak ditulis ulang di layar. Layar pembayaran vendor memetakan `METODE_BAYAR`, jadi label "QRIS" muncul sendiri. Peta warna sebaran anggaran ditambah satu warna karena jumlah kategori bertambah dari delapan jadi sembilan.
