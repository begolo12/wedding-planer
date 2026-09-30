# AGENTS.md

Aturan kerja untuk siapa pun yang membangun produk ini, termasuk AI agent dan orang yang cuma lewat.

Kalau ada konflik antara berkas ini dan dokumen lain, dokumen lain menang dan berkas ini diperbaiki. Aturan ini tidak pernah menimpa keputusan produk.

---

## 1. Apa produk ini

Aplikasi perencanaan pernikahan untuk pasangan di Indonesia. Dipakai di HP dan laptop, dan tetap berguna saat sinyal hilang.

Tiga hal yang harus selalu benar:

1. Plans harus bisa dibaca dalam sepuluh detik
2. Catatan pembayaran tidak boleh tercecer
3. Rundown harus bisa dibuka di lokasi

---

## 2. Urutan baca sebelum mulai

Jangan mulai menulis kode sebelum membaca ini:

| Urutan | Berkas | Untuk apa |
|---|---|---|
| 1 | [`DESIGN.md`](DESIGN.md) | Warna, bentuk, nada bahasa, dan apa yang tidak dipakai |
| 2 | [`docs/01-PRD.md`](docs/01-PRD.md) | Scope dan apa yang sengaja tidak ada |
| 3 | [`docs/03-Data-Model.md`](docs/03-Data-Model.md) | Skema database |
| 4 | [`docs/04-API-Contract.md`](docs/04-API-Contract.md) | Bentuk request dan response |
| 5 | [`docs/05-IA-dan-Layar.md`](docs/05-IA-dan-Layar.md) | Specifikasi tiap layar |
| 6 | [`docs/12-Wireframe.md`](docs/12-Wireframe.md) | Indeks wireframe dan aturan yang berlaku di semua layar |
| 7 | [`docs/14-Naskah-Teks.md`](docs/14-Naskah-Teks.md) | Semua teks yang muncul di aplikasi |
| 8 | [`docs/16-Laporan-dan-Bagikan.md`](docs/16-Laporan-dan-Bagikan.md) | Aturan laporan, bagikan ke WhatsApp, dan cetak PDF |
| 9 | [`docs/06-Stack-dan-Batas.md`](docs/06-Stack-dan-Batas.md) | Batas yang tidak boleh dilewati |
| 10 | [`docs/10-Epik-dan-Story.md`](docs/10-Epik-dan-Story.md) | Yang harus dikerjakan berikutnya |
| 11 | [`docs/13-Rencana-Kerja.md`](docs/13-Rencana-Kerja.md) | Urutan kerja versi sederhana, dan apa yang boleh dipotong kalau waktunya mepet |

---

## 3. Tujuh aturan yang tidak bisa ditawar

| # | Aturan | Kenapa |
|---|---|---|
| 1 | Jangan pakai em dash | Terlihat seperti tulisan mesin |
| 2 | Halaman mobile harus sempurna, tanpa geser horizontal | Mayoritas pengguna ada di HP |
| 3 | Target sentuh minimal 44x44px | Jempol tidak bisa klik 30px |
| 4 | Setiap keputusan teknis ditulis dengan alasannya | Keputusan tanpa alasan tidak bisa diaudit |
| 5 | Angka tidak boleh ditulis tanpa sumber nyata | Angka karangan merusak kepercayaan |
| 6 | Tombol harus punya fungsi | Tombol mati lebih buruk daripada tidak ada |
| 7 | Tampilan harus jalan dan dibangun sebelum dikirim | Dokumen yang rapi bukan hasil |

Aturan tujuh tidak boleh disimpulkan sebagai "udah kelihatan bagus". Yang dimaksud adalah hasil akhir yang benar-benar jalan, bukan yang terlihat rapi di atas kertas.

---

## 4. Aturan menulis

| Aturan | Contoh benar | Contoh salah |
|---|---|---|
| Bahasa Indonesia sehari-hari | "bayar DP dekorasi" | "menggunakan payment method" |
| Istilah Inggris yang jadi bahasa sehari-hari tetap dipakai | vendor, rundown, DP | "pemasok", "susunan acara" |
| Uang ditulis rupiah penuh | `Rp 4.500.000` | `Rp 4,5jt` |
| Tanggal di spesifikasi | `2026-06-30` | `30/06/26` |
| Tanggal di dokumen produk | `30 Juni 2026` | `2026-06-30` |
| Tanpa angka yang tidak ada sumbernya | "belum diukur" | "peningkatan 40 persen" |

