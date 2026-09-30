# 12b. Wireframe Uang

Anggaran, vendor, pembayaran, dan semua form isian uang. Modul yang paling sering dibuka kedua setelah daftar tugas.

Tanda dan aturan umum ada di [`12-Wireframe.md`](12-Wireframe.md).

---

## 1. Anggaran

### Mobile

```text
+--------------------------------+
|< Anggaran                      |
+--------------------------------+
|Total anggaran    Rp 40.000.000 |
|                                |
|Terpakai         Rp 24.500.000  |
|Sisa             Rp 15.500.000  |
|                                |
|[bar]###############.....       |
|                                |
|[Cari pos....................]  |
+--------------------------------+
|B Catering        8.000.000     |
|[bar]####################       |
|│ Terpakai 8.000.000            |
|│ Sisa     0                    |
|│ lunas                         |
|>                               |
|                                |
|D Dekorasi      12.000.000      |
|[bar]##############....         |
|│ Terpakai 9.500.000            |
|│ Sisa     2.500.000            |
|│ lewat batas                   |
|>                               |
|                                |
|V Venue        14.500.000       |
|[bar]######................     |
|│ Belum ada pembayaran          |
|>                               |
|                                |
|(+)                             |
+--------------------------------+
```

Pos yang lewat batas dapat tulisan "lewat batas", bukan cuma warna. Warna saja tidak dibaca orang dengan gangguan penglihatan warna.

Bar memakai warna pos, bukan warna status. Kalau warnanya=status, bar jadi sulit dibaca karena yang dicari justru batasnya.

### Kosong

```text
+--------------------------------+
|< Anggaran                      |
+--------------------------------+
|                                |
|Belum ada pos anggaran          |
|                                |
|Mulai dari daftar bawaan        |
|Catering, dekorasi, venue,      |
|dokumentasi, dan lain-lain.     |
|                                |
|[ Muat daftar bawaan ]          |
|[ Tulis pos sendiri ]           |
+--------------------------------+
```

---

## 2. Tambah pos anggaran

```text
+--------------------------------+
|<  Tambah pos anggaran          |
+--------------------------------+
|Untuk apa                       |
|[ Dekorasi                  ]   |
|                                |
|Batas                           |
|[ Rp 12.000.000             ]   |
|                                |
|sudah terpakai  Rp 9.500.000    |
|sisa            Rp 2.500.000    |
|                                |
|[bar]##############....         |
|                                |
|[ Simpan pos ]                  |
+--------------------------------+
```

Sisa yang sudah dihitung sebelum menyimpan membuat orang tahu pos ini hampir habis, jadi tidak menunggu sampai tagihan datang.



---

## 3. Vendor

### Mobile

```text
+--------------------------------+
|< Vendor                   [+]  |
+--------------------------------+
|[Cari vendor.................]  |
+--------------------------------+
|D Dekorasi                      |
|│ Buana Dekorasi                |
|│ Tagihan   12.000.000          |
|│ Terbayar   9.500.000          |
|│ Sisa       2.500.000          |
|│ lewat batas                   |
|>                               |
|                                |
|C Catering                      |
|│ Rasa Ibu                      |
|│ Tagihan   8.000.000           |
|│ Terbayar   8.000.000          |
|│ Sisa       0                  |
|│ lunas                         |
|>                               |
|                                |
|V Venue                         |
|│ Grand Borneo                  |
|│ Tagihan  14.500.000           |
|│ Belum ada pembayaran          |
|>                               |
+--------------------------------+
```

Inisial di depan adalah huruf pertama kategori, jadi yang tampil satu huruf saja, bukan nama panjang yang memakan tempat.

Inisial di depan adalah huruf pertama kategori, jadi yang muncul satu huruf saja, bukan nama panjang yang memakan tempat.

---

## 4. Detail vendor

