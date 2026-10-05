# 15. Glosarium

Kamus istilah. Satu kata punya satu arti di seluruh dokumen dan di seluruh aplikasi.

Kalau ada istilah baru, tambahkan dulu di sini sebelum dipakai di dokumen lain. Istilah yang belum ada di kamus akan dipakai dengan arti berbeda di dua tempat, dan itu sumber galat yang sulit dicari.

---

## 1. Istilah yang dipakai apa adanya

Istilah di bawah ini sudah jadi bahasa sehari-hari di Indonesia.

| Istilah | Arti |
|---|---|
| Vendor | Orang atau badan usaha yang menyediakan jasa |
| Rundown | Urutan acara dari awal sampai selesai |
| DP | Uang muka, biasanya 30 persen atau 50 persen dari harga |
| Pelunasan | Pembayaran terakhir yang sudah penuh |
| Hari-H | Hari pernikahan |
| Tamu | Orang yang diundang |
| Undangan | Ajakan, bisa cetak atau digital |
| Resepsi | Acara menerima tamu |
| Pengantin | Pasangan yang menikah |
| Crew | Orang yang membantu jalannya acara |
| Akad nikah | Akad pernikahan secara agama |
| Porsi katering | Jumlah orang yang perlu makanan |
| QRIS | Cara bayar dengan memindai kode QR |
| Administrasi | Pos anggaran untuk biaya surat, akta, dan pengurusan |

---

## 2. Istilah yang diterjemahkan

Istilah teknis dari bahasa Inggris diterjemahkan, karena tidak dikenal orang awam.

| Dipakai di aplikasi | Bukan | Alasan |
|---|---|---|
| Kehadiran | RSVP | Kebanyakan orang Indonesia menjawab lewat WhatsApp, jadi kata konfirmasi lebih sering dipakai |
| Konfirmasi hadir | RSVP | Sama artinya dengan Kehadiran, dipakai saat butuh kalimat penuh di judul dan label |
| Audiens | Audien | Bentuk baku di kamus, dan penerimanya memang lebih dari satu kelompok |
| Kode busana | Dress code | Bahasa Indonesia, sesuai prinsip istilah Indonesia di `02-Domain-Spec.md` |
| Tautan baca-saja | Read-only link | "Tautan" menggantikan "link", sesuai bagian 7 dokumen ini |
| Tamu | Guest | Sudah jadi bahasa sehari-hari |
| Rundown acara | Run sheet | Sudah jadi bahasa sehari-hari |
| Kontrak | Legal docs | Orang awam lebih mudah paham kata kontrak |

---

## 3. Istilah teknis yang tetap dipakai

Istilah di bawah ini tidak diterjemahkan, karena memang istilah kerja yang dipakai developer.

| Istilah | Arti |
|---|---|
| Plan | Satu rencana pernikahan |
| Endpoint | Alamat API |
| Request dan response | Yang dikirim dan yang dibalas |
| State | Keadaan satu komponen |
| Cache | Data yang disimpan sementara |
| Offline | Tanpa sinyal |

---

## 4. Nama kolom di data model

| Kolom | Arti | Tabel |
|---|---|---|
| `planId` | Plan yang memiliki data ini | Semua tabel |
| `userId` | Pemilik akun | plans, sessions |
| `weddingDate` | Tanggal hari-H | plans |
| `isDayOf` | Tandai kalau tanggal ini adalah hari-H | milestones |
| `dueDate` | Batas akhir tugas, boleh kosong | tasks |
| `status` | Status tugas | tasks |
| `plannedAmount` | Anggaran yang direncanakan | budget_items |
| `contactName` | Nama orang yang dihubungi | vendors |
| `isFinal` | Tandai ini pembayaran terakhir | payments |
| `rsvpStatus` | Kehadiran tamu | guests |
| `guestCount` | Jumlah orang yang datang | guests |
| `startTime` | Jam mulai acara | rundown_items |
| `durationMinutes` | Estimasi durasi | rundown_items |
| `picName` | Penanggung jawab | rundown_items |
| `shareToken` | Token unik untuk tautan baca saja | announcements |
| `side` | Sisi keluarga tamu: pria, wanita, atau lainnya | guests |
| `invitedAt` | Kapan undangan dikirim, kosong berarti belum | guests |
| `invitationUrl` | Tautan undangan digital per acara | milestones |

---

## 5. Tidak ada terjemahan

