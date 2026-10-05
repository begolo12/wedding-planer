# PRD: Rapi Nikah Wedding Planner

Versi 1.0. Tanggal 2026-09-30. Status: draft untuk review pemilik proyek.

Nama produk adalah "Rapi Nikah", dan itu satu-satunya tempat nama produk ditulis di kode (`NAMA_PRODUK` di `src/lib/konstanta.ts`). Nama "Aisyah & Bagas" yang muncul di contoh layar, wireframe, dan teks contoh adalah nama pasangan pemakai, bukan nama produk. Nama pasangan sebenarnya diisi pengguna saat membuat rencana.

---

## 1. Ringkasan

Aplikasi web untuk pasangan yang sedang menyiapkan pernikahan di Indonesia. Dipakai untuk menyusun rencana, mengecek anggaran, dan melunasi tagihan vendor. Berjalan sebagai PWA, jadi bisa dipasang di layar utama HP dan tetap terbuka saat sinyal hilang di venue.

---

## 2. Masalah yang diselesaikan

Persiapan pernikahan di Indonesia tersebar di banyak tempat: WhatsApp dengan organizer keluarga, catatan di aplikasi notes, spreadsheet untuk budget, grup Facebook untuk info hari-H, dan pesan yang menumpuk. Akibatnya:

- **Tidak tahu sudah bayar apa dan belum bayar apa.** Riwayat pembayaran vendor tersebar di beberapa chat, sering terlupa.
- **Budget meleset.** Tidak ada angka total di satu tempat, sehingga baru sadar berlebihan saat DP vendor ketiga jatuh tempo.
- **Tanggal penting terlewat.** Undangan, fitting, akad, dan hari-H tidak ada satu daftar yang jelas.
- **Data tamu berantakan.** Satu pihak mencatat daftar tamu, pihak keluarga besar mencatat daftar sendiri, akhirnya tidak tahu berapa jumlah final.
- **Informasi hari-H tidak sampai ke semua orang.** Banyak yang baru tahu tanggal akad saat hari itu.

### 2.1 Yang sudah ada di pasar dan kurang memuaskan

| Solusi yang ada | Kekurangan yang sering muncul |
|---|---|
| Spreadsheet dan notes | Tidak ada pengingat tanggal, tidak ada daftar tamu, mudah hilang |
| Aplikasi internasional | Tidak tahu istilah nikah dan akad, tidak ada fitur lokal, tampilan terlalu umum |
| Aplikasi lokal | Kadang terlalu banyak fitur, alur terlalu panjang untuk orang yang hanya butuh 4 bulan |
| Grup WhatsApp | Riwayat pesan penting hilang, tidak ada yang bisa ditanya "sudah bayar atau belum" |

### 2.2 Posisi produk

Aplikasi yang fokus ke satu hal: **mengubah persiapan nikah dari berantakan jadi daftar yang jelas dengan angka yang bisa dipertanggungjawabkan.**

Bukan pengganti semua alat. Tapi tempat tunggal yang bisa dibuka pagi hari untuk tahu harus membereskan apa hari ini.

---

## 3. Target pengguna

### 3.1 Persona 1: Pasangan (pengguna utama)

| Aspek | Detail |
|---|---|
| Siapa | Pasangan, usia 24-35, tinggal di kota tier 1 di Indonesia |
| Situasi | Menyiapkan pernikahan 3 sampai 8 bulan ke depan |
| Kekhawatiran | Budget meleset, tugas terlewat, konflik dengan keluarga soal jumlah tamu |
| Teknologi | Android kelas menengah, WhatsApp, sudah pernah pasang PWA lain |
| Skill | Non-teknis. Tidak akan belajar fitur yang rumit |
| willingness bayar | Gratis untuk versi dasar, tidak akan membayar sebelum mencoba |

### 3.2 Persona 2: Keluarga atau organizer keluarga

