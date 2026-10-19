import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks } from "@/db/schema";
import { bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";

type Params = { params: Promise<{ planId: string; linkId: string }> };

/**
 * Cabut tautan.
 *
 * DELETE dipakai karena mencabut tautan memang menghapusnya, bukan menandai.
 * Tautan yang ditandai mati tapi barisnya masih ada akan terus dihitung
 * terhadap batas lima, dan orang jadi tidak bisa membuat tautan baru padahal
 * daftar di layarnya sudah kosong.
 *
 * Hasilnya disimpan per kunci supaya kiriman ulang dari antrean luring tidak
 * dijalankan dua kali.
 */
export const DELETE = bungkus(async (req: Request, { params }: Params) => {
  const { planId, linkId } = await params;
  await konteksPlan(planId);
  idUuid(linkId, "Tautan");

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    const dihapus = await db
      .delete(shareLinks)
      .where(and(eq(shareLinks.planId, planId), eq(shareLinks.id, linkId)))
      .returning({ id: shareLinks.id });

    if (!dihapus.length) throw tidakDitemukan("Tautan");

    return new NextResponse(null, { status: 204 });
  });
});
