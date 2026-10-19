# 20. Hasil Audit Menyeluruh

Dokumen ini catatan audit menyeluruh kedua. Audit pertama ada di [`19-Rencana-Perbaikan-Audit.md`](19-Rencana-Perbaikan-Audit.md). Cakupan yang ini lebih luas: idempotency antrean luring, mode gelap dari pengaturan sistem, naskah teks, dan sinkronisasi dokumen.

Setiap temuan punya bukti di kode yang benar-benar jalan. Tidak ada perbaikan yang dikerjakan atas dasar tebakan, dan setiap keputusan ditulis bersama alasannya.

Tanggal audit: 2026-10-05. Commit dasar: `9da6535` (di atas tag `v0.17.0` di `180e736`).

Status mesin setelah seluruh perbaikan: `npx tsc --noEmit` bersih, `npx vitest run` 17 berkas 156 test hijau, `npm run build` sukses, tanpa em dash di `src` dan `docs`.

> Status terkini: 18 temuan sudah dikerjakan dan diverifikasi. Temuan 18 ditemukan lewat pemeriksaan lanjutan area keuangan pada 2026-10-06. Perubahan tercatat di [`CHANGELOG.md`](../CHANGELOG.md). Batasan yang belum ditutup ada di bagian akhir.

---

## Ringkasan

| # | Temuan | Tingkat | Berkas utama |
|---|---|---|---|
| 1 | Klaim kunci idempotency tidak atomik, dua kiriman hampir bersamaan sama-sama lolos | Berat | `src/lib/idempotensi.ts` |
| 2 | Kunci idempotency tidak dibatasi planId saat dibaca dan ditulis | Berat | `src/lib/idempotensi.ts` |
| 3 | Kiriman ulang belum dijaga di belasan endpoint tulis | Berat | `src/app/api/plans/**` |
| 4 | Tombol selesai tugas bisa terbalik dua kali saat kiriman ulang | Sedang | `src/app/api/plans/[planId]/tasks/[taskId]/toggle/route.ts` |
| 5 | Batas lima tautan laporan bisa dilewati dua permintaan bersamaan | Sedang | `src/app/api/plans/[planId]/report/links/route.ts` |
| 6 | Balasan 204 yang disimpan melempar error, replay berubah jadi 500 | Sedang | `src/lib/idempotensi.ts` |
| 7 | Agregat uang ber-`::int` bisa melampaui kapasitas kolom | Sedang | vendors, budget-items, ringkasan |
| 8 | Tiga join ke tabel anak tidak membawa filter planId | Sedang | vendors, budget-items, ringkasan |
| 9 | Mode gelap sistem tidak menimpa kelas kustom, hanya pilihan tema tersimpan | Sedang | `src/app/globals.css` |
| 10 | Layar gagal global memakai warna di luar palet dan menyala terang di mode gelap | Ringan | `src/app/global-error.tsx` |
| 11 | Tombol Google memakai token warna yang tidak terdefinisi | Ringan | `src/app/globals.css` |
| 12 | Target sentuh teks syarat auth di bawah 44px | Ringan | `src/app/globals.css` |
| 13 | Istilah "susunan acara" masih dipakai, bertentangan dengan AGENTS.md | Ringan | hari-h, laporan, bagikan, docs/14 |
| 14 | Em dash di layar tanggal penting | Ringan | `src/app/(app)/rencana/tanggal/page.tsx` |
| 15 | Beranda menampilkan lencana "Fase 2" tanpa arti, warna aksi cepat melampaui batas aksen | Ringan | `src/app/(app)/beranda/page.tsx` |
| 16 | Dokumen dan contoh env tidak sinkron dengan kode | Sedang | `docs/**`, `.env.example` |
| 17 | CHANGELOG belum punya entri v0.17.0 dan `package.json` tertinggal | Ringan | `CHANGELOG.md`, `package.json` |
| 18 | Hasil `::bigint` jadi string, total terbayar di layar vendor salah | Berat | `src/lib/agregat-uang.ts`, vendors |

