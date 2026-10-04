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

---

## Ringkasan kesesuaian Indonesia

Tabel ini menautkan kebutuhan orang Indonesia ke tempatnya di kode. Tujuannya supaya klaim "dibuat untuk Indonesia" bisa diperiksa, bukan cuma ditulis. Kalau ada batasnya, batas itu ditulis apa adanya.

| Kebutuhan orang Indonesia | Dipenuhi di kode | Catatan |
|---|---|---|
| Istilah Indonesia, bukan istilah internasional | `docs/02-Domain-Spec.md:22`, `docs/15-Glosarium.md`, label di `src/lib/konstanta.ts:131` | Istilah kerja developer tetap Inggris (Plan, Endpoint), sengaja, ada di `docs/15` bagian 3 |
| Rupiah penuh tanpa desimal | `src/lib/format.ts:99` (`rupiah`), `src/lib/skema.ts:76`, `src/components/rupiah.tsx:8` | Tidak ada pilihan mata uang lain |
| Waktu dan tanggal Asia/Jakarta | `src/lib/konstanta.ts:186` (`ZONA`), `src/lib/format.ts:273` (`hariIni`) dan `:283` (`awalHariJakarta`), dipakai `src/app/(app)/hari-h/page.tsx:45` | Zona dikunci WIB, bukan zona peramban |
| Nomor WhatsApp Indonesia jadi tautan `wa.me` yang benar | `src/lib/format.ts:245` (`normalkanNomorWa`), transform di `src/lib/skema.ts:95-105`, tombol di `src/app/(app)/tamu/page.tsx:656`, `src/app/(app)/rencana/vendor/page.tsx:339`, `src/app/(app)/rencana/vendor/[vendorId]/page.tsx:371` | Nomor luar negeri yang sudah memakai `+` dipertahankan apa adanya |
| Kursi yang perlu disewa dan porsi katering | `src/lib/tamu.ts:95,104-105` | Kursi dan porsi sengaja angka yang sama: hadir ditambah belum konfirmasi, tamu yang menolak tidak dihitung. Belum ada integrasi sewa kursi, jadi ini angka siapkan, bukan pesanan |
| Pemisahan tamu pihak pria dan pihak wanita | `src/lib/konstanta.ts:65` (`SISI_TAMU`), `src/lib/tamu.ts:86-88` (`perSisi`), saringan di `src/app/(app)/tamu/page.tsx:472-501` | Nilai lama yang tidak dikenal dan yang belum diisi masuk keranjang bersama |
| Undangan per acara dan penandaan undangan terkirim | `src/db/schema.ts:100` (`invitationUrl`) dan `:210` (`invitedAt`), borongan di `src/app/api/plans/[planId]/guests/undangan/route.ts:27-38`, form di `src/app/(app)/rencana/tanggal/page.tsx:420-433` | Aplikasi cuma menandai dan menyimpan tautan, tidak mengirim undangan sendiri |
| Tugas administrasi KUA dan berkas N1 sampai N4 | `src/lib/template.ts:25`, `:28`, pos biaya di `:104` | Ini template tugas dan pos anggaran, bukan sambungan ke KUA. Pasangan tetap mengurus sendiri |
| Enam versi rundown adat | `src/lib/template.ts:115` (`TEMPLATE_RUNDOWN`), `:158` (`NAMA_ADAT`) | Enam versi: Muslim, Jawa, Minang, Sunda, Bali, Modern. Isinya contoh, harus disesuaikan tiap keluarga |
| Pembayaran vendor termasuk DP, pelunasan, dan QRIS | `src/lib/konstanta.ts:120,128`, `src/db/schema.ts:188-189` (`method`, `isFinal`), pilihan di `src/app/(app)/rencana/vendor/[vendorId]/page.tsx:517` | Pencatatan manual, tanpa gerbang pembayaran. QRIS cuma label metode, bukan integrasi |
| Laporan dan cetak A4 untuk dibawa ke vendor | `src/app/cetak.css:16,18` (A4, margin 20mm), halaman `src/app/(app)/laporan/page.tsx` | Tanpa nomor halaman otomatis; yang ada kaki nama rencana dan tanggal cetak, sesuai `docs/16` bagian 5 |
| Bagikan ke WhatsApp | `src/lib/teks-wa.ts:41` (`tautanWa`), teks disusun di `src/app/api/plans/[planId]/report/share-text/route.ts:46,58` | Penerima dipilih di WhatsApp, aplikasi tidak menyimpan daftar kontak |
| Tautan baca-saja untuk keluarga tanpa akun | `src/app/api/public/share/[token]/route.ts`, halaman `src/app/bagikan/[token]/page.tsx:37` | Hanya bisa dibaca, tanpa login, tanpa tombol yang mengubah data |
| Luring di venue bersinyal buruk | `public/sw.js:54` (handler `fetch`), `src/lib/luring.ts`, `src/lib/status-luring.ts`, `src/components/pwa.tsx` | Status antrean hidup di memori tab; kalau halaman dimuat ulang, angkanya kembali kosong, tertulis jujur di `src/lib/status-luring.ts:20-24` |
| Hak UU PDP: unduh seluruh data dan hapus akun | Ekspor di `src/app/api/plans/[planId]/ekspor/route.ts`, tombol unduh di `src/app/(app)/akun/page.tsx:207`, hapus akun di `src/app/(app)/akun/page.tsx:180`, dasar hukum di `docs/08-NFR.md:126-171` | Pengingat surel sebelum retensi 24 bulan belum ada, karena surel masih Fase 2 |

## Prioritas modul

| Prioritas | Arti |
|---|---|
| P0 | Harus ada di Fase 1, tanpa ini produk tidak berguna |
| P1 | Penting, ada di Fase 1 kalau sempat, kalau tidak masuk Fase 2 |
| P2 | Tidak ada di Fase 1, masuk Fase 2 atau nanti |

Semua modul di bawah ditandai dengan prioritasnya. P0 adalah batas minimum yang harus selesai, sisanya boleh menyusul.
