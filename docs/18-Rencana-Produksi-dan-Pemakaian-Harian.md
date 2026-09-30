# 18. Rencana Produksi dan Pemakaian Harian

Dokumen ini menjawab satu pertanyaan: apa yang masih kurang supaya aplikasi ini bisa dipakai pasangan setiap hari, dan belum bisa diserahkan ke orang lain.

Isinya bukan alasan baru. Setiap keputusan sudah punya alasannya di dokumen yang lebih lama, dan di sini hanya diurutkan, diberi prioritas, dan diberi syarat selesai.

Kalau dokumen ini bertentangan dengan [`01-PRD.md`](01-PRD.md), [`03-Data-Model.md`](03-Data-Model.md), [`04-API-Contract.md`](04-API-Contract.md), atau [`05-IA-dan-Layar.md`](05-IA-dan-Layar.md), dokumen itu yang menang, dan dokumen ini yang diperbaiki.

Aturan kerja tetap dari [`AGENTS.md`](../AGENTS.md). Warna dan bentuk dari [`DESIGN.md`](../DESIGN.md).

---

## 1. Cacat yang menutup seluruh aplikasi

Audit produksi menemukan satu cacat yang membuat aplikasi tidak bisa dipakai siapa pun. Itu diperbaiki lebih dulu, karena selama cacat itu ada, semua rencana lain tidak ada artinya.

| Cacat | Akibat nyata |
|---|---|
| Better Auth membuat id berbentuk 32 huruf, sedangkan kolom `users.id` bertipe `uuid` | `POST /api/auth/sign-up/email` selalu menjawab 422. Tidak ada yang bisa mendaftar, jadi tidak ada plan, jadi tidak ada yang bisa dicatat |

Bukti sebelum dan sesudah:

| Waktu | Panggilan | Jawaban |
|---|---|---|
| Sebelum | `POST /api/auth/sign-up/email` | 422 `{"message":"Failed to create user","code":"FAILED_TO_CREATE_USER"}` |
| Sesudah | `POST /api/auth/sign-up/email` | 200 dengan `id` berbentuk uuid |
| Sesudah | `POST /api/plans` | 201 |
| Sesudah | `POST /api/plans/{id}/vendors` | 201 |
| Sesudah | `POST /api/plans/{id}/vendors/{id}/payments` | 201 |
| Sesudah | `GET /api/plans/{id}/overview` | 200 dengan `uang.paid` 4.500.000 |

Dua pilihan untuk memperbaikinya:

| Pilihan | Alasan |
|---|---|
| Paksa pustaka memakai uuid lewat `advanced.database.generateId: "uuid"` | Satu baris konfigurasi. Semua tabel sudah bertipe uuid dan punya 15 relasi. Mengubah 15 kolom jadi `text` menyentuh semua query, semua index, dan setiap tempat yang memparsing id sebagai uuid |
| Ubah kolom `id` jadi `text` | Lebih dekat ke bawaan pustaka, tapi biaya jauh lebih besar dan tidak memberi nilai apa pun ke pengguna |

Kalau Better Auth nanti mengubah bawaannya, keputusan ini ditinjau ulang dan alasannya ditulis ulang di sini.

---

## 2. Urutan berdasarkan prioritas

Tiap kelompok punya syarat selesai sendiri. Kelompok yang lebih tinggi selesai lebih dulu, karena yang di bawahnya tidak bisa diverifikasi tanpa yang atas.