| Aspek | Detail |
|---|---|
| Siapa | Orang tua, saudara, atau keluarga yang diminta mencatat atau mengurus tamu |
| Situasi | Membantu di hari-H, atau mengelola daftar tamu dari jauh |
| Kebutuhan | Masuk daftar tamu, lihat info acara, print daftar nama untuk pengawas |
| Batasan | Tidak akan belajar aplikasi baru. Butuh akses lewat tautan yang dikirim, bukan akun baru |
| Nilai | Menghemat waktu agar pasangan tidak perlu mengurus semuanya sendiri |

---

## 4. Scope

### 4.1 Yang masuk Fase 1 (MVP)

Tiga hal ini saja. Kalau harus memotong, potong yang lain, bukan ketiga hal ini.

1. **Timeline tugas** dengan tanggal jatuh tempo. Pengingat lokal belum dibangun di Fase 1, lihat `17-Rencana-Build.md` bagian 11
2. **Anggaran dan pembayaran vendor** dengan total yang selalu terlihat
3. **Daftar tamu** dengan data lokal Indonesia. Ekspor daftar tamu ke PDF belum dibangun di Fase 1; yang tersedia adalah cetak laporan keadaan, aturannya di `16-Laporan-dan-Bagikan.md`

Pendukung yang wajib ada karena tidak bisa dipisah dari tiga hal di atas:

- Akun pasangan (login)
- Kalender acara (tanggal penting, bukan agenda harian)
- PWA: install ke layar utama, dan bisa dipakai offline untuk hal yang sudah pernah dibuka
- Tema terang dan gelap

### 4.2 Yang TIDAK masuk Fase 1

Bagian ini sama pentingnya dengan scope. Setiap item di sini ada alasannya.

| Tidak masuk | Alasan |
|---|---|
| Marketplace vendor | Butuh dua sisi pasar, verifikasi vendor, ulasan, dan pembayaran. Itu bisnis tersendiri. Pasangan bisa tetap mencatat vendor secara manual. |
| Payment gateway | Pembayaran vendor di Indonesia masih banyak lewat transfer manual dan tunai. Memaksa pembayaran di dalam aplikasi akan memperlambat hal yang sudah berjalan. |
| Aplikasi untuk WO / perencana profesional | Butuh role dan izin terpisah, plus beranda yang dipakai orang yang bukan pemilik pernikahan. Tidak ada di Fase 1. |
| Scanner undangan digital dengan AI | Butuh infra computer vision dan biayanya tidak sebanding dengan nilainya di Fase 1. |
| Aplikasi tamu untuk RSVP online | Banyak pasangan di Indonesia lebih suka RSVP lewat WhatsApp. Fitur ini bisa ditambahkan di Fase 2 kalau ada data yang menunjukkan kebutuhan. |
| Multi-event | Satu akun untuk satu pernikahan sudah memenuhi kebutuhan. |
| Ekspor ke aplikasi lain | Tidak ada permintaan yang nyata. |
| Kolaborasi real-time antar pasangan | Kedua orang jarang berdiri di depan HP yang sama. Konflik edit nyata, tapi solusinya sederhana: last write wins dengan audit trail. |

### 4.3 Batasan yang disengaja

- **Tidak ada fitur AI.** Produk ini soal daftar dan angka, bukan soal generatif. Menambahkan AI akan menaikkan biaya dan tidak memperbaiki masalah utama.
- **Tidak ada social feed.** Tidak ada like, tidak ada komentar, tidak ada discovery.
- **Tidak ada iklan atau rekomendasi berbayar.** Memonetisasi lewat langganan, bukan iklan.

---

## 5. Use case utama

### UC-01: Cek apa yang harus dibereskan hari ini

- **Pelaku:** pasangan, di pagi hari sebelum kerja
- **Pemicu:** membuka aplikasi
- **Alur:** lihat hari-H, lihat tugas yang jatuh tempo minggu ini, tandai yang sudah selesai
- **Sukses:** tahu persis 3 hal yang harus dikerjakan hari ini
- **Gagal yang harus ditangani:** tugas yang sudah lewat masih terlihat sebagai "belum", sehingga pengguna merasa dikecewakan

