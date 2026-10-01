import { NextResponse } from "next/server";
import { and, asc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { bacaJson, bungkus } from "@/lib/galat";
import { cariParam, konteksPlan } from "@/lib/api";
import { skemaTamu } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/**
 * Daftar tamu beserta rekapnya.
 *
 * Rekap dihitung di server karena tiga layar berbeda menampilkan angka yang
 * sama: halaman tamu, Beranda, dan Laporan. Kalau tiap layar menghitung
 * sendiri, cepat atau lambat satu layar beda dan pasangan tidak tahu mana
 * yang benar.
 *
 * "Orang" dan "kursi" sengaja dua angka berbeda. Tamu yang belum konfirmasi
 * tetap dihitung di "orang" tapi tidak di "kursi" yang perlu disiapkan...
 * kecuali kalau dihitung sebagai perkiraan. Yang dipakai di sini: kursi
 * dihitung dari tamu yang sudah konfirmasi hadir, karena itu yang pasti
 * dipakai. Tamu yang belum konfirmasi ditampilkan terpisah supaya pasangan
 * tahu berapa yang masih menggantung.
 */
export const GET = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const url = new URL(req.url);
  const kategori = cariParam(url, "category");
  const rsvp = cariParam(url, "rsvpStatus");
  const cari = cariParam(url, "search");

  const saringan = [eq(guests.planId, planId)];
  if (kategori) saringan.push(eq(guests.category, kategori));
  if (rsvp) saringan.push(eq(guests.rsvpStatus, rsvp));
  if (cari) {
    // Pencarian ke nama dan nomor sekaligus, karena di HP orang sering
    // mengingat nomornya, bukan ejaan namanya.
    const pola = `%${cari.toLowerCase()}%`;
    saringan.push(
      or(sql`lower(${guests.name}) like ${pola}`, sql`${guests.phone} like ${pola}`)!,
    );
  }

  const daftar = await db
    .select()
    .from(guests)
    .where(and(...saringan))
    .orderBy(asc(guests.name))
    .limit(500);

  // Rekap selalu dihitung dari seluruh tamu, bukan dari hasil pencarian.
  // Kalau dihitung dari hasil pencarian, angkanya berubah saat orang mengetik
  // dan itu menyesatkan.
  const [rekap] = await db
    .select({
      total: sql<number>`count(*)::int`,
      orang: sql<number>`coalesce(sum(${guests.guestCount}), 0)::int`,
      hadir: sql<number>`coalesce(sum(case when ${guests.rsvpStatus} = 'hadir' then ${guests.guestCount} else 0 end), 0)::int`,
      tidakHadir: sql<number>`coalesce(sum(case when ${guests.rsvpStatus} = 'tidak' then ${guests.guestCount} else 0 end), 0)::int`,
      belumKonfirmasi: sql<number>`coalesce(sum(case when ${guests.rsvpStatus} = 'belum' then ${guests.guestCount} else 0 end), 0)::int`,
      belumDiundang: sql<number>`coalesce(sum(case when ${guests.invitedAt} is null then ${guests.guestCount} else 0 end), 0)::int`,
    })
    .from(guests)
    .where(eq(guests.planId, planId));

  // Jumlah undangan per kategori, dipakai oleh chip saringan di layar tamu.
  // Dihitung di server karena chip perlu angkanya sebelum diklik, dan angka
  // yang dihitung dari hasil saringan akan berubah setiap kali difilter.
  const perKategori = await db
    .select({
      kategori: guests.category,
      baris: sql<number>`count(*)::int`,
      orang: sql<number>`coalesce(sum(${guests.guestCount}), 0)::int`,
    })
    .from(guests)
    .where(eq(guests.planId, planId))
    .groupBy(guests.category);

  // Sebaran undangan per meja. Yang belum dialokasikan ikut, supaya pasangan
  // tahu berapa yang masih menggantung.
  const perMeja = await db
    .select({
      meja: guests.tableName,
      baris: sql<number>`count(*)::int`,
      orang: sql<number>`coalesce(sum(${guests.guestCount}), 0)::int`,
    })
    .from(guests)
    .where(eq(guests.planId, planId))
    .groupBy(guests.tableName)
    .orderBy(asc(guests.tableName));

  return NextResponse.json({
    guests: daftar,
    summary: {
      baris: rekap?.total ?? 0,
      orang: rekap?.orang ?? 0,
      kursi: rekap?.hadir ?? 0,
      tidakHadir: rekap?.tidakHadir ?? 0,
      belumKonfirmasi: rekap?.belumKonfirmasi ?? 0,
      belumDiundang: rekap?.belumDiundang ?? 0,
      // Tabungan: jumlah orang kalau semua yang belum konfirmasi akhirnya
      // datang. Ini angka yang dipakai untuk memesan kursi cadangan.
      perkiraanMaksimal: rekap?.orang ?? 0,
      perKategori,
      perMeja,
    },
  });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaTamu.parse(await bacaJson(req));

  const [baris] = await db
    .insert(guests)
    .values({
      planId,
      name: isi.name,
      phone: isi.phone ?? null,
      category: isi.category,
      side: isi.side ?? null,
      rsvpStatus: isi.rsvpStatus,
      guestCount: isi.guestCount,
      tableName: isi.tableName ?? null,
      notes: isi.notes ?? null,
    })
    .returning();

  return NextResponse.json({ guest: baris }, { status: 201 });
});
