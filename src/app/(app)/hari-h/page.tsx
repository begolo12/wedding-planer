"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import type { rundownItems } from "@/db/schema";

type RundownItem = typeof rundownItems.$inferSelect;

type UkuranFont = "kecil" | "sedang" | "besar";

const TEMPLATE_RUNDOWN_INDONESIA = [
  { startTime: "06:00", durationMinutes: 60, title: "Persiapan & Rias Pengantin", location: "Kamar Rias / Hotel", picName: "MUA & Keluarga Inti", notes: "Pastikan sarapan pagi sudah disediakan untuk pengantin dan MUA." },
  { startTime: "07:30", durationMinutes: 60, title: "Akad Nikah / Pemberkatan", location: "Masjid / Gereja / Venue", picName: "Penghulu / Pemuka Agama", notes: "Saksi nikah dan wali siap di tempat 15 menit sebelum acara." },
  { startTime: "08:45", durationMinutes: 45, title: "Sungkeman & Foto Bersama Keluarga", location: "Pelaminan / Area Utama", picName: "MC & Fotografer", notes: "Utamakan orang tua, kakek/nenek, dan saudara kandung." },
  { startTime: "10:00", durationMinutes: 120, title: "Resepsi & Ramah Tamah", location: "Grand Ballroom / Venue", picName: "WO / Koordinator Acara", notes: "Catering mulai siap saji, musik akustik mulai mengiringi." },
  { startTime: "12:00", durationMinutes: 30, title: "Lempar Bunga & Sesi Foto Bebas", location: "Pelaminan", picName: "MC", notes: "Ajak seluruh sahabat dan tamu muda berkumpul di depan pelaminan." },
  { startTime: "13:00", durationMinutes: 60, title: "Penutupan & Beres-Beres", location: "Venue Acara", picName: "Keluarga & Vendor", notes: "Cek barang bawaan keluarga, mahar, dan titipan kado sebelum pulang." },
];

/**
 * Layar Hari-H: Rundown & Jadwal Acara.
 * Layar yang paling sering dibuka di lokasi acara, bisa diatur ukuran fontnya
 * agar terbaca dari jarak jauh, dan tetap informatif saat sinyal lemah.
 */
