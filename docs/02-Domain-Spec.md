# 02. Domain Spec: Kebutuhan Plan Wedding

Dokumen ini adalah daftar kebutuhan yang harus dipenuhi supaya perencanaan pernikahan di Indonesia benar-benar tertangani.

PRD di `01-PRD.md` menentukan *apa* yang dibangun. Dokumen ini menentukan *detail apa saja* yang harus ada di dalamnya.

Spesifikasi ini terbagi jadi beberapa file agar mudah dibaca:

| File | Isi |
|---|---|
| `02a-Perencanaan.md` | Tanggal penting, daftar tugas, anggaran, vendor dan pembayaran |
| `02b-Tamu.md` | Daftar tamu, undangan digital, meja dan seating |
| `02c-Hari-H.md` | Rundown acara, info untuk keluarga, dokumentasi |
| `02d-Lainnya.md` | Seragam, ucapan terima kasih, pelacakan setelah acara |

---

## Prinsip yang berlaku untuk semua modul

Tiga aturan ini berlaku di mana-mana, tidak hanya di satu modul:

1. **Kategori dan istilah mengikuti bahasa Indonesia.** Aplikasi ini tidak memakai istilah internasional. Ganti `guest` jadi `tamu`, ganti `RSVP` jadi `konfirmasi hadir`, ganti `reception` jadi `resepsi`, ganti `run sheet` jadi `rundown acara`. Istilah `vendor` tetap dipakai, karena itu bahasa yang benar dalam pemakaian sehari-hari di Indonesia.
2. **Nominal dalam rupiah penuh.** Tidak ada settingan mata uang lain di Fase 1.
3. **Setiap tanggal punya timezone Asia/Jakarta.** Aplikasi ini tidak dipakai di luar Indonesia, jadi tidak perlu pengaturan timezone.

## Prioritas modul

| Prioritas | Arti |
|---|---|
| P0 | Harus ada di Fase 1, tanpa ini produk tidak berguna |
| P1 | Penting, ada di Fase 1 kalau sempat, kalau tidak masuk Fase 2 |
| P2 | Tidak ada di Fase 1, masuk Fase 2 atau nanti |

Semua modul di bawah ditandai dengan prioritasnya. P0 adalah batas minimum yang harus selesai, sisanya boleh menyusul.
