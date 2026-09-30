"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { Rupiah } from "@/components/rupiah";
import { BudgetBar } from "@/components/budget-bar";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  KATEGORI_UANG,
  type KategoriUang,
  LABEL_KATEGORI_UANG,
} from "@/lib/konstanta";
import type { budgetItems } from "@/db/schema";

type BudgetItem = typeof budgetItems.$inferSelect & {
  paidAmount: number;
  remaining: number;
  overBudget: boolean;
};

type VendorRingkas = {
  id: string;
  name: string;
  category: string;
  status: string;
  budgetItemId: string | null;
};

const POS_BAWAAN_INDONESIA: Array<{
  name: string;
  category: KategoriUang;
  plannedAmount: number;
  notes: string;
}> = [
  {
    name: "Venue & Gedung Resepsi",
    category: "venue",
    plannedAmount: 15000000,
    notes: "Sewa gedung, kebersihan, dan genset",
  },
  {
    name: "Katering & Prasmanan Tamu",
    category: "katering",
    plannedAmount: 25000000,
    notes: "Paket prasmanan, stall pondokan, dan air mineral",
  },
  {
    name: "Dekorasi Pelaminan & Janur",
    category: "dekorasi",
    plannedAmount: 10000000,
    notes: "Pelaminan, lorong masuk, mini garden, dan photo booth",
  },
  {
    name: "Busana Pengantin & Rias (MUA)",
    category: "busana",
    plannedAmount: 8000000,
    notes: "Sewa kebaya/jas pengantin, make up akad & resepsi",
  },
  {
    name: "Dokumentasi Foto & Video",
    category: "dokumentasi",
    plannedAmount: 6000000,
    notes: "Liputan hari-H, album cetak, dan video cinematic",
  },
  {
    name: "Perlengkapan Prosesi Adat",
    category: "adat",
    plannedAmount: 3000000,
    notes: "Pemandu adat, seserahan, siraman",
  },
  {
    name: "Sound System, MC & Hiburan",
    category: "lainnya",
    plannedAmount: 4000000,
    notes: "MC akad/resepsi dan grup musik pengiring",
  },
  {
    name: "Undangan & Souvenir Tamu",
    category: "lainnya",
    plannedAmount: 3500000,
    notes: "Cetak undangan fisik/web dan souvenir",
  },
];

/**
 * Layar Anggaran & Pengeluaran.
 * Menghitung batas uang per pos serta perbandingan dengan pembayaran nyata.
 * Tidak ada angka karangan; "terpakai" dihitung dari pembayaran yang sudah keluar.
 */
