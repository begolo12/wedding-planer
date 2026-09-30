"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
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

type TugasLengkap = TugasBaris & {
  budgetItemId?: string | null;
  sortOrder?: number;
};

/**
 * Layar Daftar Tugas pernikahan.
 *
 * Mengelompokkan tugas berdasarkan waktu:
 * - Lewat jatuh tempo
 * - Hari ini
 * - Minggu ini
 * - Belum ada tenggat
 * - Sudah selesai (bisa disembunyikan)
 */
export default function HalamanTugas() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const {
    data: dataTugas,
    memuat: memuatTugas,
    galat: galatTugas,
    muatUlang: muatTugas,
  } = useMuat<{ tasks: TugasLengkap[] }>(planId ? `/api/plans/${planId}/tasks` : null, {
    aktif: Boolean(planId),
  });

  const [kategoriPilihan, setKategoriPilihan] = useState<string>("semua");
  const [tampilkanSelesai, setTampilkanSelesai] = useState<boolean>(false);
  const [kataKunci, setKataKunci] = useState<string>("");

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
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setTugasDiedit(null);
    setFormJudul("");
    setFormKategori("Administrasi");
    setFormTenggat("");
    setFormPrioritas("sedang");
    setFormPenugasan("saya");
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
        notes: formCatatan.trim() || null,
      };

      if (tugasDiedit) {
        await minta(`/api/plans/${planId}/tasks/${tugasDiedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Perubahan tugas tersimpan");
      } else {
        await minta(`/api/plans/${planId}/tasks`, {
          method: "POST",
          body: { ...payload, status: "belum", sortOrder: 0 },
        });
        toast("Tugas baru ditambahkan");
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
      toast("Tugas berhasil dihapus");
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

  // Filter tugas
  const tugasTersaring = useMemo(() => {
    return semuaTugas.filter((t) => {
      if (kategoriPilihan !== "semua" && t.category !== kategoriPilihan) {
        return false;
      }
      if (!tampilkanSelesai && t.status === "selesai") {
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
  }, [semuaTugas, kategoriPilihan, tampilkanSelesai, kataKunci]);

  // Kelompokkan per waktu
  const kelompokTugas = useMemo(() => {
    const hasil: Record<KelompokWaktu, TugasLengkap[]> = {
      lewat: [],
      hariIni: [],
      mingguIni: [],
      tanpaTenggat: [],
      selesai: [],
    };

    for (const t of tugasTersaring) {
      const kel = kelompokkan(t.dueDate, t.status);
      hasil[kel].push(t);
    }
    return hasil;
  }, [tugasTersaring]);

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
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Rencana</h1>
          <p>Kelola seluruh rincian persiapan pernikahan kamu.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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
        </div>
      </div>

      <TabRencana />

      {/* Saringan dan pencarian */}
      <div
        className="panel"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="isian"
            type="search"
            placeholder="Cari tugas..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            style={{ flex: "1 1 200px" }}
          />

          <select
            className="isian"
            value={kategoriPilihan}
            onChange={(e) => setKategoriPilihan(e.target.value)}
            style={{ flex: "0 0 auto", width: "auto" }}
          >
            <option value="semua">Semua Kategori</option>
            {KATEGORI_TUGAS.map((k) => (
              <option key={k} value={k}>
                {k}
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
      </div>

      {semuaTugas.length === 0 ? (
        <Kosong
          keadaan="Belum ada tugas."
          jalanKeluar="Mulai dari yang paling dekat dengan tanggal, atau muat checklist bawaan."
        >
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
        </Kosong>
      ) : tugasTersaring.length === 0 ? (
        <Kosong
          keadaan="Tidak ada tugas yang cocok."
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
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {URUTAN_KELOMPOK.map((kel) => {
            const daftarKel = kelompokTugas[kel];
            if (daftarKel.length === 0) return null;

            return (
              <section key={kel} aria-labelledby={`judul-kelompok-${kel}`}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 8,
                    paddingBottom: 4,
                    borderBottom: "1px solid var(--color-line)",
                  }}
                >
                  <h2
                    id={`judul-kelompok-${kel}`}
                    style={{
                      margin: 0,
                      fontSize: "var(--text-h3)",
                      color: kel === "lewat" ? "var(--color-bata)" : "var(--color-ink)",
                    }}
                  >
                    {LABEL_KELOMPOK[kel]}
                  </h2>
                  <span style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
                    {daftarKel.length} tugas
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {daftarKel.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                        <TaskItem
                          tugas={t}
                          planId={plan.id}
                          onUbah={() => muatTugas()}
                          onBuka={() => bukaUbah(t)}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 4, flex: "0 0 auto" }}>
                        <button
                          type="button"
                          className="tombol tombol-sekunder"
                          style={{ minHeight: 36, padding: "0 10px", fontSize: "var(--text-kecil)" }}
                          onClick={() => bukaUbah(t)}
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="tombol tombol-sekunder"
                          style={{
                            minHeight: 36,
                            padding: "0 10px",
                            fontSize: "var(--text-kecil)",
                            color: "var(--color-bata)",
                          }}
                          onClick={() => setTugasDihapus(t)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Lembar Tambah / Ubah Tugas */}
      <Lembar
        buka={lembarBuka}
        judul={tugasDiedit ? "Ubah tugas" : "Tambah tugas"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpanTugas} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Judul tugas" id="formJudul" galat={formGalat ?? undefined}>
            <input
              id="formJudul"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Booking DP gedung acara"
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0 }}>
            Pilih kategori untuk memuat daftar tugas standar pernikahan. Tugas yang sudah pernah
            kamu buat tidak akan diduplikasi.
          </p>

          <Pilih
            label="Kategori checklist"
            id="kategoriTemplate"
            nilai={kategoriTemplate}
            onUbah={(v) => setKategoriTemplate(v as KategoriTugas)}
            opsi={KATEGORI_TUGAS.map((k) => ({ nilai: k, label: k }))}
          />

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
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
        judul="Hapus tugas ini?"
        isi={`Tugas "${tugasDihapus?.title ?? ""}" akan dihapus permanen.`}
        tombolYa="Ya, hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setTugasDihapus(null)}
        onYa={konfirmasiHapus}
      />
    </div>
  );
}
