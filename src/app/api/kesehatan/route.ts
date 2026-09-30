import { NextResponse } from "next/server";

/**
 * Titik cek koneksi.
 *
 * Balasannya sengaja kosong dan tidak menyentuh database. Kalau endpoint ini
 * ikut membaca database, satu gangguan di database akan terbaca sebagai
 * "sedang luring" di semua perangkat, walau internetnya baik.
 *
 * Tidak masuk cache, karena gunanya justru membuktikan ada koneksi sekarang.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, waktu: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
