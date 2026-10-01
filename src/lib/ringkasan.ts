import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems, guests, milestones, payments, plans, tasks, vendors } from "@/db/schema";
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

/** Satu vendor untuk kartu "Vendor Utama" di Beranda. Tanpa logo, hanya data
 * yang benar benar tersimpan: nama, kategori, dan nomor telepon. */
export type VendorRingkas = {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  status: string;
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
  /** Tiga vendor pertama, untuk kartu "Vendor Utama". */
  vendorUtama: VendorRingkas[];
  /** Ringkasan tamu untuk kartu "Konfirmasi Tamu". Kursi = jumlah orang pada
   * tamu berstatus hadir, orang = perkiraan kursi kalau semua yang belum
   * menjawab ikut hadir. */
  tamu: {
    baris: number;
    orang: number;
    kursi: number;
    tidakHadir: number;
    belumKonfirmasi: number;
    belumDiundang: number;
  };
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
  const [semuaTugas, posAnggaran, semuaPembayaran, daftarMilestone, daftarVendor, ringkasTamu] =
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
      db
        .select({
          id: vendors.id,
          name: vendors.name,
          category: vendors.category,
          phone: vendors.phone,
          status: vendors.status,
        })
        .from(vendors)
        .where(eq(vendors.planId, planId))
        .orderBy(asc(vendors.name)),
      // Satu agregat untuk seluruh tamu, sama seperti endpoint /guests, supaya
      // angka kartu Beranda tidak mungkin berbeda dengan halaman Tamu.
      db
        .select({
          baris: sql<number>`count(*)::int`,
          orang: sql<number>`coalesce(sum(${guests.guestCount}), 0)::int`,
          kursi: sql<number>`coalesce(sum(case when ${guests.rsvpStatus} = 'hadir' then ${guests.guestCount} else 0 end), 0)::int`,
          tidakHadir: sql<number>`coalesce(sum(case when ${guests.rsvpStatus} = 'tidak' then ${guests.guestCount} else 0 end), 0)::int`,
          belumKonfirmasi: sql<number>`coalesce(sum(case when ${guests.rsvpStatus} = 'belum' then ${guests.guestCount} else 0 end), 0)::int`,
          belumDiundang: sql<number>`coalesce(sum(case when ${guests.invitedAt} is null then ${guests.guestCount} else 0 end), 0)::int`,
        })
        .from(guests)
        .where(eq(guests.planId, planId)),
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
    jumlahVendor: daftarVendor.length,
    vendorUtama: daftarVendor.slice(0, 3).map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      phone: v.phone ?? null,
      status: v.status,
    })),
    tamu: {
      baris: ringkasTamu[0]?.baris ?? 0,
      orang: ringkasTamu[0]?.orang ?? 0,
      kursi: ringkasTamu[0]?.kursi ?? 0,
      tidakHadir: ringkasTamu[0]?.tidakHadir ?? 0,
      belumKonfirmasi: ringkasTamu[0]?.belumKonfirmasi ?? 0,
      belumDiundang: ringkasTamu[0]?.belumDiundang ?? 0,
    },
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
