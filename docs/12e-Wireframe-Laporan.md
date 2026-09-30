# 12e. Wireframe Laporan

Laporan keadaan sekarang, tombol bagikan ke WhatsApp, dan PDF. Tiga hal yang dipakai orang tua dan pasangan untuk tahu "--hari ini kondisinya bagaimana".

Tanda dan aturan umum ada di [`12-Wireframe.md`](12-Wireframe.md). Aturan teknis lengkapnya ada di [`16-Laporan-dan-Bagikan.md`](16-Laporan-dan-Bagikan.md).

---

## 1. Laporan

### Mobile

```text
+--------------------------------+
| < Laporan                      |
+--------------------------------+
| Keadaan 30 Juni 2026           |
| 371 hari lagi                  |
+--------------------------------+
| RINGKASAN UANG                 |
|                                |
| Batas          Rp 40.000.000   |
| Terpakai       Rp 24.500.000   |
| Sisa           Rp 15.500.000   |
|                                |
| [bar]###############.....      |
|                                |
| 1 pos lewat batas              |
| 1 vendor belum ada pembayaran  |
|                                |
+--------------------------------+
| TUGAS                          |
|                                |
| 28 selesai dari 63             |
| 4 harus selesai minggu ini     |
| 2 lewat tanggal                |
|                                |
| ( ) Minta countright    lewat  |
| ( ) Bayar DP catering   lewat  |
|                                |
+--------------------------------+
| TAMU                           |
|                                |
| 312 orang  |  150 kursi        |
| 67 belum kena undangan        |
| 54 belum konfirmasi hadir      |
|                                |
+--------------------------------+
| RUNDOWN HARI INI               |
|                                |
| 07.00  Akad nikah              |
| 08.30  Sungkeman               |
| 10.00  Resepsi                 |
| 13.00  Makan siang             |
|                                |
+--------------------------------+
| VENDOR YANG BELUM LUNAS        |
|                                |
| Buana Dekorasi    sisa         |
|                  Rp 2.500.000 |
| Grand Borneo     belum bayar   |
|                  Rp 14.500.000 |
|                                |
+--------------------------------+
| [ Bagikan ke WhatsApp ]        |
| [ Buat PDF ]                   |
+--------------------------------+
```

Laporan adalah satu halaman yang bisa dibaca orang tua tanpa perlu tahu aplikasi ini. Isinya disusun dari yang paling sering ditanya: uang, tugas, tamu, rundown.

Vendor yang belum lunas ada di laporan, bukan cuma di halaman vendor, karena "siapa yang belum bayar" adalah pertanyaan yang paling sering muncul di keluarga besar.

### Desktop

```text
+----------------------------------------------------------------------+
| Laporan                          [ Bagikan ke WhatsApp ] [ Buat PDF ] |
+----------------------------------------------------------------------+
| Aisyah & Bagas  |  Keadaan 30 Juni 2026  |  371 hari lagi           |
+----------------------------------------------------------------------+
| UANG                    | TUGAS                | TAMU                   |
|                         |                      |                        |
| Batas     Rp 40.000.000 | 28 selesai dari 63   | 312 orang              |
| Terpakai  Rp 24.500.000 | 4 harus selesai      | 150 kursi              |
| Sisa      Rp 15.500.000 |  minggu ini          | 67 belum kena         |
|                         |                      |  undangan              |
| [bar]#############      |                      | 54 belum konfirmasi   |
|                         | ( ) lewat tanggal    |                        |
| 1 pos lewat batas       | ( ) lewat tanggal    |                        |
| 1 vendor belum bayar    | ( ) wajib minggu ini |                        |
|                         | ( ) wajib minggu ini |                        |
|                         |                      |                        |
|                         | 54 selesai           |                        |
|                         |                      |                        |
+----------------------------------------------------------------------+
| RUNDOWN HARI INI        | VENDOR YANG BELUM LUNAS                      |
|                         |                                               |
| 07.00  Akad nikah       | Buana Dekorasi    sisa  Rp 2.500.000          |
| 08.30  Sungkeman        | Grand Borneo     belum Rp 14.500.000          |
| 10.00  Resepsi          |                                               |
| 13.00  Makan siang      |                                               |
+----------------------------------------------------------------------+
```

---

## 2. Bagikan ke WhatsApp

Sekali ketuk, lalu pilih kontak. Dua layar, bukan satu.

### Step 1, pilih isi

