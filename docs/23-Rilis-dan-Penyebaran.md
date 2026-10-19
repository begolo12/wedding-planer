# 23. Rilis dan Penyebaran

Dokumen ini menjawab satu pertanyaan: bagaimana kode yang sudah lulus uji sampai ke alamat produksi, dan bagaimana mengembalikannya kalau salah.

Isinya keadaan yang terukur, prosedur rilis, prosedur rollback, dan daftar yang belum ada. Angka di sini dibaca dari aplikasi produksi dan dari Git, bukan dari perkiraan.

Aturan kerja tetap dari [`AGENTS.md`](../AGENTS.md). Rencana uji dan kriteria keluar ada di [`22-Rencana-Uji-dan-UAT.md`](22-Rencana-Uji-dan-UAT.md).

---

## 1. Keadaan sekarang

Diukur 2026-10-19.

| Hal | Keadaan | Bukti |
|---|---|---|
| Alamat produksi | `https://wedding-planer-self.vercel.app` | Menjawab 200 |
| Kesehatan proses | `{"ok":true}`. Endpoint ini tidak membaca database | `GET /api/kesehatan` |
| Kesehatan database | `GET /api/public/share/tokenpalsu` menjawab 404 dengan bentuk galat standar, artinya query ke `share_links` berjalan | Diukur setelah deploy |
| Header keamanan | 5 dari 5 terkirim, tanpa CSP | `HEAD /masuk` |
| Region | `sin1` | `vercel.json`, `X-Vercel-Id: sin1::...` |
| Rute publik | `/masuk` 200, `/luring` 200, `/` 307 ke masuk | Diukur langsung |
| Isi manifest produksi | `background_color` dan `theme_color` `#f4f2ea` | `GET /manifest.webmanifest` |
| Cabang produksi | `main` di `79b6e53`, 19 Oktober 2026 | `git log origin/main` |
| Versi di `main` | `0.18.0` | `package.json` |
| Tag terakhir | `v0.18.0` di `ac3e4af`, `package.json` di commit itu `0.18.0` | `git show v0.18.0:package.json` |
| Tag di remote | `v0.18.0` | `git ls-remote --tags` |
| CI | Dua job hijau: kualitas dan ujung ke ujung | `gh run view 39180299839` |
| Cabang kerja | `main`, bersih | `git status --porcelain` |

**Kesimpulan.** Produksi menjalankan rilis 0.18.0. Bukti paling kuat: nama berkas chunk yang dilayani produksi (`1255-dc3ddf72a1dc71a7.js`) sama persis dengan hasil `npm run build` di commit ini, dan manifest produksi sudah memakai palet baru `#f4f2ea`.

---

## 2. Pelaksana dan keluaran

| Peran | Tanggung jawab |
|---|---|
| Developer | Menjalankan gerbang pra-rilis, menyiapkan commit dan tag |
| Pemilik produk | Menyetujui rilis, menandatangani catatan rilis |
| Pemegang akses Vercel | Menekan deploy atau mengembalikan deployment sebelumnya |

| Keluaran | Tempat |
|---|---|
| Build yang lulus | `npm run build` |
| Catatan rilis | `CHANGELOG.md` bagian versi |
| Tag | `v<versi>` di commit yang sama dengan `package.json` |
| Bukti asap | Keluaran `GET /api/kesehatan`, `HEAD /masuk`, `GET /manifest.webmanifest` |
| Catatan rollback | Bagian 4 dokumen ini |

---

## 3. Prosedur rilis

### 3.1 Gerbang pra-rilis

Semua perintah dijalankan dari akar repo, berurutan. Kalau satu gagal, rilis berhenti.

| Urutan | Perintah | Yang dibuktikan |
|---|---|---|
| 1 | `npm run lint` | Tipe bersih |
| 2 | `npm test` | 149 unit dan 13 integrasi hijau |
| 3 | `npm run test:e2e` | 17 kasus ujung ke ujung hijau |
| 4 | `npm run build` | Build produksi sukses |
| 5 | `npm run db:check` | Migrasi dan skema tidak berselisih |
| 6 | `npm audit --audit-level=high` | Tidak ada kerentanan tinggi |

