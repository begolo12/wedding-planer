import { NextResponse } from "next/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { bungkus, bacaJson, belumMasuk } from "@/lib/galat";
import { sesiSekarang } from "@/lib/sesi";
import { skemaPlanBaru } from "@/lib/skema";

/** Daftar plan milik pengguna. Diurutkan dari yang paling lama dibuat. */
export const GET = bungkus(async () => {
  const pengguna = await sesiSekarang();
  if (!pengguna) throw belumMasuk();

  const daftar = await db
    .select()
    .from(plans)
    .where(and(eq(plans.userId, pengguna.id), isNull(plans.deletedAt)))
    .orderBy(asc(plans.createdAt));

  return NextResponse.json({ plans: daftar });
});

/**
 * Rencana baru. userId diambil dari sesi, tidak pernah dari body, karena
 * nilai yang dikirim client tidak boleh menentukan siapa pemilik data.
 */
export const POST = bungkus(async (req: Request) => {
  const pengguna = await sesiSekarang();
  if (!pengguna) throw belumMasuk();

  const isi = skemaPlanBaru.parse(await bacaJson(req));

  const [plan] = await db
    .insert(plans)
    .values({
      userId: pengguna.id,
      partnerName: isi.partnerName,
      weddingDate: isi.weddingDate ?? null,
      notes: isi.notes ?? null,
    })
    .returning();

  return NextResponse.json({ plan }, { status: 201 });
});
