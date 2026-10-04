# 12d. Wireframe Hari-H

Rundown, info untuk keluarga, dan seragam. Bagian yang dibuka di lokasi, jadi semua aturan di sini berakar pada satu hal: dibaca dari jarak dan dibaca tanpa sinyal.

Tanda dan aturan umum ada di [`12-Wireframe.md`](12-Wireframe.md).

---

## 1. Rundown

Layar yang paling sering dibuka di lokasi. Wajib jalan tanpa sinyal, dan harus terbaca dari jarak lima meter.

### Mobile

```text
+--------------------------------+
|< Rundown                       |
|[G] Tanpa sinyal                |
+--------------------------------+
|[ Muslim v ]                    |
+--------------------------------+
|07.00                           |
|│ Akad nikah                    |
|│ Kantor Urusan Agama           |
|│ Ustaz dan saksi               |
|│                               |
|08.30                           |
|│ Sungkeman                     |
|│ Rumah kedua orang tua         |
|│ Bawa keris dan pusaka         |
|│                               |
|10.00                           |
|│ Resepsi                       |
|│ Grand Borneo                  |
|│ Sedia di aula                 |
|│                               |
|13.00                           |
|│ Makan siang                   |
|│ Aula utama                    |
|│                               |
+--------------------------------+
|Font  [ A- ]  [ A+ ]            |
+--------------------------------+
```

Setiap item punya tiga baris: nama, lokasi, dan catatan. Catatan adalah yang paling sering dipakai crew, jadi tidak boleh disembunyikan di balik tap.

Warna garis waktu pakai satu warna saja untuk semua item. Kalau tiap acara punya warnanya sendiri, layar jadi ramai dan tidak ada yang menonjol.

### Dua versi

Ada dua versi rundown: Muslim dan adat. Pilihannya di atas, bukan tab besar yang memenuhi layar.

### Ukuran font

Tiga ukuran: kecil, sedang, besar. Ukuran yang dipilih disimpan di perangkat, jadi tetap sama besok pagi.

Tidak ada tombol reset, karena font yang sudah pas tidak perlu dikembalikan.

---

## 2. Tambah item rundown

```text
+--------------------------------+
|<  Tambah item rundown          |
+--------------------------------+
|Nama                            |
|[ Akad nikah               ]    |
|                                |
|Jam                             |
|[ 07.00                   v ]   |
|                                |
|Lokasi                          |
|[ Kantor Urusan Agama       ]   |
|                                |
|Catatan untuk crew              |
|[ Ustaz dan saksi sudah datang ]|
|                                |
|Versi                           |
|[ Muslim                   v ]  |
|                                |
+--------------------------------+
|[ Batal ]       [ Simpan ]      |
+--------------------------------+
```

Jam pakai pemilih jam, bukan isian teks. Mengetik "pukul tujuh" lebih mudah salah daripada memilih dari daftar.

---

## 3. Info untuk keluarga

Halaman yang dibuka oleh orang tua dan saudara. Tidak ada login, tidak ada tombol edit, dan tidak boleh punya tombol yang mengubah data.

```text
+--------------------------------+
|                                |
|Aisyah & Bagas                  |
|30 Juni 2026                    |
|                                |
+--------------------------------+
|JADWAL                          |
|                                |
|07.00   Akad nikah              |
|Kantor Urusan Agama             |
|08.30   Sungkeman               |
|Rumah kedua orang tua           |
|10.00   Resepsi                 |
|Grand Borneo                    |
|                                |
+--------------------------------+
|LOKASI                          |
|                                |
|Akad nikah                      |
|Alamat lengkap                  |
|[ Buka di peta ]                |
|                                |
|Resepsi                         |
|Alamat lengkap                  |
|[ Buka di peta ]                |
|                                |
+--------------------------------+
|KODE BUSANA                     |
|                                |
|Pria                            |
|[ gambar ]                      |
|Baju adat, warna                |
|                                |
|Wanita                          |
|[ gambar ]                      |
|[ gambar ]                      |
|                                |
+--------------------------------+
|                                |
|Halaman ini hanya untuk         |
|dibaca.                         |
|                                |
+--------------------------------+
```

Alamat ditulis lengkap, bukan hanya nama tempat. Orang tua yang baru tahu pasti masih ada yang belum tahu jalan ke sana.

Tombol "Buka di peta" membuka peta bawaan HP, jadi tidak perlu pustaka peta di dalam aplikasi.

