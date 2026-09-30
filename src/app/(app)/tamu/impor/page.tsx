"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlan } from "@/lib/use-plan";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  KATEGORI_TAMU,
  type KategoriTamu,
  LABEL_KATEGORI_TAMU,
} from "@/lib/konstanta";
import type { BarisTamu } from "@/lib/impor-tamu";

/**
 * Layar Impor / Tempel Daftar Tamu.
 * Membaca salinan teks dari WhatsApp atau Excel, menampilkannya dalam pratinjau,
 * lalu menyimpannya ke database tanpa membuat duplikasi baris kembar.
 */
export default function HalamanImporTamu() {
  const router = useRouter();
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const [langkah, setLangkah] = useState<1 | 2>(1);
  const [teks, setTeks] = useState("");
  const [kategori, setKategori] = useState<KategoriTamu>("teman");

  const [sedangPeriksa, setSedangPeriksa] = useState(false);
  const [galatPeriksa, setGalatPeriksa] = useState<string | null>(null);

  const [preview, setPreview] = useState<BarisTamu[]>([]);
  const [dipilih, setDipilih] = useState<Set<string>>(new Set());

  const [sedangSimpan, setSedangSimpan] = useState(false);

  async function periksaDaftar(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!teks.trim()) {
      setGalatPeriksa("Tempel dulu daftar nama tamu yang ingin dimasukkan.");
      return;
    }

    setSedangPeriksa(true);
    setGalatPeriksa(null);

    try {
      const res = await minta<{ preview: BarisTamu[] }>(
        `/api/plans/${planId}/guests/import`,
        {
          method: "POST",
          body: {
            teks: teks.trim(),
            category: kategori,
            previewOnly: true,
          },
        },
      );

      if (!res.preview || res.preview.length === 0) {
        setGalatPeriksa("Tidak ada nama tamu yang terbaca dari teks yang ditempel.");
        return;
      }

      setPreview(res.preview);
      // Default pilih semua yang tidak kembar
      const aman = new Set<string>();
      for (const item of res.preview) {
        if (!item.kembar) {
          aman.add(item.name);
        }
      }
      setDipilih(aman);
      setLangkah(2);
    } catch (err) {
      setGalatPeriksa(pesanGalat(err));
    } finally {
      setSedangPeriksa(false);
    }
  }

  function togglePilih(nama: string) {
    setDipilih((prev) => {
      const baru = new Set(prev);
      if (baru.has(nama)) {
        baru.delete(nama);
      } else {
        baru.add(nama);
      }
      return baru;
    });
  }

  function toggleSemua() {
    const semuaAman = preview.filter((p) => !p.kembar).map((p) => p.name);
    if (dipilih.size === semuaAman.length) {
      setDipilih(new Set());
    } else {
      setDipilih(new Set(semuaAman));
    }
  }

  async function simpanHasil() {
    if (!planId) return;
    if (dipilih.size === 0) {
      toast("Pilih minimal satu nama tamu untuk disimpan.");
      return;
    }

    setSedangSimpan(true);
    try {
      const res = await minta<{ created: number }>(
        `/api/plans/${planId}/guests/import`,
        {
          method: "POST",
          body: {
            teks: teks.trim(),
            category: kategori,
            previewOnly: false,
            pilih: Array.from(dipilih),
          },
        },
      );

      toast(`${res.created} tamu berhasil ditambahkan`);
      router.push("/tamu");
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
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

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/tamu"
          style={{
            color: "var(--color-primary)",
            textDecoration: "underline",
            fontSize: "var(--text-kecil)",
            fontWeight: 500,
          }}
        >
          ← Kembali ke daftar tamu
        </Link>
      </div>

      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Tempel Daftar Tamu</h1>
          <p>
            {langkah === 1
              ? "Langkah 1 dari 2: Tempel teks nama tamu dari WhatsApp, catatan HP, atau Excel."
              : "Langkah 2 dari 2: Periksa nama yang terdeteksi sebelum disimpan ke database."}
          </p>
        </div>
      </div>

      {langkah === 1 ? (
        <form onSubmit={periksaDaftar} noValidate className="kartu" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Pilih
            label="Kategori untuk tamu yang diimpor"
            id="kategoriImpor"
            nilai={kategori}
            onUbah={(v) => setKategori(v as KategoriTamu)}
            opsi={KATEGORI_TAMU.map((k) => ({
              nilai: k,
              label: LABEL_KATEGORI_TAMU[k],
            }))}
          />

          <Isian
            label="Daftar nama tamu (satu nama per baris)"
            id="teksImpor"
            galat={galatPeriksa ?? undefined}
            bantuan="Bisa format: 'Nama, Jumlah' seperti 'Bpk. Budi, 2' atau cukup 'Nama' saja (otomatis dihitung 1 orang)."
          >
            <textarea
              id="teksImpor"
              className="isian"
              rows={12}
              required
              placeholder={`Contoh teks:\nBpk. Danu & Ibu, 2\nAhmad Fauzi, 1\nIbu Ratna, 3\nKeluarga Om Hadi, 4`}
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
            />
          </Isian>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Link className="tombol tombol-sekunder" href="/tamu">
              Batal
            </Link>
            <button
              type="submit"
              className="tombol tombol-utama"
              disabled={sedangPeriksa}
            >
              {sedangPeriksa ? "Membaca data..." : "Periksa daftar (Lanjut) →"}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="rekap">
            <div className="rekap-item">
              <span className="rekap-nilai">{preview.length}</span>
              <span className="rekap-label">Baris terbaca</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
                {dipilih.size}
              </span>
              <span className="rekap-label">Dipilih untuk disimpan</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai" style={{ color: "var(--color-bata)" }}>
                {preview.filter((p) => p.kembar).length}
              </span>
              <span className="rekap-label">Nama kembar (dilewati)</span>
            </div>
          </div>

          <div
            className="kartu"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={
                  dipilih.size === preview.filter((p) => !p.kembar).length &&
                  dipilih.size > 0
                }
                onChange={toggleSemua}
                style={{ width: 18, height: 18 }}
              />
              <span>Pilih semua yang aman ({preview.filter((p) => !p.kembar).length} nama)</span>
            </label>

            <span style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
              Kategori: <strong>{LABEL_KATEGORI_TAMU[kategori]}</strong>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {preview.map((item, idx) => (
              <div
                key={idx}
                className="kartu"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  background: item.kembar ? "var(--color-netral)" : "var(--color-kertas)",
                  opacity: item.kembar ? 0.75 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 auto" }}>
                  <input
                    type="checkbox"
                    disabled={item.kembar}
                    checked={dipilih.has(item.name)}
                    onChange={() => togglePilih(item.name)}
                    style={{ width: 18, height: 18 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--text-dasar)" }}>
                      {item.name}
                    </div>
                    {item.catatan ? (
                      <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-bata)" }}>
                        {item.catatan}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: "var(--text-kecil)",
                      background: "var(--color-netral)",
                    }}
                  >
                    {item.guestCount} orang
                  </span>
                  {item.kembar ? (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: "var(--text-kecil)",
                        fontWeight: 600,
                        background: "var(--color-kertas)",
                        color: "var(--color-bata)",
                        border: "1px solid var(--color-bata)",
                      }}
                    >
                      Sudah ada
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setLangkah(1)}
            >
              ← Ubah teks masukan
            </button>
            <button
              type="button"
              className="tombol tombol-utama"
              disabled={sedangSimpan || dipilih.size === 0}
              onClick={simpanHasil}
            >
              {sedangSimpan
                ? "Menyimpan ke database..."
                : `Simpan ${dipilih.size} tamu ke daftar`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
