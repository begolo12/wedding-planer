# Rencana Perbaikan Hasil Audit

Dokumen ini daftar temuan audit yang sudah dibuktikan di kode dan di aplikasi yang benar-benar jalan, plus urutan perbaikannya. Setiap temuan punya bukti, supaya tidak ada perbaikan yang dikerjakan atas dasar tebakan.

Cara pakai: kerjakan satu nomor sampai selesai, jalankan pemeriksaan di bagian akhir nomor itu, lalu tulis entri di [`CHANGELOG.md`](../CHANGELOG.md).

Tanggal audit: 2026-10-05. Commit dasar: `5914f06` (v0.16.0).

Status mesin saat audit: `tsc --noEmit` bersih, `next build` sukses, `vitest` 137/137 hijau, em dash 0 di seluruh repo.

> Status terkini: 13 temuan sudah selesai dikerjakan dan diverifikasi. Perubahan tercatat di [`CHANGELOG.md`](../CHANGELOG.md).

---

## Ringkasan

| # | Temuan | Tingkat | Berkas utama |
|---|---|---|---|
| 1 | Tautan publik bocorkan laporan penuh, `target` diabaikan | Berat | `src/app/api/public/share/[token]/route.ts` |
| 2 | Plan terhapus lembut masih terbaca lewat tautan publik | Berat | sama |
| 3 | Draf pengumuman bisa dibuka publik, `shareToken` ikut terkirim | Sedang | sama |
| 4 | Batas uang Zod melebihi kapasitas kolom `integer`, hasilnya 500 bukan 422 | Sedang | `src/lib/skema.ts` |
| 5 | Antrean luring bisa dobel tulis, tidak ada idempotency | Sedang | `src/lib/luring.ts` |
| 6 | Item antrean bisa macet permanen, menghambat seluruh antrean | Sedang | `src/lib/luring.ts` |
| 7 | Endpoint `tasks/reorder` hidup tapi tidak dipakai UI mana pun | Ringan | `src/app/api/plans/[planId]/tasks/reorder/route.ts` |
| 8 | Rate limit hanya di 2 endpoint | Ringan | `src/app/api/**` |
| 9 | Kelas CSS `panel-daftar-isi` tidak pernah didefinisikan | Ringan | `src/app/(app)/anggaran/page.tsx` |
| 10 | 9 warna di bilah sebaran anggaran, melampaui batas aksen | Ringan | `src/app/(app)/anggaran/page.tsx` |
| 11 | Token `--color-tertiary-container` tak terdefinisi, fallback di luar palet | Ringan | `src/app/globals.css` |
| 12 | 7 layar daftar tidak memakai `.grid-daftar` + `.rel-samping` | Sedang | 7 berkas halaman |
| 13 | Dokumen tidak sinkron dengan kode | Sedang | `docs/**` |

Urutan kerja yang disarankan: 1, 2, 3, 4 dulu (kebocoran data dan jawaban salah, semuanya kecil). Lalu 5, 6 (kehilangan data). Lalu 12 (komposisi desktop). Lalu 7, 8, 9, 10, 11 (kebersihan). Lalu 13 (dokumen, dikerjakan terakhir supaya tidak menulis ulang dua kali).

---

## 1. Tautan publik bocorkan laporan penuh

**Bukti.** Uji langsung di aplikasi yang jalan. Tautan dengan `target: "keluarga"` dibuka tanpa sesi:

```
GET /api/public/share/aeVRSAZNKjZS5E-v10Zn-QWy   ->  200
payload: { tipe, label, target: "keluarga", report: { uang: { planned: 4500000, pos: [...] },
           tugas, tamu, rundown, vendor: { daftar: [...], totalTagihan } } }
```

`target` ada di payload tapi tidak pernah dipakai menyaring. Kontrak di [`04-API-Contract.md`](04-API-Contract.md) dan [`16-Laporan-dan-Bagikan.md`](16-Laporan-dan-Bagikan.md) bagian 4 bilang `target` yang menentukan isi tautan.

**Dampak.** Tautan yang dikirim ke keluarga membawa angka anggaran, daftar pos, dan daftar vendor. Data keuangan rencana orang bocor ke siapa pun yang memegang tautan.

**Perbaikan.**

