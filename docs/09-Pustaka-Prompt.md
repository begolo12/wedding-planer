# Pustaka Prompt

Prompt siap pakai untuk tiap peran yang membangun produk ini.

Prompt di sini sengaja ditulis pendek. Prompt panjang biasanya membuat model mengulang aturan yang sudah ada di dokumen lain, dan hasilnya lebih dangkal, bukan lebih dalam.

---

## Cara pakai

Tiga langkah, tidak boleh dilewati:

1. **Salin** prompt yang sesuai dengan tugas
2. **Ganti** bagian dalam kurung siku dengan konteks sebenarnya
3. **Tambahkan** dokumen yang relevan sebagai konteks kalau belum ikut terlampir

Kalau hanya satu kalimat yang perlu, pakai bagian "Kalimat pembuka" di akhir dokumen ini.

---

## Prinsip yang berlaku untuk semua prompt

| Prinsip | Kenapa |
|---|---|
| Satu tugas satu prompt | Dua tugas dalam satu prompt biasanya jadi setengah selesai dua-duanya |
| Sebut dokumennya | Model tidak tahu isi `docs/03-Data-Model.md` kalau tidak diberi |
| Minta alasan, bukan cuma kode | Kode tanpa alasan akan dibongkar ulang sebulan kemudian |
| Minta tunjukkan masalahnya kalau ada | Tanpa ini, model diam saja lalu memutuskan sendiri |
| Minta yang belum pasti | Yang belum pasti lebih penting dari yang sudah pasti |

Kalimat terakhir yang paling sering dilewati. Kalau model tidak diminta menunjukkan bagian yang belum pasti, dia akan menulis spesifikasi yang lengkap tapi setengah karangan.

---

## Prompt 1: Mulai proyek

Untuk kali pertama, membuat struktur proyek.

```text
Saya mau mulai membangun aplikasi perencanaan pernikahan sesuai dokumen di repo ini.

Baca dulu, urut dari yang paling penting:
1. AGENTS.md
2. DESIGN.md
3. docs/01-PRD.md
4. docs/03-Data-Model.md
5. docs/04-API-Contract.md
6. docs/06-Stack-dan-Batas.md

Lalu:
- Kasih tahu apa yang kurang dari dokumen itu sebelum mulai
- Jelaskan Phase 0 dalam [| Phase 0 adalah 5 hari pertama yang hanya berisi pondasi |] kalimat pendek
- Jangan menulis kode dulu, hanya rencanakan

Yang tidak boleh kamu lakukan:
- Menambah teknologi di luar docs/06-Stack-dan-Batas.md
- Menebak angka yang belum diukur
- Mengarang nama vendor, harga, atau testimoni
- Mengarang keputusan produk yang belum ada di dokumen

Kalau ada yang belum jelas, tanya. Jangan menebak lalu lanjut.
```

Kenapa daftar larangan diulang: aturan itu sudah ada di `AGENTS.md`, tapi mengulangnya di sini membuat model lebih sulit mengabaikannya. Pengulangan yang disengaja bukan salah.

---

## Prompt 2: Buat satu story

Untuk mengerjakan satu story dari `docs/10-Epik-dan-Story.md`.

```text
Kerjakan story [| nomor |] dari docs/10-Epik-dan-Story.md.

Sebelum menulis kode, tulis:
- Apa yang akan kamu buat dalam satu kalimat
- Tulis basis data dan endpoint yang berubah
- Test yang akan ditulis
- Daftar pendek bagian yang belum jelas

Lalu kerjakan sampai selesai.

Syarat selesai:
- Build jalan tanpa error
- Ada test untuk bagian yang bisa salah
- Tampilan punya kondisi kosong, memuat, dan gagal
- Mobile tidak geser horizontal
- Target sentuh minimal 44x44px

Terakhir, tulis entri CHANGELOG.md dan sebutkan keputusan apa yang kamu ambil
selama pengerjaan beserta alasannya.
```

---

## Prompt 3: Bikin komponen