Urutan kerja yang dipakai: 1 sampai 3 dulu (semuanya menyangkut kehilangan dan duplikasi data, dan 3 butuh inti di 1 dan 2 selesai lebih dulu), lalu 4 dan 5, lalu 6. Setelah itu 7 dan 8 (kebenaran angka). Lalu 9 sampai 12 (tampilan). Lalu 13 sampai 15 (kebersihan naskah dan layar). Terakhir 16 dan 17 (dokumen dan versi). Setelah itu 18, ditemukan saat memeriksa ulang area keuangan.

---

## 1. Klaim kunci idempotency tidak atomik

**Bukti.** `sekaliPerKunci` sebelum perbaikan memakai pola baca lalu tulis:

```ts
const [ada] = await db
  .select()
  .from(idempotencyKeys)
  .where(eq(idempotencyKeys.key, bersih))
  .limit(1);
if (ada) return balasanTersimpan(ada);

const hasil = await jalan();
await db.insert(idempotencyKeys).values({ ... }).onConflictDoNothing();
```

Komentar lama mengklaim `onConflictDoNothing` sudah menutup balapan. Itu salah: dua permintaan berkunci sama yang tiba hampir bersamaan sama-sama tidak menemukan baris, sama-sama menjalankan `jalan()`, lalu sama-sama menulis. `onConflictDoNothing` hanya mencegah baris kunci ganda, bukan handler ganda.

**Dampak.** Persis kejadian yang ingin dicegah tetap bisa terjadi: dua tab mengirim antrean yang sama, dan pembayaran atau tugas tercatat dua kali.

**Perbaikan.** Urutannya dibalik jadi klaim lebih dulu: `insert ... on conflict do nothing returning`. Yang mendapat baris klaim boleh menjalankan handler, yang kalah menunggu hasilnya. `jalan()` hanya dipanggil oleh pemegang klaim.

**Pemeriksaan.** Uji dua permintaan berkunci sama yang berjalan bersamaan, harus ada satu baris data. Uji unit antrean luring tetap hijau.

---

## 2. Kunci idempotency tidak dibatasi planId

**Bukti.** Pencarian dan penulisan kunci memakai `eq(idempotencyKeys.key, bersih)` saja, tanpa `planId`:

```ts
.where(eq(idempotencyKeys.key, bersih))
```

**Dampak.** Kalau dua rencana berbeda kebetulan mengirim kunci yang sama, rencana kedua mendapat balasan milik rencana pertama, atau balasan pertama ditimpa. Pemilik kunci tidak lagi dibedakan per rencana, padahal seluruh aplikasi membatasi query dengan `planId` (AGENTS.md bagian 5).

**Perbaikan.** Setiap baca, update, dan delete kunci sekarang memakai `and(eq(key), eq(planId))`. Insert tetap menyertakan `planId` untuk cascade.

**Pemeriksaan.** Grep `idempotencyKeys` di `src/lib/idempotensi.ts`, pastikan tidak ada query yang hanya memakai `key`.

---

## 3. Kiriman ulang belum dijaga di belasan endpoint tulis

**Bukti.** Klien mengirim `Idempotency-Key` untuk setiap permintaan tulis dari antrean luring (`src/lib/luring.ts`), tetapi hanya sebagian endpoint yang memakainya. Yang belum, di antaranya `POST` pembayaran, `POST`/`PATCH`/`DELETE` vendor, `POST`/`PATCH` pengumuman, `POST` share pengumuman, `POST` tautan laporan, `POST` impor tamu, `POST` tandai undangan, `POST` tugas dari templat, `POST` urut ulang tugas, `POST` balik tugas, `DELETE` pembayaran, dan `PATCH` plan.

**Dampak.** Kiriman ulang masih bisa menambah baris dobel di catatan yang justru paling penting: pembayaran, vendor, tamu, dan tautan laporan.

