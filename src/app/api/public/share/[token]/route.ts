import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks, announcements, plans } from "@/db/schema";
import { susunLaporan } from "@/lib/laporan";
import { GalatAplikasi, bungkus } from "@/lib/galat";

type Params = { params: Promise<{ token: string }> };

/**
 * Isi tautan baca-saja. Tidak butuh login, karena yang dikirim tautannya
 * memang bukan pengguna aplikasi.
 *
 * Semua galat di sini memakai bentuk standar docs/04-API-Contract.md, sama
 * seperti endpoint lain. Bentuk `{ galat }` yang dulu dipakai di sini adalah
 * satu-satunya jawaban yang tidak bisa dibaca client lewat `error.code`.
 */
export const GET = bungkus(async (_request: Request, { params }: Params) => {
  const { token } = await params;

  if (!token) {
    throw new GalatAplikasi("NOT_FOUND", "Tautan tidak ditemukan.");
  }

  // 1. Cek di tabel share_links
  const [link] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.token, token))
    .limit(1);

  if (link) {
    const [plan] = await db
      .select({
        id: plans.id,
        partnerName: plans.partnerName,
        weddingDate: plans.weddingDate,
        isDayOfDate: plans.isDayOfDate,
      })
      .from(plans)
      .where(eq(plans.id, link.planId))
      .limit(1);

    if (!plan) {
      throw new GalatAplikasi(
        "NOT_FOUND",
        "Rencana pernikahan tidak ditemukan atau telah dihapus.",
      );
    }

    const report = await susunLaporan(link.planId);

    return NextResponse.json({
      tipe: "laporan",
      label: link.label,
      target: link.target,
      dibuatPada: link.createdAt,
      plan,
      report,
    });
  }

  // 2. Cek di tabel announcements (pengumuman)
  const [pengumuman] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.shareToken, token))
    .limit(1);

  if (pengumuman) {
    const [plan] = await db
      .select({
        id: plans.id,
        partnerName: plans.partnerName,
        weddingDate: plans.weddingDate,
        isDayOfDate: plans.isDayOfDate,
      })
      .from(plans)
      .where(eq(plans.id, pengumuman.planId))
      .limit(1);

    return NextResponse.json({
      tipe: "pengumuman",
      plan,
      announcement: pengumuman,
    });
  }

  throw new GalatAplikasi(
    "NOT_FOUND",
    "Tautan tidak ditemukan atau sudah dicabut oleh pemilik rencana.",
  );
});
