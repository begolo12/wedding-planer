# 04. API Contract

Semua endpoint mengikuti aturan yang sama. Kalau ada endpoint yang melanggar salah satu aturan ini, itu bug, bukan pengecualian.

---

## Aturan umum

| Aturan | Kenapa |
|---|---|
| Semua endpoint butuh sesi login, kecuali yang ditandai | Data plan bersifat pribadi |
| Semua endpoint yang menyentuh data punya `planId` di path atau body | Batas data antar pasangan ditegakkan di sini |
| Body selalu JSON, kecuali upload | Konsistensi parsing |
| Tanggal format `YYYY-MM-DD`, waktu format `HH:MM` | Tidak ada ambigu soal zona waktu |
| Uang sebagai integer rupiah, bukan string | Tidak ada parsing yang bisa gagal |
| Error selalu bentuk yang sama | Client tidak perlu tebak bentuk error |

---

## Bentuk error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tanggal tidak valid.",
    "fields": {
      "weddingDate": "Tanggal harus di masa depan."
    }
  }
}
```

`code` adalah nilai tetap dari daftar di bawah, bukan pesan error yang berubah-ubah. `message` untuk manusia, `fields` hanya ada pada `VALIDATION_ERROR`.

| Code | HTTP | Kapan |
|---|---|---|
| `UNAUTHENTICATED` | 401 | Belum login atau sesi habis |
| `FORBIDDEN` | 403 | Plan milik orang lain |
| `NOT_FOUND` | 404 | Data tidak ada, atau sudah dihapus |
| `VALIDATION_ERROR` | 422 | Body tidak sesuai skema |
| `CONFLICT` | 409 | Perubahan bentrok, misalnya edit dari dua perangkat |
| `RATE_LIMITED` | 429 | Terlalu banyak permintaan |
| `INTERNAL_ERROR` | 500 | Bug |

**`FORBIDDEN` dan `NOT_FOUND` sengaja dipisah.** `NOT_FOUND` berarti data memang tidak ada. `FORBIDDEN` berarti ada tapi bukan milikmu. Menggabungkan keduanya jadi `404` lebih aman secara keamanan, tapi lebih sulit dipakai saat debugging.

**Alasannya** pasangan bukan attacker, dan OWNERSHIP yang jelas lebih berguna daripada penyamaran.

---

## Konvensi nama

| Verb | Cupo | Contoh |
|---|---|---|
| `GET` | Daftar dengan query parameter | `GET /api/plans/:planId/tasks` |
| `GET` dengan ID | Satu data | `GET /api/plans/:planId/tasks/:taskId` |
| `POST` | Buat | `POST /api/plans/:planId/tasks` |
| `PATCH` | Ubah sebagian | `PATCH /api/plans/:planId/tasks/:taskId` |
| `DELETE` | Hapus (soft delete) | `DELETE /api/plans/:planId/tasks/:taskId` |

`PUT` tidak dipakai. Semua update berupa partial update, jadi `PATCH` selalu benar. Kalau butuh replace penuh, itu tanda desain datanya belum matang.

---

## Auth

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/api/auth/register` | `POST` | `{ email, password, name }` | Sesi + user |
| `/api/auth/login` | `POST` | `{ email, password }` | Sesi + user |
| `/api/auth/logout` | `POST` | kosong | 204 |
| `/api/auth/session` | `GET` | - | User sekarang atau 401 |

Lima endpoint di atas ditangani Better Auth, ditulis ulang hanya kalau butuh bentuk khusus. Arahkan sisanya ke `auth.api` dan jangan membuat handler sendiri.

---

## Plans

| Endpoint | Method | Body / Query | Returns |
|---|---|---|---|
| `/api/plans` | `GET` | - | Daftar plan milik user |
| `/api/plans` | `POST` | `{ partnerName, weddingDate? }` | Plan baru |
| `/api/plans/:planId` | `GET` | - | Satu plan |
| `/api/plans/:planId` | `PATCH` | Field yang diubah | Plan terbaru |
| `/api/plans/:planId` | `DELETE` | - | 204 |
| `/api/plans/:planId/overview` | `GET` | - | Data untuk Beranda, sudah dihitung |

`/overview` mengembalikan satu objek berisi hitung mundur, lima tugas terdekat, total anggaran, total terbayar, dan tanggal berikutnya. Client tidak perlu lima request terpisah untuk Beranda.

**Alasannya** lima request untuk satu layar berarti lima kali loading state yang harus ditangani.

---

## Tasks

