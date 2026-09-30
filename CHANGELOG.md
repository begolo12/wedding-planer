# Changelog

Semua perubahan besar pada dokumen dan kode dicatat di sini.

Formatnya mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/). Versi mengikuti [SemVer](https://semver.org/lang/id/).

Versi 0.1.0 sampai 0.4.0 masih dokumen, belum ada kode. Kode pertama masuk di 0.5.0 dan berikutnya.

---

## Format

```text
## [versi] - YYYY-MM-DD

### Tambah / Ubah / Hapus / Perbaiki

- penjelasan singkat dalam satu baris
```

Aturan singkat:

| Aturan | Kenapa |
|---|---|
| Tulis dari sudut pandang pembaca | Yang penting perubahan, bukan proses |
| Satu baris per perubahan | Kalau butuh dua paragraf, itu dua perubahan |
| Tulis alasan kalau tidak jelas | Pembaca versi berikutnya tidak perlu menebak |
| Tambah entri baru di atas | Yang terbaru selalu di paling atas |

---

## [0.6.3] - 1 Oktober 2026

Audit visual di browser pada lebar 390px, mode terang dan mode gelap, atas sepuluh halaman inti. Yang diukur bukan perkiraan: kontras, geser horizontal, ukuran target sentuh, dan sudut. Semua angka di bawah hasil pengukuran, bukan perkiraan.

#### Perbaiki

- Empat pasangan warna gagal ambang kontras `4.5:1` di mode terang, semuanya kurang sedikit. Semuanya diperbaiki, tidak ada tebakan: nilainya dihitung di browser lalu dipasang sebagai nilai baru di [`src/app/globals.css`](src/app/globals.css). Tabel lengkap ada di `DESIGN.md` bagian 7
  - Teks muted di layar: 4,282 menjadi 4,569. Perbaikannya naik dari tinta 62% ke 64%
  - Tulisan putih di tombol utama: 4,327 menjadi 4,555. Warnanya bukan diganti, tapi dicampur 93% terracotta dengan hitam, bukan 97%
  - Teks sage di label dan angka: 4,489 menjadi 4,565. Warnanya `#5B796A`, satu persen lebih gelap dari rancangan awal
  - Teks lencana beraksen: 4,037 menjadi 4,563. Dicampur 62% marigold dengan hitam, bukan 70%. Warna marigold sendiri tidak diubah karena dipakai sebagai garis dan isian tipis, bukan teks
- Tautan "Daftar" di halaman masuk dan "Masuk" di halaman daftar punya target sentuh 42x16px, di bawah minimum 44px. Penyebabnya kedua tautan itu tidak punya kelas, jadi ukurannya jatuh ke gaya `<a>` biasa. Sekarang memakai `.tautan-kalimat`, kelas yang memang dirancang untuk tautan di dalam kalimat
- Enam modul rencana di `/rencana` tersembunyi di 390px dan tidak ada petunjuknya. Sekarang blok tab punya gradien transparan di tepi kanan, jadi terlihat masih ada tab yang terpotong dan bisa digeser

#### Tambah

- Gradien tepi kanan pada blok tab, dengan `scroll-snap` supaya tab yang aktif berhenti di posisi yang enak dibaca. Ada cadangan untuk browser yang tidak mendukung `mask-image`
- Batas heap dev server dinaikkan ke 1024 MB di [`scripts/dev.mjs`](scripts/dev.mjs). 640 MB lulus uji request tapi mati saat browser sungguhan membuka halaman di dalamnya, heap sudah di 634 MB dengan mode `Ineffective mark-compacts`. 512 dan 576 MB sudah dicoba lebih dulu dan keduanya mati. Detail pengukurannya ada di entri 0.6.2

#### Dokumentasi

- [`DESIGN.md`](DESIGN.md) bagian 7 sekarang memuat tabel koreksi kontras, jadi angka di bagian 3 dan di bagian 7 tidak lagi berbeda
- [`DESIGN.md`](DESIGN.md) memakai nama produk yang benar, `Hari Besar`. Sebelumnya masih menyebut nama pasangan contoh dan mencatat bahwa nama produk belum ditentukan
- Kunci penyimpanan tema di [`src/app/layout.tsx`](src/app/layout.tsx) sudah `haribesar-tema`; dokumen masih menyebut kunci lama. Sekarang sama

---

## [0.6.2] - 1 Oktober 2026

Dev server dibatasi supaya pemakaian RAM-nya tidak jadi penyebab sesi tertutup sendiri. Angka di bawah diukur di mesin ini dengan memukul sepuluh route inti sebanyak tiga kali tiap route lalu menyentuh `globals.css` tiga kali untuk memaksa kompilasi ulang, bukan diperkirakan.

#### Tambah

- [`scripts/dev.mjs`](scripts/dev.mjs) menjalankan `next dev` lewat Node supaya batas heap bisa dipasang di Windows. Batas tidak bisa ditulis langsung di `package.json` karena sintaks `NODE_OPTIONS=... next dev` hanya jalan di shell POSIX, bukan di cmd.exe maupun PowerShell. Bisa ditimpa tanpa mengedit berkas: `BATCH_DEV_MB=1024 npm run dev`
- `experimental.webpackMemoryOptimizations: true` di [`next.config.mjs`](next.config.mjs). Webpack menahan dua salinan setiap string modul dan cache buffer ganda selama kompilasi. Setelah modul terbaca, salinan itu tidak pernah dipakai lagi tapi tetap tertahan sampai proses selesai
- `experimental.cpus: 2`. Opsi ini hanya kena `next build`, bukan dev server, karena `next dev` sudah dikunci ke satu worker di dalam Next.js. Dipakai dua worker karena repo ini punya 25 halaman statis dan jumlah worker yang terlalu banyak adalah salah satu sumber borosnya

#### Perbaiki

- Dev server memakai setengah dari total RAM mesin, yaitu 16 GB di mesin 32 GB, karena Next.js menaruh `max-old-space-size` sendiri kalau tidak ada yang menyetel. Sekarang batasnya 640 MB heap
- Batas 512 MB dan 576 MB dicoba lebih dulu dan keduanya mati dengan `heap out of memory`. 512 MB mati saat kompilasi `/luring` di putaran pertama, 576 MB selamat putaran pertama lalu mati di putaran kedua. 640 MB menyelesaikan dua putaran penuh tanpa kehabisan memori
- Pada 640 MB, proses server sendiri (`start-server.js`) ada di 935 MB working set, jadi masih di bawah 1 GB. Rantai spawnnya (launcher 53 MB, cli Next.js 74 MB, server 935 MB) berjumlah 1062 MB karena launcher dan cli tidak punya batas heap dan ikut menanggung sedikit
- Total rantai spawn ada di 1033 MB setelah putaran pertama dan 1194 MB setelah putaran kedua. Angka itu lebih besar dari batas heap karena kode native, buffer, dan source map hidup di luar heap. Batas heap tidak sama dengan working set
- Turun ke 576 MB tidak aman. Angka working set yang lebih rendah itu diukur pada proses yang sudah hampir mati, sedangkan batas yang terlalu rendah membuat V8 masuk mode `Ineffective mark-compacts` yang jauh lebih lambat sebelum mati

---

## [0.6.1] - 1 Oktober 2026

Audit produksi menemukan satu cacat yang menutup seluruh aplikasi. Rencana pengerjaan ada di [`docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md`](docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md).

#### Perbaiki

- Pendaftaran gagal total karena Better Auth membuat id berbentuk 32 huruf, sedangkan kolom `users.id` bertipe `uuid`. PostgreSQL menolak dengan `22P02 invalid input syntax for type uuid`, jadi `POST /api/auth/sign-up/email` selalu menjawab 422. Tidak ada yang bisa mendaftar, jadi tidak ada plan, jadi tidak ada yang bisa dicatat. Perbaikannya `advanced.database.generateId: "uuid"` di [`src/lib/auth.ts`](src/lib/auth.ts), yang memaksa pustaka itu memakai `crypto.randomUUID()`. Dipilih supaya 15 tabel tetap bertipe uuid dan tidak ada query, index, maupun parser id yang harus ditulis ulang

#### Tambah

- [`docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md`](docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md) yang mengurutkan sisa pekerjaan produksi dari P0 sampai P3, dengan syarat selesai dan alasan tiap keputusan

---

## [0.6.0] - 30 Juni 2026

Audit kepatuhan terhadap `AGENTS.md` dan `docs/` menemukan enam cacat nyata pada kode 0.5.0. Semuanya diperbaiki di rilis ini.

#### Tambah

- Halaman `/aplikasi` berisi cara memasang di Android dan di iPhone, plus apa yang berubah setelah dipasang. Halaman ini ikut disimpan Service Worker supaya tetap bisa dibuka tanpa sinyal
- Kolom `LURING` di `KodeGalat` dan statusnya 503, supaya balasan Service Worker saat jaringan putus punya kode yang bisa dikenali, bukan cuma kalimat

#### Perbaiki

- Service Worker tidak pernah didaftarkan. Berkas `public/sw.js` ada, tapi tidak ada satu baris pun di `src/` yang memanggil `navigator.serviceWorker.register`. Akibatnya seluruh rencana luring mati: halaman tidak pernah masuk cache dan rundown tidak bisa dibuka tanpa sinyal. Pendaftaran sekarang ada di `src/components/pwa.tsx` dan dipasang di `src/app/(app)/layout.tsx`
- Tulisan saat luring hilang begitu saja. `simpanKeAntrean` di `src/lib/luring.ts` tidak punya pemanggil, jadi Service Worker membalas 503 berkode `LURING` dan API client melemparnya ke layar tanpa menyimpan apa pun. Sekarang `src/lib/api-client.ts` mengenali kode `LURING` dan mengantrekan setiap permintaan selain `GET` sebelum melempar galat. `GET` sengaja tidak diantrekan karena datanya bisa dimuat ulang
- Ajakan memasang aplikasi tidak pernah tampil. `docs/01-PRD.md` bagian penerimaan memasang PWA, tapi `InstallPrompt` lama tidak dipasang di layar mana pun. Sekarang dipasang di kerangka layar, dan ditambah halaman penjelas `/aplikasi` untuk Android dan iPhone yang ikut disimpan di cache
- Pita luring tidak pernah muncul. Komponen `LuringBanner` ada tapi tidak dipasang; yang dipakai cuma pita statis. Sekarang pita dipasang di atas isi halaman dan ikut menggeser konten, bukan menutupi tombol. Ini juga memenuhi `docs/05-IA-dan-Layar.md` baris 116 yang meminta pita tipis di atas
- Kunci tema tidak cocok. Tombol tema menyimpan `pernikahan_tema` sejak sebelum diubah nama, sementara skrip di `layout.tsx` membaca `aisyah-theme`, jadi pilihan tema tidak pernah terbaca ulang setelah halaman dimuat. Kunci disatukan jadi `aisyah-theme`
- Mode gelap mengikuti sistem tidak pernah jalan. Tidak ada aturan `@media (prefers-color-scheme: dark)`, dan "Mengikuti Sistem" hanya menghapus atribut tanpa menentukan warnanya. Sekarang ada blok `prefers-color-scheme` yang mengambil alih saat tidak ada pilihan tersimpan, dan nilai `terang` ditulis jelas supaya bisa dibedakan dari "belum memilih"
- Nomor versi di layar akun ditulis tetap `1.0.0` sementara `package.json` berisi `0.1.0`. Sekarang dibaca dari `NEXT_PUBLIC_APP_VERSION` yang diisi `next.config.mjs` dari `package.json`, jadi tidak bisa lagi berbeda
- Enam kode mati dibuang: `KerangkaDaftar`, `PitaLuring`, `galatPerField`, `kodeGalat`, dan aturan CSS `.baris-kerangka` serta `.jarak-antarlist` yang tidak punya pemakai. `AGENTS.md` melarang tombol mati; kode mati punya masalah yang sama, cuma lebih sunyi

#### Keputusan

- Permintaan `GET` tidak diantrekan saat luring. Membalas data basi dari antrean akan lebih menyesatkan daripada sekadar gagal dan menyuruh muat ulang
- Halaman `/aplikasi` dibuat sebagai penjelas memasang, bukan dijadikan bagian layar akun. Layar akun sudah panjang dan orang yang butuh panduan memasang biasanya sedang mencari di luar aplikasi, sering dari tautan

---

## [0.5.0] - 30 Juni 2026

#### Tambah

- Implementasi penuh 17 layar aplikasi Next.js sesuai spesifikasi Wireframe 12a sampai 12e
- Tiga puluh tiga endpoint REST API di bawah `/api/plans/:planId/*` dengan validasi Zod dan filter planId
- Skema PostgreSQL 17 dengan 15 tabel relasional dan migrasi Drizzle ORM
- Autentikasi email dan kata sandi menggunakan Better Auth dengan sesi aman
- PWA luring dengan Service Worker kustom, IndexedDB untuk antrean mutasi, dan manifest
- Lembar gaya semantik murni `globals.css` dan `cetak.css` tanpa dependensi CSS utilitas luar
- Dukungan baca-saja publik tanpa login di `/bagikan/:token` dan `/l/:token`
- Teks WhatsApp otomatis dengan tautan langsung `wa.me` dan pembagian tautan laporan
- Ekspor cadangan JSON lokal di layar akun untuk keamanan data luring

#### Perbaiki

- Pemisahan utilitas komputasi plan dari akses database server agar tidak membocorkan modul Node.js ke browser
- Penyesuaian konfigurasi path alias webpack dan Next.js 15
- Kompatibilitas TypeScript 5.8 untuk kompilasi produksi tanpa peringatan

---

## [0.4.0] - 30 Juni 2026

#### Perbaiki

- Sebelas kata yang dilarang `docs/15-Glosarium.md` bagian 7 masih dipakai di luar glosarium. Semuanya diganti: "dashboard" jadi "beranda" di `DESIGN.md` dan `docs/01-PRD.md`, "output" jadi "dokumen", "payment gateway" jadi "gerbang pembayaran", "marketplace" jadi "lokapasar", "onboarding" jadi "langkah pertama" di `docs/01-PRD.md` dan `docs/14-Naskah-Teks.md`, "planner profesional" jadi "perencana profesional", dan "approval cycle" jadi "siklus persetujuan" di `docs/11-Delivery-Plan.md`
- Pemeriksaan ulang seluruh berkas Markdown memastikan tidak ada kata lain dari daftar larangan yang tersisa. Tiga baris di `docs/14-Naskah-Teks.md` sengaja tetap memuat kata terlarang karena tugasnya memang menunjukkan penulisan yang ditolak
- Satu kalimat rusak di `DESIGN.md` bagian 1 dirapikan: "Yang varies di sini bukan seksi" jadi "Yang berubah di sini bukan bagian layar". Ini jenis kerusakan yang sama dengan sepuluh kata rusak yang diperbaiki di rilis 0.1.0, yaitu frasa Inggris yang menyisip ke kalimat Indonesia
- Dua puluh lima temuan kata Inggris yang menyisip diperiksa di semua berkas. Semuanya sah kecuali satu di `DESIGN.md`: nama produk seperti "Next.js", sintaks SQL seperti `IS NULL` dan `ON DELETE CASCADE`, nama strategi cache seperti "network first", dan contoh teks yang sengaja dikutip seperti `"No data"`. Yang bukan prosa tidak diterjemahkan

#### Keputusan

- Kosakata teknis yang tidak ada di daftar larangan glosarium dibiarkan apa adanya, termasuk "venue", "layout", "task", "endpoint", dan "offline". Glosarium adalah satu-satunya sumber yang menentukan kata mana yang diterjemahkan, dan menambah larangan di luar daftar itu berarti mengubah keputusan bahasa tanpa dasar

---

## [0.3.0] - 30 Juni 2026

#### Tambah

- Bagian "Urutan berkas yang dibuat" di `docs/11-Delivery-Plan.md`: enam berkas yang dibaca sebelum menulis kode, tujuh belas langkah pengerjaan, dan bentuk folder `src/`
- Sprint 8 untuk Laporan dan Bagikan di `docs/11-Delivery-Plan.md`. Sebelumnya laporan tidak masuk sprint mana pun
- Cakupan uji dan uji manual untuk Fase 3 di `docs/11-Delivery-Plan.md`

#### Ubah

- `docs/11-Delivery-Plan.md` naik dari 46 ke 55 hari kerja. Laporan, halaman luring, dan uji manual perangkat belum pernah dihitung sama sekali
- Sprint 8 sekarang Laporan dan Bagikan, Sprint 9 sekarang PWA dan polish. Sebelumnya hanya ada satu Sprint 8 yang mencampur keduanya dalam tiga hari
- Rencana uji per sprint ditambah baris untuk laporan di Sprint 8
- Rujukan "Sprint 8" di tabel risiko diganti jadi "Sprint 1" untuk uji iOS dan "Sprint 6" untuk uji luring
- Tahap 2 di `docs/13-Rencana-Kerja.md` naik dari 21 ke 22,5 hari supaya jumlahnya berhenti di 39 seperti tabel
- `README.md` menyebut empat puluh dua story, bukan empat puluh. Hitungannya 42
- Daftar prioritas di `docs/02d-Lainnya.md` dan `README.md` naik dari tujuh ke sembilan modul P0, karena laporan dan bagikan WhatsApp sudah ada di dokumen lain tapi belum dihitung di sini

#### Perbaiki

- Fase 2 di `docs/11-Delivery-Plan.md` tertulis 10 hari padahal isinya 19 hari. Angkanya yang diperbaiki, bukan sprintnya yang dipotong
- Enam kata rusak di `docs/11-Delivery-Plan.md`: "Mokra" jadi "Cakupan", "Java" jadi "Jawa", "Documen" jadi "Dokumen", "sizable" jadi "besar", "delimiter" jadi "pembatas", "Una" jadi "Sebuah"
- Judul "Test plan per sprint" diganti jadi "Rencana uji per sprint", dan "R rundown" jadi "Rundown"
- `docs/15-Glosarium.md` kehilangan rujukan ke nama yang tidak pernah ada di dokumen lain
- `docs/04-API-Contract.md` judul kolom "Cupo" jadi "Kegunaan"
- Baris backlog "Ekspor ke PDF" diganti jadi "Ekspor ke Excel", karena PDF justru fitur Fase 1 dan tidak mungkin ditunda
- Label "Barcode undangan" diganti jadi "Kode undangan", karena barcode di dokumen ini tidak pernah didefinisikan

#### Keputusan

- Dokumen yang lengkap dianggap selesai, dan penambahan berikutnya hanya boleh dari temuan saat kode ditulis
- Urutan berkas ditulis di `docs/11-Delivery-Plan.md`, bukan di berkas baru, supaya tidak ada dokumen ketiga yang mengulang rencana yang sama
- Angka hari kerja dibiarkan beda antara dokumen epik dan dokumen sprint, dan bedanya dijelaskan di ketiganya. Menyamakan angkanya berarti salah satu dokumen harus mengarang pekerjaan yang tidak ada

---

## [0.2.0] - 30 Juni 2026

#### Tambah

- `docs/16-Laporan-dan-Bagikan.md` untuk tiga fitur baru: halaman laporan keadaan, bagikan ke WhatsApp dalam bentuk chat, dan cetak PDF
- `docs/12a-Wireframe-Inti.md` sampai `docs/12e-Wireframe-Laporan.md`, pemecahan wireframe jadi lima berkas supaya tiap berkas bisa dibaca sendiri
- Bagian Laporan di `docs/12e-Wireframe-Laporan.md`: halaman laporan untuk HP dan laptop, tiga langkah bagikan ke WhatsApp, tombol cetak, dan tiga halaman hasil cetak
- Story E6.6 sampai E6.9 di `docs/10-Epik-dan-Story.md` untuk laporan, bagikan WhatsApp, cetak PDF, dan tautan yang bisa dimatikan
- Empat endpoint `/report` di `docs/04-API-Contract.md`. Semua angka dihitung ulang di server, tidak pernah diambil dari client
- Bagian 14 sampai 18 di `docs/14-Naskah-Teks.md` untuk judul halaman laporan, teks di layar laporan, teks yang dikirim ke WhatsApp, teks di layar cetak, dan yang sengaja tidak ditulis
- Bagian Laporan di `docs/05-IA-dan-Layar.md`, satu cabang baru di peta halaman
- Tautan bagikan memakai mekanisme yang sudah ada. Tidak ada tabel baru dan tidak ada masa berlaku tautan

#### Ubah

- `docs/12-Wireframe.md` jadi indeks, bukan isi wireframe. Sekarang isinya notasi, lima tampilan wajib, aturan lintas layar, dan alasan kenapa berkas ini dipecah lima
- Subjudul E6 di `docs/10-Epik-dan-Story.md` ditambah laporan
- `docs/06-Stack-dan-Batas.md` mencatat bahwa pustaka PDF ditolak, karena lima pertanyaannya dijawab "bisa"

#### Keputusan

- PDF dibuat dengan dialog cetak bawaan dan CSS `@media print`, tanpa pustaka. Lima pertanyaannya dijawab "bisa", dan jawaban "bisa" berarti tidak ada pustaka
- Server menyusun teks WhatsApp, bukan client, supaya angka yang dikirim tidak bisa diubah dari sisi client
- Isi bagikan ada tiga pilihan: ringkas, lengkap, dan tautan. Nama tombol menyebut panjangnya, bukan gayanya
- Tautan bagikan milik plan dan tidak punya masa berlaku. Yang bisa mencabut tautan sudah punya akses ke plan itu
- Tidak ada endpoint PDF dan tidak ada endpoint kirim WhatsApp. Browser yang mengubah dialog cetak menjadi PDF, dan yang membuka WhatsApp adalah aplikasi WhatsApp
- Teks bagikan boleh diedit, tapi ada satu baris pengingat bahwa angka dan tanggal sudah dikunci
- Tidak ada grafik, tidak ada emoji, dan tidak ada warna tambahan di laporan. Grafik tidak terbaca saat dicetak hitam putih, dan warna sudah dipakai sebagai penanda

---

## [0.1.0] - 30 September 2026

#### Perbaiki

- Dua rujukan ke `docs/07-NFR.md` di `DESIGN.md` dan `docs/01-PRD.md` menunjuk ke `docs/08-NFR.md`, karena NFR ada di nomor delapan
- Salah ketik di README pada bagian alasan pemilihan stack diperbaiki
- Sepuluh kata rusak di delapan dokumen diperbaiki, termasuk "rencanaTIA" di `03-Data-Model.md` dan "intiPlanning" di `02c-Hari-H.md`. Semuanya kata Indonesia yang disisipi fragmen asing
- Bagian 10 dan 11 di `docs/14-Naskah-Teks.md` ditulis ulang karena tabelnya sempat kehilangan judul kolom

#### Tambah

- `DESIGN.md` untuk sistem desain: warna, tipografi, bentuk, nada bahasa, dan keputusan tentang apa yang tidak dipakai
- `docs/01-PRD.md` untuk masalah, persona, scope, use case, metrik, dan syarat penerimaan
- `docs/02-Domain-Spec.md` sebagai indeks, plus `02a` sampai `02d` untuk tiga belas modul dalam empat kelompok
- `docs/03-Data-Model.md` untuk sebelas tabel PostgreSQL dalam sintaks Drizzle
- `docs/04-API-Contract.md` untuk kontrak endpoint REST, bentuk error, dan aturan sinkron
- `docs/05-IA-dan-Layar.md` untuk breakpoint, navigasi, dan spesifikasi tiap layar
- `docs/06-Stack-dan-Batas.md` untuk pilihan teknologi dan enam belas teknologi yang ditolak
- `docs/07-PWA.md` untuk manifest, strategi cache, antrean luring, dan penanganan konflik
- `docs/08-NFR.md` untuk performa, aksesibilitas, keamanan, privasi, kompatibilitas, dan observability
- `docs/09-Pustaka-Prompt.md` untuk pustaka prompt per peran
- `docs/10-Epik-dan-Story.md` untuk epik dan story yang bisa langsung dikerjakan
- `docs/11-Delivery-Plan.md` untuk fase, sprint, risiko, definisi selesai, dan backlog tertunda
- `docs/12-Wireframe.md` untuk wireframe ASCII semua layar utama
- `docs/13-Rencana-Kerja.md` untuk rencana kerja ringkas dalam bahasa sehari-hari
- `docs/14-Naskah-Teks.md` untuk semua teks yang muncul di aplikasi: nama tombol, judul layar, navigasi, status, pesan galat, dialog, dan placeholder
- `docs/15-Glosarium.md` untuk kamus istilah, termasuk nama kolom di data model dan pasangan istilah yang sering tertukar
- `AGENTS.md` untuk aturan kerja bersama, daftar periksa sebelum kirim, dan referensi dokumen
- `CHANGELOG.md` untuk berkas ini
- README diperbarui dengan dokumen baru

#### Keputusan

- Nama produk memakai "Aisyah & Bagas" sebagai placeholder karena nama akhir belum ada
- Format BMAD dipakai untuk epik dan story, tapi tanpa istilah scrum, karena cara baca yang lebih ringan lebih cocok untuk dokumen berbahasa Indonesia
- Fase 1 gratis, tanpa logika paywall, karena belum ada pengguna sungguhan untuk diuji
- Marketplace vendor dan payment gateway dikeluarkan dari Fase 1 karena keduanya adalah produk terpisah dengan masalah jadwal dan izin yang berbeda
- Tujuh modul P0 menjadi batas minimum selesai

#### Belum ada

- Kode aplikasi
- Angka hasil pengukuran, karena belum ada aplikasi untuk diukur
- Harga dan model bisnis
