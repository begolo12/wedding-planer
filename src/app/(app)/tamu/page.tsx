"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  KATEGORI_TAMU,
  STATUS_HADIR,
  type KategoriTamu,
  type StatusHadir,
  LABEL_KATEGORI_TAMU,
  LABEL_STATUS_HADIR,
} from "@/lib/konstanta";
import type { guests } from "@/db/schema";

type Guest = typeof guests.$inferSelect;

/**
 * Layar Daftar Tamu Undangan.
 * Menghitung jumlah orang dan kursi yang pasti disiapkan.
 * Bisa menandai status kirim undangan dan konfirmasi kehadiran langsung.
 */
export default function HalamanTamu() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const [cari, setCari] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [filterRsvp, setFilterRsvp] = useState<string>("semua");

  // Build query string
  const queryParams = new URLSearchParams();
  if (filterKategori !== "semua") queryParams.set("category", filterKategori);
  if (filterRsvp !== "semua") queryParams.set("rsvpStatus", filterRsvp);
  if (cari.trim()) queryParams.set("search", cari.trim());

  const urlApi = planId
    ? `/api/plans/${planId}/guests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    : null;

  const {
    data,
    memuat: memuatTamu,
    galat: galatTamu,
    muatUlang: muatTamu,
  } = useMuat<{
    guests: Guest[];
    summary: {
      baris: number;
      orang: number;
      kursi: number;
      tidakHadir: number;
      belumKonfirmasi: number;
      belumDiundang: number;
      perkiraanMaksimal: number;
    };
  }>(urlApi, {
    aktif: Boolean(planId),
  });

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<Guest | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<Guest | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  // Form states
  const [formNama, setFormNama] = useState("");
  const [formHp, setFormHp] = useState("");
  const [formKategori, setFormKategori] = useState<KategoriTamu>("teman");
  const [formSisi, setFormSisi] = useState("");
  const [formRsvp, setFormRsvp] = useState<StatusHadir>("belum");
  const [formJumlah, setFormJumlah] = useState(1);
  const [formMeja, setFormMeja] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormNama("");
    setFormHp("");
    setFormKategori("teman");
    setFormSisi("");
    setFormRsvp("belum");
    setFormJumlah(1);
    setFormMeja("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(t: Guest) {
    setDiedit(t);
    setFormNama(t.name);
    setFormHp(t.phone ?? "");
    setFormKategori(
      KATEGORI_TAMU.includes(t.category as KategoriTamu)
        ? (t.category as KategoriTamu)
        : "lainnya",
    );
    setFormSisi(t.side ?? "");
    setFormRsvp(
      STATUS_HADIR.includes(t.rsvpStatus as StatusHadir)
        ? (t.rsvpStatus as StatusHadir)
        : "belum",
    );
    setFormJumlah(t.guestCount);
    setFormMeja(t.tableName ?? "");
    setFormCatatan(t.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function toggleUndangan(t: Guest) {
    if (!planId) return;
    try {
      await minta(`/api/plans/${planId}/guests/${t.id}`, {
        method: "POST",
      });
      toast(
        t.invitedAt
          ? "Status undangan diubah jadi belum dikirim"
          : "Undangan ditandai sudah dikirim",
      );
      await muatTamu();
    } catch (err) {
      toast(pesanGalat(err));
    }
  }

  async function ubahRsvpCepat(t: Guest, status: StatusHadir) {
    if (!planId) return;
    try {
      await minta(`/api/plans/${planId}/guests/${t.id}`, {
        method: "PATCH",
        body: { rsvpStatus: status },
      });
      toast(`Kehadiran diubah jadi ${LABEL_STATUS_HADIR[status]}`);
      await muatTamu();
    } catch (err) {
      toast(pesanGalat(err));
    }
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formNama.trim()) {
      setFormGalat("Nama tamu wajib diisi.");
      return;
    }

    if (formJumlah < 0) {
      setFormGalat("Jumlah orang tidak boleh kurang dari nol.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        name: formNama.trim(),
        phone: formHp.trim() || null,
        category: formKategori,
        side: formSisi.trim() || null,
        rsvpStatus: formRsvp,
        guestCount: formJumlah,
        tableName: formMeja.trim() || null,
        notes: formCatatan.trim() || null,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/guests/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Data tamu diperbarui");
      } else {
        await minta(`/api/plans/${planId}/guests`, {
          method: "POST",
          body: payload,
        });
        toast("Tamu berhasil ditambahkan");
      }

      setLembarBuka(false);
      await muatTamu();
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
      await minta(`/api/plans/${planId}/guests/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Tamu dihapus dari daftar");
      setDihapus(null);
      await muatTamu();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  const rawGuests = data?.guests ?? [];
  const summary = data?.summary;

  if (memuatPlan || (planId && memuatTamu && !data)) {
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

  if (galatTamu) {
    return <Gagal apa="Daftar tamu" onCoba={muatTamu} />;
  }

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Daftar Tamu</h1>
          <p>Kelola undangan fisik maupun digital, hitung perkiraan kursi, dan pantau RSVP.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="tombol tombol-sekunder" href="/tamu/impor">
            Tempel daftar (Impor)
          </Link>
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            + Tambah tamu
          </button>
        </div>
      </div>

      {/* Ringkasan Tamu */}
      {summary && summary.baris > 0 ? (
        <div className="rekap" style={{ marginBottom: 16 }}>
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.orang}</span>
            <span className="rekap-label">Total tamu ({summary.baris} undangan)</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
              {summary.kursi}
            </span>
            <span className="rekap-label">Pasti hadir (kursi)</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.belumKonfirmasi}</span>
            <span className="rekap-label">Belum konfirmasi</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: "var(--color-bata)" }}>
              {summary.belumDiundang}
            </span>
            <span className="rekap-label">Undangan belum dikirim</span>
          </div>
        </div>
      ) : null}

      {/* Filter & Pencarian */}
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
        <div style={{ flex: "1 1 200px" }}>
          <input
            type="search"
            className="isian"
            placeholder="Cari nama atau nomor HP..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 1 180px" }}>
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
            {KATEGORI_TAMU.map((k) => (
              <option key={k} value={k}>
                {LABEL_KATEGORI_TAMU[k]}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 1 180px" }}>
          <label htmlFor="filterRsvp" style={{ fontSize: "var(--text-kecil)", fontWeight: 600 }}>
            Kehadiran:
          </label>
          <select
            id="filterRsvp"
            className="isian"
            style={{ padding: "6px 10px", fontSize: "var(--text-kecil)" }}
            value={filterRsvp}
            onChange={(e) => setFilterRsvp(e.target.value)}
          >
            <option value="semua">Semua kehadiran</option>
            {STATUS_HADIR.map((s) => (
              <option key={s} value={s}>
                {LABEL_STATUS_HADIR[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List / Table Tamu */}
      {rawGuests.length === 0 ? (
        <Kosong
          keadaan="Belum ada data tamu undangan."
          jalanKeluar="Tambah satu per satu atau tempel langsung daftar tamu dari WhatsApp / spreadsheet."
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="tombol tombol-utama" href="/tamu/impor">
              Tempel daftar (Impor)
            </Link>
            <button type="button" className="tombol tombol-sekunder" onClick={bukaTambah}>
              Tambah satu tamu
            </button>
          </div>
        </Kosong>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rawGuests.map((t) => {
            const kategori = t.category as KategoriTamu;
            const statusRsvp = t.rsvpStatus as StatusHadir;
            const sudahDikirim = Boolean(t.invitedAt);

            return (
              <div
                key={t.id}
                className="kartu"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  padding: "12px 16px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200, flex: "1 1 auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--text-dasar)" }}>
                      {t.name}
                    </span>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: "var(--text-kecil)",
                        background: "var(--color-netral)",
                        color: "var(--color-ink)",
                      }}
                    >
                      {t.guestCount} orang
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-kecil)",
                        color: "var(--color-muted)",
                      }}
                    >
                      ({LABEL_KATEGORI_TAMU[kategori] ?? t.category})
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                    {t.side ? <span>Pihak: {t.side}</span> : null}
                    {t.tableName ? <span>Meja: <strong>{t.tableName}</strong></span> : null}
                    {t.phone ? (
                      <a
                        href={`https://wa.me/${t.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--color-primary)", textDecoration: "underline" }}
                      >
                        WA: {t.phone}
                      </a>
                    ) : null}
                    {t.notes ? <span style={{ fontStyle: "italic" }}>&ldquo;{t.notes}&rdquo;</span> : null}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {/* Status Undangan Kirim Button */}
                  <button
                    type="button"
                    className="tombol tombol-sekunder"
                    style={{
                      minHeight: 34,
                      padding: "0 10px",
                      fontSize: "var(--text-kecil)",
                      background: sudahDikirim ? "var(--color-netral)" : "var(--color-kertas)",
                      color: sudahDikirim ? "var(--color-primary)" : "var(--color-muted)",
                      borderColor: sudahDikirim ? "var(--color-primary)" : "var(--color-garis)",
                    }}
                    onClick={() => toggleUndangan(t)}
                  >
                    {sudahDikirim ? "✓ Undangan terkirim" : "Belum diundang"}
                  </button>

                  {/* Dropdown status RSVP */}
                  <select
                    aria-label="Ubah konfirmasi kehadiran"
                    value={t.rsvpStatus}
                    onChange={(e) =>
                      ubahRsvpCepat(t, e.target.value as StatusHadir)
                    }
                    style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: "var(--text-kecil)",
                      border: "1px solid var(--color-garis)",
                      background:
                        statusRsvp === "hadir"
                          ? "var(--color-netral)"
                          : statusRsvp === "tidak"
                            ? "var(--color-kertas)"
                            : "var(--color-kertas)",
                      color:
                        statusRsvp === "hadir"
                          ? "var(--color-primary)"
                          : statusRsvp === "tidak"
                            ? "var(--color-bata)"
                            : "var(--color-ink)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {STATUS_HADIR.map((s) => (
                      <option key={s} value={s}>
                        {LABEL_STATUS_HADIR[s]}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="tombol tombol-sekunder"
                    style={{ minHeight: 34, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                    onClick={() => bukaUbah(t)}
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
                    onClick={() => setDihapus(t)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lembar Tambah / Ubah Tamu */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah data tamu" : "Tambah satu tamu"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Nama tamu / perwakilan" id="formNama" galat={formGalat ?? undefined}>
            <input
              id="formNama"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Bpk. Bambang & Keluarga"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
          </Isian>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Pilih
              label="Kategori"
              id="formKategori"
              nilai={formKategori}
              onUbah={(v) => setFormKategori(v as KategoriTamu)}
              opsi={KATEGORI_TAMU.map((k) => ({
                nilai: k,
                label: LABEL_KATEGORI_TAMU[k],
              }))}
            />

            <Isian label="Jumlah orang / kursi" id="formJumlah">
              <input
                id="formJumlah"
                className="isian"
                type="number"
                min={1}
                max={50}
                required
                value={formJumlah}
                onChange={(e) => setFormJumlah(Math.max(1, parseInt(e.target.value || "1", 10)))}
              />
            </Isian>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Isian label="Nomor HP / WhatsApp" id="formHp">
              <input
                id="formHp"
                className="isian"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={formHp}
                onChange={(e) => setFormHp(e.target.value)}
              />
            </Isian>

            <Isian label="Pihak / Sisi keluarga" id="formSisi">
              <input
                id="formSisi"
                className="isian"
                type="text"
                placeholder="Contoh: Pria / Wanita / Bersama"
                value={formSisi}
                onChange={(e) => setFormSisi(e.target.value)}
              />
            </Isian>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Pilih
              label="Status kehadiran (RSVP)"
              id="formRsvp"
              nilai={formRsvp}
              onUbah={(v) => setFormRsvp(v as StatusHadir)}
              opsi={STATUS_HADIR.map((s) => ({
                nilai: s,
                label: LABEL_STATUS_HADIR[s],
              }))}
            />

            <Isian label="Alokasi meja (opsional)" id="formMeja">
              <input
                id="formMeja"
                className="isian"
                type="text"
                placeholder="Contoh: Meja VIP 1"
                value={formMeja}
                onChange={(e) => setFormMeja(e.target.value)}
              />
            </Isian>
          </div>

          <Isian label="Catatan khusus (opsional)" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={2}
              placeholder="Contoh: Vegetarian, butuh kursi dekat pintu keluar"
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
              {sedangSimpan ? "Menyimpan..." : "Simpan data tamu"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus tamu ini?"
        isi={`Tamu "${dihapus?.name ?? ""}" akan dihapus dari daftar undangan.`}
        tombolYa="Ya, hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
