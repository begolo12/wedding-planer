import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { plans, tasks } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { KATEGORI_TUGAS, type KategoriTugas } from "@/lib/konstanta";
import { TEMPLATE_TUGAS, tanggalDariHMinus } from "@/lib/template";

type Params = { params: Promise<{ planId: string }> };

const skemaTemplate = z.object({
  category: z.enum(KATEGORI_TUGAS),
});

/**
 * Memuat daftar tugas bawaan satu kategori.
 *
 * Dua hal yang dijaga di sini:
 * 1. Judul yang sudah ada tidak dimuat dua kali. Kalau tidak dijaga, orang
 *    yang menekan tombolnya dua kali akan mendapat tugas kembar dan harus
 *    menghapusnya satu per satu.
 * 2. Tenggat dihitung dari hari besar, bukan dari hari ini. Kalau dihitung
 *    dari hari ini, tugas administrasi yang seharusnya dikerjakan enam bulan
 *    lalu jadi terlihat belum lewat tenggat, dan urutannya jadi salah.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const { category } = skemaTemplate.parse(await bacaJson(req));

  const [plan] = await db
    .select({ weddingDate: plans.weddingDate, isDayOfDate: plans.isDayOfDate })
    .from(plans)
    .where(eq(plans.id, planId))
    .limit(1);

  const hariBesar = plan?.isDayOfDate ?? plan?.weddingDate ?? null;
  const bawaan = TEMPLATE_TUGAS[category as KategoriTugas];

  const sudahAda = await db
    .select({ title: tasks.title })
    .from(tasks)
    .where(and(eq(tasks.planId, planId), eq(tasks.category, category)));

  const judulAda = new Set(sudahAda.map((t) => t.title.toLowerCase()));
  const baru = bawaan
    .filter((t) => !judulAda.has(t.title.toLowerCase()))
    .map((t, i) => ({
      planId,
      title: t.title,
      category,
      dueDate: tanggalDariHMinus(hariBesar, t.hMinus),
      status: "belum",
      priority: t.priority,
      sortOrder: i,
    }));

  if (baru.length === 0) {
    return NextResponse.json({ tasks: [], dilewati: bawaan.length });
  }

  const dibuat = await db.insert(tasks).values(baru).returning();

  return NextResponse.json({ tasks: dibuat, dilewati: bawaan.length - baru.length }, { status: 201 });
});
