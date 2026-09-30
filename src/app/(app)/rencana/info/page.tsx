"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { TabRencana } from "@/components/tab-rencana";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import { AUIDENS, type Audien, LABEL_AUDIEN } from "@/lib/konstanta";
import type { announcements } from "@/db/schema";

type Announcement = typeof announcements.$inferSelect;

/**
 * Layar Briefing & Informasi Keluarga / Crew.
 * Pasangan dapat menyusun pengumuman penting, aturan seragam, alur parkir,
 * dan membagikannya ke WhatsApp keluarga atau panitia.
 */
export default function HalamanInfo() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const {
    data,
    memuat: memuatInfo,
    galat: galatInfo,
    muatUlang: muatInfo,
  } = useMuat<{
    announcements: Announcement[];
    summary: { total: number; terbit: number; disematkan: number };
  }>(planId ? `/api/plans/${planId}/announcements` : null, {
    aktif: Boolean(planId),
  });

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<Announcement | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<Announcement | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  // Form states
  const [formJudul, setFormJudul] = useState("");
  const [formIsi, setFormIsi] = useState("");
  const [formAudien, setFormAudien] = useState<Audien>("semua");
  const [formSemat, setFormSemat] = useState(false);
  const [formTerbit, setFormTerbit] = useState(true);
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormJudul("");
    setFormIsi("");
    setFormAudien("semua");
    setFormSemat(false);
    setFormTerbit(true);
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(a: Announcement) {
    setDiedit(a);
    setFormJudul(a.title);
    setFormIsi(a.body);
    setFormAudien(
      AUIDENS.includes(a.audience as Audien) ? (a.audience as Audien) : "semua",
    );
    setFormSemat(a.isPinned ?? false);
    setFormTerbit(Boolean(a.publishedAt));
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formJudul.trim()) {
      setFormGalat("Judul pengumuman wajib diisi.");
      return;
    }
    if (!formIsi.trim()) {
      setFormGalat("Isi pengumuman wajib diisi.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        title: formJudul.trim(),
        body: formIsi.trim(),
        audience: formAudien,
        isPinned: formSemat,
        publishedAt: formTerbit ? new Date().toISOString() : null,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/announcements/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Pengumuman diperbarui");
      } else {
        await minta(`/api/plans/${planId}/announcements`, {
          method: "POST",
          body: payload,
        });
        toast("Pengumuman ditambahkan");
      }

      setLembarBuka(false);
      await muatInfo();
    } catch (err) {
      setFormGalat(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
    }
  }

  async function konfirmasiHapus() {
    if (!planId || !dihapus) return;
    setSedangHapus(true);
    try {
      await minta(`/api/plans/${planId}/announcements/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Pengumuman dihapus");
      setDihapus(null);
      await muatInfo();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  function salinTautan(token: string) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/bagikan/${token}`;
    navigator.clipboard.writeText(url);
    toast("Tautan publik berhasil disalin");
  }

  function bagikanWhatsApp(a: Announcement) {
    const teks = `*${a.title}*\nUntuk: ${LABEL_AUDIEN[a.audience as Audien] ?? a.audience}\n\n${a.body}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, "_blank");
  }

  const daftar = data?.announcements ?? [];
  const summary = data?.summary;

  if (memuatPlan || (planId && memuatInfo && !data)) {
    return <Kerangka baris={6} />;
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

  if (galatInfo) {
    return <Gagal apa="Daftar pengumuman" onCoba={muatInfo} />;
  }

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Briefing & Informasi</h1>
          <p>Catatan penting untuk keluarga besar, panitia acara, dan vendor hari-H.</p>
        </div>
        <div>
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            + Buat pengumuman
          </button>
        </div>
      </div>

      <TabRencana />

      {summary && summary.total > 0 ? (
        <div className="rekap" style={{ marginBottom: 16 }}>
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.total}</span>
            <span className="rekap-label">Total catatan</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
              {summary.terbit}
            </span>
            <span className="rekap-label">Sudah terbit</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.disematkan}</span>
            <span className="rekap-label">Disematkan</span>
          </div>
        </div>
      ) : null}

      {daftar.length === 0 ? (
        <Kosong
          keadaan="Belum ada informasi briefing."
          jalanKeluar="Tulis petunjuk parkir, panduan seragam, atau jadwal kumpul keluarga."
        >
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            Buat pengumuman
          </button>
        </Kosong>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {daftar.map((a) => (
            <div
              key={a.id}
              className="kartu"
              style={{
                borderColor: a.isPinned ? "var(--color-primary)" : undefined,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: "var(--text-h3)" }}>{a.title}</h2>
                    {a.isPinned ? (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "var(--text-kecil)",
                          fontWeight: 600,
                          background: "var(--color-netral)",
                          color: "var(--color-primary)",
                        }}
                      >
                        📌 Disematkan
                      </span>
                    ) : null}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: "var(--text-kecil)",
                        background: "var(--color-netral)",
                        color: "var(--color-ink)",
                      }}
                    >
                      Audien: {LABEL_AUDIEN[a.audience as Audien] ?? a.audience}
                    </span>
                    {!a.publishedAt ? (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "var(--text-kecil)",
                          background: "var(--color-kertas)",
                          color: "var(--color-muted)",
                          border: "1px solid var(--color-garis)",
                        }}
                      >
                        Draf (Belum terbit)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="tombol tombol-sekunder"
                    style={{ minHeight: 34, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                    onClick={() => bagikanWhatsApp(a)}
                  >
                    Kirim WA
                  </button>
                  {a.shareToken ? (
                    <button
                      type="button"
                      className="tombol tombol-sekunder"
                      style={{ minHeight: 34, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                      onClick={() => salinTautan(a.shareToken!)}
                    >
                      Salin tautan
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="tombol tombol-sekunder"
                    style={{ minHeight: 34, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                    onClick={() => bukaUbah(a)}
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    className="tombol tombol-sekunder"
                    style={{
                      minHeight: 34,
                      padding: "0 10px",
                      fontSize: "var(--text-kecil)",
                      color: "var(--color-bata)",
                    }}
                    onClick={() => setDihapus(a)}
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <div
                style={{
                  whiteSpace: "pre-line",
                  fontSize: "var(--text-dasar)",
                  lineHeight: 1.6,
                  color: "var(--color-ink)",
                }}
              >
                {a.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lembar Tambah / Ubah */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah pengumuman" : "Buat pengumuman baru"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Judul pengumuman" id="formJudul" galat={formGalat ?? undefined}>
            <input
              id="formJudul"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Petunjuk Parkir & Titik Kumpul Keluarga"
              value={formJudul}
              onChange={(e) => setFormJudul(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Target penerima (audien)"
            id="formAudien"
            nilai={formAudien}
            onUbah={(v) => setFormAudien(v as Audien)}
            opsi={AUIDENS.map((aud) => ({ nilai: aud, label: LABEL_AUDIEN[aud] }))}
          />

          <Isian label="Isi pengumuman / briefing" id="formIsi">
            <textarea
              id="formIsi"
              className="isian"
              rows={6}
              required
              placeholder="Tuliskan detail informasi, jam kehadiran, aturan dresscode, dll."
              value={formIsi}
              onChange={(e) => setFormIsi(e.target.value)}
            />
          </Isian>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formSemat}
                onChange={(e) => setFormSemat(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span>Sematkan di atas (Pengumuman penting)</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formTerbit}
                onChange={(e) => setFormTerbit(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span>Langsung terbitkan sekarang</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setLembarBuka(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="tombol tombol-utama"
              disabled={sedangSimpan}
            >
              {sedangSimpan ? "Menyimpan..." : "Simpan pengumuman"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus pengumuman ini?"
        isi={`Pengumuman "${dihapus?.title ?? ""}" akan dihapus.`}
        tombolYa="Ya, hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