---

## 5. Aturan teknis

### Batas stack

Hanya yang ada di [`docs/06-Stack-dan-Batas.md`](docs/06-Stack-dan-Batas.md). Kalau butuh sesuatu yang tidak ada di sana, jawab lima pertanyaan dulu:

1. Apakah ini cuma benar kalau kita bertahan sampai sepuluh ribu pengguna?
2. Kalau ya, apakah Phase 1 benar-benar butuh?
3. Berapa biaya pemeliharaan?
4. Kalau nanti dibuang, berapa biaya pencabutan?
5. Bisakah masalahnya diselesaikan tanpa teknologi baru?

Kalau lima pertanyaan itu tidak dijawab, jawabannya tidak.

### Database

- Setiap query wajib punya filter `planId`
- Setiap tulis wajib cek kepemilikan lebih dulu
- `userId` tidak pernah dikirim dari client
- Uang selalu integer rupiah, tidak pernah float

### API

- `PUT` tidak pernah dipakai
- Halaman yang butuh semua data untuk Beranda memakai satu endpoint `/overview`
- Response error selalu bentuk yang sama

### PWA

- Response `/api/` tidak pernah masuk cache
- Rundown harus bisa dibuka tanpa sinyal
- Antrean luring harus terkirim dalam urutan yang benar

---

## 6. Aturan tampilan

Semua dari [`DESIGN.md`](DESIGN.md). Yang paling sering dilanggar:

| Aturan | Yang terjadi kalau dilanggar |
|---|---|
| Maksimal tiga warna inti plus satu aksen | Layar jadi ramai dan tidak ada fokus |
| Sudut konsisten, tidak pernah pill | Terlihat seperti komponen yang dicampur |
| Warna tidak pernah jadi satu-satunya penanda | Penyandang gangguan penglihatan warna tidak bisa membaca |
| Dark mode adalah pasangan warna, bukan inversi | Warna teks jadi tidak terbaca |
| Setiap data punya empat tampilan: isi, kosong, memuat, gagal, luring | Ada layar yang terlihat rusak saat gagal |

---

## 7. Alur kerja

### Sebelum mulai

1. Baca `AGENTS.md` dan dokumen yang relevan
2. Lihat `CHANGELOG.md` untuk tahu apa yang sudah berubah
3. Tulis rencana kalau pekerjaan lebih dari satu hari
4. Pastikan tidak ada keputusan yang bertentangan dengan `docs/06-Stack-dan-Batas.md`

### Saat mengerjakan

1. Kerjakan satu story dari `docs/10-Epik-dan-Story.md` sampai selesai
2. Jangan menambah teknologi baru tanpa jawaban lima pertanyaan
3. Jangan menulis angka tanpa sumber
4. Kalau menemukan keputusan yang belum ada di dokumen, tulis keputusannya dan alasannya

### Sebelum mengirim

1. Jalankan build dan pastikan jalan
2. Cek daftar periksa di bagian 8
3. Tulis entri di `CHANGELOG.md`
4. Perbarui dokumen yang jadi tidak benar lagi

---

## 8. Daftar periksa sebelum kirim

Tandai yang sudah dicek. Kalau ada satu saja yang tidak bisa dipastikan, kirim belum.

### Dokumen

- [ ] Tidak ada em dash
- [ ] Tidak ada angka tanpa sumber
- [ ] Tidak ada istilah yang aneh tercampur bahasa lain
- [ ] Setiap keputusan ada alasannya
- [ ] Semua rujukan ke dokumen lain benar

### Kode

- [ ] Build jalan tanpa error
- [ ] Tidak ada tombol mati
- [ ] Semua query punya filter `planId`
- [ ] Semua tulis cek kepemilikan
- [ ] Error ditangani, tidak dibiarkan naik ke user
- [ ] Halaman mobile tidak geser horizontal

### Tampilan

