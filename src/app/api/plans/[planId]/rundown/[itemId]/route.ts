import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { rundownItems } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaRundownUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; itemId: string }> };

async function ambil(planId: string, itemId: string) {
  idUuid(itemId, "Acara rundown");
  const [baris] = await db
    .select()
    .from(rundownItems)
    .where(and(eq(rundownItems.planId, planId), eq(rundownItems.id, itemId)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Acara rundown");
  return baris;
}

export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, itemId } = await params;
  await konteksPlan(planId);
  await ambil(planId, itemId);

  const isi = skemaRundownUbah.parse(await bacaJson(req));

  const [baris] = await db
    .update(rundownItems)
    .set(isi)
    .where(and(eq(rundownItems.planId, planId), eq(rundownItems.id, itemId)))
    .returning();

  return NextResponse.json({ item: baris });
});

export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, itemId } = await params;
  await konteksPlan(planId);
  await ambil(planId, itemId);

  await db
    .delete(rundownItems)
    .where(and(eq(rundownItems.planId, planId), eq(rundownItems.id, itemId)));
  return new NextResponse(null, { status: 204 });
});
