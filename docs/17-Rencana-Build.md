# 17. Rencana Build

Dokumen ini mengubah semua dokumen sebelumnya menjadi urutan pekerjaan yang bisa dicentang satu per satu. Isinya bukan alasan baru, tapi jawaban untuk satu pertanyaan: berkas apa yang dibuat, dalam urutan apa, dan selesai kalau apa.

Kalau dokumen ini bertentangan dengan [`03-Data-Model.md`](03-Data-Model.md), [`04-API-Contract.md`](04-API-Contract.md), atau [`05-IA-dan-Layar.md`](05-IA-dan-Layar.md), dokumen itu yang menang, dan dokumen ini yang diperbaiki.

Aturan kerja tetap dari [`AGENTS.md`](../AGENTS.md). Warna dan bentuk dari [`DESIGN.md`](../DESIGN.md).

---

## 1. Cara memakai dokumen ini

| Kalau mau tahu | Lihat bagian |
|---|---|
| Urutan langkah dari nol | Bagian 3 |
| Berkas apa dibuat di langkah mana | Bagian 3 dan 4 |
| Endpoint mana masuk berkas mana | Bagian 5 |
| Layar mana masuk berkas mana | Bagian 6 |
| Cara menjalankan | Bagian 9 |
| Selesai kalau apa | Bagian 10 |

Satu langkah dinyatakan selesai hanya kalau daftar centangnya terisi semua. Bukan kalau berkasnya sudah ada.

---

## 2. Keputusan yang diselesaikan di sini

Dua dokumen saling bertentangan soal navigasi. Supaya tidak menebak, keputusannya ditulis di sini.

| Pertanyaan | Sumber yang bertentangan | Keputusan | Alasan |
|---|---|---|---|
| Berapa item di navigasi bawah | `05-IA-dan-Layar.md` bagian 3 menulis empat, `14-Naskah-Teks.md` bagian 5.2 menulis lima | Empat: Beranda, Rencana, Anggaran, Tamu | `05-IA-dan-Layar.md` adalah dokumen yang mengatur navigasi, dan alasannya sudah tertulis di sana. Empat item membuat tinggi bilah bawah tetap 56px di layar 360px, yang penting karena `compact` adalah target utama |
| Isi navigasi samping di `expanded` | `14-Naskah-Teks.md` bagian 5.1 menulis enam, wireframe `12a` menulis tujuh | Enam dari `14-Naskah-Teks.md`, ditambah Laporan | `14-Naskah-Teks.md` adalah sumber label, dan Laporan tidak boleh hilang karena itu satu-satunya jalan ke halaman Laporan di layar lebar |

Keputusan lain yang belum ada di dokumen, dan ditulis di sini supaya tidak jadi asumsi diam-diam:

| Keputusan | Alasan |
|---|---|
| Tautan baca-saja memakai awalan `/l/` | Satu awalan untuk semua penerima tautan. Dipisah dari `(app)` supaya tidak kena navigasi aplikasi dan tidak butuh sesi |
| Google OAuth dibiarkan nonaktif kalau kunci tidak ada | Kunci Google tidak disimpan di repo. Tombolnya disembunyikan, bukan ditampilkan lalu gagal, sesuai aturan tobol mati di `05-IA-dan-Layar.md` bagian 14 |
| Template tugas dan template rundown disimpan di kode, bukan di database | Isinya berubah jarang, tidak perlu diedit pengguna, dan tidak menambah tabel yang harus dijaga |
| Angka `reminderDays` di `02a` tidak dibangun di build ini | Pengingat lokal butuh Notification API dan izin pengguna. Masuk Fase 3, dicatat di bagian 11 |

---

## 3. Urutan langkah

Sepuluh langkah. Tiap langkah berakhir dengan aplikasi yang masih jalan, karena itu yang membedakan langkah dari tumpukan perubahan.

### Langkah 1. Proyek dan tema