| Prioritas | Kelompok | Kenapa di urutan ini |
|---|---|---|
| P0 | Batas halaman | `/hari-h` dibuka di lokasi saat sinyal buruk. Kalau gagal, orang kehilangan rundown-nya di saat paling butuh. Ini layar yang paling sering dibuka dalam kondisi terburuk |
| P0 | Antrean luring | Antrean melaporkan item yang gagal terkirim sebagai terkirim. Itu kehilangan data yang dilaporkan sebagai berhasil, dan aturan "catatan pembayaran tidak boleh tercecer" dilanggar |
| P0 | Migrasi database | Skema dibuat dengan `db:push` yang tidak menyimpan riwayat. Bentuk tabel di produksi tidak diketahui dan tidak bisa dikembalikan kalau ada kesalahan |
| P0 | Koneksi database | `prepare: false` belum ada. Prepared statement tidak boleh dipakai kalau database nanti di belakang PgBouncer mode transaction, dan susahnya baru ketahuan setelah terlanjur ada data |
| P0 | Rate limit | Tanpa batas, satu orang bisa membuat ribuan akun. Kode `RATE_LIMITED` sudah ada di `src/lib/galat.ts` tapi belum ada yang memakainya |
| P1 | Security headers | Tanpa ini, aplikasi tidak bisa dianggap aman untuk dipakai di internet terbuka |
| P1 | Test otomatis | Tidak ada satu pun test. Semua yang dianggap "sudah jalan" hanya terbukti karena diklik manual satu kali |
| P1 | Perbaikan kontrak | Dua endpoint menjawab dengan bentuk berbeda dari `04-API-Contract.md` |
| P2 | Verifikasi surel dan lupa kata sandi | Butuh penyedia surel. Itu keputusan lima pertanyaan dari `06-Stack-dan-Batas.md`, masuk P2 karena belum ada masalah nyata yang menyalakannya |
| P2 | Jalur deploy dan backup | Satu container, satu pipeline. Belum ada target deploy yang dipilih |
| P2 | Uji aksesibilitas | Warna sudah berpasangan, tetapi belum diukur. Target sentuh 44px sudah ada di CSS, tetapi belum diuji dengan keyboard |
| P3 | Keselarasan dokumen | Beberapa dokumen berbeda isi dengan kode. Tidak memblokir pengguna, tidak memblokir produksi |

---

## 3. P0 Batas halaman

Yang sudah ada: `src/components/states.tsx` sudah menyediakan `Kerangka`, `Kosong`, `Gagal`, dan `PesanGalat`. Yang belum ada adalah batas error yang Next.js dipakai saat render gagal.

| Berkas | Isi | Kenapa ada |
|---|---|---|
| `src/app/error.tsx` | `Gagal` dengan tombol "Coba lagi" | Menangkap error render di semua halaman di bawah `src/app`. Ini yang dipakai `/hari-h` |
| `src/app/global-error.tsx` | `Gagal` dengan tombol muat ulang penuh | Menangkap error di layout root. Harus merender `<html>` dan `<body>` sendiri karena layout root sudah gagal |
| `src/app/not-found.tsx` | `Kosong` dengan penjelasan dan tombol ke Beranda | `404` sekarang menampilkan halaman bawaan Next.js, bukan milik aplikasi |
| `src/app/(app)/loading.tsx` | `Kerangka` | Transisi antar halaman di dalam `(app)` sekarang tanpa tanda sama sekali |
| `src/app/(app)/error.tsx` | `Gagal` dengan tombol "Coba lagi" | Batas yang lebih dekat ke navigasi, jadi tidak perlu menggambar ulang seluruh halaman |

Keputusan yang diambil:

| Keputusan | Alasan |
|---|---|
| Batas error memakai komponen yang sudah ada, bukan komponen baru | `Gagal` sudah benar bentuk dan warnanya. Komponen baru berarti warna kedua untuk hal yang sama |
| `global-error.tsx` merender `<html>` sendiri | Persyaratan Next.js, bukan pilihan. Tanpa itu, halamannya kosong putih |
| Tidak ada `template.tsx` | `template.tsx` membuat ulang subtree setiap navigasi, dan itu membuang state form. Form yang sedang diisi hilang saat pindah tab |
| `not-found.tsx` di root, bukan di dalam `(app)` | Halaman `404` juga muncul untuk halaman publik seperti `/bagikan/{token}` |
| `not-found.tsx` memakai `Kosong` | Bentuknya sama dengan layar "belum ada data", dan `Kosong` sudah punya `aksi` |

Syarat selesai: `npm run build` hijau, dan `/hari-h` yang dipaksa gagal menampilkan `Gagal` dengan tombol yang benar-benar bekerja.

---

## 4. P0 Antrean luring

Yang sudah ada: `src/lib/luring.ts` sudah menyimpan ke IndexedDB, mengirim dari yang tertua, dan berhenti di kegagalan pertama. Yang salah:

