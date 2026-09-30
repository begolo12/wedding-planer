import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks } from "@/db/schema";
import { bacaJson, bungkus, GalatAplikasi } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaTautan } from "@/lib/skema";
import { buatToken, urlTautan } from "@/lib/tautan";
import { BATAS_TAUTAN } from "@/lib/konstanta";

type Params = { params: Promise<{ planId: string }> };

/**
 * Daftar tautan baca-saja milik plan.
 *
 * Dihitung berapa sisa jatah supaya layar bisa mengatakannya sebelum orang
 * menekan tombol dan ditolak. Ditolak setelah menekan terasa seperti tombol
 * rusak, padahal batasnya memang disengaja.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const daftar = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.planId, planId))
    .orderBy(asc(shareLinks.createdAt));

  return NextResponse.json({
    links: daftar.map((l) => ({ ...l, url: urlTautan(l.token) })),
    limit: BATAS_TAUTAN,
    sisa: Math.max(0, BATAS_TAUTAN - daftar.length),
  });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaTautan.parse(await bacaJson(req));

  // Batas dihitung tepat sebelum menulis, bukan sebelum validasi, supaya dua
  // permintaan yang datang bersamaan tidak bisa melewati batas bersama sama.
  const [hitung] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(shareLinks)
    .where(eq(shareLinks.planId, planId));

  if ((hitung?.n ?? 0) >= BATAS_TAUTAN) {
    throw new GalatAplikasi(
      "LIMIT_REACHED",
      `Maksimal ${BATAS_TAUTAN} tautan. Cabut salah satu dulu kalau perlu yang baru.`,
    );
  }

  const [baris] = await db
    .insert(shareLinks)
    .values({ planId, label: isi.label, target: isi.target, token: buatToken() })
    .returning();

  return NextResponse.json(
    {
      link: { ...baris, url: urlTautan(baris.token) },
      sisa: Math.max(0, BATAS_TAUTAN - ((hitung?.n ?? 0) + 1)),
    },
    { status: 201 },
  );
});
