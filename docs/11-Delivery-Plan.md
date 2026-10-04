# 11. Delivery Plan

Rencana kerja untuk membangun Fase 1 dari nol sampai bisa dipakai orang sungguhan.

Kalau mau versi yang lebih singkat dan lebih mudah dibaca, lihat [`13-Rencana-Kerja.md`](13-Rencana-Kerja.md). Dokumen ini yang memuat detail per hari. Detail per story ada di [`10-Epik-dan-Story.md`](10-Epik-dan-Story.md), dan bentuk layarnya ada di [`12-Wireframe.md`](12-Wireframe.md) beserta lima berkas turunannya.

---

## Cakupan dokumen ini

Satu orang, waktu tidak dibatasi penuh. Kalau ada tim, urutan di dokumen ini masih bisa dipakai, tapi ukuran sprint berubah.

Estimasi di bawah dalam hari kerja untuk satu orang. Kalau ada yang terlihat ambisius, saya tulis alasannya.

---

## Urutan berkas yang dibuat

Fase dan sprint di bawah menjawab berapa lama. Bagian ini menjawab pertanyaan lain: apa yang dibuka dan dibuat lebih dulu saat mulai bekerja.

Urutannya bukan pilihan gaya. Data dulu, tampilan belakangan. Layar yang dibuat sebelum datanya ada hampir selalu diubah dua kali.

### Dibaca dulu, sebelum satu baris kode

| Urutan | Berkas | Untuk apa |
|---|---|---|
| 1 | `AGENTS.md` | Aturan kerja dan daftar periksa sebelum kirim |
| 2 | `DESIGN.md` | Warna, bentuk, dan jarak |
| 3 | [`03-Data-Model.md`](03-Data-Model.md) | Nama tabel dan kolom, jangan ditebak |
| 4 | [`04-API-Contract.md`](04-API-Contract.md) | Bentuk request, response, dan error |
| 5 | [`05-IA-dan-Layar.md`](05-IA-dan-Layar.md) | Layar mana memakai data mana |
| 6 | [`14-Naskah-Teks.md`](14-Naskah-Teks.md) | Teks yang muncul di layar, jangan dikarang |

### Urutan pengerjaan

| Langkah | Yang dibuat | Bagian |
|---|---|---|
| 1 | Proyek Next.js, TypeScript, Tailwind, satu perintah dev dan build | Fase 0 |
| 2 | Token warna dan font dari `DESIGN.md`, tema tanpa kedipan | Fase 0 |
| 3 | Layout dasar, navigasi bawah dan samping, skip link | Fase 0 |
| 4 | Drizzle, koneksi Postgres, sebelas tabel, migrasi pertama | Fase 0 |
| 5 | Better Auth, daftar, masuk, keluar, sesi 30 hari | Fase 0 |
| 6 | Plan pertama dan halaman akun | Sprint 1 |
| 7 | Tanggal penting, `reminderDays`, dan hitung mundur di server | Sprint 1 |
| 8 | Tugas, template bawaan, saring, urutan manual, tombol selesai | Sprint 2 |
| 9 | Anggaran, total dihitung di server, penanda lewat batas | Sprint 3 |
| 10 | Vendor, pembayaran, riwayat | Sprint 4. Unggah bukti transfer ditunda ke Fase 3, lihat `17-Rencana-Build.md` bagian 11 |
| 11 | Tamu, tempel dari teks dengan pratinjau, porsi dan kursi | Sprint 5 |
| 12 | Rundown, enam template adat, ganti template tanpa kehilangan suntingan | Sprint 6 |
| 13 | Info untuk keluarga dan tautan baca-saja | Sprint 7 |
| 14 | Laporan, teks WhatsApp, cetak PDF, tautan laporan yang bisa dimatikan | Sprint 8 |
| 15 | Service worker tahap pertama untuk rundown, lalu antrean luring, dialog konflik, halaman luring | Sprint 6, lalu Sprint 9 |
| 16 | Manifest, ikon, prompt install, peringatan versi baru | Sprint 9 |
| 17 | Seragam, sisa penyaring, unduh data JSON, hapus akun | Fase 3 |

Service worker dibagi dua tahap. Di Sprint 6 dibuat secukupnya supaya rundown terbuka tanpa sinyal, karena itu satu-satunya layar yang wajib luring. Di Sprint 9 baru dilengkapi empat strategi, antrean, dan penanda luring.

Alasannya ada di tabel risiko di bawah: lokasi service worker dan App Router Next.js paling sering bentrok, dan masalah itu jauh lebih murah ditemukan saat rundown baru selesai daripada saat semua layar sudah dibangun.

### Bentuk folder