Peringatan yang harus dipegang:

- Jangan menjalankan `npm run test:e2e` bersamaan dengan `next start`. Keduanya menulis `.next`, dan server produksi akan membalas 500 `ENOENT required-server-files.json`. Ini sudah terjadi dan bukan bug produk.
- `npm run test:e2e` membuat akun sungguhan. Tanpa `TEST_DATABASE_URL`, akun itu masuk ke database pengembangan.

Satu peringatan tambahan, terukur 19 Oktober 2026: `npm run build` yang dijalankan tepat setelah dev server uji menulis `.next` gagal dengan `uncaughtException [TypeError: Cannot read properties of undefined (reading 'length')]`. Menghapus `.next` lalu membangun ulang berhasil. Jadi urutannya: jalankan e2e, hapus `.next`, baru build.

Suite e2e memakai heap 2 GB lewat `BATCH_DEV_MB` di `playwright.config.ts`. Heap bawaan 1 GB habis di tengah suite, server uji mati dengan `Ineffective mark-compacts near heap limit`, dan dua spec terakhir gagal dengan `ECONNRESET`.

### 3.2 Migrasi database

Aturan: migrasi dijalankan sebelum kode baru menerima lalu lintas, dan hanya lewat `DATABASE_URL_UNPOOLED`.

| Langkah | Perintah | Alasan |
|---|---|---|
| 1 | `npm run db:generate` | Menulis berkas migrasi kalau skema berubah |
| 2 | `npm run db:check` | Memastikan berkas migrasi cocok dengan skema |
| 3 | `npm run db:migrate` dengan `DATABASE_URL_UNPOOLED` produksi | Migrasi butuh koneksi langsung, bukan pooler mode transaction |

Bentuk perubahan yang diizinkan mengikuti pola expand dan contract:

| Tahap | Isi | Aman di-rollback? |
|---|---|---|
| Expand | Tambah kolom nullable atau tabel baru | Ya, kode lama mengabaikannya |
| Migrasi data | Isi kolom baru dari kolom lama | Ya |
| Contract | Hapus kolom lama setelah kode baru stabil | Tidak, jadi dilakukan rilis berikutnya |

Menghapus atau mengganti nama kolom di rilis yang sama dengan kode yang memakainya membuat rollback tidak mungkin. Karena itu langkah itu selalu dipisah.

Rilis ini tidak menambah migrasi. `src/db/schema.ts` tidak berubah, dan `npm run db:check` menjawab "Everything's fine".

### 3.3 Commit dan tag

| Langkah | Perintah | Catatan |
|---|---|---|
| 1 | `git add` berkas yang memang bagian rilis | Yang belum dilacak dan wajib ikut: `src/lib/agregat-uang.ts`, `tests/integration/agregat-uang.test.ts`, `docs/20`, `docs/21`, `docs/22`, `docs/23`. Tanpa `agregat-uang.ts`, clone bersih tidak bisa build |
| 2 | Ubah `package.json` ke versi rilis | Satu sumber versi, dibaca `next.config.mjs` |
| 3 | Pindahkan isi `CHANGELOG.md` bagian `[Belum dirilis]` ke `## [versi] - YYYY-MM-DD` | Empat bagian `[Belum dirilis]` sekarang menumpuk |
| 4 | `git commit` | Satu commit rilis, bukan campuran redesign dan rilis |
| 5 | `git tag -a v<versi> -m "<ringkas>"` | Tag harus menunjuk commit yang `package.json`-nya sudah versi itu |
| 6 | `git push origin main --follow-tags` | Deploy terpicu dari push ke `main` |

Tag `v0.17.0` yang ada sekarang menunjuk commit yang `package.json`-nya masih `0.16.0`. Itu tidak boleh diulang. Aturannya: tag dan versi di berkas harus sama, dan keduanya diperiksa sebelum push.

### 3.4 Pasca-deploy

