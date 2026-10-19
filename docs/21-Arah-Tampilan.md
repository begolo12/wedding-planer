# 21. Arah Tampilan: Kedai Undangan

Status: v6.0. Arah ini menggantikan arah "Padat dan Cepat" v5.0.

Dokumen ini adalah tempat tinggal aturan tampilan. Tidak ada berkas kedua yang menulis warna, bentuk, atau nada bahasa. Berkas `DESIGN.md` lama sudah dihapus, dan seluruh rujukan ke berkas itu sudah dialihkan ke dokumen ini.

Cara membangun tampilan di dokumen ini mengikuti panduan desain frontend dari `anthropics/skills` (skill `frontend-design`): tentukan subjeknya lebih dulu, pilih arah yang punya alasan, baru tulis kode. Bagian 8 memuat catatan kepatuhan terhadap panduan itu, termasuk hal yang sengaja tidak dipakai.

---

## 1. Subjek dan pembaca

Produk ini dipakai oleh pasangan di Indonesia yang sedang menyiapkan pernikahan. Mereka membukanya di HP sambil berjalan, di lokasi acara, dan di sela pekerjaan. Yang mereka urus bukan metrik, tapi daftar: siapa yang diundang, apa yang belum dibayar, jam berapa semua dimulai.

Subjek yang dipakai sebagai sumber bentuk adalah benda yang benar-benar ada di dunia mereka: **kartu undangan cetak**. Bukan situs pernikahan bunga-bunga, bukan dasbor SaaS, tapi undangan. Undangan bagus dicetak di kertas tebal berwarna gading, memakai satu tinta gelap yang pekat, dan menaruh huruf besar untuk nama. Warnanya dua, bukan lima. Ruang putihnya disengaja. Tidak ada yang diletakkan hanya supaya halaman terlihat penuh.

Pekerjaan utama setiap layar ada satu:

| Layar | Pekerjaan |
|---|---|
| Beranda | Menjawab "berapa hari lagi dan apa yang paling dekat" dalam sepuluh detik. |
| Rencana | Membuat satu tugas jelas selesai atau belum, tanpa membaca ulang. |
| Anggaran | Memperlihatkan selisih antara rencana dan kenyataan. |
| Tamu | Menemukan satu orang di antara ratusan. |
| Hari-H | Bisa dibuka di lokasi, satu tap, tanpa sinyal. |

---

## 2. Warna

Prinsip: kertas gading, satu tinta, satu aksen. Tidak ada gradasi.

| Peran | Nama | Nilai | Karakter |
|---|---|---|---|
| Kanvas | Kertas | `#F4F2EA` | Putih gading dengan kehangatan, bukan putih murni. Kartu putih tidak akan terlihat putih di atasnya. |
| Permukaan | Putih | `#FFFFFF` | Bidang yang dibaca sebagai satu kesatuan: form, daftar, kartu. |
| Permukaan recessed | Recessed | `#EAE6DB` | Naik satu tingkat dari kertas. Dipakai untuk blok di dalam bidang. |
| Tinta | Tinta | `#1B1B21` | Hitam kebiruan, bukan hitam murni. Kontras 15,1:1 di atas kertas. |
| Tinta sekunder | Tinta pudar | `#57544E` | Keterangan baris, label kolom. Kontras 7,1:1 di atas kertas, 7,6:1 di atas putih. |
| Garis | Rambut | `#DDD6C8` | Satu nilai untuk semua garis 1px dan pemisah baris. |
| Aksen | Aksen | `#B23A2E` | Satu-satunya warna kuat. Dipakai untuk angka hitung mundur, tombol utama, dan penanda aktif. |
| Gagal | Merah | `#BA1A1A` | Galat dan nilai lewat jatah. Satu-satunya merah selain aksen, dan hanya untuk keadaan gagal. |

Angka kontras di tabel atas diukur dengan rumus WCAG 2.1, bukan diperkirakan.

Aturan pakai warna:

- Warna kuat hanya aksen, dan maksimal **satu bidang aksen besar per layar**. Kalau tombol utama sudah memakai aksen, kartu sorotan memakai latar neutral.
- Warna tidak pernah jadi satu-satunya penanda. Item aktif, status, dan galat selalu punya kata atau bentuk pendamping.
- Teks di atas aksen selalu `#FFFFFF` (4,8:1).
- Tidak ada gradasi di mana pun. Satu warna rata lebih cepat dirender dan lebih cepat dibaca.

### Token di `globals.css`

Nama token lama dipertahankan karena lebih dari 130 pemakaian di 20 berkas memanggilnya langsung.

