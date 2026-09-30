import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { bacaJson, bungkus, tidakValid } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaImporTamu } from "@/lib/skema";
import { bacaDaftarTamu } from "@/lib/impor-tamu";

type Params = { params: Promise<{ planId: string }> };

const skemaLanjutan = skemaImporTamu.extend({
  /** Kalau true, hanya membaca dan tidak menyimpan apa pun. */
  previewOnly: z.coerce.boolean().default(false),
  /** Baris yang dicentang di pratinjau. Kosong berarti semua yang aman. */
  pilih: z.array(z.string()).optional(),
});

/**
 * Impor daftar tamu dari teks yang ditempel.
 *
 * Ada dua langkah yang disengaja: baca dulu, simpan kemudian. Kalau langsung
 * disimpan, baris yang salah ikut masuk dan baru ketahuan setelah tamu
 * membalas, saat namanya sudah tercetak di undangan.
 *
 * Yang tidak dikembalikan cuma pratinjau: `preview` berisi semua baris yang
 * terbaca, masing masing dengan catatan kenapa perlu dilihat lagi. Baris
 * kembar tidak dibuat ulang walau dicentang, karena dua baris dengan nama
 * sama membuat hitungan kursi salah.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaLanjutan.parse(await bacaJson(req));

  const sudahAda = await db
    .select({ name: guests.name })
    .from(guests)
    .where(eq(guests.planId, planId))
    .orderBy(asc(guests.name));

  const preview = bacaDaftarTamu(isi.teks, sudahAda.map((g) => g.name));

  if (isi.previewOnly) {
    return NextResponse.json({ preview, created: 0 });
  }

  const dipilih = isi.pilih ? new Set(isi.pilih) : null;
  const akanDibuat = preview.filter(
    (b) => !b.kembar && (!dipilih || dipilih.has(b.name)),
  );

  if (akanDibuat.length === 0) {
    throw tidakValid("Tidak ada baris baru yang bisa disimpan.", {
      teks: "Semua baris sudah ada di daftar, atau belum ada yang dipilih.",
    });
  }

  const dibuat = await db
    .insert(guests)
    .values(
      akanDibuat.map((b) => ({
        planId,
        name: b.name,
        category: isi.category,
        rsvpStatus: "belum",
        guestCount: b.guestCount,
      })),
    )
    .returning();

  return NextResponse.json({ preview, created: dibuat.length }, { status: 201 });
});
