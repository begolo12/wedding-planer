import { randomBytes } from "node:crypto";

/**
 * Kunci untuk tautan baca-saja.
 *
 * Delapan belas byte jadi dua puluh empat huruf base64url. Dipilih bukan
 * karena gaya, tapi karena panjang inilah yang bikin orang tidak bisa menebak
 * tautan orang lain dengan mencoba-coba. Kunci pendek seperti nomor urut
 * membuat tautan keluarga bisa dibuka siapa saja yang iseng mengganti angka.
 *
 * base64url dipakai supaya aman ditempel di URL tanpa diubah jadi persen.
 */
export function buatToken(): string {
  return randomBytes(18).toString("base64url");
}

export function urlTautan(token: string): string {
  const dasar = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return `${dasar.replace(/\/$/, "")}/bagikan/${token}`;
}
