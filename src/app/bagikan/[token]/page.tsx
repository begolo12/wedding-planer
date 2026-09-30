"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Gagal } from "@/components/states";
import { BudgetBar } from "@/components/budget-bar";
import { Rupiah } from "@/components/rupiah";
import type { Laporan } from "@/lib/laporan";

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
  report?: Laporan;
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
      <main style={{ maxWidth: 840, margin: "0 auto", padding: "24px 16px" }}>
        <Kerangka baris={8} />
      </main>
    );
  }

  if (galat || !data) {
    return (
      <main style={{ maxWidth: 840, margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--text-h2)", color: "var(--color-bata)" }}>
          Tautan Tidak Tersedia
        </h1>
        <p style={{ color: "var(--color-muted)", margin: "16px 0 24px" }}>
          Tautan baca-saja ini mungkin sudah dicabut oleh pemilik rencana atau tidak lagi berlaku.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button type="button" className="tombol tombol-sekunder" onClick={muatUlang}>
            Coba muat ulang
          </button>
          <Link className="tombol tombol-utama" href="/masuk">
            Buka aplikasi
          </Link>
        </div>
      </main>
    );
  }

  // Tampilan Pengumuman Tunggal
  if (data.tipe === "pengumuman" && data.announcement) {
    const p = data.announcement;
    return (
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>
        <div
          style={{
            padding: "8px 12px",
            background: "var(--color-netral)",
            borderRadius: 6,
            fontSize: "var(--text-kecil)",
            color: "var(--color-muted)",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Pengumuman Resmi Pernikahan {data.plan.partnerName ? `bersama ${data.plan.partnerName}` : ""}</span>
          <button
            type="button"
            className="tombol tombol-sekunder"
            style={{ minHeight: 44, padding: "0 8px", fontSize: "var(--text-kecil)" }}
            onClick={() => window.print()}
          >
            Cetak
          </button>
        </div>

        <article className="kartu" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>{p.title}</h1>
          <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
            Ditujukan untuk: <strong>{p.audience}</strong>
            {p.publishedAt ? ` • ${new Date(p.publishedAt).toLocaleDateString("id-ID")}` : ""}
          </div>
          <div
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              color: "var(--color-ink)",
            }}
          >
            {p.body}
          </div>
        </article>
      </main>
    );
  }

  // Tampilan Laporan Lengkap
  const rep = data.report;
  if (!rep) return null;

  const penggaliFont =
    ukuranFont === "besar" ? "1.125rem" : ukuranFont === "sangat-besar" ? "1.25rem" : "1rem";

  return (
    <main
      style={{
        maxWidth: 840,
        margin: "0 auto",
        padding: "24px 16px 60px",
        fontSize: penggaliFont,
      }}
    >
      {/* Pita Baca-Saja Atas */}
      <div
        style={{
          padding: "8px 14px",
          background: "var(--color-netral)",
          border: "1px solid var(--color-garis)",
          borderRadius: 6,
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ fontSize: "var(--text-kecil)" }}>
          <span style={{ fontWeight: 600 }}>Tautan Baca-Saja</span>
          {data.label ? ` • Khusus: ${data.label}` : ""}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2, marginRight: 8 }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              style={{
                padding: "0 8px",
                fontSize: "11px",
                fontWeight: ukuranFont === "normal" ? 700 : 400,
                background: ukuranFont === "normal" ? "var(--color-kertas)" : "transparent",
              }}
              onClick={() => ubahUkuranFont("normal")}
            >
              A
            </button>
            <button
              type="button"
              className="tombol tombol-sekunder"
              style={{
                padding: "0 8px",
                fontSize: "13px",
                fontWeight: ukuranFont === "besar" ? 700 : 400,
                background: ukuranFont === "besar" ? "var(--color-kertas)" : "transparent",
              }}
              onClick={() => ubahUkuranFont("besar")}
            >
              A+
            </button>
            <button
              type="button"
              className="tombol tombol-sekunder"
              style={{
                padding: "0 8px",
                fontSize: "15px",
                fontWeight: ukuranFont === "sangat-besar" ? 700 : 400,
                background: ukuranFont === "sangat-besar" ? "var(--color-kertas)" : "transparent",
              }}
              onClick={() => ubahUkuranFont("sangat-besar")}
            >
              A++
            </button>
          </div>

          <button
            type="button"
            className="tombol tombol-sekunder"
            style={{ minHeight: 44, padding: "0 10px", fontSize: "var(--text-kecil)" }}
            onClick={() => window.print()}
          >
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* Header Utama */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>
          {rep.judul.namaPasangan ? `Pernikahan ${rep.judul.namaPasangan}` : "Rencana Pernikahan"}
        </h1>
        <p style={{ margin: "4px 0 0", color: "var(--color-muted)", fontSize: "var(--text-kecil)" }}>
          {rep.judul.tanggalTeks} • {rep.hitungMundur.teks}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Ringkasan Anggaran */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Ringkasan Anggaran</h2>

          <div className="rekap">
            <div className="rekap-item">
              <span className="rekap-nilai"><Rupiah nilai={rep.uang.planned} /></span>
              <span className="rekap-label">Rencana Batas</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
                <Rupiah nilai={rep.uang.paid} />
              </span>
              <span className="rekap-label">Sudah Dibayar ({rep.uang.persenTerpakai}%)</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai"><Rupiah nilai={Math.abs(rep.uang.remaining)} /></span>
              <span className="rekap-label">
                {rep.uang.remaining < 0 ? "Lebih dari anggaran" : "Sisa anggaran"}
              </span>
            </div>
          </div>

          <BudgetBar
            terpakai={rep.uang.paid}
            batas={rep.uang.planned}
            label="Penggunaan Anggaran"
          />
        </section>

        {/* Tugas & Tamu */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Kesiapan Tugas</h2>
            <div className="rekap" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rekap-item">
                <span className="rekap-nilai">{rep.tugas.selesai} / {rep.tugas.total}</span>
                <span className="rekap-label">Selesai</span>
              </div>
              <div className="rekap-item">
                <span className="rekap-nilai">{rep.tugas.total - rep.tugas.selesai}</span>
                <span className="rekap-label">Tugas tersisa</span>
              </div>
            </div>
          </section>

          <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Tamu Undangan</h2>
            <div className="rekap" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rekap-item">
                <span className="rekap-nilai">{rep.tamu.orang}</span>
                <span className="rekap-label">Perkiraan Hadir</span>
              </div>
              <div className="rekap-item">
                <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
                  {rep.tamu.kursi}
                </span>
                <span className="rekap-label">Pasti Hadir (Kursi)</span>
              </div>
            </div>
          </section>
        </div>

        {/* Rundown Jadwal Acara */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Susunan Acara Hari-H (Rundown)</h2>

          {rep.rundown.item.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rep.rundown.item.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 14,
                    padding: "8px 10px",
                    borderRadius: 4,
                    background: "var(--color-netral)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      minWidth: 54,
                    }}
                  >
                    {r.startTime}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{r.title}</div>
                    {r.location ? (
                      <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                        Lokasi: {r.location} • Durasi: {r.durationMinutes} menit
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
              Belum ada susunan acara rundown yang dimasukkan.
            </div>
          )}
        </section>

        {/* Vendor yang Belum Lunas */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Status Vendor & Tagihan</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--text-kecil)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
              <span>Total Tagihan Vendor:</span>
              <strong><Rupiah nilai={rep.vendor.totalTagihan} /></strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
              <span>Sudah Dibayarkan:</span>
              <strong style={{ color: "var(--color-primary)" }}><Rupiah nilai={rep.vendor.totalDibayar} /></strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Vendor Belum Lunas:</span>
              <strong style={{ color: rep.vendor.belumLunas > 0 ? "var(--color-bata)" : "inherit" }}>
                {rep.vendor.belumLunas} vendor
              </strong>
            </div>
          </div>
        </section>

        {/* Catatan Kaki */}
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "var(--color-muted)",
            marginTop: 16,
          }}
        >
          Halaman ini bersifat baca-saja dan tidak dapat melakukan perubahan data.
        </div>
      </div>
    </main>
  );
}