| Endpoint | Method | Body / Query | Returns |
|---|---|---|---|
| `/api/plans/:planId/tasks` | `GET` | `?status=&category=&assignee=` | Daftar tugas |
| `/api/plans/:planId/tasks` | `POST` | `{ title, category, dueDate?, priority?, assignee? }` | Tugas baru |
| `/api/plans/:planId/tasks/:taskId` | `PATCH` | Field yang diubah | Tugas terbaru |
| `/api/plans/:planId/tasks/:taskId` | `DELETE` | - | 204 |
| `/api/plans/:planId/tasks/:taskId/toggle` | `POST` | - | Tugas dengan status baru |
| `/api/plans/:planId/tasks/from-template` | `POST` | `{ category }` | Tugas yang dibuat |
| `/api/plans/:planId/tasks/reorder` | `POST` | `{ taskIds: [] }` | 204 |

`toggle` ada sebagai endpoint sendiri, bukan `PATCH` biasa, karena menandai selesai adalah aksi yang paling sering terjadi dan harus satu request kecil.

**Alasannya** `PATCH` dengan `{ status }` mengharuskan client tahu status sekarang, yang berarti satu request tambahan.

`reorder` menerima array `taskIds` lengkap, bukan diff. Alasannya, reorder berbasis diff lebih mudah menghasilkan state yang tidak konsisten kalau satu request gagal di tengah jalan.

---

## Budget dan vendor

| Endpoint | Method | Body / Query | Returns |
|---|---|---|---|
| `/api/plans/:planId/budget-items` | `GET` | - | Pos anggaran + total |
| `/api/plans/:planId/budget-items` | `POST` | `{ name, category, plannedAmount }` | Pos baru |
| `/api/plans/:planId/budget-items/:itemId` | `PATCH` | Field yang diubah | Pos terbaru |
| `/api/plans/:planId/budget-items/:itemId` | `DELETE` | - | 204 |
| `/api/plans/:planId/vendors` | `GET` | `?category=&status=` | Daftar vendor |
| `/api/plans/:planId/vendors` | `POST` | `{ name, category, contactName?, phone? }` | Vendor baru |
| `/api/plans/:planId/vendors/:vendorId` | `PATCH` | Field yang diubah | Vendor terbaru |
| `/api/plans/:planId/vendors/:vendorId` | `DELETE` | - | 204 |
| `/api/plans/:planId/vendors/:vendorId/payments` | `GET` | - | Riwayat pembayaran |
| `/api/plans/:planId/vendors/:vendorId/payments` | `POST` | `{ amount, paidAt, method, isFinal? }` | Pembayaran baru |
| `/api/plans/:planId/payments/:paymentId` | `DELETE` | - | 204 |

`GET /budget-items` mengembalikan pos anggaran sekaligus `totals` di objek yang sama: `planned`, `paid`, `remaining`. Total dihitung di server, bukan dijumlahkan di client, supaya angka yang sama muncul di semua tempat.

---

## Guests

| Endpoint | Method | Body / Query | Returns |
|---|---|---|---|
| `/api/plans/:planId/guests` | `GET` | `?category=&rsvpStatus=&search=` | Daftar tamu + rekap |
| `/api/plans/:planId/guests` | `POST` | `{ name, category, guestCount?, phone? }` | Tamu baru |
| `/api/plans/:planId/guests/import` | `POST` | `{ text, category }` | `{ preview, created }` |
| `/api/plans/:planId/guests/:guestId` | `PATCH` | Field yang diubah | Tamu terbaru |
| `/api/plans/:planId/guests/:guestId` | `DELETE` | - | 204 |

`import` mengembalikan `preview` sebelum `created`, jadi client bisa menampilkan hasil pratinjau dan meminta konfirmasi dulu. Endpoint ini tidak langsung menyimpan apa pun kalau body hanya berisi `previewOnly: true`.

---

## Milestones, rundown, outfits, announcements

| Endpoint | Method | Returns |
|---|---|---|
| `/api/plans/:planId/milestones` | `GET`, `POST` | Daftar atau milestone baru |
| `/api/plans/:planId/milestones/:id` | `PATCH`, `DELETE` | Milestone terbaru atau 204 |
| `/api/plans/:planId/rundown` | `GET`, `POST` | Daftar atau item baru |
| `/api/plans/:planId/rundown/:id` | `PATCH`, `DELETE` | Item terbaru atau 204 |
| `/api/plans/:planId/outfits` | `GET`, `POST` | Daftar atau item baru |
| `/api/plans/:planId/outfits/:id` | `PATCH`, `DELETE` | Item terbaru atau 204 |
| `/api/plans/:planId/announcements` | `GET`, `POST` | Daftar atau pengumuman baru |
| `/api/plans/:planId/announcements/:id` | `PATCH`, `DELETE` | Pengumuman terbaru atau 204 |
| `/api/plans/:planId/announcements/:id/share` | `POST` | `{ url }` |

