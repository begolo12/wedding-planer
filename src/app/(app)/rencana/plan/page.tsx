"use client";

import { useState, useEffect } from "react";
import { usePlan } from "@/lib/use-plan";
import { TabRencana } from "@/components/tab-rencana";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import { STATUS_PLAN, type StatusPlan, LABEL_STATUS_PLAN } from "@/lib/konstanta";
import { tanggalPanjangDari } from "@/lib/format";

/**
 * Layar Pengaturan Rencana Pernikahan.
 * Memperbarui data pasangan, tanggal pernikahan, status, atau membuat rencana baru.
 */
export default function HalamanPlan() {
  const { plan, planId, memuat, galat, muatUlang, daftarPlan, pilihPlan } = usePlan();

  // State form edit
  const [partnerName, setPartnerName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [status, setStatus] = useState<StatusPlan>("perencanaan");
  const [notes, setNotes] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [formGalat, setFormGalat] = useState<string | null>(null);

  // State tambah plan baru
  const [bukaBaru, setBukaBaru] = useState(false);
  const [baruPartner, setBaruPartner] = useState("");
  const [baruTanggal, setBaruTanggal] = useState("");
  const [baruCatatan, setBaruCatatan] = useState("");
  const [sedangBuatBaru, setSedangBuatBaru] = useState(false);
  const [galatBaru, setGalatBaru] = useState<string | null>(null);

  // State hapus plan
  const [bukaHapus, setBukaHapus] = useState(false);
  const [sedangHapus, setSedangHapus] = useState(false);

  useEffect(() => {
    if (plan) {
      setPartnerName(plan.partnerName ?? "");
      setWeddingDate(plan.weddingDate ?? "");
      setStatus(
        STATUS_PLAN.includes(plan.status as StatusPlan)
          ? (plan.status as StatusPlan)
          : "perencanaan",
      );
      setNotes(plan.notes ?? "");
    }
  }, [plan]);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!partnerName.trim()) {
      setFormGalat("Nama pasangan wajib diisi.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      await minta(`/api/plans/${planId}`, {
        method: "PATCH",
        body: {
          partnerName: partnerName.trim(),
          weddingDate: weddingDate || null,
          status,
          notes: notes.trim() || null,
        },
      });
      toast("Rencana pernikahan berhasil disimpan");
      await muatUlang();
    } catch (err) {
      setFormGalat(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
    }
  }

  async function handleBuatBaru(e: React.FormEvent) {
    e.preventDefault();
    if (!baruPartner.trim()) {
      setGalatBaru("Nama pasangan wajib diisi.");
      return;
    }

    setSedangBuatBaru(true);
    setGalatBaru(null);

    try {
      const hasil = await minta<{ plan: { id: string } }>("/api/plans", {
        method: "POST",
        body: {
          partnerName: baruPartner.trim(),
          weddingDate: baruTanggal || null,
          notes: baruCatatan.trim() || null,
        },
      });

      toast("Rencana baru berhasil dibuat");
      setBukaBaru(false);
      setBaruPartner("");
      setBaruTanggal("");
      setBaruCatatan("");
      pilihPlan(hasil.plan.id);
      await muatUlang();
    } catch (err) {
      setGalatBaru(pesanGalat(err));
    } finally {
      setSedangBuatBaru(false);
    }
  }

  async function handleHapus() {
    if (!planId) return;
    setSedangHapus(true);
    try {
      await minta(`/api/plans/${planId}`, {
        method: "DELETE",
      });
      toast("Rencana pernikahan berhasil dihapus");
      setBukaHapus(false);
      await muatUlang();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  if (memuat) {
    return <Kerangka baris={5} />;
  }

  if (galat) {
    return <Gagal apa="Rencana pernikahan" onCoba={muatUlang} />;
  }

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Rencana Pernikahan</h1>
          <p>Kelola data nama pasangan, tanggal utama, dan status persiapan.</p>
        </div>
        <div>
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={() => {
              setBukaBaru(true);
              setGalatBaru(null);
            }}
          >
            + Rencana baru
          </button>
        </div>
      </div>

      <TabRencana />

      {/* Switcher jika ada lebih dari 1 rencana */}
      {daftarPlan.length > 1 ? (
        <div className="kartu" style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Pilih rencana aktif:
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {daftarPlan.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tombol ${p.id === planId ? "tombol-utama" : "tombol-sekunder"}`}
                style={{ fontSize: "var(--text-kecil)", minHeight: 44 }}
                onClick={() => pilihPlan(p.id)}
              >
                {p.partnerName} {p.weddingDate ? `(${p.weddingDate})` : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!plan ? (
        <Kosong
          keadaan="Belum ada rencana pernikahan."
          jalanKeluar="Buat rencana pernikahan pertamamu untuk mulai mencatat tugas, anggaran, dan vendor."
        >
          <button
            type="button"
            className="tombol tombol-utama"
            onClick={() => setBukaBaru(true)}
          >
            Buat rencana sekarang
          </button>
        </Kosong>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 640 }}>
          <form
            onSubmit={handleSimpan}
            noValidate
            className="kartu"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <h2 style={{ margin: 0, fontSize: "var(--text-h2)" }}>Detail Rencana</h2>

            {formGalat ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 4,
                  background: "var(--color-kertas)",
                  color: "var(--color-bata)",
                  border: "1px solid var(--color-bata)",
                  fontSize: "var(--text-kecil)",
                }}
              >
                {formGalat}
              </div>
            ) : null}

            <Isian
              label="Nama Pasangan (Mempelai)"
              id="partnerName"
              petunjuk="Contoh: Budi & Siti, atau nama kedua mempelai."
            >
              <input
                id="partnerName"
                className="isian"
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </Isian>

            <Isian
              label="Tanggal Utama Pernikahan"
              id="weddingDate"
              petunjuk={weddingDate ? tanggalPanjangDari(weddingDate) : "Pilih tanggal pernikahan"}
            >
              <input
                id="weddingDate"
                className="isian"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </Isian>

            <Pilih
              label="Status Persiapan"
              id="status"
              nilai={status}
              onUbah={(v) => setStatus(v as StatusPlan)}
              opsi={STATUS_PLAN.map((s) => ({ nilai: s, label: LABEL_STATUS_PLAN[s] }))}
            />

            <Isian label="Catatan atau tema pernikahan" id="notes">
              <textarea
                id="notes"
                className="isian"
                rows={3}
                placeholder="Catatan tambahan seputar konsep, warna tema, atau catatan keluarga."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Isian>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <button
                type="button"
                className="tombol tombol-sekunder"
                style={{ color: "var(--color-bata)" }}
                onClick={() => setBukaHapus(true)}
              >
                Hapus rencana
              </button>
              <button
                type="submit"
                className="tombol tombol-utama"
                disabled={sedangSimpan}
              >
                {sedangSimpan ? "Menyimpan..." : "Simpan perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lembar Buat Rencana Baru */}
      <Lembar
        buka={bukaBaru}
        judul="Buat rencana pernikahan baru"
        onTutup={() => setBukaBaru(false)}
      >
        <form onSubmit={handleBuatBaru} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {galatBaru ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 4,
                background: "var(--color-kertas)",
                color: "var(--color-bata)",
                border: "1px solid var(--color-bata)",
                fontSize: "var(--text-kecil)",
              }}
            >
              {galatBaru}
            </div>
          ) : null}

          <Isian label="Nama pasangan" id="baruPartner" petunjuk="Contoh: Budi & Siti">
            <input
              id="baruPartner"
              className="isian"
              type="text"
              required
              placeholder="Budi & Siti"
              value={baruPartner}
              onChange={(e) => setBaruPartner(e.target.value)}
            />
          </Isian>

          <Isian label="Tanggal pernikahan" id="baruTanggal">
            <input
              id="baruTanggal"
              className="isian"
              type="date"
              value={baruTanggal}
              onChange={(e) => setBaruTanggal(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan pembuka" id="baruCatatan">
            <textarea
              id="baruCatatan"
              className="isian"
              rows={3}
              placeholder="Catatan konsep atau rencana awal."
              value={baruCatatan}
              onChange={(e) => setBaruCatatan(e.target.value)}
            />
          </Isian>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setBukaBaru(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="tombol tombol-utama"
              disabled={sedangBuatBaru}
            >
              {sedangBuatBaru ? "Membuat..." : "Buat rencana"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus Rencana */}
      <DialogKonfirmasi
        buka={bukaHapus}
        judul="Hapus rencana pernikahan ini?"
        isi={`Rencana "${plan?.partnerName ?? ""}" beserta seluruh data tugas, anggaran, tamu, dan rundown di dalamnya akan dihapus.`}
        tombolYa="Ya, hapus rencana"
        sedangJalan={sedangHapus}
        onTutup={() => setBukaHapus(false)}
        onYa={handleHapus}
      />
    </div>
  );
}