| | |
|---|---|
| Berkas | `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx` |
| Selesai kalau | `npm run dev` jalan, `npm run build` jalan, warna di layar sama persis dengan `DESIGN.md` bagian 3, font Plus Jakarta Sans dan Be Vietnam Pro termuat |

### Langkah 2. Database

| | |
|---|---|
| Berkas | `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`, `.env.example`, `src/db/migrations/` |
| Selesai kalau | Sebelas tabel plus empat tabel auth ada di database, `npm run db:push` jalan di database kosong |

### Langkah 3. Auth dan kerangka aplikasi

| | |
|---|---|
| Berkas | `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/sesi.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/(auth)/masuk/page.tsx`, `src/app/(auth)/daftar/page.tsx`, `src/components/nav.tsx`, `src/components/theme-toggle.tsx`, `src/app/(app)/layout.tsx` |
| Selesai kalau | Bisa daftar, masuk, keluar. Sesi bertahan. Halaman di `(app)` tidak bisa dibuka tanpa sesi |

### Langkah 4. Plan dan Beranda

| | |
|---|---|
| Berkas | `src/lib/format.ts`, `src/lib/galat.ts`, `src/lib/plan.ts`, `src/app/api/plans/route.ts`, `src/app/api/plans/[planId]/route.ts`, `src/app/api/plans/[planId]/overview/route.ts`, `src/app/(app)/beranda/page.tsx`, `src/app/(app)/rencana/plan/page.tsx`, `src/components/states.tsx`, `src/components/rupiah.tsx` |
| Selesai kalau | Pengguna baru bisa membuat plan pertama, Beranda menampilkan hitung mundur, dan keempat state (memuat, kosong, gagal, luring) ada di Beranda |

### Langkah 5. Tugas dan tanggal penting

| | |
|---|---|
| Berkas | `src/lib/template.ts`, `src/app/api/plans/[planId]/tasks/route.ts`, `src/app/api/plans/[planId]/tasks/[taskId]/route.ts`, `src/app/api/plans/[planId]/tasks/[taskId]/toggle/route.ts`, `src/app/api/plans/[planId]/tasks/from-template/route.ts`, `src/app/api/plans/[planId]/tasks/reorder/route.ts`, `src/app/api/plans/[planId]/milestones/route.ts`, `src/app/api/plans/[planId]/milestones/[id]/route.ts`, `src/app/(app)/rencana/page.tsx`, `src/app/(app)/rencana/tanggal/page.tsx`, `src/components/task-item.tsx` |
| Selesai kalau | Tugas dikelompokkan per waktu (lewat, hari ini, minggu ini, tanpa tenggat, selesai), satu tap menandai selesai, template tujuh kategori bisa dimuat |

### Langkah 6. Anggaran, vendor, pembayaran

| | |
|---|---|
| Berkas | `src/app/api/plans/[planId]/budget-items/route.ts`, `src/app/api/plans/[planId]/budget-items/[itemId]/route.ts`, `src/app/api/plans/[planId]/vendors/route.ts`, `src/app/api/plans/[planId]/vendors/[vendorId]/route.ts`, `src/app/api/plans/[planId]/vendors/[vendorId]/payments/route.ts`, `src/app/api/plans/[planId]/payments/[paymentId]/route.ts`, `src/app/(app)/anggaran/page.tsx`, `src/app/(app)/rencana/vendor/page.tsx`, `src/app/(app)/rencana/vendor/[vendorId]/page.tsx`, `src/components/budget-bar.tsx` |
| Selesai kalau | Total rencana, terbayar, dan sisa dihitung di server dan sama di semua tempat. Bar tipis tanpa chart. Nilai negatif pakai warna status, bukan warna tombol |

### Langkah 7. Tamu

| | |
|---|---|
| Berkas | `src/app/api/plans/[planId]/guests/route.ts`, `src/app/api/plans/[planId]/guests/[guestId]/route.ts`, `src/app/api/plans/[planId]/guests/import/route.ts`, `src/app/(app)/tamu/page.tsx`, `src/app/(app)/tamu/impor/page.tsx` |
| Selesai kalau | Impor dari teks menampilkan pratinjau dulu, baris yang bermasalah diberi kalimat, dan rekap orang serta kursi dihitung dari data |