1. Di `src/app/api/public/share/[token]/route.ts`, saring payload menurut `link.target` sebelum dikirim. `keluarga` hanya berisi jadwal, lokasi, dan kode busana. `laporan` berisi laporan penuh.
2. Hapus cabang yang mengirim laporan penuh untuk `keluarga`; jangan biarkan `target` tak dikenal jatuh ke laporan penuh.
3. Ikutkan `announcements` hanya untuk target yang memang memuat pengumuman.

**Pemeriksaan.** Buka tautan `keluarga` tanpa sesi, pastikan tidak ada kunci `uang` dan `vendor` di payload. Buka tautan `laporan`, pastikan laporan penuh masih ada.

---

## 2. Plan terhapus lembut masih terbaca lewat tautan publik

**Bukti.** `DELETE /api/plans/{id}` menjawab 204. Setelah itu tautan publiknya masih menjawab `200` dengan data lengkap (`judul.namaPasangan: "Dimas"`).

```sql
select id, deleted_at from plans;
-- 9a994ffe-... | 2026-10-04T17:48:52Z   (terisi)
-- tapi GET /api/public/share/{token} -> 200
```

Query di route publik (`share_links`, `announcements`, `plans`) tidak memakai `isNull(plans.deletedAt)`, sedangkan semua jalur terautentikasi memakainya (`src/lib/sesi.ts`, `src/lib/server-plan.ts`, `src/app/api/plans/route.ts`).

**Dampak.** Hapus rencana jadi tidak berarti untuk tautan yang sudah beredar. Data orang yang sudah menghapus rencananya tetap bisa dibaca.

**Perbaikan.** Tambahkan `isNull(plans.deletedAt)` pada setiap query `plans` di route publik, dan balas 404 bila plan terhapus. Sekaligus samakan bunyi galatnya supaya tidak membedakan "plan terhapus" dari "token tidak ada".

**Pemeriksaan.** Hapus plan, buka tautan publiknya, harus 404.

---

## 3. Draf pengumuman bisa dibuka publik

**Bukti.**

```
POST /api/plans/{id}/announcements { title: "Briefing crew rahasia", ... }  ->  201, publishedAt: null
GET  /api/public/share/O4BXcxCdT9WvOnRRjNxwCrnY                            ->  200
     { tipe: "pengumuman", judul: "Briefing crew rahasia", isi: "Kumpul jam 5 pagi...", publishedAt: null,
       bocorShareToken: true }
```

`shareToken` dibuat sejak pengumuman dibuat, bukan saat diterbitkan. UI menandainya "Draf", tapi tokennya sudah hidup.

**Dampak.** Briefing yang belum selesai ditulis bisa dibaca publik, termasuk briefing crew yang seharusnya tidak dilihat keluarga.

**Perbaikan.**

1. Balas 404 bila `publishedAt` null.
2. Kirim hanya kolom yang perlu (judul, isi, audience, publishedAt), bukan baris `announcements` utuh. `shareToken`, `planId`, dan `id` internal tidak perlu ikut.

**Pemeriksaan.** Buat draf, buka tokennya, harus 404. Terbitkan, buka lagi, harus 200 tanpa `shareToken` di payload.

---

## 4. Batas uang Zod melebihi kapasitas kolom `integer`

**Bukti.** Tiga permintaan berturut-turut ke `POST /api/plans/{id}/budget-items`:

```
plannedAmount 2147483647  ->  201
plannedAmount 2147483648  ->  500  {"error":{"code":"INTERNAL_ERROR", ...}}
plannedAmount 3000000000  ->  500
```

`src/lib/skema.ts` membatasi `uang` di `.max(100_000_000_000)`, sementara kolom `planned_amount`, `amount`, `estimated_cost` bertipe `int4` (batas 2.147.483.647). Nilai lolos Zod, Postgres melempar `integer out of range`, dan jawabannya 500 padahal kontraknya 422.

**Dampak.** Angka besar menghasilkan 500, bukan pesan validasi. Ini kelas bug yang sama yang sudah dicegah untuk tanggal dan jam.

**Perbaikan.** Turunkan `.max()` ke `2_147_483_647` supaya batas validasi sama dengan kapasitas kolom. Kalau memang perlu nilai lebih besar, itu keputusan terpisah yang mengubah kolom jadi `bigint` dan butuh migrasi.

