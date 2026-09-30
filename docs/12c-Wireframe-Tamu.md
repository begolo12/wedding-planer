# 12c. Wireframe Tamu

Daftar tamu, impor dari catatan, meja, dan status undangan. Modul yang paling besar secara data, tapi paling sering diisi dalam sekali duduk.

Tanda dan aturan umum ada di [`12-Wireframe.md`](12-Wireframe.md).

---

## 1. Daftar tamu

### Mobile

```text
+--------------------------------+
| < Tamu                         |
+--------------------------------+
| 312 orang  |  150 kursi        |
|                                |
| [Cari tamu.................]  |
|                                |
| [ Semua ] [ Belum ] [ Sudah ] |
| [ ] Semua Undangan dikirim       |
+--------------------------------+
| Keluarga pengantin     45 org |
| │ Bpk Budi, Ibu Sartika        |
| │ ( ) Undangan belum dikirim   |
| >                              |
|                                |
| Keluarga pihak lain     62 org |
| │ Bpk Budi, 3 orang             |
| │ Ibu Sari, 2 orang             |
| >                              |
|                                |
| Teman                  120 org |
| │ Saoedi                        |
| │ (o) Undangan dikirim         |
| >                              |
|                                |
| 245 dari 312 ditampilkan      |
|        [ Muat lebih ]           |
+--------------------------------+
|                            (+) |
+--------------------------------+
```

Jumlah orang dan jumlah kursi berdampingan karena itu dua pertanyaan berbeda: siapa yang datang, dan tempatnya cukup atau tidak.

Setiap tamu punya satu baris status undangan, dan statusnya punya tanda centang, bukan cuma warna.

### Desktop

```text
+----------------------------------------------------------------------+
| Tamu                                             [ Unduh ]  [ Impor ]|
+----------------------------------------------------------------------+
| 312 orang  |  150 kursi  |  67 belum kena undangan                  |
+----------------------------------------------------------------------+
| [Cari tamu..................] [ Semua ] [ Belum ] [ Sudah ]          |
+----------------------------------------------------------------------+
| Nama              Kategori       Org   Kursi  Undangan      HP     |
|------------------+--------------+------+-------+-------------+-------|
| Bpk Budi          Keluarga P     1    |       (o) dikirim   08...  |
| Ibu Sartika       Keluarga P     1    |       ( ) belum     08...  |
| Bpk Danu          Keluarga lain  3    |       ( ) belum     -      |
|                  |              |      |                      |      |
|                  |              |      |                      |      |
| 1 dari 312                                                     < 1 > |
+----------------------------------------------------------------------+
```

Di laptop semua kolom tampil, karena yang perlu dilihat memang perbandingannya. Di HP kolom disembunyikan, bukan tabel yang bisa digeser ke samping.

---

## 2. Tambah satu tamu

```text
+--------------------------------+
| <  Tambah tamu                 |
+--------------------------------+
| Nama                           |
| [ Bpk Danu                  ]  |
|                                |
| Kategori                       |
| [ Keluarga besar           v ] |
|                                |
| Jumlah orang                   |
| [ 3 ] orang                    |
|                                |
| Nomor HP (boleh kosong)        |
| [ 0812 3456 7890            ]  |
|                                |
| Sisi keluarga                  |
| ( ) Pria                        |
| (o) Wanita                     |
|                                |
+--------------------------------+
| [ Batal ]      [ Simpan tamu ] |
+--------------------------------+
```

Jumlah orang ada karena satu nama bisa mewakili satu keluarga besar. Kalau tidak ada kolom ini, satu baris jadi tiga baris dan rekap tidak benar.

Nomor HP opsional. Banyak tamu tidak punya nomor, dan memaksa mengisinya membuat orang mengarang nomor supaya form bisa disimpan.

---

## 3. Tempel daftar tamu

### Step 1, tempel

```text
+--------------------------------+
| < Tempel daftar tamu     1 / 2|
+--------------------------------+
| Tempel dari WhatsApp atau      |
| Excel, satu tamu per baris     |
|                                |
| Ahmad, 3                       |
| Ibu Ratna, 2                   |
| Bpk Danu, 3                    |
| Ibu Tini,                      |
|                                |
+--------------------------------+
| 4 baris terbaca                |
|                                |
| [ Lanjut ]                     |
+--------------------------------+
```

### Step 2, pratinjau

```text
+--------------------------------+
| < Tempel daftar tamu     2 / 2|
+--------------------------------+
| Akan ditambah ke              |
| [ Keluarga pihak lain      v ] |
|                                |
| (o) Ahmad, 3 orang             |
| (o) Ibu Ratna, 2 orang         |
| ( ) Bpk Danu, 3 orang          |
|                                |
+--------------------------------+
| (o) Ibu Tini                  |
| │ Nama sudah ada, jumlah belum |
+--------------------------------+
|                                |
| [ Kembali ]   [ Simpan 3 tamu ]|
+--------------------------------+
```