```text
src/
├── app/
│   ├── (auth)/            masuk dan daftar
│   ├── (app)/             beranda, rencana, anggaran, tamu, laporan, akun
│   ├── l/                 halaman baca penerima tautan, tanpa navigasi aplikasi
│   ├── api/plans/         semua endpoint plan, selalu ada :planId
│   ├── manifest.ts
│   └── luring/            halaman saat tanpa sinyal
├── components/            komponen yang dipakai lebih dari satu layar
├── db/
│   ├── schema.ts          sebelas tabel
│   └── migrations/
├── lib/
│   ├── auth.ts            Better Auth
│   ├── format.ts          formatRupiah dan format tanggal
│   └── teks-wa.ts         penyusun teks WhatsApp, satu fungsi
└── public/
    ├── sw.js              service worker, ditulis tangan
    └── ikon/
```

Bentuk folder bukan peraturan produk. Kalau ada susunan yang lebih jelas, susunan itu yang dipakai. Yang tidak boleh berubah: setiap kueri menyaring `planId`, dan setiap path endpoint memuat `:planId`.

---

## Fase 0. Pondasi

Estimasi: 5 hari

| Hari | Pekerjaan | Selesai kalau |
|---|---|---|
| 1 | Inisialisasi Next.js, TypeScript, Tailwind | `npm run dev` jalan |
| 2 | Drizzle, koneksi Postgres, migrasi pertama | `drizzle-kit push` jalan, tabel users ada |
| 3 | Better Auth, login, register | Bisa daftar dan masuk |
| 4 | Setup tema, font, palet dari `DESIGN.md` | Warna dan font sama persis dengan dokumen |
| 5 | Layout dasar, navigasi, skip link | Pindah halaman jalan di mobile dan desktop |

**Yang tidak boleh ada di Fase 0:** fitur apa pun yang menyentuh domain plan. Semua layar harus kosong dulu. Alasannya, bugs di layout dan tema jauh lebih sulit dicari kalau sudah ada data di dalamnya.

---

## Fase 1. Inti

Estimasi: 25 hari

### Sprint 1. Plan dan tanggal penting (5 hari)

| Item |
|---|
| Tabel plans dan milestones |
| CRUD plan |
| CRUD tanggal penting, dengan `reminderDays` |
| Layar Daftar Plan dan form tanggal penting |
| Hitung mundur di server, dikirim ke client |

### Sprint 2. Daftar tugas (5 hari)

| Item |
|---|
| Tabel tasks |
| CRUD tugas |
| Saring berdasarkan status, kategori, dan penerima tugas |
| Urutan manual dalam kategori |
| Endpoint toggle |
| Template tugas bawaan, 7 kategori |
| Layar Daftar Tugas, dikelompokkan berdasarkan waktu |

### Sprint 3. Anggaran (6 hari)

| Item |
|---|
| Tabel budget_items |
| CRUD pos anggaran |
| Ringkasan per kategori |
| Layar Anggaran dengan diagram batang |
| Kasus nilai negatif |
| Tampilan rupiah yang benar |

### Sprint 4. Vendor dan pembayaran (6 hari)

| Item |
|---|
| Tabel vendors dan payments |
| CRUD vendor |
| Tambah pembayaran dari detail vendor |
| Riwayat pembayaran |
| Unggah bukti transfer (ditunda ke Fase 3, lihat `17-Rencana-Build.md` bagian 11) |
| Layar Vendor dan Pembayaran |

### Sprint 5. Tamu (3 hari)

| Item |
|---|
| Tabel guests |
| CRUD tamu, Impor dari teks dengan pratinjau |
| Filter kategori dan status |
| Rekap jumlah tamu per kategori |
| Layar Daftar Tamu |

---

## Fase 2. Hari-H dan keluarga

Estimasi: 19 hari

### Sprint 6. Rundown (4 hari)

| Item |
|---|
| Tabel rundown_items |
| CRUD item rundown |
| Template rundown per adat: Muslim, Jawa, Minang, Sunda, Bali, Modern |
| Layar Rundown |
| Service worker untuk rundown |
| Uji luring di perangkat sungguhan |

### Sprint 7. Info untuk keluarga (3 hari)

| Item |
|---|
| Tabel announcements |
| CRUD pengumuman |
| Share link baca-saja |
| Layar baca untuk penerima link, tanpa navigasi aplikasi |
| Kontrol siapa yang bisa melihat pengumuman mana |

### Sprint 8. Laporan dan bagikan (6 hari)