**Perbaikan.** `sekaliPerKunci` dipasang di seluruh route tulis ber-`planId` yang belum memakainya. Route baca dan `report/share-text` (tidak menulis) tidak dibungkus. `POST /api/plans` juga tidak, karena `planId` belum ada saat permintaan dibuat (batasan di bagian akhir).

**Pemeriksaan.** Grep header `HEADER_KUNCI` di seluruh route tulis, pastikan tiap route menulis memilikinya, kecuali `POST /api/plans` dan `DELETE /api/plans/[planId]`.

---

## 4. Tombol selesai tugas bisa terbalik dua kali

**Bukti.** `POST /api/plans/[planId]/tasks/[taskId]/toggle` membaca status, lalu membaliknya. Endpoint ini belum dibungkus idempotency. Kiriman ulang karena timeout akan membaca status yang sudah dibalik, lalu membaliknya kembali.

**Dampak.** Tugas yang baru dicentang kembali belum selesai tanpa ada yang menyentuhnya. Kalau terjadi beruntun, penanda selesai jadi tidak bisa dipercaya.

**Perbaikan.** Seluruh isi handler dibungkus `sekaliPerKunci`. Kiriman kedua dengan kunci sama mendapat balasan pertama, jadi status tidak dibalik lagi.

**Pemeriksaan.** Kirim toggle dua kali dengan header kunci yang sama, status akhir harus sama dengan hasil sekali kirim.

---

## 5. Batas lima tautan laporan bisa dilewati

**Bukti.** `POST /api/plans/[planId]/report/links` menghitung jumlah tautan, memeriksa batas `BATAS_TAUTAN`, lalu menulis, semuanya tanpa kunci. Dua permintaan bersamaan bisa sama-sama melihat hitungan empat dan sama-sama menulis tautan kelima.

**Dampak.** Batas lima tautan per rencana dari [`16-Laporan-dan-Bagikan.md`](16-Laporan-dan-Bagikan.md) bisa dilewati.

**Perbaikan.** Hitung dan tulis dipindah ke satu transaksi yang diawali `select pg_advisory_xact_lock(hashtext(${planId}))`. Kunci penasihat dipegang sampai transaksi selesai, jadi tidak ada celah antara menghitung dan menulis. Transaksi sekaligus dibungkus `sekaliPerKunci` supaya kiriman ulang tidak membuat tautan kembar.

**Pemeriksaan.** Dua permintaan bersamaan pada rencana yang sudah punya empat tautan, hanya satu yang boleh berhasil.

---

## 6. Balasan 204 yang disimpan melempar error

**Bukti.** Balasan replay memakai `new NextResponse(ada.body, { status: ada.status })`. Untuk status 204, 205, dan 304, spesifikasi Fetch mewajibkan body `null`, dan mengirim string kosong melempar. Handler yang menjawab 204 (misalnya `DELETE`) berubah menjadi 500 saat dibalas dari kunci.

**Dampak.** Replay penghapusan yang seharusnya mulus malah jadi galat, dan pita luring menganggapnya gagal.

**Perbaikan.** `balasTersimpan` mengirim `null` untuk status 204, 205, dan 304, dan string JSON untuk status lain. Penyimpanan balasan juga menulis `body` kosong untuk status tanpa body.

**Pemeriksaan.** Jalankan `DELETE` berkunci, lalu ulangi dengan kunci sama, kedua balasan harus 204.

---

## 7. Agregat uang ber-`::int` bisa melampaui kapasitas kolom

**Bukti.** Beberapa agregat jumlah pembayaran memakai `coalesce(sum(...), 0)::int`, di antaranya di `src/app/api/plans/[planId]/vendors/route.ts`, `budget-items/route.ts`, dan `vendors/[vendorId]/route.ts`. `sum()` di Postgres mengembalikan `bigint`, lalu dipaksa kembali ke `int4` yang batasnya 2.147.483.647.

**Dampak.** Rencana dengan total pembayaran di atas batas `int4` akan melempar `integer out of range` dan menjawab 500. Uang selalu integer rupiah, dan totalnya bisa melewati batas itu.