Ada dua langkah, bukan satu. Kalau langsung disimpan, baris yang salah ikut masuk dan baru ketahuan setelah tamu membalas").

Dua baris yang perlu diperbaiki diberi tanda dan kalimatnya, bukan cuma warna kuning supaya tidak bisa diabaikan.

---

## 4. Detail tamu

```text
+--------------------------------+
| < Bpk Danu                     |
+--------------------------------+
| Keluarga pihak lain            |
| 3 orang                        |
| 0812 3456 7890                 |
|                                |
| Kursi  Meja 3                  |
|                                |
+--------------------------------+
| Undangan                       |
| (o) Dikirim  12 Mei 2026       |
| ( ) Belum dikirim              |
|                                |
| Hadir?                         |
| ( ) Belum ditanya              |
| (o) Datang                    |
| ( ) Tidak datang               |
|                                |
| Kado atau angpau                |
| [ Rp 500.000               ]  |
|                                |
+--------------------------------+
| [ Hapus tamu ]                 |
+--------------------------------+
```

Angpau ada di detail tamu, bukan di catatan terpisah. Kado dan angpau datang bersama tamu, jadi mencarinya di tempat lain membuat pasangan lupa.

---

## 5. Meja

### Mobile

```text
+--------------------------------+
| < Meja                         |
+--------------------------------+
| 150 kursi  |  312 tamu masuk   |
+                                |
+ [ Gambar denah ]  [ Daftar ]   |
+--------------------------------+
|                                |
|        MEJA 1                  |
|      ( )  ( )  ( )  ( )        |
|      ( )  ( )  ( )  ( )        |
|                                |
|        MEJA 2                  |
|      ( )  ( )  ( )  ( )        |
|      ( )  ( )  ( )  ( )        |
|                                |
|        MEJA 3                  |
|      ( )  ( )  ( )  ( )        |
|      ( )  ( )  ( )  ( )        |
|                                |
+--------------------------------+
|                            (+) |
+--------------------------------+
```

Denah pakai kotak, bukan peta. Yang perlu diketahui adalah siapa di meja mana, dan itu soal jarak bukan bentuk ruangan.

Ada dua tampilan: gambar dan daftar. Di lokasi, daftar lebih berguna karena lebih cepat dibaca di layar kecil.

---

## 6. Empat tampilan pada layar tamu

### Memuat

```text
+--------------------------------+
| < Tamu                         |
+--------------------------------+
| - - - - - - - - - - - - - - -  |
| - - - - - - - - - - - - - - -  |
| - - - - - - - - - - - - - - -  |
| - - - - - - - - - - - - - - -  |
+--------------------------------+
```

### Kosong

```text
+--------------------------------+
| < Tamu                         |
+--------------------------------+
|                                |
|     Belum ada tamu              |
|                                |
|   Tempel dari WhatsApp supaya   |
|   tidak perlu menulis satu     |
|   per satu.                    |
|                                |
|   [ Tempel daftar ]             |
|   [ Tambah satu tamu ]          |
+--------------------------------+
```

### Gagal

```text
+--------------------------------+
| < Tamu                         |
+--------------------------------+
|                                |
|  Daftar tamu gagal dimuat.     |
|  Bukan salahmu, coba lagi.     |
|                                |
|  [ Coba lagi ]                 |
+--------------------------------+
```

### Luring

```text
+--------------------------------+
| [G] Tanpa sinyal                |
+--------------------------------+
| 312 orang  |  150 kursi        |
|                                |
| Keluarga pengantin     45 org |
| │ Bpk Budi, Ibu Sartika        |
| │ ( ) Undangan belum dikirim   |
+--------------------------------+
```

Daftar tamu adalah data yang paling sering dibuka tanpa sinyal, karena yang datang tidak selalu punya sinyal bagus di lokasi.

---

## 7. Aturan jumlah tamu

| Aturan | Kenapa |
|---|---|
| Satu nama boleh mewakili beberapa orang | Satu keluarga besar sering datang bersama |
| Nomor HP boleh kosong | Tidak semua tamu punya nomor |
| Undangan punya dua status, bukan tiga | Yang sudah dikirim tapi belum ditanya sama dengan belum dikirim |
| Undangan yang dikirim punya tanggal | Untuk tahu kapan harus ingatkan ulang |
| Rekap dihitung ulang dari data, bukan disimpan | Kalau disimpan, rekap bisa berbeda dengan daftar |