| Item |
|---|
| Endpoint `/report`, semua angka dihitung ulang dari data |
| Layar Laporan, satu halaman baca |
| Penyusun teks WhatsApp di server, tiga pilihan isi |
| Tombol bagikan lewat tautan `wa.me`, tanpa pustaka |
| Tautan laporan, maksimal lima per plan, bisa dimatikan sendiri |
| Cetak PDF dengan CSS `@media print`, tanpa pustaka |
| Uji cetak di HP dan laptop sungguhan |

### Sprint 9. PWA dan polish (6 hari)

| Item |
|---|
| Service worker lengkap dengan 4 strategi |
| Manifest dan ikon |
| Penanda luring |
| Antrean IndexedDB, urut, batas 200 item |
| Dialog konflik |
| Halaman luring, bukan halaman galat generik |
| Prompt install, tombol di Android dan petunjuk jujur di iOS |
| Peringatan versi baru |

Laporan dikerjakan sebelum PWA karena laporan tidak butuh luring. Kalau laporan dan service worker dikerjakan bersamaan, masalah cache dan masalah angka tercampur, dan salah satu selalu dituduh sebagai penyebabnya.

Service worker tahap pertama sudah ada sejak Sprint 6 karena rundown harus terbuka tanpa sinyal. Yang dikerjakan di Sprint 9 adalah sisanya, bukan dari nol.

---

## Fase 3. Sisa P1

Estimasi: 6 hari

| Item |
|---|
| Seragam, tabel outfits dan CRUD |
| Saring undangan terkirim dan belum |
| Unduh data sebagai JSON |
| Hapus akun |
| Dark mode per halaman |
| Cakupan uji untuk jalur kritis, Vitest dan Playwright |
| Uji aksesibilitas: kontras 4,5:1 dan seluruh alur dengan keyboard |
| Uji performa Lighthouse di HP kelas menengah |

---

## Total

| Fase | Hari |
|---|---|
| Fase 0 | 5 |
| Fase 1 | 25 |
| Fase 2 | 19 |
| Fase 3 | 6 |
| **Total** | **55 hari kerja** |

Sebelas sampai empat belas minggu. Itu asumsi satu orang penuh waktu. Kalau ada pekerjaan lain, kalikan.

Angka ini sudah termasuk pengujian, jeda antar sprint, dan waktu untuk pekerjaan yang tidak layak jadi story sendiri.

Kalau hanya menjumlah estimasi per story di [`10-Epik-dan-Story.md`](10-Epik-dan-Story.md), hasilnya 39 hari. Selisih 16 hari itu bukan karangan. Isinya: laporan dan cetak PDF yang belum pernah masuk sprint mana pun, halaman luring, uji cetak dan uji luring di perangkat sungguhan, evaluasi Lighthouse di HP kelas menengah, cakupan uji Vitest dan Playwright, serta jeda antar sprint.

---

## Yang tidak ada di rencana ini

| Tidak ada | Alasan |
|---|---|
| Fork ke produksi per fitur | Satu orang, tidak butuh kelola cabang |
| Staging environment | Satu server, dev dan produksi cukup. Kalau butuh staging, itu tanda sudah perlu lingkungan sendiri |
| Tinjau dan siklus persetujuan | Tidak ada tim untuk meninjau |
| Tim desain terpisah | Semua dari `DESIGN.md` |
| Dokumentasi API terpisah | Ada di `04-API-Contract.md`, tidak perlu Swagger |
| Uji beban | NFR-nya masih belum diukur. Uji beban dengan 5 orang itu tidak berarti apa-apa |

---

## Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Lokasi service worker dan App Router Next.js bentrok | PWA tidak jalan | Uji di perangkat sungguhan sejak Sprint 6, bukan Sprint 9 |
| Impor tamu dari teks tidak akurat | Data kacau | Selalu tampilkan pratinjau, jangan langsung simpan |
| Mencatat pembayaran salah | Kepercayaan user hilang | INTEGER bukan float, tanpa pembulatan. Hitung ulang total selalu dari database |
| Uji luring gagal di lokasi nyata | Hari-H kacau | Uji di lokasi dengan sinyal lemah sebelum rilis, bukan di kantor |
| Cookie sesi tidak jalan di iOS Safari | Login gagal di sebagian besar pengguna iOS | Uji di iOS sejak Sprint 1, jangan menunggu Sprint 9 |
| Scope bertambah | Tidak selesai | Semua permintaan baru masuk daftar tertunda, bukan langsung dikerjakan |

---

## Rencana uji per sprint

