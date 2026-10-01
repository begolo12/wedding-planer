"use client";

import { useMemo, useState } from "react";
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

type RingkasKategori = { kategori: string; baris: number; orang: number };
type RingkasMeja = { meja: string | null; baris: number; orang: number };

type RingkasanTamu = {
  baris: number;
  orang: number;
  kursi: number;
  tidakHadir: number;
  belumKonfirmasi: number;
  belumDiundang: number;
  perkiraanMaksimal: number;
  perKategori: RingkasKategori[];
  perMeja: RingkasMeja[];
};

type IsiTamu = { guests: Guest[]; summary: RingkasanTamu };

/**
 * Layar Daftar Tamu Undangan.
 * Menghitung jumlah orang dan kursi yang pasti disiapkan.
 * Bisa menandai status kirim undangan dan konfirmasi kehadiran langsung.
 *
 * Susunan mengikuti `docs/stitch_cute_wedding_planner/daftar_tamu_rsvp`.
 * Tiga hal dari rancangan itu sengaja tidak dipakai:
 * - Tombol "Bagikan Link RSVP" tidak dibuat. Belum ada portal undangan
 *   publik, jadi tombolnya akan jadi tombol mati.
 * - Angka di rancangan tidak dipakai. Semua angka dihitung dari rencana
 *   yang sedang dibuka.
 * - Kolom sesi acara dan souvenir tidak dibuat. Datanya belum ada di
 *   tabel tamu.
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
  } = useMuat<IsiTamu>(urlApi, {
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

  // Persentase konfirmasi hadir dihitung dari data nyata. Pembaginya jumlah
  // orang yang diundang, bukan jumlah baris, supaya satu keluarga besar
  // berbobot sesuai jumlah orangnya.
  const persenHadir =
    summary && summary.orang > 0 ? Math.round((summary.kursi / summary.orang) * 100) : 0;

  // Chip kategori. Angkanya dari server supaya tidak ikut berubah saat
  // daftar sedang disaring.
  const chipKategori = useMemo(() => {
    const perKategori = summary?.perKategori ?? [];
    const jumlah = perKategori.reduce((n, k) => n + k.baris, 0);
    return [
      { nilai: "semua" as const, label: "Semua tamu", angka: jumlah },
      ...KATEGORI_TAMU.map((k) => {
        const ketemu = perKategori.find((p) => p.kategori === k);
        return {
          nilai: k as string,
          label: LABEL_KATEGORI_TAMU[k],
          angka: ketemu?.baris ?? 0,
        };
      }).filter((c) => c.angka > 0),
    ];
  }, [summary]);

  // Sebaran meja. Yang belum dialokasikan ditampilkan terpisah supaya
  // pasangan tahu berapa yang masih menggantung.
  const perMeja = summary?.perMeja ?? [];
  const mejaTerisi = perMeja.filter((m) => m.meja);
  const belumAdaMeja = perMeja.find((m) => !m.meja);
  const mejaTerbesar = Math.max(1, ...mejaTerisi.map((m) => m.orang));

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
    <div className="tamu">
      {/* Judul halaman dibaca pembaca layar saja, supaya susunan layar tetap
          rapat seperti rancangan tanpa kehilangan penanda halaman. */}
      <h1 className="sr-only">Daftar Tamu</h1>

      {/* Aksi cepat di paling atas */}
      <div className="tamu-aksi">
        <button type="button" className="tamu-aksi-tombol tamu-aksi-utama" onClick={bukaTambah}>
          <IkonTambahTamu size={20} />
          Tamu Baru
        </button>
        <Link className="tamu-aksi-tombol tamu-aksi-sekunder" href="/tamu/impor">
          <IkonTempel size={20} />
          Tempel daftar
        </Link>
      </div>

      {/* Ringkasan tamu */}
      {summary && summary.baris > 0 ? (
        <div className="tamu-hero">
          <div className="tamu-hero-atas">
            <div className="tamu-hero-kiri">
              <div className="tamu-hero-kepala">
                <span className="tamu-hero-ikon" aria-hidden="true">
                  <IkonUndangan size={16} />
                </span>
                <span className="tamu-hero-label">Total undangan terdata</span>
              </div>
              <div className="tamu-hero-baris">
                <span className="tamu-hero-angka">{summary.orang}</span>
                <span className="tamu-hero-satuan">Orang</span>
              </div>
              <p className="tamu-hero-ket">
                {summary.baris} undangan. Kalau semua hadir, {summary.perkiraanMaksimal} kursi
                dipakai.
              </p>
            </div>

            {/* Lencana bulat: bagian yang sudah pasti hadir */}
            <div
              className="tamu-lencana"
              role="img"
              aria-label={`${persenHadir} persen tamu sudah konfirmasi hadir`}
            >
              <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
                <circle cx="40" cy="40" r="34" className="tamu-lencana-jalur" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="tamu-lencana-isi"
                  strokeDasharray={213.6}
                  strokeDashoffset={213.6 - (213.6 * persenHadir) / 100}
                />
              </svg>
              <span className="tamu-lencana-teks">
                <strong>{persenHadir}%</strong>
                <span>hadir</span>
              </span>
            </div>
          </div>

          <div className="tamu-tri">
            <div className="tamu-tri-kotak">
              <span className="tamu-tri-ikon tamu-tri-hadir" aria-hidden="true">
                <IkonSenang size={16} />
              </span>
              <span className="tamu-tri-angka">{summary.kursi}</span>
              <span className="tamu-tri-label">Hadir</span>
            </div>
            <div className="tamu-tri-kotak">
              <span className="tamu-tri-ikon tamu-tri-ragu" aria-hidden="true">
                <IkonJamPasir size={16} />
              </span>
              <span className="tamu-tri-angka">{summary.belumKonfirmasi}</span>
              <span className="tamu-tri-label">Ragu</span>
            </div>
            <div className="tamu-tri-kotak">
              <span className="tamu-tri-ikon tamu-tri-tidak" aria-hidden="true">
                <IkonSedih size={16} />
              </span>
              <span className="tamu-tri-angka">{summary.tidakHadir}</span>
              <span className="tamu-tri-label">Berhalangan</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Pencarian dan saringan status */}
      <div className="tamu-saring">
        <div className="tamu-cari-baris">
          <input
            type="search"
            className="isian tamu-cari"
            aria-label="Cari nama tamu"
            placeholder="Cari nama atau nomor HP..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
          <label className="sr-only" htmlFor="filterRsvp">
            Saring status kehadiran
          </label>
          <select
            id="filterRsvp"
            className="isian tamu-pilih"
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

        {/* Chip kategori, angkanya dari server */}
        <div className="tamu-chip-baris" role="group" aria-label="Saring kategori tamu">
          {chipKategori.map((c) => (
            <button
              key={c.nilai}
              type="button"
              className="tamu-chip"
              data-aktif={filterKategori === c.nilai ? "ya" : "tidak"}
              aria-pressed={filterKategori === c.nilai}
              onClick={() => setFilterKategori(c.nilai)}
            >
              {c.label}
              <span className="tamu-chip-angka">{c.angka}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daftar tamu */}
      {rawGuests.length === 0 ? (
        <Kosong
          keadaan="Belum ada data tamu undangan."
          jalanKeluar="Tambah satu per satu atau tempel langsung daftar tamu dari WhatsApp / spreadsheet."
        >
          <Link className="tombol tombol-utama" href="/tamu/impor">
            Tempel daftar (Impor)
          </Link>
          <button type="button" className="tombol tombol-sekunder" onClick={bukaTambah}>
            Tambah satu tamu
          </button>
        </Kosong>
      ) : (
        <>
          <p className="tamu-jumlah">{rawGuests.length} tamu ditampilkan</p>

          <div className="tamu-daftar">
            {rawGuests.map((t) => {
              const kategori = t.category as KategoriTamu;
              const statusRsvp = t.rsvpStatus as StatusHadir;
              const sudahDikirim = Boolean(t.invitedAt);

              return (
                <article key={t.id} className="tamu-kartu">
                  <div className="tamu-kartu-atas">
                    <div className="tamu-kartu-teks">
                      <h2 className="tamu-kartu-judul">{t.name}</h2>
                      <div className="tamu-kartu-chip">
                        <span className="tamu-chip-kecil">
                          {LABEL_KATEGORI_TAMU[kategori] ?? t.category}
                        </span>
                        <span className="tamu-chip-kecil">
                          {t.guestCount} orang
                        </span>
                        {t.tableName ? (
                          <span className="tamu-chip-kecil">Meja {t.tableName}</span>
                        ) : null}
                        {t.side ? <span className="tamu-chip-kecil">{t.side}</span> : null}
                      </div>
                    </div>
                    <div className="tamu-kartu-aksi">
                      <button
                        type="button"
                        className="tombol tombol-sekunder tamu-tombol-kecil"
                        onClick={() => bukaUbah(t)}
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        className="tombol tombol-sekunder tamu-tombol-kecil tamu-tombol-hapus"
                        onClick={() => setDihapus(t)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {t.notes ? <p className="tamu-kartu-catatan">{t.notes}</p> : null}

                  <div className="tamu-kartu-bawah">
                    <div className="tamu-rsvp-grup">
                      {STATUS_HADIR.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="tamu-rsvp-opsi"
                          data-status={s}
                          data-aktif={statusRsvp === s ? "ya" : "tidak"}
                          aria-pressed={statusRsvp === s}
                          onClick={() => ubahRsvpCepat(t, s)}
                        >
                          {LABEL_STATUS_HADIR[s]}
                        </button>
                      ))}
                    </div>

                    <div className="tamu-kartu-tautan">
                      <button
                        type="button"
                        className="tombol tombol-sekunder tamu-tombol-kecil"
                        data-kirim={sudahDikirim ? "ya" : "tidak"}
                        onClick={() => toggleUndangan(t)}
                      >
                        {sudahDikirim ? "Undangan terkirim" : "Belum diundang"}
                      </button>
                      {t.phone ? (
                        <a
                          className="tombol tombol-sekunder tamu-tombol-kecil"
                          href={`https://wa.me/${t.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Kirim WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* Sebaran meja, hanya kalau ada tamu yang sudah dialokasikan */}
      {mejaTerisi.length > 0 ? (
        <section className="tamu-meja">
          <div className="tamu-meja-kepala">
            <h2 className="tamu-meja-judul">Sebaran Meja</h2>
            <span className="tamu-meja-ket">
              {mejaTerisi.length} meja terisi
              {belumAdaMeja ? `, ${belumAdaMeja.orang} orang belum dialokasikan` : ""}
            </span>
          </div>
          <div className="tamu-meja-daftar">
            {mejaTerisi.map((m) => (
              <div key={m.meja} className="tamu-meja-baris">
                <span className="tamu-meja-nama">{m.meja}</span>
                <span className="tamu-meja-bilah" aria-hidden="true">
                  <span
                    className="tamu-meja-isi"
                    style={{ width: `${Math.round((m.orang / mejaTerbesar) * 100)}%` }}
                  />
                </span>
                <span className="tamu-meja-angka">{m.orang} orang</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Catatan penutup */}
      <div className="tamu-tips">
        <span className="tamu-tips-ikon" aria-hidden="true">
          <IkonSurat size={20} />
        </span>
        <div>
          <span className="tamu-tips-judul">
            {summary && summary.belumDiundang > 0
              ? `${summary.belumDiundang} orang belum dikirimi undangan`
              : "Semua undangan sudah dikirim"}
          </span>
          <p className="tamu-tips-teks">
            {summary && summary.belumDiundang > 0
              ? "Tandai undangan lewat tombol di tiap kartu setelah benar-benar dikirim, supaya hitungan kursi tetap akurat."
              : "Berikutnya tinggal memantau konfirmasi kehadiran sampai hari pernikahan."}
          </p>
        </div>
      </div>

      {/* Tombol tambah melayang */}
      <button
        type="button"
        className="tamu-fab tanpa-cetak"
        aria-label="Tambah satu tamu baru"
        onClick={bukaTambah}
      >
        <IkonTambahTamu size={18} />
        Tamu Baru
      </button>

      {/* Lembar Tambah / Ubah Tamu */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah data tamu" : "Tambah satu tamu"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate className="tumpuk-sedang">
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

          <div className="isian-baris isian-baris-2">
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

          <div className="isian-baris isian-baris-2">
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

          <div className="isian-baris isian-baris-2">
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

          <div className="dialog-tombol">
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

function IkonTambahTamu({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.6" />
      <path d="M2.5 20a7 7 0 0 1 13 0" />
      <path d="M18 7v6M15 10h6" />
    </svg>
  );
}

function IkonTempel({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7" />
      <path d="M9 7h6M9 11h6M9 15h3" />
      <path d="M18 14v7M14.5 17.5h7" />
    </svg>
  );
}

function IkonUndangan({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function IkonSenang({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5a4.4 4.4 0 0 0 7 0" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </svg>
  );
}

function IkonJamPasir({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3h10M7 21h10" />
      <path d="M8 3v3.5c0 2.2 4 3.8 4 5.5s-4 3.3-4 5.5V21" />
      <path d="M16 3v3.5c0 2.2-4 3.8-4 5.5s4 3.3 4 5.5V21" />
    </svg>
  );
}

function IkonSedih({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 16a4.4 4.4 0 0 1 7 0" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </svg>
  );
}

function IkonSurat({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.5 12a9.5 9.5 0 1 1-4.2-7.9" />
      <path d="M22 5v5h-5" />
      <path d="m8 12.5 2.8 2.8L16.5 9.6" />
    </svg>
  );
}
