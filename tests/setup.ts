import "dotenv/config";

/**
 * Persiapan test.
 *
 * `TEST_DATABASE_URL`, kalau ada, menimpa `DATABASE_URL` sebelum
 * `src/db/index.ts` dibaca, jadi test tidak menyentuh database pengembangan.
 *
 * Keterbatasan yang harus ditulis jujur: kalau `TEST_DATABASE_URL` tidak ada,
 * test integrasi memakai `DATABASE_URL` apa adanya, yaitu database
 * pengembangan. Tiap test membuat lalu menghapus datanya sendiri, tetapi
 * hasilnya tidak terisolasi penuh dari data pengembangan. Test TIDAK pernah
 * menjalankan `db:push` dan tidak pernah membuat tabel; tabel harus sudah ada
 * lewat `db:migrate` atau `db:push` di luar test.
 */
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