```text
+--------------------------------+
| < Bagikan                      |
+--------------------------------+
| Kirim laporan keadaan sekarang |
|                                |
| MAU BAGIKAN APA                |
|                                |
| (o) Ringkasan                  |
|    Singkat, sekitar 12 baris  |
|                                |
| ( ) Laporan lengkap            |
|    Semua angka dan rundown    |
|                                |
| ( ) Tautan saja               |
|   -family buka sendiri        |
|                                |
| +--------------------------------+
| TAMU KEPADA                    |
|                                |
| [Bp. Budi (orang tua)     v ] |
|                                |
| Tautan berlaku tanpa batas    |
| waktu. Bisa dimatikan kapan    |
| saja di menu Bagikan.          |
|                                |
+--------------------------------+
| [  Bagikan ke WhatsApp  ]      |
+--------------------------------+
```

Tiga pilihan isi, karena "seperti sekarang" punya tiga pembaca berbeda. Orang tua mau tahu Apakah uang cukup, pasangan mau tahu apa yang tertinggal, dan siapa saja butuh lihat sendiri.

Tautan tidak punya masa berlaku. Kalau ada tanggal kedaluwarsa, ada yang gagal membuka di hari yang paling penting.

### Step 2, pratinjau teks

```text
+--------------------------------+
| < Bagikan               2 / 2  |
+--------------------------------+
| Akan dikirim ke                |
| Bp. Budi                       |
|                                |
+--------------------------------+
| ┌────────────────────────────┐ |
| │ Keadaan rencana Aisyah &   │ |
| │ Bagas per 30 Juni 2026     │ |
| │                            │ |
| │ Uang                       │ │
| │ Batas Rp 40.000.000        │ |
| │ Terpakai Rp 24.500.000     │ |
| │ Sisa Rp 15.500.000         │ |
| │                            │ │
| │ Tugas                      │ │
| │ 28 selesai dari 63         │ │
| │ 4 harus selesai minggu ini │ │
| │ 2 lewat tanggal            │ │
| │                            │ │
| │ Tamu                       │ │
| │ 312 orang, 150 kursi       │ |
| │                            │ │
| │ Rundown hari ini           │ │
| │ 07.00 Akad nikah           │ │
| │ 10.00 Resepsi               │ │
| │                            │ │
| │ Lihat lengkap:             │ │
| │ aisyah.wedding/s/abc123     │ |
| └────────────────────────────┘ |
|                                |
| Teks ini bisa diubah sebelum   |
| dikirim.                       |
|                                |
+--------------------------------+
| [ Kembali ]     [ Kirim ]      |
+--------------------------------+
```

Pratinjau sebelum kirim, karena teks ini sering dibaca orang tua dan kalau salah kirim, yang salah baca orang tua.

Teks boleh diubah, tapi angka dan tanggal tidak boleh diganti. Yang boleh diubah adalah kalimat pembuka dan kalimat penutup.

### Step 3, setelah kirim

```text
+--------------------------------+
|                                |
|   Terkirim ke Bp. Budi          |
|                                |
|   Buka WhatsApp untuk melihat  |
+--------------------------------+
|      [ Bagikan lagi ]          |
|      [ Selesai ]                |
+--------------------------------+
```

---

## 3. Buat PDF

Tidak ada layar baru. Tombolnya membuka dialog cetak bawaan browser atau sistem.

```text
+--------------------------------+
| < Laporan                      |
+--------------------------------+
|                                  |
|  Pembangun laporan              |
|                                  |
|  Siapkan halaman untuk dicetak  |
|  atau disimpan sebagai PDF.     |
|                                  |
|  Pilih "Simpan sebagai PDF"    |
|  di dialog yang muncul.         |
|                                  |
|  [ Buka dialog cetak ]          |
|                                  |
|  Laporan juga jalan tanpa       |
|  sinyal.                        |
|                                  |
+--------------------------------+
```

Halaman cetak adalah halaman laporan yang sama, hanya dengan gaya cetak. Tidak ada jalur data terpisah, jadi isinya tidak mungkin beda dengan yang di layar.

---

## 4. Bentuk halaman cetak

Ukuran A4. Margin 20mm. Waktu baca satu halaman pertama: lima detik.

### Halaman 1, sampul dan ringkasan

