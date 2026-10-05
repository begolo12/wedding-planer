import { NextResponse } from "next/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems, payments, vendors } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";
import { skemaPosAnggaran } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/**
 * Pos anggaran beserta totalnya.
 *
 * Total dihitung di server dan dikirim bersama daftarnya. Kalau layar yang
 * menjumlahkan, angka di halaman anggaran, di laporan, dan di teks WhatsApp
 * bisa berbeda, dan yang disalahkan selalu laporannya.
 *
 * "Terpakai" dihitung dari pembayaran yang sudah tercatat, bukan dari status
 * vendor. Status vendor cuma penanda, sedangkan uang yang keluar nyata adalah
 * yang ada tanggal dan jumlahnya.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const [pos, semuaPembayaran, semuaVendor] = await Promise.all([
    db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.planId, planId))
      .orderBy(asc(budgetItems.sortOrder), asc(budgetItems.createdAt)),
    db
      .select({
        id: payments.id,
        vendorId: payments.vendorId,
        vendorName: vendors.name,
        budgetItemId: vendors.budgetItemId,
        amount: payments.amount,
        paidAt: payments.paidAt,
        method: payments.method,
        isFinal: payments.isFinal,
        notes: payments.notes,
      })
      .from(payments)
      .innerJoin(vendors, eq(payments.vendorId, vendors.id))
      .where(eq(payments.planId, planId))
      .orderBy(desc(payments.paidAt), desc(payments.createdAt)),
    db
      .select({
        id: vendors.id,
        name: vendors.name,
        category: vendors.category,
        status: vendors.status,
        budgetItemId: vendors.budgetItemId,
      })
      .from(vendors)
      .where(eq(vendors.planId, planId))
      .orderBy(asc(vendors.name)),
  ]);

  // Terpakai per pos: jumlah pembayaran dari vendor yang tertaut ke pos itu.
  // Vendor tanpa pos masuk ke hitungan total tapi tidak ke pos mana pun,
  // karena menebak pos akan membuat angka per pos salah.
  const terpakaiPerPos = await db
    .select({
      budgetItemId: vendors.budgetItemId,
      total: sql<number>`coalesce(sum(${payments.amount}), 0)::int`,
    })
    .from(payments)
    .innerJoin(vendors, eq(payments.vendorId, vendors.id))
    .where(eq(payments.planId, planId))
    .groupBy(vendors.budgetItemId);

  const peta = new Map(terpakaiPerPos.map((b) => [b.budgetItemId, b.total]));

  const rencana = pos.reduce((n, p) => n + p.plannedAmount, 0);
  const terpakai = semuaPembayaran.reduce((n, p) => n + p.amount, 0);
  // Sebaran rencana biaya per kategori, dipakai untuk bilah bertingkat di
  // layar anggaran. Dihitung di server supaya layar tidak menjumlah ulang.
  const sebaranKategori = pos.reduce<Record<string, number>>((n, p) => {
    n[p.category] = (n[p.category] ?? 0) + p.plannedAmount;
    return n;
  }, {});

  return NextResponse.json({
    items: pos.map((p) => {
      const dipakai = peta.get(p.id) ?? 0;
      return {
        ...p,
        paidAmount: dipakai,
        remaining: p.plannedAmount - dipakai,
        // Lewat batas dihitung di server supaya semua layar sepakat. Angka
        // yang sama dihitung di dua tempat akan berbeda cepat atau lambat.
        overBudget: dipakai > p.plannedAmount,
      };
    }),
    totals: { planned: rencana, paid: terpakai, remaining: rencana - terpakai },
    sebaranKategori,
    vendors: semuaVendor,
    // Riwayat pembayaran ikut dikirim supaya layar anggaran bisa menampilkan
    // rincian pengeluaran tanpa memanggil endpoint kedua.
    payments: semuaPembayaran,
  });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaPosAnggaran.parse(await bacaJson(req));

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    const [baris] = await db
      .insert(budgetItems)
      .values({
        planId,
        name: isi.name,
        category: isi.category,
        plannedAmount: isi.plannedAmount,
        notes: isi.notes ?? null,
        sortOrder: isi.sortOrder,
      })
      .returning();

    return NextResponse.json({ item: baris }, { status: 201 });
  });
});