| Cacat | Akibat nyata | Perbaikan |
|---|---|---|
| Item dengan jawaban 4xx dihitung `terkirim` (`src/lib/luring.ts:134-137`) | Sesi sudah habis atau data tidak valid, jadi tulisannya hilang. Layar menunjukkan "terkirim" padahal tidak ada di server | 4xx dihitung gagal, bukan terkirim, dan alasannya ditunjukkan ke pengguna |
| Batas 200 item membuang yang tertua diam-diam | Kalau luring beberapa hari, catatan pembayaran hilang tanpa ada yang memberitahu | Batas dinaikkan ke 500, dan saat penuh muncul pita "antrean penuh" yang menyebut jumlah yang dibuang |
| `cekKoneksi()` menerima 401 sebagai "ada jaringan" | Ini benar dan tidak diubah. 401 memang berarti ada jaringan, hanya saja sesi habis. Yang perlu ditambah ada di `kirimAntrean()`: kalau melihat 401, hentikan pengiriman dan beri tahu orangnya untuk masuk lagi |

Keputusan yang diambil:

| Keputusan | Alasan |
|---|---|
| 401 menghentikan antrean, bukan membuang item | Sesi habis adalah masalah yang bisa diperbaiki orangnya sendiri. Membuang catatan pembayaran tanpa jejak tidak bisa |
| Batas dinaikkan, bukan dihapus | Antrean yang membengkak memperlambat setiap pengiriman. Menaikkan batas hanya menunda masalah, jadi batas tetap ada, tapi pembuangan sekarang kelihatan |
| Pita luring tidak hilang saat antrean kosong | `docs/05-IA-dan-Layar.md` bagian 4 menulis pita tipis di atas yang berbunyi "Menampilkan data dari perangkat". `src/components/luring-banner.tsx:80` masih mengembalikan `null` kalau luring false dan antrean kosong, jadi kalimat itu belum pernah muncul |

Syarat selesai: matikan jaringan, buat tiga perubahan, hidupkan jaringan, dan pastikan ketiganya sampai ke server dengan urutan benar dan jumlah yang sama.

---

## 5. P0 Migrasi database

Yang sudah ada: 15 tabel sudah ada di database lokal, tapi dibuat dengan `npm run db:push`, yang tidak menulis berkas apa pun. `drizzle.config.ts` menulis ke `src/db/migrations`, dan folder itu tidak ada.

| Yang dikerjakan | Alasan |
|---|---|
| `npm run db:generate` sekali, lalu commit hasilnya | Bentuk tabel jadi bisa dibaca dan ditinjau lewat diff, bukan tersembunyi di dalam database |
| Tambah `db:migrate` di `package.json` | Deploy nanti memakai `db:migrate`, bukan `db:push`. `db:push` bisa menghapus kolom yang masih dipakai data lama |
| `db:push` tetap ada untuk development | Dipakai saat bereksperimen dengan bentuk tabel, dan tidak dipakai di produksi |
| Tambah `db:check` yang menjalankan `drizzle-kit check` | Menangkap migrasi yang tidak konsisten sebelum dipakai di produksi |
| Tulis bentuk tabel sekarang ke `docs/03-Data-Model.md` sebagai "bentuk sekarang" | Supaya ada dokumen yang bisa dibandingkan |

Keputusan yang diambil:

| Keputusan | Alasan |
|---|---|
| Migrasi di-commit, bukan hanya ada di database | Database produksi bisa hilang atau di-restore, dan bentuk tabel hanya diketahui dari isi database. Bentuk tabel harus bisa dibaca dari repo |
| Deploy memakai `db:migrate`, bukan `db:push` | `db:push` menyesuaikan bentuk saat ini ke bentuk yang diminta, tanpa memberi langkah yang bisa diulang. Kalau gagal di tengah, bentuk setengah jadi tidak ada di mana pun |
| `drizzle-kit check` masuk CI | Migrasi yang foldernya tidak konsisten baru ketahuan saat deploy. Lebih baik ketahuan saat build |

---

## 6. P0 Koneksi database

`src/db/index.ts:19-22` sekarang hanya mengeset `max` dan `idle_timeout`. Yang kurang:

