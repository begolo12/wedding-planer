# 08. Syarat Non-Fungsional

Dokumen ini berisi batas yang harus dipenuhi tanpa perlu user mengetahuinya. Kalau salah satu gagal, itu bug, bukan fitur yang belum selesai.

---

## Performa

| Metrik | Target | Cara ukur |
|---|---|---|
| Lighthouse Performance, mobile | Minimal 90 | Lighthouse 12, mode mobile, koneksi simulasi 3G |
| LCP | Di bawah 2,5 detik | Field data, koneksi 3G |
| INP | Di bawah 200 milidetik | Field data |
| CLS | Di bawah 0,1 | Field data |
| TTFB | Di bawah 800 milidetik | Server region Jakarta |
| Waktu buka aplikasi setelah install | Di bawah 2 detik | Cache service worker aktif |

Angka di atas mengikuti standar Core Web Vitals dari Google. Yang dipakai di sini adalah batas minimum yang umum, bukan rekor yang harus dipecahkan.

### Yang harus diukur

Lighthouse dijalankan untuk setiap halaman utama, bukan hanya untuk Beranda. Daftar tugas dan daftar tamu punya cara berbeda untuk memuat data, jadi bisa punya biaya yang berbeda.

Field data dikirim dari browser kalau ada cukup banyak penggunanya. Kalau belum ada, Lighthouse yang dipakai.

**Angka di atas tidak boleh diklaim tanpa hasil pengukuran nyata.** Kalau belum diukur, tulis "belum diukur" di dokumen ini.

---

## Keandalan

| Syarat | Target | Alasan |
|---|---|---|
| Ketersediaan | 99,5 persen per bulan | Pernikahannya satu kali, jadi memilih hari yang salah akan sangat merusak |
| Waktu pemulihan | Di bawah 1 jam | Provider VPS biasa |
| Backup database | Setiap hari, retensi 14 hari | Data plan tidak bisa hilang |
| Restore diuji | Setiap bulan | Backup yang belum pernah diuji bukan backup |
| Error monitoring | Error rate di bawah 1 persen | application session |

Application ini bukan sistem pembayaran, jadi tidak butuh SLA 99,99 persen. Yang penting data tidak hilang dan aplikasi tetap bisa dibuka saat DATABASE bermasalah.

---

## Aksesibilitas

Target: WCAG 2.1 level AA.

| Kriteria | Implementasi |
|---|---|
| 1.1.1 Konten non-teks | Semua ikon punya `aria-label`, dekorasi punya `aria-hidden` |
| 1.3.1 Info dan hubungan | Heading berurutan, label terhubung ke input |
| 1.4.3 Kontras minimum | Rasio minimal 4,5:1 untuk teks biasa, 3:1 untuk teks besar |
| 1.4.4 Resize teks | 200 persen tanpa kehilangan konten |
| 2.1.1 Keyboard | Semua fungsi tersedia lewat keyboard |
| 2.1.2 Tidak ada keyboard trap | Tidak ada fokus yang terkunci tanpa jalan keluar |
| 2.4.1 Lewati blok | Skip link ke konten utama |
| 2.4.7 Focus terlihat | Outline minimal 2px, kontras minimal 3:1 |
| 2.5.5 Ukuran target | Minimal 44x44px |
| 3.3.2 Label atau instruksi | Setiap input punya label yang jelas |
| 4.1.2 Nama, peran, nilai | Komponen interaktif punya nama aksesibel |

### Warna bukan satu-satunya penanda

Kategori tamu, status pembayaran, dan status tugas punya warna, tapi juga punya label teks atau bentuk ikon yang berbeda. Alasannya, sekitar 1 dari 12 pria dan 1 dari 200 wanita punya masalah penglihatan warna, dan tidak ada dari mereka yang bisa melihat plan mereka sendiri.

### Mode gelap bukan tambahan belakangan

Semua warna punya pasangan dark, bukan sekadar dibalik. Warna accent di dark mode dinaikkan sedikit supaya tetap terbaca di latar gelap. Hasilnya harus diuji per halaman, bukan diasumsikan.

---

## Keamanan

