import { NextResponse } from "next/server";
import { bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { susunLaporan } from "@/lib/laporan";

type Params = { params: Promise<{ planId: string }> };

/**
 * Laporan keadaan, dihitung ulang saat dibuka.
 *
 * Tidak ada angka yang diambil dari cache atau dari kolom ringkasan. Setiap
 * kali laporan dibuka, angkanya dibaca dari data yang sama dengan layar lain,
 * jadi laporan tidak mungkin menampilkan keadaan kemarin tanpa ketahuan.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const laporan = await susunLaporan(planId);
  return NextResponse.json({ report: laporan });
});
