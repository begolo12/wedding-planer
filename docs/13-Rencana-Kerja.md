# Rencana Kerja

Rencana kerja dalam bahasa sehari-hari. Ini bukan dokumen proyek, ini pengingat untuk diri sendiri.

Detail teknis dan jadwal ada di dokumen lain. Ada satu saja yang perlu dilihat, lalu dokumen ini yang mengingat urutan dan alasan.

---

## Yang perlu dilihat

| Kalau mau | Buka |
|---|---|
| Rincian per sprint | [`docs/11-Delivery-Plan.md`](11-Delivery-Plan.md) |
| Rincian per story | [`docs/10-Epik-dan-Story.md`](10-Epik-dan-Story.md) |
| Bentuk layar | [`docs/12-Wireframe.md`](12-Wireframe.md) sebagai indeks, lalu `12a` sampai `12e` |

---

## Urutan kerja

Tiga tahap. Tahap satu wajib beres dulu sebelum tahap dua dimulai.

```text
Tahap 1: Pondasi       4,5 hari
  aplikasi jalan, tema jalan, database jalan, daftar akun jalan
        |
        v
Tahap 2: Isi         22,5 hari
  tanggal, tugas, anggaran, vendor, pembayaran, tamu, rundown, laporan
        |
        v
Tahap 3: Kualitas      12 hari
  offline, install, performa, aksesibilitas, keamanan, backup
```

Total 39 hari kerja. Angka tahap dua dan tiga sudah dijumlahkan dari daftar story di [`docs/10-Epik-dan-Story.md`](10-Epik-dan-Story.md), jadi tidak ada story yang terlewat di hitungan.

Rencana sprint di [`docs/11-Delivery-Plan.md`](11-Delivery-Plan.md) memakai 55 hari kerja. Selisih 16 hari itu bukan karangan. Isinya laporan dan cetak PDF yang belum pernah masuk sprint mana pun, halaman luring, uji cetak dan uji luring di perangkat sungguhan, evaluasi Lighthouse, cakupan uji otomatis, dan jeda antar sprint.

---

## Tahap 1: Pondasi

**Selesai kalau:** aplikasi jalan, dua tema aktif, migrasi jalan, orang bisa daftar dan membuat plan.

| Urutan | Apa yang dikerjakan | Selesai kalau |
|---|---|---|
| 1 | Inisialisasi proyek | Perintah dev dan build jalan |
| 2 | Warna dan tipografi | Warna persis sama seperti `DESIGN.md` |
| 3 | Tema tanpa kedip | Tidak ada layar putih sesaat di mode gelap |
| 4 | Layout dan navigasi | Semua halaman bisa dicapai |
| 5 | Database dan migrasi | Migrasi jalan di database kosong |
| 6 | Daftar, masuk, keluar | Sesi bertahan 30 hari |
| 7 | Buat plan pertama | Tanggal wajib diisi, plan terhubung ke akun |

Yang paling sering lupa di tahap ini: jangan tambah fitur apa pun. Bug layout jauh lebih sulit dicari kalau data sudah ada. Bereskan layout dulu, baru diisi.

---

## Tahap 2: Isi

**Selesai kalau:** semua yang ada di daftar tugas inti sudah bisa dipakai.

| Urutan | Apa yang dikerjakan | Selesai kalau |
|---|---|---|
| 1 | Daftar tanggal penting | Tanggal ditotalkan, lewat ditandai |
| 2 | Daftar tugas | Dikelompokkan waktu, bisa dicentang |
| 3 | Template tugas | Satu klik isi tugas KUA, akad, venue |
| 4 | Daftar anggaran | Total dihitung di server, sama semua tempat |
| 5 | Tanda lewat batas | Warna dan teks, bukan warna saja |
| 6 | Daftar vendor | Kategori Indonesia lengkap |
| 7 | Catat pembayaran | Riwayat ada, total otomatis |
| 8 | Ringkasan vendor | Tagihan, terbayar, sisa |
| 9 | Daftar tamu | Enam kategori, jumlah orang |
| 10 | Tempel daftar tamu | Pratinjau dulu, baru simpan |
| 11 | Porsi dan kursi | Dihitung dari daftar tamu |
| 12 | Template rundown | Enam adat |
| 13 | Edit rundown | Item bisa ditambah dan diurutkan |
| 14 | Info untuk keluarga | Tautan tanpa login, baca saja |
| 15 | Halaman laporan | Semua angka dihitung ulang di server |
| 16 | Bagikan ke WhatsApp | Teks disusun di server, angka tidak bisa diubah dari HP |
| 17 | Cetak PDF | Rapi di kertas, tanpa pustaka tambahan |