```css
@theme {
  --color-base: #f4f2ea;
  --color-ink: #1b1b21;
  --color-sage: #b23a2e;          /* aksen */
  --color-terracotta: #b23a2e;    /* alias aksen */
  --color-marigold: #b23a2e;      /* alias aksen, dipakai cincin fokus */
  --color-netral: #eae6db;
  --color-bata: #ba1a1a;
  --color-line: #ddd6c8;
  --color-muted: #57544e;
  --color-kartu-putih: #ffffff;
  --color-aksen-permukaan: #b23a2e; /* bidang aksen yang menahan teks putih */
  --color-aksen-gelap: #932f25;     /* hover tombol aksen */
  --color-di-atas-blush: #ffffff;
}
```

### Mode gelap "Plum Ink"

| Token | Mode gelap | Peran |
|---|---|---|
| `--color-base` | `#0E0E14` | Latar aplikasi |
| `--color-kartu-putih` | `#15151D` | Permukaan bidang |
| `--color-ink` | `#EDEBE6` | Teks utama |
| `--color-netral` | `#1C1C24` | Permukaan recessed |
| `--color-line` | `#2E2E39` | Garis dan pemisah |
| `--color-muted` | `#A8A49C` | Teks sekunder |
| `--color-sage` dan aliasnya | `#E8756A` | Aksen yang juga jadi warna teks |
| `--color-aksen-permukaan` | `#B23A2E` (tetap) | Bidang aksen |

Aturan mode gelap: token `sage`, `terracotta`, `marigold`, dan `primary` berbalik jadi nilai terang karena dipakai juga sebagai warna teks dan ikon. Karena itu token tersebut **tidak pernah** dipakai sebagai latar yang menahan teks putih. Untuk bidang aksen, pakai `--color-aksen-permukaan` yang nilainya tetap di kedua tema.

---

## 3. Tipografi

Dua keluarga huruf, dibagi menurut pekerjaan, bukan menurut tingkat kepentingan.

| Keluarga | Peran | Alasan |
|---|---|---|
| `Anton` | Angka hitung mundur dan nama produk. | Tinggi, rapat, punya tekanan vertikal. "37" terbaca sebagai angka yang dihitung menuju sesuatu. Tidak punya huruf kecil, jadi tidak pernah dipakai untuk kalimat. |
| `Source Sans 3` | Seluruh teks yang dibaca. | Ramping, punya angka tabular, dan netral di ukuran kecil. Angka rupiah tetap sejajar kolomnya. |

Keduanya diunduh dari satu sumber lewat `next/font`, jadi tidak ada permintaan pihak ketiga.

| Peran | Ukuran | Berat | Line-height | Pemakaian |
|---|---|---|---|---|
| display | `clamp(3.25rem, 2.2rem + 4.4vw, 4.75rem)` | 400 Anton | 0.95 | Satu angka hitung mundur per layar |
| h1 | `clamp(1.5rem, 1.35rem + 0.7vw, 1.875rem)` | 600 | 1.15 | Judul layar |
| h2 | `clamp(1.25rem, 1.15rem + 0.45vw, 1.5rem)` | 600 | 1.2 | Judul bagian |
| h3 | `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` | 600 | 1.25 | Judul grup |
| base | `clamp(0.9375rem, 0.9rem + 0.15vw, 1rem)` | 400 | 1.5 | Teks isi |
| kecil | `0.8125rem` | 400 | 1.45 | Keterangan baris, label kolom |
| mini | `0.6875rem` | 500 | 1.4 | Catatan kecil, label tab bawah |
| angka-baris | `0.875rem` | 600 | 1.4 | Angka di dalam baris nilai |

Aturan angka:

- Semua angka finansial dan waktu memakai `font-variant-numeric: tabular-nums` supaya kolom sejajar.
- Angka di dalam baris nilai memakai Source Sans 3, bukan Anton. Anton tidak punya angka tabular, dan kalau semua angka besar tidak ada yang menonjol.
- Angka besar hanya satu per layar.

Aturan label:

- Label tidak ditulis dengan huruf besar semua dan tidak diberi jarak antarhuruf lebar. Keduanya adalah tanda paling umum tulisan yang belum dipilih.
- Label dibedakan dari judul lewat warna, dan dibedakan dari isi lewat jarak di atasnya.

---

## 4. Bentuk dan kedalaman

### Tiga tingkat permukaan

| Tingkat | Bentuk | Dipakai untuk | Batas |
|---|---|---|---|
| Kertas | Tanpa wadah sama sekali | Kepala layar, angka besar, catatan satu baris | Tanpa batas |
| Bidang | Satu permukaan putih, radius 14px, garis 1px, baris di dalamnya dipisah garis rambut | Form, daftar, kartu | Tidak dibatasi |
| Recessed | Permukaan `--color-netral`, tanpa garis, di dalam Bidang | Blok statistik, pratinjau, catatan di dalam bidang | Tidak dibatasi |

