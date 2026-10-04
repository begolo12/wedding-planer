import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { awalHariJakarta } from "@/lib/format";
import { skemaTamuUbah } from "@/lib/skema";

type Params = { params: Promise<{ planId: string; guestId: string }> };

async function ambil(planId: string, guestId: string) {
  idUuid(guestId, "Tamu");
  const [baris] = await db
    .select()
    .from(guests)
    .where(and(eq(guests.planId, planId), eq(guests.id, guestId)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Tamu");
  return baris;
}

/**
 * Ubah satu tamu.
 *
 * Kalau status kehadiran diubah jadi hadir atau tidak hadir, tanggal undangan
 * ikut diisi kalau belum ada. Alasannya hampir tidak mungkin orang mengubah
 * kehadiran tanpa pernah mengirim undangan, jadi tanggalnya pasti ada. Kalau
 * sudah ada tanggal, tanggal lama yang dipertahankan, bukan hari ini.
 */
export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId, guestId } = await params;
  await konteksPlan(planId);
  const tamu = await ambil(planId, guestId);

  const isi = skemaTamuUbah.parse(await bacaJson(req));

  const tambahan: Record<string, unknown> = {};
  if (isi.rsvpStatus && isi.rsvpStatus !== "belum" && !tamu.invitedAt) {
    // Tanggal undangan memakai awal hari menurut Asia/Jakarta, sama dengan
    // endpoint borongan, supaya tanggalnya pasti tanggal pengguna.
    tambahan.invitedAt = awalHariJakarta();
  }

  const [baris] = await db
    .update(guests)
    .set({ ...isi, ...tambahan })
    .where(and(eq(guests.planId, planId), eq(guests.id, guestId)))
    .returning();

  return NextResponse.json({ guest: baris });
});

/** Tandai undangan sudah dikirim atau belum, tanpa membuka formulir. */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId, guestId } = await params;
  await konteksPlan(planId);
  const tamu = await ambil(planId, guestId);

  const [baris] = await db
    .update(guests)
    .set({ invitedAt: tamu.invitedAt ? null : awalHariJakarta() })
    .where(and(eq(guests.planId, planId), eq(guests.id, guestId)))
    .returning();

  return NextResponse.json({ guest: baris });
});

export const DELETE = bungkus(async (_req: Request, { params }: Params) => {
  const { planId, guestId } = await params;
  await konteksPlan(planId);
  await ambil(planId, guestId);

  await db.delete(guests).where(and(eq(guests.planId, planId), eq(guests.id, guestId)));
  return new NextResponse(null, { status: 204 });
});