Tautan punya kunci yang panjangnya cukup supaya tidak ditebak, dan tidak punya kedaluwarsa supaya tidak ada yang gagal membuka di hari yang salah.

---

## 4. Seragam

```text
+--------------------------------+
|< Seragam                       |
+--------------------------------+
|TAMU                            |
|                                |
|Pria  [ gambar ]              |
|Baju adat, warna                |
|                                |
|Wanita  [ gambar ]              |
|Baju adat, warna                |
|                                |
|PENGANTIN                       |
|                                |
|Pengantin  [ gambar ]           |
|Baju adat, warna                |
|                                |
|[ Bagikan ke keluarga ]         |
+--------------------------------+
```

Tampilannya sama persis dengan yang muncul di info untuk keluarga, tapi di sini bisa diedit.

Ada satu tombol bagikan, dan tombol itu memakai tautan yang sudah ada di bagian 3. Tidak ada cara kedua.

---

### Keputusan yang ditunda

Dua elemen di atas belum dibangun karena datanya tidak ada di skema, bukan karena lupa:

| Elemen | Keputusan | Alasan | Yang dibutuhkan kalau nanti dibangun |
|---|---|---|---|
| Tombol "Buka di peta" per lokasi | Tidak dibangun | Milestone (`milestones`) tidak punya kolom alamat atau koordinat, dan rundown hanya punya nama lokasi sebagai teks. Tautan peta butuh alamat lengkap supaya berguna | Kolom alamat di `milestones` atau `rundown_items`, lalu tautan `https://maps.google.com/?q=` |
| Blok kode busana dengan gambar | Tidak dibangun | Tabel `outfits` menyimpan nama barang, status, dan catatan, tanpa field gambar atau warna terstruktur. Gambar juga belum punya tempat penyimpanan | Kolom warna atau gambar di `outfits` dan object storage untuk berkas gambar |
| Tombol "Bagikan ke keluarga" di Seragam | Tidak dibangun | Tautan baca-saja publik hanya punya dua target, pengumuman dan laporan, sesuai `16-Laporan-dan-Bagikan.md` bagian 4. Seragam tidak punya halaman publik sendiri. Menambah target ketiga berarti jalur data baru, dan itu belum diminta | Target `seragam` di `share_links`, plus tampilan baca-saja untuk busana |

Yang sudah dibangun di tautan publik: jadwal dari `report.jadwal` dan rundown dari `report.rundown.item` termasuk lokasinya.

---

## 5. Empat tampilan pada layar hari-H

### Memuat

```text
+--------------------------------+
|< Rundown                       |
+--------------------------------+
|- - - - - - - - - - - - - - -   |
|07.00                           |
|- - - - - - - - - - - - - - -   |
|08.30                           |
|- - - - - - - - - - - - - - -   |
+--------------------------------+
```

Jam tetap terlihat walau isinya belum dimuat. Jam adalah bagian paling penting dari rundown, dan menampilkannya lebih awal membuat layar tidak kosong.

### Gagal

```text
+--------------------------------+
|< Rundown                       |
+--------------------------------+
|                                |
|Rundown gagal dimuat.           |
|Bukan salahmu, coba lagi.       |
|                                |
|[ Coba lagi ]                   |
+--------------------------------+
```

### Luring

Ini tampilan yang paling sering dipakai, dan tampilannya sama dengan tampilan isi. Tidak ada layar khusus luring untuk rundown.

```text
+--------------------------------+
|< Rundown                       |
|[G] Tanpa sinyal                |
+--------------------------------+
|07.00                           |
|│ Akad nikah                    |
|│ Kantor Urusan Agama           |
+--------------------------------+
```

Data rundown disimpan di perangkat setelah diambil sekali. Perubahan baru menunggu sinyal, dan tidak ada tombol tambah di layar ini karena menambah dari lokasi hampir tidak pernah terjadi.

---

## 6. Aturan rundown

| Aturan | Kenapa |
|---|---|
| Rundown tersimpan di perangkat | Ini satu-satunya layar yang pasti dibuka tanpa sinyal |
| Urutan mengikuti jam, bukan urutan dibuat | Crew mengira urutannya sudah benar |
| Catatan selalu terlihat | Yang paling sering ditanya crew di tempat |
| Font bisa dibesar | Dibaca dari jarak lima meter |
| Tidak ada tombol tambah saat luring | Tombol yang gagal saat dipakai merusak kepercayaan |
