"use client";

import { useState, useEffect } from "react";
import { usePlan } from "@/lib/use-plan";
import { useStatusLuring } from "@/lib/status-luring";
import { TabRencana } from "@/components/tab-rencana";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import { STATUS_PLAN, type StatusPlan, LABEL_STATUS_PLAN } from "@/lib/konstanta";
import { tanggalPanjangDari, tanggalPendekDari } from "@/lib/format";

/**
 * Layar Pengaturan Rencana Pernikahan.
 * Memperbarui data pasangan, tanggal pernikahan, status, atau membuat rencana baru.
 */
export default function HalamanPlan() {
  const { plan, planId, memuat, galat, muatUlang, daftarPlan, pilihPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

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
      toast("Tersimpan");
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

      toast("Tersimpan");
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
      toast("Dihapus");
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
    <div className="tumpuk-sedang">
      <div className="kepala-halaman">
        <div>
          <h1>Rencana Pernikahan</h1>
          <p>Kelola data nama pasangan, tanggal utama, dan status persiapan.</p>
        </div>
        <div>
          {bisaUbah ? (
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
          ) : null}
        </div>
      </div>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Mengubah data rencana tidak bisa dilakukan
          sampai ada koneksi.
        </p>
      ) : null}

      <TabRencana />

      {/* Switcher jika ada lebih dari 1 rencana */}
      {daftarPlan.length > 1 ? (
        <section className="kartu tumpuk-rapat">
          <span className="label-bagian">Pilih rencana aktif</span>
          <div className="aksi-baris">
            {daftarPlan.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tombol tombol-kecil ${p.id === planId ? "tombol-utama" : "tombol-sekunder"}`}
                onClick={() => pilihPlan(p.id)}
              >
                {p.partnerName} {p.weddingDate ? `(${tanggalPendekDari(p.weddingDate)})` : ""}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!plan ? (
        <Kosong
          keadaan="Belum ada rencana pernikahan."
          jalanKeluar="Buat rencana pernikahan pertamamu untuk mulai mencatat tugas, anggaran, dan vendor."
        >
          {bisaUbah ? (
            <button
              type="button"
              className="tombol tombol-utama"
              onClick={() => setBukaBaru(true)}
            >
              Buat rencana sekarang
            </button>
          ) : null}
        </Kosong>
      ) : (
        <div className="rencana-plan">
          <form onSubmit={handleSimpan} noValidate className="kartu tumpuk-sedang">
            <h2>Detail Rencana</h2>

            {formGalat ? (
              <p className="peringatan peringatan-bahaya">{formGalat}</p>
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

            <div className="bagian-kepala">
              {bisaUbah ? (
                <>
                  <button
                    type="button"
                    className="tombol tombol-bahaya"
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
                </>
              ) : null}
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
        <form onSubmit={handleBuatBaru} noValidate className="tumpuk-sedang">
          {galatBaru ? (
            <p className="peringatan peringatan-bahaya">{galatBaru}</p>
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

          <div className="dialog-tombol">
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
        judul="Hapus rencana"
        isi={`Rencana "${plan?.partnerName ?? ""}" beserta seluruh data tugas, anggaran, tamu, dan rundown di dalamnya akan dihapus.`}
        tombolYa="Hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setBukaHapus(false)}
        onYa={handleHapus}
      />
    </div>
  );
}
