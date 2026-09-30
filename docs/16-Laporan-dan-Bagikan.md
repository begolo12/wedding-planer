# 16. Laporan dan Bagikan

Aturan teknis untuk laporan keadaan, bagikan ke WhatsApp, dan PDF. Bentuk layarnya ada di [`12e-Wireframe-Laporan.md`](12e-Wireframe-Laporan.md). Teks yang muncul ada di [`14-Naskah-Teks.md`](14-Naskah-Teks.md).

---

## 1. Apa yang dibuat

| Fitur | Bentuk | Kenapa ada |
|---|---|---|
| Laporan | Halaman baca, satu layar | Pertanyaan "kondisinya bagaimana" dijawab di satu tempat |
| Bagikan ke WhatsApp | Teks ringkas plus tautan | Yang paling sering dipakai orang Indonesia |
| PDF | Dialog cetak bawaan | Dipakai untuk dibawa dan dicetak |

Tiga ini tidak bisa dipisah. Orang tua tidak akan membuka aplikasi, tapi mau tahu. Laporan menjawab tanpa perlu login, WhatsApp yang membaca, dan PDF untuk yang mau cetak.

---

## 2. Laporan

### Isinya

Laporan dijaga dari lima sumber data, tidak lebih:

| Bagian | Asal | Field |
|---|---|---|
| Judul | plans | Nama pasangan, tanggal |
| Hitung mundur | plans | Selisih tanggal dengan hari ini |
| Ringkasan uang | budget categories | Total, terpakai, sisa |
| Tugas | tasks | Selesai, wajib minggu ini, lewat |
| Tamu | guests | Jumlah orang, kursi, belum kena undangan |
| Rundown | rundown items | Item hari ini |
| Vendor | vendors, payments | Yang belum lunas |

Kalau ada bagian yang butuh join dari lima tabel sekaligus, bagian itu dipindah ke endpoint yang sudah ada, bukan ditambah kueri baru.

### Semua angka dihitung ulang

Tidak ada angka yang disimpan. Total, sisa, jumlah tamu, dan jumlah kursi selalu dihitung dari data, supaya angka di laporan tidak pernah berbeda dengan angka di layar lain.

Alasannya pasangan akan membandingkan. Kalau angka di laporan beda dengan angka di halaman anggaran, salah satu dianggap salah, dan biasanya laporan yang disalahkan.

---

## 3. Bagikan ke WhatsApp

### Prinsip: server yang menyusun teks

Teks WhatsApp dibGenerate di server, bukan di client. Alasannya tiga:

| Alasan | Kenapa |
|---|---|
| Satu sumber angka | Client dan server tidak bisa punya formatter berbeda |
| Bisa dipakai tanpa app | Semua orang punya WhatsApp |
| Teksnya bisa diuji | Ada satu fungsi yang bisa diuji sendiri |

Formatting angka jadi satu fungsi: `formatRupiah`. Dipakai di halaman, di laporan, di teks WhatsApp, dan di PDF. Kalau ada empat tempat yang menulis nominal, cepat atau lambat satu tempat berbeda.

### Isi teks

Tiga pilihan isi, sesuai pembacanya:

| Pilihan | Panjang | Untuk siapa |
|---|---|---|
| Ringkasan | 12 sampai 16 baris | Orang tua yang mau tahu kondisi |
| Lengkap | 40 sampai 60 baris | Pasangan yang mau semua angka |
| Tautan saja | 3 baris | Yang akan membuka sendiri |

Teks ringkas sudah cukup untuk menjawab pertanyaan "uang cukup atau tidak" dan "tugasnya tertinggal apa". Yang lebih panjang sudah tautan, dan tautan isinya sama.

### Format angka di teks

```
Batas Rp 40.000.000
Terpakai Rp 24.500.000
Sisa Rp 15.500.000
```