### Autentikasi

| Aspek | Implementasi |
|---|---|
| Password | Hash dengan scrypt (default Better Auth) |
| Sesi | Cookie httpOnly, sameSite lax, secure di produksi |
| Sesi kedaluwarsa | 30 hari |
| Verifikasi email | Tidak dibangun di Fase 1, masuk P2 |
| Reset password | Tidak dibangun di Fase 1, masuk P2 |

Verifikasi email dan reset password butuh penyedia surel. Itu keputusan lima pertanyaan dari `06-Stack-dan-Batas.md`, dan belum ada masalah nyata yang menyalakannya. Keputusan dan alasannya ada di `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 11, dan dokumen ini mengikuti keputusan itu supaya tidak ada dua janji yang berbeda.

### Otorisasi

Semua query wajib punya dua pemeriksaan:

1. Plan dengan `planId` itu milik user yang sedang login
2. Data dengan `id` itu milik plan tersebut

Pemeriksaan satu tanpa yang lain membuka celah. Data diambil berdasarkan `id` saja berarti pasangan bisa mengedit data pasangan lain kalau tahu `id`-nya.

### Unggah file

Tidak dibangun di Fase 1. `proofImageKey` ada di skema `payments`, tapi tidak ada handler unggah, tidak ada object storage, dan tidak ada halaman yang mengirim file. Ini sudah dicatat sebagai belum dibangun di `17-Rencana-Build.md` bagian 11, dan dipindahkan ke sana sebagai ganti janji di dokumen ini.

| Aspek | Aturan | Alasan belum dibangun |
|---|---|---|
| Ukuran maksimum | 5MB kalau nanti dibangun | Butuh object storage, dan itu menambah vendor baru |
| Format | Hanya `image/jpeg` dan `image/png` | Validasi isi file butuh pustaka atau inspeksi manual |
| Nama file | Di-generate ulang, nama asli tidak dipakai | Tidak ada berkas yang disimpan, jadi belum berlaku |
| Penyimpanan | Nama acak di object storage, bukan di path asli | Object storage belum dipilih |
| Konten | Divalidasi dari isi file, bukan dari header | Butuh inspeksi isi berkas, masuk Fase 3 |

Bukti pembayaran diinput sebagai nama berkas, bukan dari kamera. Keputusan ini tertulis di `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 8.

### Rate limit