**Perbaikan.** Cast diganti `::bigint` di semua agregat jumlah pembayaran. Cast ini menutup overflow, tetapi belum cukup: driver mengembalikan `bigint` sebagai string, dan itu jadi temuan 18. Konversi ke angka JavaScript dilakukan lewat `mapWith(Number)`.

**Pemeriksaan.** `tests/integration/agregat-uang.test.ts` memakai total 4.000.000.000, di atas batas `int4`, dan memastikan nilainya kembali sebagai angka yang benar.

---

## 8. Tiga join ke tabel anak tidak membawa filter planId

**Bukti.**

- `src/app/api/plans/[planId]/vendors/route.ts`: `leftJoin(budgetItems, eq(vendors.budgetItemId, budgetItems.id))`
- `src/app/api/plans/[planId]/budget-items/route.ts`: `innerJoin(vendors, eq(payments.vendorId, vendors.id))`
- `src/lib/ringkasan.ts`: `leftJoin(budgetItems, eq(tasks.budgetItemId, budgetItems.id))`

Relasi antar tabel anak tidak dijaga foreign key lintas rencana, jadi join yang hanya memakai id bisa mencocokkan baris milik rencana lain.

**Dampak.** Nama pos anggaran atau jumlah terpakai bisa terbaca dari rencana lain, walau jalur normalnya tidak. Ini pelanggaran aturan `planId` di AGENTS.md bagian 5.

**Perbaikan.** Ketiga join ditambah `and(..., eq(<tabel>.planId, planId))`.

**Pemeriksaan.** Grep `leftJoin` dan `innerJoin` di `src`, pastikan setiap join ke tabel anak ber-`planId` ikut menyaring `planId`.

---

## 9. Mode gelap sistem tidak menimpa kelas kustom

**Bukti.** Beberapa kelas kustom hanya punya pasangan gelap lewat `[data-theme="gelap"]`, bukan lewat `prefers-color-scheme`. Yang belum: `.beranda-pil-aksen`, `.beranda-mundur`, `.beranda-mundur-sel`, `.stitch-orb`, `.luxury-glass`, `.luxury-card`, `.shimmer-container::after`. Sementara tema aplikasi punya dua jalur: pilihan tersimpan (`data-theme`) dan pengaturan sistem.

**Dampak.** Pengguna yang membiarkan tema mengikuti sistem dan perangkatnya gelap tetap melihat kelas ini versi terang, sehingga warna teks dan permukaan bertabrakan.

**Perbaikan.** Setiap kelas ditambah blok `@media (prefers-color-scheme: dark)` dengan saringan `:root:not([data-theme="terang"])`, supaya pilihan terang yang disimpan tetap menang.

**Pemeriksaan.** Buka Beranda dan layar dengan kartu kaca dalam mode gelap sistem tanpa memilih tema, pastikan permukaan dan teksnya ikut gelap.

---

## 10. Layar gagal global di luar palet dan tanpa mode gelap

**Bukti.** `src/app/global-error.tsx` memakai `background: "#fffdf9"` dan `color: "#4a3b43"`, warna yang tidak ada di token [`docs/21-Arah-Tampilan.md`](21-Arah-Tampilan.md), dan tidak punya pasangan gelap. Skrip tema ada di layout root yang justru sedang gagal, jadi `data-theme` tidak bisa diandalkan di layar ini.

**Dampak.** Layar gagal terasa asing dari aplikasi, dan menyala terang di perangkat gelap.

**Perbaikan.** Warna disamakan dengan token `--color-base` dan `--color-ink` (`#fcf9f5` dan `#382a32`), ditambah `colorScheme: "light dark"`, dan `<style>` inline dengan `@media (prefers-color-scheme: dark)` sebagai satu-satunya sinyal tema yang masih bisa dipercaya di sini.

**Pemeriksaan.** Paksa galat root di mode gelap sistem, layar harus ikut gelap.

---

