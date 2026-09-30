import { NextResponse } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems, payments, vendors } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { cariParam, konteksPlan } from "@/lib/api";
import { skemaVendor } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/**
 * Daftar vendor beserta tagihan, terbayar, dan sisanya.
 *
 * Tiga angka ini dihitung di server dan dikirim sekaligus, karena layar
 * vendor selalu menampilkan ketiganya berdampingan. "Tagihan" diambil dari
 * pos anggaran yang ditunjuk vendor, bukan dari field terpisah di vendor,
 * supaya angkanya tidak bisa berbeda dengan halaman anggaran.
 */
export const GET = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const url = new URL(req.url);
  const kategori = cariParam(url, "category");
  const status = cariParam(url, "status");

  const saringan = [eq(vendors.planId, planId)];
  if (kategori) saringan.push(eq(vendors.category, kategori));
  if (status) saringan.push(eq(vendors.status, status));

  const daftar = await db
    .select({
      id: vendors.id,
      name: vendors.name,
      category: vendors.category,
      status: vendors.status,
      contactName: vendors.contactName,
      phone: vendors.phone,
      address: vendors.address,
      notes: vendors.notes,
      budgetItemId: vendors.budgetItemId,
      budgetItemName: budgetItems.name,
      plannedAmount: budgetItems.plannedAmount,
      paidAmount: sql<number>`(
        select coalesce(sum(${payments.amount}), 0)::int
        from ${payments}
        where ${payments.vendorId} = ${vendors.id}
          and ${payments.planId} = ${planId}
      )`,
      jumlahPembayaran: sql<number>`(
        select count(*)::int
        from ${payments}
        where ${payments.vendorId} = ${vendors.id}
          and ${payments.planId} = ${planId}
      )`,
    })
    .from(vendors)
    .leftJoin(budgetItems, eq(vendors.budgetItemId, budgetItems.id))
    .where(and(...saringan))
    .orderBy(asc(vendors.name));

  return NextResponse.json({
    vendors: daftar.map((v) => {
      const tagihan = v.plannedAmount ?? 0;
      return {
        ...v,
        plannedAmount: tagihan,
        remaining: tagihan - v.paidAmount,
        // Vendor tanpa pembayaran sama sekali ditandai terpisah. Bagi pasangan
        // ini pertanyaan berbeda dari "kurang bayar berapa": yang pertama
        // berarti belum mulai, yang kedua berarti sudah jalan.
        belumAdaPembayaran: v.jumlahPembayaran === 0,
      };
    }),
  });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaVendor.parse(await bacaJson(req));

  const [baris] = await db
    .insert(vendors)
    .values({
      planId,
      name: isi.name,
      category: isi.category,
      budgetItemId: isi.budgetItemId ?? null,
      contactName: isi.contactName ?? null,
      phone: isi.phone ?? null,
      address: isi.address ?? null,
      status: isi.status,
      notes: isi.notes ?? null,
    })
    .returning();

  return NextResponse.json({ vendor: baris }, { status: 201 });
});