export default function HalamanAnggaran() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const {
    data,
    memuat: memuatAnggaran,
    galat: galatAnggaran,
    muatUlang: muatAnggaran,
  } = useMuat<{
    items: BudgetItem[];
    totals: { planned: number; paid: number; remaining: number };
    vendors: VendorRingkas[];
  }>(planId ? `/api/plans/${planId}/budget-items` : null, {
    aktif: Boolean(planId),
  });

  const [cari, setCari] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("semua");

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<BudgetItem | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<BudgetItem | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const [sedangMuatBawaan, setSedangMuatBawaan] = useState(false);

  // Form states
  const [formNama, setFormNama] = useState("");
  const [formKategori, setFormKategori] = useState<KategoriUang>("venue");
  const [formBatas, setFormBatas] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormNama("");
    setFormKategori("venue");
    setFormBatas("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(p: BudgetItem) {
    setDiedit(p);
    setFormNama(p.name);
    setFormKategori(
      KATEGORI_UANG.includes(p.category as KategoriUang)
        ? (p.category as KategoriUang)
        : "lainnya",
    );
    setFormBatas(p.plannedAmount ? String(p.plannedAmount) : "");
    setFormCatatan(p.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formNama.trim()) {
      setFormGalat("Nama pos anggaran wajib diisi.");
      return;
    }

    const angkaBatas = parseInt(formBatas.replace(/\D/g, ""), 10);
    if (isNaN(angkaBatas) || angkaBatas < 0) {
      setFormGalat("Batas anggaran harus berupa angka rupiah positif.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        name: formNama.trim(),
        category: formKategori,
        plannedAmount: angkaBatas,
        notes: formCatatan.trim() || null,
        sortOrder: diedit?.sortOrder ?? 0,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/budget-items/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Pos anggaran diperbarui");
      } else {
        await minta(`/api/plans/${planId}/budget-items`, {
          method: "POST",
          body: payload,
        });
        toast("Pos anggaran ditambahkan");
      }

      setLembarBuka(false);
      await muatAnggaran();
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
      await minta(`/api/plans/${planId}/budget-items/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Pos anggaran dihapus");
      setDihapus(null);
      await muatAnggaran();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  async function pasangPosBawaan() {
    if (!planId) return;
    setSedangMuatBawaan(true);
    try {
      for (const pos of POS_BAWAAN_INDONESIA) {
        await minta(`/api/plans/${planId}/budget-items`, {
          method: "POST",
          body: pos,
        });
      }
      toast("Pos anggaran bawaan berhasil dipasang");
      await muatAnggaran();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangMuatBawaan(false);
    }
  }

  const rawItems = data?.items ?? [];
  const totals = data?.totals ?? { planned: 0, paid: 0, remaining: 0 };
  const vendorList = data?.vendors ?? [];

  const items = rawItems.filter((item) => {
    if (filterKategori !== "semua" && item.category !== filterKategori) return false;
    if (cari.trim()) {
      const q = cari.toLowerCase();
      const namaCocok = item.name.toLowerCase().includes(q);
      const catatanCocok = item.notes?.toLowerCase().includes(q);
      if (!namaCocok && !catatanCocok) return false;
    }
    return true;
  });

  if (memuatPlan || (planId && memuatAnggaran && !data)) {
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

  if (galatAnggaran) {
    return <Gagal apa="Daftar anggaran" onCoba={muatAnggaran} />;
  }

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Anggaran</h1>
          <p>Batas biaya per pos dan pantauan pembayaran vendor secara terpusat.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {rawItems.length === 0 ? (
            <button
              type="button"
              className="tombol tombol-sekunder"
              disabled={sedangMuatBawaan}
              onClick={pasangPosBawaan}
            >
              {sedangMuatBawaan ? "Memasang..." : "Muat pos bawaan"}
            </button>
          ) : null}
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            + Tambah pos
          </button>
        </div>
      </div>

      {/* Ringkasan Keseluruhan Anggaran */}
      <div className="kartu" style={{ marginBottom: 20 }}>
        <div className="rekap" style={{ border: "none", padding: 0, marginBottom: 16 }}>
          <div className="rekap-item">
            <span className="rekap-nilai">
              <Rupiah nilai={totals.planned} />
            </span>
            <span className="rekap-label">Total rencana</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
              <Rupiah nilai={totals.paid} />
            </span>
            <span className="rekap-label">Sudah terbayar</span>
          </div>
          <div className="rekap-item">
            <span
              className="rekap-nilai"
              style={{
                color: totals.remaining < 0 ? "var(--color-bata)" : "var(--color-ink)",
              }}
            >
              <Rupiah nilai={totals.remaining} />
            </span>
            <span className="rekap-label">
              {totals.remaining < 0 ? "Defisit anggaran" : "Sisa anggaran"}
            </span>
          </div>
        </div>

        <BudgetBar
          terpakai={totals.paid}
          batas={totals.planned}
          label="Pengeluaran keseluruhan rencana"
        />
      </div>

      {/* Kontrol Pencarian & Filter Kategori */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
          background: "var(--color-kertas)",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid var(--color-garis)",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 240px" }}>
          <input
            type="search"
            className="isian"
            placeholder="Cari pos anggaran..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 1 220px" }}>
          <label htmlFor="filterKategori" style={{ fontSize: "var(--text-kecil)", fontWeight: 600 }}>
            Kategori:
          </label>
          <select
            id="filterKategori"
            className="isian"
            style={{ padding: "6px 10px", fontSize: "var(--text-kecil)" }}
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="semua">Semua kategori</option>
            {KATEGORI_UANG.map((k) => (
              <option key={k} value={k}>
                {LABEL_KATEGORI_UANG[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daftar Pos Anggaran */}
      {rawItems.length === 0 ? (
        <Kosong
          keadaan="Belum ada pos anggaran."
          jalanKeluar="Pasang pos bawaan pernikahan Indonesia atau buat pos sendiri."
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              className="tombol tombol-utama"
              disabled={sedangMuatBawaan}
              onClick={pasangPosBawaan}
            >
              {sedangMuatBawaan ? "Memasang..." : "Muat pos bawaan"}
            </button>
            <button type="button" className="tombol tombol-sekunder" onClick={bukaTambah}>
              Tulis pos sendiri
            </button>
          </div>
        </Kosong>
      ) : items.length === 0 ? (
        <Kosong
          keadaan="Tidak ada pos yang cocok dengan pencarian."
          jalanKeluar="Coba periksa kata kunci atau ubah filter kategori."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const kategori = item.category as KategoriUang;
            const vendorTertaut = vendorList.filter((v) => v.budgetItemId === item.id);

            return (
              <div
                key={item.id}
                className="kartu"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderColor: item.overBudget ? "var(--color-bata)" : undefined,
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
                      <h2 style={{ margin: 0, fontSize: "var(--text-h3)" }}>{item.name}</h2>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "var(--text-kecil)",
                          background: "var(--color-netral)",
                          color: "var(--color-ink)",
                        }}
                      >
                        {LABEL_KATEGORI_UANG[kategori] ?? item.category}
                      </span>
                      {item.overBudget ? (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: "var(--text-kecil)",
                            fontWeight: 600,
                            background: "var(--color-netral)",
                            color: "var(--color-bata)",
                            border: "1px solid var(--color-bata)",
                          }}
                        >
                          Lewat batas
                        </span>
                      ) : null}
                    </div>

                    {item.notes ? (
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "var(--text-kecil)",
                          color: "var(--color-muted)",
                        }}
                      >
                        {item.notes}
                      </p>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="tombol tombol-sekunder"
                      style={{ minHeight: 34, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                      onClick={() => bukaUbah(item)}
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
                      onClick={() => setDihapus(item)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Progress bar pos */}
                <BudgetBar
                  terpakai={item.paidAmount}
                  batas={item.plannedAmount}
                  ringkas
                />

                {/* Vendor tertaut */}
                {vendorTertaut.length > 0 && (
                  <div
                    style={{
                      fontSize: "var(--text-kecil)",
                      borderTop: "1px solid var(--color-garis)",
                      paddingTop: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ color: "var(--color-muted)" }}>Vendor tertaut:</span>
                    {vendorTertaut.map((v) => (
                      <Link
                        key={v.id}
                        href={`/rencana/vendor/${v.id}`}
                        style={{
                          textDecoration: "underline",
                          color: "var(--color-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {v.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lembar Tambah / Ubah */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah pos anggaran" : "Tambah pos anggaran"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Nama pos anggaran" id="formNama" galat={formGalat ?? undefined}>
            <input
              id="formNama"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Katering Prasmanan"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Kategori"
            id="formKategori"
            nilai={formKategori}
            onUbah={(v) => setFormKategori(v as KategoriUang)}
            opsi={KATEGORI_UANG.map((k) => ({
              nilai: k,
              label: LABEL_KATEGORI_UANG[k],
            }))}
          />

          <Isian
            label="Batas rencana biaya (Rp)"
            id="formBatas"
            bantuan="Berapa perkiraan batas maksimal dana yang dialokasikan untuk pos ini."
          >
            <input
              id="formBatas"
              className="isian"
              type="number"
              min={0}
              required
              placeholder="Contoh: 12000000"
              value={formBatas}
              onChange={(e) => setFormBatas(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan tambahan (opsional)" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Contoh: Sudah termasuk 400 porsi dan 4 stall makanan kecil."
              value={formCatatan}
              onChange={(e) => setFormCatatan(e.target.value)}
            />
          </Isian>

          {/* Sisa preview jika mengubah pos yang sudah ada pembayarannya */}
          {diedit && diedit.paidAmount > 0 && formBatas && (
            <div
              style={{
                background: "var(--color-netral)",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: "var(--text-kecil)",
              }}
            >
              <div>
                <strong>Sudah terpakai dari vendor:</strong> <Rupiah nilai={diedit.paidAmount} />
              </div>
              <div>
                <strong>Perkiraan sisa baru:</strong>{" "}
                <Rupiah
                  nilai={parseInt(formBatas || "0", 10) - diedit.paidAmount}
                />
              </div>
            </div>
          )}

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
              {sedangSimpan ? "Menyimpan..." : "Simpan pos"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus pos anggaran ini?"
        isi={`Pos "${dihapus?.name ?? ""}" akan dihapus. Vendor yang tertaut tidak akan terhapus, tetapi tidak lagi masuk ke hitungan pos ini.`}
        tombolYa="Ya, hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
