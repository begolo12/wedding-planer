# 06. Pilihan Stack dan Batas Over-Engineering

Permintaan awalnya menyebut "stack-nya jangan over-engineering". Dokumen ini adalah jawaban tertulis untuk itu, supaya batasannya bisa diperiksa orang lain, dan bukan hanya tersimpan di kepala pemangku proyek.

---

## 1. Prinsip yang dipakai

Empat aturan dipakai untuk setiap pilihan teknologi.

| Aturan | Arti |
|---|---|
| Beban tambahan harus dibayar dengan nilai | Tiap dependensi baru harus bisa disebut nilai yang didapat |
| Satu cara untuk satu masalah | Kalau ada dua cara, pilih satu dan tulis alasannya di sini |
| Selaraskan dengan yang sudah ada | Kalau bisa pakai yang sudah ada, jangan tambah yang baru |
| Boleh naik kelas nanti, jangan sekarang | Sistem kecil lebih mudah diubah daripada sistem besar yang salah |

---

## 2. Stack yang dipilih

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 App Router | Satu codebase melayani web dan PWA. Render di server membantu waktu muat di jaringan lambat |
| Bahasa | TypeScript | Data plan punya banyak relasi. Typing mencegah salah akses field, dan biayanya nol di runtime |
| Database | PostgreSQL | Pilihan paling umum, punya dukungan yang luas, dan punya transaksi untuk data pembayaran |
| ORM | Drizzle ORM | Query-nya mirip SQL, tipe yang dihasilkan akurat, dan tidak butuh engine terpisah seperti Prisma |
| Auth | Better Auth | Cukup untuk email dan Google. Sesi di cookie, jadi tidak butuh token yang disimpan manual |
| Validasi | Zod | Satu skema dipakai di form, di API, dan di tipe TypeScript |
| Styling | Tailwind CSS | Token warna dan spasi diambil dari `DESIGN.md`, jadi tidak ada tempat kedua untuk menentukan tampilan |
| PWA | Service worker tulis tangan | Strategi cache-nya spesifik untuk data plan. `next-pwa` tidak cukup fleksibel untuk itu |
| Deployment | Satu platform, satu proses | Monolith, satu repo, satu deploy |

Total: satu database, satu proses aplikasi, satu pipeline deploy.

---

## 3. Yang sengaja tidak dipakai

Ini bagian paling penting dari dokumen ini. Setiap baris adalah sesuatu yang sengaja ditolak.

| Tidak dipakai | Alasan |
|---|---|
| GraphQL | REST dengan empat endpoint sudah cukup. GraphQL menambah layer dan skill tanpa menambah fitur |
| Redis | Cache pertama bisa pakai `unstable_cache` bawaan Next.js. Butuh yang lebih baik nanti |
| Message queue | Tidak ada proses yang butuh jalan di belakang layar pada Fase 1 |
| Microservices | Satu aplikasi kecil. Microservice untuk aplikasi kecil hanya menambah jaringan |
| Kubernetes | Berat. Satu container di platform managed sudah cukup |
| Prisma | Butuh binary terpisah, dan tipe-nya lebih sulit dikontrol dibanding Drizzle |
| Storybook | Berguna, tapi bukan bagian dari produk yang bisa dipakai pengguna |
| Testing library besar | Vitest untuk unit test, Playwright untuk alur utama. Itu cukup |
| State management global | Server Component dan URL sebagai state sudah menangani hampir semua kasus |
| CSS-in-JS | Tailwind tidak butuh runtime CSS, dan tidak perlu file style terpisah |
| Monorepo (Turborepo) | Satu aplikasi, tidak perlu |
| TypeScript di API terpisah | TypeScript sudah di aplikasi, API-nya bagian dari aplikasi yang sama |
| ORM migration framework terpisah | Drizzle punya migration sendiri, tidak perlu tool lain |
| Service worker library | Strateginya spesifik, dan menulis sendiri lebih mudah diubah daripada memakai library generik |
| Sentry atau tool observability lain | Mulai dari log server biasa. Tambah kalau ada masalah yang nyata |
| Feature flag service | Satu produk, tidak perlu |
| Pustaka PDF | Laporan dibuat dengan CSS `@media print` dan dialog cetak bawaan. Nol dependensi, nol pemeliharaan, jalan tanpa sinyal |

---

## 4. Batas yang harus dijaga

Kalau ada yang ingin menambahkan sesuatu, periksa dulu lima pertanyaan ini.

1. **Apakah ini menyelesaikan masalah yang ada di `02-Domain-Spec.md`?** Kalau tidak, jangan ditambah.
2. **Apakah bisa diselesaikan tanpa menambah dependensi baru?** Kalau bisa, begitu yang dipakai.
3. **Berapa banyak baris kode yang bertambah?** Kalau lebih dari seratus baris untuk fitur kecil, itu tanda fitur ini terlalu besar untuk sekarang.
4. **Siapa yang kena biaya?** Pemeliharaan, upgrade dependensi, dan memahami kode baru. Kalau tidak ada yang mau menanggung, jangan ditambah.
5. **Kalau ini nanti dibuang, apakah produk masih jalan?** Kalau tidak, itu arsitektur yang terlalu terikat.

Pertanyaan kelima penting untuk keputusan yang sulit. Kalau sebuah pilihan hanya benar kalau terus bertahan, pilihan itu terlalu besar untuk Fase 1.

---

## 5. Satu-satunya pengecualian

Ada satu tempat di mana menambah dependensi dianggap benar:

**Penting**: kalau sebuah fitur tidak bisa dibangun tanpa library tertentu, dan membangunnya sendiri butuh lebih dari dua hari, pakai library. Menulis ulang algoritma yang sudah matang lebih berisiko daripada menambah dependensi.

Contoh yang lolos: parsing tanggal hijriah, dan pemformatan angka uang. Contoh yang tidak lolos: membuat kalender sendiri, karena menambah empat minggu untuk sesuatu yang jarang dipakai.

Contoh yang lolos pengujian lima pertanyaan tapi tetap ditolak: laporan PDF. Soalnya bisa diselesaikan tanpa teknologi baru, dan pilihannya justru menghasilkan lebih sedikit dependensi. Kalau pertanyaan nomor dua dijawab "bisa", jawabannya sudah selesai dan pustaka tidak dipakai.

Aturan ini dipakai di laporan dan cetak PDF, dan pertanyaannya sama dengan yang dipakai di mana-mana: apakah memang tidak bisa dibangun tanpa pustaka tertentu, dan apakah membangunnya sendiri memang butuh lebih dari dua hari.