- [ ] Target sentuh minimal 44x44px
- [ ] Sudut konsisten
- [ ] Warna kontras minimal 4.5:1
- [ ] Dark mode diuji, bukan hanya ada
- [ ] Tampilan kosong, memuat, gagal, dan luring ada

### Sebelum kirim

- [ ] `CHANGELOG.md` ditulis
- [ ] `README.md` diperbarui kalau ada dokumen baru
- [ ] Dokumen yang jadi tidak benar diperbaiki

---

## 9. Kalau tidak yakin

Lebih baik berhenti dan tanya daripada menebak, terutama kalau:

- keputusan produk yang belum ada di dokumen
- perubahan scope
- teknologi baru
- angka yang belum diukur
- nama produk final

Menebak di sini berarti membangun di atas asumsi yang belum diperiksa, dan asumsi itu jadi jauh lebih mahal untuk dibongkar daripada satu pertanyaan.

---

## 10. Struktur berkas

```text
wedding-planer/
├── AGENTS.md            berkas ini
├── CHANGELOG.md         setiap perubahan besar
├── DESIGN.md            sistem desain
├── README.md            indeks semua dokumen
├── docs/
│   ├── 01-PRD.md
│   ├── 02-Domain-Spec.md
│   ├── 02a-Perencanaan.md
│   ├── 02b-Tamu.md
│   ├── 02c-Hari-H.md
│   ├── 02d-Lainnya.md
│   ├── 03-Data-Model.md
│   ├── 04-API-Contract.md
│   ├── 05-IA-dan-Layar.md
│   ├── 06-Stack-dan-Batas.md
│   ├── 07-PWA.md
│   ├── 08-NFR.md
│   ├── 09-Pustaka-Prompt.md
│   ├── 10-Epik-dan-Story.md
│   ├── 11-Delivery-Plan.md
│   ├── 12-Wireframe.md
│   ├── 12a-Wireframe-Inti.md
│   ├── 12b-Wireframe-Uang.md
│   ├── 12c-Wireframe-Tamu.md
│   ├── 12d-Wireframe-Hari-H.md
│   ├── 12e-Wireframe-Laporan.md
│   ├── 13-Rencana-Kerja.md
│   ├── 14-Naskah-Teks.md
│   ├── 15-Glosarium.md
│   └── 16-Laporan-dan-Bagikan.md
└── src/                 belum ada, akan dibuat di Fase 0
```

---

## 11. Referensi cepat

| Kalau mau | Baca |
|---|---|
| Tahu warna dan bentuk | [`DESIGN.md`](DESIGN.md) |
| Tahu apa yang tidak dibangun | [`docs/01-PRD.md`](docs/01-PRD.md) bagian 4 |
| Tahu bentuk tabel | [`docs/03-Data-Model.md`](docs/03-Data-Model.md) |
| Tahu bentuk endpoint | [`docs/04-API-Contract.md`](docs/04-API-Contract.md) |
| Tahu batas teknologi | [`docs/06-Stack-dan-Batas.md`](docs/06-Stack-dan-Batas.md) |
| Tahu cara install | [`docs/07-PWA.md`](docs/07-PWA.md) bagian install |
| Tahu apa yang berubah | [`CHANGELOG.md`](CHANGELOG.md) |
| Tahu teks apa yang muncul di layar | [`docs/14-Naskah-Teks.md`](docs/14-Naskah-Teks.md) |
| Tahu arti satu istilah | [`docs/15-Glosarium.md`](docs/15-Glosarium.md) |
| Tahu apa yang dikerjakan berikutnya | [`docs/10-Epik-dan-Story.md`](docs/10-Epik-dan-Story.md) |
| Tahu bentuk kasar tiap layar | [`docs/12-Wireframe.md`](docs/12-Wireframe.md) |
| Tahu aturan laporan dan PDF | [`docs/16-Laporan-dan-Bagikan.md`](docs/16-Laporan-dan-Bagikan.md) |
| Tahu urutan dari yang paling penting | [`docs/13-Rencana-Kerja.md`](docs/13-Rencana-Kerja.md) |
| Tahu cara bertanya dengan benar | [`docs/09-Pustaka-Prompt.md`](docs/09-Pustaka-Prompt.md) |