**Pemeriksaan.** Kirim 2147483648, harus 422 dengan pesan validasi. Tambahkan uji unit di `tests/unit/skema.test.ts`.

---

## 5. Antrean luring bisa dobel tulis

**Bukti.** Dua POST identik (persis yang terjadi saat dua tab mengirim antrean yang sama):

```
POST /api/plans/{id}/tasks {"title":"Tugas replay", ...}  ->  201
POST /api/plans/{id}/tasks {"title":"Tugas replay", ...}  ->  201
GET  /api/plans/{id}/tasks  ->  jumlah baris "Tugas replay": 2
```

Tidak ada kunci idempotency di `src/lib/luring.ts`, tidak ada kunci antar tab (`navigator.locks` tidak dipakai), dan server tidak memeriksa pengiriman ulang. Dua tab sama-sama memasang `setInterval(periksa, 30_000)` tanpa koordinasi.

**Dampak.** Tugas, tamu, dan pos anggaran bisa dobel. Ini yang paling terasa di catatan pembayaran.

**Perbaikan.**

1. Beri setiap item antrean kunci idempotency (id item sudah ada, pakai itu) dan kirim sebagai header saat replay.
2. Server menyimpan kunci yang sudah diproses dan membalas hasil yang sama untuk kunci yang sama.
3. Bungkus pengiriman dengan `navigator.locks.request('haribesar-kirim', ...)` supaya hanya satu pengiriman jalan pada satu waktu.

**Pemeriksaan.** Kirim dua POST dengan kunci sama, harus ada satu baris. Tambahkan uji integrasi di `tests/integration/`.

---

## 6. Item antrean bisa macet permanen

**Bukti.** `src/lib/luring.ts` baris `if (item.attempts >= 5) { gagal += 1; ...; continue; }`. Item yang menembus 5 percobaan dilewati diam-diam setiap siklus, tidak pernah dibuang, dan `pesanGagal` tidak diisi. `break` pada kegagalan 5xx dan jaringan membuat satu item yang gagal menghentikan seluruh antrean di belakangnya.

**Dampak.** Antrean bisa tidak pernah kosong, dan orangnya tidak tahu kenapa. Item yang macet menghalangi perubahan lain selamanya.

**Perbaikan.**

1. Item yang menembus batas percobaan dipindahkan ke daftar "perlu perhatian" dan tidak lagi menghambat item di belakangnya.
2. Tampilkan jumlah dan alasannya di pita, plus aksi membuang item itu.
3. Kegagalan 5xx dan jaringan jangan `break` untuk item yang tidak bergantung urutan; pertahankan urutan hanya untuk operasi pada sumber daya yang sama.

**Pemeriksaan.** Buat item dengan isi yang selalu ditolak 422, kirim antrean, pastikan item lain tetap terkirim dan item gagal kelihatan di pita.

---

## 7. Endpoint `tasks/reorder` tidak dipakai

**Bukti.** `POST /api/plans/{id}/tasks/reorder` menjawab 204 dan bekerja. Grep pemanggil di `src/app`, `src/components`, dan `src/lib` tidak menemukan apa pun. Urutan tugas tidak bisa diubah pengguna.

**Dampak.** Endpoint mati, dan urutan tugas yang manual tidak bisa dipakai.

**Perbaikan.** Pilih satu: pakai di UI (drag atau tombol naik/turun di layar Rencana), atau hapus route beserta barisnya di `04-API-Contract.md`. Jangan biarkan menggantung.

**Pemeriksaan.** Kalau dipakai: ubah urutan di UI, muat ulang, urutan tetap. Kalau dihapus: pastikan tidak ada route tersisa.

---

## 8. Rate limit hanya di dua endpoint

**Status: sudah diperiksa, bukan cacat.**

`batasi()` memang hanya dipanggil di dua route pengguna:
`src/app/api/plans/route.ts` (POST, 30 per jam per pengguna) dan
`src/app/api/plans/[planId]/vendors/[vendorId]/payments/route.ts` (POST, 60 per
jam per pengguna). Dua endpoint sisanya di tabel docs/18 bagian 7 ada di Better
Auth: `/sign-up/email` 5 per jam per IP dan `/sign-in/email` 10 per 15 menit per
IP, diatur di `src/lib/auth.ts`.

