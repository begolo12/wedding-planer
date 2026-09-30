"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { TabRencana } from "@/components/tab-rencana";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { Rupiah } from "@/components/rupiah";
import { formatTanggalId } from "@/lib/format";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  PEMILIK_BUSANA,
  STATUS_BUSANA,
  type PemilikBusana,
  type StatusBusana,
  LABEL_PEMILIK_BUSANA,
  LABEL_STATUS_BUSANA,
} from "@/lib/konstanta";
import type { outfits } from "@/db/schema";

type Outfit = typeof outfits.$inferSelect;

/**
 * Layar Busana & Seragam.
 * Melacak pakaian pengantin, orang tua, keluarga besar, dan panitia/crew.
 * Fokus utama: tanggal ambil jangan sampai terlewat menjelang hari-H.
 */
export default function HalamanSeragam() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const {
    data,
    memuat: memuatOutfits,
    galat: galatOutfits,
    muatUlang: muatOutfits,
  } = useMuat<{
    outfits: Outfit[];
    summary: {
      total: number;
      siap: number;
      belumSiap: number;
      perStatus: Record<StatusBusana, number>;
      estimatedCost: number;
    };
  }>(planId ? `/api/plans/${planId}/outfits` : null, {
    aktif: Boolean(planId),
  });

  const [filterPemilik, setFilterPemilik] = useState<string>("semua");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<Outfit | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<Outfit | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  // Form states
  const [formNama, setFormNama] = useState("");
  const [formPemilik, setFormPemilik] = useState<PemilikBusana>("pengantinWanita");
  const [formStatus, setFormStatus] = useState<StatusBusana>("belum");
  const [formUkur, setFormUkur] = useState("");
  const [formAmbil, setFormAmbil] = useState("");
  const [formBiaya, setFormBiaya] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormNama("");
    setFormPemilik("pengantinWanita");
    setFormStatus("belum");
    setFormUkur("");
    setFormAmbil("");
    setFormBiaya("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(o: Outfit) {
    setDiedit(o);
    setFormNama(o.itemName);
    setFormPemilik(
      PEMILIK_BUSANA.includes(o.owner as PemilikBusana)
        ? (o.owner as PemilikBusana)
        : "pengantinWanita",
    );
    setFormStatus(
      STATUS_BUSANA.includes(o.status as StatusBusana)
        ? (o.status as StatusBusana)
        : "belum",
    );
    setFormUkur(o.measureDate ?? "");
    setFormAmbil(o.pickupDate ?? "");
    setFormBiaya(o.estimatedCost ? String(o.estimatedCost) : "");
    setFormCatatan(o.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function ubahStatusCepat(o: Outfit, statusBaru: StatusBusana) {
    if (!planId) return;
    try {
      await minta(`/api/plans/${planId}/outfits/${o.id}`, {
        method: "PATCH",
        body: { status: statusBaru },
      });
      toast(`Status busana diubah jadi ${LABEL_STATUS_BUSANA[statusBaru]}`);
      await muatOutfits();
    } catch (err) {
      toast(pesanGalat(err));
    }
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formNama.trim()) {
      setFormGalat("Nama busana wajib diisi.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    const angkaBiaya = formBiaya ? parseInt(formBiaya.replace(/\D/g, ""), 10) : null;

    try {
      const payload = {
        itemName: formNama.trim(),
        owner: formPemilik,
        status: formStatus,
        measureDate: formUkur || null,
        pickupDate: formAmbil || null,
        estimatedCost: isNaN(angkaBiaya as number) ? null : angkaBiaya,
        notes: formCatatan.trim() || null,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/outfits/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Busana diperbarui");
      } else {
        await minta(`/api/plans/${planId}/outfits`, {
          method: "POST",
          body: payload,
        });
        toast("Busana ditambahkan");
      }

      setLembarBuka(false);
      await muatOutfits();
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
      await minta(`/api/plans/${planId}/outfits/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Busana dihapus");
      setDihapus(null);
      await muatOutfits();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  const rawDaftar = data?.outfits ?? [];
  const summary = data?.summary;

  const daftar = rawDaftar.filter((o) => {
    if (filterPemilik !== "semua" && o.owner !== filterPemilik) return false;
    if (filterStatus !== "semua" && o.status !== filterStatus) return false;
    return true;
  });

  if (memuatPlan || (planId && memuatOutfits && !data)) {
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

  if (galatOutfits) {
    return <Gagal apa="Daftar busana & seragam" onCoba={muatOutfits} />;
  }

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Busana & Seragam</h1>
          <p>Catatan ukuran, tenggat jahit, dan jadwal ambil baju pengantin serta keluarga.</p>
        </div>
        <div>
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            + Tambah busana
          </button>
        </div>
      </div>

      <TabRencana />

      {summary && summary.total > 0 ? (
        <div className="rekap" style={{ marginBottom: 16 }}>
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.total}</span>
            <span className="rekap-label">Total busana</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
              {summary.siap}
            </span>
            <span className="rekap-label">Sudah siap</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: "var(--color-bata)" }}>
              {summary.belumSiap}
            </span>
            <span className="rekap-label">Belum siap</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ fontSize: "var(--text-h3)" }}>
              <Rupiah nilai={summary.estimatedCost} />
            </span>
            <span className="rekap-label">Perkiraan biaya</span>
          </div>
        </div>
      ) : null}

      {/* Filter Bar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px" }}>
          <label htmlFor="filterPemilik" style={{ fontSize: "var(--text-kecil)", fontWeight: 600 }}>
            Pemilik:
          </label>
          <select
            id="filterPemilik"
            className="isian"
            style={{ padding: "6px 10px", fontSize: "var(--text-kecil)" }}
            value={filterPemilik}
            onChange={(e) => setFilterPemilik(e.target.value)}
          >
            <option value="semua">Semua pemilik ({rawDaftar.length})</option>
            {PEMILIK_BUSANA.map((p) => {
              const jml = rawDaftar.filter((o) => o.owner === p).length;
              return (
                <option key={p} value={p}>
                  {LABEL_PEMILIK_BUSANA[p]} ({jml})
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px" }}>
          <label htmlFor="filterStatus" style={{ fontSize: "var(--text-kecil)", fontWeight: 600 }}>
            Status:
          </label>
          <select
            id="filterStatus"
            className="isian"
            style={{ padding: "6px 10px", fontSize: "var(--text-kecil)" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua status</option>
            {STATUS_BUSANA.map((s) => (
              <option key={s} value={s}>
                {LABEL_STATUS_BUSANA[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rawDaftar.length === 0 ? (
        <Kosong
          keadaan="Belum ada catatan busana atau seragam."
          jalanKeluar="Catat kebaya pengantin, beskap bapak, seragam bridesmaid, atau crew."
        >
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            Tambah busana pertama
          </button>
        </Kosong>
      ) : daftar.length === 0 ? (
        <Kosong
          keadaan="Tidak ada busana yang sesuai filter."
          jalanKeluar="Coba ubah pilihan pemilik atau status di atas."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {daftar.map((o) => {
            const statusBusana = o.status as StatusBusana;
            const pemilikBusana = o.owner as PemilikBusana;

            return (
              <div
                key={o.id}
                className="kartu"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  borderColor:
                    statusBusana === "siap" ? "var(--color-primary)" : undefined,
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
                    <h2 style={{ margin: "0 0 6px 0", fontSize: "var(--text-h3)" }}>
                      {o.itemName}
                    </h2>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "var(--text-kecil)",
                          background: "var(--color-netral)",
                          color: "var(--color-ink)",
                          fontWeight: 500,
                        }}
                      >
                        {LABEL_PEMILIK_BUSANA[pemilikBusana] ?? o.owner}
                      </span>

                      {/* Dropdown status cepat */}
                      <select
                        aria-label="Ubah status busana"
                        value={o.status}
                        onChange={(e) =>
                          ubahStatusCepat(o, e.target.value as StatusBusana)
                        }
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "var(--text-kecil)",
                          fontWeight: 600,
                          border: "1px solid var(--color-garis)",
                          background:
                            statusBusana === "siap"
                              ? "var(--color-netral)"
                              : "var(--color-kertas)",
                          color:
                            statusBusana === "siap"
                              ? "var(--color-primary)"
                              : "var(--color-ink)",
                          cursor: "pointer",
                        }}
                      >
                        {STATUS_BUSANA.map((s) => (
                          <option key={s} value={s}>
                            {LABEL_STATUS_BUSANA[s]}
                          </option>
                        ))}
                      </select>

                      {o.estimatedCost ? (
                        <span
                          style={{
                            fontSize: "var(--text-kecil)",
                            fontWeight: 600,
                            color: "var(--color-primary)",
                          }}
                        >
                          <Rupiah nilai={o.estimatedCost} />
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="tombol tombol-sekunder"
                      style={{ minHeight: 44, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                      onClick={() => bukaUbah(o)}
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      className="tombol tombol-sekunder"
                      style={{
                        padding: "0 10px",
                        fontSize: "var(--text-kecil)",
                        color: "var(--color-bata)",
                      }}
                      onClick={() => setDihapus(o)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Info Tanggal Ukur & Ambil */}
                {(o.measureDate || o.pickupDate || o.notes) && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: "var(--text-kecil)",
                      color: "var(--color-muted)",
                      borderTop: "1px solid var(--color-garis)",
                      paddingTop: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {o.measureDate ? (
                        <div>
                          <strong>Ukur:</strong> {formatTanggalId(o.measureDate)}
                        </div>
                      ) : null}
                      {o.pickupDate ? (
                        <div>
                          <strong style={{ color: "var(--color-ink)" }}>Jadwal ambil:</strong>{" "}
                          <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                            {formatTanggalId(o.pickupDate)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {o.notes ? (
                      <div style={{ color: "var(--color-ink)", fontStyle: "italic" }}>
                        &ldquo;{o.notes}&rdquo;
                      </div>
                    ) : null}
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
        judul={diedit ? "Ubah data busana" : "Tambah busana baru"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Nama busana / seragam" id="formNama" galat={formGalat ?? undefined}>
            <input
              id="formNama"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Kebaya Akad Pengantin Wanita"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Pemilik / pemakai"
            id="formPemilik"
            nilai={formPemilik}
            onUbah={(v) => setFormPemilik(v as PemilikBusana)}
            opsi={PEMILIK_BUSANA.map((p) => ({
              nilai: p,
              label: LABEL_PEMILIK_BUSANA[p],
            }))}
          />

          <Pilih
            label="Status pengerjaan"
            id="formStatus"
            nilai={formStatus}
            onUbah={(v) => setFormStatus(v as StatusBusana)}
            opsi={STATUS_BUSANA.map((s) => ({
              nilai: s,
              label: LABEL_STATUS_BUSANA[s],
            }))}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Isian label="Tanggal ukur badan" id="formUkur">
              <input
                id="formUkur"
                className="isian"
                type="date"
                value={formUkur}
                onChange={(e) => setFormUkur(e.target.value)}
              />
            </Isian>

            <Isian label="Target tanggal ambil" id="formAmbil">
              <input
                id="formAmbil"
                className="isian"
                type="date"
                value={formAmbil}
                onChange={(e) => setFormAmbil(e.target.value)}
              />
            </Isian>
          </div>

          <Isian label="Perkiraan biaya (Rp)" id="formBiaya">
            <input
              id="formBiaya"
              className="isian"
              type="number"
              min={0}
              placeholder="Contoh: 1500000"
              value={formBiaya}
              onChange={(e) => setFormBiaya(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan tambahan (opsional)" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Contoh: Warna sage green, bahan brokat, diambil di butik Melati."
              value={formCatatan}
              onChange={(e) => setFormCatatan(e.target.value)}
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
              disabled={sedangSimpan}
            >
              {sedangSimpan ? "Menyimpan..." : "Simpan busana"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus catatan busana ini?"
        isi={`Busana "${dihapus?.itemName ?? ""}" akan dihapus dari rencana.`}
        tombolYa="Ya, hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
