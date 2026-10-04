import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaMilestoneUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; milestoneId: string }> };

async function ambil(planId: string, milestoneId: string) {
  idUuid(milestoneId, "Tanggal penting");
  const [baris] = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.planId, planId), eq(milestones.id, milestoneId)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Tanggal penting");
  return baris;
}

export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, milestoneId } = await params;
  await konteksPlan(planId);
  await ambil(planId, milestoneId);

  const isi = skemaMilestoneUbah.parse(await bacaJson(req));

  // Kalau baris ini jadi hari-H, baris lain dilepas. Dua hari-H sekaligus
  // membuat hitung mundur di semua layar jadi tidak bisa dipastikan.
  if (isi.isDayOf === true) {
    await db
      .update(milestones)
      .set({ isDayOf: false })
      .where(and(eq(milestones.planId, planId), ne(milestones.id, milestoneId)));
  }

  const [tanggal] = await db
    .update(milestones)
    .set(isi)
    .where(and(eq(milestones.planId, planId), eq(milestones.id, milestoneId)))
    .returning();

  return NextResponse.json({ milestone: tanggal });
});

export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, milestoneId } = await params;
  await konteksPlan(planId);
  await ambil(planId, milestoneId);

  await db
    .delete(milestones)
    .where(and(eq(milestones.planId, planId), eq(milestones.id, milestoneId)));
  return new NextResponse(null, { status: 204 });
});