### Langkah 8. Rundown, info keluarga, seragam

| | |
|---|---|
| Berkas | `src/app/api/plans/[planId]/rundown/route.ts`, `src/app/api/plans/[planId]/rundown/[id]/route.ts`, `src/app/api/plans/[planId]/announcements/route.ts`, `src/app/api/plans/[planId]/announcements/[id]/route.ts`, `src/app/api/plans/[planId]/announcements/[id]/share/route.ts`, `src/app/api/plans/[planId]/outfits/route.ts`, `src/app/api/plans/[planId]/outfits/[id]/route.ts`, `src/app/(app)/hari-h/page.tsx`, `src/app/(app)/rencana/info/page.tsx`, `src/app/(app)/rencana/seragam/page.tsx`, `src/app/l/[token]/page.tsx` |
| Selesai kalau | Rundown urut jam, font bisa dibesar dan tersimpan di perangkat, halaman `/l/` terbaca tanpa sesi dan tanpa satu pun tombol yang mengubah data |

### Langkah 9. Laporan, bagikan, cetak

| | |
|---|---|
| Berkas | `src/lib/teks-wa.ts`, `src/app/api/plans/[planId]/report/route.ts`, `src/app/api/plans/[planId]/report/share-text/route.ts`, `src/app/api/plans/[planId]/report/links/route.ts`, `src/app/api/plans/[planId]/report/links/[id]/route.ts`, `src/app/(app)/laporan/page.tsx`, `src/app/(app)/laporan/bagikan/page.tsx`, `src/app/cetak.css` |
| Selesai kalau | Semua angka di laporan dihitung ulang, teks WhatsApp disusun di server dengan tiga pilihan isi, `wa.me` terbuka, dan dialog cetak menghasilkan tiga halaman yang rapi |

### Langkah 10. PWA dan akun

| | |
|---|---|
| Berkas | `src/app/manifest.ts`, `public/sw.js`, `public/luring.html`, `src/lib/luring.ts`, `src/components/luring-banner.tsx`, `src/components/install-prompt.tsx`, `src/app/luring/page.tsx`, `src/app/(app)/akun/page.tsx`, `public/ikon/` |
| Selesai kalau | Aset terbuka dari cache, `/api/` tidak pernah dari cache, rundown terbuka tanpa sinyal, antrean luring terkirim urut, dan halaman akun bisa unduh data JSON |

---

## 4. Peta berkas

```text
src/
├── app/
│   ├── layout.tsx              root, font, skrip tema tanpa kedipan
│   ├── globals.css             token warna dan jarak dari DESIGN.md
│   ├── page.tsx                arahkan ke /beranda atau /masuk
│   ├── manifest.ts             manifest PWA
│   ├── cetak.css               aturan @media print
│   ├── (auth)/
│   │   ├── masuk/page.tsx
│   │   └── daftar/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          kerangka: navigasi, pita luring, toast
│   │   ├── beranda/page.tsx
│   │   ├── rencana/page.tsx    tugas, sumber utama
│   │   ├── rencana/tanggal/page.tsx
│   │   ├── rencana/plan/page.tsx
│   │   ├── rencana/vendor/page.tsx
│   │   ├── rencana/vendor/[vendorId]/page.tsx
│   │   ├── rencana/info/page.tsx
│   │   ├── rencana/seragam/page.tsx
│   │   ├── anggaran/page.tsx
│   │   ├── tamu/page.tsx
│   │   ├── tamu/impor/page.tsx
│   │   ├── hari-h/page.tsx     rundown
│   │   ├── laporan/page.tsx
│   │   ├── laporan/bagikan/page.tsx
│   │   └── akun/page.tsx
│   ├── l/[token]/page.tsx      halaman baca, tanpa sesi
│   ├── luring/page.tsx         halaman saat tanpa sinyal
│   └── api/
│       ├── auth/[...all]/route.ts
│       └── plans/...
├── components/
│   ├── nav.tsx                 bilah bawah dan samping
│   ├── theme-toggle.tsx
│   ├── luring-banner.tsx
│   ├── install-prompt.tsx
│   ├── states.tsx              memuat, kosong, gagal
│   ├── rupiah.tsx              formatRupiah untuk layar
│   ├── task-item.tsx
│   ├── budget-bar.tsx
│   ├── field.tsx               label, input, galat per field
│   └── toast.tsx
├── db/
│   ├── schema.ts               sebelas tabel plus empat tabel auth
│   ├── index.ts                koneksi
│   └── migrations/
├── lib/
│   ├── auth.ts                 Better Auth
│   ├── auth-client.ts
│   ├── sesi.ts                 wajibMasuk, wajibPunyaPlan
│   ├── format.ts               formatRupiah, formatTanggal, hitungMundur
│   ├── galat.ts                bentuk galat yang sama untuk semua endpoint
│   ├── jadwal.ts               pengelompokan tugas per waktu
│   ├── template.ts             template tugas, rundown, dan pos anggaran
│   ├── teks-wa.ts              penyusun teks WhatsApp, satu fungsi
│   └── luring.ts               antrean IndexedDB
└── public/
    ├── sw.js                   service worker tulis tangan
    ├── luring.html
    └── ikon/
```