Untuk satu komponen tampilan yang sudah dispesifikasikan di `docs/05-IA-dan-Layar.md`.

```text
Buat komponen [| nama |] sesuai spesifikasi [| nama layar |] di docs/05-IA-dan-Layar.md.

Wajib:
- Pakai token warna dari DESIGN.md, jangan tulis hex langsung
- Sudut konsisten dengan design system
- punya loading, kosong, dan gagal
- Bisa dipakai tanpa terkurung di dalam satu layout
- Label selalu punya asosiasi yang jelas untuk pembaca layar

Bonus kalau bisa:
- Jalan dengan keyboard
- Fokus terlihat saat dipindai keyboard

Jangan pakai library UI baru. Kalau yang ada sekarang tidak cukup, buat sendiri lalu tulis alasan kenapa di docs/06-Stack-dan-Batas.md.
```

---

## Prompt 4: Bikin endpoint

Untuk satu endpoint dari `docs/04-API-Contract.md`.

```text
Buat endpoint [| METHOD |] [| path |] sesuai kontrak di docs/04-API-Contract.md.

Wajib:
- Validasi input dengan Zod, dan kembalikan error dengan bentuk yang sama
- Cek kepemilikan sebelum menulis
- Filter query dengan planId
- userId diambil dari session, tidak pernah dari body
- Uang integer rupiah

Boleh tanya dulu kalau:
- Bentuk request belum jelas di kontrak
- Ada field yang tidak jelas mandatory atau tidak

Jangan menambah field baru tanpa ditulis di kontrak dulu.
```

---

## Prompt 5: Bikin migration

Untuk perubahan skema database.

```text
Bikin migration untuk [| perubahan |].

Baca dulu docs/03-Data-Model.md untuk memastikan bentuk tabelnya benar.

Wajib:
- Pakai Drizzle, bukan SQL mentah
- Semua uang integer rupiah
- Semua waktu timestamptz dalam UTC
- Filter planId punya index
- Jangan menambah kolom yang tidak dipakai kode

Tulis juga:
- Kenapa perubahan ini perlu
- Apa risikonya kalau gagal di tengah jalan
- Bagaimana cara membalikkan perubahan kalau salah
```

---

## Prompt 6: Bikin layar baru

Untuk layar yang belum ada di `docs/05-IA-dan-Layar.md`.

```text
Bikin layar [| nama |].

Sebelum menulis, jawab dulu:
- Apa satu hal paling penting yang harus dilihat orang di layar ini
- Apa yang dilakukan kalau belum ada data sama sekali
- Apa yang dilakukan kalau gagal memuat

Rujukan yang wajib dibaca:
- docs/05-IA-dan-Layar.md untuk perilaku di mobile dan desktop
- docs/12-Wireframe.md untuk indeksnya, lalu docs/12a sampai 12e untuk isi layarnya
- DESIGN.md untuk warna dan bentuk

Wajib:
- Mobile dan desktop dari komponen yang sama
- Mobile tidak geser horizontal
- Tidak ada tombol mati
- Semua warna dari design system
```

---

## Prompt 7: Review kode

Untuk checking kode yang sudah jadi, bisa dari orang lain atau dari AI sebelumnya.

```text
Review kode ini dengan urutan prioritas ini:

1. Kebocoran data: apakah ada yang bisa melihat plan orang lain
2. Kesalahan uang: apakah total bisa salah hitung
3. Handling error: apakah ada yang bisa sampai ke user dalam bentuk mentah
4. Kondisi luring: apakah tombol masih bisa diklik saat offline
5. Aksesibilitas keyboard: apakah bisa dipakai tanpa mouse
6. Performa: apakah ada yang bisa ditunda tanpa mengubah fungsi
7. Gaya kode: hanya kalau semua di atas sudah aman

Untuk setiap temuan, tulis:
- Apa masalahnya
- Kenapa ini penting
- Usulan perbaikan singkat

Jangan menulis ulang kode. Jangan komentar soal format kalau tidak diminta.
```

---