| Sprint | Yang harus diuji |
|---|---|
| Sprint 1 | Tanggal sudah lewat tidak bisa disimpan sebagai hari-H |
| Sprint 2 | Template tugas menghasilkan tugas yang benar, mengedit satu tidak mengubah yang lain |
| Sprint 3 | Total kategori sama dengan total keseluruhan, termasuk kasus nilai negatif |
| Sprint 4 | Pelunasan tidak tercatat dua kali, pembayaran salah vendor ditolak |
| Sprint 5 | Impor 50 nama sekaligus tidak memotong salah satunya |
| Sprint 6 | Rundown terbuka dengan airplane mode aktif |
| Sprint 7 | Share link tidak bisa ditulis, hanya dibaca |
| Sprint 8 | Angka di laporan sama dengan angka di halaman anggaran dan halaman tamu |
| Sprint 9 | Antrean terkirim dengan urutan benar setelah luring |

---

## Yang harus diuji manual, dan tidak bisa diotomasi

| Yang | Kenapa tidak bisa diotomasi |
|---|---|
| Pasang di iOS | Butuh perangkat sungguhan |
| Layar terbaca enak di matahari | Butuh mata manusia |
| Tombol cukup besar untuk jempol | Butuh tangan manusia |
| Rundown terbaca dari lima meter | Butuh jarak nyata |
| Unduhan tidak tersendat di jaringan lambat | Butuh kondisi jaringan nyata |

Ini bukan karena tidak mau diuji otomatis. Hal-hal seperti ini memang tidak bisa diukur dengan kode, dan mencobanya dengan kode hanya memberikan rasa aman yang salah.

---

## Definisi Selesai

Sebuah fitur selesai kalau semua ini benar:

| Item |
|---|
| Layar jalan di mobile dan desktop |
| Ada loading, kosong, error, dan luring |
| Bisa dipakai dengan keyboard, dengan fokus yang terlihat |
| Warna lolos kontras di terang dan gelap |
| Ada teks, bukan cuma ikon |
| Tombol yang ada benar-benar bekerja |
| Data ter-scope plan, tidak bisa dibaca plan orang lain |
| Ada loading state server untuk setiap request yang bisa gagal |
| Ada pengujian untuk jalur kritis |
| Semua keputusan punya alasan tertulis |

Kalau satu saja belum, fitur itu belum selesai meskipun kelihatannya jalan.

---

## Keputusan sementara yang harus dikonfirmasi

Semua keputusan di dokumen ini diambil sendiri karena belum ada jawaban. Berikut yang paling berpengaruh dan perlu dikonfirmasi sebelum kode ditulis banyak:

| Keputusan | Dokumen | Kalau berubah |
|---|---|---|
| Nama produk "Rapi Nikah" | `DESIGN.md` | Nama ditulis satu kali di `NAMA_PRODUK` (`src/lib/konstanta.ts`). Menggantinya tidak mengubah palette dan font |
| Tidak ada marketplace vendor | `01-PRD.md` | Menambah beberapa bulan |
| Tidak ada payment gateway | `01-PRD.md` | Menambah pembayaran sungguhan, bukan catatan |
| Monolit Next.js | `06-Stack-dan-Batas.md` | Mengubah seluruh rencana kerja |
| Drag-and-drop meja ditolak | `02b-Tamu.md` | Beda pembatas dan lebih sederhana, tapi lebih lambat |
| Drag-and-drop rundown ditolak | `05-IA-dan-Layar.md` | Menambah pustaka dan banyak kerjaan |
| Target 55 hari kerja | dokumen ini | Semua tanggal berubah |

Kalau keputusan di atas berubah, yang perlu dihitung ulang hanya rencana kerja. Data model dan API tidak terpengaruh untuk sebagian besar dari perubahan itu.

---

## Backlog tertunda

Permintaan yang sengaja tidak masuk Fase 1, dicatat di sini supaya tidak hilang:

| Item | Alasan ditunda |
|---|---|
| Marketplace vendor | Butuh dua sisi pasar, dan dua sisi pasar butuh waktu berbeda |
| Payment gateway | Pembayaran ke vendor lewat aplikasi berarti aplikasi memegang uang orang, dan itu tanggung jawab yang berbeda |
| Multi-user dengan hak akses berbeda | Sekarang hanya ada pemilik plan |
| Kalender bulanan penuh | Daftar tugas sudah menutup kebutuhan utama |
| Galeri foto | Butuh penyimpanan besar, dan foto sudah ada di album HP |
| Ekspor ke Excel | Bagus untuk dibuka di komputer, tapi teks biasa sudah cukup |
| Tema selain dua | Butuh desain ulang yang besar |
| Import dari Excel | Teks biasa sudah cukup untuk sebagian besar kasus |
| Kode undangan | Butuh hubungan dengan modul undangan yang ditunda |
| Notifikasi pengingat lewat push | Butuh server yang selalu hidup |

Semuanya masuk Fase 2 atau lebih. Tidak ada yang mustahil, semuanya cuma belum waktunya.
