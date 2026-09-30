import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks, announcements, plans } from "@/db/schema";
import { susunLaporan } from "@/lib/laporan";

export async function GET(
  _request: Request,
  props: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await props.params;

    if (!token) {
      return NextResponse.json(
        { galat: "Token tautan diperlukan" },
        { status: 400 },
      );
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
        return NextResponse.json(
          { galat: "Rencana pernikahan tidak ditemukan atau telah dihapus" },
          { status: 404 },
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

    return NextResponse.json(
      { galat: "Tautan tidak ditemukan atau sudah dicabut oleh pemilik rencana" },
      { status: 404 },
    );
  } catch (err) {
    console.error("Gagal membaca tautan publik:", err);
    return NextResponse.json(
      { galat: "Gagal memuat data tautan publik" },
      { status: 500 },
    );
  }
}
