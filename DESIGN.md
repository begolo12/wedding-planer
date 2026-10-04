# DESIGN.md: Rapi Nikah Wedding Planner

Status: v2.0, arah "Blushing Romance". Arah ini menggantikan usulan sage dan terracotta di v1.0. Rujukannya adalah proyek desain "Cute Wedding Planner" di Google Stitch, dan hasilnya sudah diterapkan ke `src/app/globals.css`.

---

## 1. Design Read

> Membaca dokumen ini sebagai: **alat kerja pribadi untuk pasangan yang sedang menyiapkan pernikahan**, dengan bahasa visual "buku tamu digital", dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

Alasan pemilihan dial:

- **ENERGY 2** (bukan 3). Pasangan yang sedang menyiapkan wedding melakukan iterasi berkali-kali, tapi setiap iterasi terasa seperti tegangan. Energy 3 akan terasa seperti produk marketing dan membuat mereka merasa aplikasi ini untuk orang lain, bukan untuk mereka. Energy 2 memberi rasa tenang dan bisa dipercaya, yang dibutuhkan orang yang punya anggaran 100 juta dan sedang stres.
- **RHYTHM 2** (bukan 3). Aplikasi ini dipakai berbulan-bulan, bukan sekali lihat. Varian layout di dalam beranda menambah beban kognitif, bukan mengurangi. Yang berubah di sini bukan bagian layar, tapi bentuk data: daftar, garis waktu, dan anggaran masing-masing punya komposisi berbeda secara alami.
- **MOTION 1** (bukan 2 atau 3). Motion dipakai hanya untuk memberi tahu perubahan state: task overdue berubah warna, tab aktif berubah. Bukan scroll-reveal, bukan parallax. Alasannya: aplikasi ini sering dibuka di perjalanan, di venue, dengan koneksi buruk. Animasi yang harus menunggu selesai untuk dibaca adalah animasi yang sia-sia.

DESIGN.md ini ada, jadi dokumen ini bukan "draft tanpa arah". Keputusan di bawah diambil dari dokumen ini, bukan dari default.

---

## 2. Identitas

### Nama produk

`Rapi Nikah` adalah nama produk. Nama pasangan yang sebenar diambil dari akun pengguna, bukan ditulis di dokumen ini atau di kode.

### Suara (voice)

Produk ini berbicara dalam kalimat pendek, tanpa jerga, dan memakai istilah yang benar-benar dipakai keluarga Indonesia:

- Pakai "undangan", bukan "invitation management"
- Pakai "bayar DP", bukan "vendor payment tracking"
- Pakai "nikah", bukan "pernikahan sivil" di sidebar
- Bahasa: Bahasa Indonesia santai, bukan Inggris campur seperti "Let's plan your perfect day"
- Angka rupiah memakai pemisah ribuan tanpa desimal: `Rp 4.500.000`

---

## 3. Palet warna

Batas aktif: 2 core plus 1 aksen, sesuai R-29. Netral tidak dihitung.

| Peran | Nama | Nilai | Alasan (R-31) |
|---|---|---|---|
| Base / surface | Soft Cream | `#FFFDF9` | Krem, bukan putih murni. Pasangan yang scroll budget di bawah matahari akan lelah dengan `#FFFFFF`. |
| Ink | Rosy Charcoal | `#4A3B43` | Coklat keunguan, bukan `#000000`. Lebih lembut dari hitam dan masih nyambung dengan nuansa undangan. |
| Core 1, Blush | Blush Blossom | `#FFB7C5` | Warna utama arah ini. Dipakai sebagai isian tombol dan penanda, bukan sebagai warna teks. Di kanvas terang, blush gagal `4,5:1` sebagai teks kecil, lihat bagian 7. |
| Core 2, Peach | Warm Peach | `#FFD6BA` | Menemani blush di gradasi hero dan chip. Hangat, tidak menyaingi blush. |
| Aksen, Lilac | Lilac Whisper | `#E8D7F1` | Aksen ungu muda. Dipakai di chip ketiga dan di rel progres RSVP. Sekali sampai dua kali per layar. |
| Netral | Blush Silk | `#FFF0F5` | Latar panel, baris tabel, dan area input. Blush yang diredam sangat jauh. |

### Token di `globals.css`