Empat endpoint di dokumentasi sama persis dengan empat yang terpasang. Tidak ada
yang kurang, jadi tidak ada yang diperbaiki. Kalau daftarnya nanti ditambah,
yang perlu dijaga cuma satu: setiap penambahan harus menulis alasan angkanya di
docs/18, bukan menaruh angka di kode tanpa sumber.

---

## 9. Kelas CSS `panel-daftar-isi` tidak pernah didefinisikan

**Bukti.** `src/app/(app)/anggaran/page.tsx` memakai `className="panel-daftar-isi"`. Grep di `globals.css` hanya menemukan pemakaian, tidak ada aturannya.

**Dampak.** Pembungkus tanpa gaya. Di desktop isi panel tidak dijamin mengisi kolom, dan perilakunya berbeda dari layar lain yang memakai `.panel-daftar` langsung.

**Perbaikan.** Hapus divnya kalau tidak ada gunanya (`.panel-daftar` sudah flex kolom dengan gap), atau tambahkan aturannya kalau memang dibutuhkan.

**Pemeriksaan.** Buka layar Anggaran di lebar desktop, bandingkan dengan layar daftar lain.

---

## 10. Sembilan warna di bilah sebaran anggaran

**Bukti.** `WARNA_SEBARAN` di `src/app/(app)/anggaran/page.tsx` memuat marigold, terracotta, badge-latar, aksen-gelap, sage, line, kotak-abu, badge-teks, dan netral.

**Dampak.** Satu layar memakai sembilan keluarga warna. [`AGENTS.md`](../AGENTS.md) bagian 6 dan [`DESIGN.md`](../DESIGN.md) membatasi dua warna inti plus satu aksen. Aksesibilitas aman karena ada legenda, tapi anggaran warnanya dilanggar.

**Perbaikan.** Pakai paling banyak tiga token dan ulang secara siklik, atau satu token dengan beberapa tingkat alfa. Perbarui legenda kalau warnanya berkurang.

**Pemeriksaan.** Buka layar Anggaran, pastikan jumlah warna sebaran maksimal tiga.

---

## 11. Token `--color-tertiary-container` tidak terdefinisi

**Bukti.** `globals.css` memakai `background: var(--color-tertiary-container, #d5c5de)`. Token itu tidak ada di `@theme` maupun di blok mode gelap. Nilai jatuhnya `#d5c5de`, ungu yang tidak ada di palet [`DESIGN.md`](../DESIGN.md).

**Dampak.** Lencana di layar auth memakai warna di luar palet, dan tidak pernah ditimpa di mode gelap sehingga tetap ungu terang di latar gelap.

**Perbaikan.** Ganti ke token yang sudah punya pasangan terang dan gelap, misalnya `var(--color-netral)` atau token lencana yang sudah ada.

**Pemeriksaan.** Buka layar auth dalam mode gelap dan terang, pastikan lencananya ikut berubah.

---

## 12. Tujuh layar daftar tidak memakai `.grid-daftar` + `.rel-samping`

**Bukti.** Hanya `src/app/(app)/tamu/impor/page.tsx` yang memakainya. Yang belum:

- `src/app/(app)/rencana/page.tsx`
- `src/app/(app)/tamu/page.tsx`
- `src/app/(app)/anggaran/page.tsx`
- `src/app/(app)/rencana/vendor/page.tsx`
- `src/app/(app)/rencana/seragam/page.tsx`
- `src/app/(app)/rencana/tanggal/page.tsx`
- `src/app/(app)/rencana/info/page.tsx`

`DESIGN.md` bagian 5 poin 3 mewajibkan `.grid-daftar` (1,6fr : 1fr) mulai 1023px.

**Dampak.** Di desktop daftar melebar penuh sampai 1200px, dan rel ringkasan yang diwajibkan tidak ada.

**Perbaikan.** Bungkus `.panel-daftar` dalam `.grid-daftar`, pindahkan ringkasan (`.rekap`) ke `<aside className="rel-samping">`. Kerjakan satu layar per commit supaya mudah dibandingkan. Kalau ada layar yang sengaja menyimpang, tulis alasannya di `DESIGN.md` dan jangan diubah.

**Pemeriksaan.** Buka tiap layar di 1440px, pastikan daftar tidak melebar penuh dan rel kanan terisi.

