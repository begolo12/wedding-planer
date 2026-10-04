import "dotenv/config";
import postgres from "postgres";

/**
 * Akses database untuk e2e.
 *
 * Dipakai hanya untuk membuktikan data uji benar-benar hilang setelah aksi
 * lewat antarmuka, dan untuk membersihkan sisa data uji kalau sebuah test
 * gagal di tengah jalan. Test biasa tidak lewat sini.
 *
 * Dotenv dibaca di sini karena Playwright tidak memuat .env sendiri. Host
 * lokal tidak butuh TLS dan host remote wajib, aturannya sama dengan
 * src/db/index.ts.
 */
function hostLokal(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^\[|\]$/g, "");
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function dbUji() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi; e2e butuh database yang sama dengan aplikasi.");
  }
  return postgres(url, {
    prepare: false,
    max: 1,
    ...(hostLokal(url) ? {} : { ssl: "require" as const }),
  });
}

/** Berapa baris users dengan email itu. Dipakai untuk membuktikan penghapusan. */
export async function hitungUser(email: string): Promise<number> {
  const sql = dbUji();
  try {
    const hasil = await sql`select count(*)::int as n from users where email = ${email}`;
    return hasil[0]?.n ?? -1;
  } finally {
    await sql.end();
  }
}

/** Hapus akun uji lewat email yang eksplisit. Cascade ikut menghapus plan. */
export async function hapusAkunUji(email: string): Promise<void> {
  const sql = dbUji();
  try {
    await sql`delete from users where email = ${email}`;
  } finally {
    await sql.end();
  }
}
