"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
import { TabRencana } from "@/components/tab-rencana";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import { AUIDENS, type Audien, LABEL_AUDIEN } from "@/lib/konstanta";
import type { announcements } from "@/db/schema";

type Announcement = typeof announcements.$inferSelect;

/**
 * Layar Briefing & Informasi Keluarga / Crew.
 * Pasangan dapat menyusun pengumuman penting, aturan seragam, alur parkir,
 * dan membagikannya ke WhatsApp keluarga atau panitia.
 */
export default function HalamanInfo() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  const {
    data,
    memuat: memuatInfo,
    galat: galatInfo,
    muatUlang: muatInfo,
  } = useMuat<{
    announcements: Announcement[];
    summary: { total: number; terbit: number; disematkan: number };
  }>(planId ? `/api/plans/${planId}/announcements` : null, {
    aktif: Boolean(planId),
  });

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<Announcement | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<Announcement | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const [dicabut, setDicabut] = useState<Announcement | null>(null);
  const [sedangCabut, setSedangCabut] = useState(false);

  // Form states
  const [formJudul, setFormJudul] = useState("");
  const [formIsi, setFormIsi] = useState("");
  const [formAudien, setFormAudien] = useState<Audien>("semua");
  const [formSemat, setFormSemat] = useState(false);
  const [formTerbit, setFormTerbit] = useState(true);
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormJudul("");
    setFormIsi("");
    setFormAudien("semua");
    setFormSemat(false);
    setFormTerbit(true);
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(a: Announcement) {
    setDiedit(a);
    setFormJudul(a.title);
    setFormIsi(a.body);
    setFormAudien(
      AUIDENS.includes(a.audience as Audien) ? (a.audience as Audien) : "semua",
    );
    setFormSemat(a.isPinned ?? false);
    setFormTerbit(Boolean(a.publishedAt));
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formJudul.trim()) {
      setFormGalat("Judul pengumuman wajib diisi.");
      return;
    }
    if (!formIsi.trim()) {
      setFormGalat("Isi pengumuman wajib diisi.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        title: formJudul.trim(),
        body: formIsi.trim(),
        audience: formAudien,
        isPinned: formSemat,
        publishedAt: formTerbit ? new Date().toISOString() : null,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/announcements/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Tersimpan");
      } else {
        await minta(`/api/plans/${planId}/announcements`, {
          method: "POST",
          body: payload,
        });
        toast("Tersimpan");
      }

      setLembarBuka(false);
      await muatInfo();
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
      await minta(`/api/plans/${planId}/announcements/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Dihapus");
      setDihapus(null);
      await muatInfo();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  async function konfirmasiCabut() {
    if (!planId || !dicabut) return;
    setSedangCabut(true);
    try {
      await minta(`/api/plans/${planId}/announcements/${dicabut.id}/share`, {
        method: "POST",
        body: { rotate: true },
      });
      toast("Tersimpan");
      setDicabut(null);
      await muatInfo();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangCabut(false);
    }
  }

  function salinTautan(token: string) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/bagikan/${token}`;
    navigator.clipboard.writeText(url);
    toast("Tautan tersalin");
  }

  function bagikanWhatsApp(a: Announcement) {
    const teks = `*${a.title}*\nUntuk: ${LABEL_AUDIEN[a.audience as Audien] ?? a.audience}\n\n${a.body}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, "_blank");
  }

  const daftar = data?.announcements ?? [];
  const summary = data?.summary;

  if (memuatPlan || (planId && memuatInfo && !data)) {
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

  if (galatInfo) {
    return <Gagal apa="Daftar pengumuman" onCoba={muatInfo} />;
  }

  return (
    <div className="tumpuk-sedang">
      <div className="kepala-halaman">
        <div>
          <h1>Info untuk keluarga</h1>
          <p>Catatan penting untuk keluarga besar, panitia acara, dan vendor hari-H.</p>
        </div>
        <div>
          {bisaUbah ? (
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              Tambah pengumuman
            </button>
          ) : null}
        </div>
      </div>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah pengumuman tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      <TabRencana />

      {summary && summary.total > 0 ? (
        <div className="rekap rekap-tiga">
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.total}</span>
            <span className="rekap-label">Total catatan</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai teks-aksen">
              {summary.terbit}
            </span>
            <span className="rekap-label">Sudah terbit</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.disematkan}</span>
            <span className="rekap-label">Disematkan</span>
          </div>
        </div>
      ) : null}

      {daftar.length === 0 ? (
        <Kosong
          keadaan="Belum ada pengumuman."
          jalanKeluar="Tulis satu pengumuman yang perlu dibaca semua orang."
        >
          {bisaUbah ? (
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              Tambah pengumuman
            </button>
          ) : null}
        </Kosong>
      ) : (
        <div className="tumpuk-rapat">
          {daftar.map((a) => (
            <article
              key={a.id}
              className="kartu tumpuk-rapat"
              data-sorot={a.isPinned ? "ya" : undefined}
            >
              <div className="bagian-kepala">
                <div className="tumpuk-rapat isi-lentur">
                  <div className="aksi-baris">
                    <h2>{a.title}</h2>
                    {a.isPinned ? (
                      <span className="lencana lencana-aksen">Disematkan</span>
                    ) : null}
                    <span className="lencana">
                      Audiens: {LABEL_AUDIEN[a.audience as Audien] ?? a.audience}
                    </span>
                    {!a.publishedAt ? <span className="lencana">Draf</span> : null}
                  </div>
                </div>

                <div className="aksi-baris">
                  <button
                    type="button"
                    className="tombol tombol-sekunder tombol-kecil"
                    onClick={() => bagikanWhatsApp(a)}
                  >
                    Kirim WA
                  </button>
                  {a.shareToken ? (
                    <button
                      type="button"
                      className="tombol tombol-sekunder tombol-kecil"
                      onClick={() => salinTautan(a.shareToken!)}
                    >
                      Salin tautan
                    </button>
                  ) : null}
                  {bisaUbah && a.shareToken ? (
                    <button
                      type="button"
                      className="tombol tombol-bahaya tombol-kecil"
                      onClick={() => setDicabut(a)}
                    >
                      Cabut tautan
                    </button>
                  ) : null}
                  {bisaUbah ? (
                    <>
                      <button
                        type="button"
                        className="tombol tombol-sekunder tombol-kecil"
                        onClick={() => bukaUbah(a)}
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        className="tombol tombol-bahaya tombol-kecil"
                        onClick={() => setDihapus(a)}
                      >
                        Hapus
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              <p className="blok-teks">{a.body}</p>
            </article>
          ))}
        </div>
      )}

      <DialogKonfirmasi
        buka={Boolean(dicabut)}
        judul="Cabut tautan pengumuman"
        isi="Tautan lama tidak bisa dibuka lagi. Tautan baru dibuat untuk dibagikan ulang."
        tombolYa="Cabut"
        sedangJalan={sedangCabut}
        onTutup={() => setDicabut(null)}
        onYa={konfirmasiCabut}
      />

      {/* Lembar Tambah / Ubah */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah pengumuman" : "Tambah pengumuman"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate className="tumpuk-sedang">
          <Isian label="Judul pengumuman" id="formJudul" galat={formGalat ?? undefined}>
            <input
              id="formJudul"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Petunjuk Parkir & Titik Kumpul Keluarga"
              value={formJudul}
              onChange={(e) => setFormJudul(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Target penerima (audiens)"
            id="formAudien"
            nilai={formAudien}
            onUbah={(v) => setFormAudien(v as Audien)}
            opsi={AUIDENS.map((aud) => ({ nilai: aud, label: LABEL_AUDIEN[aud] }))}
          />

          <Isian label="Isi pengumuman / briefing" id="formIsi">
            <textarea
              id="formIsi"
              className="isian"
              rows={6}
              required
              placeholder="Tuliskan detail informasi, jam kehadiran, aturan kode busana, dll."
              value={formIsi}
              onChange={(e) => setFormIsi(e.target.value)}
            />
          </Isian>

          <div className="tumpuk-rapat">
            <label className="pilih-kartu pilih-kartu-tengah" data-aktif="tidak">
              <input
                type="checkbox"
                checked={formSemat}
                onChange={(e) => setFormSemat(e.target.checked)}
              />
              <div className="pilih-kartu-isi">
                <div className="pilih-kartu-judul">Sematkan di atas</div>
                <div className="pilih-kartu-ket">Tandai sebagai pengumuman penting.</div>
              </div>
            </label>

            <label className="pilih-kartu pilih-kartu-tengah" data-aktif="tidak">
              <input
                type="checkbox"
                checked={formTerbit}
                onChange={(e) => setFormTerbit(e.target.checked)}
              />
              <div className="pilih-kartu-isi">
                <div className="pilih-kartu-judul">Langsung terbitkan sekarang</div>
                <div className="pilih-kartu-ket">Kalau tidak dicentang, catatan disimpan sebagai draf.</div>
              </div>
            </label>
          </div>

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
              {sedangSimpan ? "Menyimpan..." : "Simpan pengumuman"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus pengumuman"
        isi={`Pengumuman "${dihapus?.title ?? ""}" akan dihapus.`}
        tombolYa="Hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
