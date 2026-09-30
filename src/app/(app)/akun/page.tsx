"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { usePlan, type Plan } from "@/lib/use-plan";
import { Kerangka, Gagal } from "@/components/states";
import { toast } from "@/components/toast";
import { minta, pesanGalat } from "@/lib/api-client";

type PilihanTema = "terang" | "gelap" | "sistem";

// Sama dengan kunci di src/app/layout.tsx dan src/components/theme-toggle.tsx.
// Dulu layar ini memakai kunci lain, jadi pilihan gelap hilang saat halaman
// dimuat ulang.
const KUNCI_TEMA = "haribesar-tema";

/**
 * Layar Pengaturan Akun, Pilihan Rencana, Tema, dan Cadangan Data.
 */
export default function HalamanAkun() {
  const router = useRouter();
  const { data: sesi, isPending: memuatSesi } = useSession();
  const {
    plan,
    planId,
    daftarPlan,
    memuat: memuatPlan,
    galat: galatPlan,
    muatUlang: muatPlan,
    pilihPlan,
  } = usePlan();

  const [tema, setTema] = useState<PilihanTema>("sistem");
  const [online, setOnline] = useState(true);
  const [sedangKeluar, setSedangKeluar] = useState(false);
  const [sedangUnduh, setSedangUnduh] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const temaSimpan = localStorage.getItem(KUNCI_TEMA) as PilihanTema | null;
    if (temaSimpan && ["terang", "gelap", "sistem"].includes(temaSimpan)) {
      setTema(temaSimpan);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function gantiTema(temaBaru: PilihanTema) {
    setTema(temaBaru);
    localStorage.setItem(KUNCI_TEMA, temaBaru);

    if (temaBaru === "gelap") {
      document.documentElement.setAttribute("data-theme", "gelap");
    } else if (temaBaru === "terang") {
      document.documentElement.setAttribute("data-theme", "terang");
    } else {
      // "sistem": lepas atributnya dan biarkan aturan prefers-color-scheme
      // di globals.css yang memutuskan, termasuk saat pengguna mengganti tema
      // perangkat tanpa membuka layar ini lagi.
      document.documentElement.removeAttribute("data-theme");
    }
  }

  async function tanganiKeluar() {
    if (sedangKeluar) return;
    setSedangKeluar(true);
    try {
      await signOut();
      toast("Berhasil keluar dari akun");
      router.push("/masuk");
    } catch (err) {
      toast(pesanGalat(err));
      setSedangKeluar(false);
    }
  }

  async function unduhCadanganJson() {
    if (!planId) {
      toast("Pilih rencana aktif terlebih dahulu");
      return;
    }

    setSedangUnduh(true);
    try {
      const dataLaporan = await minta<{ report: unknown }>(`/api/plans/${planId}/report`);
      const dataOverview = await minta<{ overview: unknown }>(`/api/plans/${planId}/overview`);

      const berkasCadangan = {
        ekspor: "Pernikahan Plan",
        versi: 1,
        tanggalEkspor: new Date().toISOString(),
        plan: plan,
        overview: dataOverview.overview,
        laporan: dataLaporan.report,
      };

      const blob = new Blob([JSON.stringify(berkasCadangan, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const tautan = document.createElement("a");
      tautan.href = url;
      tautan.download = `cadangan-pernikahan-${plan?.partnerName?.replace(/\s+/g, "-").toLowerCase() || "plan"}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(tautan);
      tautan.click();
      document.body.removeChild(tautan);
      URL.revokeObjectURL(url);

      toast("Cadangan JSON berhasil diunduh");
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangUnduh(false);
    }
  }

  if (memuatSesi || memuatPlan) {
    return <Kerangka baris={6} />;
  }

  if (galatPlan) {
    return <Gagal apa="Data akun dan rencana" onCoba={muatPlan} />;
  }

  const pengguna = sesi?.user;

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Akun & Pengaturan</h1>
          <p>Kelola profil masuk, daftar rencana pernikahan, tema, dan cadangan data.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Bagian 1: Profil Pengguna */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Profil Pengguna</h2>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {pengguna?.name?.charAt(0) || pengguna?.email?.charAt(0) || "U"}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "var(--text-dasar)" }}>
                {pengguna?.name || "Pengguna"}
              </div>
              <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                {pengguna?.email || "-"}
              </div>
            </div>

            <button
              type="button"
              className="tombol tombol-sekunder"
              disabled={sedangKeluar}
              onClick={tanganiKeluar}
            >
              {sedangKeluar ? "Keluar..." : "Keluar akun"}
            </button>
          </div>
        </section>

        {/* Bagian 2: Daftar Rencana Pernikahan */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Rencana Pernikahan</h2>
              <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                Pilih rencana aktif yang sedang kamu kerjakan atau tambah rencana baru.
              </div>
            </div>
            <Link className="tombol tombol-sekunder" href="/rencana/plan">
              + Buat rencana baru
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {daftarPlan.map((p: Plan) => {
              const aktif = p.id === planId;
              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    borderRadius: 6,
                    border: aktif ? "2px solid var(--color-primary)" : "1px solid var(--color-garis)",
                    background: aktif ? "var(--color-netral)" : "var(--color-kertas)",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: "var(--text-dasar)" }}>
                        {p.partnerName ? `Bersama ${p.partnerName}` : "Rencana Pernikahan"}
                      </strong>
                      {aktif ? (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: "var(--color-primary)",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          Aktif
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                      Tanggal: {p.weddingDate ? p.weddingDate : "Belum ditentukan"} • Status: {p.status || "perencanaan"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {!aktif ? (
                      <button
                        type="button"
                        className="tombol tombol-sekunder"
                        style={{ minHeight: 44, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                        onClick={() => {
                          pilihPlan(p.id);
                          toast(`Beralih ke rencana bersama ${p.partnerName || "Pasangan"}`);
                        }}
                      >
                        Jadikan aktif
                      </button>
                    ) : null}
                    <Link
                      className="tombol tombol-sekunder"
                      style={{ minHeight: 44, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                      href="/rencana/plan"
                    >
                      Kelola rincian →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bagian 3: Pengaturan Tema Tampilan */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Tema Tampilan</h2>
          <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
            Mode gelap dirancang dengan pasangan warna kontras tinggi, bukan sekadar pembalikan warna layar.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`tombol ${tema === "terang" ? "tombol-utama" : "tombol-sekunder"}`}
              style={{ flex: 1, minWidth: 120 }}
              onClick={() => gantiTema("terang")}
            >
              Mode Terang
            </button>
            <button
              type="button"
              className={`tombol ${tema === "gelap" ? "tombol-utama" : "tombol-sekunder"}`}
              style={{ flex: 1, minWidth: 120 }}
              onClick={() => gantiTema("gelap")}
            >
              Mode Gelap
            </button>
            <button
              type="button"
              className={`tombol ${tema === "sistem" ? "tombol-utama" : "tombol-sekunder"}`}
              style={{ flex: 1, minWidth: 120 }}
              onClick={() => gantiTema("sistem")}
            >
              Mengikuti Sistem
            </button>
          </div>
        </section>

        {/* Bagian 4: Cadangan & Keamanan Data */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Cadangan Data Mandiri</h2>
              <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                Unduh seluruh data rencana kamu ke format file JSON agar kamu selalu memegang salinan data.
              </div>
            </div>
            <button
              type="button"
              className="tombol tombol-sekunder"
              disabled={sedangUnduh || !planId}
              onClick={unduhCadanganJson}
            >
              {sedangUnduh ? "Mengunduh..." : "Unduh Cadangan JSON"}
            </button>
          </div>
        </section>

        {/* Bagian 5: Status Aplikasi & PWA */}
        <section className="kartu" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Informasi Aplikasi & Luring</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--text-kecil)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
              <span>Status Koneksi:</span>
              <strong style={{ color: online ? "var(--color-primary)" : "var(--color-bata)" }}>
                {online ? "Terhubung (Online)" : "Luring (Offline)"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-garis)" }}>
              <span>Aplikasi Web Progresif (PWA):</span>
              <Link className="tautan-kalimat" href="/aplikasi">
                Cara memasang
              </Link>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Versi Sistem:</span>
              <span style={{ color: "var(--color-muted)" }}>
                {process.env.NEXT_PUBLIC_APP_VERSION} (Next.js 15 + PostgreSQL)
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
