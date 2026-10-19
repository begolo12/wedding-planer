# 22. Rencana Uji dan UAT

Dokumen ini menjawab satu pertanyaan: bagaimana dibuktikan bahwa yang dijanjikan dokumen lain benar-benar jalan, dan siapa yang menyatakan hasilnya diterima.

Isinya empat keluaran: Test Plan, Test Case, Laporan Bug, dan UAT Sign-off. Tiga yang pertama sudah punya bahan di repo ini dan di sini dirapikan jadi satu tempat. Yang keempat belum bisa dikerjakan, dan alasannya ditulis di bagian 5.

Aturan kerja tetap dari [`AGENTS.md`](../AGENTS.md). Angka di dokumen ini diambil dari berkas yang bisa dibuka, bukan dari perkiraan.

---

## 1. Status keempat keluaran

| Keluaran | Status | Bahan yang sudah ada | Yang kurang |
|---|---|---|---|
| Test Plan | Sebagian | [`18-Rencana-Produksi-dan-Pemakaian-Harian.md`](18-Rencana-Produksi-dan-Pemakaian-Harian.md) bagian 9 | Lingkup, lingkungan, kriteria masuk dan keluar, daftar risiko |
| Test Case | Sebagian | 162 test Vitest di 18 berkas, 17 test Playwright di 8 spec | Kode kasus, keterkaitan ke 42 story, kasus manual |
| Laporan Bug | Ada | [`19-Rencana-Perbaikan-Audit.md`](19-Rencana-Perbaikan-Audit.md), 13 temuan; [`20-Hasil-Audit-Menyeluruh.md`](20-Hasil-Audit-Menyeluruh.md) | Status per temuan, commit perbaikan, uji regresi per temuan |
| UAT Sign-off | Belum ada | Belum ada | Semua, dan tidak bisa diisi jujur sebelum ada pengguna sungguhan |

Alasannya dipisah begitu karena tiga yang pertama bisa dikerjakan sendiri oleh tim, sedangkan yang keempat butuh orang di luar tim.

---

## 2. Test Plan

### 2.1 Lingkup

Yang diuji adalah Fase 1, yaitu 42 story di [`10-Epik-dan-Story.md`](10-Epik-dan-Story.md), 21 layar di [`17-Rencana-Build.md`](17-Rencana-Build.md) bagian 6, dan 34 endpoint produk di [`04-API-Contract.md`](04-API-Contract.md).

Yang tidak diuji, karena memang tidak dibangun:

| Tidak diuji | Alasan |
|---|---|
| Unggah bukti transfer | Tidak ada handler, tidak ada object storage. Tercatat di [`17-Rencana-Build.md`](17-Rencana-Build.md) bagian 11 |
| Verifikasi surel dan lupa kata sandi | Butuh penyedia surel. P2 di [`18`](18-Rencana-Produksi-dan-Pemakaian-Harian.md) bagian 11 |
| Gerbang pembayaran | `qris` hanya label metode, tidak ada uang yang berpindah |
| Pengiriman undangan | Tautan disimpan dan ditandai terkirim secara manual |

### 2.2 Lingkungan uji

| Lingkungan | Dipakai untuk | Database | Catatan |
|---|---|---|---|
| Lokal | Pengembangan dan uji manual | `DATABASE_URL` pengembangan | Jangan dipakai untuk uji yang butuh data bersih |
| Lokal dengan `TEST_DATABASE_URL` | Uji integrasi dan uji ujung ke ujung | Database uji terpisah | **Belum ada nilainya di `.env` maupun `.env.local`** |
| Produksi | Pemeriksaan asap setelah deploy | Database produksi | `GET /api/kesehatan` menjawab 200 |

Keterbatasan yang harus ditulis jujur: selama `TEST_DATABASE_URL` kosong, `tests/setup.ts` memakai `DATABASE_URL` apa adanya. Test membuat lalu menghapus datanya sendiri, tetapi hasilnya tidak terisolasi penuh. Ini sudah tercatat di [`18`](18-Rencana-Produksi-dan-Pemakaian-Harian.md) bagian 15, story 8.

### 2.3 Jenis uji dan alat