```text
+--------------------------------------+
|                                      |
|    Aisyah & Bagas                     |
|    30 Juni 2026                       |
|                                      |
|    Laporan keadaan, 30 Juni 2026     |
|                                      |
|    371 hari lagi                      |
|                                      |
|    ─────────────────────────────      |
|                                      |
|    UANG                              |
|                                      |
|    Batas        Rp 40.000.000        |
|    Terpakai     Rp 24.500.000        |
|    Sisa         Rp 15.500.000        |
|                                      |
|    ████████████████░░░░░░            |
|                                      |
|    1 pos lewat batas                  |
|    1 vendor belum ada pembayaran      |
|                                      |
|    ─────────────────────────────      |
|                                      |
|                                      |
+--------------------------------------+
```

Garis lurus sebagai pemisah, bukan garis itinerary yang melengkung. Di kertas, garis melengkung kehilangan makna dan cuma menambah berat cetak.

Tonelama ada satu kali saja, di bagian sisa. Warna lain semua hitam, supaya laporan ini masih terbaca kalau dicetak hitam putih.

### Halaman 2, tugas, tamu, vendor

```text
+--------------------------------------+
| RENCANA TUGAS                        |
+--------------------------------------+
| Minggu ini, 28 selesai dari 63        |
| 4 harus selesai minggu ini            |
| 2 lewat tanggal                       |
+--------------------------------------+
|                                    | Terakhir  | Status |
| Daftar KUA              18 Mei 2026 | 18 Mei   | selesai|
| Sewa venue              20 Mei 2026 | 20 Mei   | selesai|
| Pesan dekorasi          22 Mei 2026 | -        | belum  |
| Minta countright        22 Mei 2026 | -        | lewat  |
+--------------------------------------+
| JML TAMU             | ORANG | KURSI |
| Keluarga pengantin    |    45 |    30 |
| Keluarga besar        |    62 |    32 |
| Teman                 |   120 |    58 |
| Kerja                 |    60 |    24 |
| Anak                  |    25 |     6 |
|                  Total|   312 |   150 |
+--------------------------------------+
| VENDOR YANG BELUM LUNAS              |
+--------------------------------------+
| Vendor        Tagihan   Terbayar  Sisa|
| Buana Dekorasi 12.000.000 9.500.000    |
|                                 2.500.000|
| Grand Borneo  14.500.000        0      |
|                                 14.500.000|
+--------------------------------------+
```

Tabel pakai garis tipis. Semua angka rata kanan dan pakai angka tabular supaya kolomnya lurus.

Kolom yang tidak penting untuk laporan dihapus di kertas. Layar bisa ribet, kertas harus bisa dibaca sambil berdiri.

### Halaman 3, rundown

```text
+--------------------------------------+
| RUNDOWN 30 Juni 2026                 |
+--------------------------------------+
| 07.00   Akad nikah                   |
|         Kantor Urusan Agama           |
|         Ustaz dan saksi sudah datang  |
|                                      |
| 08.30   Sungkeman                    |
|         Rumah kedua orang tua         |
|         Bawa keris dan pusaka         |
|                                      |
| 10.00   Resepsi                      |
|         Rama-rama                     |
|         Sedia di aula                 |
|                                      |
| 13.00   Makan siang                  |
|         Aula utama                    |
|                                      |
+--------------------------------------+
| Dicetak dari rencana Aisyah & Bagas  |
| 30 Juni 2026                          |
+--------------------------------------+
```

Rundown dapat halaman sendiri karena ini yang paling sering dicetak dan dibawa.

Kaki halaman ada di setiap halaman: nama pemilik laporannya dan tanggalnya. Kalau kertasnya tercecer, masih tahu laporan ini milik siapa.

---

## 5. Kenapa pilihan ini

| Keputusan | Alasan |
|---|---|
| Teks WhatsApp dibGenerate di server | Supaya angka sama dengan yang ada di layar, dan tidak perlu pustaka di client |
| Teks boleh diubah sebelum kirim | Yang salah kirim adalah orang tua, dan mereka tidak bisa membatalkan |
| Angka tidak boleh diubah | Kalau nominal bisa diedit, laporan ini bukan data anymore |
| Tautan tanpa masa berlaku | Tidak ada yang ingin gagal membuka di hari yang paling penting |
| PDF lewat dialog cetak bawaan | Tidak menambah pustaka, jalan tanpa sinyal, pilihan pengguna |
| Halaman laporan yang sama untuk layar dan cetak | Isinya tidak mungkin berbeda, dan hanya satu yang harus dirawat |
| Rundown dapat halaman sendiri | Yang paling sering dicetak dan dibawa |
| Warna tidak ada di atas kertas | Laporan ini sering dicetak hitam putih diFotocopy |