## 11. Tombol Google memakai token warna yang tidak terdefinisi

**Bukti.** `.auth-tombol-google` di `globals.css` memakai `var(--color-card-bg, #ffffff)`, `var(--color-latar, #faf8f5)`, dan `var(--radius-md, 12px)`. Token-token itu tidak ada di `@theme` maupun di blok mode gelap, jadi yang terpakai adalah nilai jatuhnya, yang sebagian di luar palet.

**Dampak.** Tombol Google memakai warna dan sudut yang tidak mengikuti sistem, dan tidak ikut berubah di mode gelap.

**Perbaikan.** Diganti ke token yang sudah ada dan berpasangan: `--color-kartu-putih`, `--color-ink`, `--color-kotak-abu`, `--radius-kontrol`, `--text-dasar`, `--color-netral`, `--color-muted`, dan `--bayang-1`.

**Pemeriksaan.** Jalankan `scripts/audit-kelas.mjs`, pastikan token yang dipakai `.auth-tombol-google` terdefinisi.

---

## 12. Target sentuh teks syarat auth di bawah 44px

**Bukti.** `.auth-syarat` memakai `padding-top: 2px` tanpa tinggi minimum, sehingga tinggi efektifnya hanya mengikuti tinggi teks dan di bawah 44px sesuai aturan AGENTS.md bagian 3.

**Dampak.** Tautan syarat dan ketentuan sulit ditekan di HP, terutama karena ada di dekat tombol lain.

**Perbaikan.** Ditambah `min-height: 44px` dengan `padding-block: 2px`.

**Pemeriksaan.** Ukur tinggi elemen di layar daftar, harus minimal 44px.

---

## 13. Istilah "susunan acara" masih dipakai

**Bukti.** Teks "susunan acara" masih muncul di `src/app/(app)/hari-h/page.tsx` (tiga tempat), `src/app/(app)/laporan/page.tsx`, `src/app/bagikan/[token]/page.tsx`, dan [`14-Naskah-Teks.md`](14-Naskah-Teks.md).

**Dampak.** AGENTS.md bagian 4 memakai "susunan acara" sebagai contoh istilah yang salah; istilah yang benar adalah "rundown". Dua kata untuk satu hal membuat naskah tidak konsisten.

**Perbaikan.** Semua pemakaian diganti "rundown".

**Pemeriksaan.** Grep "susunan acara" di `src` dan `docs`, harus nol.

---

## 14. Em dash di layar tanggal penting

**Bukti.** `src/app/(app)/rencana/tanggal/page.tsx` memakai karakter em dash (U+2014) sebagai penanda nilai kosong di kartu rekap.

**Dampak.** AGENTS.md bagian 3 melarang em dash karena terlihat seperti tulisan mesin.

**Perbaikan.** Diganti tanda hubung biasa.

**Pemeriksaan.** Grep karakter em dash di `src` dan `docs`, harus nol.

---

## 15. Lencana "Fase 2" dan warna aksi cepat Beranda

**Bukti.** Hero Beranda menampilkan lencana "Fase 2" dengan bidang putih, dan tiga ikon aksi cepat memakai `--color-badge-latar`, `--color-kotak-abu`, serta `--color-sage`. "Fase 2" tidak punya arti di UI dan hanya sisa mockup, sedangkan satu blok kecil memakai beberapa keluarga warna aksen sekaligus.

**Dampak.** Pengguna melihat label yang tidak bisa dijelaskan, dan aturan maksimal tiga warna inti plus satu aksen di AGENTS.md bagian 6 dilanggar.

**Perbaikan.** Lencana "Fase 2" dihapus. Ketiga ikon aksi cepat diseragamkan: latar `--color-netral` dan ikon `--color-marigold`.

**Pemeriksaan.** Buka Beranda, pastikan tidak ada label "Fase 2" dan warna aksi cepat tidak lebih dari dua keluarga.

---

## 16. Dokumen dan contoh env tidak sinkron dengan kode

**Bukti dan perbaikan, per berkas.**