Rupiah ditulis penuh, pakai titik, di teks WhatsApp juga sama seperti di aplikasi. Teks yang bisa disalin harus bisa langsung dipakai.

### Bagikan tanpa library

Tidak ada pustaka berbagi. Yang dipakai:

| Kebutuhan | Cara |
|---|---|
| Buka WhatsApp | Tautan `https://wa.me/?text=...` |
| Pilih kontak | User pilih kontak sendiri sebelum menekan tombol |
| Kirim | WhatsApp yang mengirim, bukan aplikasi |

Tautan `wa.me` sudah didukung semua WhatsApp, HP maupun desktop. Yang dikirim ke server cuma teksnya, tidak ada kontak yang diunggah.

### Batas

| Batas | Nilai | Kenapa |
|---|---|---|
| Panjang teks | 800 karakter | Di atas ini potong di WhatsApp |
| Panjang pratinjau | 4.000 karakter | Pratinjau tidak boleh melebihi layar |
| Jumlah tautan | 1 | Dua tautan selalu satu diabaikan |
| Jumlah tautan per plan | 5 | Cukup untuk keluarga besar, cukup untuk menahan tautan yang bocor |

Lima tautan per plan bukan sembarang. Tiap tautan punya kunci sendiri, jadi mencabut satu tidak mematikan yang lain. Kalau satu saja, mencabut satu mematikan semua keluarga besar.

### Mengubah teks sebelum kirim

Teks boleh diubah, tapi hanya bagian kalimat. Angka, tanggal, dan tautan tidak boleh diubah.

Alasannya laporan ini sering dibaca orang tua tanpa ada yang menjelaskan. Kalau angka bisa diedit, teks jadi tidak dapat dipercaya, dan justru lebih buruk daripada tidak dikirim.

Validasi ada di server. Client hanya menampilkan pratinjau, dan server yang memutuskan mana yang boleh keluar.

---

## 4. Tautan berbagi

### Mekanisme yang dipakai

Tautan berbagi sudah ada di [`04-API-Contract.md`](04-API-Contract.md) dan [`05-IA-dan-Layar.md`](05-IA-dan-Layar.md) bagian 12. Laporan tidak membuat cara kedua, dia memakai yang sudah ada.

Yang berubah cuma satu: tautan yang dibuat dari halaman Laporan otomatis mengarah ke Laporan, bukan ke Info untuk Keluarga. Field `target` yang membedakan keduanya.

| Tautan | Isi |
|---|---|
| Info untuk Keluarga | Jadwal, lokasi, dress code |
| Laporan | Semua isi laporan |

### Tautan milik plan

Tautan dimiliki plan, bukan orang. Kalau pasangan berpisah atau berganti tangan, tautan ikut ke plan yang sama dan keluarga besar tidak kehilangan akses.

### Masa berlaku

Tidak ada masa berlaku, dan ini keputusan yang disengaja. Alasannya ada di satu kalimat: tidak ada yang ingin gagal membuka di hari yang paling penting.

Kalau nanti dibutuhkan masa berlaku, tambahkan field nullable, dan jangan mengubah tautan yang sudah dibagikan.

---

## 5. PDF

### Keputusan

PDF dibuat lewat dialog cetak bawaan browser atau sistem, dengan CSS `@media print`. Tidak ada pustaka.

Ini menjawab lima pertanyaan di [`06-Stack-dan-Batas.md`](06-Stack-dan-Batas.md) bagian 5:

| Pertanyaan | Jawaban |
|---|---|
| Cuma benar kalau bertahan sampai sepuluh ribu pengguna? | Tidak |
| Phase 1 benar-benar butuh? | Ya, tapi bentuk paling sederhana sudah cukup |
| Biaya pemeliharaan | Nol, tidak ada kode baru yang dirawat |
| Kalau dibuang, biaya pencabutan | Menghapus satu blok CSS |
| Bisakah diselesaikan tanpa teknologi baru? | Bisa, dan itulah yang dipakai |