| Jenis | Alat | Cakupan sekarang | Berkas |
|---|---|---|---|
| Unit | Vitest | 149 test | `tests/unit/` |
| Integrasi | Vitest, menyentuh database | 13 test | `tests/integration/` |
| Ujung ke ujung | Playwright, Chromium | 17 test | `e2e/` |
| Tipe | `tsc --noEmit` | Seluruh `src` | `npm run lint` |
| Build | `next build` | 26 halaman dan route | `npm run build` |
| Keamanan dependensi | `npm audit` | 7 kerentanan, 2 tinggi | Belum masuk gerbang |
| Aksesibilitas | Manual | Belum diukur | Belum ada alat |

### 2.4 Kriteria masuk

Sebuah uji boleh dijalankan kalau semua ini benar:

- `npm run build` sukses
- `npm run lint` tanpa galat
- Migrasi sudah dijalankan di database yang dipakai uji
- Variabel lingkungan yang dibutuhkan terisi

### 2.5 Kriteria keluar

Rilis boleh dikirim kalau semua ini benar:

| Kriteria | Ambang | Cara membuktikan |
|---|---|---|
| Test otomatis | Semua hijau | `npm test` dan `npm run test:e2e` |
| Build | Sukses tanpa galat | `npm run build` |
| Tipe | Nol galat | `npm run lint` |
| Cacat berat | Nol terbuka | Laporan bug di bagian 4 |
| Cacat sedang | Nol terbuka, kecuali ada keputusan tertulis | Laporan bug |
| Daftar periksa kirim | Semua tercentang | `AGENTS.md` bagian 8 |
| Aksesibilitas | Kontras dan target sentuh terukur | Belum ada alat, masih manual |
| Dependensi | Tidak ada kerentanan tinggi | `npm audit --audit-level=high` |

Ambang "nol cacat berat" dipilih karena satu-satunya cacat berat yang pernah ada di repo ini, tautan publik yang membocorkan laporan penuh, membuat data keuangan bocor ke siapa pun yang memegang tautan. Cacat seperti itu tidak bisa diterima sebagai "diketahui".

### 2.6 Risiko

| Risiko | Dampak | Pengurangan |
|---|---|---|
| Dua proses menulis `.next` bersamaan | Server produksi membalas 500 `ENOENT required-server-files.json` | Jangan jalankan `next start` bersamaan dengan `npm run test:e2e`. Sudah diperingatkan di `playwright.config.ts` |
| Database uji tidak terpisah | Data pengembangan tercampur data uji | Isi `TEST_DATABASE_URL` |
| Test bergantung waktu | Hasil berbeda di zona waktu lain | `tests/unit/zona-waktu.test.ts` dan `e2e/zona-dan-tenggat.spec.ts` mengunci ini |
| Dev server kehabisan memori saat audit berjalan | Halaman balas 500 sesaat dengan `SyntaxError: Unexpected end of JSON input`, lalu server restart sendiri. Bukan cacat aplikasi | Jalankan dev server dengan `BATCH_DEV_MB=4096` saat mengaudit banyak layar. Terukur 2026-10-19: `/laporan` dibuka tiga kali berturut-turut setelah itu, 200 dalam 2,3 sampai 3,5 detik, nol galat konsol |
| Batas laju hilang saat restart | Batas tidak berlaku sesaat setelah deploy | Diterima, satu instance. Tercatat di `docs/18` bagian 7 |
| 13 layar tanpa uji bersesi | Regresi di layar itu tidak tertangkap | Uji manual sebelum kirim, lalu tambah e2e |

---

## 3. Test Case

### 3.1 Aturan penomoran

Satu kasus satu kode. Kodenya menyebut epik, bukan berkas, supaya bisa dilacak ke [`10-Epik-dan-Story.md`](10-Epik-dan-Story.md).

```text
TC-<epik>-<nomor>    contoh: TC-E4-03
```

Untuk kasus otomatis, nama test di berkas adalah nama kasusnya. Tidak ada nama kedua yang ditulis ulang di sini, karena dua nama untuk satu hal akan melenceng.

### 3.2 Cakupan per epik

