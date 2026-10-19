import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { payments } from "@/db/schema";

/**
 * Jumlah nominal pembayaran sebagai angka JavaScript.
 *
 * Bentuknya begini karena dua hal, dan keduanya pernah jadi bug:
 *
 * 1. `sum()` di Postgres mengembalikan `bigint`, bukan `int4`. Cast `::int`
 *    dulu melempar `integer out of range` begitu total melewati 2.147.483.647,
 *    jadi hasilnya di-cast `::bigint`.
 * 2. Driver `postgres` mengembalikan `bigint` sebagai string. String yang
 *    menyelinap ke `total += nilai` di layar berubah jadi penggabungan teks,
 *    dan totalnya melonjak jadi angka yang tidak masuk akal (docs/20 temuan
 *    18). Karena itu hasilnya wajib lewat `.mapWith(Number)`.
 *
 * Total uang di aplikasi ini jauh di bawah 2^53, jadi aman jadi `number`.
 */
export const jumlahPembayaran = sql<number>`coalesce(sum(${payments.amount}), 0)::bigint`.mapWith(
  Number,
);

/**
 * Sama seperti `jumlahPembayaran`, tetapi dihitung untuk satu vendor saja.
 *
 * Dipakai sebagai subquery berkorelasi di daftar vendor. Rujukan ke kolom
 * vendor sengaja dibungkus `sql` bersarang: saat query luar hanya satu tabel,
 * Drizzle melepas prefiks tabel dari setiap `PgColumn` yang ada di `select`
 * (lihat `buildSelection` di `pg-core/dialect.js`), dan rujukan berkorelasi
 * yang kehilangan prefiks akan cocok ke kolom tabel dalam, bukan tabel luar.
 * SQL bersarang tidak ikut dilepas, jadi korelasinya tetap utuh. Filter
 * `planId` juga ikut di dalam subquery supaya pembayaran dari rencana lain
 * tidak pernah terhitung, sesuai aturan AGENTS.md bagian 5.
 */
export function jumlahPembayaranVendor(
  planId: string,
  kolomVendorId: AnyPgColumn,
): SQL<number> {
  return sql<number>`(
    select coalesce(sum(${payments.amount}), 0)::bigint
    from ${payments}
    where ${payments.vendorId} = ${sql`${kolomVendorId}`}
      and ${payments.planId} = ${planId}
  )`.mapWith(Number);
}
