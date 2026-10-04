# 05. IA dan Spesifikasi Layar

Dokumen ini menjawab satu pertanyaan: apa yang dilihat pengguna, di layar berapa, dan dalam keadaan seperti apa.

---

## 1. Breakpoint

Breakpoint dipilih dari konten, bukan dari nama perangkat. Yang penting adalah kapan layout berhenti muat dengan baik, bukan apakah layar itu HP atau PC.

| Nama | Lebar | Kapan dipakai | Apa yang berubah |
|---|---|---|---|
| `compact` | di bawah 640px | HP dengan satu kolom | Navigasi bawah, satu kolom, tombol besar |
| `medium` | 640px sampai 1023px | Tablet, HP besar | Navigasi bawah, satu kolom dengan margin |
| `expanded` | 1023px ke atas | Laptop dan PC | Navigasi samping, konten maksimum 1200px |

Nilai yang dipakai: 640px dan 1023px. Bukan 768px dan 1280px.

**Alasannya** 640px adalah titik di mana dua kolom mulai tidak terbaca di HP. 1023px adalah titik di mana navigasi samping masih muat tanpa ukuran huruf mengecil.

Yang tidak dipakai: breakpoint khusus per perangkat. Tablet tidak diperlakukan sebagai kasus tersendiri, karena pengguna tablet memakai aplikasi ini persis seperti pengguna HP.

---

## 2. Fluid type

Ukuran teks memakai `clamp()` supaya tidak perlu breakpoint untuk typography.

```css
/* Fluid scale, min 1rem max 1.125rem */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--text-h1:   clamp(1.75rem, 1.5rem + 1.25vw, 2.5rem);
--text-h2:   clamp(1.375rem, 1.25rem + 0.625vw, 1.75rem);
--text-h3:   clamp(1.125rem, 1.0625rem + 0.3125vw, 1.375rem);
```

Nominal rupiah memakai `tabular-nums` supaya angka sejajar vertikal dan mudah dibandingkan.

---

## 3. Navigasi

| Breakpoint | Bentuk | Alasan |
|---|---|---|
| `compact` dan `medium` | Bilah bawah, 4 item | Jempol ada di bawah, tidak perlu menjangkau atas |
| `expanded` | Sisi kiri, daftar penuh | Ruang vertikal tidak terbatas, bisa tampil semua modul |

Empat item di navigasi bawah, dipilih berdasarkan seringnya dipakai:

1. Beranda
2. Rencana
3. Anggaran
4. Tamu

Modul lain (vendor, rundown, info) masuk lewat halaman Rencana, bukan lewat item navigasi tambahan. Alasannya, menambah item di bawah lima membuat bar navigasi sempit di HP kecil.

---

## 4. Peta halaman

```
Beranda
├── Ringkasan hari ini
├── Hitung mundur hari-H
├── Tugas terdekat (maks 5)
├── Sisa anggaran
└── Tanggal penting berikutnya

Rencana
├── Tab: Tanggal
├── Tab: Tugas
├── Tab: Rundown
├── Tab: Vendor
├── Tab: Seragam
└── Tab: Info

Laporan
├── Ringkasan keadaan
├── Bagikan ke WhatsApp
└── Cetak PDF
```

Angka "maks 5" di Beranda bukan truncasi teknis, tapi batas perhatian. Menampilkan lebih dari lima tugas membuat daftar berubah jadi tembok teks yang tidak dibaca.

Laporan tidak masuk tab Rencana karena bukan tempat bertanya "apa yang harus saya kerjakan", tapi tempat bertanya "ini sudah sejauh mana". Bentuk layarnya ada di [`12e-Wireframe-Laporan.md`](12e-Wireframe-Laporan.md).

---

## 5. Spesifikasi layar

Setiap layar di bawah menyebut empat state yang wajib ada: memuat, kosong, salah, dan luring. Tidak ada layar tanpa keempatnya.

---

## 6. Layar Beranda

**Tujuan**: tahu apa yang harus dilakukan hari ini, dalam sekali lihat.

| Bagian | Isi | Sumber |
|---|---|---|
| Hitung mundur | "371 hari lagi" atau "Hari ini" | Tanggal penting dengan `isDayOf` |
| Tugas terdekat | Maksimal 5 tugas dengan tenggat terdekat yang belum selesai | Daftar tugas |
| Sisa anggaran | Total anggaran dikurangi total terbayar | Anggaran dan pembayaran |
| Tanggal berikutnya | Tanggal penting yang paling dekat | Tanggal penting |

Komposisi di `expanded`: dua kolom, konten utama 60% dan ringkasan anggaran 40%. Di `compact` dan `medium`: satu kolom, urutan tetap seperti tabel di atas.

Perilaku yang harus benar:

- Tugas yang lewat tidak muncul di daftar tugas terdekat, tapi jumlahnya tampil di satu baris ringkas di atas
- Tanggal sudah lewat tidak dihitung dalam hitung mundur
- Kalau belum ada tanggal penting, hitung mundur disembunyikan, bukan menampilkan angka nol

