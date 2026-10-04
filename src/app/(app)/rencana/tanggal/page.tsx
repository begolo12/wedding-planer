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
import {
  JENIS_TANGGAL,
  type JenisTanggal,
  LABEL_JENIS_TANGGAL,
} from "@/lib/konstanta";
import { tanggalPanjangDari, selisihHari, hariIni } from "@/lib/format";
import type { milestones } from "@/db/schema";

type Milestone = typeof milestones.$inferSelect;

/** Kelompok tampilan daftar tanggal penting, urut dari yang paling dekat. */
type GrupTanggal = "bulanIni" | "akanDatang" | "sudahLewat";

function grupTanggal(tanggal: string): GrupTanggal {
  const selisih = selisihHari(tanggal);
  if (selisih !== null && selisih < 0) return "sudahLewat";
  // Bulan dibandingkan dari tanggal Jakarta, bukan dari jam lokal peramban,
  // supaya pukul 00.00 sampai 07.00 WIB tidak terbaca sebagai bulan lalu.
  const [tahun, bulan] = tanggal.split("-");
  const [tahunKini, bulanKini] = hariIni().split("-");
  if (tahun === tahunKini && bulan === bulanKini) {
    return "bulanIni";
  }
  return "akanDatang";
}

/**
 * Layar Tanggal Penting.
 * Mengatur tanggal akad, resepsi, lamaran, prewedding, dan hari-H utama.
 */