Nama token lama dipertahankan walau artinya bergeser, karena sekitar 130 pemakaian di 20 berkas memanggil nama-nama itu langsung. Mengganti nama berarti menyentuh 20 berkas tanpa satu pun perubahan tampilan.

| Token | Nilai terang | Peran baru |
|---|---|---|
| `--color-base` | `#fffdf9` | Soft Cream, kanvas |
| `--color-ink` | `#4a3b43` | Rosy Charcoal, teks utama |
| `--color-terracotta` | `#ffb7c5` | Blush, isian tombol utama |
| `--color-marigold` | `#864e5a` | Blush gelap, dipakai untuk teks aksen dan cincin fokus |
| `--color-sage` | `#665a6f` | Ink Lilac, status dan ikon aktif |
| `--color-netral` | `#fff0f5` | Blush Silk, latar panel |
| `--color-bata` | `#ba1a1a` | Merah galat |
| `--color-line` | `#d6c2c4` | Garis tipis, outline varian |
| `--color-muted` | `#72666b` | Teks sekunder |

### Aturan warna yang wajib dijaga

- **Blush tidak pernah jadi warna teks di kanvas terang.** `#FFB7C5` di atas `#FFFDF9` hanya `1,6:1`. Sebagai isian besar dengan tulisan Rosy Charcoal, rasionya `6,42:1` dan aman. Untuk teks aksen dipakai Blush gelap `#864e5a`.
- **Aksen maksimal dua elemen per layar.** Kalau semua hal penting berwarna lilac, tidak ada yang penting.
- **Warna tidak pernah jadi satu-satunya penanda.** Status selalu punya teks di samping warnanya.
- **Mode gelap bukan warna yang dibalik.** Mode gelap punya base sendiri, `#1F181C`, dengan ink `#F4E9EE`, lilac `#C4B3CF`, dan blush tetap `#FFB7C5`. Nilainya disusun sebagai pasangan, bukan hasil inversi.

### Mode gelap (R-21, R-34)

Mode gelap adalah fitur, bukan jadwal. Alasannya: banyak pasangan yang sudah punya anak kecil akan menyiapkan wedding sebagian besar di malam hari, saat anak sudah tidur.

Toggle: tombol di header, state disimpan di `localStorage`, dengan key `haribesar-tema`. Nama kunci itu sengaja dipertahankan walau nama produk kini `Rapi Nikah`, supaya pilihan tema pengguna lama tidak hilang; kunci perangkat tidak terlihat pengguna dan tidak ikut berganti kalau nama produk berganti. Saat app dibuka lagi, state dibaca sebelum render supaya tidak ada kilatan warna.

---

## 4. Tipografi

Alasan (R-31): produk ini dipakai sambil menggendong bayi, di bawah matahari, dengan satu tangan. Tipografi dipilih supaya scanning cepat.

| Peran | Typeface | Alasan |
|---|---|---|
| Judul dan label | `Plus Jakarta Sans` | Sans-serif dengan rasa hangat dan bulat yang cocok dengan blush, tapi tetap rapi untuk angka dan label. Mendukung penuh Bahasa Indonesia. |
| Body dan UI | `Be Vietnam Pro` | Sans-serif kontras tinggi yang mudah dipindai, bagian body dari arah "Blushing Romance". |
| Angka | `Be Vietnam Pro` dengan `font-variant-numeric: tabular-nums` | Kolom budget harus sejajar ke kanan dan tidak boleh goyang saat angka berubah. |

Skala ukuran, dari `desain.json`:

| Nama | Ukuran | Berat | Line-height | Letter-spacing |
|---|---|---|---|---|
| display | 40px | 700 | 1 | `-0.02em` |
| display-mobile | 32px | 700 | 40px | 1 |
| headline-lg | 28px | 600 | 36px | `-0.01em` |
| headline-md | 22px | 600 | 30px | 1 |
| headline-sm | 18px | 600 | 24px | 1 |
| body-lg | 16px | 400 | 24px | 1 |
| body-md | 14px | 400 | 20px | 1 |
| label-lg | 14px | 600 | 20px | `0.01em` |
| label-md | 12px | 600 | 16px | `0.02em` |
| label-sm | 10px | 700 | 14px | `0.04em` |

Mobile punya step sendiri, lihat `docs/05-IA-dan-Layar.md` bagian 4.

