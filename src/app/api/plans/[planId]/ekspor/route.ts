import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  announcements,
  budgetItems,
  guests,
  milestones,
  outfits,
  payments,
  rundownItems,
  tasks,
  vendors,
} from "@/db/schema";
import { bungkus } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";

type Params = { params: Promise<{ planId: string }> };

/**
 * Ekspor seluruh data satu plan, untuk hak unduh data pribadi di
 * docs/08-NFR.md bagian Privasi.
 *
 * Berbeda dari tombol unduh lama yang cuma memuat ringkasan dan agregat,
 * endpoint ini mengembalikan baris apa adanya, termasuk nama dan nomor tamu,
 * karena pemilik data berhak atas datanya sendiri. Semua query memakai filter
 * planId, jadi tidak ada baris plan lain yang ikut.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  const { plan } = await konteksPlan(planId);

  const [
    daftarMilestone,
    daftarTugas,
    daftarPos,
    daftarVendor,
    daftarPembayaran,
    daftarTamu,
    daftarRundown,
    daftarPengumuman,
    daftarBusana,
  ] = await Promise.all([
    db
      .select()
      .from(milestones)
      .where(eq(milestones.planId, planId))
      .orderBy(asc(milestones.eventDate), asc(milestones.sortOrder)),
    db
      .select()
      .from(tasks)
      .where(eq(tasks.planId, planId))
      .orderBy(asc(tasks.dueDate), asc(tasks.sortOrder)),
    db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.planId, planId))
      .orderBy(asc(budgetItems.sortOrder), asc(budgetItems.createdAt)),
    db.select().from(vendors).where(eq(vendors.planId, planId)).orderBy(asc(vendors.name)),
    db
      .select()
      .from(payments)
      .where(eq(payments.planId, planId))
      .orderBy(asc(payments.paidAt), asc(payments.createdAt)),
    db.select().from(guests).where(eq(guests.planId, planId)).orderBy(asc(guests.name)),
    db
      .select()
      .from(rundownItems)
      .where(eq(rundownItems.planId, planId))
      .orderBy(asc(rundownItems.startTime), asc(rundownItems.sortOrder)),
    db
      .select()
      .from(announcements)
      .where(eq(announcements.planId, planId))
      .orderBy(asc(announcements.createdAt)),
    db.select().from(outfits).where(eq(outfits.planId, planId)).orderBy(asc(outfits.itemName)),
  ]);

  return NextResponse.json({
    ekspor: {
      dibuatPada: new Date().toISOString(),
      plan,
      milestones: daftarMilestone,
      tasks: daftarTugas,
      budgetItems: daftarPos,
      vendors: daftarVendor,
      payments: daftarPembayaran,
      guests: daftarTamu,
      rundown: daftarRundown,
      announcements: daftarPengumuman,
      outfits: daftarBusana,
    },
  });
});
