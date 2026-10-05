"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useMuat } from "@/lib/use-muat";
import { Kerangka } from "@/components/states";
import { BudgetBar } from "@/components/budget-bar";
import { Rupiah } from "@/components/rupiah";
import type { Laporan } from "@/lib/laporan";
import { LABEL_AUDIEN, type Audien } from "@/lib/konstanta";
import { tanggalPanjangDari, jamDari } from "@/lib/format";

/**
 * Bentuk balasan `/api/public/share/[token]`.
 *
 * `report` sengaja sebagian: server hanya mengirim bagian yang sesuai target
 * tautan (docs/16 bagian 4). Tautan keluarga tidak membawa uang, tugas, tamu,
 * dan vendor, jadi kunci itu tidak bisa diandalkan ada.
 */
export type ReportBagikan = Pick<
  Laporan,
  "dibuatPada" | "judul" | "hitungMundur" | "rundown" | "busana" | "jadwal"
> &
  Partial<Pick<Laporan, "uang" | "tugas" | "tamu" | "vendor">>;

type ResponBagikan = {
  tipe: "laporan" | "pengumuman";
  label?: string;
  target?: string;
  plan: {
    id: string;
    partnerName: string | null;
    weddingDate: string | null;
    isDayOfDate?: string | null;
  };
  report?: ReportBagikan;
  announcement?: {
    id: string;
    title: string;
    body: string;
    audience: string;
    publishedAt: string | null;
  };
};

/**
 * Layar Baca-Saja Publik untuk Keluarga dan Panitia.
 * Terbuka tanpa sesi login dan tanpa satu pun tombol pengubah data.
 */
