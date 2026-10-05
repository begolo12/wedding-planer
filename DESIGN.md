# DESIGN.md: Rapi Nikah Wedding Planner

Status: v3.0, arah "Warm Modern Romance & Atelier Luxe".
Arah ini memperbarui v2.0 untuk menghilangkan kesan kaku, datar, dan seperti formulir kawat. Tampilannya kini memancarkan kehangatan perayaan pernikahan modern, kedalaman permukaan bertingkat (layered depth), serta interaksi yang luwes dan anggun, namun tetap ringan dan cepat diakses di lokasi sinyal minim.

---

## 1. Design Read

> Membaca dokumen ini sebagai: **alat kerja pribadi yang hangat, elegan, dan membahagiakan untuk pasangan yang sedang menyiapkan pernikahan**, dengan bahasa visual "buku perencana butik modern", dial **ENERGY 2.5 / RHYTHM 2.5 / MOTION 2**.

Alasan pemilihan dial:

- **ENERGY 2.5** (naik dari 2.0). Pernikahan adalah peristiwa sekali seumur hidup yang penuh luapan cinta dan harapan. Energy 2.0 yang terlalu datar membuat aplikasi terasa seperti spreadsheet inventaris kantor yang dingin dan kaku. Energy 2.5 menghadirkan kehangatan selebrasi lewat aksen champagne dan blush yang bercahaya lembut, tanpa menjadi norak atau membuat mata lelah saat mengelola ratusan data tamu dan pos anggaran.
- **RHYTHM 2.5** (naik dari 2.0). Memberikan ritme visual yang bervariasi secara alami. Elemen utama (hero hari-H, kartu progres, ringkasan saldo) memiliki bobot visual dan ruang bernapas yang lebih megah, sementara daftar operasional (baris tugas, tabel tamu) tetap ramping, rapi, dan mudah dipindai.
- **MOTION 2** (naik dari 1.0). Ketiadaan gerak pada v2.0 membuat aplikasi terasa beku dan kaku saat disentuh. Motion 2 menghadirkan respons mikro taktil: kompresi lembut saat tombol ditekan, pengangkatan halus pada kartu tautan, dan transisi tab yang mengalir luwes (`180ms` hingga `240ms` dengan kurva pegas alami). Tetap disiplin tanpa animasi gulir berat yang menghambat koneksi lambat.

---

## 2. Identitas

### Nama produk

`Rapi Nikah` adalah nama produk resmi.
Nama pasangan pemakai diambil dinamis dari profil rencana pengguna, bukan ditulis paten di dalam kode maupun dokumen desain.

### Suara dan nada (voice & tone)

Produk ini berbicara seperti sahabat perencana pernikahan berpengalaman: hangat, menenangkan, solutif, dan menggunakan bahasa Indonesia yang akrab:

- Gunakan "undangan", bukan "guest management system"
- Gunakan "bayar DP", bukan "installment commitment"
- Gunakan "rundown hari-H", bukan "event breakdown schedule"
- Uang selalu dituliskan lengkap dalam format rupiah: `Rp 4.500.000`
- Tanggal di naskah produk memakai format alami: `30 Juni 2026`

---

## 3. Palet Warna dan Materialitas

Prinsip warna: kehangatan organik, kontras tinggi yang teruji, dan kedalaman berlapis yang luwes.

| Peran | Nama | Nilai | Alasan dan Karakter |
|---|---|---|---|
| Kanvas Utama | Ivory Silk | `#FCF9F5` | Krem sutra alami, lebih hangat dan tidak melelahkan mata dibanding putih murni di bawah terik matahari venue. |
| Permukaan Kartu | Pure Pearl | `#FFFFFF` | Putih bersih mutiara untuk kartu dan panel isian, memberi pendar kontras bersih di atas kanvas krem. |
| Tinta Utama | Velvet Charcoal | `#382A32` | Cokelat tua beludru keunguan. Jauh lebih hangat dan anggun dari hitam pekat, dengan kontras tajam melebihi 10:1 di atas kanvas. |
| Core 1, Blush | Rose Quartz | `#FFA8B8` | Warna cinta yang hangat dan memikat. Dipakai sebagai isian tombol utama dan penanda fokus selebrasi. |
| Core 2, Peach | Warm Honey | `#FED5B9` | Sentuhan madu hangat penyeimbang blush, dipakai pada gradasi hero, kartu sorotan, dan chip pelengkap. |
| Aksen Mewah | Champagne Gold | `#E2B887` | Aksen selebrasi untuk pencapaian, bintang vendor, dan penanda momen penting. |
| Status Baik | Orchid Plum | `#66556B` | Ungu plum berwibawa untuk status tuntas, lencana aman, dan ikon navigasi aktif. |
| Teks Aksen & Fokus | Deep Berry | `#864E5A` | Blush pekat terukur untuk teks aksen kecil dan cincin fokus keyboard, lolos rasio 6.36:1. |
| Tinta Sekunder | Heather Muted | `#6E6268` | Abu-abu keunguan lembut yang tetap terbaca jelas (lolos rasio 5.4:1). |
| Garis Struktur | Rose Satin Border | `#E6D5D8` | Garis batas tipis bernuansa mawar lembut, memisahkan bagian tanpa kekakuan kawat hitam. |
| Peringatan & Galat | Crimson Velvet | `#BA1A1A` | Merah anggun untuk pos anggaran yang melebihi batas atau peringatan penting. |

