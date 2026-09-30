# 12a. Wireframe Inti

Layar yang dipakai hampir setiap hari: beranda, daftar tugas, tanggal penting, akun, dan luring.

Tanda dan aturan umum ada di [`12-Wireframe.md`](12-Wireframe.md).

---

## 1. Beranda

Bukan empat kartu angka. Beranda adalah satu susunan: garis waktu di kiri, anggaran di kanan. Di HP dua bagian itu jadi satu kolom, timeline di atas.

### Mobile

```text
+--------------------------------+
|  Aisyah & Bagas                |
|  30 Juni 2026       371 hari  |
+--------------------------------+
| RUNDOWN HARI INI                |
|                                |
| 07.00  Akad nikah              |
|        Kantor Urusan Agama      |
| 08.30  Sungkeman               |
|        Rumah kedua orang tua   |
| 10.00  Resepsi                 |
| 13.00  Makan siang             |
|                                |
| [ Lihat rundown ]              |
+--------------------------------+
| UANG SISA                      |
|                                |
| Sisa anggaran     Rp 15.500.000|
|                                |
| Terpakai 62 persen dari          |
| Rp 40.000.000                   |
| [bar]###############.....      |
|                                |
| Lewat jatah        1 pos       |
| Belum ada pembayaran  1 vendor |
|                                |
| [ Lihat anggaran ]             |
+--------------------------------+
| MINGGU INI                     |
|                                |
| ( ) Sewa venue          20 Mei |
| ( ) Pesan dekorasi      22 Mei |
| (o) Daftar KUA          18 Mei |
| ( ) Minta countright    22 Mei |
|                                |
| [ Lihat semua tugas ]           |
+--------------------------------+
| Beranda  Rencana  Anggaran  ^  |
|           Tamu              Tamu|
+--------------------------------+
```

Alasan urutannya: rundown dulu karena itu yang dipakai di hari-H, uang kedua karena paling sering ditanyakan pasangan, tugas ketiga karena bisa dibaca lain waktu.

### Desktop

```text
+----------------------------------------------------------------------+
| Aisyah & Bagas                        [ Muat checklist ] [ Bagikan ]|
| 30 Juni 2026                                        Tema  [Terang] |
+----------------------------------------------------------------------+
| RUNDOWN HARI INI          | UANG SISA                 | MINGGU INI   |
|                           |                           |             |
| 07.00  Akad nikah         | Sisa     Rp 15.500.000    | ( )         |
|        Kantor Urusan      | Terpakai 62 persen       |   Sewa      |
|        Agama             | [bar]#############        |   venue     |
| 08.30  Sungkeman          | Lewat jatah      1 pos    |   20 Mei    |
|        Rumah kedua        | Belum bayar      1 vendor | (o)         |
|        orang tua          |                           |   Daftar    |
| 10.00  Resepsi            | [ Lihat anggaran ]        |   KUA       |
| 13.00  Makan siang       |                           |   18 Mei    |
|                           |                           | ( )         |
| [ Lihat rundown ]        |                           |   Minta     |
|                           |                           |   countright|
|                           |                           |   22 Mei    |
+----------------------------------------------------------------------+
| Beranda    Rencana    Anggaran    Tamu    Vendor    Tanggal    Lapor  |
+----------------------------------------------------------------------+
```

Kolom tengah ada karena anggaran adalah pertanyaan yang paling sering muncul. Kalau tiga kolom dipakai, angka selalu hilang.

---

## 2. Daftar Tugas

### Mobile

```text
+--------------------------------+
|  Rencana               [Cari] |
+--------------------------------+
| [ Semua ] [ Minggu ini ]        |
| [ Belum ] [ Selesai ]           |
+--------------------------------+
| MINGGU INI                     |
|                                |
| (o) Daftar KUA          18 Mei |
|    _sortir berkas dan fotokopi |
|     Bpk Budi                  |
| ( ) Sewa venue          20 Mei |
|     Rp 14.500.000              |
| ( ) Pesan dekorasi      22 Mei |
|     Buana Dekorasi             |
| ( ) Minta countright    22 Mei |
|                                |
| BULAN INI                      |
|                                |
| ( ) Fitting dress       10 Jun |
| ...                            |
|                                |
|        [ Muat lebih ]           |
+--------------------------------+
|                                |
| Beranda  Rencana  Anggaran  ^  |
|           Tamu              Tamu|
+--------------------------------+
```

Grupnya waktu, bukan kategori. Orang lebih sering bertanya "minggu ini apa", bukan "kategori apa".

Tugas yang punya nominal menampilkan nominalnya, supaya pasangan tahu tugas itu sudah menggerakkan uang, bukan cuma daftar.

Baris yang punya catatan vendor menampilkan nama vendor, supaya tidak perlu buka vendor dulu untuk tahu tugas ini milik siapa.

### Kosong

```text
+--------------------------------+
|  Rencana                       |
+--------------------------------+
|        Belum ada tugas          |
|                                |
|   Mulai dari checklist bawaan  |
|   supaya tidak perlu menulis   |
|   semuanya dari nol.           |
|                                |
|   [ Muat checklist ]           |
|   [ Tulis sendiri ]            |
+--------------------------------+
```

---

## 3. Tambah tugas

Layar penuh, bukan modal. Di HP, layar penuh lebih enak daripada pop up kecil.

