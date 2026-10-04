import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems, payments, vendors } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan, pastikanPosAnggaran } from "@/lib/api";
import { skemaVendorUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; vendorId: string }> };

async function ambil(planId: string, vendorId: string) {
  idUuid(vendorId, "Vendor");
  const [baris] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.planId, planId), eq(vendors.id, vendorId)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Vendor");
  return baris;
}

/** Satu vendor, lengkap dengan tagihan dan seluruh pembayarannya. */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, vendorId } = await params;
  await konteksPlan(planId);
  const vendor = await ambil(planId, vendorId);

  const [pos] = vendor.budgetItemId
    ? await db
        .select({ name: budgetItems.name, plannedAmount: budgetItems.plannedAmount })
        .from(budgetItems)
        .where(and(eq(budgetItems.planId, planId), eq(budgetItems.id, vendor.budgetItemId)))
        .limit(1)
    : [];

  const riwayat = await db
    .select()
    .from(payments)
    .where(and(eq(payments.planId, planId), eq(payments.vendorId, vendorId)))
    .orderBy(asc(payments.paidAt));

  const [jumlah] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)::int` })
    .from(payments)
    .where(and(eq(payments.planId, planId), eq(payments.vendorId, vendorId)));

  const tagihan = pos?.plannedAmount ?? 0;

  return NextResponse.json({
    vendor: {
      ...vendor,
      budgetItemName: pos?.name ?? null,
      plannedAmount: tagihan,
      paidAmount: jumlah?.total ?? 0,
      remaining: tagihan - (jumlah?.total ?? 0),
    },
    payments: riwayat,
  });
});

export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, vendorId } = await params;
  await konteksPlan(planId);
  await ambil(planId, vendorId);

  const isi = skemaVendorUbah.parse(await bacaJson(req));

  // Sama seperti create: pos anggaran yang ditunjuk harus milik plan ini.
  if (isi.budgetItemId) await pastikanPosAnggaran(planId, isi.budgetItemId);

  const [baris] = await db
    .update(vendors)
    .set(isi)
    .where(and(eq(vendors.planId, planId), eq(vendors.id, vendorId)))
    .returning();

  return NextResponse.json({ vendor: baris });
});

/**
 * Hapus vendor beserta pembayarannya.
 *
 * Pembayaran tidak disisakan, karena kalau vendor hilang tapi pembayarannya
 * tertinggal, total terpakai di halaman anggaran jadi lebih besar daripada
 * jumlah yang bisa dijelaskan pasangan. Yang tidak jelas asalnya lebih
 * berbahaya daripada yang ikut terhapus.
 */
export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, vendorId } = await params;
  await konteksPlan(planId);
  await ambil(planId, vendorId);

  await db.transaction(async (tx) => {
    await tx.delete(payments).where(and(eq(payments.planId, planId), eq(payments.vendorId, vendorId)));
    await tx.delete(vendors).where(and(eq(vendors.planId, planId), eq(vendors.id, vendorId)));
  });

  return new NextResponse(null, { status: 204 });
});
