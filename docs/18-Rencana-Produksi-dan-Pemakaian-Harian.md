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
| P2 | Jalur deploy dan backup | Deploy sudah jalan di Vercel dan terpicu otomatis saat push ke `main` (bagian 12). Yang tersisa backup harian, restore teruji, pemantauan dan agregasi log, serta pemastian pemisahan database produksi |
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

Keputusan pemilik produk 4 Oktober 2026: target deploy adalah Vercel, tersambung ke repositori GitHub `begolo12/wedding-planer`, dan deploy terpicu otomatis setiap push ke cabang `main`. Produksi sudah tayang di `https://wedding-planer-self.vercel.app`.

Bukti diperiksa 4 Oktober 2026 setelah commit `fa9dfd1`: `GET /api/kesehatan` menjawab 200 dalam 2,43 detik (artinya database produksi terhubung), `/manifest.webmanifest` memuat name dan short_name "Rapi Nikah", `HEAD /masuk` mengirim lima header keamanan tanpa CSP, dan `GET /kebijakan` menjawab 200.

| Yang sudah berlaku | Keadaan | Alasan atau bukti |
|---|---|---|
| Target deploy | Vercel, tersambung ke repositori GitHub, deploy otomatis saat push ke `main` | Bukti di paragraf atas. Pilihan "satu platform terkelola, satu proses" di `06-Stack-dan-Batas.md` bagian 2 sudah terjawab |
| Cara menjalankan migrasi | `db:migrate` sebagai langkah release, bukan dijalankan saat aplikasi start | Kalau migrasi jalan saat start, dua instance yang start bersamaan bisa menjalankan migrasi yang sama dua kali |
| Pemantauan | Health check di `/api/kesehatan` plus log server biasa | `06-Stack-dan-Batas.md` bagian 3 sudah menolak Sentry. Health check sudah ada, tinggal diberi tahu platform |

Yang masih belum:

| Yang belum | Keadaan sekarang | Yang dibutuhkan |
|---|---|---|
| Backup harian database | Belum ada bukti dump harian berjalan | Jadwal dump dan storage tujuan |
| Restore yang pernah diuji | Belum pernah dicoba memulihkan dari dump | Satu uji restore ke database terpisah |
| Pemantauan dan agregasi log | Health check sudah ada, tetapi belum ada yang memberi tahu saat gagal, dan log belum diagregasi | Pemberitahuan dari platform atau alat pemantauan |
| Pemisahan database produksi | Database produksi memang terhubung, dibuktikan `GET /api/kesehatan` 200, tetapi belum dipastikan terpisah dari database pengembangan | Konfirmasi nama dan host database produksi berbeda dari pengembangan |

Catatan: baris "Image container" dengan `output: "standalone"` dan `Dockerfile` tidak dipakai. Vercel yang menangani build dan proses, jadi tidak ada container yang dibangun dari repo. Kalau nanti pindah platform, keputusan itu ditulis ulang di sini.

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

## 15. Status pengerjaan per story

Tabel ini status, bukan lagi rencana. Tiap status diambil dari bukti yang bisa dibuka, bukan dari perasaan sudah selesai.