| Berkas | Salah | Benar |
|---|---|---|
| `docs/03-Data-Model.md` | Tidak ada tabel `idempotency_keys` | Ditambah bagian 13 berisi kolom, index, dan kapan barisnya ditulis |
| `docs/04-API-Contract.md` | Tidak ada bagian Publik, `PATCH /announcements` belum tercatat, bentuk `report/share-text` kurang lengkap | Ditambah bagian Publik, `PATCH /announcements`, dan bentuk balasan `share-text` yang utuh |
| `docs/05-IA-dan-Layar.md` | Peta halaman hanya menyebut empat rute | Peta halaman diperluas ke seluruh rute yang ada |
| `docs/07-PWA.md` | Menulis dua versi cache `current` dan `previous` | Kode memakai satu versi (`VERSI = "v2"` di `public/sw.js`); alur update disamakan dengan `skipWaiting` dan `clients.claim` |
| `docs/18` | "150 unit, 9 e2e" | "156 unit, 17 berkas, 8 berkas spec e2e" |
| `.env.example` | Tanpa `NEXT_PUBLIC_APP_URL` | Ditambah karena `src/lib/auth-client.ts` membacanya |

**Pemeriksaan.** Bandingkan daftar endpoint di docs/04 dengan keluaran `find src/app/api -name route.ts`, dan jumlah test dengan `npm test`.

---

## 17. CHANGELOG dan versi tertinggal

**Bukti.** Tag `v0.17.0` dibuat di commit `180e736`, tetapi `CHANGELOG.md` tidak punya bagian `## [0.17.0]`; isi yang seharusnya jadi rilis masih tertinggal di `[Belum dirilis]`. `package.json` masih `0.16.0`.

**Dampak.** Versi yang dirilis tidak bisa ditelusuri dari changelog, dan nomor versi kode tidak cocok dengan tag.

**Perbaikan.** Bagian `## [0.17.0] - 5 Oktober 2026` ditambahkan berisi isi yang sudah ada saat tag dibuat. `package.json` dinaikkan ke `0.17.0`. Entri pekerjaan setelah tag (login Google, penyegaran visual, dan perbaikan audit ini) tetap di `[Belum dirilis]`.

**Pemeriksaan.** `git tag` menampilkan `v0.17.0`; versi di `package.json` sama dengan versi teratas di `CHANGELOG.md` yang sudah dirilis.

---

## 18. Hasil `::bigint` jadi string, total terbayar di layar vendor salah

**Bukti.** Perbaikan temuan 7 mengganti cast agregat uang jadi `::bigint`. Itu menutup overflow, tetapi memunculkan masalah tipe: driver `postgres` mengembalikan `bigint` sebagai string, dan `src/db/index.ts` tidak punya parser tipe. Di layar vendor, `totalTerbayar += v.paidAmount` dengan `paidAmount` berupa string berubah jadi penggabungan teks, bukan penjumlahan.

Bukti runtime yang dijalankan langsung ke database saat pemeriksaan lanjutan:

```text
typeof int4  : number 1
typeof bigint: string 1
typeof jumlah: string 5000000
0 + jumlah   : 05000000
```

**Dampak.** Kartu rekap "Sudah terbayar" di daftar vendor menampilkan angka yang jauh lebih besar dari yang sebenarnya begitu ada dua vendor atau lebih yang punya pembayaran. Contoh: 5.000.000 lalu 3.000.000 menjadi `"05000000" + "3000000"`, dan terbaca 50.000.003.000.000. Angka ini angka uang, jadi salahnya langsung menyesatkan.

**Perbaikan.** Cast `::bigint` tetap dipakai supaya tidak overflow, tetapi hasilnya lewat `mapWith(Number)` supaya jadi angka JavaScript. Ketiga tempat (`budget-items`, `vendors`, `vendors/[vendorId]`) dipindah ke satu modul `src/lib/agregat-uang.ts` supaya alasannya tertulis sekali dan bisa diuji. Di subquery berkorelasi, rujukan kolom vendor dibungkus SQL bersarang karena Drizzle melepas prefiks tabel saat query luar hanya satu tabel (`buildSelection` di `pg-core/dialect.js`), dan korelasi yang kehilangan prefiks akan cocok ke kolom tabel dalam.

