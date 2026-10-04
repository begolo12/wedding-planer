import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaPengumumanUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; id: string }> };

async function ambil(planId: string, id: string) {
  idUuid(id, "Pengumuman");
  const [baris] = await db
    .select()
    .from(announcements)
    .where(and(eq(announcements.planId, planId), eq(announcements.id, id)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Pengumuman");
  return baris;
}

/**
 * Ubah pengumuman.
 *
 * Isi yang dikirim cuma yang boleh diubah, jadi `shareToken` tidak akan
 * pernah ikut berubah walaupun ada yang mencoba mengirimnya dari client.
 * Kalau kuncinya berubah, tautan yang sudah disebar ke keluarga langsung
 * mati dan tidak ada satu pun orang tua yang tahu kenapa.
 */
export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, id } = await params;
  await konteksPlan(planId);
  await ambil(planId, id);

  const isi = skemaPengumumanUbah.parse(await bacaJson(req));

  const [baris] = await db
    .update(announcements)
    .set({
      title: isi.title,
      body: isi.body,
      audience: isi.audience,
      isPinned: isi.isPinned,
    })
    .where(and(eq(announcements.planId, planId), eq(announcements.id, id)))
    .returning();

  return NextResponse.json({ announcement: baris });
});

export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, id } = await params;
  await konteksPlan(planId);
  await ambil(planId, id);

  await db
    .delete(announcements)
    .where(and(eq(announcements.planId, planId), eq(announcements.id, id)));
  return new NextResponse(null, { status: 204 });
});
