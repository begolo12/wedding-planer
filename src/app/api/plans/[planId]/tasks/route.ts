import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { bungkus, bacaJson } from "@/lib/galat";
import { cariParam, konteksPlan, pastikanPosAnggaran } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";
import { skemaTugas } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/**
 * Daftar tugas satu plan. Filter dikirim lewat query dan disaring di server,
 * bukan di layar, supaya jumlah data yang terkirim tetap kecil walau tugasnya
 * sudah ratusan.
 */
export const GET = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const url = new URL(req.url);
  const status = cariParam(url, "status");
  const kategori = cariParam(url, "category");
  const penugasan = cariParam(url, "assignee");

  const saringan = [eq(tasks.planId, planId)];
  if (status) saringan.push(eq(tasks.status, status));
  if (kategori) saringan.push(eq(tasks.category, kategori));
  if (penugasan) saringan.push(eq(tasks.assignee, penugasan));

  const daftar = await db
    .select()
    .from(tasks)
    .where(and(...saringan))
    .orderBy(asc(tasks.dueDate), asc(tasks.sortOrder));

  return NextResponse.json({ tasks: daftar });
});

/** Tugas baru. Urutannya ditaruh di paling bawah daftar tanpa tenggat. */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaTugas.parse(await bacaJson(req));

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    // Pos anggaran yang ditunjuk harus milik plan ini. Tanpa ini, uuid yang
    // tidak ada berakhir jadi 500 dari foreign key, dan uuid milik plan lain
    // bisa tertaut diam-diam.
    if (isi.budgetItemId) await pastikanPosAnggaran(planId, isi.budgetItemId);

    const [tugas] = await db
      .insert(tasks)
      .values({
        planId,
        title: isi.title,
        category: isi.category,
        dueDate: isi.dueDate ?? null,
        status: isi.status,
        priority: isi.priority,
        assignee: isi.assignee ?? null,
        budgetItemId: isi.budgetItemId ?? null,
        notes: isi.notes ?? null,
        sortOrder: isi.sortOrder,
      })
      .returning();

    return NextResponse.json({ task: tugas }, { status: 201 });
  });
});
