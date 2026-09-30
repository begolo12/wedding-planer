# 03. Data Model

Skema untuk PostgreSQL, ditulis dengan sintaks Drizzle. Semua entity punya `userId` supaya scoping per pasangan tidak perlu logika tambahan.

---

## Konvensi yang berlaku untuk semua tabel

| Konvensi | Nilai | Alasan |
|---|---|---|
| Primary key | `uuid` | Dihasilkan di sisi aplikasi, tidak bergantung urutan database |
| Waktu | `timestamptz` | Semua tanggal di Asia/Jakarta, tapi penyimpanan selalu UTC |
| Uang | `integer` dalam rupiah penuh | Tidak ada pecahan sen dalam transaksi, dan `float` menghasilkan galat pembulatan yang sulit dilacak |
| Hapus lembut | `deletedAt`, nullable | Data plan tidak pernah dihapus permanen, karena kesalahan hapus tidak bisa dikembalikan |
| Timestamp dibuat | `createdAt` | Semua tabel punya, tanpa pengecualian |

Uang disimpan sebagai integer, bukan `decimal` atau `float`. Pecahan sen tidak ada dalam transaksi yang dicatat di aplikasi ini, dan `float` menghasilkan galat pembulatan yang sulit dilacak.

---

## 1. users

Dibuat oleh Better Auth, tidak ditulis manual.

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | |
| `email` | `text` | Unik |
| `emailVerified` | `boolean` | |
| `image` | `text`, nullable | |
| `createdAt` | `timestamptz` | |
| `updatedAt` | `timestamptz` | |

Tabel lain milik Better Auth (`session`, `account`, `verification`) dibuat oleh pustakanya, tidak ditulis di dokumen ini.

---

## 2. plans

Satu rencana. Satu pasangan bisa punya lebih dari satu, misalnya rencana terpisah untuk pernikahan anak.

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `userId` | `uuid` | FK ke `users`, cascade |
| `partnerName` | `text` | Nama pasangan, untuk judul di header |
| `weddingDate` | `date`, nullable | Diisi setelah tanggal penting pertama dibuat |
| `isDayOfDate` | `date`, nullable | Tanggal hari-H, terpisah supaya hitung mundur tidak perlu scan |
| `status` | `text` | Enum: `perencanaan`, `berlangsung`, `selesai` |
| `notes` | `text`, nullable | |
| `createdAt` | `timestamptz` | |
| `updatedAt` | `timestamptz` | |
| `deletedAt` | `timestamptz`, nullable | |

`weddingDate` di sini disimpan terpisah dari tabel tanggal penting supaya query hitung mundur di Beranda tidak perlu join.

---

## 3. milestones (tanggal penting)

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `title` | `text` | |
| `eventDate` | `date` | |
| `eventTime` | `time`, nullable | |
| `type` | `text` | Enum: `akad`, `resepsi`, `prewedding`, `adat`, `seragam`, `lainnya` |
| `isDayOf` | `boolean` | Default false |
| `notes` | `text`, nullable | |
| `sortOrder` | `integer` | Untuk urutan manual kalau jam sama |
| `createdAt` | `timestamptz` | |

Index: `(planId, eventDate)`.

---

## 4. tasks (daftar tugas)

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `title` | `text` | |
| `category` | `text` | Enum, daftar di `02a-Perencanaan.md` |
| `dueDate` | `date`, nullable | Null berarti tanpa tenggat |
| `status` | `text` | Enum: `belum`, `selesai` |
| `priority` | `text` | Enum: `rendah`, `sedang`, `tinggi` |
| `assignee` | `text`, nullable | Enum: `saya`, `pasangan`, `keluarga` |
| `notes` | `text`, nullable | |
| `sortOrder` | `integer` | Urutan dalam kategori |
| `completedAt` | `timestamptz`, nullable | |
| `createdAt` | `timestamptz` | |

Index: `(planId, status, dueDate)`. Ini yang dipakai query daftar tugas dan Beranda.

Tugas tanpa tenggat tidak diindeks bersama yang bertenggat, karena kondisi `dueDate IS NULL` tidak bisa dipakai indeks secara optimal. Query-nya dipisah di lapisan query.

---

## 5. budget_items (pos anggaran)

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `name` | `text` | |
| `category` | `text` | Enum: `venue`, `katering`, `dekorasi`, `busana`, `dokumentasi`, `adat`, `transport`, `lainnya` |
| `plannedAmount` | `integer` | Anggaran yang direncanakan |
| `notes` | `text`, nullable | |
| `sortOrder` | `integer` | |
| `createdAt` | `timestamptz` | |

**Tidak ada kolom `paid` atau `actual`.** Total terbayar dihitung dari `payments` yang sudah di-join dengan `vendors`. Kalau ada kolom `paid`, angka itu bisa menyimpang dari pembayaran yang tercatat.

**Alasannya** satu sumber kebenaran lebih penting daripada satu query sederhana.

---

## 6. vendors

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `name` | `text` | Nama vendor atau usaha |
| `category` | `text` | Enum sama dengan `budget_items` |
| `contactName` | `text`, nullable | |
| `phone` | `text`, nullable | Untuk WhatsApp |
| `address` | `text`, nullable | |
| `status` | `text` | Enum: `calon`, `dibook`, `selesai` |
| `notes` | `text`, nullable | Berisi hasil negosiasi dan termin |
| `createdAt` | `timestamptz` | |