`/share` mengembalikan tautan baca-saja. Endpoint ini butuh login karena membuat tautan mengubah data, tapi tautan yang dihasilkan tidak butuh login untuk dibuka.

Field `target` menentukan isi tautan. `keluarga` membuka Info untuk Keluarga, `laporan` membuka Laporan. Tanpa `target`, yang dibuka Info untuk Keluarga, sama seperti sebelumnya.

---

## Laporan dan bagikan

| Endpoint | Method | Returns |
|---|---|---|
| `/api/plans/:planId/report` | `GET` | Laporan keadaan, sudah dihitung semua |
| `/api/plans/:planId/report/share-text` | `POST` | `{ text, length }` |
| `/api/plans/:planId/report/links` | `GET`, `POST` | Daftar tautan, atau tautan baru |
| `/api/plans/:planId/report/links/:id` | `DELETE` | 204 |

`/report` mengembalikan satu objek berisi judul, hitung mundur, ringkasan uang, tugas, tamu, dan rundown hari ini. Tidak ada angka yang disimpan, semua dihitung ulang dari data. Query `/report` wajib punya filter `planId`.

`/report/share-text` menyusun teks WhatsApp di server. Body:

| Field | Wajib | Nilai |
|---|---|---|
| `variant` | ya | `ringkas`, `lengkap`, atau `tautan` |
| `message` | tidak | Kalimat tambahan, maksimal 400 karakter |
| `linkId` | tidak | Tautan yang ikut dikirim |

Angka, tanggal, dan tautan tidak bisa diubah oleh user. Yang boleh diubah cuma kalimat tambahan, dan itu karena teks ini dibaca orang tua tanpa penjelasan. Kalau angka bisa diedit, teks jadi tidak bisa dipercaya.

Panjang teks dibatasi 800 karakter. Request yang melebihi batas ditolak dengan `VALIDATION_ERROR`, bukan dipotong diam-diam.

`/report/links` mengembalikan tautan yang sudah dibuat beserta status aktifnya. Maksimal lima tautan per plan. Melewati batas mengembalikan `LIMIT_REACHED`.

`DELETE` pada satu tautan tidak mematikan tautan lain, karena tiap tautan punya kunci sendiri. Batas lima ada alasannya: cukup untuk keluarga besar, cukup untuk menahan tautan yang bocor.

---

## Offline dan sinkron

Tidak ada endpoint khusus sinkron. Semua perubahan dikirim seperti request biasa.

Kalau request gagal karena luring, client menyimpan antrean lokal dan mengirim ulang saat koneksi kembali. Aturan konflik:

| Situasi | Apa yang terjadi |
|---|---|
| Tidak ada konflik | Perubahan dikirim, server terima, client hapus dari antrean |
| `CONFLICT` | Client menampilkan pilihan: pakai versi server, atau pakai versi lokal |
| Data sudah dihapus | Client menampilkan "sudah dihapus di perangkat lain", dan menghapus dari antrean |

**`last-write-wins` tidak dipakai.** Alasannya, kalau pasangan dan istrinya edit tugas yang sama, losing dengan diam-diam berarti data pasangan hilang tanpa dia sadari. Lebih baik tampilkan konflik dan minta pilih.

---

## Batas dan pagination

| Endpoint | Batas |
|---|---|
| Daftar tugas, tamu, pembayaran | 50 per halaman, dengan cursor |
| Daftar plan, milestone, rundown, outfits, announcements | 100 per halaman, tanpa cursor |
| Body size maksimum | 1MB, kecuali upload bukti transfer 5MB |
| Upload bukti transfer | 5MB, hanya `image/jpeg` dan `image/png` |

Tamu bisa lebih dari lima ratus orang, jadi cursor wajib di sana. Rundown hari-H tidak akan lebih dari lima puluh item, jadi tidak perlu.

---

## Yang tidak ada di API

| Tidak ada | Alasan |
|---|---|
| Endpoint pencarian global | Tidak perlu di Fase 1, tiap daftar punya filter sendiri |
| Bulk update | Butuh endpoint khusus per entitas, dan tidak ada kasus yang cukup sering |
| WebSocket | Data plan tidak berubah dari luar, jadi polling sudah cukup |
| Endpoint publik tanpa token | Aside dari share link yang read-only || Endpoint PDF | PDF dibuat di client lewat dialog cetak, jadi tidak ada endpoint yang membangun file |
| Endpoint kirim WhatsApp | Aplikasi tidak mengirim pesan, WhatsApp yang mengirim. Yang dikirim ke server cuma teksnya |
