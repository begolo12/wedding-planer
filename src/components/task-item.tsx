"use client";

import { useState } from "react";
import { minta, pesanGalat } from "@/lib/api-client";
import { toast } from "./toast";
import { LABEL_PRIORITAS, LABEL_PENUGASAN, type Prioritas, type Penugasan } from "@/lib/konstanta";
import { tanggalPendekDari } from "@/lib/format";

/**
 * Satu baris tugas dengan tombol centang.
 *
 * Centang mengirim POST ke /toggle, bukan PATCH. Dengan PATCH, layar harus
 * tahu status sekarang dulu supaya bisa mengirim nilai yang benar, dan itu
 * berarti satu permintaan tambahan untuk aksi yang paling sering dipakai.
 * Server yang membalik statusnya, jadi satu tekanan tombol cukup.
 *
 * Perubahan ditampilkan lebih dulu, lalu dikembalikan kalau server menolak.
 * Menunggu server sebelum memberi tanda centang membuat aplikasi terasa
 * berat dipakai, padahal aksinya sendiri hanya membalik satu nilai.
 */

export type TugasBaris = {
  id: string;
  title: string;
  category: string;
  dueDate: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  notes?: string | null;
};

export function TaskItem({
  tugas,
  planId,
  onUbah,
  onBuka,
  tampilkanKategori = true,
}: {
  tugas: TugasBaris;
  planId: string;
  /** Dipanggil setelah server menjawab, untuk memperbarui daftar induk. */
  onUbah?: (tugas: TugasBaris) => void;
  onBuka?: (tugas: TugasBaris) => void;
  tampilkanKategori?: boolean;
}) {
  const [selesai, setSelesai] = useState(tugas.status === "selesai");
  const [sedangJalan, setSedangJalan] = useState(false);

  async function balik() {
    if (sedangJalan) return;
    const nilaiBaru = !selesai;

    // Tampilkan dulu, batalkan kalau server menolak.
    setSelesai(nilaiBaru);
    setSedangJalan(true);

    try {
      const hasil = await minta<{ task: TugasBaris }>(
        `/api/plans/${planId}/tasks/${tugas.id}/toggle`,
        { method: "POST" },
      );
      const terbaru = { ...tugas, ...hasil.task };
      setSelesai(terbaru.status === "selesai");
      onUbah?.(terbaru);
    } catch (err) {
      setSelesai(!nilaiBaru);
      toast(pesanGalat(err));
    } finally {
      setSedangJalan(false);
    }
  }

  const lewat =
    !selesai && tugas.dueDate ? new Date(`${tugas.dueDate}T00:00:00`) < new Date() : false;

  return (
    <div className="tugas" data-selesai={selesai ? "ya" : undefined}>
      <button
        type="button"
        className="tugas-centang"
        role="checkbox"
        aria-checked={selesai}
        aria-label={selesai ? `Buka lagi ${tugas.title}` : `Tandai selesai ${tugas.title}`}
        disabled={sedangJalan}
        onClick={balik}
      >
        <span aria-hidden="true">{selesai ? "\u2713" : ""}</span>
      </button>

      <div className="baris-isi">
        {onBuka ? (
          <button
            type="button"
            className="baris-judul tombol-polos"
            onClick={() => onBuka(tugas)}
          >
            {tugas.title}
          </button>
        ) : (
          <span className="tugas-judul">{tugas.title}</span>
        )}

        <div className="baris-meta">
          {tugas.dueDate ? (
            <span className={lewat ? "pesan-galat" : undefined}>
              {lewat ? "\u25B2 " : ""}
              {tanggalPendekDari(tugas.dueDate)}
            </span>
          ) : (
            <span>Belum ada tenggat</span>
          )}
          {tampilkanKategori ? <span>{tugas.category}</span> : null}
          {tugas.assignee ? (
            <span>{LABEL_PENUGASAN[tugas.assignee as Penugasan] ?? tugas.assignee}</span>
          ) : null}
          {tugas.priority === "tinggi" ? (
            <span className="lencana lencana-aksen">
              {LABEL_PRIORITAS[tugas.priority as Prioritas] ?? tugas.priority}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
