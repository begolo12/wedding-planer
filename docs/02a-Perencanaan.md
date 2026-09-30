# 02a. Perencanaan

Empat modul yang dipakai paling sering. Semua P0.

---

## 01. Tanggal penting (P0)

Tanggal yang jadi patokan semua rencana lain. Kalau tanggal ini salah, semua pengingat jadi salah.

### Data yang disimpan

| Field | Tipe | Keterangan |
|---|---|---|
| `title` | teks | Contoh: "Akad nikah", "Resepsi", "Fitting Baju" |
| `date` | tanggal | Tanggal acara |
| `time` | waktu, opsional | Untuk acara yang punya jam |
| `type` | enum | `akad`, `resepsi`, `prewedding`, `adat`, `lainnya` |
| `isDayOf` | boolean | Tandai kalau ini hari-H |
| `notes` | teks, opsional | Catatan singkat, misalnya "rumah orang tua pasangan" |
| `reminderDays` | array angka | Kalau pengingat, berapa hari sebelumnya |

### Why perlu

Kadundung, siraman, akad, dan resepsi sering jatuh di tanggal berbeda. Kalau semuanya dianggap satu hari, pasangan akan salah Ingatkan orang.

### Minimal Version

- [ ] Tambah, edit, hapus tanggal penting
- [ ] Daftar tanggal penting diurutkan dari yang paling dekat
- [ ] Hari-H ditandai dengan jelas, dan warnanya berbeda dari tanggal lain
- [ ] Hitung mundur "berapa hari lagi" otomatis, dan hitungannya benar setelah hari-H lewat
- [ ] Pengingat locally di HP, dengan pengaturan waktu

---

## 02. Daftar tugas (P0)

Ini adalah inti aplikasi. Pasangan membuka ini hampir setiap hari.

### Data yang disimpan

| Field | Tipe | Keterangan |
|---|---|---|
| `title` | teks | Apa yang harus dikerjakan |
| `category` | enum | Lihat tabel kategori di bawah |
| `dueDate` | tanggal, opsional | Kalau kosong, tidak ada tenggat |
| `status` | enum | `belum`, `selesai` |
| `priority` | enum | `rendah`, `sedang`, `tinggi` |
| `notes` | teks, opsional | |
| `assignee` | enum, opsional | `saya`, `pasangan`, `keluarga` |
| `completedAt` | timestamp | Otomatis saat ditandai selesai |

### Kategori tugas

Kategori bukan sekadar label. Setiap kategori punya daftar tugas bawaan yang sudah dihitung biayanya dan waktunya, supaya pasangan tidak mulai dari halaman kosong.

| Kategori | Contoh isi |
|---|---|
| Administrasi | Surat pengantar RT/RW,KK, akta nikah, OFFSET, N1-N4, cek data orang tua |
| Pencarian venue | Listrik, air, toilet, akses mobil besar, arah untuk tamu |
| Vendor | Makeup, dekorasi, catering, dokumentasi, MC, organ tunggal, tenda |
| Sandang | Baju pengantin, baju adat, jas, kemeja, sepatu, aksesoris |
| Pelengkap | KUA, akad nikah, upacara adat, siraman, sesi foto, resepsi, pesta setelah resepsi |
| Tamu | Menentukan jumlah tamu, menghitung undangan, konfirmasi kehadiran, kado dan angpau |
`Hari-H` | Gladi, MC, briefing crew, recepti, persiapan venue |

### Why perlu

Pasangan tidak butuh aplikasi checklist generik. Mereka butuh checklist yang tahu bahwa di Indonesia ada KUA, ada siraman, ada mahar, ada angpau. Template bawaan inilah yang membuat produk ini beda dari aplikasi checklist luar negeri.

### Minimal Version

- [ ] Tambah, edit, hapus, tandai selesai
- [ ] Filter by kategori dan status
- [ ] Tugas tanpa tenggat dipisahkan dari tugas bertenggat, karena keduanya perilaku berbeda
- [ ] Tugas lewat ditandai berbeda secara visual, dengan warna status yang berbeda dari warna CTA
- [ ] Checklist bawaan per kategori bisa dimuat sekali, lalu diedit
- [ ] Urutan tugas di dalam kategori mengikuti urutan waktu yang benar, bukan urutan alfabet