```text
+--------------------------------+
|< Dekorasi                      |
+--------------------------------+
|Buana Dekorasi                  |
|                                |
|Tagihan     Rp 12.000.000       |
|Terbayar    Rp  9.500.000       |
|Sisa        Rp  2.500.000       |
|                                |
+--------------------------------+
|Pembayaran                      |
|                                |
|20 Jun  DP     Rp 4.000.000     |
|28 Jun  DP     Rp 5.500.000     |
|02 Jul  sisa   Rp 2.500.000     |
|                                |
|(+)                             |
+--------------------------------+
|Catatan                         |
|[ Biru, pelangi, gerobak       ]|
|[                              ]|
+--------------------------------+
|[ Bagikan ]  [ Hapus vendor ]   |
+--------------------------------+
```

Tombol tambah pembayaran ada di dalam detail, bukan di daftar. Tambah pembayaran tanpa tahu vendor mana tidak mungkin.

Baris pembayaran menampilkan tanggal dan tahap, bukan cuma nominal. "Kapan bayar" adalah pertanyaan yang lebih sering muncul daripada "bayar siapa".

### Tambah pembayaran

```text
+--------------------------------+
|<  Tambah pembayaran            |
+--------------------------------+
|Untuk Buana Dekorasi            |
|                                |
|Sisa tagihan     Rp 2.500.000   |
|                                |
|Tanggal                         |
|[ 02 Juli 2026             v ]  |
|                                |
|Jumlah                          |
|[ Rp 2.500.000              ]   |
|                                |
|Tahap                           |
|[ Sisa                    v ]   |
|                                |
|Bukti transfer                  |
|[ Pilih foto                ]   |
|                                |
|[ Batal ]        [ Simpan ]     |
+--------------------------------+
```

Nominal terisi sisa tagihan sebagai saranan. Yang paling sering terjadi adalah membayar tepat sisa.

Bukti transfer opsional, karena sering bayar lewat transfer manual dan tidak selalu ada fotonya.

---

## 5. Detail pembayaran

```text
+--------------------------------+
|< Pembayaran                    |
+--------------------------------+
|Buana Dekorasi                  |
|                                |
|Rp 2.500.000                    |
|02 Juli 2026                    |
|Tahap  sisa                     |
|                                |
+--------------------------------+
|Bukti transfer                  |
|[ Lihat foto               ]    |
|[ Ganti foto               ]    |
|[ Hapus bukti              ]    |
+--------------------------------+
|[ Hapus pembayaran ]            |
+--------------------------------+
```

---

## 6. Empat tampilan pada layar uang

### Memuat

```text
+--------------------------------+
|< Anggaran                      |
+--------------------------------+
|- - - - - - - - - - - - - - -   |
|- - - - - - - - - - - - - - -   |
|- - - - - - - - - - - - - - -   |
+--------------------------------+
```

### Gagal

```text
+--------------------------------+
|< Anggaran                      |
+--------------------------------+
|                                |
|Anggaran gagal dimuat.          |
|Bukan salahmu, coba lagi.       |
|                                |
|[ Coba lagi ]                   |
+--------------------------------+
```

### Luring

```text
+--------------------------------+
|[G] Tanpa sinyal                |
+--------------------------------+
|B Dekorasi      12.000.000      |
|[bar]##############....         |
|│ Terpakai 9.500.000            |
|│ Sisa     2.500.000            |
+--------------------------------+
|Perubahan yang kamu buat akan   |
|terkirim begitu sinyal kembali. |
+--------------------------------+
```

Anggaran masih bisa dibaca tanpa sinyal. Ini yang paling sering dibuka di perjalanan.

---

## 7. Angka yang selalu ditulis penuh

| Salah | Benar |
|---|---|
| `Rp 40jt` | `Rp 40.000.000` |
| `Rp 24,5jt` | `Rp 24.500.000` |
| `Rp 4,5jt` | `Rp 4.500.000` |

Alasannya sederhana: angka yang dipotong tidak bisa disalin ke catatan pengeluaran, dan pasangan sering butuh angka persis untuk transfer.