| Yang ditambahkan | Alasan |
|---|---|
| `prepare: false` | Driver `postgres` mengirim prepared statement secara bawaan. Kalau database-nya di belakang PgBouncer mode transaction, prepared statement tidak boleh dipakai. Menonaktifkannya dari sekarang mencegah error yang sulit ditelusuri nanti. Biayanya satu round trip tambahan per query, dan untuk lima koneksi ke satu database lokal ini tidak terasa |
| `ssl` diberi `"require"` kalau `DATABASE_URL` berisi host bukan `localhost` | Database produksi hampir tidak mungkin ada di `localhost`. Menulisnya eksplisit supaya terlihat di diff dan tidak ikut berubah bila bawaan driver berubah |

---

## 7. P0 Rate limit

Kode `RATE_LIMITED` sudah ada di `src/lib/galat.ts`, tapi tidak ada route yang memakainya. Yang paling penting bukan daftar plan, bukan vendor, bukan pembayaran, adalah daftar akun dan masuk.

| Endpoint | Batas | Alasan |
|---|---|---|
| `POST /api/auth/sign-up/email` | 5 permintaan per jam per alamat IP | Mendaftarkan banyak akun tidak pernah punya alasan yang sah |
| `POST /api/auth/sign-in/email` | 10 permintaan per 15 menit per alamat IP | Mendeteksi tebakan kata sandi |
| `POST /api/plans` | 30 permintaan per jam per pengguna | Banyak tab terbuka bisa mengirim permintaan duplikat |
| `POST /api/plans/{id}/vendors/{id}/payments` | 60 permintaan per jam per pengguna | Satu orang tidak butuh lebih dari itu |

Cara yang dipakai: satu helper `src/lib/batas.ts` dengan map in memory, dan hasilnya disimpan di `globalThis` supaya tidak hilang saat hot reload, sama seperti yang sudah dilakukan di `src/db/index.ts`.

Keterbatasan yang harus ditulis jujur: map in memory hilang saat proses restart, dan tidak dibagi antar instance kalau nanti dipakai lebih dari satu instance. Untuk satu instance seperti yang ada sekarang, itu cukup. Kalau nanti butuh lebih, barulah Redis masuk, dan itu keputusan terpisah.

---

## 8. P1 Security headers

`next.config.mjs` sekarang tidak punya `headers()`. Tanpa itu, tidak ada satu pun header keamanan yang terkirim.

| Header | Nilai | Alasan |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Mencegah browser menebak tipe file |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Mencegah surel dan path lengkap ikut terkirim ke pihak lain |
| `X-Frame-Options` | `DENY` | Tidak ada halaman aplikasi yang perlu dibuka di dalam frame |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Tidak ada fitur yang memakai ketiganya. Bukti pembayaran diinput sebagai nama berkas, bukan dari kamera |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Hanya berlaku di HTTPS, dan platform yang dipakai akan mengaktifkan HTTPS |
| `Content-Security-Policy` | Ditunda ke Fase 2 | CSP yang terlalu ketat merusak PWA dan inline style yang dipakai `DESIGN.md`. Belum ada kejadian nyata yang perlu diblokir |

Keputusan yang diambil:

| Keputusan | Alasan |
|---|---|
| Lima header pertama sekarang, CSP nanti | Empat dari lima header itu tidak bisa merusak apa pun. CSP bisa merusak PWA kalau salah, dan belum ada kejadian nyata yang perlu diblokir |
| `X-Frame-Options` memakai `DENY`, bukan `SAMEORIGIN` | Tidak ada integrasi yang butuh aplikasi dibuka di frame. `DENY` lebih ketat dan tidak merusak apa pun |

---

## 9. P1 Test otomatis

Tidak ada satu pun test. Yang sudah dijaga adalah tipe, karena `npm run lint` menjalankan `tsc --noEmit`. Yang belum dijaga adalah perilakunya.