Bentuk folder bukan peraturan produk. Yang tidak boleh berubah: setiap kueri menyaring `planId`, dan setiap path endpoint memuat `:planId`.

---

## 5. Endpoint ke berkas

| Endpoint | Berkas |
|---|---|
| `/api/auth/*` | `src/app/api/auth/[...all]/route.ts` |
| `/api/plans` | `src/app/api/plans/route.ts` |
| `/api/plans/:planId` | `src/app/api/plans/[planId]/route.ts` |
| `/api/plans/:planId/overview` | `src/app/api/plans/[planId]/overview/route.ts` |
| `/api/plans/:planId/tasks` | `src/app/api/plans/[planId]/tasks/route.ts` |
| `/api/plans/:planId/tasks/:taskId` | `src/app/api/plans/[planId]/tasks/[taskId]/route.ts` |
| `/api/plans/:planId/tasks/:taskId/toggle` | `src/app/api/plans/[planId]/tasks/[taskId]/toggle/route.ts` |
| `/api/plans/:planId/tasks/from-template` | `src/app/api/plans/[planId]/tasks/from-template/route.ts` |
| `/api/plans/:planId/tasks/reorder` | `src/app/api/plans/[planId]/tasks/reorder/route.ts` |
| `/api/plans/:planId/milestones` | `src/app/api/plans/[planId]/milestones/route.ts` |
| `/api/plans/:planId/milestones/:id` | `src/app/api/plans/[planId]/milestones/[id]/route.ts` |
| `/api/plans/:planId/budget-items` | `src/app/api/plans/[planId]/budget-items/route.ts` |
| `/api/plans/:planId/budget-items/:itemId` | `src/app/api/plans/[planId]/budget-items/[itemId]/route.ts` |
| `/api/plans/:planId/vendors` | `src/app/api/plans/[planId]/vendors/route.ts` |
| `/api/plans/:planId/vendors/:vendorId` | `src/app/api/plans/[planId]/vendors/[vendorId]/route.ts` |
| `/api/plans/:planId/vendors/:vendorId/payments` | `src/app/api/plans/[planId]/vendors/[vendorId]/payments/route.ts` |
| `/api/plans/:planId/payments/:paymentId` | `src/app/api/plans/[planId]/payments/[paymentId]/route.ts` |
| `/api/plans/:planId/guests` | `src/app/api/plans/[planId]/guests/route.ts` |
| `/api/plans/:planId/guests/:guestId` | `src/app/api/plans/[planId]/guests/[guestId]/route.ts` |
| `/api/plans/:planId/guests/import` | `src/app/api/plans/[planId]/guests/import/route.ts` |
| `/api/plans/:planId/rundown` | `src/app/api/plans/[planId]/rundown/route.ts` |
| `/api/plans/:planId/rundown/:id` | `src/app/api/plans/[planId]/rundown/[id]/route.ts` |
| `/api/plans/:planId/outfits` | `src/app/api/plans/[planId]/outfits/route.ts` |
| `/api/plans/:planId/outfits/:id` | `src/app/api/plans/[planId]/outfits/[id]/route.ts` |
| `/api/plans/:planId/announcements` | `src/app/api/plans/[planId]/announcements/route.ts` |
| `/api/plans/:planId/announcements/:id` | `src/app/api/plans/[planId]/announcements/[id]/route.ts` |
| `/api/plans/:planId/announcements/:id/share` | `src/app/api/plans/[planId]/announcements/[id]/share/route.ts` |
| `/api/plans/:planId/report` | `src/app/api/plans/[planId]/report/route.ts` |
| `/api/plans/:planId/report/share-text` | `src/app/api/plans/[planId]/report/share-text/route.ts` |
| `/api/plans/:planId/report/links` | `src/app/api/plans/[planId]/report/links/route.ts` |
| `/api/plans/:planId/report/links/:id` | `src/app/api/plans/[planId]/report/links/[id]/route.ts` |