| Epik | Story | Berkas penguji | Status cakupan |
|---|---|---|---|
| E1 Pondasi | 5 | Tidak ada berkas khusus | Diverifikasi lewat build dan `tsc`, tidak ada kasus tersendiri |
| E2 Identitas | 4 | `e2e/alur-utama.spec.ts`, `e2e/hapus-akun.spec.ts` | E2.3 verifikasi email tidak dibangun |
| E3 Rencana | 6 | `tests/unit/plan.test.ts`, `format.test.ts`, `skema.test.ts`, `e2e/alur-utama.spec.ts`, `e2e/zona-dan-tenggat.spec.ts` | Lengkap |
| E4 Vendor dan pembayaran | 5 | `tests/integration/agregat-uang.test.ts`, `e2e/alur-utama.spec.ts`, `e2e/batas-laju-plans.spec.ts` | Lengkap |
| E5 Tamu | 3 | `tests/unit/tamu.test.ts`, `impor-tamu.test.ts`, `e2e/tamu-dan-ekspor.spec.ts` | Lengkap |
| E6 Hari-H | 9 | `tests/unit/teks-wa.test.ts`, `tests/integration/laporan.test.ts`, `e2e/kontrak-share-text.spec.ts` | **Rundown, seragam, dan info keluarga tanpa uji bersesi** |
| E7 PWA | 5 | `tests/unit/cache-baca.test.ts`, `status-luring.test.ts`, `antrean-luring.test.ts`, `api-client-luring.test.ts`, `e2e/alur-luring.spec.ts` | E7.3 prompt install dan E7.4 peringatan versi tanpa kasus |
| E8 Kualitas | 5 | `tests/integration/kepemilikan-plan.test.ts`, `e2e/tampilan.spec.ts`, `e2e/zona-dan-tenggat.spec.ts` | E8.1 performa dan E8.2 aksesibilitas belum diukur |

Jumlah test yang benar-benar berjalan: 149 unit, 13 integrasi, 17 ujung ke ujung. Angka itu dibaca dari keluaran Vitest dan Playwright, bukan dihitung dari nama berkas.

### 3.3 Kasus ujung ke ujung

| Kode | Kasus | Story | Berkas |
|---|---|---|---|
| TC-E2-01 | Daftar sampai ringkasan berjalan tanpa langkah yang diam-diam gagal | E2.1, E2.2, E2.4, E3, E4 | `e2e/alur-utama.spec.ts` |
| TC-E2-02 | Hapus akun sendiri mematikan sesi dan menghapus baris user | E8.5 | `e2e/hapus-akun.spec.ts` |
| TC-E4-01 | Batas laju `POST /api/plans`: 30 kali 422 lalu ke-31 429 | E4, E8.3 | `e2e/batas-laju-plans.spec.ts` |
| TC-E5-01 | Rekap porsi dan kursi, saring sisi dan undangan, tandai undangan borongan | E5.1, E5.3 | `e2e/tamu-dan-ekspor.spec.ts` |
| TC-E5-02 | Tautan undangan acara, qris, administrasi, dan ekspor data pribadi | E5.1, E8.5 | `e2e/tamu-dan-ekspor.spec.ts` |
| TC-E6-01 | Bagikan teks memakai `variant` dan menolak nama lama | E6.7 | `e2e/kontrak-share-text.spec.ts` |
| TC-E7-01 | Tiga perubahan luring masuk antrean lalu terkirim dengan urutan benar | E7.2 | `e2e/alur-luring.spec.ts` |
| TC-E8-01 | Layar masuk mobile tidak melebar dan fokus keyboard terlihat | E8.2 | `e2e/tampilan.spec.ts` |
| TC-E8-02 | Layar masuk desktop tetap di dalam viewport | E8.2 | `e2e/tampilan.spec.ts` |
| TC-E8-03 | Kontrol tema punya ikon dan state kosong punya aksi | E8.2 | `e2e/tampilan.spec.ts` |
| TC-E8-04 | Hierarki auth bertahan di mobile dan desktop, tombol minimal 44px | E8.2 | `e2e/tampilan.spec.ts` |
| TC-E8-05 | Layar publik dan luring tetap punya aksi yang berguna | E7.5, E8.2 | `e2e/tampilan.spec.ts` |
| TC-E8-06 | Layar sistem dan kebijakan tetap terbaca di mobile | E8.2 | `e2e/tampilan.spec.ts` |
| TC-E8-07 | Hitung mundur dan lewat tenggat sama di zona proses mana pun | E3.1, E8.1 | `e2e/zona-dan-tenggat.spec.ts` |
| TC-E8-08 | Nomor WhatsApp disimpan sebagai 628xx, yang salah ditolak 422 | E5.1 | `e2e/zona-dan-tenggat.spec.ts` |