### Token Tema di `globals.css`

Nama token lama dipertahankan demi kompatibilitas menyeluruh dengan komponen yang sudah berjalan, namun disempurnakan nilainya:

```css
@theme {
  --color-base: #fcf9f5;
  --color-ink: #382a32;
  --color-sage: #66556b;
  --color-terracotta: #ffa8b8;
  --color-marigold: #864e5a;
  --color-netral: #fbf0f4;
  --color-bata: #ba1a1a;
  --color-line: #e6d5d8;
  --color-muted: #6e6268;
  --color-kartu-putih: #ffffff;
  --color-aksen-gelap: #7b4551;
  --color-badge-latar: #fed5b9;
  --color-badge-teks: #744e32;
  --color-di-atas-blush: #382a32;
}
```

### Mode Gelap (Midnight Velvet)

Mode gelap dirancang khusus untuk kenyamanan pasangan yang meninjau rencana di malam hari:

| Token | Mode Gelap | Peran |
|---|---|---|
| `--color-base` | `#1A1317` | Latar beludru malam yang pekat dan mewah |
| `--color-kartu-putih` | `#281E24` | Permukaan kartu dengan sentuhan kilau lembut di tepian |
| `--color-ink` | `#F8ECF2` | Teks krem mawar yang kontras dan nyaman di mata |
| `--color-netral` | `#22191F` | Latar panel dan input sekunder |
| `--color-line` | `#483741` | Garis batas struktural mode malam |
| `--color-muted` | `#B0A0A7` | Teks sekunder yang tetap tajam terbaca |

---

## 4. Tipografi dan Irama Editorial

Tipografi memadukan kepraktisan aplikasi kerja modern dengan pesona undangan butik.

| Peran | Typeface | Karakter |
|---|---|---|
| Judul & Tampilan | `Plus Jakarta Sans` | Bulat, anggun, bersahabat, dengan *letter-spacing* yang sedikit merapat (`-0.025em`) untuk display berkarakter mewah. |
| Isi Teks & Data | `Be Vietnam Pro` | Tajam, bersih, dan sangat mudah dibaca cepat dalam berbagai ukuran layar. |
| Angka Finansial | `Be Vietnam Pro` (`tabular-nums`) | Sejajar sempurna pada kolom anggaran dan waktu rundown. |

### Skala Hierarki Visual

| Nama | Ukuran | Berat | Line-Height | Tracking | Pemakaian |
|---|---|---|---|---|---|
| display | 40px | 700 | 1.1 | `-0.025em` | Angka hitung mundur hari-H, judul sambutan beranda |
| display-mobile | 32px | 700 | 1.15 | `-0.02em` | Judul hero di layar ponsel |
| headline-lg | 26px | 600 | 1.25 | `-0.015em` | Judul utama layar modul |
| headline-md | 20px | 600 | 1.3 | `-0.01em` | Judul kartu ringkasan dan seksi |
| headline-sm | 17px | 600 | 1.35 | `0` | Sub-seksi dan nama vendor/tamu |
| body-lg | 16px | 400 | 1.5 | `0` | Paragraf pengantar dan catatan utama |
| body-md | 14px | 400 | 1.45 | `0.005em` | Teks isi tugas, deskripsi, keterangan |
| label-lg | 14px | 600 | 1.4 | `0.015em` | Teks tombol utama, tab aktif |
| label-md | 12px | 600 | 1.35 | `0.025em` | Label kolom, chip filter, status |
| label-sm | 11px | 700 | 1.3 | `0.04em` | Eyebrow teks dan lencana kecil |

