import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems, milestones, payments, plans, tasks, vendors } from "@/db/schema";
import { kelompokkan, tanggalHariBesar, type KelompokWaktu } from "./plan";
import { belumSelesai } from "./server-plan";
import { hitungMundur, selisihHari } from "./format";

/**
 * Semua angka Beranda dihitung di satu tempat. Layar Beranda dan endpoint
 * `/overview` memanggil fungsi yang sama, jadi tidak mungkin ada dua versi
 * hitungan yang berbeda untuk layar yang sama.
 */

export type TugasRingkas = {
  id: string;
  title: string;
  category: string;
  dueDate: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  nominal: number | null;
  kelompok: KelompokWaktu;
};

export type RingkasanPlan = {
  plan: {
    id: string;
    partnerName: string;
    weddingDate: string | null;
    isDayOfDate: string | null;
    status: string;
  };
  hariBesar: string | null;
  teksHitungMundur: string | null;
  hariKe: number | null;
  tugasTerdekat: TugasRingkas[];
  jumlahTugas: { total: number; selesai: number; lewat: number; tanpaTenggat: number };
  uang: { planned: number; paid: number; remaining: number };
  jumlahVendor: number;
  tanggalBerikut: {
    id: string;
    title: string;
    eventDate: string;
    eventTime: string | null;
    type: string;
    selisihHari: number;
  } | null;
};

export async function ringkasanPlan(planId: string): Promise<RingkasanPlan> {
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

  // Semua query di bawah punya filter planId, sesuai aturan AGENTS.md bagian 5.
  const [semuaTugas, posAnggaran, semuaPembayaran, daftarMilestone, semuaVendor] =
    await Promise.all([
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          category: tasks.category,
          dueDate: tasks.dueDate,
          status: tasks.status,
          priority: tasks.priority,
          assignee: tasks.assignee,
          sortOrder: tasks.sortOrder,
          nominal: budgetItems.plannedAmount,
        })
        .from(tasks)
        .leftJoin(budgetItems, eq(tasks.budgetItemId, budgetItems.id))
        .where(eq(tasks.planId, planId))
        .orderBy(asc(tasks.dueDate), asc(tasks.sortOrder)),
      db
        .select({ plannedAmount: budgetItems.plannedAmount })
        .from(budgetItems)
        .where(eq(budgetItems.planId, planId)),
      db
        .select({ amount: payments.amount })
        .from(payments)
        .where(eq(payments.planId, planId)),
      db
        .select({
          id: milestones.id,
          title: milestones.title,
          eventDate: milestones.eventDate,
          eventTime: milestones.eventTime,
          type: milestones.type,
          isDayOf: milestones.isDayOf,
        })
        .from(milestones)
        .where(eq(milestones.planId, planId))
        .orderBy(asc(milestones.eventDate)),
      db.select({ id: vendors.id }).from(vendors).where(eq(vendors.planId, planId)),
    ]);

  // Milestone yang ditandai hari-H lebih dipercaya daripada tanggal di plan.
  const hariOf = daftarMilestone.find((m) => m.isDayOf) ?? null;
  const hariBesar = plan
    ? tanggalHariBesar({
        weddingDate: plan.weddingDate,
        isDayOfDate: hariOf?.eventDate ?? null,
      })
    : null;

  const belumBeres = semuaTugas.filter((t) => t.status !== "selesai");

  // Lima tugas terdekat, tanpa yang lewat tenggat. Tugas lewat tenggat
  // ditampilkan sebagai satu baris ringkas di atas daftar, bukan ikut di sini,
  // supaya lima terdekat benar benar yang paling dekat.
  const tugasTerdekat: TugasRingkas[] = belumBeres
    .filter((t) => {
      const k = kelompokkan(t.dueDate, t.status);
      return k === "hariIni" || k === "mingguIni" || k === "tanpaTenggat";
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    })
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      dueDate: t.dueDate,
      status: t.status,
      priority: t.priority,
      assignee: t.assignee,
      nominal: t.nominal ?? null,
      kelompok: kelompokkan(t.dueDate, t.status),
    }));

  const lewat = belumBeres.filter((t) => kelompokkan(t.dueDate, t.status) === "lewat").length;

  const planned = posAnggaran.reduce((n, p) => n + p.plannedAmount, 0);
  const paid = semuaPembayaran.reduce((n, p) => n + p.amount, 0);

  // "Tanggal berikut" adalah milestone terdekat yang belum lewat. Kalau semua
  // sudah lewat, yang ditampilkan adalah yang paling akhir, bukan kosong,
  // karena setelah hari-H masih ada acara susulan.
  const berikut =
    daftarMilestone.find((m) => (selisihHari(m.eventDate) ?? -1) >= 0) ??
    daftarMilestone[daftarMilestone.length - 1] ??
    null;

  return {
    plan: {
      id: plan?.id ?? "",
      partnerName: plan?.partnerName ?? "",
      weddingDate: plan?.weddingDate ?? null,
      isDayOfDate: plan?.isDayOfDate ?? null,
      status: plan?.status ?? "perencanaan",
    },
    hariBesar,
    teksHitungMundur: hariBesar ? hitungMundur(hariBesar) : null,
    hariKe: hariBesar ? selisihHari(hariBesar) : null,
    tugasTerdekat,
    jumlahTugas: {
      total: semuaTugas.length,
      selesai: semuaTugas.length - belumBeres.length,
      lewat,
      tanpaTenggat: belumBeres.filter((t) => !t.dueDate).length,
    },
    uang: { planned, paid, remaining: planned - paid },
    jumlahVendor: semuaVendor.length,
    tanggalBerikut: berikut
      ? {
          id: berikut.id,
          title: berikut.title,
          eventDate: berikut.eventDate,
          eventTime: berikut.eventTime,
          type: berikut.type,
          selisihHari: selisihHari(berikut.eventDate) ?? 0,
        }
      : null,
  };
}

/** Jumlah tugas belum selesai, dipakai untuk satu baris ringkas di Beranda. */
export async function jumlahTugasTerbuka(planId: string): Promise<number> {
  const [hasil] = await db
    .select({ jumlah: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(eq(tasks.planId, planId), belumSelesai()));
  return hasil?.jumlah ?? 0;
}
