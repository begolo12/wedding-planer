import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Satu koneksi dipakai ulang antar hot reload di mode dev.
const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum diisi. Salin .env.example jadi .env.");
}

/**
 * Host lokal tidak butuh TLS, database remote wajib.
 *
 * Database produksi hampir tidak mungkin ada di localhost, jadi host apa pun
 * selain loopback dianggap remote dan diminta TLS. Ditulis eksplisit supaya
 * terlihat di diff dan tidak ikut berubah kalau bawaan driver berubah.
 */
function hostLokal(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^\[|\]$/g, "");
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    // URL tidak bisa diparse: biarkan `postgres()` yang melempar pesannya.
    return false;
  }
}

const sql =
  globalForDb.sql ??
  postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    // Driver `postgres` mengirim prepared statement secara bawaan. Kalau
    // database nanti di belakang PgBouncer mode transaction, prepared
    // statement tidak boleh dipakai. Menonaktifkannya dari sekarang mencegah
    // error yang sulit ditelusuri setelah terlanjur ada data.
    prepare: false,
    // TLS wajib untuk database remote (Neon dan sejenisnya). Host lokal
    // dilewati supaya pengembangan tidak butuh sertifikat.
    ...(hostLokal(connectionString) ? {} : { ssl: "require" as const }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });
export { sql };
