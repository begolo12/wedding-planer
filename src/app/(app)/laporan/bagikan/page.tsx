"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { toast, Lembar } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import type { JenisBagikan } from "@/lib/teks-wa";

type ShareLinkItem = {
  id: string;
  planId: string;
  token: string;
  label: string;
  target: string;
  createdAt: string;
  url: string;
};

/**
 * Layar Bagikan Laporan ke WhatsApp.
 * Menyusun teks ringkas atau lengkap di server, memastikan angka akurat,
 * dan membuka WhatsApp tanpa pustaka pihak ketiga.
 */
export default function HalamanBagikanLaporan() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const [varian, setVarian] = useState<JenisBagikan>("ringkas");
  const [pesan, setPesan] = useState("");
  const [tautanIdDipilih, setTautanIdDipilih] = useState<string>("");

  const urlLinks = planId ? `/api/plans/${planId}/report/links` : null;
  const {
    data: dataLinks,
    memuat: memuatLinks,
    muatUlang: muatLinks,
  } = useMuat<{ links: ShareLinkItem[]; limit: number; sisa: number }>(urlLinks, {
    aktif: Boolean(planId),
  });

  const [teksHasil, setTeksHasil] = useState<string>("");
  const [panjangTeks, setPanjangTeks] = useState(0);
  const [batasTeks, setBatasTeks] = useState(800);
  const [terpotong, setTerpotong] = useState(false);
  const [urlWa, setUrlWa] = useState("");
  const [sedangMenyusun, setSedangMenyusun] = useState(false);

  // Lembar buat tautan baru
  const [lembarBuka, setLembarBuka] = useState(false);
  const [labelTautanBaru, setLabelTautanBaru] = useState("");
  const [sedangBuatTautan, setSedangBuatTautan] = useState(false);

  // Ambil teks WhatsApp dari server saat varian, pesan, atau tautanId berubah
  useEffect(() => {
    if (!planId) return;

    let dibatalkan = false;
    async function ambilTeks() {
      setSedangMenyusun(true);
      try {
        const res = await minta<{
          text: string;
          length: number;
          limit: number;
          truncated: boolean;
          lines: number;
          waUrl: string;
        }>(`/api/plans/${planId}/report/share-text`, {
          method: "POST",
          body: {
            variant: varian,
            message: pesan.trim() || undefined,
            linkId: tautanIdDipilih || undefined,
          },
        });

        if (!dibatalkan) {
          setTeksHasil(res.text);
          setPanjangTeks(res.length);
          setBatasTeks(res.limit);
          setTerpotong(res.truncated);
          setUrlWa(res.waUrl);
        }
      } catch (err) {
        if (!dibatalkan) {
          toast(pesanGalat(err));
        }
      } finally {
        if (!dibatalkan) {
          setSedangMenyusun(false);
        }
      }
    }

    const timer = setTimeout(ambilTeks, 250);
    return () => {
      dibatalkan = true;
      clearTimeout(timer);
    };
  }, [planId, varian, pesan, tautanIdDipilih]);

  async function salinTeks() {
    if (!teksHasil) return;
    try {
      await navigator.clipboard.writeText(teksHasil);
      toast("Teks berhasil disalin ke papan klip");
    } catch {
      toast("Gagal menyalin teks, salin secara manual dari kotak pratinjau");
    }
  }

  async function buatTautanBaru(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    setSedangBuatTautan(true);
    try {
      const res = await minta<{ link: ShareLinkItem }>(
        `/api/plans/${planId}/report/links`,
        {
          method: "POST",
          body: {
            label: labelTautanBaru.trim() || "Keluarga Besar",
            target: "laporan",
          },
        },
      );
      toast("Tautan baca-saja dibuat");
      setLembarBuka(false);
      setLabelTautanBaru("");
      await muatLinks();
      setTautanIdDipilih(res.link.id);
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangBuatTautan(false);
    }
  }

  async function cabutTautan(id: string) {
    if (!planId) return;
    try {
      await minta(`/api/plans/${planId}/report/links/${id}`, {
        method: "DELETE",
      });
      toast("Tautan dicabut");
      if (tautanIdDipilih === id) {
        setTautanIdDipilih("");
      }
      await muatLinks();
    } catch (err) {
      toast(pesanGalat(err));
    }
  }

  if (memuatPlan) {
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

  const links = dataLinks?.links ?? [];
  const sisaJatah = dataLinks?.sisa ?? 0;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link className="tautan-kalimat" href="/laporan">
          ← Kembali ke laporan
        </Link>
      </div>

      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Bagikan ke WhatsApp</h1>
          <p>
            Kirim laporan keadaan sekarang langsung ke kontak atau grup WhatsApp keluarga.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Kolom Kiri: Pilihan Konten */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Pilihan Format Teks</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid var(--color-garis)",
                  background: varian === "ringkas" ? "var(--color-netral)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="varian"
                  checked={varian === "ringkas"}
                  onChange={() => setVarian("ringkas")}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Ringkasan singkat</div>
                  <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                    Sekitar 12 baris: uang, tugas, dan tamu. Cocok untuk dikirim ke orang tua.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid var(--color-garis)",
                  background: varian === "lengkap" ? "var(--color-netral)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="varian"
                  checked={varian === "lengkap"}
                  onChange={() => setVarian("lengkap")}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Laporan lengkap</div>
                  <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                    Termasuk rincian pos anggaran dan jadwal rundown. Cocok untuk pasangan dan panitia inti.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid var(--color-garis)",
                  background: varian === "tautan" ? "var(--color-netral)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="varian"
                  checked={varian === "tautan"}
                  onChange={() => setVarian("tautan")}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Tautan saja</div>
                  <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                    Paling ringkas, hanya pesan pembuka dan tautan baca-saja.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Pesan Pembuka (Opsional)</h2>
            <Isian
              label="Kalimat sapaan sebelum ringkasan angka"
              id="pesanSapaan"
              bantuan="Angka dan tanggal disusun otomatis dari database dan tidak dapat diubah agar tetap akurat."
            >
              <textarea
                id="pesanSapaan"
                className="isian"
                rows={3}
                maxLength={400}
                placeholder="Contoh: Assalamu'alaikum Bapak dan Ibu, berikut perkembangan persiapan pernikahan kami per hari ini."
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
              />
            </Isian>
          </div>

          {/* Sertakan Tautan Baca-Saja */}
          <div className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Sertakan Tautan Web</h2>
              {sisaJatah > 0 ? (
                <button
                  type="button"
                  className="tombol tombol-sekunder"
                  style={{ minHeight: 44, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                  onClick={() => setLembarBuka(true)}
                >
                  + Buat tautan baru
                </button>
              ) : null}
            </div>

            <p style={{ margin: 0, fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
              Penerima tautan bisa melihat laporan atau jadwal rundown langsung di browser tanpa perlu login.
            </p>

            {links.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "var(--text-kecil)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="tautanDipilih"
                    checked={tautanIdDipilih === ""}
                    onChange={() => setTautanIdDipilih("")}
                  />
                  <span>Tanpa tautan web</span>
                </label>

                {links.map((link) => (
                  <div
                    key={link.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 4,
                      background: tautanIdDipilih === link.id ? "var(--color-netral)" : "var(--color-kertas)",
                      border: "1px solid var(--color-garis)",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "var(--text-kecil)",
                        cursor: "pointer",
                        flex: 1,
                      }}
                    >
                      <input
                        type="radio"
                        name="tautanDipilih"
                        checked={tautanIdDipilih === link.id}
                        onChange={() => setTautanIdDipilih(link.id)}
                      />
                      <div>
                        <strong>{link.label}</strong>
                        <div style={{ color: "var(--color-muted)" }}>
                          {link.url}
                        </div>
                      </div>
                    </label>

                    <button
                      type="button"
                      className="tombol tombol-sekunder"
                      style={{
                        padding: "0 8px",
                        fontSize: "var(--text-kecil)",
                        color: "var(--color-bata)",
                      }}
                      onClick={() => cabutTautan(link.id)}
                    >
                      Cabut
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                Belum ada tautan publik. Buat satu untuk menyertakan link baca-saja.
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Teks WhatsApp */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="kartu" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Pratinjau Teks WhatsApp</h2>
              <span
                style={{
                  fontSize: "var(--text-kecil)",
                  color: panjangTeks > batasTeks ? "var(--color-bata)" : "var(--color-muted)",
                  fontWeight: 600,
                }}
              >
                {panjangTeks} / {batasTeks} karakter
              </span>
            </div>

            {terpotong ? (
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 4,
                  background: "var(--color-kertas)",
                  border: "1px solid var(--color-bata)",
                  color: "var(--color-bata)",
                  fontSize: "var(--text-kecil)",
                }}
              >
                Peringatan: Teks melebihi 800 karakter batas WhatsApp dan telah dipersingkat.
              </div>
            ) : null}

            <div
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                background: "var(--color-netral)",
                padding: "16px",
                borderRadius: 6,
                border: "1px solid var(--color-garis)",
                maxHeight: "440px",
                overflowY: "auto",
                color: "var(--color-ink)",
              }}
            >
              {sedangMenyusun ? "Menyusun teks terbaru..." : teksHasil}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="tombol tombol-sekunder"
                style={{ flex: 1 }}
                onClick={salinTeks}
              >
                Salin Teks
              </button>

              <a
                className="tombol tombol-utama"
                style={{
                  flex: 1,
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textDecoration: "none",
                }}
                href={urlWa || `https://wa.me/?text=${encodeURIComponent(teksHasil)}`}
                target="_blank"
                rel="noreferrer"
              >
                Buka WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lembar Buat Tautan Baru */}
      <Lembar
        buka={lembarBuka}
        judul="Buat Tautan Baca-Saja"
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={buatTautanBaru} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian
            label="Label / Nama penerima tautan"
            id="labelTautan"
            bantuan="Contoh: Keluarga Pihak Pria, Vendor Dekorasi, atau Panitia Inti."
          >
            <input
              id="labelTautan"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Keluarga Besar"
              value={labelTautanBaru}
              onChange={(e) => setLabelTautanBaru(e.target.value)}
            />
          </Isian>

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
              disabled={sedangBuatTautan}
            >
              {sedangBuatTautan ? "Membuat..." : "Buat tautan"}
            </button>
          </div>
        </form>
      </Lembar>
    </div>
  );
}
