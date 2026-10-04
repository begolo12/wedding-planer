"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import { hitungMundur, jamSelesai, hariIni } from "@/lib/format";
import { ZONA } from "@/lib/konstanta";
import { TEMPLATE_RUNDOWN, NAMA_ADAT } from "@/lib/template";
import type { rundownItems } from "@/db/schema";

type RundownItem = typeof rundownItems.$inferSelect;

type UkuranFont = "kecil" | "sedang" | "besar";

/** Tiga tingkat ukuran huruf rundown. Dipakai juga sebagai tombol pengatur. */
const UKURAN_FONT: { id: UkuranFont; label: string; tampil: string }[] = [
  { id: "kecil", label: "A-", tampil: "var(--text-kecil)" },
  { id: "sedang", label: "A", tampil: "var(--text-dasar)" },
  { id: "besar", label: "A+", tampil: "var(--text-h3)" },
];

/**
 * Ubah jam "08:30" jadi jumlah menit sejak tengah malam.
 * Mengembalikan null kalau jamnya bukan bentuk yang bisa dibaca, supaya jam
 * yang salah tulis tidak diam-diam dianggap tengah malam.
 */
function menitDari(jam: string): number | null {
  const cocok = /^(\d{1,2}):(\d{2})/.exec(jam.trim());
  if (!cocok) return null;
  const j = Number(cocok[1]);
  const m = Number(cocok[2]);
  if (j > 23 || m > 59) return null;
  return j * 60 + m;
}

