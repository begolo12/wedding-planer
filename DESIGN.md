# DESIGN.md: Aisyah & Bagas Wedding Planner

Status: draft v1.0. Produk ini belum punya pemilik brand identity yang disetujui, jadi dokumen ini adalah **usulan arah desain**, bukan keputusan final.

---

## 1. Design Read

> Membaca dokumen ini sebagai: **alat kerja pribadi untuk pasangan yang sedang menyiapkan pernikahan**, dengan bahasa visual "buku tamu digital", dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

Alasan pemilihan dial:

- **ENERGY 2** (bukan 3). Pasangan yang sedang menyiapkan wedding melakukan iterasi berkali-kali, tapi setiap iterasi terasa seperti tegangan. Energy 3 akan terasa seperti produk marketing dan membuat mereka merasa aplikasi ini untuk orang lain, bukan untuk mereka. Energy 2 memberi rasa tenang dan bisa dipercaya, yang dibutuhkan orang yang punya anggaran 100 juta dan sedang stres.
- **RHYTHM 2** (bukan 3). Aplikasi ini dipakai berbulan-bulan, bukan sekali lihat. Varian layout di dalam dashboard menambah beban kognitif, bukan mengurangi. Yang varies di sini bukan seksi, tapi bentuk data: daftar, timeline, dan budget masing-masing punya komposisi berbeda secara alami.
- **MOTION 1** (bukan 2 atau 3). Motion dipakai hanya untuk memberi tahu perubahan state: task overdue berubah warna, tab aktif berubah. Bukan scroll-reveal, bukan parallax. Alasannya: aplikasi ini sering dibuka di perjalanan, di venue, dengan koneksi buruk. Animasi yang harus menunggu selesai untuk dibaca adalah animasi yang sia-sia.

DESIGN.md ini ada, jadi output ini bukan "draft tanpa arah". Keputusan di bawah diambil dari dokumen ini, bukan dari default.

---

## 2. Identitas

### Nama produk

`Aisyah & Bagas` adalah nama pasangan contoh. Nama produk sebenarnya belum ditentukan dan perlu dikonfirmasi pemilik proyek.

Selama development, teks UI memakai `Aisyah & Bagas`. Setelah ada keputusan, cukup ganti di satu file konfigurasi.

### Suara (voice)

Produk ini berbicara dalam kalimat pendek, tanpa jerga, dan memakai istilah yang benar-benar dipakai keluarga Indonesia:

- Pakai "undangan", bukan "invitation management"
- Pakai "bayar DP", bukan "vendor payment tracking"
- Pakai "nikah", bukan "pernikahan sivil" di sidebar
- Bahasa: Bahasa Indonesia santai, bukan Inggris campur seperti "Let's plan your perfect day"
- Angka rupiah memakai pemisah ribuan tanpa desimal: `Rp 4.500.000`

---

## 3. Palet warna

Batas aktif: 2 core + 1 accent, sesuai R-29. Netral tidak dihitung.

| Peran | Nilai | Alasan (R-31) |
|---|---|---|
| Base / surface | `#FBF9F6` | Warna kertas, bukan putih murni. Pasangan yang sedang scroll budget di bawah matahari akan lelah dengan `#FFFFFF`. |
| Ink (teks utama dan border) | `#2B2622` | Coklat-hitam, bukan `#000000`, supaya nyambung dengan nuansa undangan cetak. |
| Core 1, Sage | `#5C7A6B` | Hijau yang sudah lazim dipakai sebagai warna dekorasi wedding di Indonesia. Dipakai di tombol selesai, checklist, dan status sukses tanpa berubah warna per konteks. |
| Core 2, Terracotta | `#B5643C` | Dipakai hanya di CTA utama dan di angka budget yang perlu perhatian. Bukan warna status. |
| Accent, Marigold | `#E0A62B` | Sekali per layar, untuk hal yang benar-benar perlu diklik: tanggal hari-H, atau satu task yang jatuh tempo 3 hari lagi. Tidak pernah lebih dari satu per view. |
| Netral | Ink pada 8% (`#F1EDE8`) | Latar baris tabel dan area input. |

### Aturan warna yang wajib dijaga

