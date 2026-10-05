import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { outfits } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";
import { skemaBusanaUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; itemId: string }> };

async function ambil(planId: string, itemId: string) {
  idUuid(itemId, "Barang busana");
  const [baris] = await db
    .select()
    .from(outfits)
    .where(and(eq(outfits.planId, planId), eq(outfits.id, itemId)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Barang busana");
  return baris;
}

export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, itemId } = await params;
  await konteksPlan(planId);
  await ambil(planId, itemId);

  const isi = skemaBusanaUbah.parse(await bacaJson(req));

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    const [baris] = await db
      .update(outfits)
      .set(isi)
      .where(and(eq(outfits.planId, planId), eq(outfits.id, itemId)))
      .returning();

    return NextResponse.json({ outfit: baris });
  });
});

export const DELETE = bungkus(async (req: Request, { params }: Params) => {
  const { planId, itemId } = await params;
  await konteksPlan(planId);
  await ambil(planId, itemId);

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    await db.delete(outfits).where(and(eq(outfits.planId, planId), eq(outfits.id, itemId)));
    return new NextResponse(null, { status: 204 });
  });
});