---

## 03. Anggaran (P0)

### Data yang disimpan

| Field | Tipe | Keterangan |
|---|---|---|
| `name` | teks | Nama pos, misalnya "Catering" atau "Dekorasi pelaminan" |
| `category` | enum | `venue`, `catering`, `dekorasi`, `busana`, `dokumentasi`, `adat`, `lainnya` |
| `planned` | uang | Anggaran yang direncanakan |
| `paid` | uang | Terhitung otomatis dari modul pembayaran |
| `actual` | uang | Realisasi, diisi manual jika tidak ada pembayaran tercatat |

### Kategori anggaran

| Kategori | Isi tipikal |
|---|---|
| Venue | Sewa lokasi, uang muka, biaya tambahan |
| Catering | Katering, snack, drink, konsumsi tamu, gubuk |
| Dekorasi | Pelaminan, dekor pelaminan, dekor meja tamu, photobooth |
| Busana | Baju pengantin, beuty, aksesoris, makeup |
| Dokumentasi | Fotografer, videografer, album |
| Adat dan sjaran | Sinyal, sesaji, seserahan, pngg |
| Transport | Kendaraan, akomodasi keluarga jauh |
| Admisiones | KUA, admin,Checker\| lain |

### Why perlu

Ini fitur yang paling sering dipinta pasangan. Yang paling sering dikeluhkan adalah spreadsheet tidak tahu sudah bayar berapa.

### Minimal Version

- [ ] Tambah pos anggaran dengan nominal rencana
- [ ] Total anggaran, total terbayar, dan sisa terhitung otomatis dan terlihat di satu layar
- [ ] Sisa negatif ditandai jelas kalau anggaran terlampaui, dengan warna status yang berbeda dari CTA
- [ ] Persentase terpotong per kategori, dengan bar tipis tanpa chart yang berat
- [ ] Bisa export daftar anggaran ke PDF

---

## 04. Vendor dan pembayaran (P0)

Modul yang paling sering jadi sumber pertanyaan "sudah bayar belum". 

### Data vendor

| Field | Tipe | Keterangan |
|---|---|---|
| `name` | teks | Nama vendor atauiex nama usaha |
| `category` | enum | Sama dengan kategori anggaran |
| `contactName` | teks | Nama orang yang dihubungi |
| `phone` | teks | Nomor WhatsApp |
| `address` | teks | Alamat, untuk yang punya |
| `status` | enum | `calon`, `dibOOKED`, `selesai` |
| `notes` | teks | Catatan hasil negosiasi, termin, garansi |

### Data pembayaran

| Field | Tipe | Keterangan |
|---|---|---|
| `vendorId` | relasi | Vendor yang dibayar |
| `amount` | uang | Nominal |
| `paidAt` | tanggal | Kapan dibayar |
| `method` | enum | `transfer`, `tunai`, `kartu`, `ewallet` |
| `isFinal` | boolean | Tandai ini pembayaran terakhir |
| `proofUrl` | teks, opsional | Foto bukti transfer |
| `notes` | teks, opsional | Nomor invoice, termin |

### Why perlu

Riwayat pembayaran vendor adalah hal yang paling sering hilang di WhatsApp. Pairing pembayaran ke vendor membuat angka di modul anggaran selalu benar tanpa input manual dua kali.

### Minimal Version

- [ ] Tambah, edit, hapus vendor
- [ ] Catat pembayaran dengan vendor, nominal, tanggal, dan metode
- [ ] Pembayaran langsung terpakai ke total terbayar di modul anggaran, tanpa input ganda
- [ ] Tandai vendor sudah lunas
- [ ] Upload foto bukti transfer, dan foto bisa dibuka dari daftar
- [ ] Riwayat pembayaran per vendor, terurut dari yang terbaru

<!--NEXT-->
