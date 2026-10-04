import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { bacaJson, bungkus, idUuid, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { buatToken, urlTautan } from "@/lib/tautan";

type Params = { params: Promise<{ planId: string; id: string }> };

/**
 * Ambil tautan baca-saja untuk satu pengumuman.
 *
 * Butuh login karena ini mengubah data, tapi tautan yang keluar tidak butuh
 * login. Bedanya penting: yang membuat tautan adalah pasangan, yang membuka
 * tautan bisa siapa saja yang dikirimi.
 *
 * Kunci lama dipakai ulang kalau sudah ada, bukan dibuat baru. Kalau setiap
 * kali tombol ditekan kuncinya berganti, tautan yang sudah dikirim ke grup
 * keluarga pagi tadi mati begitu pasangan menekan tombol lagi.
 *
 * `rotate: true` disediakan untuk keadaan sebaliknya: tautan bocor dan perlu
 * dimatikan. Dengan begitu mencabut akses tetap mungkin tanpa menghapus
 * pengumumannya.
 */
export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId, id } = await params;
  await konteksPlan(planId);
  idUuid(id, "Pengumuman");

  const [baris] = await db
    .select()
    .from(announcements)
    .where(and(eq(announcements.planId, planId), eq(announcements.id, id)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Pengumuman");

  const isi = (await bacaJson(req).catch(() => ({}))) as { rotate?: boolean };

  let token = baris.shareToken;
  if (isi?.rotate) {
    token = buatToken();
    await db
      .update(announcements)
      .set({ shareToken: token })
      // Filter planId tetap ikut walau id sudah unik, supaya tidak ada satu
      // pun query tulis di aplikasi ini yang bisa jalan tanpa planId.
      .where(and(eq(announcements.planId, planId), eq(announcements.id, id)));
  }

  return NextResponse.json({
    url: urlTautan(token),
    rotated: Boolean(isi?.rotate),
    published: baris.publishedAt !== null,
  });
});