`PUT` tidak dipakai di mana pun. Setiap handler menulis dalam bentuk yang sama: cek sesi, cek kepemilikan plan, validasi Zod, kueri dengan filter `planId`, balas JSON.

---

## 6. Layar ke berkas dan route

| Layar (`14-Naskah-Teks.md`) | Route | Berkas |
|---|---|---|
| Masuk | `/masuk` | `(auth)/masuk/page.tsx` |
| Daftar | `/daftar` | `(auth)/daftar/page.tsx` |
| Beranda | `/beranda` | `(app)/beranda/page.tsx` |
| Tugas | `/rencana` | `(app)/rencana/page.tsx` |
| Tanggal penting | `/rencana/tanggal` | `(app)/rencana/tanggal/page.tsx` |
| Plan | `/rencana/plan` | `(app)/rencana/plan/page.tsx` |
| Vendor | `/rencana/vendor` | `(app)/rencana/vendor/page.tsx` |
| Pembayaran | `/rencana/vendor/[vendorId]` | `(app)/rencana/vendor/[vendorId]/page.tsx` |
| Info untuk keluarga | `/rencana/info` | `(app)/rencana/info/page.tsx` |
| Busana | `/rencana/seragam` | `(app)/rencana/seragam/page.tsx` |
| Anggaran | `/anggaran` | `(app)/anggaran/page.tsx` |
| Tamu | `/tamu` | `(app)/tamu/page.tsx` |
| Tempel daftar tamu | `/tamu/impor` | `(app)/tamu/impor/page.tsx` |
| Rundown acara | `/hari-h` | `(app)/hari-h/page.tsx` |
| Laporan | `/laporan` | `(app)/laporan/page.tsx` |
| Bagikan laporan | `/laporan/bagikan` | `(app)/laporan/bagikan/page.tsx` |
| Akun | `/akun` | `(app)/akun/page.tsx` |
| Baca tautan | `/l/[token]` | `l/[token]/page.tsx` |
| Luring | `/luring` | `luring/page.tsx` |

---

## 7. Urutan migrasi database

Tabel dibuat dalam urutan ini, karena ada foreign key.

| Urutan | Tabel | Dibuat oleh |
|---|---|---|
| 1 | `users`, `session`, `account`, `verification` | Better Auth, ditulis manual di `schema.ts` |
| 2 | `plans` | FK ke `users` |
| 3 | `milestones`, `tasks`, `budget_items`, `vendors`, `guests`, `rundown_items`, `announcements`, `outfits` | FK ke `plans` |
| 4 | `payments` | FK ke `plans` dan `vendors` |

Cascade hanya dari `plans` ke tabel anak. Tidak ada cascade kedua ke `users`, sesuai aturan di [`03-Data-Model.md`](03-Data-Model.md).

