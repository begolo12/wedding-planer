import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks } from "@/db/schema";
import { bacaJson, bungkus, tidakValid } from "@/lib/galat";
import { bersihkan, konteksPlan } from "@/lib/api";
import { susunLaporan } from "@/lib/laporan";
import { susunTeksBagikan, type JenisBagikan } from "@/lib/teks-wa";
import { BATAS_TEKS_WA } from "@/lib/konstanta";

type Params = { params: Promise<{ planId: string }> };

type Body = {
  variant?: string;
  jenis?: string;
  message?: string;
  pesanTambahan?: string;
  linkId?: string;
  tautanId?: string;
};

/**
 * Susun teks WhatsApp.
 *
 * Nama field menerima dua bahasa karena dokumen menulis `variant`, `message`,
 * `linkId`, sedangkan kode di repo ini memakai bahasa Indonesia. Menerima
 * keduanya lebih murah daripada memaksa satu pihak berubah, dan lebih baik
 * daripada diam-diam mengabaikan field yang dikirim.
 *
 * Panjang dipotong di fungsi penyusun, dan keadaan terpotong dikembalikan apa
 * adanya. Client yang memutuskan mau menampilkan peringatan atau tidak, tapi
 * client tidak pernah boleh menampilkan angka yang berbeda dari yang dikirim.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = (await bacaJson(req)) as Body;

  const jenis = bersihkan(isi.variant ?? isi.jenis) as JenisBagikan;
  if (!["ringkas", "lengkap", "tautan"].includes(jenis)) {
    throw tidakValid("Pilih dulu mau dikirim yang mana.", {
      variant: "Pilih ringkas, lengkap, atau tautan.",
    });
  }

  const pesan = bersihkan(isi.message ?? isi.pesanTambahan) || null;
  if (pesan && pesan.length > 400) {
    throw tidakValid("Pesan tambahan maksimal 400 huruf.", {
      message: `Sekarang ${pesan.length} huruf, lebih ${pesan.length - 400}.`,
    });
  }

  const tautanId = bersihkan(isi.linkId ?? isi.tautanId) || null;

  let tautan: string | null = null;
  if (tautanId) {
    const [baris] = await db
      .select({ token: shareLinks.token })
      .from(shareLinks)
      .where(and(eq(shareLinks.planId, planId), eq(shareLinks.id, tautanId)))
      .limit(1);
    if (baris) {
      const dasar = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
      tautan = `${dasar.replace(/\/$/, "")}/bagikan/${baris.token}`;
    }
  }

  const laporan = await susunLaporan(planId);
  const hasil = susunTeksBagikan(laporan, jenis, pesan, tautan);

  return NextResponse.json({
    text: hasil.text,
    length: hasil.length,
    limit: BATAS_TEKS_WA,
    truncated: hasil.truncated,
    lines: hasil.lines,
    variant: hasil.variant,
    // Tautan wa.me disusun di server juga, supaya karakter yang perlu diubah
    // (enter, tanda kutip, ampersand) diubah satu kali saja.
    waUrl: `https://wa.me/?text=${encodeURIComponent(hasil.text)}`,
  });
});
