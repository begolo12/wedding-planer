# 02c. Hari-H

Modul yang dipakai di hari-H itu sendiri. Semuanya P0, kecuali dokumentasi yang hanya P1.

---

## 08. Rundown acara (P0)

Ini urutan acara per menit. Pasangan yang baru pertama kali biasanya belum punya ini sama sekali.

### Data rundown

| Field | Tipe | Keterangan |
|---|---|---|
| `title` | teks | Nama acara, misalnya "Sesi foto keluarga" |
| `startTime` | waktu | Jam mulai |
| `durationMinutes` | angka | Estimasi durasi |
| `location` | teks | Tempat, kalau berbeda dari venue utama |
| `picName` | teks | Penanggung jawab |
| `notes` | teks | Catatan teknis |
| `isDone` | boolean | Sudah lewat atau belum |

### Sistem acara yang harus didukung

Aplikasi ini harus bisa menampung semua bentuk acara yang lazim di Indonesia, bukan cuma satu format.

| Sistem | Isi rundown |
|---|---|
| Muslim | Akad nikah, sungkeman, resepsi, walimah |
| Jawa | Akad, siraman, midodareni, balangan gantal, saweran |
| Minang | Akad, malam bainai, manjapuik marapulai, baralek |
| Sunda | Akad, saweran, huap lingkung, ngunduh mantu |
| Bali | Mesakapan, mewidhi widana, resepsi |
| Modern | Akad, prewedding, resepsi, pesta |

**Alasannya** banyak pasangan di Indonesia menjalankan adat tertentu, dan kalau aplikasi cuma punya satu template, separuh pengguna akan salah pakai.

### Kenapa perlu

Rundown adalah dokumen yang paling sering hilang saat hari-H. Semua orang datang dengan harapan berbeda, dan tanpa urutan yang sama, acara jadi molor.

### Versi minimal

- [ ] Tambah, edit, hapus item rundown
- [ ] Terurut dari jam paling awal
- [ ] Sesi saat ini ditandai jelas, dengan indikator yang tidak cuma mengandalkan warna
- [ ] Tampilan satu layar penuh per halaman, supaya tidak perlu scroll di HP
- [ ] Item yang sudah lewat ditandai berbeda, tanpa dihapus
- [ ] Bisa dipakai tanpa koneksi, dan tetap tampil saat HP offline

---

## 09. Info untuk keluarga dan hari-H (P0)

Keluarga besar sering tidak tahu harus datang jam berapa, harus bawa apa, dan tidak boleh masuk ke mana. Aplikasi ini jadi satu-satunya sumber jawaban.

### Data yang disimpan

| Field | Tipe | Keterangan |
|---|---|---|
| `title` | teks | Judul, misalnya "Tamu pengantin" |
| `body` | teks | Isi pengumuman |
| `audience` | enum | `semua`, `keluarga`, `crew`, `tamu` |
| `publishedAt` | timestamp | Kapan dipublikasikan |
| `isPinned` | boolean | Disematkan di atas |

### Contoh isi yang harus bisa dibuat tanpa proses editing

- Jam datang tamu
- Alamat lengkap dan patokan lokasi
- Dress code
- Daftar orang yang harus diantar ke KUA
- Nomor darurat
- Briefing crew
- Aturan mahar dan seserahan
- Kerabat dekat yang perlu tahu lebih dulu

### Versi minimal

- [ ] Buat pengumuman singkat
- [ ] Sematkan pengumuman yang paling penting
- [ ] Bisa dibuka HP pasangan dan HP crew lain lewat tautan
- [ ] Tersedia offline setelah pernah dibuka
- [ ] Tidak ada tombol yang tidak melakukan apa-apa

---

## 10. Dokumentasi (P1, Fase 2)

Album foto, galeri, dan halaman berbagi tidak ada di Fase 1.

**Alasannya** butuh penyimpanan objek besar, thumbnail, kebijakan retensi, dan biaya bandwidth. Semua itu bukan inti dari proses perencanaan. Pasangan sudah punya galeri di HP dan sering menyewa fotografer yang mengirim album sendiri.

Yang perlu ada di Fase 1:

- [ ] Kolom vendor dokumentasi di modul vendor, supaya terikat ke anggaran
- [ ] Checklist tugas dokumentasi (konsep foto, lokasi, jam lokasi)
- [ ] Upload foto bukti transfer di modul pembayaran

<!--NEXT-->