---

## 8. Yang dipakai untuk tiap kebutuhan

Ringkasan satu layar, supaya tidak ada dependensi yang masuk diam-diam.

| Kebutuhan | Yang dipakai | Yang tidak dipakai |
|---|---|---|
| Format uang | Fungsi sendiri `formatRupiah` | Pustaka format |
| Tanggal | `Intl.DateTimeFormat` bawaan | Pustaka tanggal |
| Grafik | Div dan lebar persen | Pustaka chart |
| Dialog | `<dialog>` bawaan | Pustaka modal |
| Toast | Komponen sendiri | Pustaka toast |
| Cetak | `@media print` dan `window.print()` | Pustaka PDF |
| Peta | Tautan `https://maps.google.com/?q=` | Pustaka peta |
| Bagikan | Tautan `https://wa.me/?text=` | Pustaka berbagi |
| State daftar | URL dan Server Component | Pustaka state global |
| Antrean luring | IndexedDB langsung | Pustaka queue |

---

## 9. Cara menjalankan

| Berkas | Isi |
|---|---|
| `.env` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |
| `.env.example` | Sama, tanpa nilai rahasia |

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi, wajib jalan sebelum kirim |
| `npm run db:push` | Dorong skema ke database |
| `npm run db:generate` | Buat berkas migrasi |
| `npm run lint` | Periksa tipe |

`BETTER_AUTH_SECRET` dibuat dengan `openssl rand -base64 32` atau nilai acak apa pun yang panjangnya cukup. Nilai itu tidak pernah ditulis di repo.

---

## 10. Definisi selesai

Satu langkah selesai kalau semua baris di bawah ini benar. Kalau ada satu yang tidak bisa dipastikan, langkah itu belum selesai.

### Semua langkah

- [x] `npm run build` jalan tanpa galat
- [x] Tidak ada em dash di teks yang tampil
- [x] Tidak ada tombol yang tidak melakukan apa-apa
- [x] Target sentuh minimal 44x44px
- [x] Halaman tidak geser horizontal di lebar 360px
- [x] Setiap tampilan data punya memuat, kosong, gagal, dan luring
- [x] Setiap kueri punya filter `planId`
- [x] Setiap tulis cek kepemilikan plan lebih dulu
- [x] Uang selalu integer rupiah, dan selalu ditulis penuh

### Khusus

- [x] Warna persis dari `DESIGN.md` bagian 3, maksimal satu marigold per layar
- [x] Radius `4px`, `8px`, `14px`. Tidak ada pill
- [x] Mode gelap diuji dengan mata, bukan hanya ada
- [x] Setiap keputusan baru ditulis alasannya di `CHANGELOG.md`

---

## 11. Yang sengaja belum dibangun

Ditulis di sini supaya tidak dikira terlupa.

| Belum dibangun | Alasan | Masuk mana |
|---|---|---|
| Pengingat lokal `reminderDays` | Butuh izin Notification, dan tidak berguna kalau belum ada pengguna nyata | Fase 3 |
| Unggah bukti transfer | Butuh object storage. Kolomnya sudah ada, unggahnya belum | Fase 3 |
| Peta meja visual | Fase 1 hanya nama meja sebagai teks, sesuai `03-Data-Model.md` | Fase 2 |
| Undangan digital | Di luar scope Fase 1, lihat `01-PRD.md` bagian 4 | Setelah Fase 1 |
| Pembayaran dan langganan | Fase 1 gratis | Setelah Fase 1 |
| Uji otomatis penuh | Vitest dan Playwright ditambahkan setelah alur utama stabil | Fase 3 |
| Google OAuth aktif | Tombol disembunyikan sampai kunci tersedia | Kapan pun kuncinya ada |

Kolom `proofImageKey` dan `reminderDays` tetap ada di data, tapi tidak dipakai di build ini. Kolom yang ada tapi tidak dipakai lebih baik daripada tabel yang diubah dua kali.