Batas yang berlaku ada di `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 7. Dokumen ini tidak mengulang angkanya sebagai sumber kedua, supaya tidak ada dua daftar batas yang berbeda. Empat endpoint yang dibatasi:

| Endpoint | Batas |
|---|---|
| `POST /api/auth/sign-up/email` | 5 permintaan per jam per alamat IP |
| `POST /api/auth/sign-in/email` | 10 permintaan per 15 menit per alamat IP |
| `POST /api/plans` | 30 permintaan per jam per pengguna |
| `POST /api/plans/{id}/vendors/{id}/payments` | 60 permintaan per jam per pengguna |

Cara yang dipakai adalah map in memory di `globalThis`, bukan token bucket. Alasannya, satu instance belum butuh distribusi, dan map sederhana lebih mudah dipahami orang berikutnya. Keterbatasannya jujur: batas ini hilang saat proses restart dan tidak dibagi antar instance.

Batas untuk share link, API umum, dan upload dihapus dari dokumen ini. Alasannya, upload tidak dibangun di Fase 1, dan dua batas lain belum ada implementasinya. Menulis batas yang belum dipakai membuat dokumen menjanjikan yang tidak ada.

---

## Privasi

### Landasan hukum

Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, disingkat UU PDP. Persetujuan harus eksplisit dan bisa ditarik kapan saja.

### Data yang dikumpulkan

| Data | Tujuan | Persetujuan |
|---|---|---|
| Nama dan email | Login | Wajib |
| Nama pasangan, pasangan, tamu | Fungsi inti | Wajib |
| Tanggal wedding | Fungsi inti | Wajib |
| Nominal pembayaran | Fungsi inti | Wajib |

Foto bukti transfer tidak ada di daftar ini karena unggah berkas belum dibangun di Fase 1. Kolom `proofImageKey` ada di skema, tapi belum ada yang mengisinya.

Tidak ada data yang dikumpulkan untuk keperluan iklan. Tidak ada analytics pihak ketiga. Tidak ada pixel.

### Hak pengguna

| Hak | Implementasi |
|---|---|
| Akses | Semua data bisa dilihat dan diunduh dari aplikasi |
| Koreksi | Semua data bisa diubah kapan saja |
| Hapus | Hapus plan menghapus semua data turunannya |
| Ekspor | Unduh semua data sebagai JSON |
| Tarik persetujuan | Hapus akun |

Hapus akun menghapus `users` dan semua `plans` beserta turunannya. Karena cascade sudah diatur di foreign key, tidak perlu kode penghapusan manual. Satu query sudah cukup.

Halaman `/kebijakan` bisa dibuka tanpa masuk dan memuat isi bagian ini dalam bahasa sehari-hari: data yang dikumpulkan, bahwa tidak ada iklan dan pelacak pihak ketiga, hak pengguna menurut UU PDP, retensi, dan cara menghubungi pemilik produk. Halaman itu yang dirujuk oleh centang persetujuan di layar Daftar.

Kanal kontak yang dipakai halaman `/kebijakan` sekarang adalah halaman Issues repositori `github.com/begolo12/wedding-planer/issues`. Keputusan pemilik produk 4 Oktober 2026 memakai kanal yang benar-benar ada, dan ini kanal sementara sampai ada surel resmi khusus privasi. Kalau surel resmi tersedia, halaman itu dan bagian ini diperbarui.

### Retensi

Akun yang tidak aktif selama 24 bulan dihapus otomatis, dengan pengingat email 30 hari sebelumnya. Pengingat email belum ada karena surel baru masuk P2 (lihat `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 11).

**Batas ini dipilih karena satu rencana perbaikan berlangsung kurang dari satu tahun.** Akun yang masih ada setelah dua tahun kemungkinan besar sudah tidak terpakai, dan menyimpan data pribadi orang yang sudah tidak ada hubungannya selama itu tidak wajar.

### Cookie

| Cookie | Tujuan | Jenis |
|---|---|---|
| Session | Menyimpan login | Fungsional, wajib |

Pilihan tema tidak disimpan di cookie, tapi di `localStorage` dengan kunci `haribesar-tema`. Alasannya, tema hanya dibutuhkan browser dan tidak perlu dikirim ke server, jadi cookie akan menambah bobot setiap request tanpa manfaat. Skrip di `src/app/layout.tsx` membaca kunci ini sebelum React jalan supaya tidak ada kilatan warna, dan `src/components/theme-toggle.tsx` menulisnya. Kunci lama `aisyah-theme` masih dibaca sekali lalu dihapus supaya pilihan tema orang tidak hilang.

Tidak ada cookie iklan, tidak ada cookie pelacak, tidak ada pihak ketiga. Kalau ini berubah, itu perubahan kebijakan yang perlu ditulis di sini.

---

## Kompatibilitas

| Peramban | Versi minimum | Alasan |
|---|---|---|
| Chrome Android | 90 | Mayoritas pengguna Android di Indonesia |
| Chrome Desktop | 90 | |
| Safari iOS | 15 | Persentase pengguna iOS yang tidak bisa diabaikan |
| Safari macOS | 15 | |
| Samsung Internet | 15 | Banyak dipakai di Android kelas menengah |
| Firefox Desktop | 90 | |

Peramban di bawah versi minimum tetap bisa membuka aplikasi, tapi tidak dapat dipasang. Alasannya, menulis penyiasatan untuk peramban lama yang tidak terlalu banyak dipakai, tapi membuat kode utama lebih buruk.

Fitur yang wajib punya fallback: service worker, IndexedDB, dan `clamp()`. Ketiganya punya fallback, dan fallback-nya sudah ditulis, bukan baru ada saat pengujian.

---

## Pemantauan