Foreign key nullable ke `budget_items`, jadi kolomnya tidak ditulis di tabel di atas. Alasannya, pos anggaran sudah dibahas di bagian anggaran, dan tidak semua vendor punya pos anggaran. Vendor yang belum ada pos anggarannya tetap tercatat, supaya tidak hilang saat baru mencari.

---

## 7. payments

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `vendorId` | `uuid` | FK |
| `amount` | `integer` | |
| `paidAt` | `date` | |
| `method` | `text` | Enum: `transfer`, `tunai`, `kartu`, `ewallet` |
| `isFinal` | `boolean` | Tandai pelunasan |
| `proofImageKey` | `text`, nullable | Kunci file di object storage, bukan URL |
| `notes` | `text`, nullable | Nomor invoice, termin |
| `createdAt` | `timestamptz` | |

`planId` sengaja ikut disimpan di tabel ini, walaupun bisa diambil dari `vendors`. Alasannya, semua query anggaran dan pembayaran sudah ter-scope `planId`, jadi tidak perlu join ke `vendors` dulu hanya untuk tahu pemiliknya.

**Struktur ini hanya valid kalau `vendors.planId` dan `payments.planId` selalu sama.** Itu dijaga di lapisan aplikasi, bukan oleh database, karena butuh query tambahan.

---

## 8. guests

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `name` | `text` | |
| `phone` | `text`, nullable | |
| `category` | `text` | Enum: `keluargaPasangan`, `keluargaBesar`, `teman`, `kerja`, `anak`, `lainnya` |
| `side` | `text`, nullable | Enum: `pria`, `wanita` |
| `rsvpStatus` | `text` | Enum: `belum`, `hadir`, `tidak` |
| `guestCount` | `integer` | Default 1, bisa lebih dari 1 |
| `invitedAt` | `timestamptz`, nullable | Kapan undangan dikirim |
| `tableName` | `text`, nullable | Teks bebas, bukan relasi ke tabel meja |
| `notes` | `text`, nullable | Diet, akses, alasan tidak hadir |
| `createdAt` | `timestamptz` | |

Index: `(planId, rsvpStatus)`.

Tidak ada tabel `tables` terpisah. Peta meja di Fase 2 butuh visual, dan di Fase 1 nama meja sebagai teks sudah cukup. Kalau nanti butuh tabel terpisah, itu perubahan yang wajar.

---

## 9. rundown_items

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `title` | `text` | |
| `startTime` | `time` | |
| `durationMinutes` | `integer` | |
| `location` | `text`, nullable | Kalau berbeda dari venue utama |
| `picName` | `text`, nullable | Penanggung jawab |
| `notes` | `text`, nullable | |
| `sortOrder` | `integer` | Urutan tampil, biasanya sama dengan urutan waktu |
| `createdAt` | `timestamptz` | |

Index: `(planId, startTime)`.

---

## 10. announcements (info untuk keluarga)

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `title` | `text` | |
| `body` | `text` | |
| `audience` | `text` | Enum: `semua`, `keluarga`, `crew`, `tamu` |
| `shareToken` | `text` | Unik, untuk tautan baca-saja |
| `isPinned` | `boolean` | Default false |
| `publishedAt` | `timestamptz`, nullable | Null berarti draft |
| `createdAt` | `timestamptz` | |

Index: `(planId, isPinned, publishedAt)`.

`shareToken` di-generate dengan `crypto.randomUUID()`, di-index unik, dan tidak pernah ditampilkan penuh di halaman. Tautan yang dibagikan memuat token, bukan `planId`.

---

## 11. outfits (seragam)

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | `uuid` | PK |
| `planId` | `uuid` | FK |
| `itemName` | `text` | |
| `owner` | `text` | Enum: `pengantinPria`, `pengantinWanita`, `orangTua`, `keluarga`, `crew` |
| `status` | `text` | Enum: `belum`, `dicari`, `dijahit`, `siap` |
| `measureDate` | `date`, nullable | |
| `pickupDate` | `date`, nullable | |
| `notes` | `text`, nullable | Ukuran, warna, nama penjahit |
| `estimatedCost` | `integer`, nullable | Kalau ada, dipakai untuk membuat pos anggaran busana |
| `createdAt` | `timestamptz` | |

---

## Relasi

```
users
 â””â”€â”€ plans
      â”œâ”€â”€ milestones
      â”œâ”€â”€ tasks
      â”œâ”€â”€ budget_items
      â”œâ”€â”€ vendors
      â”‚    â””â”€â”€ payments
      â”œâ”€â”€ guests
      â”œâ”€â”€ rundown_items
      â”œâ”€â”€ announcements
      â””â”€â”€ outfits
```

Semua tabel anak cascade delete dari `plans`. Semua tabel anak cascade delete dari `users`.

Yang tidak punya relasi ke tabel lain: `vendors` ke `budget_items` (nullable, tidak ada di kode di atas karena ditulis di bagian anggaran). Kalau nanti ditambahkan, buat nullable.

---

## Aturan yang wajib dijaga

| Aturan | Kenapa |
|---|---|
| Setiap query wajib punya filter `planId` | Ini satu-satunya batas data antar pasangan |
| Setiap query wajib cek kepemilikan plan sebelum menulis | Mencegah pasangan mengedit plan orang lain |
| `userId` tidak pernah dikirim dari sisi klien | Client menentukan sendiri `userId` akan mengabaikan login |
| Tidak ada `ON DELETE CASCADE` ke `users` dari tabel yang bukan milik langsung | Sudah ada cascade dari `plans`, jangan dua kali |

