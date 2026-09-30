# 12. Wireframe

Bentuk kasar semua layar, dari isian sampai hasil. Dipakai untuk berdiskusi tentang bentuk layar sebelum kode ditulis.

Wireframe ini dipecah jadi lima berkas supaya tidak ada satu berkas yang terlalu panjang.

| Berkas | Isi |
|---|---|
| [`12a-Wireframe-Inti.md`](12a-Wireframe-Inti.md) | Beranda, daftar tugas, tanggal penting, akun, luring |
| [`12b-Wireframe-Uang.md`](12b-Wireframe-Uang.md) | Anggaran, vendor, pembayaran, seluruh form isian |
| [`12c-Wireframe-Tamu.md`](12c-Wireframe-Tamu.md) | Daftar tamu, impor, meja, undangan |
| [`12d-Wireframe-Hari-H.md`](12d-Wireframe-Hari-H.md) | Rundown, info keluarga, seragam |
| [`12e-Wireframe-Laporan.md`](12e-Wireframe-Laporan.md) | Laporan, bagikan, PDF |

Bentuk di sini belum final. Yang sudah pasti strukturnya: apa yang terlihat, urutan apa yang penting, dan di mana tombolnya.

---

## 1. Cara baca wireframe

| Tanda | Arti |
|---|---|
| `[teks]` | Tombol |
| `[teks ]` | Kolom isian |
| `( )` | Pilihan bulat, biasanya centang |
| `(o)` | Pilihan bulat yang sedang dipilih |
| `+---` | Batas panel |
| `│ teks` | Isi panel |
| `...` | Isi yang dipangkas atau dipaginasi |
| `[G]Garasi` | Pita luring di atas |
| `[s]Simpan` | Tombol utama, warna terracotta |
| `[✓]Selesai` | Status selesai, warna sage |

Lebar baris tidak berarti lebar layar asli. Yang penting urutan dan prioritasnya.

---

## 2. Lima tampilan tiap layar

Isi plus empat tampilan lain. Kelimanya bagian dari layar, bukan tambahan.

| Tampilan | Yang terjadi | Bentuk di wireframe |
|---|---|---|
| Isi | Data ada | Bentuk normal |
| Kosong | Belum ada data | Batas panel lalu kalimat ajakan |
| Gagal | Gagal diambil | Batas panel lalu kalimat galat |
| Memuat | Sedang diambil | Batas panel dengan baris abu |
| Luring | Tidak ada sinyal | Pita di atas, isi tetap tampil |

Empat tampilan selain isi adalah bagian dari layar, bukan tambahan. Gagal dan luring paling sering dilupakan, dan keduanya yang bikin layar terlihat rusak.

---

## 3. Aturan yang berlaku di semua wireframe

| Aturan | Kenapa |
|---|---|
| Tidak ada tombol yang tidak melakukan apa-apa | Tombol mati merusak kepercayaan lebih cepat daripada tombol lambat |
| Target sentuh minimal 44x44px | Pasangan sering menggendong bayi sambil memegang HP |
| Status tidak hanya ditandai warna | Penyandang gangguan penglihatan warna harus bisa membaca |
| Angka rupiah selalu `Rp 4.500.000` | Konsisten dengan cara orang menulis nominal |
| Maksimal satu warna marigold per layar | Kalau semua penting berwarna kuning, tidak ada yang penting |
| Tombol utama paling banyak satu per layar | Dua tombol utama sama artinya tidak ada yang utama |

---

## 4. Yang tidak dipakai di semua wireframe

| Tidak dipakai | Kenapa |
|---|---|
| Diagram lingkaran atau donat | Bar lebih mudah dibaca di layar kecil |
| Peta interaktif | Butuh pustaka besar, dan tidak ada yang ditanyakan |
| Modal besar untuk tambah data | Di HP, layar penuh lebih enak daripada pop up kecil |
| Login di setiap halaman | Satu kali saja, lalu sesi |
| Grafik yang cuma biar tampak ramai | Yang perlu dijawab "pos mana yang sudah lewat jatah" |

---

## 5. Alasan pemecahan berkas

Satu berkas dengan semua layar akan melewati lima ratus baris, dan dokumen yang panjang tidak pernah dibaca penuh.

Lima berkas dengan jelas satu topik masing-masing lebih mudah dibaca, dan lebih mudah diperbarui satu bagian tanpa menyentuh bagian lain. Alasan ini sama dengan alasan pemecahan `docs/02` sampai `docs/02d`.
