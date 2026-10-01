import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  budgetItems,
  guests,
  milestones,
  outfits,
  payments,
  plans,
  rundownItems,
  tasks,
  vendors,
} from "@/db/schema";
import { hitungMundur, selisihHari, tanggalPanjangDari } from "./format";
import { kelompokkan } from "./plan";
import { LABEL_KATEGORI_UANG } from "./konstanta";

/**
 * Semua angka laporan dihitung di sini dan tidak disimpan di mana pun.
 *
 * Alasannya sederhana: laporan yang dibuka keluarga harus menunjukkan keadaan
 * detik ini, bukan keadaan saat tombol laporan pertama kali ditekan. Kalau
 * angkanya disimpan, cepat atau lambat ada laporan lama yang dikira baru.
 *
 * Fungsi ini dipakai halaman Laporan, halaman Bagikan, teks WhatsApp, dan
 * PDF. Satu sumber angka, jadi tidak mungkin ada dua versi.
 */

export type PosLaporan = {
  id: string;
  name: string;
  category: string;
  labelKategori: string;
  planned: number;
  paid: number;
  remaining: number;
};

export type Laporan = {
  dibuatPada: string;
  judul: {
    namaPasangan: string;
    tanggal: string | null;
    tanggalTeks: string;
  };
  hitungMundur: {
    teks: string;
    hari: number | null;
  };
  uang: {
    planned: number;
    paid: number;
    remaining: number;
    persenTerpakai: number;
    jumlahPos: number;
    pos: PosLaporan[];
  };
  tugas: {
    total: number;
    selesai: number;
    lewat: number;
    mingguIni: number;
    tanpaTenggat: number;
    daftarTerdekat: { id: string; title: string; dueDate: string | null; assignee: string | null }[];
  };
  tamu: {
    baris: number;
    orang: number;
    kursi: number;
    belumKonfirmasi: number;
    belumDiundang: number;
    perKategori: { kategori: string; orang: number; baris: number }[];
  };
  rundown: {
    total: number;
    jamMulai: string | null;
    jamSelesai: string | null;
    item: { id: string; title: string; startTime: string; durationMinutes: number; location: string | null }[];
  };
  vendor: {
    total: number;
    dibook: number;
    belumLunas: number;
    totalTagihan: number;
    totalDibayar: number;
  };
  busana: {
    total: number;
    siap: number;
    belumSiap: number;
  };
  jadwal: { id: string; title: string; eventDate: string; type: string }[];
};

