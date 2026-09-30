import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { rundownItems } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaRundown } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/**
 * Urutan acara hari-H.
 *
 * Diurutkan berdasarkan jam mulai, bukan sortOrder. Alasannya, rundown yang
 * jamnya berantakan adalah rundown yang salah, jadi jamnya sendiri sudah
 * cukup jadi urutan. sortOrder dipakai hanya untuk item yang jamnya sama,
 * supaya dua item jam 08:00 tidak berpindah posisi sendiri saat dibuka.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const daftar = await db
    .select()
    .from(rundownItems)
    .where(eq(rundownItems.planId, planId))
    .orderBy(asc(rundownItems.startTime), asc(rundownItems.sortOrder));

  return NextResponse.json({ rundown: daftar });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaRundown.parse(await bacaJson(req));

  const [baris] = await db
    .insert(rundownItems)
    .values({
      planId,
      title: isi.title,
      startTime: isi.startTime,
      durationMinutes: isi.durationMinutes,
      location: isi.location ?? null,
      picName: isi.picName ?? null,
      notes: isi.notes ?? null,
      sortOrder: isi.sortOrder,
    })
    .returning();

  return NextResponse.json({ item: baris }, { status: 201 });
});