| Jenis | Isi | Alasan memilih yang ini |
|---|---|---|
| Vitest, unit | `src/lib/format.ts` untuk hitung mundur, rupiah, dan tanggal, `src/lib/plan.ts` untuk `namaPlan` dan `tanggalHariBesar`, `src/lib/skema.ts` untuk skema pembayaran dan tugas | Perhitungan uang dan tanggal adalah tempat yang paling tidak boleh salah, dan paling mudah salah. Uji unit cukup, tidak perlu database |
| Vitest, integrasi | Kepemilikan plan: plan orang lain harus menjawab `FORBIDDEN`, bukan `NOT_FOUND`, dan tidak boleh membocorkan data | `src/lib/sesi.ts` adalah satu-satunya penjaga kepemilikan, dan itu bagian yang paling tidak boleh gagal diam-diam |
| Playwright, alur | Daftar, masuk, buat plan, tambah vendor, catat pembayaran, lihat ringkasan. Plus satu alur luring: putuskan jaringan, buat perubahan, sambungkan lagi, pastikan urutannya benar | Ini alur yang paling sering dikeluh pengguna, dan yang baru saja memperlihatkan bug pemblokir. Tes ini yang menjaga supaya tidak terulang |

Keputusan yang diambil:

| Keputusan | Alasan |
|---|---|
| Vitest dan Playwright, bukan satu saja | Keduanya menjawab pertanyaan berbeda. Keduanya sudah disebut di `06-Stack-dan-Batas.md` bagian 3 sebagai "cukup", jadi tidak ada pustaka baru yang perlu dipertimbangkan |
| Alur Playwright memakai database uji terpisah | Test yang memakai database development membuat hasil test tidak repeatable. Database uji ditunjuk lewat `DATABASE_URL` yang berbeda, bukan database yang dipakai untuk pengembangan |

---

## 10. P1 Perbaikan kontrak

Dua tempat yang menjawab dengan bentuk berbeda dari kontrak:

| Endpoint | Sekarang | Seharusnya | Alasan |
|---|---|---|---|
| `GET /api/public/share/{token}` waktu tautan tidak ada (`src/app/api/public/share/[token]/route.ts:89-92`) | `{ galat: "..." }` | `{ error: { code, message } }` | `docs/04-API-Contract.md` menulis satu bentuk untuk semua jawaban error. Client yang baca `error.code` tidak bisa membaca jawaban ini |
| `POST /api/plans/{id}/report/share-text` (`src/app/api/plans/[planId]/report/share-text/route.ts:15-22`) | Type `Body` sendiri dengan `variant`, `jenis`, `message`, `pesanTambahan`, `linkId`, `tautanId` | Skema Zod di `src/lib/skema.ts` | Type `Body` tidak divalidasi, jadi `jenis` bisa berisi apa saja dan sudah di-cast langsung ke `JenisBagikan`. Dua nama untuk satu field juga membuat client tidak tahu yang mana yang benar |

Catatan untuk keputusan lima pertanyaan: tidak ada pustaka baru. Hanya `zod` yang sudah dipakai.

---

## 11. P2 Verifikasi surel dan lupa kata sandi

Tidak dibangun di Fase 1. Alasannya sudah ditulis di `06-Stack-dan-Batas.md`, dan diulang di sini supaya tidak hilang:

| Pertanyaan | Jawaban |
|---|---|
| Apakah ini benar kalau kita bertahan sampai sepuluh ribu pengguna? | Ya, tapi tidak sekarang. Sepuluh ribu pengguna belum ada |
| Kalau ya, apakah Fase 1 benar-benar butuh? | Tidak. Tidak ada laporan bahwa ada orang yang salah masuk |
| Berapa biaya pemeliharaan? | Penyedia surel, kunci API, biaya kirim, dan satu kode tambahan yang harus dijaga |
| Kalau nanti dibuang, berapa biaya pencabutan? | Murah, tapi data `verification` yang sudah ada harus dihapus |
| Bisakah masalahnya diselesaikan tanpa teknologi baru? | Verifikasi surel tidak bisa. Lupa kata sandi bisa dengan tautan yang dibuat dari session saja, dan itu masuk P2 setelah surel ada |

Kalau nanti masuk Fase 2, urutan yang benar: lupa kata sandi dulu, baru verifikasi surel. Lupa kata sandi tidak butuh penyedia surel kalau tautannya dikirim lewat WhatsApp, dan di aplikasi ini WhatsApp memang sudah jadi jalur utama.

---

## 12. P2 Jalur deploy dan backup

