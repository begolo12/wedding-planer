"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
import { TabRencana } from "@/components/tab-rencana";
import { TaskItem, type TugasBaris } from "@/components/task-item";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih, PilihanTombol } from "@/components/field";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  KATEGORI_TUGAS,
  type KategoriTugas,
  PRIORITAS,
  type Prioritas,
  LABEL_PRIORITAS,
  PENUGASAN,
  type Penugasan,
  LABEL_PENUGASAN,
} from "@/lib/konstanta";
import { kelompokkan, LABEL_KELOMPOK, URUTAN_KELOMPOK, type KelompokWaktu } from "@/lib/plan";
import { selisihHari, hitungMundur, rupiah } from "@/lib/format";
import { Rupiah } from "@/components/rupiah";

type TugasLengkap = TugasBaris & {
  budgetItemId?: string | null;
  sortOrder?: number;
};

/** Pos anggaran yang bisa ditautkan ke tugas supaya nominalnya terlihat. */
type PosRingkas = { id: string; name: string; plannedAmount: number };

/** Saringan cepat di atas daftar tugas. "semua" berarti tanpa saringan. */
type SaringTugas = "semua" | "mendesak" | "belumTenggat" | "selesai";

/** Deretan pil saringan. Urutan disengaja: dari yang paling mendesak. */
const SARINGAN: { id: SaringTugas; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "mendesak", label: "Perlu Segera" },
  { id: "belumTenggat", label: "Belum Ada Tenggat" },
  { id: "selesai", label: "Selesai" },
];

/**
 * Layar Daftar Tugas pernikahan.
 *
 * Susunan mengikuti `docs/stitch_cute_wedding_planner/checklist_timeline_pernikahan`:
 * kartu ringkasan progres bergradasi dengan hiasan bunga, deretan pil saringan,
 * lalu daftar tugas per kelompok waktu, dan tombol tambah melayang di kanan bawah.
 *
 * Tiga hal yang sengaja berbeda dari Stitch:
 * - Papan moodboard ("Inspirasi Tema & Palet Warna") tidak dipakai karena aplikasi
 *   ini belum punya fitur unggah gambar. Menampilkan gambar contoh berarti tombol mati.
 * - Tombol centang di Stitch berukuran 28px, di bawah batas 44px, jadi daftar tetap
 *   memakai `TaskItem`.
 * - Pencarian dan saringan kategori tetap ada karena Stitch hanya punya saringan fase,
 *   sedangkan pengguna dengan puluhan tugas butuh mencari.
 */