## Prompt 8: Review dokumen

Untuk dokumen yang baru ditulis atau diubah.

```text
Review dokumen [| path |].

Periksa:
- Ada angka tanpa sumber atau tidak
- Ada keputusan tanpa alasan atau tidak
- Ada istilah yang tercampur bahasa lain atau tidak
- Rujukan ke dokumen lain sudah benar atau tidak
- Ada bagian yang bertentangan dengan dokumen lain atau tidak
- Ada bagian yang tertulis sebagai pasti padahal belum diukur atau tidak

Perbaiki yang salah dan sebutkan apa yang diperbaiki.
Kalau ada yang tidak bisa dipastikan tanpa bertanya, tanyakan, jangan menebak.
```

---

## Prompt 9: Diagnosa bug

Untuk masalah yang belum ketahuan penyebabnya.

```text
Ada bug: [| jelaskan gejalanya |]

Jangan langsung perbaiki. Kerjakan ini dulu:
1. Baca kode yang berkaitan
2. Sebutkan [| 3 |] kemungkinan penyebab, paling mungkin duluan
3. Untuk tiap kemungkinan, sebutkan cara memastikan atau menyingkirinya
4. Baru perbaiki setelah penyebabnya jelas

Kalau penyebabnya belum jelas setelah membaca kode, katakan terus.
Jangan menebak dan langsung mengubah.
```

---

## Prompt 10: Susun rencana kerja

Untuk pekerjaan lebih dari dua hari.

```text
Susun rencana untuk: [| tujuan |]

Basis: docs/11-Delivery-Plan.md dan docs/10-Epik-dan-Story.md

Yang diminta:
- Pecah jadi langkah yang bisa diselesaikan satu hari
- Setiap langkah punya hasil yang bisa diperiksa
- Setiap langkah punya syarat selesai yang jelas
- Urutan sudah benar, jangan sampai langkah yang butuh hasil langkah lain
- Tulis dalam bahasa sehari-hari, bukan bahasa proyek

Terakhir, tulis apa yang belum bisa dipastikan.
```

---

## Prompt 11: Persiapan rilis

Sebelum rilis.

```text
Persiapan rilis.

Baca checklist di docs/08-NFR.md bagian pengukuran.

Yang diminta:
- Daftar apa yang perlu diukur ulang
- Daftar apa yang belum pernah diuji
- Daftar yang masih menebak
- Checklist dari AGENTS.md bagian 8

Jangan tulis angka kalau belum diukur. Tulis "belum diukur" dan
tambahkan cara mengukurnya.
```

---

## Prompt 12: Audit batas teknologi

Untuk memeriksa apakah ada yang lewat dari batas stack.

```text
Audit perubahan ini terhadap docs/06-Stack-dan-Batas.md.

Periksa:
- Apakah ada dependensi baru
- Apakah ada pola yang tidak ada di stack
- Apakah kompleksitas bisa dikurangi tanpa kehilangan fungsi

Untuk tiap temuan, jawab lima pertanyaan dari AGENTS.md bagian 5.
Kalau ada yang gagal lima pertanyaan, usulkan cara menyelesaikan
tanpa teknologi itu.
```

---

## Kalimat pembuka

Kalau tidak perlu prompt panjang, ini cukup untuk sebagian besar tugas:

```text
Baca AGENTS.md dan dokumen yang relevan dulu.
Tunjukkan bagian yang belum jelas sebelum mulai.
Jangan menebak angka, nama, atau keputusan produk.
```

---

## Yang sengaja tidak ada

| Tidak ada | Kenapa |
|---|---|
| Prompt untuk menulis marketing | Itu bukan bagian dari proses membangun |
| Prompt untuk membuat keputusan produk | Keputusan produk bukan tugas AI, dan nilainya terlalu besar untuk diserahkan |
| Prompt untuk mengarang konten | Isi harus benar, dan model tidak bisa memverifikasi |
| Prompt yang menempel otomatis | Kalau promptnya terlalu panjang, perannya hilang |
