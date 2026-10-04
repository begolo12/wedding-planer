import { NextResponse } from "next/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { awalHariJakarta } from "@/lib/format";
import { skemaTandaiUndangan } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/**
 * Tandai undangan sudah dikirim secara borongan.
 *
 * Hanya tamu yang belum punya tanggal undangan yang diisi, supaya mengirim
 * ulang daftar tidak menimpa tanggal pengiriman yang sudah dicatat satu per
 * satu. Tanggalnya awal hari menurut Asia/Jakarta, sama dengan tombol per
 * tamu, supaya "kapan dikirim" tidak bergantung zona server.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaTandaiUndangan.parse(await bacaJson(req));
  const undanganPada = awalHariJakarta();

  const saringan = [eq(guests.planId, planId), isNull(guests.invitedAt)];
  if (!isi.semua) saringan.push(inArray(guests.id, isi.ids ?? []));

  const diubah = await db
    .update(guests)
    .set({ invitedAt: undanganPada })
    .where(and(...saringan))
    .returning({ id: guests.id });

  return NextResponse.json({
    updated: diubah.length,
    invitedAt: undanganPada.toISOString(),
  });
});
