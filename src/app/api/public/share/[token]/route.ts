import { NextResponse } from "next/server";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/db";
import { shareLinks, announcements, plans } from "@/db/schema";
import { susunLaporan, type Laporan } from "@/lib/laporan";
import { GalatAplikasi, bungkus } from "@/lib/galat";

type Params = { params: Promise<{ token: string }> };

/**
 * Satu kalimat untuk semua kegagalan di sini.
 *
 * Pesan yang berbeda beda antara "token tidak ada" dan "plan sudah dihapus"
 * memberi tahu penebak bahwa tokennya benar walaupun isinya sudah tidak ada.
 * Satu kalimat membuat keduanya tidak bisa dibedakan dari luar.
 */
const PESAN_GAGAL = "Tautan tidak ditemukan atau sudah dicabut oleh pemilik rencana.";

/** Kolom plan yang boleh terlihat publik. Tidak ada data sensitif di sini. */
const KOLOM_PLAN = {
  id: plans.id,
  partnerName: plans.partnerName,
  weddingDate: plans.weddingDate,
  isDayOfDate: plans.isDayOfDate,
};

/**
 * Plan yang ditunjuk tautan, atau lempar kalau plan sudah dihapus lembut.
 *
 * Tanpa filter deletedAt, orang yang sudah menghapus rencananya tetap bisa
 * dibaca lengkap oleh siapa pun yang memegang tautan lama. Jalur terautentikasi
 * sudah memfilter ini di src/lib/sesi.ts; jalur publik harus sama.
 */
async function planUntukTautan(planId: string, kolom = KOLOM_PLAN) {
  const [plan] = await db
    .select(kolom)
    .from(plans)
    .where(and(eq(plans.id, planId), isNull(plans.deletedAt)))
    .limit(1);

  if (!plan) throw new GalatAplikasi("NOT_FOUND", PESAN_GAGAL);
  return plan;
}

/**
 * Saring laporan menurut target tautan, sesuai docs/16 bagian 4.
 *
 * Sebelum ini, target disimpan tapi tidak pernah dipakai: tautan "keluarga"
 * ikut membawa angka anggaran dan daftar vendor. Tautan yang dikirim ke grup
 * keluarga jadi membocorkan catatan uang pasangan.
 *
 * Undangan keluarga hanya berisi jadwal, rundown, dan kode busana. Sisanya
 * dibuang dari payload, bukan disembunyikan di layar, supaya tidak ada cara
 * membacanya lewat jaringan.
 */
function saringLaporan(report: Laporan, target: string): Partial<Laporan> {
  if (target === "laporan") return report;

  return {
    dibuatPada: report.dibuatPada,
    judul: report.judul,
    hitungMundur: report.hitungMundur,
    rundown: report.rundown,
    busana: report.busana,
    jadwal: report.jadwal,
  };
}

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

  if (!token) throw new GalatAplikasi("NOT_FOUND", PESAN_GAGAL);

  // 1. Cek di tabel share_links
  const [link] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.token, token))
    .limit(1);

  if (link) {
    const plan = await planUntukTautan(link.planId);
    const report = await susunLaporan(link.planId);

    return NextResponse.json({
      tipe: "laporan",
      label: link.label,
      target: link.target,
      dibuatPada: link.createdAt,
      plan,
      report: saringLaporan(report, link.target),
    });
  }

  // 2. Cek di tabel announcements (pengumuman).
  //
  // Kolomnya dipilih satu per satu, bukan `select()` utuh: baris penuh memuat
  // shareToken, planId, dan id internal, dan tidak satu pun dari itu perlu
  // diketahui pembaca tautan.
  const [pengumuman] = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      audience: announcements.audience,
      isPinned: announcements.isPinned,
      publishedAt: announcements.publishedAt,
      planId: announcements.planId,
    })
    .from(announcements)
    .where(
      and(
        eq(announcements.shareToken, token),
        // Draf belum boleh dibaca siapa pun. shareToken dibuat sejak
        // pengumuman dibuat, jadi tanpa syarat ini briefing yang belum selesai
        // sudah bisa dibuka lewat tautannya.
        isNotNull(announcements.publishedAt),
      ),
    )
    .limit(1);

  if (pengumuman) {
    const plan = await planUntukTautan(pengumuman.planId);

    return NextResponse.json({
      tipe: "pengumuman",
      plan,
      announcement: {
        id: pengumuman.id,
        title: pengumuman.title,
        body: pengumuman.body,
        audience: pengumuman.audience,
        isPinned: pengumuman.isPinned,
        publishedAt: pengumuman.publishedAt,
      },
    });
  }

  throw new GalatAplikasi("NOT_FOUND", PESAN_GAGAL);
});
