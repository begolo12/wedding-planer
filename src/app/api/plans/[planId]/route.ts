import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { bungkus, bacaJson } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";
import { skemaPlanUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/** Satu plan. Kepemilikannya diperiksa lebih dulu, bukan sesudah. */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  const { plan } = await konteksPlan(planId);
  return NextResponse.json({ plan });
});

/**
 * Ubah sebagian field plan. `PUT` tidak pernah dipakai.
 *
 * Dibalasi sekali per kunci: kiriman ulang dari antrean luring tidak boleh
 * menimpa perubahan yang lebih baru dengan nilai lama.
 */
export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaPlanUbah.parse(await bacaJson(req));

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    const [plan] = await db
      .update(plans)
      .set({ ...isi, updatedAt: new Date() })
      .where(eq(plans.id, planId))
      .returning();

    return NextResponse.json({ plan });
  });
});

/**
 * Hapus lembut. Data anaknya tidak disentuh supaya masih bisa dipulihkan.
 *
 * Tidak dibalasi lewat kunci idempotency: setelah terhapus, `konteksPlan`
 * menolak plan ini di permintaan berikutnya, jadi balasan tersimpan tidak akan
 * pernah terbaca. Hapus lembut sendiri sudah aman diulang, karena menulis
 * `deletedAt` dua kali menghasilkan keadaan yang sama.
 */
export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  await db
    .update(plans)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(plans.id, planId));

  return new NextResponse(null, { status: 204 });
});