---

## 5. Motif dan komposisi

### Identity motif: garis itinerary

Motif visual yang berulang: **sebuah garis vertikal tipis dengan titik kecil di setiap titik**, bentuknya seperti itinerary wedding atau jam yang di-point.

Motif ini muncul di:

- Timeline task, dengan garis dan titik di kiri, isi task di kanan
- Kalender, dengan titik di hari yang punya isinya
- Beranda, dengan garis yang mengarah ke hari-H

Alasan motif ini dipilih: bentuk ini benar-benar cuma ada di aplikasi wedding. Kalau logo dan nama produk ditukar, motif ini masih langsung menunjuk "ini aplikasi wedding". Motif ini yang membuat produk punya identitas sendiri, bukan hanya warna.

Lambang merek adalah gambar jadi dari rancangan Stitch, bukan bentuk yang digambar ulang di kode. Berkasnya di `public/merek/`, dipotong dari `docs/stitch_cute_wedding_planner/sweet_ties_wedding_planner_logo` lewat `scripts/buat-merek.ps1`, dan dipakai lewat komponen `Merek`. Ukuran berkas dipilih menurut besar tampilnya: 192px untuk chip kecil, 512px untuk lambang besar.

### Aturan komposisi beranda

Beranda bukan grid 4 kartu identik. Komposisinya:

```text
hitung: 60 persen garis waktu task, 40 persen ringkasan anggaran
mobile: task ke atas, anggaran ke bawah, tidak bersamping
desktop 1280px ke atas: task kiri, anggaran kanan, rasio kolom 1,6 : 1
   dengan gutter 16px, jadi kolom utama terukur 60,5 persen dari kontainer
hero: gradasi 135 derajat, Blush Silk ke Warm Peach
```

Alasan komposisi 60/40: task adalah yang dipakai harian, budget dipakai sebulan sekali. Layout harus mengikuti frekuensi pemakaian, bukan pembagian rata.

### Radius dan spacing

Arah "Blushing Romance" memakai bentuk bulat penuh sebagai bahasa visualnya. Ini kebalikan dari v1.0 yang melarang pill.

| Peran | Nilai |
|---|---|
| Kontrol (tombol, input, chip, lencana) | pill, `9999px` |
| Card | `2rem` |
| Panel | `2rem` |
| Lembar bawah | `3rem` |