Belum ada target deploy yang dipilih. `06-Stack-dan-Batas.md` bagian 2 hanya menulis "satu platform, satu proses", dan itu belum jadi pilihan yang bisa dieksekusi.

| Yang harus diputuskan | Pilihan | Alasan memilih yang ini |
|---|---|---|
| Target deploy | Satu platform terkelola yang mendukung Node.js dan container | `06-Stack-dan-Batas.md` bagian 3 sudah menolak Kubernetes. Yang dibutuhkan hanya satu proses |
| Cara menjalankan migrasi | `db:migrate` sebagai langkah release, bukan dijalankan saat aplikasi start | Kalau migrasi jalan saat start, dua instance yang start bersamaan bisa menjalankan migrasi yang sama dua kali |
| Backup database | Dump harian ke storage yang sama dengan platform | Data plan yang hilang berarti pasangan kehilangan catatan pembayaran mereka. Ini satu-satunya data yang tidak bisa dibangun ulang |
| Pemantauan | Health check di `/api/kesehatan` plus log server biasa | `06-Stack-dan-Batas.md` bagian 3 sudah menolak Sentry. Health check sudah ada, tinggal diberi tahu platform |
| Image container | `output: "standalone"` di `next.config.mjs` plus `Dockerfile` multi-stage | Tanpa `standalone`, image membawa `node_modules` penuh. Keduanya adalah pasangan yang benar, dan tidak ada biaya licence |

---

## 13. P2 Uji aksesibilitas

Warna sudah berpasangan dan sudah punya pasangan untuk dark mode. Yang belum ada adalah pengukurannya.

| Yang diuji | Cara | Alasan |
|---|---|---|
| Kontras teks | Hitung rasio semua pasangan warna di `src/app/globals.css` untuk mode terang dan gelap | Aturan di `AGENTS.md` bagian 8 menulis minimal 4.5:1. Belum pernah dihitung, jadi sekarang baru jadi klaim |
| Target sentuh | Ukur tinggi dan lebar setiap tombol dan link di layar mobile | Target 44x44px ada di CSS, tetapi belum diukur di semua layar |
| Keyboard | Jalankan seluruh alur utama tanpa tetikus | `docs/08-NFR.md` menulis jalur ini harus bisa dipakai dengan keyboard, tetapi belum pernah diuji |
| Focus | Pastikan semua elemen interaktif punya `:focus-visible` yang terlihat | Aturannya ada di `DESIGN.md`, tetapi belum diperiksa di semua komponen |
| Dark mode | Ganti tema lalu periksa kontrasnya, bukan hanya membaca kodenya | Aturan di `AGENTS.md` bagian 6 menulis dark mode harus diuji, bukan hanya ada |

---

## 14. P3 Keselarasan dokumen

Tidak memblokir produksi, tetapi kalau tidak diperbaiki, dokumen akan dipercaya padahal tidak benar.

| Yang berbeda | Ke mana | Perbaikan |
|---|---|---|
| `docs/17-Rencana-Build.md` bagian 2 memakai awalan `/l/` untuk tautan berbagi | Kode memakai `/bagikan/` | Tulis ulang keputusan di bagian 2, dan koreksi rujukan di `17` bagian 6 |
| `docs/11-Delivery-Plan.md` dan `docs/10-Epik-dan-Story.md` mewajibkan test | `docs/17-Rencana-Build.md` bagian 11 menundanya ke Fase 3 | Tulis keputusannya di `17` bagian 2: test masuk Fase 2. Alasannya cacat `generateId` yang ditemukan karena tidak ada test. Ini bukti nyata, bukan perkiraan |
| `docs/03-Data-Model.md` belum punya "bentuk sekarang" | Bentuk tabel nyata ada di database | Tulis setelah `db:generate` selesai |
| Nama produk masih ditulis "Aisyah & Bagas" | `docs/01-PRD.md` menulis nama produk belum diputuskan | `NAMA_PRODUK` di `src/lib/konstanta.ts:169` sudah jadi satu sumber, dan `src/app/manifest.ts` masih menulis nama itu sendiri. Arahkan `manifest.ts` ke `NAMA_PRODUK`, lalu ubah satu konstanta itu ketika nama diputuskan |

---

## 15. Urutan pengerjaan