### 3.4 Kasus integrasi

| Kode | Kasus | Story | Berkas |
|---|---|---|---|
| TC-E8-09 | Plan milik orang lain dibalas FORBIDDEN, bukan NOT_FOUND | E8.3 | `tests/integration/kepemilikan-plan.test.ts` |
| TC-E8-10 | Jawaban FORBIDDEN tidak membocorkan data plan | E8.3 | sama |
| TC-E8-11 | Id yang bukan uuid dibalas NOT_FOUND, bukan 500 | E8.3 | sama |
| TC-E4-02 | Total pembayaran di atas batas `int4` kembali sebagai angka yang benar | E4.2, E4.3 | `tests/integration/agregat-uang.test.ts` |
| TC-E6-02 | Laporan tersusun dari data plan yang sama dengan layar | E6.6 | `tests/integration/laporan.test.ts` |

### 3.5 Kasus manual

Kasus yang belum bisa diotomatiskan, dan harus dijalankan sebelum kirim:

| Kode | Kasus | Cara |
|---|---|---|
| TC-E8-12 | Kontras teks minimal 4.5:1 di mode terang dan gelap | Ukur dengan alat, catat hasilnya |
| TC-E8-13 | Seluruh alur bisa diselesaikan dengan keyboard saja | Jalankan tanpa tetikus |
| TC-E8-14 | Mode gelap terbaca di setiap layar | Buka semua layar, periksa dengan mata |
| TC-E6-03 | Rundown terbuka tanpa sinyal di lokasi | Matikan jaringan, buka `/hari-h` |
| TC-E8-15 | Tidak ada geser horizontal di lebar 360px | Buka semua layar di 360px |
| TC-E6-04 | Cetak PDF menghasilkan halaman yang terbaca | Dialog cetak, simpan PDF, periksa |

---

## 4. Laporan Bug

### 4.1 Kolom wajib

Setiap temuan ditulis dengan kolom ini. [`19-Rencana-Perbaikan-Audit.md`](19-Rencana-Perbaikan-Audit.md) sudah memakai bentuk yang sama untuk bukti, dampak, perbaikan, dan pemeriksaan.

| Kolom | Isi |
|---|---|
| ID | `BUG-<tahun>-<nomor>`, contoh `BUG-2026-014` |
| Tanggal | `2026-10-05` |
| Pelapor | Nama atau peran |
| Lingkungan | Lokal, produksi, atau nama commit |
| Tingkat | Berat, sedang, ringan |
| Langkah reproduksi | Bernomor, dari keadaan awal |
| Hasil yang diharapkan | Satu kalimat |
| Hasil nyata | Satu kalimat, plus keluaran yang benar-benar terlihat |
| Bukti | Perintah, tangkapan layar, atau potongan jawaban |
| Akar masalah | Berkas dan baris, kalau sudah diketahui |
| Perbaikan | Apa yang diubah |
| Uji regresi | Kode kasus yang mencegahnya terulang |
| Status | Baru, dikerjakan, selesai, ditolak dengan alasan |

### 4.2 Tingkat

| Tingkat | Arti | Contoh dari repo ini |
|---|---|---|
| Berat | Data hilang, bocor, atau aplikasi tidak bisa dipakai | Tautan publik membocorkan laporan penuh (`docs/19` temuan 1) |
| Sedang | Fitur utama salah, ada jalan pintas | Batas uang Zod melebihi kapasitas kolom, hasilnya 500 bukan 422 (`docs/19` temuan 4) |
| Ringan | Tampilan atau teks salah, tidak menghalangi | Kelas CSS yang tidak pernah didefinisikan (`docs/19` temuan 9) |

### 4.3 Kekurangan laporan yang ada