- Alasan pill di sini bukan dekorasi: arah ini hangat dan lembut, dan bentuk bulat penuh yang diulang konsisten justru jadi penanda. Yang bikin bahasa visual hilang adalah pill pada semua bentuk tanpa kecuali, termasuk card. Karena itu card tetap `2rem`, bukan pill.
- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`, dengan `1.25rem` margin layar dan `1rem` gutter.
- Tinggi minimum: tombol `48px`, input `52px`, target sentuh `44x44px`.
- Shadow: dua tingkat, keduanya lembut dan berwarna blush. `--bayang-1` untuk card yang berdiri sendiri, `--bayang-2` untuk yang mengambang seperti dialog dan toast. Semua shadow memakai ambient blush, bukan hitam pekat.
- Gradasi dipakai di satu tempat saja: hero hitung mundur di Beranda, `135deg` dari Blush Silk ke Warm Peach. Di luar itu tidak ada gradasi.

### Komposisi desktop (wajib, berlaku mulai `expanded`, lebar di atas 1023px)

Bagian ini mengikat semua layar. Angka di bawah bukan saran, dan setiap kelas yang disebut sudah ada di `globals.css`, jadi layar baru cukup memakainya, tidak menyusun aturan sendiri.

**1. Satu kontainer, 1200px, di tengah.** `.bungkus` (isi halaman) dan `.kepala-app-dalam` (kepala aplikasi) memakai lebar maksimum `1200px` dengan `margin: 0 auto`. Di `expanded`, isi kontainer memakai padding `32px` kiri kanan dan `48px` bawah. Tidak ada layar yang menambah batas lebar sendiri, dan tidak ada kolom yang menempel kiri tanpa `margin: 0 auto` kecuali form satu kolom di bawah ini.

**2. Isi wajib mengisi sisa lebar.** `.isi-app` di dalam `.tata-app` wajib `flex: 1 1 auto; min-width: 0`. Tanpa `flex`, lebarnya jatuh ke max-content halaman: diukur di 1568px, kolom isi hanya terpakai 1060px padahal tersedia 1313px, jadi separuh kanan layar kosong.

**3. Grid dua kolom untuk layar daftar.** Wadahnya `.grid-daftar`: satu kolom di bawah 1023px, dua kolom mulai 1023px dengan `grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr)` dan gutter `16px`. Artinya kolom utama memakai 60 sampai 66 persen kontainer (terukur 60,1 persen di 1024px dan 60,7 persen di 1568px) dan rel samping 34 sampai 40 persen. Isi rel hanya dua macam: ringkasan, atau aksi cepat. Rel tidak pernah dipakai untuk menaruh daftar utama.

**4. Satu kepala per layar, dua baris.** Kepala selalu dua baris di dalam kontainer yang sama.
- Baris identitas: `.kepala-app`, dari tata letak, sama untuk semua layar. Isinya lambang produk, nama produk, tombol tema, dan tautan Akun. Tidak ada judul halaman di sini.
- Baris judul: `.kepala-halaman`, dari halaman. Isinya `h1` yang menjelaskan isi layar, satu kalimat pengantar, dan satu aksi utama rata kanan. Judul tidak pernah ditulis dua kali.

**5. Satu panel untuk satu daftar.** Tab, filter, dan daftar duduk di dalam satu `.panel-daftar` dengan lebar penuh kolom. Kepala panel (`.panel-daftar-kepala`) berisi baris tab saja, dan di `expanded` tab wajib muat satu baris: baris tab adalah navigasi modul, dan membelahnya jadi dua baris membuat modul terakhir tidak terlihat. Aksi sekunder yang dulu menempel di baris tab pindah ke rel samping sebagai `.panel-aksi-cepat`. Daftar yang kosong tetap berada di dalam panel ini.

**6. Keadaan kosong dan keadaan gagal rata kiri, di dalam panel.** `.kosong` selalu `align-items: flex-start` dan `text-align: left`, dan punya permukaan panel sendiri (`--color-kartu-putih`, `--radius-panel`). Satu layar hanya boleh punya satu sumbu perataan: keadaan kosong harus sejajar dengan baris filter di atasnya, bukan di tengah kanvas. Kalau `.kosong` sudah berada di dalam `.panel-daftar`, permukaannya dimatikan supaya tidak ada kartu di dalam kartu.

**7. Jarak hanya dari skala.** Jarak antarbagian memakai kelipatan `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`: antar elemen dalam satu baris `8`, antar bagian di dalam panel `16`, antar bagian besar di halaman `24`, jarak tepi kontainer `32`. Tidak boleh ada ruang kosong lebih dari `48px` tanpa isi di dalam satu panel. Terukur di `/rencana`: kepala panel ke baris filter `16px`, baris pencarian ke keadaan kosong `16px`.

**8. Latar menutup penuh setinggi viewport di kedua tema.** `html` dan `.tata-app` memakai `background: var(--color-base)` dan `.tata-app` `min-height: 100vh`. Tidak ada warna tema terang yang boleh dipakai lewat nilai hex langsung; semua latar lewat token, supaya di mode gelap tidak ada bidang terang yang bocor. `--color-kotak-abu` tidak dipakai sebagai trek bar jika latar di belakangnya juga `--color-kotak-abu`.

**9. Aksen maksimal dua bidang per layar.** Yang dihitung sebagai bidang aksen: kontrol yang bisa ditekan dan terisi penuh warna aksen (tombol utama, pil saring aktif, tab aktif, sakelar menyala) dan batang progres. Yang tidak dihitung: chip status yang tidak bisa ditekan, ikon atau tulisan berwarna aksen di atas permukaan netral, dan bayangan. Contoh yang sudah benar:

| Layar | Bidang aksen 1 | Bidang aksen 2 |
|---|---|---|
| Rencana | tombol `Tambah tugas` (blush) | batang progres (marigold) |
| Beranda | tombol `Tambah tugas` di kepala halaman (blush) | tidak ada, hero memakai gradasi |

Karena itu tab aktif dan pil saring aktif tidak memakai warna aksen: keduanya ditandai pembalikan `--color-ink` (latar tinta, tulisan kanvas), yang justru punya kontras paling tinggi. Bila `--color-primary` dipakai di semua hal yang penting, tidak ada lagi yang penting.

Pengecualian: pita di tingkat aplikasi (`.pita` untuk ajakan pasang, `.pita-luring` untuk keadaan sambungan) berada di luar area halaman dan tidak dihitung dalam anggaran aksen halaman. Anggaran itu dihitung per layar, bukan per viewport.

**10. Gradasi hanya di satu tempat.** Hero hitung mundur Beranda. Di luar itu, termasuk kartu progres, batang progres, tombol melayang, dan panel, tidak ada `linear-gradient` sebagai latar. Batang progres memakai satu warna token, `--color-marigold`, bukan gradasi.

**11. Satu tombol utama untuk satu aksi, per layar.** Satu layar hanya boleh punya satu kontrol bergaya utama untuk satu pekerjaan. Layar yang memakai tombol melayang (`.rencana-fab`, `.tamu-fab`, `.anggaran-fab`) menyembunyikan aksi kepala halamannya di bawah 1023px (`.hanya-expanded`), dan menyembunyikan tombol melayangnya di `expanded`. Alasannya di `docs/05-IA-dan-Layar.md` bagian 7: tombol tetap di bawah adalah pola jari, bukan pola tetikus.

**12. Dua layar satu kolom yang dikecualikan.** `/rencana/plan` (`.rencana-plan`, maksimum `640px`) dan `/akun` (maksimum `880px`) memang satu kolom karena isinya form. Keduanya memakai `margin-inline: auto` supaya kolomnya duduk di tengah kontainer, bukan menempel kiri.

**13. Kelas bantu yang boleh dipakai layar lain tanpa menyentuh `globals.css`.** Daftar ini yang jadi kontrak antara aturan komposisi dan pekerja layar.

| Kelas | Untuk apa | Angka |
|---|---|---|
| `.grid-daftar` | Layar daftar: kolom utama + rel kanan | 1 kolom di bawah 1023px, `1.6fr : 1fr` + gutter 16px mulai 1023px |
| `.rel-samping` | Isi rel kanan: ringkasan atau aksi cepat | satu kolom, gap 24px |
| `.panel-daftar` + `.panel-daftar-kepala` | Wadah tunggal tab + filter + daftar | gap 16px; kepala panel berisi baris tab saja, dan di expanded tab muat satu baris |
| `.kartu-progres` + `.kartu-progres-angka` + `.kartu-progres-ket` | Ringkasan progres di rel | satu kolom penuh, angka maksimum 40px |
| `.panel-aksi-cepat` | Aksi sekunder yang tidak boleh menempel di baris tab | satu kolom rata kiri, gap 12px, maksimum satu tombol sekunder di dalamnya |
| `.baris-meta` | Metadata baris tugas | satu bentuk untuk semua metadata di dalamnya; `.lencana` di dalam `.baris-meta` tampil sebagai teks, bukan chip |
| `.kisi-dua` | Daftar kartu yang maksimal dua kolom (vendor, busana) | 1 kolom di bawah 1080px, `repeat(2, minmax(360px, 1fr))` mulai 1080px |
| `.rekap-tiga` | Panel angka yang isinya tepat tiga (pembayaran vendor) | `repeat(3, minmax(0, 1fr))` mulai 640px; `.rekap-dua` untuk dua angka |
| `.sakelar` + `.sakelar-jalur` + `.sakelar-titik` | Kontrol nyala/mati | tinggi 52px, jalur 44x24px |
| `.hanya-expanded` | Aksi kepala halaman pada layar yang punya tombol melayang | sembunyi di bawah 1023px |
| `.kepala-halaman` | Judul + satu aksi utama | rata kanan, `h1` maksimum 40px |

Kelas di luar daftar ini tidak boleh dipakai untuk kepentingan tata letak baru; usulkan dulu ke pemilik `globals.css`.

**14. Layar publik di luar tata letak aplikasi.** Layar masuk dan daftar (`/masuk`, `/daftar`) memakai varian dua kolom mulai 1023px: kepala dan lambang di kiri (`.auth-kepala`), kartu form di kanan (`.auth-kartu`, `align-self: center` supaya tingginya mengikuti isi), dan strip jaminan (`.auth-aman`) di bawah kepala. Di bawah 1023px susunannya tetap satu kolom seperti rancangan Stitch, jadi tidak ada yang berubah di HP. Sebelumnya, kolom 480px berdiri sendiri di tengah dan di 1440px menyisakan hampir separuh layar kosong; itu keluhan yang sama dengan `/rencana` sebelum diperbaiki.
Layar baca statis (`/aplikasi`, `/luring`, `/kebijakan`) tetap satu kolom `min(720px, 100%)` di tengah, karena isinya teks panjang dan lebar baca yang enak justru lebih penting daripada memakai seluruh kanvas. Layar tautan publik (`/bagikan/{token}`) tetap `min(840px, 100%)` dengan pita alat yang sticky, karena keluarga membukanya dari HP.

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
- Kontras teks normal minimal `4.5:1`, teks besar minimal `3:1`.
- Setiap fokus keyboard punya indikator yang terlihat, `3px` outline Blush gelap dengan `2px` offset.
- Dialog bisa ditutup dengan `Escape`. Dropdown bisa ditutup dengan `Escape` dan klik di luar.
- Tidak ada `outline: none` tanpa pengganti.

### Kendala blush dan cara mengatasinya

Blush `#FFB7C5` sudah diukur, bukan dikira-kira. Sebagai isian dengan tulisan Rosy Charcoal hasilnya `6,42:1` dan aman. Tapi blush di atas kanvas terang hanya `1,61:1`, jadi blush tidak pernah dipakai sebagai warna teks kecil.