- **Terracotta tidak pernah dipakai untuk status.** Status punya warna sendiri: sage = selesai, netral = belum, merah bata = terlambat. Kalau warna CTA dan warna "terlambat" sama, orang tidak tahu mana yang harus diklik.
- **Marigold maksimal satu elemen per layar.** Kalau ada dua task jatuh tempo, yang kedua pakai warna ink. Kalau semua hal penting berwarna kuning, tidak ada yang penting.
- **Mode gelap bukan warna yang dibalik.** Mode gelap punya base sendiri, `#1C1917`, dengan ink `#F5F1EC`, sage `#8FB39C`, terracotta `#D98B62`, marigold `#F0C05A`. Nilai sage dan terracotta dibuat lebih terang supaya identitas brand tetap sama di kedua theme.

### Mode gelap (R-21, R-34)

Mode gelap adalah feature, bukan jadual. Alasannya: banyak pasangan yang sudah punya anak kecil akan menyiapkan wedding sebagian besar di malam hari, saat anak sudah tidur.

Toggle: tombol di header, state disimpan di `localStorage`, dengan key `aisyah-theme`. Saat app dibuka lagi, state dibaca sebelum render supaya tidak ada kilatan warna.

---

## 4. Tipografi

Alasan (R-31): produk ini dipakai sambil menggendong bayi, di bawah matahari, dengan satu tangan. Tipografi dipilih supaya scanning cepat, bukan supaya terlihat Signing.

| Peran | Typeface | Alasan |
|---|---|---|
| Judul | `Fraunces` | Serif dengan kontras tinggi yang punya rasa "undangan cetak". Serius tanpa kaku. Dipilih untuk membedakan diri dari sans-serif Inter yang jadi default. |
| Body dan UI | `Public Sans` | Sans-serif yang dirancang untuk layanan publik (sumber: USWDS). Sifatnya mudah dibaca dan dipindai, kontras tinggi, mendukung penuh Bahasa Indonesia. |
| Angka | `Public Sans` dengan `font-variant-numeric: tabular-nums` | Kolom budget harus sejajar ke kanan dan tidak boleh goyang saat angka berubah. |

Ukuran fluid dengan `clamp()`. Mobile punya step sendiri, lihat `docs/05-IA-dan-Layar.md` bagian 4.

---

## 5. Motif dan komposisi

### Identity motif: garis itinerary

Motif visual yang berulang: **sebuah garis vertikal tipis dengan titik kecil di setiap titik**, bentuknya seperti itinerary wedding atau jam yang di-point.

Motif ini muncul di:

- Timeline task, dengan garis dan titik di kiri, isi task di kanan
- Kalender, dengan titik di hari yang punya isinya
- Dashboard, dengan garis yang mengarah ke hari-H

Alasan motif ini dipilih: bentuk ini benar-benar cuma ada di aplikasi wedding. Kalau logo dan nama produk ditukar, motif ini masih langsung menunjuk "ini aplikasi wedding". Motif ini yang membuat produk punya identitas sendiri, bukan hanya warna.

### Aturan komposisi dashboard

Dashboard bukan grid 4 kartu identik. Komposisinya:

```
┌─────────────────────────────────────────────────┐
│ Status bar: hari-H + total budget terpakai      │  live region, satu-satunya tempat marigold muncul
├──────────────────────┬──────────────────────────┤
│                      │                          │
│  Timeline task       │   Budget ringkasan       │
│  garis dan titik     │   angka dan bar tipis    │
│  60% lebar           │   40% lebar              │
│                      │                          │
│  (mobile: ke atas)   │   (mobile: ke bawah,     │
│                      │    bukan bersamping)     │
└──────────────────────┴──────────────────────────┘
```

Alasan komposisi 60/40: task adalah yang dipakai harian, budget dipakai sebulan sekali. Layout harus mengikuti frekuensi pemakaian, bukan pembagian rata.

### Radius dan spacing

- Radius: `4px` untuk kontrol, `8px` untuk card, `14px` untuk panel besar. Tidak ada pill di mana pun.
- Alasan: pill di semua tempat menghapus bahasa visual. Kalau tombol, input, dan card punya bentuk yang sama, bentuk tidak lagi memberi informasi.
- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Mobile memakai step yang lebih kecil untuk padding section, `32px` dibanding `64px`.
- Shadow: hanya pada elemen yang benar-benar mengambang, yaitu dropdown, dialog, dan toast. Tidak ada shadow pada card, karena card tidak mengambang di atas halaman.

---

## 6. State yang wajib ada di setiap view yang menampilkan data (R-27)

Tiga state standar plus satu yang sering terlupakan:

| State | Contoh konkret di app ini |
|---|---|
| Loading | Skeleton dengan bentuk yang sama dengan konten asli. Bentuk skeleton harus sama dengan isi, karena kalau berbeda orang mengira layout berubah. |
| Empty | Copy-nya spesifik, bukan "No data". Contoh: checklist tugas butuh 24 item dan belum ada satu pun yang selesai, teksnya "Belum ada tugas yang selesai. Mulai dari yang paling dekat dengan tanggal." |
| Error | Menyebut tindakan. "Gagal menyimpan. Cek koneksi, lalu coba lagi." dengan tombol "Coba lagi" yang benar-benar mengulang request. |
| Offline | Banner persisten dengan aksi. "Mode offline. Perubahan disimpan di perangkat dan akan terkirim otomatis." |

Offline adalah state keempat karena aplikasi ini PWA dan dipakai di venue tanpa sinyal.

---

## 7. Aksesibilitas

Detail lengkap di `docs/08-NFR.md`. Yang mengikat ke UI:

- Semua kontrol interaktif minimal `44 x 44px`. Ini wajib karena pasangan yang memakai aplikasi ini sering sambil menggendong bayi.
- Kontras teks normal minimal `4.5:1`, teks besar minimal `3:1`. Warna sage `#5C7A6B` di atas base `#FBF9F6` sudah dihitung memenuhi standar ini.
- Setiap fokus keyboard punya indikator yang terlihat, `2px` outline marigold dengan `2px` offset.
- Dialog bisa ditutup dengan `Escape`. Dropdown bisa ditutup dengan `Escape` dan klik di luar.
- Tidak ada `outline: none` tanpa pengganti.

---

## 8. Apa yang tidak dipakai, dan kenapa

Antislop tidak melarang teknik secara daftar, tapi menanyakan "itu melayani apa?". Kalau tidak bisa dijawab, keluar dari dokumen.

| Yang tidak dipakai | Alasan |
|---|---|
| Gradient biru ke ungu | Warna brand adalah sage dan terracotta. Tidak ada di palette. |
| Glassmorphism | Aplikasi ini dipakai di bawah matahari dengan kontras tinggi. Blur mengurangi kontras teks. |
| Background grid atau graph paper | Tidak ada hubungan dengan undangan. |
| Monospace besar untuk heading | Judul memakai serif. |
| Emoji di UI | Emoji di sidebar kehilangan makna di ukuran kecil, dan mobile sidebar akan jadi 5 emoji tanpa arti. |
| Card grid 4 kolom identik | Diganti komposisi 60/40 di atas dan daftar vertikal di listing vendor. |
| Logo bar "trusted by" | Belum ada customer real. Lihat `docs/01-PRD.md` bagian social proof. |
| Testimonial | Belum ada customer real. Section testimonial tidak dibangun sampai ada review asli. |
| Dark mode sebagai default | Default adalah mode terang, karena aplikasi ini dipakai di bawah matahari. |
| Badge "AI Powered" | Tidak ada fitur AI di produk ini. |
| Nav link ke halaman yang belum ada | Setiap item navigasi di `docs/05-IA-dan-Layar.md` punya route yang benar-benar ada. |

---

## 9. Decision log

| Keputusan | Alasan | Tanggal |
|---|---|---|
| Sage + terracotta sebagai core | Warna yang sudah lazim di dekorasi wedding Indonesia, jadi terasa asli, bukan terlihat didesain | 2026-09-30 |
| Fraunces untuk judul | Membedakan dari sans-serif default, punya rasa undangan cetak | 2026-09-30 |
| Public Sans untuk body | Dirancang untuk mudah dibaca dan dipindai, kontras tinggi, mendukung Bahasa Indonesia | 2026-09-30 |
| Motif garis itinerary | Bentuk yang cuma ada di aplikasi wedding, bertahan meski logo ditukar | 2026-09-30 |
| Tidak ada pill | Radius jadi alat hierarchy, bukan dekorasi | 2026-09-30 |
| Tidak ada testimonial di Fase 1 | Belum ada customer real,/testimonial palsu merusak kepercayaan lebih banyak daripada tidak ada | 2026-09-30 |

---

## 10. Cara memakai dokumen ini

1. Setiap komponen baru mengambil warna dari bagian 3, tidak memilih warna sendiri.
2. Setiap pilihan layout mengambil dari bagian 5, tidak membuat pattern baru.
3. Kalau ada keputusan yang bertentangan dengan dokumen ini, catat di `docs/11-Delivery-Plan.md` bagian "Risiko dan keputusan tertunda", bukan diubah diam-diam.
4. Kalau pemilik proyek tersedia dan belum menentukan arah desain, ajukan satu pertanyaan yang menentukan saja, bukan daftar pertanyaan.
