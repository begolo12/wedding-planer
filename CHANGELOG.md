# Changelog

Semua perubahan besar pada dokumen dan kode dicatat di sini.

Formatnya mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/). Versi mengikuti [SemVer](https://semver.org/lang/id/).

Belum ada rilis sungguhan. Semua entri di bawah ini masih dokumen, belum ada kode.

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

## Belum ada rilis

Rilis pertama menunggu kode aplikasi selesai.

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
