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
  const [lembarSaring, setLembarSaring] = useState(false);
  const [tugasDiedit, setTugasDiedit] = useState<TugasLengkap | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // Lembar muat checklist template
  const [lembarTemplate, setLembarTemplate] = useState(false);
  const [kategoriTemplate, setKategoriTemplate] = useState<KategoriTugas>("Administrasi");
  const [sedangMuatTemplate, setSedangMuatTemplate] = useState(false);

  // Dialog konfirmasi hapus
  const [tugasDihapus, setTugasDihapus] = useState<TugasLengkap | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);
  const [sedangUrut, setSedangUrut] = useState(false);

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

  /**
   * Geser satu tugas satu langkah, lalu simpan urutan seluruh daftar.
   *
   * Yang dikirim ke server adalah daftar id lengkap, bukan diff, sesuai
   * docs/04-API-Contract.md. Alasannya ditulis di sana: kiriman berbasis
   * selisih meninggalkan urutan setengah berubah kalau satu request gagal,
   * sedangkan daftar lengkap selalu bisa dikirim ulang.
   *
   * Urutan ditampilkan lebih dulu, lalu dimuat ulang dari server supaya angka
   * yang tampil tidak pernah menyimpang dari yang tersimpan.
   */
  async function geserTugas(tugas: TugasLengkap, arah: -1 | 1) {
    if (!planId || sedangUrut) return;

    const urutanSekarang = semuaTugas.map((t) => t.id);
    const dari = urutanSekarang.indexOf(tugas.id);
    const ke = dari + arah;
    if (dari < 0 || ke < 0 || ke >= urutanSekarang.length) return;

    const urutanBaru = [...urutanSekarang];
    [urutanBaru[dari], urutanBaru[ke]] = [urutanBaru[ke], urutanBaru[dari]];

    setSedangUrut(true);
    try {
      await minta(`/api/plans/${planId}/tasks/reorder`, {
        method: "POST",
        body: { taskIds: urutanBaru },
      });
      await muatTugas();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangUrut(false);
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

  // Chip saringan aktif untuk ditampilkan di badan layar (docs/21-Arah-Tampilan.md v5.0
  // Pola 4). Tiap chip bisa dilepas sendiri, dan ada satu tombol untuk
  // melepas semuanya. Urutannya tetap: cepat, kategori, penanggung jawab,
  // lalu tampilkan selesai.
  const chipAktif = useMemo(() => {
    const daftar: { kunci: string; label: string; lepas: () => void }[] = [];
    if (saring !== "semua") {
      const label = SARINGAN.find((s) => s.id === saring)?.label ?? saring;
      daftar.push({ kunci: "cepat", label, lepas: () => setSaring("semua") });
    }
    if (kataKunci.trim()) {
      daftar.push({
        kunci: "cari",
        label: `"${kataKunci.trim()}"`,
        lepas: () => setKataKunci(""),
      });
    }
    if (kategoriPilihan !== "semua") {
      daftar.push({
        kunci: "kategori",
        label: kategoriPilihan,
        lepas: () => setKategoriPilihan("semua"),
      });
    }
    if (penugasanPilihan !== "semua") {
      daftar.push({
        kunci: "penugasan",
        label: LABEL_PENUGASAN[penugasanPilihan as keyof typeof LABEL_PENUGASAN] ?? penugasanPilihan,
        lepas: () => setPenugasanPilihan("semua"),
      });
    }
    if (tampilkanSelesai && saring !== "selesai") {
      daftar.push({
        kunci: "selesai",
        label: "Tampilkan selesai",
        lepas: () => setTampilkanSelesai(false),
      });
    }
    return daftar;
  }, [saring, kataKunci, kategoriPilihan, penugasanPilihan, tampilkanSelesai]);

  const jumlahSaringAktif = chipAktif.length;

  function hapusSemuaSaring() {
    setSaring("semua");
    setKataKunci("");
    setKategoriPilihan("semua");
    setPenugasanPilihan("semua");
    setTampilkanSelesai(false);
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
      setelahMingguIni: [],
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
      {/* Kepala halaman: judul di kiri, satu aksi utama di kanan. Tombol
          melayang disembunyikan di `expanded` supaya aksi yang sama tidak punya
          dua pemicu satu aksi utama per layar. */}
      <div className="kepala-halaman">
        <div>
          <h1>Tugas</h1>
          <p>Semua yang harus selesai sebelum hari besar, dikelompokkan menurut waktunya.</p>
        </div>
        {bisaUbah ? (
          <button
            type="button"
            className="tombol tombol-utama hanya-expanded"
            onClick={bukaTambah}
          >
            Tambah tugas
          </button>
        ) : null}
      </div>

      {/* Jalan pintas template: tombol sendiri di layar lebar. Di layar sempit
          tombol ini disembunyikan dan digantikan pil "Muat template" di baris
          saringan (lihat .rencana-template-inline), supaya daftar tugas tidak
          ditunda satu baris penuh. */}
      <div className="aksi-baris aksi-template">
        {bisaUbah ? (
          <button
            type="button"
            className="tombol tombol-sekunder rencana-template-pil"
            onClick={() => setLembarTemplate(true)}
          >
            Muat template
          </button>
        ) : null}
      </div>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah tugas tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      {/* Dua kolom di desktop: kolom utama berisi panel daftar, rel kanan
          berisi kartu ringkasan progres satu kolom isi plus satu rel ringkasan di layar lebar.
          Di bawah 1023px tetap satu kolom seperti sekarang. */}
      <div className="grid-daftar">
      {/* Satu panel untuk tab modul, saringan, daftar, dan keadaan kosongnya,
          supaya keadaan kosong tidak lagi mengambang di kanvas kosong dan
          perataannya sama dengan baris saringan di atasnya
          (satu keadaan kosong dan gagal per layar, masing-masing dengan satu jalan keluar). */}
      <div className="panel-daftar" aria-label="Daftar tugas">
        <div className="panel-daftar-kepala">
      <TabRencana />
        </div>

      {/* Saringan sesuai pola lembar saringan di docs/21-Arah-Tampilan.md bagian 5.
          Sebelumnya lima kontrol (pil cepat, pencarian, dua dropdown, tombol
          tampilkan selesai) duduk bertumpuk di badan layar. Di lebar 390px
          tumpukan itu menghabiskan lebih dari 250px, jadi daftar tugas baru
          mulai jauh di bawah lipatan. Sekarang yang tampil di badan layar
          hanya satu baris: tombol "Saring" plus chip saringan yang aktif.
          Sisanya masuk lembar bawah. */}
      <section className="rencana-saring" aria-label="Saringan tugas">
        <div className="rencana-saring-baris">
          <button
            type="button"
            className="tombol tombol-sekunder rencana-saring-tombol"
            onClick={() => setLembarSaring(true)}
            aria-haspopup="dialog"
          >
            <IkonSaring />
            Saring
            {jumlahSaringAktif > 0 ? (
              <span className="rencana-saring-jumlah">{jumlahSaringAktif}</span>
            ) : null}
          </button>

          {bisaUbah ? (
            <button
              type="button"
              className="rencana-template-inline"
              onClick={() => setLembarTemplate(true)}
            >
              Muat template
            </button>
          ) : null}
        </div>

        {/* Chip saringan aktif, maksimal satu baris. Gunanya supaya pengguna
            tahu daftar sedang tersaring dan bisa melepasnya tanpa membuka
            lembar. */}
        {chipAktif.length > 0 ? (
          <div className="rencana-chip-aktif">
            {chipAktif.map((c) => (
              <button
                key={c.kunci}
                type="button"
                className="rencana-chip"
                onClick={c.lepas}
                aria-label={`Hapus saringan ${c.label}`}
              >
                {c.label}
                <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" className="rencana-chip-hapus" onClick={hapusSemuaSaring}>
              Hapus semua
            </button>
          </div>
        ) : null}
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
                className="tombol tombol-sekunder"
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
                        {bisaUbah ? (
                          <div className="rencana-urut" role="group" aria-label={`Urutkan ${t.title}`}>
                            <button
                              type="button"
                              className="tombol tombol-sekunder tombol-kecil rencana-urut-tombol"
                              onClick={() => geserTugas(t, -1)}
                              disabled={sedangUrut}
                              aria-label={`Naikkan ${t.title}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 14 7-7 7 7" /></svg>
                            </button>
                            <button
                              type="button"
                              className="tombol tombol-sekunder tombol-kecil rencana-urut-tombol"
                              onClick={() => geserTugas(t, 1)}
                              disabled={sedangUrut}
                              aria-label={`Turunkan ${t.title}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10 7 7 7-7" /></svg>
                            </button>
                          </div>
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
      </div>
      {/* Akhir panel daftar tugas */}

      {/* Rel kanan: ringkasan progres tugas. Isi rel hanya ringkasan atau
          aksi cepat, jadi kartu ini yang pindah ke sini, bukan daftarnya
          satu kolom isi plus satu rel ringkasan di layar lebar. */}
      <aside className="rel-samping">
        {/* Kartu progres: angka besar, bar, dan satu kalimat yang jujur
            mengikuti keadaan, bukan pujian yang tidak cocok dengan 0 persen
            (docs/21-Arah-Tampilan.md bagian 5). */}
        <section className="kartu-progres">
          <p className="kartu-progres-angka">
            {totalTugas > 0 ? (
              <>
                {persenProgres}% <span>dari {totalTugas} tugas selesai</span>
              </>
            ) : (
              <>
                Belum ada tugas <span>belum ada apa pun untuk diselesaikan</span>
              </>
            )}
          </p>
          <div className="rencana-bar">
            <div className="rencana-bar-isi" style={{ width: `${persenProgres}%` }} />
          </div>
          <p className="kartu-progres-ket">
            {teksMundur ? `Hari besar ${teksMundur}. ` : ""}
            {tugasSelesai > 0
              ? `${tugasSelesai} tugas selesai, ${totalTugas - tugasSelesai} masih tersisa.`
              : "Belum ada tugas yang selesai. Mulai dari yang paling dekat dengan tanggal."}
          </p>
        </section>
      </aside>
      </div>
      {/* Akhir grid dua kolom */}

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
              placeholder="Keterangan dokumen, kontak, atau syarat…"
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
              {sedangSimpan ? "Menyimpan…" : "Simpan"}
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
              {sedangMuatTemplate ? "Memuat…" : "Muat tugas"}
            </button>
          </div>
        </div>
      </Lembar>

      {/* Lembar Saringan (pola lembar saringan di docs/21-Arah-Tampilan.md bagian 5).
          Semua kontrol penyaring berkumpul di sini supaya badan layar bersih
          dan daftar tugas mulai dekat dengan kepala layar. */}
      <Lembar buka={lembarSaring} judul="Saring tugas" onTutup={() => setLembarSaring(false)}>
        <div className="tumpuk-sedang">
          <div>
            <span className="rencana-lembar-label" id="saring-cepat-label">
              Tampilkan
            </span>
            <div className="rencana-saring-pil" role="group" aria-labelledby="saring-cepat-label">
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
          </div>

          <label className="rencana-lembar-isian">
            <span className="rencana-lembar-label">Cari</span>
            <input
              className="isian"
              type="search"
              placeholder="Cari tugas…"
              aria-label="Cari tugas"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
            />
          </label>

          <label className="rencana-lembar-isian">
            <span className="rencana-lembar-label">Kategori</span>
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
          </label>

          <label className="rencana-lembar-isian">
            <span className="rencana-lembar-label">Penanggung jawab</span>
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
          </label>

          <label className="sakelar">
            <input
              type="checkbox"
              checked={tampilkanSelesai}
              onChange={(e) => setTampilkanSelesai(e.target.checked)}
            />
            <span className="sakelar-jalur" aria-hidden="true">
              <span className="sakelar-titik" />
            </span>
            Tampilkan tugas yang sudah selesai
          </label>

          <div className="dialog-tombol">
            <button type="button" className="tombol tombol-sekunder" onClick={hapusSemuaSaring}>
              Hapus semua
            </button>
            <button
              type="button"
              className="tombol tombol-utama"
              onClick={() => setLembarSaring(false)}
            >
              Terapkan
            </button>
          </div>
        </div>
      </Lembar>

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
          aria-label="Tambah tugas"
          onClick={bukaTambah}
        >
          <IkonTambah size={22} />
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

/** Ikon plus untuk tombol tambah tugas. */
function IkonSaring({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}

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