/** Tambah menit ke jam "HH:MM:SS", dibalik ke "HH.MM" supaya seragam. */
function tambahMenit(jam: string, menit: number): string {
  const [h, m] = jam.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + menit;
  const hh = Math.floor((total % 1440) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}.${String(mm).padStart(2, "0")}`;
}

export async function susunLaporan(planId: string): Promise<Laporan> {
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);

  const [pos, semuaTugas, semuaTamu, semuaPembayaran, semuaVendor, semuaRundown, semuaMilestone, semuaBusana] =
    await Promise.all([
      db
        .select()
        .from(budgetItems)
        .where(eq(budgetItems.planId, planId))
        .orderBy(asc(budgetItems.sortOrder), asc(budgetItems.createdAt)),
      db
        .select()
        .from(tasks)
        .where(eq(tasks.planId, planId))
        .orderBy(asc(tasks.dueDate), asc(tasks.sortOrder)),
      db.select().from(guests).where(eq(guests.planId, planId)),
      db
        .select({ amount: payments.amount, vendorId: payments.vendorId })
        .from(payments)
        .where(eq(payments.planId, planId)),
      db.select().from(vendors).where(eq(vendors.planId, planId)),
      db
        .select()
        .from(rundownItems)
        .where(eq(rundownItems.planId, planId))
        .orderBy(asc(rundownItems.startTime), asc(rundownItems.sortOrder)),
      db
        .select()
        .from(milestones)
        .where(eq(milestones.planId, planId))
        .orderBy(asc(milestones.eventDate)),
      db.select().from(outfits).where(eq(outfits.planId, planId)),
    ]);

  // Perhitungan pos anggaran dan pembayaran
  const paidPerVendor = new Map<string, number>();
  for (const p of semuaPembayaran) {
    paidPerVendor.set(p.vendorId, (paidPerVendor.get(p.vendorId) ?? 0) + p.amount);
  }

  const paidPerPos = new Map<string | null, number>();
  for (const v of semuaVendor) {
    if (!v.budgetItemId) continue;
    const dibayar = paidPerVendor.get(v.id) ?? 0;
    paidPerPos.set(v.budgetItemId, (paidPerPos.get(v.budgetItemId) ?? 0) + dibayar);
  }

  const planned = pos.reduce((n, p) => n + p.plannedAmount, 0);
  const paid = semuaPembayaran.reduce((n, p) => n + p.amount, 0);

  const posLaporan: PosLaporan[] = pos.map((p) => {
    const dibayar = paidPerPos.get(p.id) ?? 0;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      labelKategori: LABEL_KATEGORI_UANG[p.category as keyof typeof LABEL_KATEGORI_UANG] ?? "Lainnya",
      planned: p.plannedAmount,
      paid: dibayar,
      remaining: p.plannedAmount - dibayar,
    };
  });

  // Rekapitulasi tugas
  const belum = semuaTugas.filter((t) => t.status !== "selesai");
  const hitungKelompok = (k: string) => belum.filter((t) => kelompokkan(t.dueDate, t.status) === k).length;

  // Rekapitulasi tamu dan RSVP
  const perKategoriPeta = new Map<string, { orang: number; baris: number }>();
  for (const g of semuaTamu) {
    const k = perKategoriPeta.get(g.category) ?? { orang: 0, baris: 0 };
    k.orang += g.guestCount;
    k.baris += 1;
    perKategoriPeta.set(g.category, k);
  }

  const kursi = semuaTamu
    .filter((g) => g.rsvpStatus === "hadir")
    .reduce((n, g) => n + g.guestCount, 0);

  // Status pembayaran vendor
  const totalTagihanVendor = pos.reduce((n, p) => n + p.plannedAmount, 0);
  const belumLunas = semuaVendor.filter((v) => (paidPerVendor.get(v.id) ?? 0) < 1).length;

  // Jadwal akhir acara
  const akhirRundown = semuaRundown.length
    ? tambahMenit(
        semuaRundown[semuaRundown.length - 1]!.startTime,
        semuaRundown[semuaRundown.length - 1]!.durationMinutes,
      )
    : null;

  // Hari besar: milestone yang ditandai hari-H lebih dipercaya daripada
  // tanggal di plan, karena itu yang dipakai hitung mundur di Beranda juga.
  const hariOf = semuaMilestone.find((m) => m.isDayOf) ?? null;
  const tanggalBesar = hariOf?.eventDate ?? plan?.weddingDate ?? null;

  const jumlahOrang = semuaTamu.reduce((n, g) => n + g.guestCount, 0);

  return {
    dibuatPada: new Date().toISOString(),
    judul: {
      namaPasangan: plan?.partnerName ?? "",
      tanggal: tanggalBesar,
      tanggalTeks: tanggalPanjangDari(tanggalBesar),
    },
    hitungMundur: {
      teks: tanggalBesar ? hitungMundur(tanggalBesar) : "belum ada tanggal",
      hari: tanggalBesar ? selisihHari(tanggalBesar) : null,
    },
    uang: {
      planned,
      paid,
      remaining: planned - paid,
      // Persen terpakai dibulatkan ke bilangan bulat karena layar hanya
      // menampilkan bilangan bulat, dan membulatkan di satu tempat lebih
      // aman daripada di empat tempat.
      persenTerpakai: planned > 0 ? Math.round((paid / planned) * 100) : 0,
      jumlahPos: pos.length,
      pos: posLaporan,
    },
    tugas: {
      total: semuaTugas.length,
      selesai: semuaTugas.length - belum.length,
      lewat: hitungKelompok("lewat"),
      mingguIni: hitungKelompok("hariIni") + hitungKelompok("mingguIni"),
      tanpaTenggat: belum.filter((t) => !t.dueDate).length,
      daftarTerdekat: belum
        .filter((t) => kelompokkan(t.dueDate, t.status) !== "lewat")
        .slice(0, 6)
        .map((t) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          assignee: t.assignee,
        })),
    },
    tamu: {
      baris: semuaTamu.length,
      orang: jumlahOrang,
      kursi,
      belumKonfirmasi: semuaTamu
        .filter((g) => g.rsvpStatus === "belum")
        .reduce((n, g) => n + g.guestCount, 0),
      belumDiundang: semuaTamu.filter((g) => g.invitedAt === null).length,
      perKategori: [...perKategoriPeta.entries()]
        .map(([kategori, v]) => ({ kategori, orang: v.orang, baris: v.baris }))
        .sort((a, b) => b.orang - a.orang),
    },
    rundown: {
      total: semuaRundown.length,
      jamMulai: semuaRundown[0]?.startTime ?? null,
      jamSelesai: akhirRundown,
      item: semuaRundown.map((r) => ({
        id: r.id,
        title: r.title,
        startTime: r.startTime,
        durationMinutes: r.durationMinutes,
        location: r.location,
      })),
    },
    vendor: {
      total: semuaVendor.length,
      dibook: semuaVendor.filter((v) => v.status === "dibook").length,
      belumLunas,
      totalTagihan: totalTagihanVendor,
      totalDibayar: paid,
    },
    busana: {
      total: semuaBusana.length,
      siap: semuaBusana.filter((o) => o.status === "siap").length,
      belumSiap: semuaBusana.filter((o) => o.status !== "siap").length,
    },
    jadwal: semuaMilestone.map((m) => ({
      id: m.id,
      title: m.title,
      eventDate: m.eventDate,
      type: m.type,
    })),
  };
}
