import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, vendors } from "@/db/schema";
import { bacaJson, bungkus, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaPembayaran } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; vendorId: string }> };

async function vendorMilikSaya(planId: string, vendorId: string) {
  const [baris] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(and(eq(vendors.planId, planId), eq(vendors.id, vendorId)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Vendor");
  return baris;
}

export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, vendorId } = await params;
  await konteksPlan(planId);
  await vendorMilikSaya(planId, vendorId);

  const riwayat = await db
    .select()
    .from(payments)
    .where(and(eq(payments.planId, planId), eq(payments.vendorId, vendorId)))
    .orderBy(asc(payments.paidAt));

  return NextResponse.json({ payments: riwayat });
});

/**
 * Catat pembayaran.
 *
 * Tidak ada batas maksimal yang membandingkan jumlah pembayaran dengan
 * tagihan. Kalau pasangan mencatat lebih dari tagihan, itu memang terjadi:
 * ada biaya tambahan di lokasi yang belum masuk pos anggaran. Yang penting
 * angkanya tercatat apa adanya, bukan ditolak.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId, vendorId } = await params;
  await konteksPlan(planId);
  await vendorMilikSaya(planId, vendorId);

  const isi = skemaPembayaran.parse(await bacaJson(req));

  const [baris] = await db
    .insert(payments)
    .values({
      planId,
      vendorId,
      amount: isi.amount,
      paidAt: isi.paidAt,
      method: isi.method,
      isFinal: isi.isFinal,
      notes: isi.notes ?? null,
    })
    .returning();

  return NextResponse.json({ payment: baris }, { status: 201 });
});