---

## 5. Geometri dan Kedalaman Permukaan (Anti-Kaku)

Perubahan fundamental dari v2.0 yang membuat aplikasi tidak lagi kaku:

### 1. Kurvatur Luwes (Fluid Organic Curvature)

Kekakuan v2.0 bersumber dari perpaduan ekstrem antara tombol pil lonjong `9999px` dengan kartu kotak bergaris kaku. Pada v3.0, geometri diselaraskan menjadi satu keluarga kurva modern:

- **Tombol & Kontrol Utama:** Radius lengkung ergonomis `16px` (`--radius-tombol`). Bentuk ini memberi postur arsitektural yang mantap, berkelas, tidak seperti pil kapsul obat, dan sangat nyaman disentuh jempol.
- **Kartu & Wadah (Cards):** Radius `24px` (`1.5rem`), sudut melengkung anggun yang membingkai informasi dengan ramah.
- **Panel Besar & Modal:** Radius `28px` hingga `32px` untuk kesan mewah layaknya lembaran buku pernikahan fisik.
- **Chip & Lencana Status:** Tetap memakai pil penuh `9999px` karena ukurannya yang kompak dan peranannya sebagai penanda ringkas.

### 2. Kedalaman Berlapis (Layered Depth Craft)

Kartu tidak lagi digambar sebagai kotak datar bergaris kawat tipis. Setiap permukaan memiliki pendar mikro:

- **Specular Inner Highlight:** Garis kilau dalam ultra-tipis di sisi atas kartu:
  `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), var(--bayang-1);`
  Di mode gelap:
  `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), var(--bayang-1);`
  Efek ini menciptakan kesan permukaan mutiara yang halus tanpa membebani performa perangkat.
- **Luminous Micro-Borders:** Border menggunakan sapuan warna satin yang menyatu dengan kanvas:
  `border: 1px solid color-mix(in srgb, var(--color-ink) 7%, var(--color-terracotta) 12%);`
- **Atmospheric Dual-Layer Shadows:**
  - `--bayang-1` (kartu bertengger): `0 8px 24px -4px rgba(56, 42, 50, 0.05), 0 2px 8px -2px rgba(255, 168, 184, 0.12)`
  - `--bayang-2` (kartu mengambang / dialog): `0 16px 36px -6px rgba(56, 42, 50, 0.09), 0 4px 16px -2px rgba(255, 168, 184, 0.2)`
  - `--bayang-tombol`: `0 6px 18px -3px rgba(255, 168, 184, 0.45)`

### 3. Gradasi dan Atmosfer Lembut

Larangan keras gradasi pada v2.0 dicabut secara terukur untuk mengembalikan kehangatan:

- **Hero Beranda:** Gradasi radial-linier organik `135deg` memadukan Blush Silk lembut (`#FBF0F4`), Rose Quartz pudar, dan Warm Honey keemasan (`#FED5B9`), membangkitkan suasana mentari pagi hari pernikahan.
- **Kartu Progres & Sorotan:** Diberi sentuhan gradasi halus `180deg` dari putih mutiara ke satin mawar tipis (`rgba(251, 240, 244, 0.6)`), menghapus kesan balok kaku.
- **Aura Latar Belakang (Atmospheric Ambient Glow):** Di bagian atas halaman aplikasi terdapat pendaran gradasi sangat lembut yang membaur ke kanvas, memberi dimensi kedalaman saat digulir.

---

## 6. Mikro-Interaksi dan Sentuhan Hidup (Fluid Feedback)

Aplikasi harus terasa merespons setiap sentuhan pengguna dengan luwes:

1. **Efek Tekan Lembut (Tactile Spring):**
   Tombol dan kartu interaktif menyusut mikro sebesar `scale(0.98)` saat ditekan (`:active`), dengan transisi pegas:
   `transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease, background 0.16s ease;`
2. **Peningkatan Kartu Saat Didekati (Hover Lift):**
   Kartu tautan terangkat secara anggun `translateY(-2px)` dengan peningkatan bayangan lembut, memberi tahu pengguna dengan jelas bahwa elemen tersebut dapat dijelajahi.
3. **Peralihan Tab Mengalir:**
   Garis bawah atau bidang tab aktif bergeser mulus tanpa kejutan visual.
4. **Indikator Progres Hidup:**
   Batang kemajuan tugas dan anggaran memiliki pendaran halus di ujung batang terisi, merayakan setiap langkah kemajuan persiapan pernikahan.