| Yang dipantau | Alat | Alasan |
|---|---|---|
| Error server | Log ke stdout, dikirim ke aggregator log | Standar di platform hosting |
| Error client | Belum dibangun di Fase 1 | Tabel `client_errors` belum ada di skema, dan belum ada route yang menerima laporan dari browser |
| Response time | Log satu baris per request | Cukup untuk melihat regresi |
| Health check | `GET /api/kesehatan` | Tidak menyentuh database. Kalau endpoint ini ikut membaca database, satu gangguan database akan terbaca sebagai "sedang luring" di semua perangkat, walau internetnya baik |

**Sentry dan alat serupa tidak dipakai di Fase 1.** Alasannya, satu produk dengan beberapa ribu pengguna belum butuh sistem pemantauan kelas besar, dan menambah vendor berarti menambah biaya dan satu hal yang harus dipercaya.

Kalau jumlah error tidak bisa dibaca dari log biasa, itu tanda aplikasinya belum cukup jelas, bukan tanda perlu alat yang lebih besar.

Tabel `client_errors` yang dulu direncanakan (id, userId, message, stack, url, userAgent, createdAt) tidak dibuat di Fase 1. Alasannya, belum ada pelapor error di client dan belum ada kebutuhan nyata yang membenarkan satu tabel baru. Rencananya dicatat di sini supaya bentuknya tidak perlu dipikirkan ulang kalau nanti dibutuhkan.

---

## Batas yang disengaja

| Yang tidak ada | Alasan |
|---|---|
| Multi-region | Mayoritas pengguna di satu negara, satu region cukup |
| CDN untuk gambar | Gambar hanya bukti transfer, dan unggah bukti belum dibangun |
| Rate limiting terdistribusi | Satu instance, map in memory cukup |
| Auto-scaling sederhana | Traffic di hari-H memang tidak merata, jadi scaling sederhana sudah cukup |
| Multi-region backup | Backup lokal cukup, restore diuji bulanan |
| Cakupan test yang wajar | Yang penting jalur kritis, menulis test untuk setiap getter tidak ada gunanya |
| Unggah bukti transfer | Butuh object storage, dan itu vendor baru. Kolomnya sudah ada, unggahnya belum. Masuk Fase 3, lihat `17-Rencana-Build.md` bagian 11 |
| Tabel `client_errors` | Belum ada pelapor error di client. Satu tabel baru belum dibenarkan sebelum ada masalah nyata |
| Verifikasi email dan reset password | Butuh penyedia surel, dan belum ada masalah nyata yang menyalakannya. Masuk P2, lihat `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 11 |

---

## Rencana pengukuran

Apa yang harus diukur sebelum rilis, dan apa yang boleh ditunda:

| Item | Kapan | Status |
|---|---|---|
| Kontras teks, terang dan gelap | Sebelum rilis | Sudah diukur. 0 gagal, rasio terburuk 4,55 di terang dan 5,35 di gelap, diukur di 17 rute pada 390 dan 1440 px |
| Lebar 360px tanpa geser horizontal | Sebelum rilis | Sudah diukur. Tidak ada geser di 360, 390, dan 1440 px |
| Dark mode per halaman | Sebelum rilis | Sudah diukur. 0 gagal kontras di mode gelap |
| Tombol tanpa handler | Sebelum rilis | Sudah diukur. 0 di 17 rute |
| PDF laporan | Sebelum rilis | Sudah diukur. 2 halaman, target paling banyak 3 |
| Emoji di UI | Sebelum rilis | Sudah diukur. 0, sesuai `DESIGN.md` bagian 8 |
| Lighthouse semua halaman | Sebelum rilis | Belum diukur |
| LCP di 3G | Sebelum rilis | Belum diukur |
| Uji keyboard penuh | Sebelum rilis | Belum diuji |
| Uji dengan screen reader | Sebelum rilis | Belum diuji |
| Install PWA di iOS dan Android | Sebelum rilis | Belum diuji |
| Uji luring di desa bersinyal lemah | Sebelum rilis | Belum diuji |
| Uji beban | Setelah rilis | Belum diukur |
| Field data Core Web Vitals | Setelah rilis | Belum ada |

Baris yang masih "belum" memang belum diukur, dan tidak diisi perkiraan. Alasannya ada di `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 18.