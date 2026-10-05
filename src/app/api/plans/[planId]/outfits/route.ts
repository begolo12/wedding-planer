import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { outfits } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";
import { skemaBusana } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/**
 * Daftar busana.
 *
 * Diurutkan berdasarkan tanggal ambil, bukan tanggal ukur. Yang bikin panik
 * adalah "kapan barangnya harus sudah di tangan", bukan "kapan diukur".
 * Barang yang belum ada tanggal ambil ditaruh di bawah supaya yang mendesak
 * selalu kelihatan lebih dulu.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const daftar = await db
    .select()
    .from(outfits)
    .where(eq(outfits.planId, planId))
    .orderBy(asc(outfits.pickupDate), asc(outfits.measureDate));

  const perStatus = {
    belum: daftar.filter((o) => o.status === "belum").length,
    dicari: daftar.filter((o) => o.status === "dicari").length,
    dijahit: daftar.filter((o) => o.status === "dijahit").length,
    siap: daftar.filter((o) => o.status === "siap").length,
  };

  return NextResponse.json({
    outfits: daftar,
    summary: {
      total: daftar.length,
      siap: perStatus.siap,
      belumSiap: daftar.length - perStatus.siap,
      perStatus,
      // Perkiraan biaya dijumlahkan di server supaya angka di halaman Busana
      // dan di Laporan selalu sama.
      estimatedCost: daftar.reduce((n, o) => n + (o.estimatedCost ?? 0), 0),
    },
  });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaBusana.parse(await bacaJson(req));

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    const [baris] = await db
      .insert(outfits)
      .values({
        planId,
        itemName: isi.itemName,
        owner: isi.owner,
        status: isi.status,
        measureDate: isi.measureDate ?? null,
        pickupDate: isi.pickupDate ?? null,
        estimatedCost: isi.estimatedCost ?? null,
        notes: isi.notes ?? null,
      })
      .returning();

    return NextResponse.json({ outfit: baris }, { status: 201 });
  });
});
