import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { bungkus, bacaJson, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaTugasUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; taskId: string }> };

async function ambilTugas(planId: string, taskId: string) {
  const [tugas] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.planId, planId), eq(tasks.id, taskId)))
    .limit(1);
  if (!tugas) throw tidakDitemukan("Tugas");
  return tugas;
}

/**
 * Ubah satu tugas. Filter planId dan id dipakai bersamaan, bukan salah satu,
 * supaya id tugas dari plan lain tidak bisa disentuh walau id-nya ditebak.
 */
export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, taskId } = await params;
  await konteksPlan(planId);
  await ambilTugas(planId, taskId);

  const isi = skemaTugasUbah.parse(await bacaJson(req));

  // completedAt diisi saat status berubah jadi selesai, dan dikosongkan lagi
  // kalau dibuka. Tanpa ini, tugas yang dibuka ulang tetap terlihat selesai
  // di hitungan lain.
  const tambahan: Record<string, unknown> = {};
  if (isi.status === "selesai") tambahan.completedAt = new Date();
  if (isi.status === "belum") tambahan.completedAt = null;

  const [tugas] = await db
    .update(tasks)
    .set({ ...isi, ...tambahan })
    .where(and(eq(tasks.planId, planId), eq(tasks.id, taskId)))
    .returning();

  return NextResponse.json({ task: tugas });
});

export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, taskId } = await params;
  await konteksPlan(planId);
  await ambilTugas(planId, taskId);

  await db.delete(tasks).where(and(eq(tasks.planId, planId), eq(tasks.id, taskId)));
  return new NextResponse(null, { status: 204 });
});
