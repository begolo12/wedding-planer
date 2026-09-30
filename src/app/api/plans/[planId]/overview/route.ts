import { NextResponse } from "next/server";
import { bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { ringkasanPlan } from "@/lib/ringkasan";

type Params = { params: Promise<{ planId: string }> };

/**
 * Satu endpoint untuk seluruh Beranda. Kalau Beranda memanggil lima endpoint,
 * layar itu harus menangani lima keadaan memuat dan lima kemungkinan gagal
 * secara terpisah, dan satu yang gagal membuat seluruh layar terlihat rusak.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const ringkasan = await ringkasanPlan(planId);
  return NextResponse.json(ringkasan);
});
