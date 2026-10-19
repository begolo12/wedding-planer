import { NextResponse } from "next/server";
import { sql } from "@/db";

/**
 * Titik kesiapan, untuk pemantauan dari luar.
 *
 * Bedanya dengan `/api/kesehatan`: endpoint itu sengaja tidak menyentuh
 * database, karena penjaga koneksi di perangkat memakainya untuk memutuskan
 * "luring". Kalau endpoint itu ikut membaca database, gangguan database akan
 * membuat semua perangkat mengira sinyalnya hilang.
 *
 * Endpoint ini kebalikannya: satu-satunya gunanya adalah membuktikan database
 * benar-benar terbaca. Yang memanggilnya hanya pemantau, bukan aplikasi.
 *
 * Balasannya tidak memuat pesan galat apa pun. Pemantau hanya butuh tahu siap
 * atau tidak, dan pesan galat database bisa memuat nama host atau pengguna.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const waktu = new Date().toISOString();

  try {
    // Satu baris, tanpa tabel. Cukup untuk membuktikan koneksi hidup, dan
    // tidak bergantung pada isi data.
    await sql`select 1 as siap`;
  } catch (err) {
    // Dicatat ke log platform supaya penyebabnya bisa dibaca, tapi tidak
    // pernah dikirim ke pemanggil.
    console.error("[siap] database tidak terbaca:", err);
    return NextResponse.json(
      { siap: false, waktu },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  return NextResponse.json(
    { siap: true, waktu },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