---

## 7. Tata Letak dan Komposisi Layar

### Struktur Layar Desktop (lebar 1024px ke atas)

- **Kontainer Utama:** Maksimal `1200px` terpusat di tengah dengan padding sisi `32px`, memberikan ruang bernapas yang cukup di layar besar tanpa menyisakan kekosongan canggung.
- **Kepala Halaman:** Terdiri dari judul besar yang hangat, deskripsi satu kalimat yang memotivasi, dan tombol aksi utama yang terpasang rapi di kanan.
- **Grid Dua Kolom Responsif (`.grid-daftar`):**
  Rasio kolom `1.6fr : 1fr` (sekitar 61% kolom daftar utama berbanding 39% rel pendamping).
  - Kolom utama: untuk tabel kerja interaktif, daftar pos pengeluaran, daftar tamu, dan alur rundown.
  - Rel pendamping (`.rel-samping`): untuk kartu progres ringkasan, aksi cepat, dan panduan kontekstual.
- **Layar Ponsel (Mobile 390px - 768px):**
  Satu kolom penuh vertikal yang nyaman dijempol, tanpa geseran mendatar sekecil apa pun, dengan target sentuh minimal `44x44px` di setiap kontrol interaktif.

---

## 8. Empat Keadaan Tampilan (States)

Setiap layar data wajib memiliki 4 keadaan visual yang dirancang matang:

1. **Keadaan Memuat (Loading):** Skeleton shimer lembut dengan kurvatur yang persis sama dengan kartu aslinya, menghindari lompatan tata letak (*layout shift*).
2. **Keadaan Kosong (Empty):** Bukan sekadar teks dingin "Tidak ada data". Berisi ilustrasi motif garis atau cincin lembut, kalimat sapaan yang membimbing, dan tombol ajakan bertindak yang jelas.
3. **Keadaan Galat (Error):** Menjelaskan kendala secara jujur dan manusiawi, disertai tombol "Coba lagi" yang langsung mengulang proses tanpa perlu menyegarkan seluruh halaman.
4. **Keadaan Luring (Offline):** Pita lembut yang menenangkan di bagian atas, memastikan pengguna bahwa seluruh perubahan tersimpan aman di perangkat dan akan tersinkronisasi otomatis saat sinyal kembali.

---

## 9. Yang Dihindari dan Alasannya

| Yang Dihindari | Alasan |
|---|---|
| Border tebal kaku seragam | Memberikan kesan aplikasi formulir kawat/spreadsheet birokrasi yang dingin. Diganti dengan luminous micro-borders satin. |
| Tombol lonjong ekstrem 9999px yang seragam di semua tempat | Membuat kontrol terasa seperti kapsul mainan kaku. Diganti dengan radius ergonomis 16px untuk tombol utama dan 24px untuk kartu. |
| Bayangan hitam pekat mati | Merusak nuansa warna krem dan blush. Seluruh bayangan wajib memiliki penumbra hangat bertint rose/peach. |
| Tulisan blush muda di atas kanvas putih/krem | Gagal rasio kontras 4.5:1. Tulisan aksen wajib memakai Deep Berry `#864E5A`. |
| Sudut tajam tanpa kurvatur | Terasa menusuk dan tidak mencerminkan kelembutan suasana pernikahan. |
| Animasi dekoratif yang memperlambat alur kerja | Pasangan sering membuka aplikasi di lokasi pesta dengan koneksi terbatas. Seluruh animasi wajib instan dan fungsional. |
| Teks bahasa Inggris campur aduk | Menjaga kenyamanan keluarga dan pasangan Indonesia agar seluruh istilah mudah dipahami semua pihak. |

---

## 10. Catatan Perubahan dan Keputusan Desain

| Versi | Perubahan Utama | Alasan |
|---|---|---|
| v1.0 | Arah awal sage dan terracotta | Palet dasar rencana kerja |
| v2.0 | "Blushing Romance", palet blush dan soft cream | Menyesuaikan rujukan Stitch dan menyatukan token |
| v3.0 | "Warm Modern Romance & Atelier Luxe": kurvatur 16px/24px luwes, luminous inner-borders, layered warm ambient shadows, micro-spring interactions, tipografi editorial | Menghilangkan kesan kaku, dingin, dan seperti formulir kawat; menghadirkan tampilan pernikahan yang hangat, berkelas, luwes, dan bernilai jual tinggi |