/** Jam sekarang di zona Asia/Jakarta, "HH:MM". */
function jamSekarangWib(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * Acara yang sedang berjalan pada jam tertentu. Kalau tidak ada acara yang
 * sedang jalan (misalnya di sela dua acara), yang dipilih acara terakhir yang
 * sudah mulai, supaya daftar tetap punya satu titik fokus.
 */
function idAcaraSekarang(items: RundownItem[], jam: string): string | null {
  const sekarang = menitDari(jam);
  if (sekarang === null) return null;

  const sedangJalan = items.find((it) => {
    const mulai = menitDari(it.startTime);
    if (mulai === null) return false;
    return sekarang >= mulai && sekarang < mulai + (it.durationMinutes ?? 0);
  });
  if (sedangJalan) return sedangJalan.id;

  let terakhir: RundownItem | null = null;
  for (const it of items) {
    const mulai = menitDari(it.startTime);
    if (mulai === null || mulai > sekarang) continue;
    if (!terakhir || mulai >= (menitDari(terakhir.startTime) ?? 0)) terakhir = it;
  }
  return terakhir?.id ?? null;
}

/**
 * Layar Hari-H: Rundown & Jadwal Acara.
 *
 * Susunan mengikuti `docs/stitch_cute_wedding_planner/checklist_timeline_web_app`:
 * kartu ringkasan bergradasi dengan angka besar, bar kemajuan, deretan pil
 * ukuran huruf, dan daftar acara berurut waktu dengan penanda acara berjalan.
 *
 * Empat hal yang sengaja berbeda dari Stitch, karena di sini tidak ada datanya:
 * - kalender mini dan papan moodboard, aplikasi ini belum punya jadwal harian
 *   maupun unggah gambar, jadi papan itu akan jadi gambar contoh atau tombol mati
 * - saringan PIC bertingkat, jumlah tugas per PIC belum dihitung di API
 * - angka contoh Stitch (142 hari, 64%, 16 dari 25 tugas) tidak dipakai, semua
 *   angka di sini dihitung dari rundown yang benar-benar tersimpan
 * - tombol centang 28px di Stitch terlalu kecil untuk jempol, daftar tetap
 *   memakai baris setinggi 44px ke atas
 */
export default function HalamanHariH() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

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
  const [adat, setAdat] = useState<string>(NAMA_ADAT[0] ?? "Muslim");

  // Form state
  const FORM_KOSONG = {
    judul: "",
    jam: "08:00",
    durasi: "60",
    lokasi: "",
    pic: "",
    catatan: "",
  };

  const [form, setForm] = useState(FORM_KOSONG);
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function aturField<K extends keyof typeof FORM_KOSONG>(k: K, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function bukaTambah() {
    setDiedit(null);
    setForm(FORM_KOSONG);
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(item: RundownItem) {
    setDiedit(item);
    setForm({
      judul: item.title,
      jam: item.startTime,
      durasi: item.durationMinutes ? String(item.durationMinutes) : "",
      lokasi: item.location ?? "",
      pic: item.picName ?? "",
      catatan: item.notes ?? "",
    });
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!form.judul.trim()) {
      setFormGalat("Nama susunan acara wajib diisi.");
      return;
    }

    if (!form.jam.trim()) {
      setFormGalat("Jam mulai wajib diisi (misal 08:00).");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        title: form.judul.trim(),
        startTime: form.jam.trim(),
        durationMinutes: form.durasi ? parseInt(form.durasi, 10) : undefined,
        location: form.lokasi.trim() || undefined,
        picName: form.pic.trim() || undefined,
        notes: form.catatan.trim() || undefined,
        sortOrder: diedit?.sortOrder ?? 0,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/rundown/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Tersimpan");
      } else {
        await minta(`/api/plans/${planId}/rundown`, {
          method: "POST",
          body: payload,
        });
        toast("Tersimpan");
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
      for (const item of TEMPLATE_RUNDOWN[adat] ?? []) {
        await minta(`/api/plans/${planId}/rundown`, {
          method: "POST",
          body: item,
        });
      }
      toast("Tersimpan");
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
      toast("Dihapus");
      setDihapus(null);
      await muatRundown();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  const hariIniTanggal = hariIni();
  // Mulai dari "00:00" supaya render pertama di server dan di klien sama,
  // lalu jam aslinya dipasang setelah halaman jalan.
  const [jamSekarang, setJamSekarang] = useState("00:00");

  useEffect(() => {
    setJamSekarang(jamSekarangWib());
    const tik = window.setInterval(() => setJamSekarang(jamSekarangWib()), 60_000);
    return () => window.clearInterval(tik);
  }, []);

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

  function bagikanRundownWa() {
    if (!items.length) {
      toast("Belum ada acara rundown untuk dibagikan.");
      return;
    }
    const barisTeks = [
      "*SUSUNAN ACARA / RUNDOWN HARI-H*",
      plan?.partnerName ? `Pernikahan: Bersama ${plan.partnerName}` : "",
      "",
      ...items.map(
        (it) =>
          `• *${it.startTime}* (${it.durationMinutes ?? 0} mnt) - ${it.title}${
            it.location ? `\n  Lokasi: ${it.location}` : ""
          }${it.picName ? `\n  PIC: ${it.picName}` : ""}${
            it.notes ? `\n  Catatan: ${it.notes}` : ""
          }`,
      ),
    ]
      .filter(Boolean)
      .join("\n\n");

    const url = `https://wa.me/?text=${encodeURIComponent(barisTeks)}`;
    window.open(url, "_blank");
  }

  // Acara yang sedang berjalan hanya disorot di hari acara. Di hari lain
  // penanda itu cuma menyesatkan, karena jam sekarang tidak ada hubungannya
  // dengan jam acara.
  const hariIniAcara = plan.weddingDate === hariIniTanggal;

  // Sengaja bukan useMemo: nilainya cuma dipakai sekali per render, dan
  // hook tidak boleh dipasang setelah baris pengembalian awal di atas.
  const idSekarang = hariIniAcara ? idAcaraSekarang(items, jamSekarang) : null;

  const jumlahAcaraPokok = (TEMPLATE_RUNDOWN[adat] ?? []).length;
  const persenPokok = Math.min(
    100,
    Math.round((items.length / jumlahAcaraPokok) * 100),
  );

  return (
    <div className="hari-h">
      <h1 className="sr-only">Rundown acara</h1>

      <section className="hari-h-ringkas">
        <div className="hari-h-ringkas-atas">
          <div className="hari-h-ringkas-kiri">
            <span className="hari-h-ringkas-ikon" aria-hidden="true">
              <IkonKalender />
            </span>
            <div className="hari-h-ringkas-teks">
              <span className="hari-h-ringkas-lencana">
                {plan.weddingDate ? hitungMundur(plan.weddingDate) : "Tanggal belum diatur"}
              </span>
              <h2 className="hari-h-ringkas-judul">Susunan Acara Hari-H</h2>
              <p className="hari-h-ringkas-ket">
                {items.length === 0
                  ? "Belum ada acara tersusun. Pasang template atau susun satu per satu."
                  : `${items.length} acara tersusun, dari jam ${items[0].startTime} sampai jam ${items[items.length - 1].startTime}.`}
              </p>
            </div>
          </div>
          <div className="hari-h-ringkas-angka">
            <strong className="hari-h-ringkas-persen">{persenPokok}%</strong>
            <span className="hari-h-ringkas-label">
              {items.length} dari {jumlahAcaraPokok} langkah pokok
            </span>
          </div>
        </div>
        <div className="hari-h-bar">
          <div className="hari-h-bar-isi" style={{ width: `${persenPokok}%` }} />
        </div>
      </section>

      <p className="hari-h-catatan-luring">
        Halaman ini yang paling sering dibutuhkan di lokasi acara, jadi buka sekali sebelum
        berangkat.
      </p>

      <section className="hari-h-alat tanpa-cetak">
        <div className="hari-h-skala">
          <span className="hari-h-skala-label" id="hari-h-skala-label">
            Ukuran huruf
          </span>
          <div className="hari-h-skala-pil" role="group" aria-labelledby="hari-h-skala-label">
            {UKURAN_FONT.map((u) => (
              <button
                key={u.id}
                type="button"
                className="hari-h-skala-tombol"
                style={{ fontSize: u.tampil }}
                data-aktif={ukuranFont === u.id ? "ya" : "tidak"}
                aria-pressed={ukuranFont === u.id}
                onClick={() => gantiUkuran(u.id)}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hari-h-alat-aksi">
          {items.length > 0 ? (
            <>
              <button
                type="button"
                className="hari-h-tombol hari-h-tombol-halus"
                onClick={bagikanRundownWa}
              >
                <IkonBagikan />
                Bagikan
              </button>
              <button
                type="button"
                className="hari-h-tombol hari-h-tombol-halus"
                onClick={() => window.print()}
              >
                <IkonCetak />
                Cetak
              </button>
            </>
          ) : null}
          {bisaUbah ? (
            <button
              type="button"
              className="hari-h-tombol hari-h-tombol-utama"
              onClick={bukaTambah}
            >
              <IkonTambah />
              Tambah acara
            </button>
          ) : null}
        </div>
      </section>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah rundown tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      {/* Daftar Acara Rundown */}
      {items.length === 0 ? (
        <Kosong
          keadaan="Belum ada acara."
          jalanKeluar="Tambahkan susunan acara, dari persiapan sampai acaranya selesai."
        >
          <div className="hari-h-kosong-aksi">
            {bisaUbah ? (
              <>
                <Pilih
                  label="Versi rundown"
                  id="adatRundown"
                  nilai={adat}
                  onUbah={setAdat}
                  opsi={NAMA_ADAT.map((n) => ({ nilai: n, label: n }))}
                />
                <button
                  type="button"
                  className="hari-h-tombol hari-h-tombol-utama"
                  disabled={sedangPasangTemplate}
                  onClick={pasangTemplateStandar}
                >
                  {sedangPasangTemplate ? "Memasang..." : "Pakai template rundown"}
                </button>
                <button
                  type="button"
                  className="hari-h-tombol hari-h-tombol-halus"
                  onClick={bukaTambah}
                >
                  Buat manual dari awal
                </button>
              </>
            ) : null}
          </div>
        </Kosong>
      ) : (
        <>
          <nav className="hari-h-lompat tanpa-cetak" aria-label="Lompat ke acara">
            <span className="hari-h-lompat-label">Lompat ke jam</span>
            <div className="hari-h-lompat-pil-daftar">
              {items.map((it) => (
                <a
                  key={it.id}
                  className="hari-h-lompat-pil"
                  data-aktif={it.id === idSekarang ? "ya" : "tidak"}
                  href={`#acara-${it.id}`}
                >
                  {it.startTime}
                </a>
              ))}
            </div>
          </nav>

          <ol className="hari-h-daftar">
            {items.map((item) => {
              const kini = item.id === idSekarang;
              const selesai = item.durationMinutes
                ? jamSelesai(item.startTime, item.durationMinutes)
                : null;

              return (
                <li
                  key={item.id}
                  id={`acara-${item.id}`}
                  className="hari-h-acara"
                  data-sekarang={kini ? "ya" : "tidak"}
                >
                  <div className="hari-h-acara-tanda" aria-hidden="true">
                    {kini ? <span className="hari-h-acara-denyut" /> : null}
                  </div>

                  <div className="hari-h-acara-jam">
                    <strong style={{ fontSize: skalaFont.jam }}>{item.startTime}</strong>
                    {item.durationMinutes ? <span>{item.durationMinutes} menit</span> : null}
                    {selesai ? <span>sampai {selesai}</span> : null}
                  </div>

                  <div className="hari-h-acara-isi">
                    <div className="hari-h-acara-kepala">
                      <h3 className="hari-h-acara-judul" style={{ fontSize: skalaFont.judul }}>
                        {item.title}
                      </h3>
                      {kini ? (
                        <span className="hari-h-lencana-sekarang">Sedang berlangsung</span>
                      ) : null}
                    </div>

                    {item.location || item.picName ? (
                      <p className="hari-h-acara-meta" style={{ fontSize: skalaFont.sub }}>
                        {item.location ? (
                          <span>
                            Lokasi: <strong>{item.location}</strong>
                          </span>
                        ) : null}
                        {item.picName ? (
                          <span>
                            PIC: <strong>{item.picName}</strong>
                          </span>
                        ) : null}
                      </p>
                    ) : null}

                    {item.notes ? (
                      <p
                        className="hari-h-acara-catatan"
                        style={{ fontSize: skalaFont.catatan }}
                      >
                        {item.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="hari-h-acara-aksi">
                    {bisaUbah ? (
                      <>
                        <button
                          type="button"
                          className="hari-h-tombol hari-h-tombol-halus"
                          onClick={() => bukaUbah(item)}
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="hari-h-tombol hari-h-tombol-halus hari-h-tombol-bahaya"
                          onClick={() => setDihapus(item)}
                        >
                          Hapus
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {/* Lembar Tambah / Ubah Acara */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah acara rundown" : "Tambah acara ke rundown"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate className="tumpuk-sedang">
          <Isian label="Nama susunan acara" id="formJudul" galat={formGalat ?? undefined}>
            <input
              id="formJudul"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Akad Nikah / Ijab Kabul"
              value={form.judul}
              onChange={(e) => aturField("judul", e.target.value)}
            />
          </Isian>

          <div className="isian-baris isian-baris-2">
            <Isian label="Jam mulai (WIB/WITA/WIT)" id="formJam">
              <input
                id="formJam"
                className="isian"
                type="time"
                required
                value={form.jam}
                onChange={(e) => aturField("jam", e.target.value)}
              />
            </Isian>

            <Isian label="Estimasi durasi (menit)" id="formDurasi">
              <input
                id="formDurasi"
                className="isian"
                type="number"
                min={0}
                placeholder="60"
                value={form.durasi}
                onChange={(e) => aturField("durasi", e.target.value)}
              />
            </Isian>
          </div>

          <Isian label="Lokasi acara" id="formLokasi">
            <input
              id="formLokasi"
              className="isian"
              type="text"
              placeholder="Contoh: Masjid Al-Falah / Aula Utama"
              value={form.lokasi}
              onChange={(e) => aturField("lokasi", e.target.value)}
            />
          </Isian>

          <Isian label="Penanggung Jawab / PIC" id="formPic">
            <input
              id="formPic"
              className="isian"
              type="text"
              placeholder="Contoh: Pakde Hadi & Tim WO"
              value={form.pic}
              onChange={(e) => aturField("pic", e.target.value)}
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
              value={form.catatan}
              onChange={(e) => aturField("catatan", e.target.value)}
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
              {sedangSimpan ? "Menyimpan..." : "Simpan acara"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus acara"
        isi={`Acara "${dihapus?.title ?? ""}" jam ${dihapus?.startTime ?? ""} akan dihapus dari rundown.`}
        tombolYa="Hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}

// Ikon digambar sendiri sebagai SVG, bukan webfont, supaya halaman tetap utuh
// saat dibuka tanpa sinyal.
type PropertiIkon = { size?: number };

function IkonDasar({
  size = 18,
  children,
}: PropertiIkon & { children: React.ReactNode }) {
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
      {children}
    </svg>
  );
}

function IkonKalender({ size = 26 }: PropertiIkon) {
  return (
    <IkonDasar size={size}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h3M8 17.5h6" />
    </IkonDasar>
  );
}

function IkonBagikan({ size = 17 }: PropertiIkon) {
  return (
    <IkonDasar size={size}>
      <path d="M12 15V4" />
      <path d="M8.5 7.5 12 4l3.5 3.5" />
      <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
    </IkonDasar>
  );
}

function IkonCetak({ size = 17 }: PropertiIkon) {
  return (
    <IkonDasar size={size}>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="7" rx="2" />
      <path d="M7 14h10v6H7z" />
    </IkonDasar>
  );
}

function IkonTambah({ size = 17 }: PropertiIkon) {
  return (
    <IkonDasar size={size} >
      <path d="M12 5v14M5 12h14" />
    </IkonDasar>
  );
}