---

## 13. Dokumen tidak sinkron dengan kode

**Bukti dan perbaikan, per berkas.**

| Berkas | Salah | Benar |
|---|---|---|
| `docs/04-API-Contract.md` | Tabel kode galat tanpa `LIMIT_REACHED` dan `LURING` | Tambahkan keduanya, sesuai `src/lib/galat.ts` |
| `docs/04-API-Contract.md` | Endpoint `ekspor`, `guests/undangan`, `kesehatan` tidak tercatat | Tambahkan |
| `docs/04-API-Contract.md` | `/api/auth/register\|login\|logout\|session` | Kode memakai catch-all Better Auth `/api/auth/[...all]` dengan `/sign-up/email`, `/sign-in/email` |
| `docs/07-PWA.md` | Batas antrean 200 item | Kode `BATAS_ANTREAN = 500` di `src/lib/luring.ts`, docs/18 juga 500 |
| `docs/07-PWA.md` | `/api/` ditangani service worker | SW tidak meng-cache `/api/`; antrean ada di `src/lib/api-client.ts` |
| `docs/07-PWA.md` | Jeda bertambah saat gagal | Kode tidak punya backoff, coba ulang tiap 30 detik |
| `docs/03-Data-Model.md` | Tanpa `invitation_url` di `milestones` | Ada di `src/db/schema.ts` dan migrasi 0001 |
| `docs/15-Glosarium.md` | Tabel `dates`, kolom `spentAmount` | Tabelnya `milestones`; `spentAmount` tidak ada, docs/03 eksplisit menolaknya |
| `docs/18` | Merujuk commit `fa9dfd1` | HEAD `5914f06` |
| `docs/18` | "137 test" dan "89 test hijau" di dua baris | Samakan dengan `vitest run` yang sebenarnya |
| `docs/18` | Nomor baris `konstanta.ts:169`, `luring-banner.tsx:80`, `luring.ts:134-137` | Nyatanya `:213`, `:97`, `:148-152` |
| `docs/14-Naskah-Teks.md` | "susunan acara" | "rundown". AGENTS.md memakai "susunan acara" sebagai contoh yang salah |
| `docs/01-PRD.md` | "link" | "tautan", sesuai glosarium bagian 7 |
| `docs/06-Stack-dan-Batas.md` | Tanpa `@neon/config` dan `@neon/env` | Keduanya ada di `package.json` |
| `docs/06-Stack-dan-Batas.md` | "REST dengan empat endpoint" | Ada tiga puluh lima route |
| `.env.example` | Hanya 4 variabel | Kode juga membaca `BETTER_AUTH_TRUSTED_ORIGINS`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

**Tambahan.** Repo belum punya git tag sama sekali. Buat tag `v0.16.0` pada `5914f06` supaya versi bisa diperiksa.

**Pemeriksaan.** Jalankan ulang sapuan: bandingkan daftar endpoint di docs/04 dengan keluaran `find src/app/api -name route.ts`, dan bandingkan tabel docs/03 dengan `src/db/schema.ts`. Hitung ulang jumlah tes dengan `npm test`.

---

## Yang sudah benar, jangan diubah

Bagian ini ditulis supaya tidak ada yang "memperbaiki" hal yang sudah betul.

- Filter `planId` dan cek kepemilikan konsisten di seluruh route ber-sesi. Tidak ada `PUT`.
- Bentuk galat seragam lewat `bungkus()` dan `balasGalat()`.
- Uang selalu integer, tidak ada float tersimpan.
- Response `/api/` tidak pernah masuk cache service worker.
- Navigasi network-first dengan batas 3 detik, bukan cache-first.
- Pita luring bekerja: saat perangkat luring pita `data-nada="luring"` muncul, tombol ubah disembunyikan, dan pita hilang lagi setelah pulih. Dibuktikan di build produksi.
- Rundown bisa dibuka tanpa sinyal setelah pernah dibuka sekali.
- Zona waktu WIB konsisten dan teruji.
- Cascade delete lengkap dan sesuai docs/03.
- Tidak ada tombol mati, tidak ada `rounded-full` di luar pill kontrol, kontras dan mode gelap lengkap, tidak ada geser horizontal.
- Tidak ada em dash di seluruh repo.