### UC-02: Mencatat pembayaran vendor

- **Pelaku:** pasangan, setelah transfer DP ke vendor
- **Pemicu:** baru saja bayar
- **Alur:** buka budget, pilih vendor, input jumlah, pilih metode, simpan
- **Sukses:** total terbayar dan sisa budget langsung berubah di layar yang sama
- **Gagal yang harus ditangani:** input salah nominal, dan pengguna tidak menemukan cara membatalkan

### UC-03: Mendatangkan tugas lewat

- **Pelaku:** pasangan
- **Pemicu:** sedang di perjalanan, sinyal tidak stabil
- **Alur:** tandai tugas selesai, aplikasi menyimpan lokal
- **Sukses:** perubahan tersimpan dan tersinkron otomatis saat sinyal kembali
- **Gagal yang harus ditangani:** pengguna menambah tugas baru saat offline lalu aplikasi menimpa data yang ada

### UC-04: Keluarga membaca info acara dari jauh

- **Pelaku:** keluarga atau organizer keluarga
- **Pemicu:** mendapat tautan baca-saja dari pasangan
- **Alur:** buka tautan, lihat jadwal, lokasi, dan informasi acara
- **Sukses:** keluarga tahu info terbaru tanpa perlu akun baru
- **Gagal yang harus ditangani:** tautan tidak bisa dibuka, atau halaman kosong tanpa penjelasan

Catatan: UC ini dulu menulis keluarga "isi nama dan jumlah tamu, kirim". Fitur itu tidak dibangun dan tidak masuk scope, sesuai bagian 4.2 yang menyatakan "Aplikasi tamu untuk RSVP online" tidak ada di Fase 1. Tautan bersifat baca-saja, seperti tertulis di `05-IA-dan-Layar.md` bagian 12 dan `10-Epik-dan-Story.md` story E6.4.

### UC-05: Menjaga budget tetap dalam jalur

- **Pelaku:** pasangan, akhir bulan
- **Pemicu:** ingin tahu kondisi keuangan
- **Alur:** buka budget, lihat total terpakai, sisa, dan breakdown per kategori
- **Sukses:** tahu kategori mana yang meleset sebelum DP berikutnya jatuh tempo
- **Gagal yang harus ditangani:** angka tampil tidak sinkron dengan daftar pembayaran

### UC-06: Menjalankan hari-H tanpa sinyal

- **Pelaku:** keluarga di venue
- **Pemicu:** sinyal hilang di lokasi acara
- **Alur:** buka info acara, lihat jadwal acara dan daftar tamu yang sudah di-RSVP
- **Sukses:** informasi tetap terbaca
- **Gagal yang harus ditangani:** halaman kosong tanpa penjelasan kenapa

---

## 6. Metrik keberhasilan

### 6.1 Metrik produk (dari sudut pandang pengguna)

| Metrik | Target | Cara ukur |
|---|---|---|
| Hari-H tercapai tanpa tugas terlambat di week terakhir | Lebih dari separuh pasangan aktif | Analitik internal, penghitungan tugas overdue pada 7 hari terakhir |
| Budget dipakai, bukan hanya dilihat | Lebih dari separuh pasangan mencatat minimal satu vendor | Analitik internal |
| Retensi setelah hari-H | Aplikasi masih dibuka pada bulan setelah hari-H | Analitik internal |
| Sinyal kepuasan | Lebih dari separuh pengguna merekomendasikan aplikasi ini ke pasangan lain | Survei satu pertanyaan di akhir hari-H |

Angka target di atas adalah target internal, bukan klaim yang ditampilkan ke pengguna. Sesuai R-17, aplikasi tidak boleh menampilkan statistik ini di halaman publik.

### 6.2 Metrik teknis

Detail di `docs/08-NFR.md`. Ringkasnya:

- Lighthouse Performance minimal 90 di mobile
- LCP di bawah 2,5 detik di koneksi 3G
- Semua fungsi inti tetap jalan saat offline
- Tidak ada celah keamanan terbuka yang diketahui