Kalau jawabannya adalah "bisa", pustaka tidak dipakai. Kalau jawabannya "tidak bisa", baru pustaka itu masuk perhitungan.

### Kenapa bukan pustaka

| Pustaka | Yang ditambahkan | Yang hilang |
|---|---|---|
| PDF di server | Pustaka besar, RAM besar, font harus diinstal, layout harus dijaga dua kali | Kemampuan mencetak dari browser |
| PDF di client | Pustaka besar di bundle, lambat di HP tua | Kemampuan cetak dari browser |
| `@media print` | Nol | Tidak ada yang hilang |

Yang hilang dengan cara ini adalah pilihan seperti nomor halaman otomatis dan daftar isi. Laporan ini tiga halaman dan tidak butuh keduanya.

### Yang harus tetap jalan

| Yang wajib | Kenapa |
|---|---|
| Isi halaman sama persis dengan layar | Kalau beda, orang percaya salah |
| Warna teks minimal hitam | Sering dicetak hitam putih diFotocopy |
| Tidak ada elemen yang terpotong | Kotak yang terpotong bikin orang salah baca |
| Nomor halaman di kaki | Kertas yang tercecer masih urut |
| Margin 20mm | Kebanyakan printer rumah punya margin itu |

### Ukuran kertas

A4 saja. Letter dipakai di Amerika, dan produk ini untuk Indonesia.

Kalau di luar A4 ada yang terpotong, kolom yang panjang dikecilkan supaya muat, bukan diperkecil semua halaman.

### Font

Font aplikasi dipakai apa adanya, tidak ada font khusus cetak. Kalau_report dicetak dengan font lain, bentuk halaman di layar dan di kertas jadi berbeda, dan itu membingungkan.

---

## 6. Yang tidak ada

| Tidak ada | Alasan |
|---|---|
| Grafik di PDF | Yang perlu dijawab sudah dijawab tabel |
| Pilihan ukuran kertas | A4 cukup, dan pilihan lain menambah pekerjaan tanpa pengguna |
| Nomor halaman otomatis | Tiga halaman, dan kawatinya manual |
| Daftar isi | Tiga halaman, daftar isi lebih panjang dari isinya |
| Menyimpan riwayat laporan | Yang disimpan sudah bisa diunduh |
| Laporan sebagai gambar | Watermark dan tidak bisa dibaca mesin |
| Bagikan otomatis ke semua kontak | Aplikasi tidak boleh mengirim pesan tanpa orang menekan tombol |
| Template laporan | Satu bentuk sudah cukup untuk semua plan |

---

## 7. Yang harus diuji

| Yang diuji | Cara | Hasil yang diharapkan |
|---|---|---|
| Angka sama dengan halaman lain | Bandingkan laporan, anggaran, dan teks WhatsApp | Ketiganya identik |
| Teks tidak melebihi batas | Kirim ringkasan dan lengkap | Masing-masing di bawah batas |
| Pratinjau bisa diedit | Ubah kalimat, kirim | Kalimat berubah, angka tidak |
| Tautan bisa dimatikan | Matikan satu dari lima tautan | Yang lain masih jalan |
| Tautan dibaca tanpa login | Buka tautan di browser tanpa masuk | Isi tampil |
| PDF jalan tanpa sinyal | Matikan jaringan, buat PDF | PDF tetap jadi |
| PDF muat di A4 | Cetak ke A4 | Tidak ada yang terpotong |
| PDF terbaca hitam putih | Cetak grayscale | Semua angka terbaca |
| Bagikan tidak berisi kontak | Periksa yang dikirim ke server | Cuma teks |
| Tamu banyak | Teks dari 3.000 tamu | Tidak lebih dari batas |

Jumlah tamu yang besar ada di daftar itu karena laporan-laporan pernah membeku karena menggabungkan terlalu banyak data di satu layar.