Karena itu teks aksen memakai blush gelap `#864e5a`, yang di kanvas terang mencapai `6,36:1`. Nilai ini dipilih setelah diukur, bukan dipilih supaya cocok dengan nama warnanya.

### Koreksi kontras hasil pengukuran

Semua pengukuran dilakukan pada teks ukuran 14 sampai 16px, jadi yang berlaku ambang `4.5:1`, bukan `3:1`.

| Warna | Nilai awal | Nilai dipakai | Rasio sebelum | Rasio sesudah |
|---|---|---|---|---|
| Blush sebagai isian | `#FFB7C5` + teks `#4A3B43` | sama | `6,42` | `6,42` |
| Teks aksen | `#FFB7C5` | blush gelap `#864e5a` | `1,61` | `6,36` |
| Teks muted di kanvas | `#8A8A8A` | `#72666b` | `3,10` | `5,40` |
| Teks muted di panel | `#72666b` | sama | `4,97` | `4,97` |
| Lilac Lilac Whisper sebagai isian | `#E8D7F1` + teks `#4A3B43` | sama | `8,9` | `8,9` |

Alasan setiap perubahan: nilai yang terlihat benar secara mata gagal `4.5:1` kalau dihitung. Blush sebagai teks adalah kegagalan terbesar, dari `1,61` naik jadi `6,36` setelah diganti blush gelap. Teks muted digelapkan sampai `5,40` di kanvas dan `4,97` di panel, keduanya lewat ambang.

