# Spec Redesign Visual Rapi Nikah

Status: menunggu review pemilik produk  
Tanggal: 2026-10-05

## Tujuan

Meningkatkan visual semua layar tanpa mengubah fitur, API, database, offline,
atau alur data. Hasil harus terasa hangat, rapi, matang, dan mudah dipindai,
bukan kumpulan kartu hasil tempel.

## Batasan

Tetap: Next.js, React, TypeScript, Tailwind, dependensi yang ada, seluruh route,
request, response, validasi, form, tema terang/gelap, PWA, cache baca, antrean
offline, target sentuh 44 x 44 px, format rupiah penuh, dan bahasa Indonesia.

Tidak dibangun: fitur baru, perubahan database/API, library UI/icon/chart,
marketplace, chat, AI, payment gateway, atau penyalinan Stitch secara literal.

URL Stitch menjadi inspirasi bila bisa dibuka. Karena akses MCP Stitch belum
tersedia, keputusan implementasi tetap berpijak pada `docs/21-Arah-Tampilan.md`, wireframe,
dan perilaku produk yang sudah ada.

## Arah visual

Warm editorial wedding planner: buku kerja pernikahan butik dengan kecepatan
alat kerja harian.

1. Satu headline utama per layar.
2. Satu aksi utama per konteks.
3. Satu permukaan utama per kelompok data, bukan kartu kecil untuk tiap kalimat.
4. Ruang kosong dipakai untuk hierarki.
5. Dekorasi hanya pada hero atau keadaan kosong.
6. Label dan bentuk selalu membantu warna menjelaskan status.

Token tetap berasal dari `src/app/globals.css` dan `docs/21-Arah-Tampilan.md`: ivory
`#FCF9F5`, pearl `#FFFFFF`, charcoal `#382A32`, rose `#FFA8B8`, honey
`#FED5B9`, gold `#E2B887`, plum `#66556B`, berry `#864E5A`, dan border
`#E6D5D8`. Token baru wajib semantik dan punya alasan.

Geometri: kontrol 16 px, kartu 24 px, panel 28 sampai 32 px, chip status pill,
border satin tipis, bayangan hangat tanpa hitam keras. Judul memakai Plus
Jakarta Sans; isi dan angka memakai Be Vietnam Pro; angka rupiah tabular.

## Struktur bersama

### Shell

Desktop memakai sidebar tenang, identitas produk, navigasi, tema, akun, serta
konten maksimum 1200 px. Header layar berisi judul, pengantar, dan satu aksi
utama. Mobile memakai header ringkas, satu kolom, navigasi bawah, safe area,
dan tombol yang tidak menutup isi.

### Permukaan dan kontrol

Gunakan tiga tingkatan: kanvas, panel kerja, hero/sorotan. Hindari nesting
kartu lebih dari dua tingkat. Daftar panjang memakai baris dengan pemisah
lembut. Tombol utama memakai kata kerja dan rose; sekunder memakai permukaan
ber-border; destruktif memakai warna status; kontrol icon-only wajib berlabel.

## Prioritas layar

- **Auth**: hero kiri desktop, form kanan; mobile satu alur; form menjadi fokus.
- **Beranda**: hero hari-H, ringkasan tugas/anggaran/tamu, tugas terdekat,
  tanggal penting dan keuangan di rel desktop.
- **Rencana**: tab jelas, filter tidak bersaing dengan judul, daftar memenuhi
  panel, form mudah dibaca di mobile.
- **Anggaran/Vendor**: total, terbayar, sisa di atas; progres tipis; status
  pembayaran eksplisit; pembayaran berada di detail vendor.
- **Tamu**: rekap di atas, pencarian/filter mudah dijangkau, baris runtuh
  vertikal di mobile, status tidak hanya warna, impor memakai pratinjau.
- **Hari-H**: jam dan urutan utama; item aktif memakai garis itinerary; info
  keluarga bersih; luring tidak menawarkan tombol palsu.
- **Laporan/Bagikan/Public**: susunan editorial mudah dicetak; tindakan
  dipisah dari isi; halaman publik tidak terlihat seperti dashboard internal.
- **Akun/System**: shell sama, isi sederhana, tindakan sensitif jelas.

## States

Setiap layar data wajib punya isi, kosong, memuat, gagal, dan luring bila
relevan. Skeleton mengikuti panel akhir. Empty state menjelaskan langkah
berikutnya. Error menyebut tindakan yang gagal dan menyediakan coba lagi.
Offline menjelaskan data berasal dari perangkat.

## Responsif dan aksesibilitas

Breakpoint tetap `compact`, `medium`, dan `expanded`. Tidak ada overflow pada
lebar 320 sampai 390 px. Tabel berubah menjadi baris/grid responsif. Kontras
teks minimal 4,5:1. Status tidak hanya warna. Fokus keyboard terlihat, urutan
fokus mengikuti baca, semua form punya label, reduced motion dihormati, dan
semua kontrol bisa dipakai keyboard.

## Strategi implementasi

1. Audit selector global dan shell tanpa mengubah perilaku.
2. Rapikan token, base style, kontrol, panel, dan state.
3. Perbarui shell desktop/mobile.
4. Perbarui auth dan Beranda.
5. Perbarui Rencana, Anggaran, Vendor, dan Tamu.
6. Perbarui Hari-H, Laporan, Bagikan, dan halaman publik.
7. Perbarui Akun, error, not-found, dan cetak.
8. Hapus CSS mati/konflik setelah pemakaian diverifikasi.

Komponen diperbaiki pada sumbernya. Tidak dibuat package design system, Storybook,
atau library baru. CSS lama tidak dihapus massal karena selector lintas layar;
setiap penghapusan harus melalui pencarian pemakaian dan screenshot.

## Verifikasi

Jalankan `npm run lint`, `npm run test`, `npm run build`, serta Playwright yang
ada. Ambil screenshot 390 px dan 1440 px. Periksa overflow horizontal,
keyboard/fokus, tema terang/gelap, dan seluruh state.

Selesai bila tidak ada layar utama yang tampak seperti kumpulan kartu acak,
hierarki aksi konsisten, tidak ada tombol mati atau placeholder baru, layout
mobile/desktop layak, build/test relevan berhasil, dan `CHANGELOG.md` mencatat
perubahan beserta alasannya.