Dijalankan dalam lima menit setelah deploy selesai.

| Pemeriksaan | Perintah | Hasil yang diterima |
|---|---|---|
| Skema produksi | `GET /api/plans/{id}/milestones` dengan sesi | 200. Kalau 500, artinya database produksi tertinggal dari kode, dan itu pernah terjadi pada 19 Oktober 2026. Lihat `docs/18` bagian 5.1 |
| Kesehatan proses | `curl -s https://wedding-planer-self.vercel.app/api/kesehatan` | `{"ok":true}`. Ini hanya membuktikan proses hidup, bukan database |
| Kesehatan database | Masuk, lalu `GET /api/plans` | 200 dengan `{"plans":[...]}`. Ini satu-satunya bukti database terbaca |
| Header | `curl -sI .../masuk` | 5 header keamanan ada |
| Manifest | `curl -s .../manifest.webmanifest` | Warna sesuai `docs/21` |
| Masuk | Buka `/masuk` di browser | Form tampil, tidak ada galat konsol |
| Luring | Buka `/luring` | Halaman tampil |
| Versi | Layar Akun | Sama dengan `package.json` |

Kalau salah satu gagal, jalankan bagian 4.

---

## 4. Rollback

### 4.1 Kode

Vercel menyimpan deployment sebelumnya dan bisa dipromosikan kembali. Ini jalan tercepat dan tidak menyentuh database.

| Langkah | Yang dilakukan |
|---|---|
| 1 | Buka dashboard Vercel, tab Deployments |
| 2 | Pilih deployment terakhir yang sehat |
| 3 | Promote to Production |
| 4 | Jalankan pemeriksaan bagian 3.4 lagi |

### 4.2 Database

Migrasi tidak punya langkah mundur. Yang membuat rollback aman adalah pola expand dan contract di bagian 3.2, bukan perintah `down`.

| Keadaan | Yang boleh dilakukan |
|---|---|
| Rilis hanya menambah kolom nullable | Rollback kode, kolom dibiarkan |
| Rilis mengisi data baru | Rollback kode, data baru dibiarkan |
| Rilis menghapus kolom | Tidak ada rollback. Pemulihan hanya dari backup |

Karena itu penghapusan kolom selalu masuk rilis terpisah, setelah kode lama tidak dipakai lagi.

### 4.3 Data

Rollback kode tidak mengembalikan data yang sudah ditulis. Satu-satunya jalan adalah backup, dan backup harian belum ada. Ini celah terbesar di fase ini, bukan di kode.

---

## 5. Catatan rilis

Setiap entri rilis di `CHANGELOG.md` punya dua bagian, dengan urutan ini:

| Bagian | Pembaca | Isi |
|---|---|---|
| `Yang berubah untuk kamu` | Pengguna | Perubahan yang terasa di layar, tanpa nama berkas, tanpa istilah teknis |
| `Catatan untuk pengembang` | Tim | Keputusan, alasan, berkas, dan hal yang sengaja tidak dikerjakan |

Alasannya: `CHANGELOG.md` sebelumnya hanya bisa dibaca orang yang menulis kodenya. Pengguna yang bertanya "apa yang berubah" tidak menemukan jawaban di sana, padahal itu satu-satunya catatan rilis yang dimiliki proyek ini.

Aturan penulisan bagian pengguna:

| Aturan | Contoh benar | Contoh salah |
|---|---|---|
| Sebut yang terlihat di layar | "Tab aktif ditandai bilah tipis" | "`.nav-item` memakai `border-bottom`" |
| Tanpa nama berkas | "Pesan galat menyebut kode pendek" | "`balasGalat` menambahkan `X-Galat-Ref`" |
| Kalimat kedua menyebut akibatnya | "supaya angka penting langsung terlihat" | tanpa akibat |
| Tidak menjanjikan yang belum ada | "Tombol lapor masalah" hanya ditulis kalau tombolnya ada | menulis rencana sebagai kenyataan |