### 6.3 Anti metrik (tanda bahwa produk salah arah)

| Tanda | Arti | Tindakan |
|---|---|---|
| Banyak pengguna membuat satu tugas lalu berhenti | Alur awal terlalu rumit | Perbaiki langkah pertama, bukan tambah fitur |
| Budget diisi tapi tidak pernah dibuka lagi | Fitur budget tidak menyelesaikan masalah nyata | Wawancara pengguna, jangan tambah fitur baru |
| Banyak pengguna melepas aplikasi | Target pasar lokal perlu dicari ulang | Bicara dengan pasangan di luar kota tier 1 |
| Time to first task lebih dari 10 menit | Alur pendaftaran terlalu panjang | Pangkas langkah |

---

## 7. Keputusan produk

### 7.1 Keputusan yang sudah diambil

| Keputusan | Isi | Alasan | Tanggal | Pemutus |
|---|---|---|---|---|
| Harga dan model bisnis | Fase 1 gratis, tanpa iklan dan tanpa fitur berbayar | Bagian 3.1 menulis pengguna tidak akan membayar sebelum mencoba, dan belum ada pengguna nyata | 4 Oktober 2026 | Pemilik produk |

Model bisnis ditinjau lagi setelah ada pengguna nyata. Sampai itu terjadi, tidak ada paket berbayar dan tidak ada fitur yang dikunci di balik bayaran. Keputusan yang lebih rinci ada di `18-Rencana-Produksi-dan-Pemakaian-Harian.md` bagian 19.

### 7.2 Keputusan yang belum diambil

Bagian ini sengaja ada. Setiap item di sini butuh keputusan pemilik proyek sebelum coding dimulai.

Nama produk sudah diputuskan, yaitu "Rapi Nikah" (lihat `CHANGELOG.md` 0.14.0), jadi baris itu tidak lagi ada di daftar di bawah.

| Keputusan | Opsi | Kenapa ini penting | Kapan harus diputuskan |
|---|---|---|---|
| Detail Hari-H | Tanggal, jam, alamat lokasi | Semua reminder bergantung pada ini | Saat langkah pertama |
| Sumber data untuk kalender | Milik sendiri, atau pustaka pihak ketiga | Pustaka pihak ketiga menambah dependensi | Saat implementasi kalender |
| Metode pembayaran yang didukung | Transfer manual saja, atau plus e-wallet | Tidak ada payment gateway di Fase 1 | Saat implementasi budget |

Kalau pemilik proyek tidak tersedia, gunakan default yang ditandai di `docs/11-Delivery-Plan.md` dan tulis di sana sebagai keputusan sementara, bukan sebagai keputusan final.

---

## 8. Kapan Fase 1 dianggap selesai

Fase 1 selesai kalau semua ini benar:

- [ ] Pasangan bisa membuat akun, membuat rencana, dan mencatat tugas tanpa bantuan siapa pun
- [ ] Semua tugas punya tanggal jatuh tempo, dan tugas lewat ditandai berbeda secara visual
- [ ] Total budget, sudah terbayar, dan sisa bisa dilihat di satu layar
- [ ] Pembayaran vendor bisa dicatat dan totalnya langsung berubah
- [ ] Daftar tamu bisa ditambah, diedit, dan dihapus. Ekspor daftar tamu ke PDF belum dibangun, jadi baris ini belum bisa dicentang penuh
- [ ] Aplikasi bisa dipasang ke layar utama di Android dan iOS
- [ ] Aplikasi tetap membuka tugas, budget, dan daftar tamu saat offline
- [ ] Aplikasi bisa dipakai di lebar 360px tanpa ada elemen yang keluar dari layar
- [ ] Semua tampilan punya state loading, kosong, error, dan offline
- [ ] Semua kontrol bisa dioperasikan dengan keyboard, dengan indikator fokus yang terlihat

Kalau ada satu saja yang belum, Fase 1 belum selesai, meskipun fiturnya sudah ada semua.
