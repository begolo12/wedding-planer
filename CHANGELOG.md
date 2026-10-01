# Changelog

Semua perubahan besar pada dokumen dan kode dicatat di sini.

Formatnya mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/). Versi mengikuti [SemVer](https://semver.org/lang/id/).

Versi 0.1.0 sampai 0.4.0 masih dokumen, belum ada kode. Kode pertama masuk di 0.5.0 dan berikutnya.

---

## Format

```text
## [versi] - YYYY-MM-DD

### Tambah / Ubah / Hapus / Perbaiki

- penjelasan singkat dalam satu baris
```

Aturan singkat:

| Aturan | Kenapa |
|---|---|
| Tulis dari sudut pandang pembaca | Yang penting perubahan, bukan proses |
| Satu baris per perubahan | Kalau butuh dua paragraf, itu dua perubahan |
| Tulis alasan kalau tidak jelas | Pembaca versi berikutnya tidak perlu menebak |
| Tambah entri baru di atas | Yang terbaru selalu di paling atas |

## [0.12.0] - 1 Oktober 2026

Ini rilis pertama yang membawa ke Git seluruh pekerjaan yang selama ini hanya ada di komputer. Entri 0.7.0 sampai 0.11.1 sudah ditulis di berkas ini tapi belum pernah dikirim ke Git, jadi versi terakhir di Git masih 0.6.7. Selain mengejar ketertinggalan itu, rilis ini menutup sisa pekerjaan yang belum tercatat: judul tab layar masuk dan daftar, kepala layar auth yang lengkap, dua kartu baru di beranda, dan pembersihan berkas perkakas.

### Tambah

- `src/app/(auth)/daftar/layout.tsx` dan `src/app/(auth)/masuk/layout.tsx` menitipkan judul tab "Daftar" dan "Masuk". Halaman di folder itu komponen klien, dan komponen klien tidak boleh mengekspor `metadata`, jadi tanpa berkas ini judul tab jatuh ke "Beranda - Hari Besar"
- `src/app/(auth)/layout.tsx` blok `.auth-aman`: lambang hati dan pesan "Catatan kalian tersimpan rapi" di bawah kartu form, plus dua elemen hiasan `.auth-kabut` di belakang kartu
- `src/lib/ringkasan.ts` menambah tipe `VendorRingkas` dan dua data baru di `RingkasanPlan`: `vendorUtama` berisi tiga vendor teratas dengan nama, kategori, dan status, serta `tamu` berisi jumlah orang, kursi, tidak hadir, belum konfirmasi, dan belum diundang
- Beranda memakai data baru itu untuk kartu "Vendor Utama" dan kartu "Konfirmasi Tamu" dengan cincin persentase kehadiran
- `public/merek/merek-192.png`, `merek-512.png`, dan `merek-1024.png` sebagai lambang merek ukuran kecil, sedang, dan besar
- Skrip perkakas: `scripts/buat-merek.ps1`, `periksa-logo.ps1`, `periksa-merek.ps1`, `potong-logo.ps1`, `buat-ikon.ps1`, `stitch-tarik.mjs`, `tinjau-png.mjs`, dan lima skrip `probe-*.mjs` untuk memeriksa keluaran produksi
- `neon.ts` di akar proyek

### Ubah

- `scripts/buat-ikon.mjs` diganti `scripts/buat-ikon.ps1`. Ikon PWA dibuat ulang dari lambang baru
- `src/db/index.ts` mewajibkan `DATABASE_URL`. Sebelumnya ada nilai cadangan yang ditulis langsung di kode, jadi koneksi bisa jalan ke basis data yang salah tanpa ketahuan. Sekarang gagal cepat dengan pesan "Salin .env.example jadi .env"
- `.gitignore` dirapikan: folder Stitch, folder perkakas agen, dan berkas audit sekali pakai tidak ikut Git. `dev-audit.log` juga dikeluarkan dari Git
- Versi naik dari 0.11.1 ke 0.12.0

### Catatan keputusan

- Entri 0.7.0 sampai 0.11.1 sebelumnya sudah ada di berkas ini tapi belum pernah dikirim ke Git. Rilis ini yang pertama membawanya, jadi riwayat Git sekarang sejalan dengan changelog

## [0.11.1] - 1 Oktober 2026

Tombol masuk di produksi mengembalikan `403 INVALID_ORIGIN` dan tidak ada satu pun pengguna yang bisa masuk. Better Auth menolak setiap permintaan yang header Origin-nya tidak ada di daftar alamat tepercaya, dan daftar itu hanya berisi satu nilai dari `BETTER_AUTH_URL`. Nilai variabel itu di Vercel tersimpan sebagai rahasia sehingga tidak bisa dibaca lagi, jadi alamat tetap yang dipakai orang tidak pernah ada di daftar.

### Perbaiki

- `src/lib/auth.ts` merakit daftar alamat tepercaya dari beberapa sumber sekaligus: `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS` (dipisah koma), `VERCEL_URL`, `VERCEL_BRANCH_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, alamat tetap `https://wedding-planer-self.vercel.app`, dan pola `https://wedding-planer-*.vercel.app` untuk preview per-cabang. Tiap nilai dinormalkan jadi origin bersih dan duplikatnya dibuang, sehingga masuk kembali jalan tanpa bergantung pada satu variabel yang tidak bisa dibaca
- Daftar lama yang cuma berisi satu alamat dihapus

## [0.11.0] - 1 Oktober 2026

Tampilan dan pengalaman layar-layar yang belum tersentuh ditingkatkan, lalu gaya sebaris yang ditulis ulang di banyak berkas dipindah ke kelas bersama. Setelah 0.10.0 menutup layar Hari-H, sisa layar masih memakai kelas umum dan warna sebaris, sehingga mode gelapnya rapuh dan tiap perbaikan harus diulang di banyak tempat.

### Tambah

- `src/app/globals.css` blok "Utilitas bersama": `.teks-aksen`, `.teks-bahaya`, `.teks-redup`, `.teks-aksen-tegas`, `.paragraf-rapat`, `.penghitung`, `.keterangan-rapat`, `.keterangan-mini`, `.keterangan-tengah`, `.keterangan-miring`, `.bar-catatan`, `.bar-kepala`, `.pita-isi`, `.tab-berjarak`, `.kotak-catatan`, `.tombol-polos`, `.kartu-netral`, `.isi-lentur`, `.isi-lentur-sempit`, `.petunjuk-tegas`, `.lencana[data-nada]`, `.tombol-sekunder[data-aktif="ya"]`, `.aksi-baris[data-ratakan]`, dan `.kartu[data-sorot="ya"]`

### Ubah

- Layar laporan dan halaman bagikan, layar rencana (plan, info, tanggal, seragam, vendor, dan rincian vendor), layar impor tamu, layar aplikasi, layar luring, dan halaman bagikan publik memakai kelas bersama di atas menggantikan gaya sebaris
- `src/components/budget-bar.tsx`, `field.tsx`, `task-item.tsx`, `pwa.tsx`, dan `tab-rencana.tsx` memakai kelas bersama yang sama
- Kelas bersama hanya memakai token warna yang sudah punya pasangan mode gelap, jadi mode gelap tidak perlu aturan tambahan per layar

### Perbaiki

- Mode gelap beberapa layar yang sebelumnya memakai warna sebaris tetap terbaca. Sebelumnya warna itu tidak ikut berubah saat tema gelap aktif

## [0.10.0] - 1 Oktober 2026

Layar Hari-H disusun ulang supaya susunannya mengikuti rancangan Stitch `checklist_timeline_web_app`, melanjutkan pekerjaan 0.9.0. Ini layar besar pertama di luar lima layar utama yang masih memakai kelas umum.

### Tambah

- `src/app/globals.css` blok `.hari-h-*`: kartu ringkasan bergradasi dengan angka persen besar dan bar kemajuan, baris pengatur ukuran huruf, pil lompat ke jam acara, dan kartu acara berurut waktu
- Penanda acara yang sedang berjalan, aktif hanya kalau tanggal pernikahan sama dengan hari ini
- Ikon sebaris `IkonKalender`, `IkonBagikan`, `IkonCetak`, dan `IkonTambah` di berkas layar Hari-H, polanya sama dengan layar akun
- `.tanpa-cetak` akhirnya punya aturan CSS. Kelas ini dipakai enam tempat sejak lama tapi belum pernah didefinisikan, jadi penyembunyian saat cetak tidak pernah jalan

### Ubah

- `src/app/(app)/hari-h/page.tsx` memakai `jamSelesai` dari `src/lib/format.ts`. Sebelumnya ada perhitungan jam selesai sendiri di halaman ini, padahal fungsinya sudah ada
- Pencarian acara yang sedang berjalan dipindah ke fungsi murni di luar komponen. Sebelumnya dipasang sebagai `useMemo` setelah baris pengembalian awal, dan itu melanggar aturan React tentang urutan hook

### Hapus

- Kelas CSS `.rundown-baris`, `.rundown-jam`, `.rundown-kartu`, dan `.rundown-waktu-badge`. Setelah layar Hari-H disusun ulang, tidak ada komponen yang memakainya lagi

## [0.9.0] - 1 Oktober 2026

Layar anggaran, tamu, dan akun disusun ulang supaya susunannya sama dengan rancangan Stitch, melanjutkan pekerjaan 0.8.0. Dua endpoint juga ditambah isinya karena rancangan itu meminta angka yang belum dikirim.

### Tambah

- `src/app/globals.css` blok `.anggaran-*`, `.tamu-*`, dan `.akun-*`
- `GET /api/plans/{id}/budget-items` sekarang mengirim `payments` lengkap dengan `vendorName` dan `sebaranKategori`, supaya tab riwayat pembayaran dan diagram sebaran tidak perlu memanggil endpoint kedua
- `GET /api/plans/{id}/guests` sekarang mengirim `summary.perKategori` dan `summary.perMeja`, supaya pil saringan dan daftar meja dapat angka yang benar tanpa dihitung ulang di browser
- Ikon sebaris di berkas layar anggaran, tamu, dan akun. Sebelumnya Stitch memakai Material Symbols, di sini digambar sebagai SVG supaya tidak menambah unduhan font

### Ubah

- `src/app/(app)/anggaran/page.tsx` disusun ulang mengikuti `budget_vendor_web_app`: kartu anggaran bergradasi, pil status, diagram sebaran, tab daftar pos dan rincian pengeluaran
- `src/app/(app)/tamu/page.tsx` disusun ulang mengikuti `daftar_tamu_rsvp_web_app`: kartu tamu bergradasi dengan cincin persentase, pil saringan kategori, kartu tamu dengan pilihan RSVP, dan daftar meja
- `src/app/(app)/akun/page.tsx` disusun ulang mengikuti `atur_rencana_profil_calon_pengantin`: kartu identitas, formulir data dasar rencana, daftar rencana aktif, pilihan tema, unduh cadangan, dan baris informasi aplikasi
- Kunci penyimpanan tema di layar akun disamakan jadi `haribesar-tema`. Sebelumnya layar itu memakai kunci lain, jadi pilihan gelap hilang setelah halaman dimuat ulang
- Lambang merek di `DESIGN.md` tidak lagi disebut "dua cincin yang bertaut" karena yang dipakai sekarang gambar jadi dari Stitch

### Perbaiki

- Pil saringan di layar tamu tingginya 36px. Sekarang 44px, sesuai batas target sentuh
- Dua kalimat di layar tamu menyebut satuan yang salah. `belumDiundang` itu jumlah orang, bukan jumlah undangan
- Tiga properti CSS di blok `.akun-*` menunjuk token yang tidak pernah didefinisikan, jadi nilainya kosong. Sekarang memakai token yang ada, ditambah properti lokal untuk pasangan warna gelap

### Catatan keputusan

- Penggeser estimasi tamu dan pilihan gaya pernikahan di rancangan Stitch tidak dibuat. Tabel `plans` tidak punya kolomnya, jadi kontrolnya akan jadi tombol mati
- Unggah foto pasangan di layar akun tidak dibuat. Belum ada penyimpanan berkas untuk avatar
- Langkah 1 dari 3 dan persentase kesiapan di rancangan Stitch tidak dibuat. Aplikasi ini tidak punya alur bertahap
- Tidak ada angka contoh dari Stitch yang dipakai. Semua angka di tiga layar itu dibaca dari data rencana yang benar-benar tersimpan

## [0.8.0] - 1 Oktober 2026

Layar masuk, daftar, beranda, dan rencana disusun ulang supaya bentuknya sama dengan rancangan di `docs/stitch_cute_wedding_planner`. Sebelumnya baru warnanya yang disamakan, susunannya belum.

### Tambah

- `src/components/auth-hero.tsx`. Panel merek untuk layar masuk dan daftar, sekali tulis dipakai dua layar
- Token `--text-mini` 0.75rem dan lima token warna auth di `@theme`. Sebelumnya ukuran dan warnanya ditulis langsung di aturan CSS
- `src/app/globals.css` blok `.rencana-*`. Kartu progres bergradasi, pil saringan, kartu tugas per kelompok waktu, dan tombol tambah melayang
- Tombol "Muat template" dan pil saringan di rencana, plus lencana jumlah tugas per pil

### Ubah

- `src/app/(app)/beranda/page.tsx` disusun ulang mengikuti `beranda_wedding_planner`: kartu hitung mundur, ringkasan uang, dan daftar tugas terdekat
- `src/app/(app)/rencana/page.tsx` disusun ulang mengikuti `checklist_timeline_pernikahan`: kartu progres dengan angka nyata, pil saringan, kelompok waktu dengan titik penanda, dan tombol tambah melayang
- `src/app/globals.css` blok `.beranda-*` dan `.rencana-*` menyimpan pasangan warna teks di atas aksen sebagai properti lokal, bukan token global, karena hanya dipakai di dua layar itu
- Lambang merek diganti dari gambar SVG cincin yang digambar sendiri ke berkas raster hasil potong logo Stitch, lewat `Merek` di `src/components/merek.tsx`

### Perbaiki

- Tombol "Ingat saya" di layar masuk hilang centangnya setelah halaman dimuat ulang. Nilainya dibaca sebelum hidrasi selesai
- `src/app/(auth)/layout.tsx` punya satu `</div>` berlebih sehingga seluruh layar daftar gagal render
- Ikon PWA dibuat ulang dari lambang baru. Sebelumnya masih lambang lama
- `docs/` dan `.next` sempat bentrok waktu build jalan bersamaan dengan server dev, gejalanya 404 pada berkas `/_next/static`. Build sekarang dijalankan setelah server dev dimatikan

### Catatan keputusan

- Tombol Google di layar masuk tidak dirender. OAuth Google belum dikonfigurasi, jadi tombolnya akan jadi tombol mati
- Papan inspirasi tema di rencana tidak dibuat. Belum ada fitur unggah gambar, jadi gambarnya akan jadi gambar contoh yang tidak bisa diganti
- `TaskItem` tetap dipakai di rencana meski Stitch punya kotak centang sendiri. Kotak centang Stitch tingginya 28px, di bawah batas 44px
## [0.7.0] - 1 Oktober 2026

Arah desain diganti total ke "Blushing Romance" dari proyek Cute Wedding Planner di Google Stitch. Sebelumnya sage dan terracotta. Sekitar 130 pemakaian token di 20 berkas tetap jalan karena nama token dipertahankan, hanya nilainya yang berubah.

### Ubah

- `src/app/globals.css` blok `@theme` diganti ke palet blush: base `#fffdf9`, ink `#4a3b43`, blush `#ffb7c5`, peach `#ffd6ba`, lilac `#e8d7f1`, netral `#fff0f5`. Nama token lama dipertahankan supaya 20 berkas tidak perlu disentuh
- Mode gelap jadi blok pasangan warna sendiri, base `#1f181c`, ink `#f4e9ee`. Sebelumnya hasil inversi
- Bentuk kontrol jadi pill: tombol, input, pilih, kotak centang, lencana, tab. Card dan panel tetap `2rem`, lembar bawah `3rem`
- Tombol utama jadi blush dengan tulisan Rosy Charcoal, tinggi minimum dari 44px ke 48px. Input dari 44px ke 52px
- `src/app/layout.tsx` huruf diganti dari Fraunces dan Public Sans ke Plus Jakarta Sans dan Be Vietnam Pro, sumber dari `desain.json`
- `viewport.themeColor` jadi `#FFFDF9` di mode terang dan `#1F181C` di mode gelap
- Garis pemisah tipis di daftar diganti baris kartu terpisah sesuai aturan daftar di Stitch: `.pratinjau-baris`, `.tamu-kartu-bawah`, `.auth-kartu`
- `DESIGN.md` ditulis ulang ke v2.0. Palet, tipografi, radius, dan aturan pill diperbarui. Larangan pill di v1.0 dihapus karena arah baru memang memakai pill

### Perbaiki

- Blush `#ffb7c5` di atas kanvas terang hanya `1,61:1`, gagal kalau dipakai sebagai teks. Semua teks aksen dialihkan ke blush gelap `#864e5a` yang mencapai `6,36:1`. Blush hanya dipakai sebagai isian besar, dengan tulisan `#4a3b43` mencapai `6,42:1`
- Teks sekunder digelapkan dari `#8a8a8a` ke `#72666b`. Di kanvas naik dari `3,10:1` ke `5,40:1`, di panel `4,97:1`
- `src/app/global-error.tsx` dan `src/app/manifest.ts` masih menyimpan hex lama `#fbf9f6`, `#2b2622`, dan `#b5643c`. Diganti ke palet baru
- `src/app/layout.tsx` elemen `<html>` menimbulkan peringatan hidrasi. Skrip tema memasang `data-theme` sebelum React jalan, jadi server dan client tidak sama. Ditambah `suppressHydrationWarning`, karena selisih itu memang disengaja
## [0.6.8] - 1 Oktober 2026

Tampilan auth dirapikan dan tema global diratakan supaya setiap halaman memakai sumber yang sama.

### Perbaiki

- Aturan cetak di `src/app/cetak.css` tidak pernah diimpor di mana pun, sehingga navigasi, pita luring, dan pemenggalan halaman ikut tercetak. Sekarang diimpor dari `src/app/layout.tsx`
- Tautan di dalam kalimat (`.tautan-kalimat`) punya tinggi 44px tapi lebar 42px untuk kata satu seperti "Daftar". Ditambah `min-width: 44px`
- `.auth-merek-judul` dan `.auth-kartu` masing-masing terdefinisi dua kali. Aturan kedua diam-diam menang, jadi definisi pertama tidak pernah berlaku. Digabung jadi satu
- `.tautan-kalimat` sempat punya enam properti tertulis dua kali berturut-turut. Dikembalikan ke satu deklarasi
- Kontras teks utama di layar auth diuji di mode terang dan gelap, keduanya terbaca

### Ubah

- Lambang brand di layar auth mengecil dari 64px ke 56px dan kehilangan bayangan, diganti garis 1px
- Sudut kartu auth mengikuti `--radius-panel` (14px), sebelumnya 32px, dan bayangannya diganti garis atas 1px karena DESIGN.md melarang bayangan pada kartu
- Warna teks lambang dikembalikan ke `--text-h1` seperti yang tertulis di DESIGN.md, sebelumnya diteruskan ke `--text-h2`
- Gradien pada `.auth-kepala` dihapus, jaraknya dipindah ke token `--jarak-*`

---

## [0.6.7] - 1 Oktober 2026

Layar masuk dan daftar dibersihkan dari tulisan yang tidak perlu.

### Ubah

- Semua kata "surel" diganti "email" di label, pesan galat, dan nama variabel
- Judul layar disederhanakan jadi "Masuk" dan "Daftar", subjudul dihapus
- Placeholder "nama@contoh.com", "Contoh: Budi", dan "Minimal 8 huruf" dihapus karena label sudah cukup jelas
- Label "Nama panggilan" jadi "Nama", teks tombol "Daftar Sekarang" jadi "Daftar"
- Label brand "Buku Rencana Pernikahan" dan footer "Tersimpan aman / Siap luring di venue" dihapus dari layout auth
- Aturan CSS `.auth-subjudul`, `.auth-merek-label`, `.auth-keterangan-bawah`, dan `.titik-pemisah` dihapus karena tidak lagi dipakai

## [0.6.6] - 1 Oktober 2026

Refaktor kode bersih dan pembersihan komentar anti-slop sesuai best practice.

#### Ubah

- Ekstraksi komponen terpadu `IsianSandi` di `src/components/field.tsx`, mengurangi duplikasi kode SVG dan logika toggle di halaman auth
- Konsolidasi status formulir terpecah di `src/app/(app)/hari-h/page.tsx` menjadi satu objek status terstruktur
- Pembersihan komentar dekoratif garis putus-putus pada `src/lib/laporan.ts` sesuai pedoman anti-slop
- Pengurangan ukuran bundel halaman masuk dan daftar berkat penggunaan komponen terpadu

---

## [0.6.5] - 1 Oktober 2026

Peningkatan visual dan pengalaman layar masuk (login) dan daftar akun dengan fokus mobile 1st.

#### Ubah

- Tata letak layar auth dengan navigasi atas minimalis untuk kembali ke beranda dan pengalih mode gelap/terang
- Monogram emblem cincin pernikahan dan hierarki tipografi Fraunces di kartu masuk
- Tombol lihat kata sandi interaktif di dalam kolom isian tanpa pergeseran tata letak dan target sentuh 44x44px
- Indikator putaran memuat saat tombol kirim ditekan untuk umpan balik responsif
- Isian formulir dengan optimasi masukan ponsel (tipe surel, autokoreksi mati, petunjuk yang jelas)

---

## [0.6.4] - 1 Oktober 2026

Peningkatan UX mobile 1st, kualitas interaksi isian formulir, integrasi database Neon PostgreSQL, serta batas halaman dan penanganan galat.

#### Tambah

- Pintasan aksi cepat di Beranda untuk navigasi cepat di HP: Anggaran, Tugas, Tamu, dan Rundown
- Integrasi tombol 1-tap RSVP di kartu daftar tamu (Hadir, Belum, Tidak) serta tautan langsung percakapan WhatsApp
- Tombol bagikan susunan rundown Hari-H langsung ke grup WhatsApp keluarga atau wedding organizer
- Tombol pelunasan otomatis sisa tagihan pada lembar pembayaran vendor
- Batas halaman P0: `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx`, `src/app/(app)/loading.tsx`, dan `src/app/(app)/error.tsx`
- Gagang tarikan visual (drag indicator) dan proteksi safe-area-inset pada lembar panel bawah di layar HP
- Tab navigasi Rundown Hari-H di bilah tab modul Rencana

#### Perbaiki

- Isian nominal pos anggaran dan pembayaran vendor diubah dari input angka biasa menjadi `IsianRupiah` dengan format titik ribuan otomatis, mencegah salah ketik nominal di layar sentuh
- Tata letak kartu rundown diubah dari grid tiga kolom kaku menjadi kartu responsif yang mengalir rapi di layar HP 360px sampai 390px
- Koneksi database ditambahkan opsi `prepare: false` untuk mendukung transaksi pooler PgBouncer di Neon PostgreSQL
- Skema 15 tabel dan relasinya disinkronkan langsung ke database Neon lewat `drizzle-kit push`
- Penanganan fallback koneksi database saat fase static generation build agar build CI/Vercel tidak terhenti karena variabel belum terbaca

---

## [0.6.3] - 1 Oktober 2026

Audit visual di browser pada lebar 390px, mode terang dan mode gelap, atas sepuluh halaman inti. Yang diukur bukan perkiraan: kontras, geser horizontal, ukuran target sentuh, dan sudut. Semua angka di bawah hasil pengukuran, bukan perkiraan.

#### Perbaiki

- Empat pasangan warna gagal ambang kontras `4.5:1` di mode terang, semuanya kurang sedikit. Semuanya diperbaiki, tidak ada tebakan: nilainya dihitung di browser lalu dipasang sebagai nilai baru di [`src/app/globals.css`](src/app/globals.css). Tabel lengkap ada di `DESIGN.md` bagian 7
  - Teks muted di layar: 4,282 menjadi 4,569. Perbaikannya naik dari tinta 62% ke 64%
  - Tulisan putih di tombol utama: 4,327 menjadi 4,555. Warnanya bukan diganti, tapi dicampur 93% terracotta dengan hitam, bukan 97%
  - Teks sage di label dan angka: 4,489 menjadi 4,565. Warnanya `#5B796A`, satu persen lebih gelap dari rancangan awal
  - Teks lencana beraksen: 4,037 menjadi 4,563. Dicampur 62% marigold dengan hitam, bukan 70%. Warna marigold sendiri tidak diubah karena dipakai sebagai garis dan isian tipis, bukan teks
- Tautan "Daftar" di halaman masuk dan "Masuk" di halaman daftar punya target sentuh 42x16px, di bawah minimum 44px. Penyebabnya kedua tautan itu tidak punya kelas, jadi ukurannya jatuh ke gaya `<a>` biasa. Sekarang memakai `.tautan-kalimat`, kelas yang memang dirancang untuk tautan di dalam kalimat
- Enam modul rencana di `/rencana` tersembunyi di 390px dan tidak ada petunjuknya. Sekarang blok tab punya gradien transparan di tepi kanan, jadi terlihat masih ada tab yang terpotong dan bisa digeser

#### Tambah

- Gradien tepi kanan pada blok tab, dengan `scroll-snap` supaya tab yang aktif berhenti di posisi yang enak dibaca. Ada cadangan untuk browser yang tidak mendukung `mask-image`
- Batas heap dev server dinaikkan ke 1024 MB di [`scripts/dev.mjs`](scripts/dev.mjs). 640 MB lulus uji request tapi mati saat browser sungguhan membuka halaman di dalamnya, heap sudah di 634 MB dengan mode `Ineffective mark-compacts`. 512 dan 576 MB sudah dicoba lebih dulu dan keduanya mati. Detail pengukurannya ada di entri 0.6.2

#### Dokumentasi

- [`DESIGN.md`](DESIGN.md) bagian 7 sekarang memuat tabel koreksi kontras, jadi angka di bagian 3 dan di bagian 7 tidak lagi berbeda
- [`DESIGN.md`](DESIGN.md) memakai nama produk yang benar, `Hari Besar`. Sebelumnya masih menyebut nama pasangan contoh dan mencatat bahwa nama produk belum ditentukan
- Kunci penyimpanan tema di [`src/app/layout.tsx`](src/app/layout.tsx) sudah `haribesar-tema`; dokumen masih menyebut kunci lama. Sekarang sama

---

## [0.6.2] - 1 Oktober 2026

Dev server dibatasi supaya pemakaian RAM-nya tidak jadi penyebab sesi tertutup sendiri. Angka di bawah diukur di mesin ini dengan memukul sepuluh route inti sebanyak tiga kali tiap route lalu menyentuh `globals.css` tiga kali untuk memaksa kompilasi ulang, bukan diperkirakan.

#### Tambah

- [`scripts/dev.mjs`](scripts/dev.mjs) menjalankan `next dev` lewat Node supaya batas heap bisa dipasang di Windows. Batas tidak bisa ditulis langsung di `package.json` karena sintaks `NODE_OPTIONS=... next dev` hanya jalan di shell POSIX, bukan di cmd.exe maupun PowerShell. Bisa ditimpa tanpa mengedit berkas: `BATCH_DEV_MB=1024 npm run dev`
- `experimental.webpackMemoryOptimizations: true` di [`next.config.mjs`](next.config.mjs). Webpack menahan dua salinan setiap string modul dan cache buffer ganda selama kompilasi. Setelah modul terbaca, salinan itu tidak pernah dipakai lagi tapi tetap tertahan sampai proses selesai
- `experimental.cpus: 2`. Opsi ini hanya kena `next build`, bukan dev server, karena `next dev` sudah dikunci ke satu worker di dalam Next.js. Dipakai dua worker karena repo ini punya 25 halaman statis dan jumlah worker yang terlalu banyak adalah salah satu sumber borosnya

#### Perbaiki

- Dev server memakai setengah dari total RAM mesin, yaitu 16 GB di mesin 32 GB, karena Next.js menaruh `max-old-space-size` sendiri kalau tidak ada yang menyetel. Sekarang batasnya 640 MB heap
- Batas 512 MB dan 576 MB dicoba lebih dulu dan keduanya mati dengan `heap out of memory`. 512 MB mati saat kompilasi `/luring` di putaran pertama, 576 MB selamat putaran pertama lalu mati di putaran kedua. 640 MB menyelesaikan dua putaran penuh tanpa kehabisan memori
- Pada 640 MB, proses server sendiri (`start-server.js`) ada di 935 MB working set, jadi masih di bawah 1 GB. Rantai spawnnya (launcher 53 MB, cli Next.js 74 MB, server 935 MB) berjumlah 1062 MB karena launcher dan cli tidak punya batas heap dan ikut menanggung sedikit
- Total rantai spawn ada di 1033 MB setelah putaran pertama dan 1194 MB setelah putaran kedua. Angka itu lebih besar dari batas heap karena kode native, buffer, dan source map hidup di luar heap. Batas heap tidak sama dengan working set
- Turun ke 576 MB tidak aman. Angka working set yang lebih rendah itu diukur pada proses yang sudah hampir mati, sedangkan batas yang terlalu rendah membuat V8 masuk mode `Ineffective mark-compacts` yang jauh lebih lambat sebelum mati

---

## [0.6.1] - 1 Oktober 2026

Audit produksi menemukan satu cacat yang menutup seluruh aplikasi. Rencana pengerjaan ada di [`docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md`](docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md).

#### Perbaiki

- Pendaftaran gagal total karena Better Auth membuat id berbentuk 32 huruf, sedangkan kolom `users.id` bertipe `uuid`. PostgreSQL menolak dengan `22P02 invalid input syntax for type uuid`, jadi `POST /api/auth/sign-up/email` selalu menjawab 422. Tidak ada yang bisa mendaftar, jadi tidak ada plan, jadi tidak ada yang bisa dicatat. Perbaikannya `advanced.database.generateId: "uuid"` di [`src/lib/auth.ts`](src/lib/auth.ts), yang memaksa pustaka itu memakai `crypto.randomUUID()`. Dipilih supaya 15 tabel tetap bertipe uuid dan tidak ada query, index, maupun parser id yang harus ditulis ulang

#### Tambah

- [`docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md`](docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md) yang mengurutkan sisa pekerjaan produksi dari P0 sampai P3, dengan syarat selesai dan alasan tiap keputusan

---

## [0.6.0] - 30 Juni 2026

Audit kepatuhan terhadap `AGENTS.md` dan `docs/` menemukan enam cacat nyata pada kode 0.5.0. Semuanya diperbaiki di rilis ini.

#### Tambah

- Halaman `/aplikasi` berisi cara memasang di Android dan di iPhone, plus apa yang berubah setelah dipasang. Halaman ini ikut disimpan Service Worker supaya tetap bisa dibuka tanpa sinyal
- Kolom `LURING` di `KodeGalat` dan statusnya 503, supaya balasan Service Worker saat jaringan putus punya kode yang bisa dikenali, bukan cuma kalimat

#### Perbaiki

- Service Worker tidak pernah didaftarkan. Berkas `public/sw.js` ada, tapi tidak ada satu baris pun di `src/` yang memanggil `navigator.serviceWorker.register`. Akibatnya seluruh rencana luring mati: halaman tidak pernah masuk cache dan rundown tidak bisa dibuka tanpa sinyal. Pendaftaran sekarang ada di `src/components/pwa.tsx` dan dipasang di `src/app/(app)/layout.tsx`
- Tulisan saat luring hilang begitu saja. `simpanKeAntrean` di `src/lib/luring.ts` tidak punya pemanggil, jadi Service Worker membalas 503 berkode `LURING` dan API client melemparnya ke layar tanpa menyimpan apa pun. Sekarang `src/lib/api-client.ts` mengenali kode `LURING` dan mengantrekan setiap permintaan selain `GET` sebelum melempar galat. `GET` sengaja tidak diantrekan karena datanya bisa dimuat ulang
- Ajakan memasang aplikasi tidak pernah tampil. `docs/01-PRD.md` bagian penerimaan memasang PWA, tapi `InstallPrompt` lama tidak dipasang di layar mana pun. Sekarang dipasang di kerangka layar, dan ditambah halaman penjelas `/aplikasi` untuk Android dan iPhone yang ikut disimpan di cache
- Pita luring tidak pernah muncul. Komponen `LuringBanner` ada tapi tidak dipasang; yang dipakai cuma pita statis. Sekarang pita dipasang di atas isi halaman dan ikut menggeser konten, bukan menutupi tombol. Ini juga memenuhi `docs/05-IA-dan-Layar.md` baris 116 yang meminta pita tipis di atas
- Kunci tema tidak cocok. Tombol tema menyimpan `pernikahan_tema` sejak sebelum diubah nama, sementara skrip di `layout.tsx` membaca `aisyah-theme`, jadi pilihan tema tidak pernah terbaca ulang setelah halaman dimuat. Kunci disatukan jadi `aisyah-theme`
- Mode gelap mengikuti sistem tidak pernah jalan. Tidak ada aturan `@media (prefers-color-scheme: dark)`, dan "Mengikuti Sistem" hanya menghapus atribut tanpa menentukan warnanya. Sekarang ada blok `prefers-color-scheme` yang mengambil alih saat tidak ada pilihan tersimpan, dan nilai `terang` ditulis jelas supaya bisa dibedakan dari "belum memilih"
- Nomor versi di layar akun ditulis tetap `1.0.0` sementara `package.json` berisi `0.1.0`. Sekarang dibaca dari `NEXT_PUBLIC_APP_VERSION` yang diisi `next.config.mjs` dari `package.json`, jadi tidak bisa lagi berbeda
- Enam kode mati dibuang: `KerangkaDaftar`, `PitaLuring`, `galatPerField`, `kodeGalat`, dan aturan CSS `.baris-kerangka` serta `.jarak-antarlist` yang tidak punya pemakai. `AGENTS.md` melarang tombol mati; kode mati punya masalah yang sama, cuma lebih sunyi

#### Keputusan

- Permintaan `GET` tidak diantrekan saat luring. Membalas data basi dari antrean akan lebih menyesatkan daripada sekadar gagal dan menyuruh muat ulang
- Halaman `/aplikasi` dibuat sebagai penjelas memasang, bukan dijadikan bagian layar akun. Layar akun sudah panjang dan orang yang butuh panduan memasang biasanya sedang mencari di luar aplikasi, sering dari tautan

---

## [0.5.0] - 30 Juni 2026

#### Tambah

- Implementasi penuh 17 layar aplikasi Next.js sesuai spesifikasi Wireframe 12a sampai 12e
- Tiga puluh tiga endpoint REST API di bawah `/api/plans/:planId/*` dengan validasi Zod dan filter planId
- Skema PostgreSQL 17 dengan 15 tabel relasional dan migrasi Drizzle ORM
- Autentikasi email dan kata sandi menggunakan Better Auth dengan sesi aman
- PWA luring dengan Service Worker kustom, IndexedDB untuk antrean mutasi, dan manifest
- Lembar gaya semantik murni `globals.css` dan `cetak.css` tanpa dependensi CSS utilitas luar
- Dukungan baca-saja publik tanpa login di `/bagikan/:token` dan `/l/:token`
- Teks WhatsApp otomatis dengan tautan langsung `wa.me` dan pembagian tautan laporan
- Ekspor cadangan JSON lokal di layar akun untuk keamanan data luring

#### Perbaiki

- Pemisahan utilitas komputasi plan dari akses database server agar tidak membocorkan modul Node.js ke browser
- Penyesuaian konfigurasi path alias webpack dan Next.js 15
- Kompatibilitas TypeScript 5.8 untuk kompilasi produksi tanpa peringatan

---

## [0.4.0] - 30 Juni 2026

#### Perbaiki

- Sebelas kata yang dilarang `docs/15-Glosarium.md` bagian 7 masih dipakai di luar glosarium. Semuanya diganti: "dashboard" jadi "beranda" di `DESIGN.md` dan `docs/01-PRD.md`, "output" jadi "dokumen", "payment gateway" jadi "gerbang pembayaran", "marketplace" jadi "lokapasar", "onboarding" jadi "langkah pertama" di `docs/01-PRD.md` dan `docs/14-Naskah-Teks.md`, "planner profesional" jadi "perencana profesional", dan "approval cycle" jadi "siklus persetujuan" di `docs/11-Delivery-Plan.md`
- Pemeriksaan ulang seluruh berkas Markdown memastikan tidak ada kata lain dari daftar larangan yang tersisa. Tiga baris di `docs/14-Naskah-Teks.md` sengaja tetap memuat kata terlarang karena tugasnya memang menunjukkan penulisan yang ditolak
- Satu kalimat rusak di `DESIGN.md` bagian 1 dirapikan: "Yang varies di sini bukan seksi" jadi "Yang berubah di sini bukan bagian layar". Ini jenis kerusakan yang sama dengan sepuluh kata rusak yang diperbaiki di rilis 0.1.0, yaitu frasa Inggris yang menyisip ke kalimat Indonesia
- Dua puluh lima temuan kata Inggris yang menyisip diperiksa di semua berkas. Semuanya sah kecuali satu di `DESIGN.md`: nama produk seperti "Next.js", sintaks SQL seperti `IS NULL` dan `ON DELETE CASCADE`, nama strategi cache seperti "network first", dan contoh teks yang sengaja dikutip seperti `"No data"`. Yang bukan prosa tidak diterjemahkan

#### Keputusan

- Kosakata teknis yang tidak ada di daftar larangan glosarium dibiarkan apa adanya, termasuk "venue", "layout", "task", "endpoint", dan "offline". Glosarium adalah satu-satunya sumber yang menentukan kata mana yang diterjemahkan, dan menambah larangan di luar daftar itu berarti mengubah keputusan bahasa tanpa dasar

---

## [0.3.0] - 30 Juni 2026

#### Tambah

- Bagian "Urutan berkas yang dibuat" di `docs/11-Delivery-Plan.md`: enam berkas yang dibaca sebelum menulis kode, tujuh belas langkah pengerjaan, dan bentuk folder `src/`
- Sprint 8 untuk Laporan dan Bagikan di `docs/11-Delivery-Plan.md`. Sebelumnya laporan tidak masuk sprint mana pun
- Cakupan uji dan uji manual untuk Fase 3 di `docs/11-Delivery-Plan.md`

#### Ubah

- `docs/11-Delivery-Plan.md` naik dari 46 ke 55 hari kerja. Laporan, halaman luring, dan uji manual perangkat belum pernah dihitung sama sekali
- Sprint 8 sekarang Laporan dan Bagikan, Sprint 9 sekarang PWA dan polish. Sebelumnya hanya ada satu Sprint 8 yang mencampur keduanya dalam tiga hari
- Rencana uji per sprint ditambah baris untuk laporan di Sprint 8
- Rujukan "Sprint 8" di tabel risiko diganti jadi "Sprint 1" untuk uji iOS dan "Sprint 6" untuk uji luring
- Tahap 2 di `docs/13-Rencana-Kerja.md` naik dari 21 ke 22,5 hari supaya jumlahnya berhenti di 39 seperti tabel
- `README.md` menyebut empat puluh dua story, bukan empat puluh. Hitungannya 42
- Daftar prioritas di `docs/02d-Lainnya.md` dan `README.md` naik dari tujuh ke sembilan modul P0, karena laporan dan bagikan WhatsApp sudah ada di dokumen lain tapi belum dihitung di sini

#### Perbaiki

- Fase 2 di `docs/11-Delivery-Plan.md` tertulis 10 hari padahal isinya 19 hari. Angkanya yang diperbaiki, bukan sprintnya yang dipotong
- Enam kata rusak di `docs/11-Delivery-Plan.md`: "Mokra" jadi "Cakupan", "Java" jadi "Jawa", "Documen" jadi "Dokumen", "sizable" jadi "besar", "delimiter" jadi "pembatas", "Una" jadi "Sebuah"
- Judul "Test plan per sprint" diganti jadi "Rencana uji per sprint", dan "R rundown" jadi "Rundown"
- `docs/15-Glosarium.md` kehilangan rujukan ke nama yang tidak pernah ada di dokumen lain
- `docs/04-API-Contract.md` judul kolom "Cupo" jadi "Kegunaan"
- Baris backlog "Ekspor ke PDF" diganti jadi "Ekspor ke Excel", karena PDF justru fitur Fase 1 dan tidak mungkin ditunda
- Label "Barcode undangan" diganti jadi "Kode undangan", karena barcode di dokumen ini tidak pernah didefinisikan

#### Keputusan

- Dokumen yang lengkap dianggap selesai, dan penambahan berikutnya hanya boleh dari temuan saat kode ditulis
- Urutan berkas ditulis di `docs/11-Delivery-Plan.md`, bukan di berkas baru, supaya tidak ada dokumen ketiga yang mengulang rencana yang sama
- Angka hari kerja dibiarkan beda antara dokumen epik dan dokumen sprint, dan bedanya dijelaskan di ketiganya. Menyamakan angkanya berarti salah satu dokumen harus mengarang pekerjaan yang tidak ada

---

## [0.2.0] - 30 Juni 2026

#### Tambah

- `docs/16-Laporan-dan-Bagikan.md` untuk tiga fitur baru: halaman laporan keadaan, bagikan ke WhatsApp dalam bentuk chat, dan cetak PDF
- `docs/12a-Wireframe-Inti.md` sampai `docs/12e-Wireframe-Laporan.md`, pemecahan wireframe jadi lima berkas supaya tiap berkas bisa dibaca sendiri
- Bagian Laporan di `docs/12e-Wireframe-Laporan.md`: halaman laporan untuk HP dan laptop, tiga langkah bagikan ke WhatsApp, tombol cetak, dan tiga halaman hasil cetak
- Story E6.6 sampai E6.9 di `docs/10-Epik-dan-Story.md` untuk laporan, bagikan WhatsApp, cetak PDF, dan tautan yang bisa dimatikan
- Empat endpoint `/report` di `docs/04-API-Contract.md`. Semua angka dihitung ulang di server, tidak pernah diambil dari client
- Bagian 14 sampai 18 di `docs/14-Naskah-Teks.md` untuk judul halaman laporan, teks di layar laporan, teks yang dikirim ke WhatsApp, teks di layar cetak, dan yang sengaja tidak ditulis
- Bagian Laporan di `docs/05-IA-dan-Layar.md`, satu cabang baru di peta halaman
- Tautan bagikan memakai mekanisme yang sudah ada. Tidak ada tabel baru dan tidak ada masa berlaku tautan

#### Ubah

- `docs/12-Wireframe.md` jadi indeks, bukan isi wireframe. Sekarang isinya notasi, lima tampilan wajib, aturan lintas layar, dan alasan kenapa berkas ini dipecah lima
- Subjudul E6 di `docs/10-Epik-dan-Story.md` ditambah laporan
- `docs/06-Stack-dan-Batas.md` mencatat bahwa pustaka PDF ditolak, karena lima pertanyaannya dijawab "bisa"

#### Keputusan

- PDF dibuat dengan dialog cetak bawaan dan CSS `@media print`, tanpa pustaka. Lima pertanyaannya dijawab "bisa", dan jawaban "bisa" berarti tidak ada pustaka
- Server menyusun teks WhatsApp, bukan client, supaya angka yang dikirim tidak bisa diubah dari sisi client
- Isi bagikan ada tiga pilihan: ringkas, lengkap, dan tautan. Nama tombol menyebut panjangnya, bukan gayanya
- Tautan bagikan milik plan dan tidak punya masa berlaku. Yang bisa mencabut tautan sudah punya akses ke plan itu
- Tidak ada endpoint PDF dan tidak ada endpoint kirim WhatsApp. Browser yang mengubah dialog cetak menjadi PDF, dan yang membuka WhatsApp adalah aplikasi WhatsApp
- Teks bagikan boleh diedit, tapi ada satu baris pengingat bahwa angka dan tanggal sudah dikunci
- Tidak ada grafik, tidak ada emoji, dan tidak ada warna tambahan di laporan. Grafik tidak terbaca saat dicetak hitam putih, dan warna sudah dipakai sebagai penanda

---

## [0.1.0] - 30 September 2026

#### Perbaiki

- Dua rujukan ke `docs/07-NFR.md` di `DESIGN.md` dan `docs/01-PRD.md` menunjuk ke `docs/08-NFR.md`, karena NFR ada di nomor delapan
- Salah ketik di README pada bagian alasan pemilihan stack diperbaiki
- Sepuluh kata rusak di delapan dokumen diperbaiki, termasuk "rencanaTIA" di `03-Data-Model.md` dan "intiPlanning" di `02c-Hari-H.md`. Semuanya kata Indonesia yang disisipi fragmen asing
- Bagian 10 dan 11 di `docs/14-Naskah-Teks.md` ditulis ulang karena tabelnya sempat kehilangan judul kolom

#### Tambah

- `DESIGN.md` untuk sistem desain: warna, tipografi, bentuk, nada bahasa, dan keputusan tentang apa yang tidak dipakai
- `docs/01-PRD.md` untuk masalah, persona, scope, use case, metrik, dan syarat penerimaan
- `docs/02-Domain-Spec.md` sebagai indeks, plus `02a` sampai `02d` untuk tiga belas modul dalam empat kelompok
- `docs/03-Data-Model.md` untuk sebelas tabel PostgreSQL dalam sintaks Drizzle
- `docs/04-API-Contract.md` untuk kontrak endpoint REST, bentuk error, dan aturan sinkron
- `docs/05-IA-dan-Layar.md` untuk breakpoint, navigasi, dan spesifikasi tiap layar
- `docs/06-Stack-dan-Batas.md` untuk pilihan teknologi dan enam belas teknologi yang ditolak
- `docs/07-PWA.md` untuk manifest, strategi cache, antrean luring, dan penanganan konflik
- `docs/08-NFR.md` untuk performa, aksesibilitas, keamanan, privasi, kompatibilitas, dan observability
- `docs/09-Pustaka-Prompt.md` untuk pustaka prompt per peran
- `docs/10-Epik-dan-Story.md` untuk epik dan story yang bisa langsung dikerjakan
- `docs/11-Delivery-Plan.md` untuk fase, sprint, risiko, definisi selesai, dan backlog tertunda
- `docs/12-Wireframe.md` untuk wireframe ASCII semua layar utama
- `docs/13-Rencana-Kerja.md` untuk rencana kerja ringkas dalam bahasa sehari-hari
- `docs/14-Naskah-Teks.md` untuk semua teks yang muncul di aplikasi: nama tombol, judul layar, navigasi, status, pesan galat, dialog, dan placeholder
- `docs/15-Glosarium.md` untuk kamus istilah, termasuk nama kolom di data model dan pasangan istilah yang sering tertukar
- `AGENTS.md` untuk aturan kerja bersama, daftar periksa sebelum kirim, dan referensi dokumen
- `CHANGELOG.md` untuk berkas ini
- README diperbarui dengan dokumen baru

#### Keputusan

- Nama produk memakai "Aisyah & Bagas" sebagai placeholder karena nama akhir belum ada
- Format BMAD dipakai untuk epik dan story, tapi tanpa istilah scrum, karena cara baca yang lebih ringan lebih cocok untuk dokumen berbahasa Indonesia
- Fase 1 gratis, tanpa logika paywall, karena belum ada pengguna sungguhan untuk diuji
- Marketplace vendor dan payment gateway dikeluarkan dari Fase 1 karena keduanya adalah produk terpisah dengan masalah jadwal dan izin yang berbeda
- Tujuh modul P0 menjadi batas minimum selesai

#### Belum ada

- Kode aplikasi
- Angka hasil pengukuran, karena belum ada aplikasi untuk diukur
- Harga dan model bisnis