```text
+--------------------------------+
| <  Tambah tugas                |
+--------------------------------+
| Apa yang harus dikerjakan      |
| [ Bayar DP dekorasi         ]  |
|                                |
| Kapan                          |
| [ 22 Mei 2026              v ] |
|                                |
| Untuk siapa                    |
| [ Saya                   v ]   |
| [ Saya ] [ Pasangan ] [Keluarga|
|                                |
| Prioritas                      |
| ( ) Rendah                     |
| (o) Sedang                     |
| ( ) Tinggi                     |
|                                |
| Kategori                       |
| [ Vendor                    v ] |
|                                |
| Nominal                        |
| [ Rp 4.000.000             ]   |
|                                |
| Catatan                        |
| [ Bawa BPKB, cek warna tema  ]  |
|                                |
+--------------------------------+
| [ Batal ]      [ Simpan tugas ]|
+--------------------------------+
```

Nominal ada di form tugas karena tugas dan uang tidak bisa dipisah. Kalau tugas "bayar DP dekorasi" tanpa nominal, pasangan tidak tahu apakah sudah cukup.

### Setelah disimpan

```text
+--------------------------------+
|  Rencana                       |
+--------------------------------+
| MINGGU INI                     |
|                                |
| (o) Daftar KUA          18 Mei |
| (o) Sewa venue          20 Mei |
| ( ) Bayar DP dekorasi   22 Mei |
|     Rp 4.000.000               |
|     Buana Dekorasi             |
| ( ) Minta countright    22 Mei |
+--------------------------------+
```

Tugas baru langsung masuk ke grup waktu yang benar. Kalau tidak, pasangan harus mencarinya dan tidak tahu apakah masuk atau tidak.

Tugas lain yang punya nominal juga menampilkan nominalnya, jadi pasangan bisa membandingkan pos yang satu dengan yang lain.

---

## 4. Tanggal penting

### Mobile

```text
+--------------------------------+
| < Tanggal penting         [+] |
+--------------------------------+
| [Cari.......................]  |
+--------------------------------+
| BULAN INI                      |
|                                |
| [titik] Akad nikah        210 h |
|        30 Juni 2026            |
|                                |
| [titik] Fitting dress    45 h  |
|        10 Juni 2026            |
|                                |
| SUDAH LEWAT                     |
|                                |
| [titik] Daftar KUA        lewat |
|        12 Mei 2026             |
|                                |
| BELUM ADA TANGGAL              |
|                                |
| [titik] Resepsi          belum |
|                                |
+--------------------------------+
```

### Tambah tanggal

```text
+--------------------------------+
| <  Tambah tanggal              |
+--------------------------------+
| Nama acara                     |
| [ Akad nikah               ]   |
|                                |
| Tanggal                        |
| [ 30 Juni 2026            v ] |
|                                |
| Jam (boleh kosong)             |
| [ 07.00                  v ]   |
|                                |
| Jenis                          |
| [ Akad nikah               v ] |
|                                |
| ( ) Ini hari-H                 |
|                                |
| Ingatkan berapa hari           |
| (o) 30 hari  ( ) 14 hari       |
| ( ) 7 hari    ( ) 1 hari      |
|                                |
| Catatan                        |
| [ Rumah kedua orang tua     ]  |
|                                |
+--------------------------------+
| [ Batal ]       [ Simpan ]     |
+--------------------------------+
```

### Setelah disimpan

Tanggal langsung masuk ke grup "Bulan ini", dengan hitung mundur yang dihitung ulang dari tanggal hari ini, bukan dari tanggal saat disimpan.

---

## 5. Daftar akun

```text
+--------------------------------+
|                                |
|      Buat akun                  |
|      Mulai rencana pernikahan   |
|      kamu                      |
|                                |
+--------------------------------+
| Nama               [_________] |
| Email              [_________] |
|                                |
| Kata sandi         [_________] |
|                    [lihat ]   |
|                                |
| [ Lanjut ]                      |
|                                |
| Sudah punya akun? Masuk        |
+--------------------------------+
```

---

## 6. Halaman luring

```text
+--------------------------------+
| [G] Tanpa sinyal                |
+--------------------------------+
|   Yang masih bisa dibuka:       |
|                                |
|   [ Rundown ]                   |
|   [ Daftar tugas, baca saja ]  |
|   [ Daftar tamu, baca saja ]   |
|   [ Anggaran, baca saja ]      |
|                                |
|   Perubahan yang kamu buat akan  |
|   terkirim begitu sinyal        |
|   kembali.                      |
|                                |
|   [ Coba lagi ]                 |
+--------------------------------+
```

Tidak ada tombol tambah di sini. Tombol yang kalau diklik pasti gagal lebih buruk daripada tidak ada.

---

## 7. Keempat tampilan pada layar inti

### Memuat

```text
+--------------------------------+
|  Rencana                       |
+--------------------------------+
| - - - - - - - - - - - - - - -  |
| - - - - - - - - - - - - - - -  |
| - - - - - - - - - - - - - - -  |
| - - - - - - - - - - - - - - -  |
+--------------------------------+
```

Baris abu, bukan spinner. Spinner di daftar panjang bikin orang mengira daftarnya kosong.

### Gagal

```text
+--------------------------------+
|  Rencana                       |
+--------------------------------+
|                                |
|   Daftar tugas gagal dimuat.   |
|   Bukan salahmu, coba lagi.    |
|                                |
|   [ Coba lagi ]                 |
+--------------------------------+
```

Kalimatnya menyalahkan server, bukan orang yang sedang panik menunggu.

### Luring

```text
+--------------------------------+
| [G] Tanpa sinyal                |
+--------------------------------+
| MINGGU INI                     |
|                                |
| (o) Daftar KUA          18 Mei |
| ( ) Sewa venue          20 Mei |
| ...                            |
+--------------------------------+
```

Tugas yang sudah diambil masih tampil. Yang belum ada tandanya "menunggu sinkron".