Deskripsi versi ini berlaku untuk mode terang. Mode gelap punya palet pasangannya sendiri, hasilnya juga nol kegagalan.

---

## 8. Apa yang tidak dipakai, dan kenapa

Antislop tidak melarang teknik secara daftar, tapi menanyakan "itu melayani apa?". Kalau tidak bisa dijawab, keluar dari dokumen.

| Yang tidak dipakai | Alasan |
|---|---|
| Blush sebagai warna teks di kanvas terang | Gagal `4.5:1` di `1,61`. Blush hanya isian, teks aksen pakai blush gelap. |
| Glassmorphism | Aplikasi ini dipakai di bawah matahari dengan kontras tinggi. Blur mengurangi kontras teks. |
| Background grid atau graph paper | Tidak ada hubungan dengan undangan. |
| Monospace besar untuk heading | Judul memakai Plus Jakarta Sans. |
| Emoji di UI | Emoji di sidebar kehilangan makna di ukuran kecil, dan mobile sidebar akan jadi 5 emoji tanpa arti. |
| Card grid 4 kolom identik | Diganti komposisi 60/40 di atas dan daftar vertikal di listing vendor. |
| Logo bar "trusted by" | Belum ada customer real. Lihat `docs/01-PRD.md` bagian social proof. |
| Testimonial | Belum ada customer real. Section testimonial tidak dibangun sampai ada review asli. |
| Dark mode sebagai default | Default adalah mode terang, karena aplikasi ini dipakai di bawah matahari. |
| Badge "AI Powered" | Tidak ada fitur AI di produk ini. |
| Nav link ke halaman yang belum ada | Setiap item navigasi di `docs/05-IA-dan-Layar.md` punya route yang benar-benar ada. |
| Gradasi di luar hero hitung mundur | Satu gradasi saja. Kalau semua panel bergradasi, tidak ada yang jadi titik fokus. |