Urutan ini bukan kebetulan. Data lebih dulu, tampilan belakangan. Kalau tampilan dulu, nanti harus diubah dua kali.

---

## Tahap 3: Kualitas

**Selesai kalau:** aplikasi bisa diinstall, jalan tanpa sinyal, dan tidak lambat.

| Urutan | Apa yang dikerjakan | Selesai kalau |
|---|---|---|
| 1 | Service worker dan cache | Aset terbuka dari cache, API tidak |
| 2 | Antrean luring | Perubahan terkirim ulang dengan urutan benar |
| 3 | Rundown tanpa sinyal | Terbuka tanpa internet |
| 4 | Halaman luring | Menjelaskan apa yang masih bisa dipakai |
| 5 | Prompt install | Android tombol, iOS petunjuk jujur |
| 6 | Peringatan versi baru | Ada, bisa ditutup |
| 7 | Performa | Lighthouse mobile minimal 90 |
| 8 | Aksesibilitas | Kontras 4,5:1, jalan dengan keyboard |
| 9 | Keamanan | Setiap request cek kepemilikan |
| 10 | Backup dan pemulihan | Pernah diuji memulihkan, bukan cuma ada |
| 11 | Halaman akun | Unduh data JSON, minta hapus |

---

## Kalau waktunya mepet

Kalau harus memilih bagian mana yang dipotong, potong dari tabel ini, bukan dari inti.

| Yang dipotong | Alasan | Yang ditutup |
|---|---|---|
| Contoh dan teks tambahan | Tambahan, bukan fungsi | Berdampak kecil |
| Halaman luring | Halamannya sudah tidak dipakai | Halaman error tetap perlu |
| Peringatan versi baru | Cache baru akan datang sendiri | Pengguna hanya dimuat sekali |
| Saring pembayaran | Banyak pembayaran jarang terjadi | Daftar pembayaran tetap ada |

Jangan potong dari sini:

- Daftar tugas
- Daftar pembayaran
- Rundown tanpa sinyal
- Cek keamanan
- Backup

Lima hal ini inti produk. Kalau semuanya harus dipotong, lebih baik menunda rilis daripada meluncurkan setengah jadi.

---

## Kalau ada yang mengganjal

| Gejala | Penyebab yang biasanya | Yang dilakukan |
|---|---|---|
| Bug layout muncul tiba-tiba | Ada data yang tidak terduga | Cari data itu dulu, jangan perbaiki gejalanya |
| Total anggaran salah | Ada pembayaran tanpa vendor | Cek aturan data di `03-Data-Model.md` |
| Offline tidak sinkron | Antrean tidak urut | Lihat urutan kirim di `07-PWA.md` |
| Lambat di HP tapi cepat di laptop | Aset terlalu besar | Lihat Story E8.1 |
| Mode gelap tidak terbaca | Warna dibalik tanpa diperiksa | Lihat aturan mode gelap di `DESIGN.md` |
| Plan orang lain kelihatan | Kepemilikan tidak dicek | Berhenti, ini bukan bug kecil |

Baris terakhir itu bukan bug kecil. Kalau sampai terlihat, yang lain menunggu sampai selesai.

---

## Kalau ada yang belum jelas

Tiga pertanyaan yang sering muncul:

**Nama produk apa?** Nama produk yang dipakai sekarang adalah "Rapi Nikah", ditulis satu kali di `NAMA_PRODUK` (`src/lib/konstanta.ts`). "Aisyah & Bagas" di contoh layar adalah nama pasangan pemakai, bukan nama produk.

**Harganya berapa?** Fase 1 gratis. Belum ada alasan untuk meminta bayaran karena belum ada pengguna yang bisa dites.

**Perlu lisensi berbayar atau tidak?** Tidak ada fitur di Fase 1 yang perlu lisensi berbayar. Kalau nanti ada, tulis alasannya di `06-Stack-dan-Batas.md`.

---

## Kalau selesai

Tiga tahap sudah jalan. Angka yang bisa diukur sudah ditulis di `08-NFR.md`, dan yang belum diukur ditulis apa adanya di `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 18.

1. Yang sudah diukur ada di `08-NFR.md` bagian "Rencana pengukuran": kontras, lebar 360px, dark mode, tombol tanpa handler, dan PDF
2. Yang belum (Lighthouse, LCP, screen reader, keyboard penuh, install iOS, uji luring di desa, uji beban) tetap ditulis "belum", jangan diisi perkiraan
3. Versi sekarang 0.14.0. Rilis produksi menunggu deploy, database produksi, dan backup, yang ketiganya belum ada
4. Tulis di `CHANGELOG.md` apa yang berubah
