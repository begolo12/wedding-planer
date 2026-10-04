import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";

type Params = { params: Promise<{ planId: string; paymentId: string }> };

/**
 * Hapus satu pembayaran. Dipakai saat nominal atau tanggalnya salah catat.
 * Yang dihapus cuma baris ini, bukan riwayat vendor.
 */
export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, paymentId } = await params;
  await konteksPlan(planId);
  idUuid(paymentId, "Pembayaran");

  const [baris] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.planId, planId), eq(payments.id, paymentId)))
    .limit(1);

  if (!baris) throw tidakDitemukan("Pembayaran");

  await db.delete(payments).where(and(eq(payments.planId, planId), eq(payments.id, paymentId)));
  return new NextResponse(null, { status: 204 });
});