| Kekurangan | Akibat |
|---|---|
| Status hanya ditulis borongan ("13 temuan selesai") | Tidak bisa tahu temuan mana yang benar-benar selesai tanpa membaca `CHANGELOG` |
| Tidak ada commit perbaikan per temuan | Sulit menelusuri kapan dan oleh perubahan apa |
| Tidak ada kode uji regresi per temuan | Tidak ada bukti bahwa temuan yang sama tidak kembali |

Ketiganya bisa ditutup tanpa alat baru, hanya dengan menambah kolom di `docs/19`.

---

## 5. UAT Sign-off

### 5.1 Arti

UAT bukan uji teknis. UAT adalah pernyataan orang yang akan memakai aplikasi bahwa aplikasi menyelesaikan pekerjaan mereka. Karena itu pesertanya bukan pengembang, dan tandatangannya tidak bisa diganti oleh test yang hijau.

### 5.2 Prasyarat

| Prasyarat | Status sekarang |
|---|---|
| Build produksi terpasang di alamat tetap | Sudah, `https://wedding-planer-self.vercel.app` |
| Database terpisah untuk UAT | Belum. `TEST_DATABASE_URL` kosong |
| Peserta dari luar tim | Belum ada |
| Skenario tertulis | Bagian 5.3 |
| Formulir tanda tangan | Bagian 5.4 |

### 5.3 Skenario

Delapan skenario, dipilih dari tiga janji produk di `AGENTS.md` bagian 1.

| Kode | Skenario | Janji yang diuji |
|---|---|---|
| UAT-01 | Buat rencana, isi tanggal pernikahan, lihat hitung mundur | Plans terbaca dalam sepuluh detik |
| UAT-02 | Catat tiga pembayaran vendor, lalu periksa totalnya | Catatan pembayaran tidak tercecer |
| UAT-03 | Tempel 50 nama tamu dari teks, periksa porsi dan kursi | Daftar tamu bisa masuk tanpa mengetik satu per satu |
| UAT-04 | Susun rundown dari template adat, ubah satu baris | Rundown bisa disusun tanpa mulai dari nol |
| UAT-05 | Buka rundown dengan jaringan dimatikan | Rundown bisa dibuka di lokasi |
| UAT-06 | Bagikan laporan ke WhatsApp, lalu buka tautannya tanpa login | Laporan bisa dikirim ke keluarga |
| UAT-07 | Cetak laporan jadi PDF | Laporan bisa dibawa ke vendor |
| UAT-08 | Pakai aplikasi dari HP selama satu hari penuh | Halaman mobile sempurna, tanpa geser horizontal |

### 5.4 Formulir

| Kolom | Isi |
|---|---|
| Nama peserta | |
| Peran | Pengantin, keluarga, atau vendor |
| Tanggal | |
| Skenario yang dijalankan | UAT-01 sampai UAT-08 |
| Hasil per skenario | Lulus atau gagal, plus catatan |
| Cacat yang ditemukan | ID laporan bug |
| Keputusan | Diterima, diterima dengan catatan, atau ditolak |
| Tanda tangan | |

### 5.5 Status

**Belum bisa dikerjakan.** [`README.md`](../README.md) menulis bahwa aplikasi sudah ada tetapi belum dipakai pengguna sungguhan. Menandatangani UAT tanpa peserta sungguhan berarti mengarang bukti, dan itu dilarang `AGENTS.md` bagian 3 butir 5.

Yang bisa dikerjakan sekarang tanpa mengarang: menyiapkan lingkungan UAT terpisah, menulis delapan skenario di atas sebagai daftar periksa, lalu menunggu peserta.

---

## 6. Yang belum dikerjakan dan alasannya

| Belum | Alasan | Yang dibutuhkan |
|---|---|---|
| CI yang menjalankan seluruh gerbang | Semua uji dijalankan manual | Satu workflow, nol dependensi baru |
| `TEST_DATABASE_URL` | Belum ada database uji | Satu database terpisah dan satu baris di `.env` |
| Uji aksesibilitas otomatis | Tidak ada alat | `@axe-core/playwright`, satu dependensi dev |
| Ambang cakupan | `vitest.config.mts` tanpa `coverage` | Konfigurasi cakupan dan ambang |
| Uji beban berulang | Baru dijalankan sekali, 500 permintaan | Skenario beban dengan durasi |
| UAT | Belum ada pengguna sungguhan | Peserta dari luar tim |