| # | Story | Prioritas | Status | Bukti | Sisa pekerjaan |
|---|---|---|---|---|---|
| 1 | Perbaiki `generateId` | P0 | Selesai | `src/lib/auth.ts` memakai `advanced.database.generateId: "uuid"`; pendaftaran lewat browser terbukti di e2e Playwright alur utama | Tidak ada |
| 2 | Batas halaman | P0 | Selesai | `src/app/error.tsx`, `src/app/global-error.tsx` (memakai komponen `Gagal` dan gaya inline cadangan), `src/app/not-found.tsx`, satu `src/app/(app)/loading.tsx`, dan `src/app/(app)/error.tsx` | Tidak ada |
| 3 | Antrean luring | P0 | Selesai | 4xx tidak dihitung terkirim, 401 menahan item, batas 500 dan jumlah yang dibuang dilaporkan, tulis tanpa respons ikut diantrekan, dan baca luring per perangkat (cache IndexedDB per `planId`, batas 50 tugas dan 50 tamu, rundown dan anggaran penuh) dengan pita "Menampilkan data dari perangkat". Tombol tambah/ubah/hapus disembunyikan saat luring. Bukti: tiga perubahan saat luring sampai ke server dengan urutan sama; e2e membuktikan isi object store antrean 1 lalu 3 lalu 0 | Tidak ada |
| 4 | Migrasi database | P0 | Selesai | `src/db/migrations/0000_open_outlaw_kid.sql` (15 tabel) ter-commit; `package.json` punya `db:migrate` dan `db:check`; `npm run db:check` menjawab "Everything's fine"; `db:migrate` dijalankan ke database sementara `wedding_uji_20261004` dan menjawab "migrations applied successfully", 15 tabel terbentuk termasuk `users`, `plans`, `payments`, lalu database sementara itu di-DROP dan `DATABASE_URL` (database `wedding_planer`) tidak pernah jadi target migrasi | Tidak ada |
| 5 | Koneksi database | P0 | Selesai di kode | `prepare: false` dan `ssl: "require"` untuk host bukan localhost | Jalur ssl remote belum teruji runtime karena `DATABASE_URL` di mesin ini localhost |
| 6 | Rate limit | P0 | Selesai | better-auth bawaan untuk sign-up 5 per jam per IP dan sign-in 10 per 15 menit per IP, badan 429 diterjemahkan ke bentuk standar; `src/lib/batas.ts` untuk POST plans 30 per jam per pengguna dan POST payments 60 per jam per pengguna. Terukur: percobaan sign-in ke-11 menjawab 429 dengan `X-Retry-After` 900 dan `{"error":{"code":"RATE_LIMITED"}}`; POST `/api/plans` 30 kali pertama menjawab 422, percobaan ke-31 menjawab 429 dengan `{"error":{"code":"RATE_LIMITED"}}` dan header `X-Retry-After`, tanpa satu pun plan dibuat | 429 untuk POST payments belum diukur |
| 7 | Security headers | P1 | Selesai | Lima header terkirim tanpa CSP | Tidak ada |
| 8 | Test otomatis | P1 | Selesai | Vitest 9 berkas 89 test hijau (format, plan, skema, status-luring, cache-baca, api-client-luring, batas laju, integrasi kepemilikan plan, integrasi laporan); Playwright 5 spec hijau di port 3100 (alur utama, alur luring, batas laju plans, hapus akun, kontrak share-text) | Tanpa `TEST_DATABASE_URL`, test integrasi memakai database pengembangan dan tiap test membuat lalu menghapus datanya sendiri |
| 9 | Perbaikan kontrak | P1 | Selesai | `/api/public/share/{token}` menjawab `{"error":{"code":"NOT_FOUND"}}` (terukur 404); POST `report/share-text` memakai `skemaBagikanTeks` dengan field `variant`, `message`, `linkId` | Tidak ada |
| 10 | Keselarasan dokumen | P3 | Selesai | Daftar berkasnya ada di laporan pekerja dokumen | Tidak ada |

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

Ukuran di bawah sudah diukur, kecuali baris yang ditandai belum di bagian 18.

| Ukuran | Angka | Cara diukur |
|---|---|---|
| Pendaftaran lewat browser | Ya, berhasil | e2e Playwright alur utama |
| Plan sampai pembayaran | Ya, Rp 5.000.000 | e2e Playwright alur utama |
| Antrean luring tidak kehilangan data | Ya, 3 perubahan terkirim berurutan; isi object store antrean 1 lalu 3 lalu 0 | e2e alur luring |
| Bentuk tabel bisa dijelaskan tanpa membuka database | Ya | Migrasi ter-commit, dan `docs/03-Data-Model.md` sudah dilengkapi |
| Build dan tipe | Hijau | `npm run lint`, 89 test, `npm run build` 56 rute |
| Kontras | 0 gagal di terang dan gelap; rasio terburuk 4,55 di terang dan 5,35 di gelap | Diukur di 17 rute pada 390 dan 1440 px |
| Test | 89 test hijau, plus 5 e2e hijau | Vitest dan Playwright |
| Migrasi dari nol | 15 tabel terbentuk, "migrations applied successfully" | `db:migrate` ke database sementara `wedding_uji_20261004`, lalu di-DROP |
| Batas laju endpoint plan | 30 kali 422, percobaan ke-31 429 dengan `X-Retry-After` | Diukur lewat request, tanpa plan yang dibuat |
| Tanpa geser horizontal | Tidak ada geser di 360, 390, dan 1440 px | Diukur lewat browser |
| Tombol tanpa handler | 0 di 17 rute | Diukur lewat browser |
| Gradasi | 1, turun dari 20 | Diukur, sesuai `DESIGN.md` bagian 5 |
| Emoji di UI | 0 | Diukur, sesuai `DESIGN.md` bagian 8 |
| PDF laporan | 2 halaman | Diukur (target paling banyak 3) |
| Manifest dan ikon | Manifest dan 3 ikon menjawab 200 | Diukur lewat request |
| Service worker | Mengontrol halaman | Diukur lewat browser |

