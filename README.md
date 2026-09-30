# Wedding Planner Indonesia

Rencana produk, spesifikasi teknis, dan implementasi aplikasi perencanaan pernikahan yang dibuat untuk pasar Indonesia.

Kode aplikasi berada di direktori `src/`, dibangun dengan Next.js 15, PostgreSQL 17, Drizzle ORM, Better Auth, dan PWA luring.

---

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`DESIGN.md`](DESIGN.md) | Sistem desain. Warna, tipografi, bentuk, nada bahasa, dan keputusan tentang apa yang tidak dipakai |
| [`docs/01-PRD.md`](docs/01-PRD.md) | Product requirements. Masalah, persona, scope, use case, metrik, dan syarat penerimaan |
| [`docs/02-Domain-Spec.md`](docs/02-Domain-Spec.md) | Indeks spesifikasi domain |
| [`docs/02a-Perencanaan.md`](docs/02a-Perencanaan.md) | Tanggal penting, daftar tugas, anggaran, vendor dan pembayaran |
| [`docs/02b-Tamu.md`](docs/02b-Tamu.md) | Daftar tamu, undangan digital, meja dan seating |
| [`docs/02c-Hari-H.md`](docs/02c-Hari-H.md) | Rundown untuk enam sistem adat, info untuk keluarga, dokumentasi |
| [`docs/02d-Lainnya.md`](docs/02d-Lainnya.md) | Seragam, ucapan terima kasih, riwayat, dan daftar yang sengaja dikeluarkan |
| [`docs/03-Data-Model.md`](docs/03-Data-Model.md) | Skema PostgreSQL dalam sintaks Drizzle |
| [`docs/04-API-Contract.md`](docs/04-API-Contract.md) | Kontrak endpoint REST, bentuk error, aturan sinkron |
| [`docs/05-IA-dan-Layar.md`](docs/05-IA-dan-Layar.md) | Breakpoint, navigasi, dan spesifikasi per layar |
| [`docs/06-Stack-dan-Batas.md`](docs/06-Stack-dan-Batas.md) | Pilihan teknologi, alasan tiap pilihan, dan daftar teknologi yang ditolak |
| [`docs/07-PWA.md`](docs/07-PWA.md) | Manifest, strategi cache, antrean luring, konflik, install prompt |
| [`docs/08-NFR.md`](docs/08-NFR.md) | Performa, aksesibilitas, keamanan, privasi, kompatibilitas, observability |
| [`docs/09-Pustaka-Prompt.md`](docs/09-Pustaka-Prompt.md) | Dua belas prompt siap pakai untuk meminta bantuan AI menulis, memeriksa, dan menelusuri kode |
| [`docs/10-Epik-dan-Story.md`](docs/10-Epik-dan-Story.md) | Delapan epik dan empat puluh dua story, lengkap dengan syarat selesai dan syarat diterima |
| [`docs/11-Delivery-Plan.md`](docs/11-Delivery-Plan.md) | Urutan berkas dan folder yang dibuat, fase, sprint, risiko, rencana uji, definisi selesai, backlog tertunda |
| [`docs/12-Wireframe.md`](docs/12-Wireframe.md) | Indeks wireframe, notasi, dan aturan yang berlaku di semua layar |
| [`docs/12a-Wireframe-Inti.md`](docs/12a-Wireframe-Inti.md) | Wireframe Beranda, Tugas, Tanggal penting, Akun, dan luring |
| [`docs/12b-Wireframe-Uang.md`](docs/12b-Wireframe-Uang.md) | Wireframe Anggaran, Vendor, dan Pembayaran |
| [`docs/12c-Wireframe-Tamu.md`](docs/12c-Wireframe-Tamu.md) | Wireframe Daftar tamu, Tempel daftar, dan Meja |
| [`docs/12d-Wireframe-Hari-H.md`](docs/12d-Wireframe-Hari-H.md) | Wireframe Rundown, Info untuk keluarga, dan Seragam |
| [`docs/12e-Wireframe-Laporan.md`](docs/12e-Wireframe-Laporan.md) | Wireframe Laporan, Bagikan ke WhatsApp, dan Cetak PDF |
| [`docs/13-Rencana-Kerja.md`](docs/13-Rencana-Kerja.md) | Rencana kerja dalam bahasa sehari-hari, urutan pengerjaan, dan apa yang boleh dipotong |
| [`docs/14-Naskah-Teks.md`](docs/14-Naskah-Teks.md) | Semua teks yang muncul di aplikasi. Nama tombol, judul layar, pesan galat, dan konfirmasi |
| [`docs/15-Glosarium.md`](docs/15-Glosarium.md) | Kamus istilah. Satu kata punya satu arti di seluruh dokumen |
| [`docs/16-Laporan-dan-Bagikan.md`](docs/16-Laporan-dan-Bagikan.md) | Aturan laporan keadaan, bagikan ke WhatsApp, dan cetak PDF |
| [`docs/17-Rencana-Build.md`](docs/17-Rencana-Build.md) | Rencana teknis dan langkah implementasi kode aplikasi |
| [`AGENTS.md`](AGENTS.md) | Aturan kerja untuk AI yang menulis di repo ini, termasuk daftar periksa sebelum kirim |
| [`CHANGELOG.md`](CHANGELOG.md) | Catatan setiap perubahan, dari sudut pandang pembaca |

