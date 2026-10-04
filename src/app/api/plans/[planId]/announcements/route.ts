import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { bacaJson, bungkus, tidakDitemukan } from "@/lib/galat";
import { konteksPlan } from "@/lib/api";
import { skemaPengumuman, skemaTerbitPengumuman } from "@/lib/skema";
import { buatToken } from "@/lib/tautan";

type Params = { params: Promise<{ planId: string }> };

/**
 * Pengumuman untuk keluarga dan crew.
 *
 * Yang disematkan selalu di atas, termasuk yang belum terbit. Alasannya
 * pengumuman yang disematkan biasanya yang paling penting, dan menyembunyikan
 * yang paling penting di bawah pengumuman lama bikin orang membaca yang salah.
 */
export const GET = bungkus(async (_req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const daftar = await db
    .select()
    .from(announcements)
    .where(eq(announcements.planId, planId))
    .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt), desc(announcements.createdAt));

  return NextResponse.json({
    announcements: daftar,
    // Dipakai layar untuk menonjolkan berapa yang sudah benar-benar terkirim.
    summary: {
      total: daftar.length,
      terbit: daftar.filter((a) => a.publishedAt !== null).length,
      disematkan: daftar.filter((a) => a.isPinned).length,
    },
  });
});

export const POST = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  const isi = skemaPengumuman.parse(await bacaJson(req));

  const [baris] = await db
    .insert(announcements)
    .values({
      planId,
      title: isi.title,
      body: isi.body,
      audience: isi.audience,
      isPinned: isi.isPinned,
      publishedAt: isi.publishedAt ?? null,
      shareToken: buatToken(),
    })
    .returning();

  return NextResponse.json({ announcement: baris }, { status: 201 });
});

/**
 * Terbitkan banyak pengumuman sekaligus, untuk satu audien atau semuanya.
 *
 * Ini yang dipakai menjelang hari-H, saat crew butuh semua pengumuman di
 * satu layar. Kalau tidak ada, orang harus membuka satu per satu di lokasi
 * acara, dan itu justru saat sinyal paling sering hilang.
 *
 * Hasilnya jumlah baris yang berubah, dihitung dari returning(). Menghitung
 * ulang dengan query kedua bisa berbeda kalau ada yang mengubah bersamaan,
 * dan angka yang tidak cocok bikin orang ragu.
 */
export const PATCH = bungkus(async (req: Request, { params }: Params) => {
  const { planId } = await params;
  await konteksPlan(planId);

  // Body diperiksa skema, bukan di-cast. `audience` yang bukan salah satu
  // nilai sah dulu diteruskan apa adanya ke query dan bisa jadi galat
  // database 500, padahal kontraknya 422.
  const isi = skemaTerbitPengumuman.parse(await bacaJson(req));

  const saringan = [eq(announcements.planId, planId)];
  if (isi.audience) saringan.push(eq(announcements.audience, isi.audience));

  const berubah = await db
    .update(announcements)
    .set({ publishedAt: new Date() })
    .where(and(...saringan))
    .returning({ id: announcements.id });

  if (berubah.length === 0) throw tidakDitemukan("Pengumuman");

  return NextResponse.json({ published: berubah.length });
});