---

## 18. Celah yang belum selesai

Celah di bawah disengaja belum dikerjakan, atau sudah selesai di kode tapi belum teruji. Tiap baris punya alasan.

| Celah | Alasan | Yang dibutuhkan |
|---|---|---|
| Backup harian database, restore teruji, pemantauan dan agregasi log, dan pemastian pemisahan database produksi | Deploy produksi sudah ada dan tayang di `https://wedding-planer-self.vercel.app` sejak 4 Oktober 2026. `GET /api/kesehatan` menjawab 200, artinya database produksi terhubung, tetapi backup harian belum terbukti berjalan, restore belum pernah diuji, belum ada pemberitahuan saat gagal, dan pemisahan database produksi dari database pengembangan belum dipastikan | Jadwal dan uji backup, alat pemantauan dan agregasi log, konfirmasi database produksi terpisah |
| Lighthouse dan Core Web Vitals | Belum diukur, padahal aplikasi sudah tayang di `https://wedding-planer-self.vercel.app` sejak 4 Oktober 2026, jadi pengukurannya bisa dijalankan kapan saja | Jalankan Lighthouse, lalu catat hasilnya |
| Screen reader dan jalur keyboard penuh | Belum diuji. Keyboard dasar jalan, tapi seluruh alur belum dijalankan tanpa tetikus | Uji manual, lalu catat |
| Jalur ssl remote | Host remote belum tersedia, dan `DATABASE_URL` di mesin ini localhost | Koneksi remote untuk uji ssl |
| Dialog konflik 409 | Tidak dibangun karena `01-PRD.md` bagian 4.2 memutuskan last-write-wins. Sudah dicatat di `07-PWA.md` | Data nyata yang menunjukkan sunting bersamaan |
| Unggah bukti transfer, pengingat tugas, ekspor PDF daftar tamu | Ditunda, dan sudah tercatat di `17-Rencana-Build.md` bagian 11 | Object storage, izin Notification, dan kolom pendukung |
| Kado/angpau, meja/denah, peta, kode busana, tombol bagikan busana | Tidak dibangun karena butuh kolom atau endpoint baru. Sudah ditulis di `12c`, `12d`, dan `12e`. Istilah "dress code" sudah diganti "kode busana" di layar, tapi blok gambarnya tetap belum ada | Perubahan skema atau endpoint |
| Lupa kata sandi dan verifikasi surel | Tetap P2, butuh penyedia surel | Penyedia surel dan keputusan lima pertanyaan |
| Hapus akun | Sudah diuji lewat e2e: akun hilang dari database, sesi hilang, dan diarahkan ke `/masuk` | Tidak ada untuk akun dengan kata sandi |
| Akun tanpa kata sandi (khusus Google) | Hapus akun butuh konfirmasi kata sandi, sedangkan akun Google tidak punya kata sandi | Cara konfirmasi lain untuk akun tanpa kata sandi |
| 429 untuk POST payments | Kodenya ada, tapi belum diukur jumlah percobaannya | Uji terukur per endpoint |
| Kursi hanya angka yang perlu disiapkan, integrasi sewa kursi tidak dibangun | Angka kursi dihitung dari tamu hadir ditambah yang belum menjawab (`src/lib/tamu.ts:98,108-109`). Pemilik produk memutuskan 4 Oktober 2026 bahwa integrasi sewa kursi tidak dibangun, dan kursi tetap dicatat sebagai vendor biasa | Tidak ada untuk Fase 1. Ditinjau ulang kalau pemilik produk mengubah keputusan |
| QRIS hanya label metode pembayaran | `qris` ada di `METODE_BAYAR` (`src/lib/konstanta.ts:120,128`), tapi tidak ada gerbang pembayaran, jadi tidak ada uang yang benar-benar berpindah lewat aplikasi | Gerbang pembayaran, atau keputusan bahwa label ini memang cuma penanda |
| Tautan undangan disimpan dan ditandai terkirim secara manual | `invitationUrl` disimpan per acara (`src/db/schema.ts:100`) dan `invitedAt` ditandai borongan (`src/app/api/plans/[planId]/guests/undangan/route.ts:27-38`), tapi aplikasi tidak mengirim undangan | Penyedia kirim pesan, atau keputusan bahwa penandaan manual sudah cukup |
| Porsi tidak menambah cadangan otomatis di atas jumlah orang | Pemilik produk memutuskan 4 Oktober 2026 bahwa angka `porsi` tetap dihitung dari orang yang perlu dilayani (`src/lib/tamu.ts:98,108-109`), karena besaran cadangan berbeda antar vendor, menu, dan jumlah anak | Tidak ada. Pemilik rencana yang menyesuaikan saat memesan |
| Kontak halaman kebijakan memakai halaman Issues repositori sebagai kanal sementara | Pemilik produk memutuskan 4 Oktober 2026 memakai kanal yang benar-benar ada, yaitu halaman Issues `github.com/begolo12/wedding-planer/issues` (`src/app/kebijakan/page.tsx`), sampai ada surel resmi | Surel resmi atau kanal kontak jangka panjang, lihat `docs/08-NFR.md` bagian Privasi |
| Retensi akun 24 bulan belum punya pengingat surel | Kebijakan retensi tertulis di `docs/08-NFR.md` bagian Privasi, tapi pengingat surel belum ada karena surel masih Fase 2 | Penyedia surel, lihat bagian 11 |

