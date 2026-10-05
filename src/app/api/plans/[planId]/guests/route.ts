import { NextResponse } from "next/server";
import { and, asc, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { bacaJson, bungkus, tidakValid } from "@/lib/galat";
import { cariParam, konteksPlan } from "@/lib/api";
import { HEADER_KUNCI, sekaliPerKunci } from "@/lib/idempotensi";
import { ringkasTamu, sisiDikenal } from "@/lib/tamu";
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
  const sisi = cariParam(url, "sisi");
  const undangan = cariParam(url, "undangan");

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
  if (sisi) {
    if (sisi === "pria" || sisi === "wanita") {
      saringan.push(eq(guests.side, sisi));
    } else if (sisi === "lainnya" || sisi === "bersama") {
      // "Bersama" mencakup nilai `lainnya`, baris lama yang tidak dikenal, dan
      // baris yang belum diisi sisinya, sama seperti rekap perSisi.bersama.
      saringan.push(sql`(${guests.side} is null or ${guests.side} not in ('pria','wanita'))`);
    } else {
      throw tidakValid("Sisi tamu tidak dikenal.", {
        sisi: "Pilih pria, wanita, atau lainnya.",
      });
    }
  }
  if (undangan) {
    if (undangan === "sudah") saringan.push(isNotNull(guests.invitedAt));
    else if (undangan === "belum") saringan.push(isNull(guests.invitedAt));
    else {
      throw tidakValid("Filter undangan tidak dikenal.", {
        undangan: "Pilih sudah atau belum.",
      });
    }
  }

  const daftar = await db
    .select()
    .from(guests)
    .where(and(...saringan))
    .orderBy(asc(guests.name))
    .limit(500);

  // Rekap selalu dihitung dari seluruh tamu, bukan dari hasil saringan. Kalau
  // dihitung dari hasil saringan, angkanya berubah saat orang mengetik dan itu
  // menyesatkan. Perhitungannya memakai fungsi yang sama dengan Beranda dan
  // Laporan, jadi mustahil ada dua angka berbeda untuk data yang sama.
  const semuaTamu = await db
    .select({
      category: guests.category,
      side: guests.side,
      rsvpStatus: guests.rsvpStatus,
      guestCount: guests.guestCount,
      tableName: guests.tableName,
      invitedAt: guests.invitedAt,
    })
    .from(guests)
    .where(eq(guests.planId, planId));

  const rekap = ringkasTamu(semuaTamu);

  return NextResponse.json({
    // Nilai sisi lama yang tidak dikenal dibaca sebagai "lainnya" supaya layar
    // tidak menampilkan teks bebas dari data lama.
    guests: daftar.map((g) => ({
      ...g,
      side: sisiDikenal(g.side) ?? (g.side ? "lainnya" : null),
    })),
    summary: rekap,
  });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaTamu.parse(await bacaJson(req));

  return sekaliPerKunci(planId, req.headers.get(HEADER_KUNCI), async () => {
    const [baris] = await db
      .insert(guests)
      .values({
        planId,
        name: isi.name,
        // Nomor sudah dinormalkan ke 628xx oleh skema (satu aturan untuk tamu
        // dan vendor), jadi tidak ada normalisasi kedua di sini.
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
});
