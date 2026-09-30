import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaMilestone } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/** Tanggal penting, diurutkan dari yang paling dekat. */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const daftar = await db
    .select()
    .from(milestones)
    .where(eq(milestones.planId, planId))
    .orderBy(asc(milestones.eventDate), asc(milestones.sortOrder));

  return NextResponse.json({ milestones: daftar });
});

/**
 * Tanggal penting baru. Hanya satu yang boleh ditandai sebagai hari-H, karena
 * dua hari-H membuat hitung mundur di Beranda jadi tidak jelas mana yang
 * dipakai. Yang lama diturunkan diam-diam di dalam transaksi yang sama.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaMilestone.parse(await bacaJson(req));

  if (isi.isDayOf) {
    await db.update(milestones).set({ isDayOf: false }).where(eq(milestones.planId, planId));
  }

  const [tanggal] = await db
    .insert(milestones)
    .values({
      planId,
      title: isi.title,
      eventDate: isi.eventDate,
      eventTime: isi.eventTime ?? null,
      type: isi.type,
      isDayOf: isi.isDayOf,
      notes: isi.notes ?? null,
      sortOrder: isi.sortOrder,
    })
    .returning();

  return NextResponse.json({ milestone: tanggal }, { status: 201 });
});