---

## 19. Keputusan pemilik produk yang sudah diambil

Empat keputusan diambil pemilik produk pada 4 Oktober 2026. Berikut satu baris ringkas tiap keputusan, dengan rujukan ke bagian yang lebih rinci.

| Keputusan | Isi | Alasan | Rujukan |
|---|---|---|---|
| Cadangan porsi katering | Tidak ada cadangan otomatis di atas jumlah orang. Angka porsi tetap dihitung dari orang yang perlu dilayani, yaitu tamu hadir ditambah yang belum konfirmasi | Besaran cadangan berbeda antar vendor, menu, dan jumlah anak, jadi aplikasi tidak mengarang persentase, dan pemilik rencana yang menyesuaikan saat memesan | `docs/02b-Tamu.md` bagian keputusan porsi dan kursi, `docs/05-IA-dan-Layar.md` bagian 10, komentar di `src/lib/tamu.ts`, dan bagian 18 dokumen ini |
| Integrasi sewa kursi | Tidak dibangun. Kursi tetap dicatat sebagai vendor biasa, dan angka kursi tetap tampil sebagai perkiraan kebutuhan | `docs/01-PRD.md` bagian 4.2 menolak marketplace vendor | `docs/02b-Tamu.md` bagian keputusan porsi dan kursi, dan bagian 18 dokumen ini |
| Kontak halaman kebijakan | Memakai halaman Issues repositori `github.com/begolo12/wedding-planer/issues` sebagai kanal sementara sampai ada surel resmi | Kanal itu benar-benar ada, terverifikasi lewat `git remote -v`, dan surel resmi belum dipublikasikan | `docs/08-NFR.md` bagian Privasi, `src/app/kebijakan/page.tsx`, dan bagian 18 dokumen ini |
| Harga dan model bisnis | Fase 1 gratis, tanpa iklan dan tanpa fitur berbayar. Model bisnis ditinjau lagi setelah ada pengguna nyata | `docs/01-PRD.md` bagian 3.1 menulis pengguna tidak akan membayar sebelum mencoba, dan belum ada pengguna nyata | `docs/01-PRD.md` bagian 7.1 |

Catatan: daftar celah di bagian 18 disetujui apa adanya. Rilis ditentukan pemilik produk, bukan pekerja.

---

## 20. Kesesuaian Indonesia

Ringkasan kebutuhan orang Indonesia yang sudah dijawab kode, dengan bukti berkas:baris, plus yang masih terbuka. Dasarnya audit di `.audit/laporan-indonesia.md`.

### 20.1 Sudah dijawab kode

