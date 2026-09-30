import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { bungkus, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";

type Params = { params: Promise<{ planId: string; taskId: string }> };

/**
 * Menandai selesai atau membuka lagi, dengan satu request kecil.
 *
 * Alasannya bukan PATCH biasa: kalau lewat PATCH, layar harus tahu status
 * sekarang dulu supaya bisa mengirim nilai yang benar. Itu berarti satu
 * permintaan tambahan untuk aksi yang paling sering dipakai di seluruh
 * aplikasi. Di sini server yang membalik statusnya, jadi layar cukup menekan
 * sekali tanpa membaca dulu.
 */
export const POST = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, taskId } = await params;
  await konteksPlan(planId);

  const [sekarang] = await db
    .select({ id: tasks.id, status: tasks.status })
    .from(tasks)
    .where(and(eq(tasks.planId, planId), eq(tasks.id, taskId)))
    .limit(1);

  if (!sekarang) throw tidakDitemukan("Tugas");

  const jadiSelesai = sekarang.status !== "selesai";

  const [tugas] = await db
    .update(tasks)
    .set({
      status: jadiSelesai ? "selesai" : "belum",
      completedAt: jadiSelesai ? new Date() : null,
    })
    .where(and(eq(tasks.planId, planId), eq(tasks.id, taskId)))
    .returning();

  return NextResponse.json({ task: tugas });
});