---

## 9. Decision log

| Keputusan | Alasan | Tanggal |
|---|---|---|
| Blush plus peach sebagai core | Arah hangat dari proyek "Cute Wedding Planner", dan blush aman sebagai isian besar | 2026-10-01 |
| Plus Jakarta Sans untuk judul dan label | Bulat dan hangat, cocok dengan blush, masih rapi untuk angka dan label | 2026-10-01 |
| Be Vietnam Pro untuk body | Kontras tinggi, mudah dipindai, mendukung Bahasa Indonesia | 2026-10-01 |
| Pill untuk semua kontrol | Bahasa visual arah ini bulat penuh, diulang konsisten supaya jadi penanda | 2026-10-01 |
| Card tetap `2rem`, bukan pill | Pill pada semua bentuk termasuk card menghapus hierarchy bentuk | 2026-10-01 |
| Blush tidak pernah jadi teks | Di kanvas terang hanya `1,61:1`, gagal sebagai teks kecil | 2026-10-01 |
| Nama token lama dipertahankan | Mengganti nama berarti menyentuh 20 berkas tanpa perubahan tampilan | 2026-10-01 |
| Tidak ada testimonial di Fase 1 | Belum ada customer real, testimonial palsu merusak kepercayaan lebih banyak daripada tidak ada | 2026-09-30 |
| Nama produk `Rapi Nikah` | Berbahasa Indonesia, netral untuk semua agama dan adat, 10 karakter sehingga aman untuk nama pendek PWA, dan terhubung ke inti produk ("rapi" = catatan tidak tercecer). Kandidat dan pemeriksaannya ada di `CHANGELOG.md` 0.14.0 | 2026-10-04 |
| Kontainer desktop 1200px di tengah, `.isi-app` wajib `flex: 1 1 auto` | Diukur: tanpa `flex`, kolom isi hanya terpakai 1060px dari 1313px yang tersedia di layar 1568px, dan sisa kanan kosong | 2026-10-04 |
| Tab aktif dan pil saring aktif memakai pembalikan tinta, bukan warna aksen | Aksen per layar dibatasi dua bidang; dua bidang itu sudah dipakai tombol utama dan batang progres, dan pembalikan tinta justru kontras paling tinggi | 2026-10-04 |
| Aksi utama pindah dari tombol melayang ke kepala halaman di `expanded` | Tombol melayang dan tombol kepala adalah pola untuk dua perangkat berbeda; memakai keduanya sekaligus memberi dua tombol utama untuk satu pekerjaan | 2026-10-04 |
| Hiasan bunga di sudut kartu progres dihapus | Selalu terpotong `overflow: hidden`, dan pada progres nol persen tidak menambah informasi | 2026-10-04 |
| Layar masuk dan daftar memakai dua kolom di desktop | Kolom 480px di tengah menyisakan hampir separuh layar kosong di 1440px, dan itu keluhan yang sama dengan `/rencana`. Mulai 1023px kepala pindah ke kiri, kartu form ke kanan, sedangkan di HP tetap satu kolom seperti rancangan Stitch | 2026-10-04 |

---

## 10. Cara memakai dokumen ini

1. Setiap komponen baru mengambil warna dari bagian 3, tidak memilih warna sendiri.
2. Setiap pilihan layout mengambil dari bagian 5, tidak membuat pattern baru.
3. Kalau ada keputusan yang bertentangan dengan dokumen ini, catat di `docs/11-Delivery-Plan.md` bagian "Risiko dan keputusan tertunda", bukan diubah diam-diam.
4. Kalau pemilik proyek tersedia dan belum menentukan arah desain, ajukan satu pertanyaan yang menentukan saja, bukan daftar pertanyaan.