export default function HalamanTugas() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  const {
    data: dataTugas,
    memuat: memuatTugas,
    galat: galatTugas,
    muatUlang: muatTugas,
  } = useMuat<{ tasks: TugasLengkap[] }>(planId ? `/api/plans/${planId}/tasks` : null, {
    aktif: Boolean(planId),
  });

  // Pos anggaran dipakai untuk mengisi nominal tugas. Tugas tidak menyimpan
  // nominal sendiri, jadi nominalnya mengikuti pos anggaran yang ditautkan.
  // Alasannya, uang hanya boleh punya satu sumber, dan sumbernya ada di pos.
  const { data: dataPos } = useMuat<{ items: PosRingkas[] }>(
    planId ? `/api/plans/${planId}/budget-items` : null,
    { aktif: Boolean(planId) },
  );
  const daftarPos = dataPos?.items ?? [];

  const [kategoriPilihan, setKategoriPilihan] = useState<string>("semua");
  const [tampilkanSelesai, setTampilkanSelesai] = useState<boolean>(false);
  const [kataKunci, setKataKunci] = useState<string>("");
  const [penugasanPilihan, setPenugasanPilihan] = useState<string>("semua");
  const [saring, setSaring] = useState<SaringTugas>("semua");
  const [batasTugas, setBatasTugas] = useState(20);

  // Lembar tambah / ubah tugas
  const [lembarBuka, setLembarBuka] = useState(false);
  const [tugasDiedit, setTugasDiedit] = useState<TugasLengkap | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // Lembar muat checklist template
  const [lembarTemplate, setLembarTemplate] = useState(false);
  const [kategoriTemplate, setKategoriTemplate] = useState<KategoriTugas>("Administrasi");
  const [sedangMuatTemplate, setSedangMuatTemplate] = useState(false);

  // Dialog konfirmasi hapus
  const [tugasDihapus, setTugasDihapus] = useState<TugasLengkap | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  // Form state
  const [formJudul, setFormJudul] = useState("");
  const [formKategori, setFormKategori] = useState<KategoriTugas>("Administrasi");
  const [formTenggat, setFormTenggat] = useState("");
  const [formPrioritas, setFormPrioritas] = useState<Prioritas>("sedang");
  const [formPenugasan, setFormPenugasan] = useState<Penugasan>("saya");
  const [formPosId, setFormPosId] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setTugasDiedit(null);
    setFormJudul("");
    setFormKategori("Administrasi");
    setFormTenggat("");
    setFormPrioritas("sedang");
    setFormPenugasan("saya");
    setFormPosId("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(t: TugasLengkap) {
    setTugasDiedit(t);
    setFormJudul(t.title);
    setFormKategori(
      KATEGORI_TUGAS.includes(t.category as KategoriTugas)
        ? (t.category as KategoriTugas)
        : "Administrasi",
    );
    setFormTenggat(t.dueDate ?? "");
    setFormPrioritas(
      PRIORITAS.includes(t.priority as Prioritas) ? (t.priority as Prioritas) : "sedang",
    );
    setFormPenugasan(
      PENUGASAN.includes(t.assignee as Penugasan) ? (t.assignee as Penugasan) : "saya",
    );
    setFormPosId(t.budgetItemId ?? "");
    setFormCatatan(t.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpanTugas(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formJudul.trim()) {
      setFormGalat("Judul tugas tidak boleh kosong.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        title: formJudul.trim(),
        category: formKategori,
        dueDate: formTenggat || null,
        priority: formPrioritas,
        assignee: formPenugasan,
        budgetItemId: formPosId || null,
        notes: formCatatan.trim() || null,
      };

      if (tugasDiedit) {
        await minta(`/api/plans/${planId}/tasks/${tugasDiedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Tersimpan");
      } else {
        await minta(`/api/plans/${planId}/tasks`, {
          method: "POST",
          body: { ...payload, status: "belum", sortOrder: 0 },
        });
        toast("Tersimpan");
      }

      setLembarBuka(false);
      await muatTugas();
    } catch (err) {
      setFormGalat(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
    }
  }

  async function konfirmasiHapus() {
    if (!planId || !tugasDihapus) return;
    setSedangHapus(true);
    try {
      await minta(`/api/plans/${planId}/tasks/${tugasDihapus.id}`, {
        method: "DELETE",
      });
      toast("Dihapus");
      setTugasDihapus(null);
      await muatTugas();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  async function muatTemplate() {
    if (!planId) return;
    setSedangMuatTemplate(true);
    try {
      const hasil = await minta<{ addedCount: number; message: string }>(
        `/api/plans/${planId}/tasks/from-template`,
        {
          method: "POST",
          body: { category: kategoriTemplate },
        },
      );
      toast(
        hasil.addedCount > 0
          ? `${hasil.addedCount} tugas ${kategoriTemplate} dimuat`
          : "Semua tugas kategori ini sudah ada",
      );
      setLembarTemplate(false);
      await muatTugas();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangMuatTemplate(false);
    }
  }

  const semuaTugas = dataTugas?.tasks ?? [];

  // Angka ringkasan progres. Dihitung dari data yang sudah dimuat, sama seperti
  // yang dipakai Beranda, supaya dua layar tidak pernah berbeda.
  const totalTugas = semuaTugas.length;
  const tugasSelesai = semuaTugas.filter((t) => t.status === "selesai").length;
  const persenProgres = totalTugas ? Math.round((tugasSelesai / totalTugas) * 100) : 0;
  const tugasMendesak = semuaTugas.filter(
    (t) => t.status !== "selesai" && (() => {
      const s = selisihHari(t.dueDate);
      return s !== null && s <= 0;
    })(),
  ).length;
  const tugasTanpaTenggat = semuaTugas.filter(
    (t) => t.status !== "selesai" && !t.dueDate,
  ).length;

  // Hitung mundur ke hari besar. Kosong kalau tanggalnya belum diisi.
  const teksMundur = plan?.weddingDate ? hitungMundur(plan.weddingDate) : null;

  // Jumlah tugas per pil saringan, biar angkanya kelihatan sebelum diklik.
  function hitungSaring(id: SaringTugas) {
    if (id === "semua") return totalTugas;
    if (id === "mendesak") return tugasMendesak;
    if (id === "belumTenggat") return tugasTanpaTenggat;
    return tugasSelesai;
  }

  // Filter tugas
  const tugasTersaring = useMemo(() => {
    return semuaTugas.filter((t) => {
      if (saring === "mendesak") {
        const s = selisihHari(t.dueDate);
        if (t.status === "selesai" || s === null || s > 0) return false;
      }
      if (saring === "belumTenggat" && (t.status === "selesai" || t.dueDate)) return false;
      if (saring === "selesai" && t.status !== "selesai") return false;

      if (kategoriPilihan !== "semua" && t.category !== kategoriPilihan) {
        return false;
      }
      if (penugasanPilihan !== "semua" && (t.assignee ?? "") !== penugasanPilihan) {
        return false;
      }
      if (!tampilkanSelesai && saring !== "selesai" && t.status === "selesai") {
        return false;
      }
      if (kataKunci.trim()) {
        const cari = kataKunci.toLowerCase();
        return (
          t.title.toLowerCase().includes(cari) ||
          (t.notes && t.notes.toLowerCase().includes(cari))
        );
      }
      return true;
    });
  }, [semuaTugas, saring, kategoriPilihan, tampilkanSelesai, kataKunci, penugasanPilihan]);

  // Kelompokkan per waktu
  const tugasTampil = useMemo(
    () => tugasTersaring.slice(0, batasTugas),
    [tugasTersaring, batasTugas],
  );

  const kelompokTugas = useMemo(() => {
    const hasil: Record<KelompokWaktu, TugasLengkap[]> = {
      lewat: [],
      hariIni: [],
      mingguIni: [],
      tanpaTenggat: [],
      selesai: [],
    };

    for (const t of tugasTampil) {
      const kel = kelompokkan(t.dueDate, t.status);
      hasil[kel].push(t);
    }
    return hasil;
  }, [tugasTampil]);

  if (memuatPlan || (planId && memuatTugas && !dataTugas)) {
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

  if (galatTugas) {
    return <Gagal apa="Daftar tugas" onCoba={muatTugas} />;
  }

  return (
    <div className="rencana">
      <h1 className="sr-only">Tugas</h1>
      <section className="rencana-hero">
        <span className="rencana-hias rencana-hias-kanan" aria-hidden="true">
          <IkonBunga size={96} />
        </span>
        <span className="rencana-hias rencana-hias-kiri" aria-hidden="true">
          <IkonBungaKecil size={80} />
        </span>

        <div className="rencana-hero-kepala">
          <span className="rencana-hero-label">
            <span className="rencana-ikon-bulat">
              <IkonBunga size={18} />
            </span>
            Langkah Menuju Hari Bahagia
          </span>
          {teksMundur ? (
            <span className="rencana-pil-kilau">{teksMundur}</span>
          ) : null}
        </div>

        <div className="rencana-hero-isi">
          <div className="rencana-hero-baris">
            <p className="rencana-hero-angka">
              Progres Persiapan: <span>{persenProgres}%</span>
            </p>
            <span className="rencana-hero-lencana">
              {tugasSelesai} dari {totalTugas} selesai
            </span>
          </div>
          <div className="rencana-bar">
            <div className="rencana-bar-isi" style={{ width: `${persenProgres}%` }} />
          </div>
          <p className="rencana-hero-catatan">
            <IkonHati size={16} />
            Pelan tapi pasti, langkah menuju hari bahagiamu makin dekat.
          </p>
        </div>
      </section>

      <div className="rencana-aksi">
        {bisaUbah ? (
          <>
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setLembarTemplate(true)}
            >
              Muat template
            </button>
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              Tambah tugas
            </button>
          </>
        ) : null}
      </div>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah tugas tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      <TabRencana />

      {/* Saringan cepat dan pencarian */}
      <section className="rencana-saring" aria-label="Saringan tugas">
        <div className="rencana-saring-pil" role="group">
          {SARINGAN.map((p) => (
            <button
              key={p.id}
              type="button"
              className="rencana-pil"
              data-aktif={saring === p.id ? "ya" : undefined}
              aria-pressed={saring === p.id}
              onClick={() => {
                setSaring(p.id);
                if (p.id === "selesai") setTampilkanSelesai(true);
              }}
            >
              {p.label}
              {hitungSaring(p.id) > 0 ? (
                <span className="rencana-pil-angka">{hitungSaring(p.id)}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="rencana-cari">
          <input
            className="isian"
            type="search"
            placeholder="Cari tugas..."
            aria-label="Cari tugas"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
          />

          <select
            className="isian"
            aria-label="Saring kategori"
            value={kategoriPilihan}
            onChange={(e) => setKategoriPilihan(e.target.value)}
          >
            <option value="semua">Semua Kategori</option>
            {KATEGORI_TUGAS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <select
            className="isian"
            aria-label="Saring penanggung jawab"
            value={penugasanPilihan}
            onChange={(e) => setPenugasanPilihan(e.target.value)}
          >
            <option value="semua">Semua penanggung jawab</option>
            {PENUGASAN.map((p) => (
              <option key={p} value={p}>
                {LABEL_PENUGASAN[p]}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="tombol tombol-sekunder"
            aria-pressed={tampilkanSelesai}
            onClick={() => setTampilkanSelesai(!tampilkanSelesai)}
          >
            {tampilkanSelesai ? "Sembunyikan selesai" : "Tampilkan selesai"}
          </button>
        </div>
      </section>

      {semuaTugas.length === 0 ? (
        <Kosong
          keadaan="Belum ada tugas."
          jalanKeluar="Mulai dari yang paling dekat dengan tanggal."
        >
          {bisaUbah ? (
            <>
              <button
                type="button"
                className="tombol tombol-utama"
                onClick={() => setLembarTemplate(true)}
              >
                Muat checklist bawaan
              </button>
              <button type="button" className="tombol tombol-sekunder" onClick={bukaTambah}>
                Tulis tugas sendiri
              </button>
            </>
          ) : null}
        </Kosong>
      ) : tugasTersaring.length === 0 ? (
        <Kosong
          keadaan="Tidak ada yang cocok dengan pencarian itu."
          jalanKeluar="Coba bersihkan kata kunci atau pilih kategori lain."
        >
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={() => {
              setKataKunci("");
              setKategoriPilihan("semua");
              setTampilkanSelesai(true);
            }}
          >
            Tampilkan semua
          </button>
        </Kosong>
      ) : (
        <div className="tumpuk">
          {URUTAN_KELOMPOK.map((kel) => {
            const daftarKel = kelompokTugas[kel];
            if (daftarKel.length === 0) return null;

            return (
              <section key={kel} aria-labelledby={`judul-kelompok-${kel}`} className="rencana-kelompok">
                <div className="rencana-kelompok-kepala">
                  <h2 id={`judul-kelompok-${kel}`} className="rencana-kelompok-judul">
                    <span
                      className="rencana-titik"
                      data-jenis={kel}
                      aria-hidden="true"
                    />
                    {LABEL_KELOMPOK[kel]}
                  </h2>
                  <span className="rencana-kelompok-lencana">{daftarKel.length} tugas</span>
                </div>

                <div className="rencana-daftar">
                  {daftarKel.map((t) => (
                    <article key={t.id} className="rencana-kartu" data-selesai={t.status === "selesai" ? "ya" : undefined}>
                      <div className="rencana-kartu-isi">
                        <TaskItem
                          tugas={t}
                          planId={plan.id}
                          onUbah={() => muatTugas()}
                          onBuka={() => bukaUbah(t)}
                        />
                        {(() => {
                          const pos = daftarPos.find((p) => p.id === t.budgetItemId);
                          if (!pos) return null;
                          return (
                            <p className="keterangan keterangan-rapat">
                              Nominal: <Rupiah nilai={pos.plannedAmount} /> ({pos.name})
                            </p>
                          );
                        })()}
                      </div>
                      <div className="rencana-kartu-sisi">
                        <LencanaStatus tugas={t} kelompok={kel} />
                        {bisaUbah ? (
                          <>
                            <button
                              type="button"
                              className="tombol tombol-sekunder tombol-kecil"
                              onClick={() => bukaUbah(t)}
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              className="tombol tombol-bahaya tombol-kecil"
                              onClick={() => setTugasDihapus(t)}
                            >
                              Hapus
                            </button>
                          </>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
          {tugasTersaring.length > batasTugas ? (
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setBatasTugas((n) => n + 20)}
            >
              Muat lebih
            </button>
          ) : null}
        </div>
      )}

      {/* Lembar Tambah / Ubah Tugas */}
      <Lembar
        buka={lembarBuka}
        judul={tugasDiedit ? "Ubah tugas" : "Tambah tugas"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpanTugas} noValidate className="tumpuk-sedang">
          <Isian label="Judul tugas" id="formJudul" galat={formGalat ?? undefined}>
            <input
              id="formJudul"
              className="isian"
              type="text"
              required
              placeholder="Misalnya: Booking dekorasi"
              value={formJudul}
              onChange={(e) => setFormJudul(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Kategori"
            id="formKategori"
            nilai={formKategori}
            onUbah={(v) => setFormKategori(v as KategoriTugas)}
            opsi={KATEGORI_TUGAS.map((k) => ({ nilai: k, label: k }))}
          />

          <Isian label="Tenggat waktu" id="formTenggat" petunjuk="Kosongkan jika belum ada tenggat pasti.">
            <input
              id="formTenggat"
              className="isian"
              type="date"
              value={formTenggat}
              onChange={(e) => setFormTenggat(e.target.value)}
            />
          </Isian>

          <PilihanTombol
            label="Prioritas"
            id="formPrioritas"
            nilai={formPrioritas}
            opsi={PRIORITAS.map((p) => ({ nilai: p, label: LABEL_PRIORITAS[p] }))}
            onUbah={setFormPrioritas}
          />

          <PilihanTombol
            label="Penanggung jawab"
            id="formPenugasan"
            nilai={formPenugasan}
            opsi={PENUGASAN.map((p) => ({ nilai: p, label: LABEL_PENUGASAN[p] }))}
            onUbah={setFormPenugasan}
          />

          <Pilih
            label="Nominal (pos anggaran)"
            id="formPos"
            nilai={formPosId}
            onUbah={setFormPosId}
            opsi={[
              { nilai: "", label: "Tanpa nominal" },
              ...daftarPos.map((p) => ({
                nilai: p.id,
                label: `${p.name} - ${rupiah(p.plannedAmount)}`,
              })),
            ]}
          />

          <Isian label="Catatan tambahan" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Keterangan dokumen, kontak, atau syarat..."
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

      {/* Lembar Muat Template */}
      <Lembar
        buka={lembarTemplate}
        judul="Muat checklist bawaan"
        onTutup={() => setLembarTemplate(false)}
      >
        <div className="tumpuk-sedang">
          <p className="keterangan">
            Pilih kategori untuk memuat daftar tugas standar pernikahan. Tugas yang sudah pernah
            kamu buat tidak akan diduplikasi.
          </p>

          <Pilih
            label="Kategori tugas"
            id="kategoriTemplate"
            nilai={kategoriTemplate}
            onUbah={(v) => setKategoriTemplate(v as KategoriTugas)}
            opsi={KATEGORI_TUGAS.map((k) => ({ nilai: k, label: k }))}
          />

          <div className="dialog-tombol">
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setLembarTemplate(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="tombol tombol-utama"
              onClick={muatTemplate}
              disabled={sedangMuatTemplate}
            >
              {sedangMuatTemplate ? "Memuat..." : "Muat tugas"}
            </button>
          </div>
        </div>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(tugasDihapus)}
        judul="Hapus tugas"
        isi="Tugas ini akan dihapus dari daftar."
        tombolYa="Hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setTugasDihapus(null)}
        onYa={konfirmasiHapus}
      />

      {bisaUbah ? (
        <button
          type="button"
          className="rencana-fab tanpa-cetak"
          aria-label="Tambah tugas baru"
          onClick={bukaTambah}
        >
          <IkonTambah size={18} />
          Tambah Tugas Baru
        </button>
      ) : null}
    </div>
  );
}

/** Lencana status di kanan kartu tugas. Diambil dari data, bukan dari contoh. */
function LencanaStatus({ tugas, kelompok }: { tugas: TugasLengkap; kelompok: KelompokWaktu }) {
  if (tugas.status === "selesai") {
    return <span className="rencana-status" data-jenis="selesai">Selesai</span>;
  }
  if (kelompok === "lewat") {
    return <span className="rencana-status" data-jenis="lewat">Terlambat</span>;
  }
  if (tugas.priority === "tinggi") {
    return <span className="rencana-status" data-jenis="tinggi">Tinggi</span>;
  }
  if (!tugas.dueDate) {
    return <span className="rencana-status" data-jenis="redup">Belum ada tenggat</span>;
  }
  return <span className="rencana-status" data-jenis="sedang">Sedang</span>;
}

/** Ikon bunga bergaya, dipakai sebagai hiasan kartu progres. */
function IkonBunga({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="7" r="3" />
      <circle cx="17.5" cy="11" r="3" />
      <circle cx="15.4" cy="17.4" r="3" />
      <circle cx="8.6" cy="17.4" r="3" />
      <circle cx="6.5" cy="11" r="3" />
    </svg>
  );
}

/** Hiasan bunga kecil lima lingkaran untuk sudut kartu. */
function IkonBungaKecil({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="4.5" r="3.2" />
      <circle cx="19" cy="9.5" r="3.2" />
      <circle cx="16.5" cy="17.8" r="3.2" />
      <circle cx="7.5" cy="17.8" r="3.2" />
      <circle cx="5" cy="9.5" r="3.2" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  );
}

/** Hati kecil untuk baris penyemangat di kartu progres. */
function IkonHati({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 20.5S3.5 14.6 3.5 9.2A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.5 3.2c0 5.4-8.5 11.3-8.5 11.3z" />
    </svg>
  );
}

/** Ikon plus untuk tombol tambah tugas. */
function IkonTambah({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