Aplikasi ini hanya dipakai di Indonesia, jadi tidak ada terjemahan ke bahasa lain.

---

## 6. Kata yang paling sering tertukar

| Pasangan | Bedanya |
|---|---|
| Tanggal penting dan hari-H | Tanggal penting termasuk akad nikah dan resepsi. Hari-H hanya hari pernikahan. |
| Task dan acara rundown | Task punya tenggat dan selesai setelah dikerjakan. Acara rundown selalu ada. |
| Vendor dan pos anggaran | Pos anggaran menyimpan rencana uang. Vendor menyimpan siapa yang mengerjakan. |
| Pembayaran dan pos anggaran | Pembayaran menyimpan uang yang benar-benar keluar. Pos anggaran menyimpan rencana. |
| Kehadiran dan jumlah tamu | Kehadiran berarti apakah dia datang. Jumlah tamu berarti berapa orang yang ikut. |
| Undangan dan tamu | Undangan yang dikirim. Tamu yang ada di daftar. |
| Orang, kursi, dan undangan | Undangan satu baris tamu, boleh mewakili beberapa orang. Orang jumlah jiwa di semua baris. Kursi dan porsi jumlah orang yang perlu dilayani. |
| Hadir, belum konfirmasi, dan tidak hadir | Hadir berarti sudah menyatakan datang. Belum konfirmasi berarti belum menjawab. Tidak hadir berarti sudah menyatakan tidak datang. |
| Porsi katering dan kursi | Dua angka ini sengaja sama: orang yang sudah pasti hadir ditambah yang belum menjawab. Tamu yang sudah menyatakan tidak hadir tidak dihitung. |
| Pihak pria, pihak wanita, dan bersama | Sisi keluarga tamu. Nilai lama yang tidak dikenal dan yang belum diisi dibaca sebagai bersama. |

---

## 7. Kata yang tidak dipakai

| Kata | Yang dipakai |
|---|---|
| Onboarding | Langkah pertama |
| Dashboard | Beranda |
| Master data | Daftar utama |
| Master vendor | Daftar vendor |
| Input | Isi |
| Output | Hasil |
| Submit | Simpan |
| Approve | Setujui |
| Reject | Tolak |
| Checklist | Tugas atau daftar tugas |
| Audien | Audiens |
| RSVP | Konfirmasi hadir |
| Dress code | Kode busana |
| Link | Tautan |
| Database | Daftar, data, atau catatan |

---

## 8. Satuan angka tamu

Satu angka hanya boleh punya satu satuan di semua layar. Empat satuan ini dipakai:

| Satuan | Arti | Dipakai untuk |
|---|---|---|
| Undangan | Satu baris tamu. Satu undangan bisa mewakili beberapa orang | Jumlah baris di daftar tamu |
| Orang | Jumlah jiwa di semua baris, termasuk yang belum dan tidak hadir | Total tamu |
| Hadir | Jumlah orang yang sudah menyatakan hadir | Garis bawah konfirmasi |
| Belum konfirmasi | Jumlah orang yang belum menjawab | Yang masih menggantung |
| Tidak hadir | Jumlah orang yang sudah menyatakan tidak datang | Yang pasti tidak ikut |
| Kursi | Hadir ditambah belum konfirmasi | Tempat duduk yang perlu disiapkan |
| Porsi | Hadir ditambah belum konfirmasi | Makanan yang perlu dipesan |

Kursi dan porsi sengaja memakai angka yang sama: dua-duanya menjawab berapa orang yang perlu dilayani. Tamu yang sudah menyatakan tidak hadir tidak dihitung di keduanya. Angka "kalau semua hadir" tidak dipakai lagi karena dulu ikut menghitung tamu yang sudah menolak.

---

## 9. Alasan penulisan dokumen ini

Tiga alasan:

1. Istilah yang sama untuk dua hal berbeda membuat bug yang sulit dicari. Kalau status berarti tanda di daftar tugas dan juga tanda di pembayaran, satu layar bisa menampilkan tanda yang salah.
2. Istilah yang diterjemahkan setengah-setengah membuat dokumen terasa diterjemahkan, dan pembaca berhenti memahami.
3. Setiap istilah punya alasan. Kalau sebuah istilah berubah, alasannya juga ditulis, supaya bisa diaudit.

Semua teks yang muncul di aplikasi ditulis di [`14-Naskah-Teks.md`](14-Naskah-Teks.md). Dua dokumen itu terpisah: kamus untuk istilah, naskah untuk kalimat.
