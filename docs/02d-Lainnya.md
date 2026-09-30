# 02d. Lainnya

Modul pendukung. Semuanya P1 atau P2, tidak ada yang P0.

---

## 11. Seragam dan persiapan fisik (P1)

### Data yang disimpan

| Field | Tipe | Keterangan |
|---|---|---|
| `itemName` | teks | Contoh: "Baju pengantin wanita", "Baju ayah" |
| `owner` | enum | `pengantinPria`, `pengantinWanita`, `orangTua`, `keluarga`, `crew` |
| `status` | enum | `belum`, `dicari`, `diJahit`, `siap` |
| `measureDate` | tanggal | Kapan ukur |
| `pickupDate` | tanggal | Kapan ambil dari penjahit |
| `notes` | teks | Ukuran, warna, catatan penjahit |
| `cost` | uang | Kalau ada, masuk ke anggaran sebagai pos busana |

### Kenapa perlu

Ukur bajunya sering dijadwalkan berbulan-bulan sebelum hari-H, dan penjahit butuh ukuran yang tepat. Kalau tanggal ukur tidak tercatat, hasilnya salah.

### Versi minimal

- [ ] Daftar item seragam beserta pivot
- [ ] Status tiap item berubah warnanya kalau sudah siap, dan warnanya berbeda dari warna tombol utama
- [ ] Tanggal ukur dan tanggal ambil tampil sebagai tanggal penting
- [ ] Biaya seragam masuk ke anggaran tanpa input dua kali

---

## 12. Ucapan terima kasih (P2, Fase 2)

Ucapan terima kasih ke keluarga, tetangga, dan rekanan setelah acara. Tidak ada di Fase 1.

**Alasannya** fitur ini bagus di atas kertas, tapi tidak menyelesaikan masalah yang sedang pasangan hadapi. Pasangan yang butuh fitur ini biasanya sudah punya cara yang bekerja untuk mereka, misalnya kirim pesan di grup WhatsApp.

Yang perlu ada di Fase 1:

- [ ] Kolom "catatan setelah acara" di rencana, teks bebas

---

## 13. Riwayat dan pelacakan setelah acara (P2, Fase 2)

Yang disimpan setelah acara selesai, untuk referensi acara berikutnya atau untuk acara keluarga lain.

**Alasannya** satu pasangan hanya punya satu pernikahan, jadi nilai dari data historis rendah di Fase 1. Fitur ini baru jadi tinggi nilainya kalau produk sudah dipakai banyak orang.

Yang perlu ada di Fase 1:

- [ ] Rencana bisa ditandai selesai, dan setelah itu rencana tetap bisa dibuka
- [ ] Data tidak hilang setelah rencana ditandai selesai
- [ ] Checklist template bisa dipakai ulang untuk rencana berikutnya

---

## Ringkasan prioritas

| Modul | Nama | Prioritas |
|---|---|---|
| 01 | Tanggal penting | P0 |
| 02 | Daftar tugas | P0 |
| 03 | Anggaran | P0 |
| 04 | Vendor dan pembayaran | P0 |
| 05 | Daftar tamu | P0 |
| 08 | Rundown acara | P0 |
| 09 | Info untuk keluarga dan hari-H | P0 |
| 14 | Laporan keadaan | P0 |
| 15 | Bagikan ke WhatsApp dan cetak PDF | P0 |
| 11 | Seragam dan persiapan fisik | P1 |
| 06 | Undangan digital | P1 (Fase 2 penuh) |
| 10 | Dokumentasi dan album | P1 (Fase 2 penuh) |
| 07 | Meja dan seating | P2 (Fase 2) |
| 12 | Ucapan terima kasih | P2 (Fase 2) |
| 13 | Riwayat setelah acara | P2 (Fase 2) |

Sembilan modul P0. Itu batas minimum agar produk ini layak disebut selesai. Sisanya peningkatan, bukan syarat.

---

## Yang sengaja tidak ada di Fase 1, dan alasannya

| Tidak ada | Alasan |
|---|---|
| Marketplace vendor | Butuh dua sisi pasar, verifikasi vendor, dan moderasi. Terlalu besar untuk satu produk dengan satu target |
| Pembayaran online | Butuh payment gateway, rekonsiliasi, refund, dan kepatuhan. Pembayaran manual sudah bisa dicatat |
| Kontrak dan legal | Butuh template hukum yang benar untuk tiap daerah, dan bisa salah advise |
| Aplikasi untuk wedding organizer profesional | Orang yang bayar dan orang yang kerjakan beda. Butuh dua produk, bukan satu |
| Seat planner dengan drag-and-drop | Interaksi yang sulit diuji dan tidak dipakai sebelum hari-H |
| Album foto | Butuh penyimpanan dan bandwidth besar, bukan inti masalah |
| Aplikasi untuk pelamar | Berisi data pribadi sensitif, dan tidak ada di Fase 1 |
| Kolaborasi real-time | Butuh sinkronisasi konflik dan editing yang sering bentrok. Mulai dari satu orang dulu, tambah kolaborator nanti |
| Chat internal | Sudah ada di WhatsApp, dan mengulang WhatsApp butuh banyak pekerjaan tanpa ada yang benar-benar memakainya |
| Notifikasi lewat WhatsApp | Butuh integrasi pihak ketiga berbayar, dan biayanya tidak sebanding dengan nilainya di Fase 1 |

Setiap item di atas bisa ditambahkan nanti. Semuanya ditolak karena satu alasan yang sama: kalau ditambahkan sekarang, tiga sampai empat fitur yang lebih penting ikut tertunda.
