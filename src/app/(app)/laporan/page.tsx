"use client";

import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { BudgetBar } from "@/components/budget-bar";
import { Rupiah } from "@/components/rupiah";
import { LABEL_KATEGORI_TAMU, type KategoriTamu } from "@/lib/konstanta";
import type { Laporan } from "@/lib/laporan";

/**
 * Layar Laporan Keadaan Pernikahan.
 * Menjawab pertanyaan "kondisi sekarang bagaimana" dalam sekali baca.
 * Semua angka dihitung langsung di server tanpa data stale.
 */
export default function HalamanLaporan() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const urlApi = planId ? `/api/plans/${planId}/report` : null;
  const {
    data,
    memuat: memuatLaporan,
    galat: galatLaporan,
    muatUlang: muatLaporan,
  } = useMuat<{ report: Laporan }>(urlApi, {
    aktif: Boolean(planId),
  });

  const rep = data?.report;

  if (memuatPlan || (planId && memuatLaporan && !rep)) {
    return <Kerangka baris={8} />;
  }

  if (galatPlan) {
    return <Gagal apa="Rencana pernikahan" onCoba={muatPlan} />;
  }

  if (!plan) {
    return (
      <Kosong
        keadaan="Belum ada rencana pernikahan."
        jalanKeluar="Mulai buat rencana pertama kamu sekarang."
      >
        <Link className="tombol tombol-utama" href="/rencana/plan">
          Buat rencana
        </Link>
      </Kosong>
    );
  }

  if (galatLaporan) {
    return <Gagal apa="Laporan keadaan" onCoba={muatLaporan} />;
  }

  if (!rep) return null;

  const adaPosLebih = rep.uang.pos.some((p) => p.remaining < 0);

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Laporan Keadaan</h1>
          <p>
            {rep.judul.namaPasangan ? `Pernikahan ${rep.judul.namaPasangan} • ` : ""}
            {rep.judul.tanggalTeks} ({rep.hitungMundur.teks})
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={() => window.print()}
          >
            Cetak PDF / Laporan
          </button>
          <Link className="tombol tombol-utama" href="/laporan/bagikan">
            Bagikan ke WhatsApp →
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Bagian 1: Ringkasan Uang */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Ringkasan Anggaran & Keuangan</h2>
            <Link
              href="/anggaran"
              style={{ fontSize: "var(--text-kecil)", color: "var(--color-primary)", textDecoration: "underline" }}
            >
              Buka rincian anggaran →
            </Link>
          </div>

          <div className="rekap">
            <div className="rekap-item">
              <span className="rekap-nilai">
                <Rupiah nilai={rep.uang.planned} />
              </span>
              <span className="rekap-label">Total rencana batas</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
                <Rupiah nilai={rep.uang.paid} />
              </span>
              <span className="rekap-label">Sudah dibayar ({rep.uang.persenTerpakai}%)</span>
            </div>
            <div className="rekap-item">
              <span
                className="rekap-nilai"
                style={{ color: rep.uang.remaining < 0 ? "var(--color-bata)" : "var(--color-tinta)" }}
              >
                <Rupiah nilai={Math.abs(rep.uang.remaining)} />
              </span>
              <span className="rekap-label">
                {rep.uang.remaining < 0 ? "Lebih dari anggaran" : "Sisa anggaran"}
              </span>
            </div>
          </div>

          <BudgetBar
            terpakai={rep.uang.paid}
            batas={rep.uang.planned}
            label="Penggunaan Anggaran Keseluruhan"
          />

          {adaPosLebih ? (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 4,
                background: "var(--color-kertas)",
                border: "1px solid var(--color-bata)",
                color: "var(--color-bata)",
                fontSize: "var(--text-kecil)",
                fontWeight: 600,
              }}
            >
              Peringatan: Ada pos pengeluaran yang melebihi batas yang direncanakan.
            </div>
          ) : null}

          {rep.uang.pos.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              <div style={{ fontSize: "var(--text-kecil)", fontWeight: 600, color: "var(--color-muted)" }}>
                Pos Pengeluaran Utama:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 8,
                }}
              >
                {rep.uang.pos.slice(0, 6).map((pos) => (
                  <div
                    key={pos.id}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 4,
                      background: "var(--color-netral)",
                      border: "1px solid var(--color-garis)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--text-dasar)" }}>{pos.name}</div>
                      <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                        {pos.labelKategori}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "var(--text-kecil)" }}>
                      <div><Rupiah nilai={pos.paid} /></div>
                      <div style={{ color: "var(--color-muted)" }}>dari <Rupiah nilai={pos.planned} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* Bagian 2: Dua Kolom (Tugas & Tamu) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {/* Kolom Tugas */}
          <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Kesiapan Tugas</h2>
              <Link
                href="/rencana"
                style={{ fontSize: "var(--text-kecil)", color: "var(--color-primary)", textDecoration: "underline" }}
              >
                Ke daftar tugas →
              </Link>
            </div>

            <div className="rekap" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rekap-item">
                <span className="rekap-nilai">{rep.tugas.selesai} / {rep.tugas.total}</span>
                <span className="rekap-label">Tugas selesai</span>
              </div>
              <div className="rekap-item">
                <span
                  className="rekap-nilai"
                  style={{ color: rep.tugas.lewat > 0 ? "var(--color-bata)" : "var(--color-tinta)" }}
                >
                  {rep.tugas.lewat}
                </span>
                <span className="rekap-label">Lewat tanggal</span>
              </div>
            </div>

            {rep.tugas.daftarTerdekat.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: "var(--text-kecil)", fontWeight: 600, color: "var(--color-muted)" }}>
                  Tugas Terdekat yang Perlu Dikerjakan:
                </div>
                {rep.tugas.daftarTerdekat.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 8px",
                      borderRadius: 4,
                      background: "var(--color-netral)",
                      fontSize: "var(--text-kecil)",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{t.title}</span>
                    <span style={{ color: "var(--color-muted)" }}>
                      {t.assignee ? `PIC: ${t.assignee}` : t.dueDate ?? "tanpa tanggal"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                Tidak ada tugas mendesak yang menunggu saat ini.
              </div>
            )}
          </section>

          {/* Kolom Tamu */}
          <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Tamu & Undangan</h2>
              <Link
                href="/tamu"
                style={{ fontSize: "var(--text-kecil)", color: "var(--color-primary)", textDecoration: "underline" }}
              >
                Ke daftar tamu →
              </Link>
            </div>

            <div className="rekap" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rekap-item">
                <span className="rekap-nilai">{rep.tamu.orang}</span>
                <span className="rekap-label">Perkiraan hadir (orang)</span>
              </div>
              <div className="rekap-item">
                <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
                  {rep.tamu.kursi}
                </span>
                <span className="rekap-label">Pasti hadir (kursi)</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--text-kecil)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
                <span>Belum konfirmasi RSVP:</span>
                <strong>{rep.tamu.belumKonfirmasi} orang</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
                <span>Undangan belum dikirim:</span>
                <strong style={{ color: rep.tamu.belumDiundang > 0 ? "var(--color-bata)" : "inherit" }}>
                  {rep.tamu.belumDiundang} undangan
                </strong>
              </div>
            </div>

            {rep.tamu.perKategori.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: "var(--text-kecil)", fontWeight: 600, color: "var(--color-muted)" }}>
                  Sebaran Kategori Tamu:
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {rep.tamu.perKategori.map((k) => (
                    <span
                      key={k.kategori}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: "var(--color-netral)",
                        fontSize: "var(--text-kecil)",
                      }}
                    >
                      {LABEL_KATEGORI_TAMU[k.kategori as KategoriTamu] ?? k.kategori}: <strong>{k.orang}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {/* Bagian 3: Rundown Hari-H & Vendor */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {/* Rundown Hari-H */}
          <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Rundown Acara Hari-H</h2>
              <Link
                href="/hari-h"
                style={{ fontSize: "var(--text-kecil)", color: "var(--color-primary)", textDecoration: "underline" }}
              >
                Ke jadwal hari-H →
              </Link>
            </div>

            <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
              {rep.rundown.total > 0
                ? `${rep.rundown.total} acara terdaftar, mulai ${rep.rundown.jamMulai ?? "-"} sampai ${rep.rundown.jamSelesai ?? "-"}`
                : "Belum ada susunan acara rundown."}
            </div>

            {rep.rundown.item.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rep.rundown.item.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 12,
                      padding: "6px 8px",
                      borderRadius: 4,
                      background: "var(--color-netral)",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "var(--text-kecil)" }}>
                      {r.startTime}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--text-dasar)" }}>{r.title}</div>
                      {r.location ? (
                        <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                          {r.location}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {rep.rundown.item.length > 5 ? (
                  <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)", textAlign: "center" }}>
                    + {rep.rundown.item.length - 5} acara lainnya di halaman Hari-H
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          {/* Vendor & Seragam */}
          <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Vendor & Seragam</h2>
              <Link
                href="/rencana/vendor"
                style={{ fontSize: "var(--text-kecil)", color: "var(--color-primary)", textDecoration: "underline" }}
              >
                Ke daftar vendor →
              </Link>
            </div>

            <div className="rekap" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rekap-item">
                <span className="rekap-nilai">{rep.vendor.dibook} / {rep.vendor.total}</span>
                <span className="rekap-label">Vendor dibook</span>
              </div>
              <div className="rekap-item">
                <span
                  className="rekap-nilai"
                  style={{ color: rep.vendor.belumLunas > 0 ? "var(--color-bata)" : "inherit" }}
                >
                  {rep.vendor.belumLunas}
                </span>
                <span className="rekap-label">Belum lunas</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "var(--text-kecil)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
                <span>Status Seragam & Busana:</span>
                <strong>
                  {rep.busana.siap} siap dari {rep.busana.total} seragam
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
                <span>Total Biaya Vendor:</span>
                <strong><Rupiah nilai={rep.vendor.totalTagihan} /></strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
                <span>Sudah Dibayarkan:</span>
                <strong style={{ color: "var(--color-primary)" }}><Rupiah nilai={rep.vendor.totalDibayar} /></strong>
              </div>
            </div>
          </section>
        </div>

        {/* Tindakan Cepat di Bawah */}
        <div
          className="kartu"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            background: "var(--color-netral)",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-dasar)" }}>
              Mau bagikan keadaan ini ke keluarga besar?
            </div>
            <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
              Kirim teks ringkas langsung ke WhatsApp atau cetak dalam format dokumen rapi.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => window.print()}
            >
              Cetak Dokumen
            </button>
            <Link className="tombol tombol-utama" href="/laporan/bagikan">
              Bagikan ke WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
