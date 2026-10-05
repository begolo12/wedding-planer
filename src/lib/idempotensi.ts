import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { idempotencyKeys } from "@/db/schema";

/**
 * Kiriman ulang dari antrean luring.
 *
 * Antrean luring di perangkat bisa mengirim perubahan yang sama lebih dari
 * sekali: dua tab mengirim bersamaan, atau tab ditutup setelah server
 * memproses tapi sebelum antrean lokalnya terhapus. Tanpa penjagaan di sini,
 * tiap kiriman ulang menambah satu baris, dan catatan pembayaran yang dobel
 * lebih buruk daripada gagal terkirim.
 *
 * Client mengirim header `Idempotency-Key` berisi id item antreannya. Server
 * menyimpan kunci itu beserta balasan aslinya. Kiriman berikutnya dengan kunci
 * sama mendapat balasan yang sama tanpa menjalankan handler lagi.
 *
 * Batas kadaluarsa tidak dipakai. Baris kunci menumpuk sedikit (satu per
 * perubahan luring, bukan satu per permintaan) dan ikut terhapus saat
 * rencananya dihapus lewat cascade. Kalau nanti jadi banyak, pembersihan
 * berbasis `createdAt` bisa ditambahkan tanpa mengubah pemanggil.
 */

export const HEADER_KUNCI = "idempotency-key";

/** Panjang maksimum kunci dari header. UUID dari perangkat 36 karakter. */
const MAKS_KUNCI = 100;

/** Pola kunci yang diterima: huruf, angka, tanda hubung, garis bawah, titik. */
const POLA_KUNCI = /^[A-Za-z0-9._-]+$/;

/**
 * Jalankan handler, tapi hanya sekali per kunci.
 *
 * Kunci yang tidak dikirim atau tidak sah berarti permintaan biasa: handler
 * jalan seperti sebelumnya. Ini disengaja supaya endpoint tetap bisa dipakai
 * tanpa header, dan supaya kunci yang aneh tidak menolak permintaan yang sah.
 *
 * @param planId rencana yang sedang ditulis, dipakai untuk cascade dan audit
 * @param kunci nilai header `Idempotency-Key`, kalau ada
 * @param jalan handler yang benar-benar menulis
 */
export async function sekaliPerKunci(
  planId: string,
  kunci: string | null,
  jalan: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const bersih = kunci?.trim() ?? "";
  if (!bersih || bersih.length > MAKS_KUNCI || !POLA_KUNCI.test(bersih)) {
    return jalan();
  }

  // Sudah pernah diproses: balas dengan hasil yang sama, tanpa menulis lagi.
  const [ada] = await db
    .select()
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, bersih))
    .limit(1);

  if (ada) {
    return new NextResponse(ada.body, {
      status: ada.status,
      headers: { "Content-Type": "application/json", "X-Idempotent-Replay": "ya" },
    });
  }

  const hasil = await jalan();
  const badan = await hasil.clone().text();

  // `onConflictDoNothing` menutup balapan dua permintaan dengan kunci sama
  // yang tiba hampir bersamaan: yang kalah tidak melempar, dan balasannya
  // tetap sama karena kedua handler menulis data yang setara. Yang penting
  // tidak ada baris yang dibuat dua kali.
  await db
    .insert(idempotencyKeys)
    .values({ key: bersih, planId, status: hasil.status, body: badan })
    .onConflictDoNothing();

  return hasil;
}