**Tepi di dalam tepi tidak dipakai.** Di situlah tampilan mulai terasa seperti susunan komponen, bukan satu halaman. Bidang di dalam Bidang memakai tingkat Recessed, yang tidak punya garis sama sekali.

Yang tidak dibungkus Bidang: setiap bagian yang isinya satu baris teks, setiap saringan, setiap catatan, dan kepala setiap layar.

### Radius

| Elemen | Radius |
|---|---|
| Bidang, input, tombol, modal, lembar | `14px` |
| Badge, chip, lencana, penanda kecil | `8px` |
| Batang penanda, bar progres, kotak centang | `4px` |
| Elemen yang memang bulat: lingkaran ikon, titik, jalur sakelar | pill |

Batas yang mudah salah: **tombol aksi selalu ada di tingkat Bidang**, jadi radiusnya `14px` walaupun tombolnya kecil. Chip yang cuma keterangan memakai `8px`. Kalau tombol aksi dan chip keterangan memakai bentuk yang sama, orang tidak bisa membedakan mana yang bisa ditekan.

### Kedalaman

- Garis `1px solid #DDD6C8` pada Bidang, input, dan dialog. Inilah struktur layar, bukan bayangan.
- Baris di dalam satu Bidang dipisah garis rambut `1px` penuh, bukan tiap baris dibungkus Bidang sendiri.
- Bayangan nyaris tidak terlihat: `0 1px 2px rgba(27, 27, 33, 0.04)`. Hanya untuk elemen yang benar-benar mengambang: toast dan dialog.
- Tidak ada gradasi, tidak ada inner highlight, tidak ada bayangan berlapis.
- Hover dan fokus bergeser warna garis, `150ms ease`.

### Progres

Track `--color-netral`, isian aksen, tinggi 4px sampai 6px, ujung `4px`. Dipakai hemat: hanya di tempat angkanya memang kemajuan.

---

## 5. Pola layar

Empat pola ini dipakai ulang di semua layar. Kalau sebuah layar butuh bentuk kelima, alasannya ditulis di berkas layar itu.

### Pola 1: Baris nilai

Untuk data yang dibaca, bukan diklik.

```text
Label                          Rp 108.000.000
Keterangan kecil
```

- Label kiri, angka kanan rata dengan `tabular-nums`.
- Keterangan kecil di bawah label, warna `--color-muted`.
- Tinggi baris minimum 44px.
- Tidak ada garis per baris kecuali pemisah dari induknya.

### Pola 2: Baris isi

Untuk item yang punya aksi: tugas, tamu, vendor, acara rundown.

```text
[ ] Judul item                    [badge]
    Keterangan kecil
```

- Tinggi baris minimum 56px supaya dua baris teks dan target sentuh 44px tetap muat.
- Aksi utama di kiri atau seluruh baris bisa diketuk.
- Aksi sekunder disembunyikan di balik satu tombol menu, bukan deretan tombol di tiap baris.

### Pola 3: Kartu sorotan

Satu per layar, paling banyak.

```text
┌────────────────────────────┐
│         37                 │
│   hari menuju 14 November  │
│  ────────┬────────┬───────  │
│   Tugas  │ Hadir  │  Dana   │
└────────────────────────────┘
```

- Angka memakai `display` dengan Anton, keterangan memakai `kecil`.
- Latar putih. Kalau tombol utama layar itu sudah memakai aksen, kartu ini tidak ikut memakai aksen.

### Pola 4: Lembar saringan

Semua saringan (pencarian, kategori, status, urutan, tampilkan selesai) masuk ke satu lembar bawah, dibuka dari satu tombol yang menampilkan jumlah saringan aktif.

- Di lebar 390px, lima kontrol bertumpuk menghabiskan lebih dari 250px tinggi dan mendorong isi ke bawah lipatan.
- Tombolnya berbunyi "Saring" plus angka kalau ada yang aktif.
- Saringan aktif tetap terlihat sebagai chip kecil di bawah kepala layar, maksimal satu baris.

---

## 6. Interaksi

1. **Transisi warna saja.** Semua state berganti warna dan garis, `150ms ease`. Tidak ada `scale()`, tidak ada `translateY()`.
2. **Fokus keyboard.** Cincin `outline: 2px solid` warna aksen dengan offset `2px`.
3. **Tab bawah.** Tujuan aktif ditandai dua hal: warna ikon dan bilah tipis 2px di atas label. Tidak ada animasi indikator.
4. **Checkbox.** Kotak 20px, radius `4px`, garis `1px` warna muted. Terisi aksen dengan tanda putih saat aktif.
5. **Target sentuh.** Minimum `44x44px` untuk semua yang bisa diketuk.
6. **Gerak yang dihormati.** `prefers-reduced-motion: reduce` mematikan denyut kerangka muat.

### Empat keadaan tampilan