export default function HalamanHariH() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const urlApi = planId ? `/api/plans/${planId}/rundown` : null;
  const {
    data,
    memuat: memuatRundown,
    galat: galatRundown,
    muatUlang: muatRundown,
  } = useMuat<{ rundown: RundownItem[] }>(urlApi, {
    aktif: Boolean(planId),
  });

  const [ukuranFont, setUkuranFont] = useState<UkuranFont>("sedang");

  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem("ukuran-font-rundown");
      if (tersimpan === "kecil" || tersimpan === "sedang" || tersimpan === "besar") {
        setUkuranFont(tersimpan);
      }
    } catch {
      // Abaikan jika localStorage tidak aktif
    }
  }, []);

  function gantiUkuran(u: UkuranFont) {
    setUkuranFont(u);
    try {
      localStorage.setItem("ukuran-font-rundown", u);
    } catch {
      // Abaikan
    }
  }

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<RundownItem | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<RundownItem | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);
  const [sedangPasangTemplate, setSedangPasangTemplate] = useState(false);

  // Form inputs
  const [formJudul, setFormJudul] = useState("");
  const [formJam, setFormJam] = useState("08:00");
  const [formDurasi, setFormDurasi] = useState<string>("60");
  const [formLokasi, setFormLokasi] = useState("");
  const [formPic, setFormPic] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormJudul("");
    setFormJam("08:00");
    setFormDurasi("60");
    setFormLokasi("");
    setFormPic("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(item: RundownItem) {
    setDiedit(item);
    setFormJudul(item.title);
    setFormJam(item.startTime);
    setFormDurasi(item.durationMinutes ? String(item.durationMinutes) : "");
    setFormLokasi(item.location ?? "");
    setFormPic(item.picName ?? "");
    setFormCatatan(item.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formJudul.trim()) {
      setFormGalat("Nama susunan acara wajib diisi.");
      return;
    }

    if (!formJam.trim()) {
      setFormGalat("Jam mulai wajib diisi (misal 08:00).");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        title: formJudul.trim(),
        startTime: formJam.trim(),
        durationMinutes: formDurasi ? parseInt(formDurasi, 10) : undefined,
        location: formLokasi.trim() || undefined,
        picName: formPic.trim() || undefined,
        notes: formCatatan.trim() || undefined,
        sortOrder: diedit?.sortOrder ?? 0,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/rundown/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Acara rundown diperbarui");
      } else {
        await minta(`/api/plans/${planId}/rundown`, {
          method: "POST",
          body: payload,
        });
        toast("Acara baru ditambahkan ke rundown");
      }

      setLembarBuka(false);
      await muatRundown();
    } catch (err) {
      setFormGalat(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
    }
  }

  async function pasangTemplateStandar() {
    if (!planId) return;
    setSedangPasangTemplate(true);
    try {
      for (const item of TEMPLATE_RUNDOWN_INDONESIA) {
        await minta(`/api/plans/${planId}/rundown`, {
          method: "POST",
          body: item,
        });
      }
      toast("Template rundown standar berhasil dipasang");
      await muatRundown();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangPasangTemplate(false);
    }
  }

  async function konfirmasiHapus() {
    if (!planId || !dihapus) return;
    setSedangHapus(true);
    try {
      await minta(`/api/plans/${planId}/rundown/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Acara dihapus dari rundown");
      setDihapus(null);
      await muatRundown();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  const items = data?.rundown ?? [];

  if (memuatPlan || (planId && memuatRundown && !data)) {
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

  if (galatRundown) {
    return <Gagal apa="Rundown acara" onCoba={muatRundown} />;
  }

  // Pengaturan skala font
  const skalaFont = {
    kecil: {
      jam: "var(--text-kecil)",
      judul: "var(--text-dasar)",
      sub: "var(--text-kecil)",
      catatan: "var(--text-kecil)",
    },
    sedang: {
      jam: "var(--text-dasar)",
      judul: "var(--text-h3)",
      sub: "var(--text-kecil)",
      catatan: "var(--text-dasar)",
    },
    besar: {
      jam: "var(--text-h3)",
      judul: "var(--text-h2)",
      sub: "var(--text-dasar)",
      catatan: "var(--text-h3)",
    },
  }[ukuranFont];

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Rundown Hari-H</h1>
          <p>
            Susunan acara di lokasi pernikahan. Tetap bisa dibuka dan dibaca saat sinyal hilang.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={() => window.print()}
          >
            Cetak rundown
          </button>
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            + Tambah acara
          </button>
        </div>
      </div>

      {/* Pengatur Ukuran Font & Indikator Luring */}
      <div
        className="kartu"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "10px 16px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "var(--text-kecil)", fontWeight: 600 }}>Ukuran font baca:</span>
          <div style={{ display: "inline-flex", gap: 4 }}>
            <button
              type="button"
              className="tombol"
              style={{
                minHeight: 32,
                padding: "0 10px",
                fontSize: "var(--text-kecil)",
                background: ukuranFont === "kecil" ? "var(--color-primary)" : "var(--color-kertas)",
                color: ukuranFont === "kecil" ? "var(--color-kertas)" : "var(--color-ink)",
              }}
              onClick={() => gantiUkuran("kecil")}
            >
              A-
            </button>
            <button
              type="button"
              className="tombol"
              style={{
                minHeight: 32,
                padding: "0 10px",
                fontSize: "var(--text-dasar)",
                background: ukuranFont === "sedang" ? "var(--color-primary)" : "var(--color-kertas)",
                color: ukuranFont === "sedang" ? "var(--color-kertas)" : "var(--color-ink)",
              }}
              onClick={() => gantiUkuran("sedang")}
            >
              A
            </button>
            <button
              type="button"
              className="tombol"
              style={{
                minHeight: 32,
                padding: "0 10px",
                fontSize: "var(--text-h3)",
                background: ukuranFont === "besar" ? "var(--color-primary)" : "var(--color-kertas)",
                color: ukuranFont === "besar" ? "var(--color-kertas)" : "var(--color-ink)",
              }}
              onClick={() => gantiUkuran("besar")}
            >
              A+
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: "var(--text-kecil)",
              background: "var(--color-netral)",
              color: "var(--color-primary)",
              fontWeight: 600,
            }}
          >
            Siap luring (bisa dibuka tanpa sinyal)
          </span>
        </div>
      </div>

      {/* Daftar Acara Rundown */}
      {items.length === 0 ? (
        <Kosong
          keadaan="Susunan rundown masih kosong."
          jalanKeluar="Susun urutan acara satu per satu, atau pasang paket template acara pernikahan Indonesia standar."
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              className="tombol tombol-utama"
              disabled={sedangPasangTemplate}
              onClick={pasangTemplateStandar}
            >
              {sedangPasangTemplate ? "Memasang..." : "Pakai template rundown Indonesia"}
            </button>
            <button type="button" className="tombol tombol-sekunder" onClick={bukaTambah}>
              Buat manual dari awal
            </button>
          </div>
        </Kosong>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="kartu"
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr auto",
                gap: 16,
                padding: "16px",
                alignItems: "start",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              {/* Kolom Jam */}
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: skalaFont.jam,
                    color: "var(--color-primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {item.startTime}
                </div>
                {item.durationMinutes ? (
                  <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)", marginTop: 4 }}>
                    {item.durationMinutes} mnt
                  </div>
                ) : null}
              </div>

              {/* Kolom Detail Acara */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: skalaFont.judul, lineHeight: 1.3 }}>
                  {item.title}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    fontSize: skalaFont.sub,
                    color: "var(--color-muted)",
                  }}
                >
                  {item.location ? <span>Lokasi: <strong>{item.location}</strong></span> : null}
                  {item.picName ? <span>PIC: <strong>{item.picName}</strong></span> : null}
                </div>

                {item.notes ? (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "8px 12px",
                      borderRadius: 4,
                      background: "var(--color-netral)",
                      fontSize: skalaFont.catatan,
                      border: "1px dashed var(--color-garis)",
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>Catatan:</strong> {item.notes}
                  </div>
                ) : null}
              </div>

              {/* Kolom Tindakan */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          ))}
        </div>
      )}

      {/* Lembar Tambah / Ubah Acara */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah acara rundown" : "Tambah acara ke rundown"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Nama susunan acara" id="formJudul" galat={formGalat ?? undefined}>
            <input
              id="formJudul"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Akad Nikah / Ijab Kabul"
              value={formJudul}
              onChange={(e) => setFormJudul(e.target.value)}
            />
          </Isian>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Isian label="Jam mulai (WIB/WITA/WIT)" id="formJam">
              <input
                id="formJam"
                className="isian"
                type="text"
                required
                placeholder="07:30"
                value={formJam}
                onChange={(e) => setFormJam(e.target.value)}
              />
            </Isian>

            <Isian label="Estimasi durasi (menit)" id="formDurasi">
              <input
                id="formDurasi"
                className="isian"
                type="number"
                min={0}
                placeholder="60"
                value={formDurasi}
                onChange={(e) => setFormDurasi(e.target.value)}
              />
            </Isian>
          </div>

          <Isian label="Lokasi acara" id="formLokasi">
            <input
              id="formLokasi"
              className="isian"
              type="text"
              placeholder="Contoh: Masjid Al-Falah / Aula Utama"
              value={formLokasi}
              onChange={(e) => setFormLokasi(e.target.value)}
            />
          </Isian>

          <Isian label="Penanggung Jawab / PIC" id="formPic">
            <input
              id="formPic"
              className="isian"
              type="text"
              placeholder="Contoh: Pakde Hadi & Tim WO"
              value={formPic}
              onChange={(e) => setFormPic(e.target.value)}
            />
          </Isian>

          <Isian
            label="Catatan untuk crew & keluarga"
            id="formCatatan"
            bantuan="Catatan ini penting untuk koordinasi di lapangan tanpa harus bolak-balik bertanya."
          >
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Contoh: Buku nikah disiapkan saksi, mikrofon mimbar dicek sebelum penghulu mulai."
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
              {sedangSimpan ? "Menyimpan..." : "Simpan acara"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus acara ini?"
        isi={`Acara "${dihapus?.title ?? ""}" jam ${dihapus?.startTime ?? ""} akan dihapus dari rundown.`}
        tombolYa="Ya, hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