---

## Ringkasan produk

Aplikasi untuk pasangan yang sedang menyiapkan pernikahan, dipakai di HP dan laptop, dan tetap berguna saat sinyal hilang.

**Yang fokus:** rencana yang bisa dibaca, catatan pembayaran yang tidak tercecer di WhatsApp, dan rundown yang bisa dibuka di lokasi.

**Tidak ada di Fase 1:** lokapasar vendor, gerbang pembayaran, AI, arus sosial, iklan, dan beranda untuk penyelenggara profesional.

---

## Ringkasan stack

| Bagian | Pilihan |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| Validasi | Zod |
| Styling | Tailwind |
| PWA | Service worker tulis tangan |
| PDF | Dialog cetak bawaan dengan CSS `@media print` |
| Deployment | Satu aplikasi, satu database, satu proses |

Alasannya ada di [`docs/06-Stack-dan-Batas.md`](docs/06-Stack-dan-Batas.md), termasuk enam belas teknologi yang ditolak dan alasannya, dan satu keputusan bahwa PDF tidak butuh pustaka.

---

## Modul menurut prioritas

Sembilan modul P0 adalah batas minimum yang harus selesai sebelum produk bisa disebut jadi.

| Prioritas | Modul | Dokumen |
|---|---|---|
| P0 | Tanggal penting | [02a](docs/02a-Perencanaan.md) |
| P0 | Daftar tugas | [02a](docs/02a-Perencanaan.md) |
| P0 | Anggaran | [02a](docs/02a-Perencanaan.md) |
| P0 | Vendor dan pembayaran | [02a](docs/02a-Perencanaan.md) |
| P0 | Daftar tamu | [02b](docs/02b-Tamu.md) |
| P0 | Rundown | [02c](docs/02c-Hari-H.md) |
| P0 | Info untuk keluarga | [02c](docs/02c-Hari-H.md) |
| P0 | Laporan keadaan | [16](docs/16-Laporan-dan-Bagikan.md) |
| P0 | Bagikan ke WhatsApp | [16](docs/16-Laporan-dan-Bagikan.md) |

---

## Bahasa dan konvensi

Semua dokumen memakai Bahasa Indonesia dengan istilah yang benar-benar dipakai orang setiap hari. Istilah Inggris yang sudah jadi bagian bahasa sehari-hari tetap dipakai, misalnya vendor dan rundown, karena mengganti mereka dengan terjemahan hanya membuat dokumen ini terasa diterjemahkan.

Semua angka uang ditulis sebagai rupiah penuh tanpa pembulatan, misalnya `Rp 4.500.000`. Semua tanggal memakai format `YYYY-MM-DD` di spesifikasi teknis, dan tanggal panjang seperti `30 Juni 2026` di dokumen produk.

Setiap keputusan teknis ditulis bersama alasannya. Kalau ada keputusan tanpa alasan, itu belum selesai.

---

## Urutan baca yang disarankan

Kalau baru pertama kali dan mau cepat paham produknya, baca urutan ini:

1. [`01-PRD.md`](docs/01-PRD.md) untuk masalah dan scope
2. [`02a-Perencanaan.md`](docs/02a-Perencanaan.md) sampai [`02c-Hari-H.md`](docs/02c-Hari-H.md) untuk isinya
3. [`DESIGN.md`](DESIGN.md) untuk tampilan dan nada bahasa
4. [`06-Stack-dan-Batas.md`](docs/06-Stack-dan-Batas.md) kalau mau tahu kenapa stack ini dipilih begitu

Kalau mau langsung ke implementasi, urutannya lain: `AGENTS.md`, `DESIGN.md`, `03-Data-Model.md`, `04-API-Contract.md`, `05-IA-dan-Layar.md`, `14-Naskah-Teks.md`, lalu `10-Epik-dan-Story.md`.

---

## Yang belum ada

| Belum ada | Kenapa |
|---|---|
| Kode aplikasi | Dokumen dulu, supaya yang dibangun bisa diuji sebelum ditulis |
| Angka hasil pengukuran | Belum ada aplikasi untuk diukur. Lihat tabel di `08-NFR.md` |
| Nama produk final | "Aisyah & Bagas" masih placeholder |
| Harga dan model bisnis | Fase 1 gratis. Monetisasi dibahas setelah ada pengguna sungguhan |

Tiga baris terakhir disengaja. Menulis angka hasil pengukuran sebelum aplikasi ada berarti mengarang data, dan itu tidak dilakukan di dokumen ini.