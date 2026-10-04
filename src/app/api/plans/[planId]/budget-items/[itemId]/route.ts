import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaPosAnggaranUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; itemId: string }> };

async function ambil(planId: string, itemId: string) {
  idUuid(itemId, "Pos anggaran");
  const [baris] = await db
    .select()
    .from(budgetItems)
    .where(and(eq(budgetItems.planId, planId), eq(budgetItems.id, itemId)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Pos anggaran");
  return baris;
}

export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, itemId } = await params;
  await konteksPlan(planId);
  await ambil(planId, itemId);

  const isi = skemaPosAnggaranUbah.parse(await bacaJson(req));

  const [baris] = await db
    .update(budgetItems)
    .set(isi)
    .where(and(eq(budgetItems.planId, planId), eq(budgetItems.id, itemId)))
    .returning();

  return NextResponse.json({ item: baris });
});

/**
 * Hapus pos anggaran.
 *
 * Vendor dan tugas yang menunjuk ke pos ini tidak ikut terhapus. Relasinya
 * diatur "set null", jadi catatan pembayaran tetap ada dan total keseluruhan
 * tidak berubah diam-diam. Menghapus pos tidak boleh menghapus uang yang
 * sudah keluar.
 */
export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, itemId } = await params;
  await konteksPlan(planId);
  await ambil(planId, itemId);

  const [dipakai] = await db
    .select({ jumlah: sql<number>`count(*)::int` })
    .from(budgetItems)
    .where(and(eq(budgetItems.planId, planId), eq(budgetItems.id, itemId)));

  if (!dipakai) throw tidakDitemukan("Pos anggaran");

  await db
    .delete(budgetItems)
    .where(and(eq(budgetItems.planId, planId), eq(budgetItems.id, itemId)));

  return new NextResponse(null, { status: 204 });
});