Kalau satu rilis tidak punya perubahan yang terasa oleh pengguna, bagian itu ditulis "Tidak ada perubahan yang terasa di layar." Kalimat itu lebih jujur daripada menghapus bagiannya, karena pembaca jadi tahu bahwa memang tidak ada, bukan lupa ditulis.

## 6. Versi

| Aturan | Alasan |
|---|---|
| Satu sumber: `package.json` | `next.config.mjs` membacanya dan menyalinnya ke `NEXT_PUBLIC_APP_VERSION`, jadi layar Akun tidak punya angka kedua |
| Tag harus sama dengan versi di berkas | Tag yang melenceng membuat "apa yang tayang" tidak bisa dijawab dari Git |
| Satu bagian `[Belum dirilis]`, bukan empat | Empat bagian berarti tidak ada yang tahu apa isi rilis berikutnya |
| Naik versi sebelum tag, bukan sesudah | Kalau sesudah, commit yang di-tag masih memuat versi lama |

---

## 7. Yang belum ada

| Belum | Akibat | Yang dibutuhkan |
|---|---|---|
| CI | Workflow ada di `.github/workflows/ci.yml`, tapi belum pernah berjalan di GitHub | Push pertama, lalu pastikan dua job hijau |
| Lingkungan staging | Setiap rilis diuji di produksi atau tidak diuji sama sekali | Satu deployment preview dengan database terpisah |
| Backup harian dan restore teruji | Kerusakan data tidak bisa dipulihkan | Jadwal dump dan satu uji restore |
| Pemantauan dan pemberitahuan | Kegagalan produksi hanya ketahuan kalau ada yang membuka aplikasi | Pemberitahuan dari platform saat health check gagal |
| Pemeriksaan asap otomatis | Bagian 3.4 dijalankan dengan tangan | Skrip yang memeriksa enam hal di tabel itu |
| Konfirmasi database produksi terpisah | Belum dipastikan host produksi berbeda dari pengembangan | Perbandingan nama dan host |
| Tag di remote | Riwayat rilis tidak bisa dibaca dari clone baru | `git push --follow-tags` |

---

## 8. Risiko khusus rilis berikutnya

| Risiko | Bukti | Pengurangan |
|---|---|---|
| Rilis berikutnya gagal build di clone bersih | `src/lib/agregat-uang.ts` belum dilacak, diimpor 6 berkas di pohon kerja | `git add` sebelum rilis, lalu build dari clone bersih |
| Dokumen rujukan hilang di clone baru | `docs/21-Arah-Tampilan.md` dan `docs/20` belum dilacak, padahal ditautkan `README.md` dan `AGENTS.md` | Ikutkan di commit rilis |
| Ikon lama bertahan di perangkat | `/ikon/` di-cache lebih dulu tanpa nama ber-hash, dan `VERSI` di `public/sw.js` masih `v2` | Naikkan `VERSI` kalau ikon berubah |
| Halaman luring lama bertahan | `CACHE_HALAMAN` menyimpan `/luring` dan `/aplikasi` | Naikkan `VERSI` di rilis yang mengubah dua halaman itu |
| PWA terpasang menampilkan palet lama | Manifest produksi `#fcf9f5`, kode `#f4f2ea` | Rilis ini sekaligus mengubah manifest; pengguna perlu memasang ulang untuk melihat warna baru |
| Aset statis tidak perlu diurus | `/_next/static/` memakai nama ber-hash | Tidak ada tindakan |

---

## 9. Ringkas satu halaman

```text
1. npm run lint && npm test && npm run test:e2e && npm run build
2. npm run db:check
3. npm audit --audit-level=high
4. npm run db:migrate   (DATABASE_URL_UNPOOLED produksi, kalau ada migrasi)
5. git add -A, naikkan versi, pindahkan CHANGELOG, commit
6. git tag -a v<versi>, git push origin main --follow-tags
7. curl /api/kesehatan, HEAD /masuk, GET /manifest.webmanifest
8. Buka /masuk dan /luring di browser
```

Kalau langkah 7 atau 8 gagal: promote deployment sebelumnya di Vercel, lalu jalankan langkah 7 lagi.
