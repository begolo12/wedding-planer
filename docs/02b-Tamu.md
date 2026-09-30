# 02b. Tamu

Tiga modul di sini, dan dua di antaranya masih masuk Fase 2. Semuanya berawal dari satu keputusan yang paling sulit: siapa yang diundang.

---

## 05. Daftar tamu (P0)

### Data tamu

| Field | Tipe | Keterangan |
|---|---|---|
| `name` | teks | Nama lengkap tamu |
| `phone` | teks | Nomor WhatsApp, untuk kirim undangan |
| `category` | enum | Lihat tabel di bawah |
| `side` | enum | `pria`, `wanita`, progresiva |
| `rsvpStatus` | enum | `belum`, `hadir`, `tidak` |
| `guestCount` | angka | Jumlah orang yang datang, tidak selalu satu |
| `invitedAt` | tanggal | Kapan undangan dikirim |
| `tableId` | relasi | Meja yang dipakai, opsional |
| `notes` | teks | Diet, ACCESS, alasan tidak hadir |

### Kategori tamu

| Kategori | Kenapa perlu dipisah |
|---|---|
| Keluarga pasangan | Punya aturan hadiah dan urutan sendiri, dan tidak bisa dibatalkan |
| Keluarga besar | Sering datang rame, butuh hitungan kursi ekstra |
| Teman | Jumlahnya tidak terduga, sering berubah di menit terakhir |
| Kerja | Ada yang perlu-undangan formal, ada yang tidak |
| Anak | Butuh kursi dan tinggi meja yang berbeda |
| Lainnya | Tetangga, kerabat jauh, kepala dusun, kepala RT |

### Kenapa perlu

Keputusan "siapa yang diundang" hampir selalu lebih sulit daripada "bisa tidak diundangkan". Yang paling sering ditanyakan pasangan adalah berapa total kursi yang perlu disewa venue, dan berapa porssi katering yang harus dipesan. Dua angka itu harus turun dari daftar tamu ini, bukan dihitung manual.

### Minimal Version

- [ ] Tambah, edit, hapus tamu, satu per satu maupun sekaligus dari daftar yang ditempel
- [ ] Filter by kategori, status kehadiran, dan sisi
- [ ] Total kursi dan estimasi porssi katering terhitung otomatis
- [ ] Impor dari spreadsheet satu kolom, jadi pasangan tidak perlu input manual
- [ ] Tandai Kehadiran cepat, satu tap per tamu
- [ ] Diurutkan berdasarkan nama, dengan pencarian yang bekerja di HP

---

## 06. Undangan digital (P1, Fase 2)

Sudah ada di Fase 1 secara manual: pasangan menulis sendiri alamat undangan digital dan menempelkan tautannya. Modul penuh untuk membangun undangan sendiri masuk Fase 2.

**Alasannya** builder undangan butuh penyimpanan template, editor, hosting gambar, dan pembagian tautan. Itu biaya besar dan bukan inti masalah yang paling mendesak.

Yang perlu ada di Fase 1 saja:

- [ ] Kolom URL undangan per acara, untuk pasangan paste tautan yang sudah mereka buat
- [ ] Daftar tamu yang sudah dikirim undangan, dengan tanggal dikirim
- [ ] Filter tamu berdasarkan "sudah dikirim" dan "belum dikirim", supaya tidak ada yang terlewat

---

## 07. Meja dan seating (P2, Fase 2)

Peta meja tidak ada di Fase 1.

**Alasannya** fitur ini hanya berguna di hari-H, sementara pasangan butuh bantuan dari fase perencanaan. Peta meja juga butuh interaksi drag-and-drop yang sulit dipakai di layar kecil, dan tidak bisa diuji dengan benar sebelum ada hari-H yang nyata.

Yang perlu ada di Fase 1 sebagai tempathozher:

- [ ] Nama meja sebagai teks bebas, misalnya "Meja 1: Keluarga bride" tanpa visual drag-and-drop
- [ ] Assign tamu ke meja lewat dropdown, bukan dengan menggeser
- [ ] Cetak daftar tamu per meja dalam bentuk teks atau PDF

<!--NEXT-->