Satu story satu kali jalan, dan tiap story berakhir dengan aplikasi yang masih jalan.

| # | Story | Prioritas | Selesai kalau |
|---|---|---|---|
| 1 | Perbaiki `generateId` | P0 | Daftar sampai ke Beranda di browser, dan plan bisa dibuat |
| 2 | Batas halaman | P0 | `error.tsx`, `global-error.tsx`, `not-found.tsx`, dua `loading.tsx`, dan dua `error.tsx` ada, dan build hijau |
| 3 | Antrean luring | P0 | 401 tidak dihitung terkirim, pembuangan kelihatan, dan pita luring muncul saat data luring |
| 4 | Migrasi database | P0 | `src/db/migrations` ter-commit, `db:migrate` jalan, dan `db:check` hijau |
| 5 | Koneksi database | P0 | `prepare: false` ada, dan aplikasi masih bisa membuat plan lewat browser |
| 6 | Rate limit | P0 | Daftar enam kali dalam satu jam mendapat 429 dengan `RATE_LIMITED` |
| 7 | Security headers | P1 | `curl -I` ke `/beranda` memuat lima header, dan PWA masih jalan |
| 8 | Test otomatis | P1 | `npm test` hijau, dan test alur luring membuktikan urutan antrean |
| 9 | Perbaikan kontrak | P1 | `share/{token}` menjawab `error.code`, dan `share-text` memakai skema Zod |
| 10 | Keselarasan dokumen | P3 | Tidak ada rujukan yang bertentangan, dan `CHANGELOG.md` ditulis |

Story 2 sampai 6 tidak menambah satu pun pustaka. Story 7 dan 8 menambah Vitest dan Playwright, keduanya sudah disebut di `06-Stack-dan-Batas.md` bagian 3.

---

## 16. Yang tidak masuk rencana ini

| Tidak dibangun | Alasan |
|---|---|
| Verifikasi surel dan lupa kata sandi | P2, butuh penyedia surel. Ada di bagian 11 dengan lima pertanyaannya |
| Redis, message queue, microservices | Sudah ditolak di `06-Stack-dan-Batas.md` bagian 3. Tidak ada masalah nyata yang menyalakannya |
| Sentry atau alat pemantauan lain | Sudah ditolak di bagian 3. Health check dan log server cukup untuk satu proses |
| Pustaka PDF | Laporan pakai CSS `@media print`. Nol dependensi, jalan tanpa sinyal |
| Editor teks kaya | Di luar scope. `01-PRD.md` bagian 4 sudah menolaknya |
| Multi bahasa | Di luar scope. `01-PRD.md` sudah menetapkan satu bahasa |
| Kolom `id` jadi `text` | Lebih besar tanpa nilai. Bagian 1 sudah menjelaskan |
| Test snapshot untuk tampilan | Assertion tentang piksel mudah rapuh dan tidak memberi nilai ke pengguna. Test perilaku lebih berguna |

---

## 17. Ukuran berhasil

Ukuran berhasil ditulis lebih dulu supaya tidak melebar tanpa arah.

| Ukuran | Angka | Cara diukur |
|---|---|---|
| Pendaftaran berhasil | 100 persen dari percobaan yang sah | Dijalankan lewat browser, bukan lewat API langsung |
| Pencatatan plan berhasil | Daftar sampai pembayaran tercatat, tanpa satu pun langkah yang diam-diam gagal | Dijalankan lewat browser |
| Antrean luring tidak kehilangan data | Tidak ada item yang hilang tanpa pemberitahuan | Uji luring: tiga perubahan sampai ke server utuh |
| Bentuk tabel bisa dijelaskan tanpa membuka database | Bisa | `src/db/migrations` ter-commit, dan `docs/03-Data-Model.md` cocok |
| Build dan tipe | Hijau | `npm run lint` dan `npm run build` |
| Kontras | Semua pasangan warna minimal 4.5:1 | Diukur, bukan dibaca dari kode |
| Test | Hijau | `npm test` |

Kalau ada satu baris di tabel ini yang tidak bisa dipastikan, aplikasi belum siap produksi, dan itu ditulis apa adanya di bagian atas dokumen ini, bukan disembunyikan.