export default function HalamanTanggal() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  const {
    data,
    memuat: memuatMilestone,
    galat: galatMilestone,
    muatUlang: muatMilestone,
  } = useMuat<{ milestones: Milestone[] }>(
    planId ? `/api/plans/${planId}/milestones` : null,
    { aktif: Boolean(planId) },
  );

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<Milestone | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<Milestone | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);
  const [cariTanggal, setCariTanggal] = useState("");

  // Form states
  const [formJudul, setFormJudul] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formJam, setFormJam] = useState("");
  const [formJenis, setFormJenis] = useState<JenisTanggal>("akad");
  const [formHariH, setFormHariH] = useState(false);
  const [formTautan, setFormTautan] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormJudul("");
    setFormTanggal("");
    setFormJam("");
    setFormJenis("akad");
    setFormHariH(false);
    setFormTautan("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(m: Milestone) {
    setDiedit(m);
    setFormJudul(m.title);
    setFormTanggal(m.eventDate);
    setFormJam(m.eventTime ?? "");
    setFormJenis(
      JENIS_TANGGAL.includes(m.type as JenisTanggal)
        ? (m.type as JenisTanggal)
        : "akad",
    );
    setFormHariH(m.isDayOf ?? false);
    setFormTautan(m.invitationUrl ?? "");
    setFormCatatan(m.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formJudul.trim()) {
      setFormGalat("Judul tanggal penting wajib diisi.");
      return;
    }
    if (!formTanggal) {
      setFormGalat("Tanggal acara wajib diisi.");
      return;
    }
    if (formTautan.trim() && !/^https?:\/\//i.test(formTautan.trim())) {
      setFormGalat("Tautan undangan harus dimulai dengan http:// atau https://.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        title: formJudul.trim(),
        eventDate: formTanggal,
        eventTime: formJam.trim() || null,
        type: formJenis,
        isDayOf: formHariH,
        invitationUrl: formTautan.trim() || null,
        notes: formCatatan.trim() || null,
        sortOrder: 0,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/milestones/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Tersimpan");
      } else {
        await minta(`/api/plans/${planId}/milestones`, {
          method: "POST",
          body: payload,
        });
        toast("Tersimpan");
      }

      setLembarBuka(false);
      await muatMilestone();
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
      await minta(`/api/plans/${planId}/milestones/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Dihapus");
      setDihapus(null);
      await muatMilestone();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  const daftar = data?.milestones ?? [];

  if (memuatPlan || (planId && memuatMilestone && !data)) {
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

  if (galatMilestone) {
    return <Gagal apa="Daftar tanggal penting" onCoba={muatMilestone} />;
  }

  const tersaring = daftar.filter((m) =>
    cariTanggal.trim()
      ? m.title.toLowerCase().includes(cariTanggal.trim().toLowerCase())
      : true,
  );

  return (
    <div className="tumpuk-sedang">
      <div className="kepala-halaman">
        <div>
          <h1>Tanggal Penting</h1>
          <p>Tentukan tanggal akad, resepsi, dan rangkaian acara pernikahan.</p>
        </div>
        <div>
          {bisaUbah ? (
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              Tambah tanggal
            </button>
          ) : null}
        </div>
      </div>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah tanggal tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      {/* Satu panel untuk tab modul, pencarian, daftar tanggal, dan keadaan
          kosongnya (DESIGN.md komposisi desktop poin 5 dan 6). */}
      <div className="panel-daftar" aria-label="Daftar tanggal penting">
        <div className="panel-daftar-kepala">
      <TabRencana />
        </div>

      {daftar.length === 0 ? (
        <Kosong
          keadaan="Belum ada tanggal penting."
          jalanKeluar="Tambahkan tanggal akad nikah atau resepsi untuk mengaktifkan hitung mundur di Beranda."
        >
          {bisaUbah ? (
            <>
              {/* Kepala halaman sudah memakai tombol utama "Tambah tanggal",
                  jadi ajakan di keadaan kosong ini sekunder supaya tidak ada
                  dua tombol utama untuk satu aksi (DESIGN.md komposisi
                  desktop poin 11). */}
              <button type="button" className="tombol tombol-sekunder" onClick={bukaTambah}>
                Tambah tanggal
              </button>
            </>
          ) : null}
        </Kosong>
      ) : (
        <div className="tumpuk-sedang">
          <input
            className="isian"
            type="search"
            placeholder="Cari tanggal penting..."
            aria-label="Cari tanggal penting"
            value={cariTanggal}
            onChange={(e) => setCariTanggal(e.target.value)}
          />

          {tersaring.length === 0 ? (
            <Kosong
              keadaan="Tidak ada yang cocok dengan pencarian itu."
              jalanKeluar="Coba periksa kata kunci."
            />
          ) : (
            (
              [
                { id: "bulanIni", judul: "Bulan ini" },
                { id: "akanDatang", judul: "Akan datang" },
                { id: "sudahLewat", judul: "Sudah lewat" },
              ] as { id: GrupTanggal; judul: string }[]
            ).map((grup) => {
              const isi = tersaring.filter((m) => grupTanggal(m.eventDate) === grup.id);
              if (isi.length === 0) return null;
              return (
                <section key={grup.id} className="tumpuk-rapat">
                  <h2 className="label-bagian">{grup.judul}</h2>
                  {isi.map((m) => {
                    const selisih = selisihHari(m.eventDate);
                    const statusHari =
                      selisih === null
                        ? ""
                        : selisih === 0
                          ? "Hari ini"
                          : selisih < 0
                            ? `${Math.abs(selisih)} hari lalu`
                            : `${selisih} hari lagi`;

                    return (
                      <article
                        key={m.id}
                        className="kartu tumpuk-rapat"
                        data-sorot={m.isDayOf ? "ya" : undefined}
                      >
                        <div className="bagian-kepala">
                          <div className="tumpuk-rapat isi-lentur">
                            <div className="aksi-baris">
                              <h2>{m.title}</h2>
                              {m.isDayOf ? (
                                <span className="lencana lencana-aksen">Hari-H Utama</span>
                              ) : null}
                              <span className="lencana">
                                {LABEL_JENIS_TANGGAL[m.type as JenisTanggal] ?? m.type}
                              </span>
                            </div>

                            <p className="paragraf-rapat">
                              {tanggalPanjangDari(m.eventDate)}
                              {m.eventTime ? ` • Jam ${m.eventTime}` : ""}
                              {statusHari ? ` (${statusHari})` : ""}
                            </p>

                            {m.notes ? <p className="keterangan">{m.notes}</p> : null}

                            {m.invitationUrl ? (
                              <p className="keterangan">
                                <a
                                  className="tautan-kalimat"
                                  href={m.invitationUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Buka tautan undangan
                                </a>
                              </p>
                            ) : null}
                          </div>

                          <div className="aksi-baris">
                            {bisaUbah ? (
                              <>
                                <button
                                  type="button"
                                  className="tombol tombol-sekunder tombol-kecil"
                                  onClick={() => bukaUbah(m)}
                                >
                                  Ubah
                                </button>
                                <button
                                  type="button"
                                  className="tombol tombol-bahaya tombol-kecil"
                                  onClick={() => setDihapus(m)}
                                >
                                  Hapus
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </section>
              );
            })
          )}
        </div>
      )}
      </div>
      {/* Akhir panel daftar tanggal */}

      {/* Lembar Tambah / Ubah Tanggal */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah tanggal penting" : "Tambah tanggal"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate className="tumpuk-sedang">
          <Isian label="Nama acara atau tanggal" id="formJudul" galat={formGalat ?? undefined}>
            <input
              id="formJudul"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Akad nikah & syukuran"
              value={formJudul}
              onChange={(e) => setFormJudul(e.target.value)}
            />
          </Isian>

          <Isian label="Tanggal acara" id="formTanggal">
            <input
              id="formTanggal"
              className="isian"
              type="date"
              required
              value={formTanggal}
              onChange={(e) => setFormTanggal(e.target.value)}
            />
          </Isian>

          <Isian label="Waktu / jam" id="formJam" petunjuk="Format 24 jam, contoh: 08:30 atau 19:00">
            <input
              id="formJam"
              className="isian"
              type="text"
              placeholder="08:00"
              value={formJam}
              onChange={(e) => setFormJam(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Jenis acara"
            id="formJenis"
            nilai={formJenis}
            onUbah={(v) => setFormJenis(v as JenisTanggal)}
            opsi={JENIS_TANGGAL.map((j) => ({ nilai: j, label: LABEL_JENIS_TANGGAL[j] }))}
          />

          <label className="pilih-kartu pilih-kartu-tengah" data-aktif="tidak">
            <input
              type="checkbox"
              checked={formHariH}
              onChange={(e) => setFormHariH(e.target.checked)}
            />
            <div className="pilih-kartu-isi">
              <div className="pilih-kartu-judul">Jadikan Hari-H Utama</div>
              <div className="pilih-kartu-ket">Dipakai untuk hitung mundur di Beranda.</div>
            </div>
          </label>

          <Isian
            label="Tautan undangan (opsional)"
            id="formTautan"
            petunjuk="Mulai dengan http:// atau https://."
          >
            <input
              id="formTautan"
              className="isian"
              type="url"
              placeholder="https://undangan.example/aisyah-bagas"
              value={formTautan}
              onChange={(e) => setFormTautan(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan atau lokasi" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Lokasi acara, nama masjid, aula, dsb."
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
              {sedangSimpan ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus tanggal penting"
        isi={`Tanggal "${dihapus?.title ?? ""}" akan dihapus dari rencana.`}
        tombolYa="Hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
