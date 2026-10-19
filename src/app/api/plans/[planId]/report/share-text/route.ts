import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks } from "@/db/schema";
import { bacaJson, bungkus, tidakValid } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { susunLaporan } from "@/lib/laporan";
import { susunTeksBagikan, tautanWa } from "@/lib/teks-wa";
import { BATAS_TEKS_WA } from "@/lib/konstanta";
import { skemaBagikanTeks } from "@/lib/skema";

type Params = { params: Promise<{ planId: string }> };

/** Alamat publik satu tautan bagikan, dari tokennya. */
function urlDariToken(token: string): string {
  const dasar = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return `${dasar.replace(/\/$/, "")}/bagikan/${token}`;
}

/**
 * Susun teks WhatsApp.
 *
 * Body diperiksa `skemaBagikanTeks` di src/lib/skema.ts, bukan type `Body`
 * buatan route ini. Sebelumnya route menerima `variant` dan `jenis` sekaligus,
 * lalu meng-cast nilainya ke `JenisBagikan` tanpa pemeriksaan. Sekarang satu
 * nama per field, dan `variant` harus salah satu dari tiga nilai yang sah.
 *
 * Panjang dipotong di fungsi penyusun, dan keadaan terpotong dikembalikan apa
 * adanya. Client yang memutuskan mau menampilkan peringatan atau tidak, tapi
 * client tidak pernah boleh menampilkan angka yang berbeda dari yang dikirim.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaBagikanTeks.parse(await bacaJson(req));

  let tautan: string | null = null;
  if (isi.linkId) {
    const [baris] = await db
      .select({ token: shareLinks.token })
      .from(shareLinks)
      .where(and(eq(shareLinks.planId, planId), eq(shareLinks.id, isi.linkId)))
      .limit(1);
    if (baris) tautan = urlDariToken(baris.token);
  } else if (isi.variant === "tautan") {
    // Tanpa linkId, pakai tautan terbaru milik plan ini. Tanpa ini, teks yang
    // dikirim ke keluarga berbunyi "Tautan belum dibuat." padahal pengguna
    // mengira sedang mengirim tautan.
    const [baris] = await db
      .select({ token: shareLinks.token })
      .from(shareLinks)
      .where(eq(shareLinks.planId, planId))
      .orderBy(desc(shareLinks.createdAt))
      .limit(1);
    if (baris) tautan = urlDariToken(baris.token);
  }

  // Varian tautan tanpa tautan sama sekali bukan teks yang boleh dikirim.
  // Yang dibutuhkan pengguna adalah tindakan yang jelas, bukan kalimat
  // "Tautan belum dibuat." yang ikut terkirim ke WhatsApp keluarga.
  if (isi.variant === "tautan" && !tautan) {
    throw tidakValid(
      "Belum ada tautan laporan. Buat dulu di halaman Laporan, lalu bagikan lagi.",
    );
  }

  const laporan = await susunLaporan(planId);
  const hasil = susunTeksBagikan(laporan, isi.variant, isi.message, tautan);

  return NextResponse.json({
    text: hasil.text,
    length: hasil.length,
    limit: BATAS_TEKS_WA,
    truncated: hasil.truncated,
    lines: hasil.lines,
    variant: hasil.variant,
    // Tautan wa.me disusun di server juga, supaya karakter yang perlu diubah
    // (enter, tanda kutip, ampersand, huruf non-ASCII) diubah satu kali saja
    // lewat fungsi yang diuji langsung di tests/unit/teks-wa.test.ts.
    waUrl: tautanWa(hasil.text),
  });
});