| Kebutuhan orang Indonesia | Bukti |
|---|---|
| Waktu dan tanggal Asia/Jakarta | `src/lib/konstanta.ts:186` (`ZONA`), `src/lib/format.ts:273` (`hariIni`) dan `:283` (`awalHariJakarta`); dipakai di `src/app/(app)/hari-h/page.tsx:45`, `src/app/(app)/rencana/tanggal/page.tsx:31-33`, `src/app/(app)/rencana/vendor/[vendorId]/page.tsx:80,303,421` |
| Rupiah Indonesia penuh, termasuk bentuk singkat untuk kolom isian | `src/lib/format.ts:99` (`rupiah`) dan `:108` (`rupiahPolos`), dipakai `src/components/field.tsx:145` |
| Nomor WhatsApp Indonesia jadi tautan `wa.me` yang benar | `src/lib/format.ts:245` (`normalkanNomorWa`), transform di `src/lib/skema.ts:95-105`, tautan di `src/app/(app)/tamu/page.tsx:656`, `src/app/(app)/rencana/vendor/page.tsx:339`, `src/app/(app)/rencana/vendor/[vendorId]/page.tsx:371` |
| Porsi katering dan kursi yang perlu disiapkan | `src/lib/tamu.ts:98,108-109` (hadir ditambah belum konfirmasi), tampil di `src/app/(app)/tamu/page.tsx:406-415`, `src/app/(app)/laporan/page.tsx:257-266`, `src/app/(app)/beranda/page.tsx:315` |
| Sisi tamu enum dengan saringan dan rincian per pihak | `src/lib/konstanta.ts:65`, hitung di `src/lib/tamu.ts:89-91,117`, saringan di `src/app/api/plans/[planId]/guests/route.ts:49-61` dan `src/app/(app)/tamu/page.tsx:474-501`, rincian di `src/app/(app)/laporan/page.tsx:296-310` |
| Tautan undangan per acara | `src/db/schema.ts:100`, simpan di `src/app/api/plans/[planId]/milestones/route.ts:48`, form dan tampilan di `src/app/(app)/rencana/tanggal/page.tsx:314-324,420-433` |
| Filter dan penandaan undangan terkirim | Filter `undangan` di `src/app/api/plans/[planId]/guests/route.ts:62`, borongan di `src/app/api/plans/[planId]/guests/undangan/route.ts:27-38`, layar di `src/app/(app)/tamu/page.tsx:489-501,887-889` |
| Ekspor data pribadi lengkap | `src/app/api/plans/[planId]/ekspor/route.ts:29-80`, tombol di `src/app/(app)/akun/page.tsx:207` |
| Kategori anggaran Administrasi | `src/lib/konstanta.ts:23,36`, warna kesembilan di `src/app/(app)/anggaran/page.tsx:60-70` |
| Metode bayar QRIS | `src/lib/konstanta.ts:120,128`, pilihan di `src/app/(app)/rencana/vendor/[vendorId]/page.tsx:517` |
| Istilah Indonesia dan glosarium | `docs/02-Domain-Spec.md:22`, `docs/15-Glosarium.md`, label di `src/lib/konstanta.ts:131` |
| Margin cetak 20mm dengan kaki halaman | `src/app/cetak.css:16,18` dan `:82` (`.cetak-kaki`), dipakai `src/app/(app)/laporan/page.tsx:99,473-475` |
| Halaman kebijakan privasi | `src/app/kebijakan/page.tsx`, ditautkan dari `src/app/(auth)/daftar/page.tsx:243` |
| Biaya busana masuk anggaran | Tombol di `src/app/(app)/rencana/seragam/page.tsx:224-252,337-379`, memakai `src/app/api/plans/[planId]/budget-items` |
| Tugas jatuh tempo hari ini tidak lagi dianggap lewat | `src/components/task-item.tsx:74` memakai `sudahLewat` dari `src/lib/format.ts:288` |

### 20.2 Yang belum

| Belum | Bukti |
|---|---|
| Kursi cuma angka yang perlu disiapkan, integrasi sewa kursi tidak dibangun (keputusan 4 Oktober 2026) | `src/lib/tamu.ts:108-109`, tidak ada endpoint vendor kursi |
| QRIS cuma label, bukan gerbang bayar | `src/lib/konstanta.ts:128` |
| Undangan disimpan dan ditandai manual, bukan pengiriman otomatis | `src/app/api/plans/[planId]/guests/undangan/route.ts:27-38` |
| Porsi tidak menambah cadangan otomatis di atas jumlah orang (keputusan 4 Oktober 2026) | `src/lib/tamu.ts:98`, lihat bagian 19 |
| Kontak halaman kebijakan memakai halaman Issues repositori sebagai kanal sementara (keputusan 4 Oktober 2026) | `src/app/kebijakan/page.tsx` |
| Retensi akun 24 bulan belum punya pengingat surel | `docs/08-NFR.md` bagian Privasi |