**State kosong**: belum ada tanggal penting. Tampilkan ajakan membuat tanggal akad, dengan satu tombol.

**State luring**: data yang sudah pernah dimuat tetap tampil, dengan pita tipis di atas yang berbunyi "Menampilkan data dari perangkat".

---

## 7. Layar Daftar Tugas

**Tujuan**: mengurus tugas harian.

Daftar tugas dikelompokkan berdasarkan waktu, bukan kategori:

```
Lewat jatuh tempo        (warna status, bukan merah menyala)
Hari ini
Minggu ini
Belum ada tenggat
Sudah selesai            (disembunyikan secara bawaan)
```

**Alasannya** mengelompokkan berdasarkan waktu lebih berguna daripada berdasarkan kategori. Pasangan lebih sering bertanya "apa yang harus saya kerjakan hari ini" daripada "apa tugas saya di kategori katering".

**Filter**: kategori, status, dan siapa yang mengerjakan. Filter tersimpan di URL supaya bisa dibagikan ke pasangan.

**Interaksi**:

- Tanda selesai lewat satu tap, target minimal 44x44px
- Geser untuk hapus tidak jadi satu-satunya cara, karena tidak bisa dipakai dengan keyboard. Tiap item punya menu aksi
- Tambah tugas lewat tombol tetap di bawah, tidak lewat menu
- Geser untuk hapus tetap ada sebagai pintasan, tapi tidak pernah jadi satu-satunya jalan

**State kosong** per kategori: "Belum ada tugas di sini. Muat checklist bawaan" dengan dua tombol, muat template atau tulis sendiri.

---

## 8. Layar Anggaran

**Tujuan**: tahu sudah berapa dan masih berapa.

```
Total anggaran        Rp 85.000.000
Sudah dibayar          Rp 52.000.000   (61%)
Sisa                   Rp 33.000.000
```

Di bawahnya, daftar pos anggaran. Setiap baris menunjukkan rencana, terbayar, dan sisa, dengan angka sejajar karena `tabular-nums`.

Bar tipis di setiap baris menunjukkan porsi terpotong. Bukan chart. Grafik pie tidak dipakai karena tidak bisa dibaca akurat dan tidak bisa dibandingkan antar pos.

**Alasan** memakai bar dan bukan chart: yang perlu dijawab adalah "pos mana yang sudah lewat jatah", bukan "pola pembelanjaannya menarik".

**Negatif**: kalau total terbayar lebih besar dari rencana, sisanya tampil dengan nilai negatif dan warna status yang berbeda dari tombol utama, bukan warna merah menyala.

**State kosong**: belum ada pos anggaran, tawarkan tambah pos atau muat template.

---

## 9. Layar Vendor dan Pembayaran

**Tujuan**: mencatat dan memeriksa pembayaran.

Daftar vendor dengan status. Tiap baris menampilkan nama, kategori, dan total sudah dibayar.

Tampilan detail vendor berisi daftar pembayaran, terurut dari yang terbaru. Di `expanded`, daftar vendor di kiri dan detail di kanan. Di `compact`, daftar penuh, dan detail dibuka sebagai halaman tersendiri.

**Interaksi**: tombol tambah pembayaran ada di dalam detail vendor, bukan di daftar, supaya tidak perlu memilih vendor dulu.

**State kosong**: belum ada vendor, dengan penjelasan singkat kenapa fitur ini ada.

---

## 10. Layar Daftar Tamu

**Tujuan**: tahu siapa yang hadir dan berapa porsi katering.

Angka rekap di atas, lalu daftar tamu. Satu angka satu satuan: undangan untuk jumlah baris, orang untuk jumlah jiwa, kursi untuk tempat duduk, dan porsi untuk makanan.

```
Total tamu                   312 orang
Sudah pasti hadir            258 orang
Belum konfirmasi              54 orang
Tidak hadir                    0 orang
Perkiraan porsi katering     312
Kursi yang perlu disiapkan   312
```

**Porsi dan kursi memakai angka yang sama**: tamu yang sudah pasti hadir ditambah yang belum menjawab. Tamu yang sudah menyatakan tidak hadir tidak ikut dihitung, karena dua pertanyaan itu sama-sama berarti berapa orang yang perlu dilayani.

Aplikasi sengaja tidak menambahkan cadangan porsi di atas jumlah orang (keputusan pemilik produk, 4 Oktober 2026). Besaran cadangan berbeda antar vendor, menu, dan jumlah anak, jadi angka porsi tetap dihitung dari orang yang perlu dilayani, dan pemilik rencana yang menyesuaikan saat memesan. Alasannya lengkap ada di `02b-Tamu.md` bagian keputusan porsi dan kursi.

Saringan yang ada: kategori, status kehadiran, sisi keluarga (pihak pria, pihak wanita, bersama), dan status undangan (sudah dikirim, belum dikirim). Chip kategori memakai angka dari server supaya tidak berubah saat daftar sedang disaring.

