import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";

type Params = { params: Promise<{ planId: string }> };

const skemaUrutan = z.object({
  taskIds: z.array(z.string().uuid()).min(1, "Tidak ada tugas yang diurutkan.").max(500),
});

/**
 * Menyimpan urutan tugas yang baru.
 *
 * Yang dikirim adalah daftar lengkap, bukan selisihnya. Kalau yang dikirim
 * cuma "tugas A pindah ke atas B", satu request yang gagal di tengah jalan
 * bisa meninggalkan urutan yang setengah berubah, dan tidak ada cara tahu
 * mana yang sudah masuk. Daftar lengkap selalu bisa dikirim ulang.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const { taskIds } = skemaUrutan.parse(await bacaJson(req));

  // Hanya id yang memang milik plan ini yang boleh diubah urutannya.
  const milikSaya = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.planId, planId), inArray(tasks.id, taskIds)));

  const boleh = new Set(milikSaya.map((t) => t.id));

  await Promise.all(
    taskIds
      .filter((id) => boleh.has(id))
      .map((id, urutan) =>
        db
          .update(tasks)
          .set({ sortOrder: urutan })
          .where(and(eq(tasks.planId, planId), eq(tasks.id, id))),
      ),
  );

  return new NextResponse(null, { status: 204 });
});