**Pemeriksaan.** `tests/integration/agregat-uang.test.ts` menyisipkan dua pembayaran 2.000.000.000 (total 4.000.000.000, di atas batas `int4`) dan memastikan nilai yang kembali `number` dan benar, termasuk saat query hanya satu tabel. Satu kasus juga membuktikan driver mengembalikan `bigint` sebagai string tanpa `mapWith`, jadi alasan perbaikan ini tidak bergantung pada tebakan.

---

## Yang sudah benar, jangan diubah

Bagian ini ditulis supaya tidak ada yang "memperbaiki" hal yang sudah betul.

- Filter `planId` dan cek kepemilikan konsisten di seluruh route ber-sesi. Tidak ada `PUT`.
- Bentuk galat seragam lewat `bungkus()` dan `balasGalat()`.
- Uang selalu integer, tidak ada float tersimpan.
- Agregat uang selalu dikonversi ke `number` lewat `src/lib/agregat-uang.ts`, jadi tidak ada string yang menyelinap ke penjumlahan di layar.
- Response `/api/` tidak pernah masuk cache service worker.
- Navigasi network-first dengan batas 3 detik, bukan cache-first.
- Rundown bisa dibuka tanpa sinyal setelah pernah dibuka sekali.
- Zona waktu WIB konsisten dan teruji.
- Tidak ada tombol mati, kontras dan mode gelap lengkap, tidak ada geser horizontal.
- Kunci idempotency tidak dibatasi kadaluarsa karena barisnya sedikit dan ikut cascade saat rencana dihapus.

---

## Batasan yang diketahui

Dua hal ini sengaja dibiarkan, dengan alasan.

| Hal | Alasan |
|---|---|
| `POST /api/plans` tidak memakai kunci idempotency | `planId` belum ada saat permintaan dibuat, sedangkan tabel `idempotency_keys` memakai `planId` sebagai kunci cascade. Membuat plan dobel tetap mungkin kalau pengguna menekan dua kali sebelum rencana pertama selesai. Ditutup dari sisi UI (tombol dinonaktifkan saat menyimpan), bukan dari server |
| `DELETE /api/plans/[planId]` tidak dibungkus kunci | Setelah terhapus, `konteksPlan` menolak plan itu, jadi balasan tersimpan tidak akan pernah terbaca. Hapus lembutnya sendiri sudah aman diulang |

Route `DELETE` lain (vendor, tugas, milestone, dan sejenisnya) melakukan cek kepemilikan di luar `sekaliPerKunci`, sehingga kiriman ulang setelah sukses bisa menjawab 404, bukan 204 dari cache. Ini tidak merusak data karena penghapusan kedua memang tidak mengubah apa pun. Perbaikan tambahan hanya menambah kode tanpa menambah keamanan, jadi tidak dikerjakan.

---

## Catatan pekerjaan di luar audit

Perubahan berikut ada di pohon kerja yang sama tetapi bukan bagian dari 18 temuan di atas.

- Rundown singkat dipindah ke dalam `/overview` (`src/lib/ringkasan.ts` dan `src/app/(app)/beranda/page.tsx`) supaya Beranda cukup satu request, bukan dua berurutan. Ini pekerjaan pengguna yang sudah ada, bukan hasil audit.

---

## Cara memakai dokumen ini

Setiap temuan sudah dikerjakan. Kalau ada temuan baru, tulis di sini dengan bagian **Bukti**, **Dampak**, **Perbaikan**, dan **Pemeriksaan**, lalu catat di [`CHANGELOG.md`](../CHANGELOG.md). Jangan menulis temuan tanpa bukti, dan jangan menutup temuan tanpa pemeriksaan yang bisa diulang.