export default function HalamanBagikanPublik({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [ukuranFont, setUkuranFont] = useState<"normal" | "besar" | "sangat-besar">("normal");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tersimpan = localStorage.getItem("pernikahan_font_bagikan") as
        | "normal"
        | "besar"
        | "sangat-besar"
        | null;
      if (tersimpan) setUkuranFont(tersimpan);
    }
  }, []);

  function ubahUkuranFont(ukuran: "normal" | "besar" | "sangat-besar") {
    setUkuranFont(ukuran);
    if (typeof window !== "undefined") {
      localStorage.setItem("pernikahan_font_bagikan", ukuran);
    }
  }

  const { data, memuat, galat, muatUlang } = useMuat<ResponBagikan>(
    token ? `/api/public/share/${token}` : null,
  );

  if (memuat) {
    return (
      <main className="bagikan">
        <Kerangka baris={8} />
      </main>
    );
  }

  if (galat || !data) {
    return (
      <main className="bagikan">
        <div className="bagikan-galat">
          <h1>Tautan Tidak Tersedia</h1>
          <p>
            Tautan baca-saja ini mungkin sudah dicabut oleh pemilik rencana atau tidak lagi
            berlaku.
          </p>
          <div className="aksi-baris">
            <button type="button" className="tombol tombol-sekunder" onClick={muatUlang}>
              Coba muat ulang
            </button>
            <Link className="tombol tombol-utama" href="/masuk">
              Buka aplikasi
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Tampilan Pengumuman Tunggal
  if (data.tipe === "pengumuman" && data.announcement) {
    const p = data.announcement;
    return (
      <main className="bagikan">
        <div className="bagikan-pita">
          <div className="bagikan-pita-isi">
            <span className="bagikan-pita-judul">Pengumuman Resmi</span>
            <span>
              {data.plan.partnerName ? `Pernikahan bersama ${data.plan.partnerName}` : "Rencana pernikahan"}
            </span>
          </div>
          <div className="bagikan-pita-alat">
            <button
              type="button"
              className="tombol tombol-sekunder tombol-kecil"
              onClick={() => window.print()}
            >
              Cetak
            </button>
          </div>
        </div>

        <article className="kartu tumpuk-sedang">
          <h1>{p.title}</h1>
          <p className="keterangan">
            Ditujukan untuk <strong>{LABEL_AUDIEN[p.audience as Audien] ?? p.audience}</strong>
            {p.publishedAt ? ` • ${new Date(p.publishedAt).toLocaleDateString("id-ID")}` : ""}
          </p>
          <p className="bagikan-teks">{p.body}</p>
        </article>
      </main>
    );
  }

  // Tampilan Laporan.
  //
  // Isinya mengikuti `target` tautan. Tautan keluarga hanya berisi jadwal dan
  // rundown, sesuai docs/16 bagian 4, jadi bagian uang, tugas, tamu, dan vendor
  // tidak dirender. Server sudah tidak mengirim datanya; penjagaan di sini
  // supaya layar tidak pecah kalau ada tautan lama yang masih membawanya.
  const rep = data.report;
  if (!rep) return null;

  const lengkap = data.target === "laporan";
  const uang = rep.uang;
  const tugas = rep.tugas;
  const tamu = rep.tamu;
  const vendor = rep.vendor;

  return (
    <main className="bagikan" data-skala={ukuranFont}>
      {/* Pita Baca-Saja Atas */}
      <div className="bagikan-pita">
        <div className="bagikan-pita-isi">
          <span className="bagikan-pita-judul">Tautan Baca-Saja</span>
          {data.label ? <span>Khusus: {data.label}</span> : null}
        </div>

        <div className="bagikan-pita-alat">
          <div className="bagikan-ukuran" role="group" aria-label="Ukuran huruf">
            <button
              type="button"
              className="bagikan-ukuran-tombol"
              data-aktif={ukuranFont === "normal" ? "ya" : "tidak"}
              aria-pressed={ukuranFont === "normal"}
              onClick={() => ubahUkuranFont("normal")}
            >
              A
            </button>
            <button
              type="button"
              className="bagikan-ukuran-tombol"
              data-aktif={ukuranFont === "besar" ? "ya" : "tidak"}
              aria-pressed={ukuranFont === "besar"}
              onClick={() => ubahUkuranFont("besar")}
            >
              A+
            </button>
            <button
              type="button"
              className="bagikan-ukuran-tombol"
              data-aktif={ukuranFont === "sangat-besar" ? "ya" : "tidak"}
              aria-pressed={ukuranFont === "sangat-besar"}
              onClick={() => ubahUkuranFont("sangat-besar")}
            >
              A++
            </button>
          </div>

          <button
            type="button"
            className="tombol tombol-sekunder tombol-kecil"
            onClick={() => window.print()}
          >
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* Header Utama */}
      <div className="bagikan-kepala">
        <h1>
          {rep.judul.namaPasangan ? `Pernikahan ${rep.judul.namaPasangan}` : "Rencana Pernikahan"}
        </h1>
        <p>
          {rep.judul.tanggalTeks} • {rep.hitungMundur.teks}
        </p>
      </div>

      <div className="tumpuk">
        {/* Ringkasan Anggaran. Hanya di tautan Laporan. */}
        {lengkap && uang ? (
        <section className="kartu tumpuk-sedang">
          <h2>Ringkasan Anggaran</h2>

          <div className="rekap">
            <div className="rekap-item">
              <span className="rekap-nilai">
                <Rupiah nilai={uang.planned} />
              </span>
              <span className="rekap-label">Rencana Batas</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai teks-aksen">
                <Rupiah nilai={uang.paid} />
              </span>
              <span className="rekap-label">Sudah Dibayar ({uang.persenTerpakai}%)</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai">
                <Rupiah nilai={Math.abs(uang.remaining)} />
              </span>
              <span className="rekap-label">
                {uang.remaining < 0 ? "Lebih dari anggaran" : "Sisa anggaran"}
              </span>
            </div>
          </div>

          <BudgetBar
            terpakai={uang.paid}
            batas={uang.planned}
            label="Penggunaan Anggaran"
          />
        </section>
        ) : null}

        {/* Tugas & Tamu. Hanya di tautan Laporan. */}
        {lengkap && tugas && tamu ? (
        <div className="kisi-kartu">
          <section className="kartu tumpuk-rapat">
            <h2>Kesiapan Tugas</h2>
            <div className="rekap rekap-dua">
              <div className="rekap-item">
                <span className="rekap-nilai">
                  {tugas.selesai} / {tugas.total}
                </span>
                <span className="rekap-label">Selesai</span>
              </div>
              <div className="rekap-item">
                <span className="rekap-nilai">{tugas.total - tugas.selesai}</span>
                <span className="rekap-label">Tugas tersisa</span>
              </div>
            </div>
          </section>

          <section className="kartu tumpuk-rapat">
            <h2>Tamu Undangan</h2>
            <div className="rekap rekap-dua">
              <div className="rekap-item">
                <span className="rekap-nilai">{tamu.orang}</span>
                <span className="rekap-label">Perkiraan Hadir</span>
              </div>
              <div className="rekap-item">
                <span className="rekap-nilai teks-aksen">
                  {tamu.kursi}
                </span>
                <span className="rekap-label">Pasti Hadir (Kursi)</span>
              </div>
            </div>
          </section>
        </div>
        ) : null}

        {/* Jadwal Acara (tanggal penting) */}
        {rep.jadwal.length > 0 ? (
          <section className="kartu tumpuk-sedang">
            <h2>Jadwal Acara</h2>
            <div className="bagikan-acara">
              {rep.jadwal.map((j) => (
                <div key={j.id} className="bagikan-acara-baris">
                  <span className="bagikan-acara-jam">{tanggalPanjangDari(j.eventDate)}</span>
                  <div className="bagikan-acara-isi">
                    <div className="bagikan-acara-judul">{j.title}</div>
                    <div className="bagikan-acara-ket">{j.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Rundown Jadwal Acara */}
        <section className="kartu tumpuk-sedang">
          <h2>Susunan Acara Hari-H (Rundown)</h2>

          {rep.rundown.item.length > 0 ? (
            <div className="bagikan-acara">
              {rep.rundown.item.map((r) => (
                <div key={r.id} className="bagikan-acara-baris">
                  <span className="bagikan-acara-jam">{jamDari(r.startTime)}</span>
                  <div className="bagikan-acara-isi">
                    <div className="bagikan-acara-judul">{r.title}</div>
                    {r.location ? (
                      <div className="bagikan-acara-ket">
                        Lokasi: {r.location} • Durasi: {r.durationMinutes} menit
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="bagikan-kosong">Belum ada susunan acara rundown yang dimasukkan.</p>
          )}
        </section>

        {/* Vendor yang Belum Lunas. Hanya di tautan Laporan. */}
        {lengkap && vendor ? (
        <section className="kartu tumpuk-rapat">
          <h2>Status Vendor &amp; Tagihan</h2>
          <div className="bagikan-tabel">
            <div className="bagikan-tabel-baris">
              <span>Total Tagihan Vendor</span>
              <strong>
                <Rupiah nilai={vendor.totalTagihan} />
              </strong>
            </div>
            <div className="bagikan-tabel-baris">
              <span>Sudah Dibayarkan</span>
              <strong className="angka teks-aksen">
                <Rupiah nilai={vendor.totalDibayar} />
              </strong>
            </div>
            <div className="bagikan-tabel-baris">
              <span>Vendor Belum Lunas</span>
              <strong
                className="angka"
                data-nada={vendor.belumLunas > 0 ? "bahaya" : undefined}
              >
                {vendor.belumLunas} vendor
              </strong>
            </div>
          </div>
        </section>
        ) : null}

        <p className="bagikan-catatan">
          Halaman ini bersifat baca-saja dan tidak dapat melakukan perubahan data.
        </p>
      </div>
    </main>
  );
}