Setiap baris menampilkan tanggal kirim undangan kalau sudah dikirim. Satu tombol "Tandai undangan terkirim" menandai semua baris yang belum punya tanggal, dengan konfirmasi yang menyebut berapa orang yang akan ditandai. Endpoint-nya hanya mengisi yang kosong, jadi tanggal kirim yang sudah dicatat tidak tertimpa.

Daftar tamu dikelompokkan per kategori, dengan pencarian di atas yang selalu terlihat. Di `compact`, pencarian tidak ikut scroll, menempel di bawah bar filter.

**Tandai kehadiran** lewat satu tap. Setelah ditandai, baris berubah dengan indikator non-warna supaya tidak hanya mengandalkan warna.

**Impor**: tempel daftar nama dari satu kolom. Format yang didukung: satu nama per baris, atau nama dipisah koma. Hasil pratinjau ditampilkan sebelum disimpan, supaya kesalahan tempel tidak langsung masuk.

**State kosong**: dua pilihan, tambah manual satu per satu atau tempel daftar.

---

## 11. Layar Rundown Acara

**Tujuan**: tahu urutan acara di hari-H.

Daftar item rundown dengan jam di kiri. Sesi yang sedang berjalan ditandai dengan garis vertikal "garis itinerary" dari `DESIGN.md`, bukan dengan kotak berwarna.

Di `compact`, tiap item punya tinggi yang cukup untuk satu tap, dan seluruh rundown muat dalam satu layar penuh tanpa scroll kalau memungkinkan.

**Penting**: rundown harus tampil tanpa koneksi. Ini satu-satunya layar yang wajib dibuka di venue yang sinyalnya buruk.

**State luring**: rundown tampil penuh, dengan pita "Luring" di atas. Tidak ada tombol yang butuh koneksi di layar ini.

---

## 12. Layar Info untuk Keluarga

**Tujuan**: jadi satu-satunya sumber jawaban untuk keluarga dan crew.

Daftar pengumuman, yang paling penting disematkan di atas. Tiap pengumuman punya target audiens, jadi pasangan bisa menyembunyikan briefing crew dari tampilan keluarga.

**Berbagi**: satu tombol membuat tautan baca-saja. Siapa pun yang punya tautan bisa melihat, tapi tidak bisa mengubah. Tautan tidak butuh login, karena anggota keluarga besar tidak akan membuat akun.

**State kosong**: belum ada pengumuman, dengan contoh isi siap pakai yang bisa langsung dipakai, misalnya "Jam datang tamu: 10.00".

---

## 13. Layar Laporan

**Tujuan**: menjawab "sudah sejauh mana" dalam sekali baca, lalu bisa dikirim ke orang yang tidak punya aplikasi.

Isinya lima sumber data saja: judul dan hitung mundur, ringkasan uang, tugas, tamu, dan rundown hari ini. Tidak ada angka yang disimpan, semuanya dihitung ulang dari data supaya tidak pernah beda dengan halaman lain.

**Semua angka harus sama dengan halaman lain.** Pasangan akan membandingkan. Kalau laporan berbeda dengan anggaran, yang disalahkan laporan.

**Bagikan ke WhatsApp** punya tiga pilihan isi: ringkas, lengkap, dan tautan saja. Teksnya disusun di server, angka dan tanggalnya tidak bisa diubah, kalimatnya boleh. Aturan lengkapnya ada di [`16-Laporan-dan-Bagikan.md`](16-Laporan-dan-Bagikan.md).

**Cetak PDF** memakai dialog cetak bawaan dengan CSS `@media print`, bukan pustaka. Tiga halaman paling banyak. Isinya sama dengan layar, cuma gaya cetaknya yang berbeda.

**State luring**: laporan menampilkan data yang tersimpan di perangkat, dengan pita yang sama seperti halaman lain.

---

## 14. Aturan yang berlaku di semua layar

| Aturan | Kenapa |
|---|---|
| Tidak ada tombol yang tidak melakukan apa-apa | Tombol mati merusak kepercayaan lebih cepat daripada tombol yang lambat |
| Setiap daftar punya pencarian atau filter kalau lewat 20 item | Tanpa itu, pengguna harus scroll panjang untuk menemukan satu nama |
| Setiap daftar panjang menambah tombol "muat lagi", bukan infinite scroll | Infinite scroll merusak posisi scroll saat kembali dari detail |
| Semua angka rupiah pakai pemisah ribuan titik | Konsisten dengan cara orang menulis nominal di Indonesia |
| Setiap halaman punya judul yang menjelaskan isinya, bukan nama modul saja | "Rencana" tidak menjelaskan apa yang ada di dalamnya |
| Tidak ada halaman yang butuh lebih dari dua kali scroll di `compact` untuk isi utama | Kalau butuh lebih, gagal di layar kecil |