1. **Memuat:** kerangka warna `--color-netral`, radius `14px`, bentuk dan tinggi sama dengan isi aslinya supaya tata letak tidak melompat.
2. **Kosong:** satu kalimat penjelas dan satu tombol aksi. Tanpa ilustrasi dekoratif.
3. **Galat:** kalimat jujur tentang apa yang gagal, dan tombol "Coba lagi" yang mengulang prosesnya.
4. **Luring:** pita kecil di atas layar yang menjelaskan bahwa perubahan tersimpan di perangkat dan terkirim saat sinyal kembali.

---

## 7. Tata letak

### Ponsel (utama, 390px ke atas)

- Satu kolom penuh, padding sisi `16px`.
- Tab bawah tetap dengan enam sel: Beranda, Rencana, Hari-H, Anggaran, Tamu, Lainnya. Tinggi tiap item minimum `44px`.
- Tanpa geser mendatar.

### Desktop (1024px ke atas)

- Navigasi sisi kiri `240px`, kontainer isi maksimal `1100px`.
- Grid dua kolom `1.6fr : 1fr` untuk layar kerja: isi utama dan rel ringkasan.
- Tab bawah diganti navigasi sisi.

### Skala jarak

`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`. Yang berdekatan di dalam satu grup memakai `8px` atau `12px`, antar grup `16px`, antar bagian besar `24px` sampai `32px`.

### Target kepadatan

| Target | Nilai | Cara mengukur |
|---|---|---|
| Baris daftar | 44px minimum, 56px kalau dua baris | `getBoundingClientRect` |
| Isi pertama terlihat | dalam 200px dari atas area isi, tanpa menggulir di 390x844 | posisi baris pertama |
| Kepala layar | maksimal 88px termasuk judul dan aksi utama | `getBoundingClientRect` |
| Kontrol di badan layar | maksimal satu baris | hitung elemen kontrol sebelum baris pertama |
| Jarak antar grup | 16px | CSS |

---

## 8. Yang dihindari dan alasannya

| Yang dihindari | Alasan |
|---|---|
| Membungkus semua bagian dalam kartu | Kalau semua bagian sama, tidak ada yang menonjol. Sumber utama tampilan yang terasa rata. |
| Tepi kartu di dalam tepi kartu | Terbaca sebagai susunan komponen, bukan satu halaman. |
| Lebih dari satu angka besar per layar | Kalau semua besar, tidak ada yang menonjol. |
| Lebih dari satu bidang aksen besar per layar | Warna kehilangan fungsi penunjuk arah. |
| Label huruf besar semua dengan jarak antarhuruf lebar | Tanda paling umum tulisan yang belum dipilih, dan muncul tanpa alasan. |
| Angka tanpa keterangan | Pembaca menebak apa yang dihitung. |
| Angka yang sama ditulis dua kali dalam satu blok | Menambah tinggi tanpa menambah informasi. |
| Gradasi warna | Satu warna rata lebih cepat dirender dan lebih mudah dipindai. |
| Ilustrasi dekoratif di layar kosong | Tidak menambah kemampuan apa pun. |
| Tema ungu, lavender, atau blush pada alat pernikahan | Arah yang paling sering dipakai, jadi tidak membedakan apa pun. |

### Catatan kepatuhan pada panduan `frontend-design`

Panduan itu melarang beberapa pola karena semuanya dipakai tanpa alasan. Yang berikut sengaja dihindari di sini:

- Latar krem hangat dengan aksen terracotta yang jadi gaya bawaan banyak halaman. Kertas di sini `#F4F2EA` dengan aksen `#B23A2E` yang lebih gelap dan lebih pekat, dan aksennya dipakai hanya untuk angka hitung mundur, tombol utama, dan penanda aktif.
- Label huruf besar semua dengan jarak antarhuruf di atas setiap judul.
- Angka berurut `01 / 02 / 03` pada isi yang bukan urutan.
- Teks berformat `KATA - penggalan` dengan tanda pisah berspasi.
- Monospace untuk label data kecil.
- Tanda `→` di ujung teks tautan.
- Animasi masuk dan naik pada setiap bagian halaman.

### Nada bahasa

Produk ini bicara seperti sahabat yang sudah pernah mengurus pernikahan sendiri: hangat, tenang, dan memakai bahasa Indonesia yang akrab.

- "undangan", bukan "guest management system"
- "bayar DP", bukan "installment commitment"
- "rundown hari-H", bukan "event breakdown schedule"
- Uang selalu ditulis penuh: `Rp 4.500.000`
- Tanggal di teks tampil memakai format alami: `30 Juni 2026`

Setiap angka yang muncul menyebut apa yang dihitung. "10" tanpa keterangan membuat pembaca menebak apakah itu total, sisa, atau terlambat. Bentuk yang benar: "Tugas sisa 10", "20 dari 34 orang", "59% sudah konfirmasi".
