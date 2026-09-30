# 11. Delivery Plan

Rencana kerja untuk membangun Fase 1 dari nol sampai bisa dipakai orang sungguhan.

Kalau mau versi yang lebih singkat dan lebih mudah dibaca, lihat [`13-Rencana-Kerja.md`](13-Rencana-Kerja.md). Dokumen ini yang memuat detail per hari. Detail per story ada di [`10-Epik-dan-Story.md`](10-Epik-dan-Story.md), dan bentuk layarnya ada di [`12-Wireframe.md`](12-Wireframe.md) beserta lima berkas turunannya.

---

## Mokra kerja ini

Satu orang, waktu tidak dibatasi penuh. Kalau ada tim, urutan di dokumen ini masih bisa dipakai, tapi ukuran sprint berubah.

Estimasi di bawah dalam hari kerja untuk satu orang. Kalau ada yang terlihat ambisius, saya tulis alasannya.

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
| Filter status, kategori, penerima tugas |
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
| Unggah bukti transfer |
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

Estimasi: 10 hari

### Sprint 6. Rundown (4 hari)

| Item |
|---|
| Tabel rundown_items |
| CRUD item rundown |
| Template rundown per adat: Muslim, Java, Minang, Sunda, Bali, Modern |
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
| Kontrol who bisa melihat pengumuman mana |

### Sprint 8. PWA dan polish (3 hari)

| Item |
|---|
| Service worker lengkap dengan 4 strategi |
| Manifest dan ikon |
| Indikator luring |
| Antrean IndexedDB |
| Dialog konflik |
| Install prompt |

---

## Fase 3. Sisa P1

Estimasi: 6 hari

| Item |
|---|
| Seragam, tabel outfits dan CRUD |
| Filter undangan terkirim dan belum |
| Unduh data sebagai JSON |
| Hapus akun |
| Dark mode per halaman |

---

## Total

| Fase | Hari |
|---|---|
| Fase 0 | 5 |
| Fase 1 | 25 |
| Fase 2 | 10 |
| Fase 3 | 6 |
| **Total** | **46 hari kerja** |

Enam sampai sepuluh minggu. Itu asumsi satu orang full time. Kalau ada pekerjaan lain, kalikan.

---

## Yang tidak ada di rencana ini

| Tidak ada | Alasan |
|---|---|
| Fork ke produksi per fitur | Satu orang, tidak butuh branch management |
| Staging environment | Satu server, dev dan production cukup. Kalau butuh staging, itu tanda sudah perlu environment sendiri |
| Review dan approval cycle | Tidak ada tim untuk me-review |
| Tim desain terpisah | Semua dari `DESIGN.md` |
| Dokumentasi API terpisah | Ada di `04-API-Contract.md`, tidak perlu Swagger |
| Load test | NFR-nya masih belum diukur. Test load dengan 5 orang itu tidak berarti apa-apa |

---

## Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Lokasi service worker dan App Router Next.js bentrok | PWA tidak jalan | Uji di perangkat sungguhan sejak Sprint 6, bukan Sprint 8 |
| Impor tamu dari teks tidak akurat | Data kacau | Selalu tampilkan pratinjau, jangan langsung simpan |
| Men franklydiagrpa pembayaran salah | Kepercayaan user hilang | INTEGER bukan float, tanpa rounding. Hitung ulang total selalu dari database |
| Uji luring gagal di lokasi nyata | Hari-H kacau | Uji di lokasi dengan sinyal lemah sebelum rilis, bukan di kantor |
| Cookie sesi tidak jalan di iOS Safari | Login gagal di sebagian besar pengguna iOS | Uji di iOS sejak awal, jangan menunggu Sprint 8 |
| Scope bertambah | Tidak selesai | Semua permintaan baru masuk daftar tertunda, bukan langsung dikerjakan |

---

## Test plan per sprint

| Sprint | Yang harus diuji |
|---|---|
| Sprint 1 | Tanggal sudah lewat tidak bisa disimpan sebagai hari-H |
| Sprint 2 | Template tugas menghasilkan tugas yang benar, mengedit satu tidak mengubah yang lain |
| Sprint 3 | Total kategori sama dengan total keseluruhan, termasuk kasus nilai negatif |
| Sprint 4 | Pelunasan tidak tercatat dua kali, pembayaran salah vendor ditolak |
| Sprint 5 | Impor 50 nama sekaligus tidak memotong salah satunya |
| Sprint 6 | Rundown terbuka dengan airplane mode aktif |
| Sprint 7 | Share link tidak bisa ditulis, hanya dibaca |
| Sprint 8 | Antrean terkirim dengan urutan benar setelah luring |

---

## Yang harus diuji manual, dan tidak bisa diotomasi

| Yang | Kenapa tidak bisa diotomasi |
|---|---|
| Pasang di iOS | Butuh perangkat sungguhan |
| Layar terbaca enak di matahari | Butuh mata manusia |
| Tombol cukup besar untuk jempol | Butuh tangan manusia |
| R rundown terbaca dari lima meter | Butuh jarak nyata |
| Unduhan tidak tersendat di jaringan lambat | Butuh kondisi jaringan nyata |

Ini bukan karena tidak mau diuji otomatis. Hal-hal seperti ini memang tidak bisa diukur dengan kode, dan mencobanya dengan kode hanya memberikan rasa aman yang salah.

---

## Definisi Selesai

Una fitur selesai kalau semua ini benar:

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

| Keputusan | Documen | Kalau berubah |
|---|---|---|
| Nama produk "Aisyah & Bagas" | `DESIGN.md` | Ganti di satu tempat, palette dan font tidak berubah |
| Tidak ada marketplace vendor | `01-PRD.md` | Menambah beberapa bulan |
| Tidak ada payment gateway | `01-PRD.md` | Menambah pembayaran sungguhan, bukan catatan |
| Monolit Next.js | `06-Stack-dan-Batas.md` | Mengubah seluruh rencana kerja |
| Drag-and-drop meja ditolak | `02b-Tamu.md` | Beda delimiter dan elegan, tapi lebih lambat |
| Drag-and-drop rundown ditolak | `05-IA-dan-Layar.md` | Menambah pustaka dan banyak kerjaan |
| Target 46 hari kerja | dokumen ini | Semua tanggal berubah |

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
| Galeri foto | Butuh storage besar, dan foto ê²°í˜¼ sudah ada di album HP |
| Ekspor ke PDF | Bagus untuk dicetak, tapi belum ada yang minta |
| Tema selain dua | Butuh desain ulang yang sizable |
| Import dari Excel | Teks biasa sudah cukup untuk sebagian besar kasus |
| Barcode undangan | Butuh hubungan dengan modul undangan yang ditunda |
| Notifikasi pengingat lewat push | Butuh server yang selalu hidup |

Semuanya masuk Fase 2 atau lebih. Tidak ada yang mustahil, semuanya cuma belum waktunya.
