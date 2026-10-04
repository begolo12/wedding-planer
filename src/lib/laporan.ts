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
import { ringkasTamu, type PerSisiTamu } from "./tamu";

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

/**
 * Satu vendor untuk bagian laporan. docs/16 bagian 2 menyebut "Vendor: yang
 * belum lunas" sebagai isi laporan, jadi barisnya perlu, bukan cuma jumlahnya.
 * `tagihan` diambil dari pos anggaran yang ditunjuk vendor, bukan field
 * terpisah, supaya angkanya tidak bisa berbeda dengan halaman Anggaran.
 */
export type VendorLaporan = {
  id: string;
  nama: string;
  kategori: string;
  labelKategori: string;
  tagihan: number;
  dibayar: number;
  sisa: number;
  sudahLunas: boolean;
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
    hadir: number;
    tidakHadir: number;
    kursi: number;
    porsi: number;
    belumKonfirmasi: number;
    belumDiundang: number;
    perKategori: { kategori: string; orang: number; baris: number }[];
    perSisi: PerSisiTamu;
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
    daftar: VendorLaporan[];
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
        .select({
          amount: payments.amount,
          vendorId: payments.vendorId,
          isFinal: payments.isFinal,
        })
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
  const finalPerVendor = new Set<string>();
  for (const p of semuaPembayaran) {
    paidPerVendor.set(p.vendorId, (paidPerVendor.get(p.vendorId) ?? 0) + p.amount);
    if (p.isFinal) finalPerVendor.add(p.vendorId);
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

  // Rekapitulasi tamu dan konfirmasi hadir. Satu fungsi yang sama dengan
  // endpoint /guests dan ringkasan Beranda, supaya angka di tiga layar tidak
  // bisa berbeda.
  const rekapTamu = ringkasTamu(semuaTamu);

  // Status pembayaran vendor, per baris. Diminta docs/16 bagian 2 ("Vendor:
  // yang belum lunas"), jadi jumlah saja tidak cukup.
  const totalTagihanVendor = pos.reduce((n, p) => n + p.plannedAmount, 0);
  const posPerId = new Map(pos.map((p) => [p.id, p]));
  const vendorDaftar: VendorLaporan[] = semuaVendor.map((v) => {
    const tagihan = v.budgetItemId ? (posPerId.get(v.budgetItemId)?.plannedAmount ?? 0) : 0;
    const dibayar = paidPerVendor.get(v.id) ?? 0;
    return {
      id: v.id,
      nama: v.name,
      kategori: v.category,
      labelKategori:
        LABEL_KATEGORI_UANG[v.category as keyof typeof LABEL_KATEGORI_UANG] ?? "Lainnya",
      tagihan,
      dibayar,
      sisa: tagihan - dibayar,
      // Lunas kalau ada pembayaran yang ditandai pelunasan akhir, atau
      // pembayaran sudah menutup tagihan. Vendor tanpa tagihan dan tanpa
      // pembayaran tetap dihitung belum lunas.
      sudahLunas: finalPerVendor.has(v.id) || (tagihan > 0 && dibayar >= tagihan),
    };
  });
  const belumLunas = vendorDaftar.filter((v) => !v.sudahLunas).length;

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
      baris: rekapTamu.baris,
      orang: rekapTamu.orang,
      hadir: rekapTamu.hadir,
      tidakHadir: rekapTamu.tidakHadir,
      // Kursi dan porsi memakai angka yang sama dari ringkasTamu: tamu pasti
      // hadir ditambah yang belum menjawab. Tamu yang menolak tidak dihitung.
      kursi: rekapTamu.kursi,
      porsi: rekapTamu.porsi,
      belumKonfirmasi: rekapTamu.belumKonfirmasi,
      // Satuan mengikuti Beranda dan endpoint /guests: orang, bukan baris.
      // Dulu di sini dihitung baris, jadi angka laporan berbeda dari angka di
      // dua layar lain untuk data yang sama.
      belumDiundang: rekapTamu.belumDiundang,
      perKategori: rekapTamu.perKategori,
      perSisi: rekapTamu.perSisi,
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
      daftar: vendorDaftar,
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
