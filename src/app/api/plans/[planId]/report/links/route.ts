import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks } from "@/db/schema";
import { bacaJson, bungkus, GalatAplikasi } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";
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

/**
 * Buat tautan baca-saja baru.
 *
 * Dua penjagaan yang harus ada bersamaan:
 * - Kunci penasihat per rencana (`pg_advisory_xact_lock`) menyerialkan
 *   permintaan yang datang bersamaan, supaya dua permintaan tidak sama sama
 *   melihat hitungan empat dan sama sama menulis tautan kelima.
 * - Kunci idempotency mencegah kiriman ulang dari antrean luring membuat
 *   tautan kembar dengan token berbeda.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaTautan.parse(await bacaJson(req));

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    const hasil = await db.transaction(async (tx) => {
      // Kunci dipegang sampai transaksi selesai. Batas lima dihitung di dalam
      // kunci yang sama, jadi tidak ada celah antara menghitung dan menulis.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${planId}))`);

      const [hitung] = await tx
        .select({ n: sql<number>`count(*)::int` })
        .from(shareLinks)
        .where(eq(shareLinks.planId, planId));

      if ((hitung?.n ?? 0) >= BATAS_TAUTAN) {
        throw new GalatAplikasi(
          "LIMIT_REACHED",
          `Maksimal ${BATAS_TAUTAN} tautan. Cabut salah satu dulu kalau perlu yang baru.`,
        );
      }

      const [dibuat] = await tx
        .insert(shareLinks)
        .values({ planId, label: isi.label, target: isi.target, token: buatToken() })
        .returning();

      return { dibuat, sebelumnya: hitung?.n ?? 0 };
    });

    return NextResponse.json(
      {
        link: { ...hasil.dibuat, url: urlTautan(hasil.dibuat.token) },
        sisa: Math.max(0, BATAS_TAUTAN - (hasil.sebelumnya + 1)),
      },
      { status: 201 },
    );
  });
});
