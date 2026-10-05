"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { rupiah, selisihHari, tanggalPendekDari } from "@/lib/format";
import { BudgetBar } from "@/components/budget-bar";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  KATEGORI_UANG,
  type KategoriUang,
  LABEL_KATEGORI_UANG,
  type MetodeBayar,
  LABEL_METODE_BAYAR,
} from "@/lib/konstanta";
import type { budgetItems } from "@/db/schema";

type BudgetItem = typeof budgetItems.$inferSelect & {
  paidAmount: number;
  remaining: number;
  overBudget: boolean;
};

type VendorRingkas = {
  id: string;
  name: string;
  category: string;
  status: string;
  budgetItemId: string | null;
};

type Pembayaran = {
  id: string;
  vendorId: string;
  vendorName: string;
  budgetItemId: string | null;
  amount: number;
  paidAt: string;
  method: string;
  isFinal: boolean;
  notes: string | null;
};

type IsiAnggaran = {
  items: BudgetItem[];
  totals: { planned: number; paid: number; remaining: number };
  sebaranKategori: Record<string, number>;
  vendors: VendorRingkas[];
  payments: Pembayaran[];
};

// Warna bagian bilah sebaran, dipakai bergiliran.
//
// Tiga token saja, sesuai batas "dua warna inti plus satu aksen" di DESIGN.md
// bagian 3. Sebelumnya ada sembilan, dan satu layar dengan sembilan keluarga
// warna membuat tidak ada lagi yang menonjol; legenda tetap ada, jadi warna
// memang bukan satu-satunya penanda, tapi anggaran warnanya tetap dilanggar.
//
// Bagian ketiga memakai token garis, bukan token netral. Alasannya kontras:
// jalur bilah dan netral jaraknya hanya satu langkah, jadi bagian ketiga nyaris
// tidak terlihat. Garis punya kontras cukup terhadap jalur di kedua tema.
//
// Giliran berulang aman karena bagian yang bersebelahan selalu beda warna
// selama jumlah bagian lebih dari satu. Pembeda sesungguhnya tetap label di
// legenda, bukan warnanya.
const WARNA_SEBARAN = [
  "var(--color-marigold)",
  "var(--color-terracotta)",
  "var(--color-line)",
];

type TabAnggaran = "pos" | "pengeluaran";

const POS_BAWAAN_INDONESIA: Array<{
  name: string;
  category: KategoriUang;
  plannedAmount: number;
  notes: string;
}> = [
  {
    name: "Venue & Gedung Resepsi",
    category: "venue",
    plannedAmount: 15000000,
    notes: "Sewa gedung, kebersihan, dan genset",
  },
  {
    name: "Katering & Prasmanan Tamu",
    category: "katering",
    plannedAmount: 25000000,
    notes: "Paket prasmanan, stall pondokan, dan air mineral",
  },
  {
    name: "Dekorasi Pelaminan & Janur",
    category: "dekorasi",
    plannedAmount: 10000000,
    notes: "Pelaminan, lorong masuk, mini garden, dan photo booth",
  },
  {
    name: "Busana Pengantin & Rias (MUA)",
    category: "busana",
    plannedAmount: 8000000,
    notes: "Sewa kebaya/jas pengantin, make up akad & resepsi",
  },
  {
    name: "Dokumentasi Foto & Video",
    category: "dokumentasi",
    plannedAmount: 6000000,
    notes: "Liputan hari-H, album cetak, dan video cinematic",
  },
  {
    name: "Perlengkapan Prosesi Adat",
    category: "adat",
    plannedAmount: 3000000,
    notes: "Pemandu adat, seserahan, siraman",
  },
  {
    name: "Sound System, MC & Hiburan",
    category: "lainnya",
    plannedAmount: 4000000,
    notes: "MC akad/resepsi dan grup musik pengiring",
  },
  {
    name: "Undangan & Souvenir Tamu",
    category: "lainnya",
    plannedAmount: 3500000,
    notes: "Cetak undangan fisik/web dan souvenir",
  },
];

/**
 * Layar Anggaran & Pengeluaran.
 * Menghitung batas uang per pos serta perbandingan dengan pembayaran nyata.
 * Tidak ada angka karangan; "terpakai" dihitung dari pembayaran yang sudah keluar.
 *
 * Susunan mengikuti `docs/stitch_cute_wedding_planner/budget_vendor_tracker`.
 * Tiga hal dari rancangan itu sengaja tidak dipakai:
 * - Gambar vendor tidak ada. Belum ada fitur unggah gambar vendor.
 * - Status hiasan seperti "Lunas" atau "DP 50%" tidak disalin. Status nyata
 *   diambil dari pos anggaran dan pembayaran yang tercatat.
 * - Angka contoh di rancangan tidak dipakai. Semua angka di sini dihitung dari
 *   rencana yang sedang dibuka.
 */
export default function HalamanAnggaran() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  const {
    data,
    memuat: memuatAnggaran,
    galat: galatAnggaran,
    muatUlang: muatAnggaran,
  } = useMuat<IsiAnggaran>(planId ? `/api/plans/${planId}/budget-items` : null, {
    aktif: Boolean(planId),
  });

  const [cari, setCari] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [tab, setTab] = useState<TabAnggaran>("pos");

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<BudgetItem | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<BudgetItem | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const [sedangMuatBawaan, setSedangMuatBawaan] = useState(false);

  // Form states
  const [formNama, setFormNama] = useState("");
  const [formKategori, setFormKategori] = useState<KategoriUang>("venue");
  const [formBatas, setFormBatas] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormNama("");
    setFormKategori("venue");
    setFormBatas("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(p: BudgetItem) {
    setDiedit(p);
    setFormNama(p.name);
    setFormKategori(
      KATEGORI_UANG.includes(p.category as KategoriUang)
        ? (p.category as KategoriUang)
        : "lainnya",
    );
    setFormBatas(p.plannedAmount ? String(p.plannedAmount) : "");
    setFormCatatan(p.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formNama.trim()) {
      setFormGalat("Nama pos anggaran wajib diisi.");
      return;
    }

    const angkaBatas = parseInt(formBatas.replace(/\D/g, ""), 10);
    if (isNaN(angkaBatas) || angkaBatas < 0) {
      setFormGalat("Batas anggaran harus berupa angka rupiah positif.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      const payload = {
        name: formNama.trim(),
        category: formKategori,
        plannedAmount: angkaBatas,
        notes: formCatatan.trim() || null,
        sortOrder: diedit?.sortOrder ?? 0,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/budget-items/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Tersimpan");
      } else {
        await minta(`/api/plans/${planId}/budget-items`, {
          method: "POST",
          body: payload,
        });
        toast("Tersimpan");
      }

      setLembarBuka(false);
      await muatAnggaran();
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
      await minta(`/api/plans/${planId}/budget-items/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Dihapus");
      setDihapus(null);
      await muatAnggaran();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  async function pasangPosBawaan() {
    if (!planId) return;
    setSedangMuatBawaan(true);
    try {
      for (const pos of POS_BAWAAN_INDONESIA) {
        await minta(`/api/plans/${planId}/budget-items`, {
          method: "POST",
          body: pos,
        });
      }
      toast("Tersimpan");
      await muatAnggaran();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangMuatBawaan(false);
    }
  }

  const rawItems = data?.items ?? [];
  const totals = data?.totals ?? { planned: 0, paid: 0, remaining: 0 };
  const vendorList = data?.vendors ?? [];
  const bayarList = data?.payments ?? [];
  const sebaran = data?.sebaranKategori ?? {};

  const items = rawItems.filter((item) => {
    if (filterKategori !== "semua" && item.category !== filterKategori) return false;
    if (cari.trim()) {
      const q = cari.toLowerCase();
      const namaCocok = item.name.toLowerCase().includes(q);
      const catatanCocok = item.notes?.toLowerCase().includes(q);
      if (!namaCocok && !catatanCocok) return false;
    }
    return true;
  });

  const persenTerpakai =
    totals.planned > 0 ? Math.round((totals.paid / totals.planned) * 100) : 0;
  const persenSisa = totals.planned > 0 ? 100 - persenTerpakai : 0;
  const lewatBatas = totals.paid > totals.planned;

  // Sebaran rencana biaya per kategori. Yang bernilai nol tidak ditampilkan
  // supaya legenda tidak penuh pos yang belum diisi.
  const bagian = useMemo(() => {
    if (totals.planned <= 0) return [];
    return KATEGORI_UANG.map((k, i) => ({
      kategori: k,
      label: LABEL_KATEGORI_UANG[k],
      nilai: sebaran[k] ?? 0,
      persen: Math.round(((sebaran[k] ?? 0) / totals.planned) * 100),
      warna: WARNA_SEBARAN[i % WARNA_SEBARAN.length] ?? "var(--color-line)",
    })).filter((b) => b.nilai > 0);
  }, [sebaran, totals.planned]);

  const jumlahKategori = useMemo(
    () => new Set(rawItems.map((i) => i.category)).size,
    [rawItems],
  );

  const hari = plan ? selisihHari(plan.weddingDate) : null;
  const teksHari =
    hari === null ? null : hari > 0 ? `H-${hari} Hari` : hari === 0 ? "Hari ini" : "Sudah lewat";

  if (memuatPlan || (planId && memuatAnggaran && !data)) {
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

  if (galatAnggaran) {
    return <Gagal apa="Daftar anggaran" onCoba={muatAnggaran} />;
  }

  return (
    <div className="anggaran">
      {/* Kepala halaman: judul di kiri, satu aksi utama di kanan. Tombol
          melayang disembunyikan di `expanded` supaya aksi yang sama tidak punya
          dua pemicu (DESIGN.md komposisi desktop poin 11). */}
      <div className="kepala-halaman">
        <div>
          <h1>Anggaran</h1>
          <p>Semua pos anggaranmu tersusun rapi di sini.</p>
        </div>
        {bisaUbah ? (
          <button
            type="button"
            className="tombol tombol-utama hanya-expanded"
            onClick={bukaTambah}
          >
            <IkonTambah size={18} />
            Tambah pos
          </button>
        ) : null}
      </div>

      {/* Jalan pintas memuat pos bawaan. Satu-satunya jalan kedua menuju
          penambahan, jadi sekunder. */}
      <div className="aksi-baris">
        {bisaUbah ? (
          <button
            type="button"
            className="tombol tombol-sekunder"
            disabled={sedangMuatBawaan}
            onClick={pasangPosBawaan}
          >
            {sedangMuatBawaan ? "Memasang..." : "Muat pos bawaan"}
          </button>
        ) : null}
      </div>

      {/* Kartu besar: total rencana anggaran */}
      <section className="anggaran-hero">
        <div className="anggaran-hero-kepala">
          <span className="anggaran-ikon-bulat" aria-hidden="true">
            <IkonDompet size={18} />
          </span>
          <span className="anggaran-hero-label">Total Anggaran Menikah</span>
        </div>

        <div className="anggaran-hero-isi">
          <div className="anggaran-hero-baris">
            <span className="anggaran-hero-angka">{rupiah(totals.planned)}</span>
            <span className="anggaran-pil-status" data-lewat={lewatBatas ? "ya" : "tidak"}>
              {lewatBatas ? "Lewat batas" : "Aman"}
            </span>
          </div>

          {bagian.length > 0 ? (
            <>
              <div
                className="anggaran-sebar"
                role="img"
                aria-label={`Sebaran rencana biaya untuk ${bagian.length} kategori`}
              >
                {bagian.map((b) => (
                  <span
                    key={b.kategori}
                    className="anggaran-sebar-bagian"
                    style={{ width: `${b.persen}%`, background: b.warna }}
                  />
                ))}
              </div>

              <ul className="anggaran-legenda">
                {bagian.map((b) => (
                  <li key={b.kategori} className="anggaran-legenda-item">
                    <span
                      className="anggaran-legenda-titik"
                      style={{ background: b.warna }}
                      aria-hidden="true"
                    />
                    {b.label}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="anggaran-catatan">
              Belum ada pos anggaran. Pasang pos bawaan atau tulis pos sendiri dulu.
            </p>
          )}

          <div className="anggaran-realisasi">
            <div>
              <span className="anggaran-realisasi-label">Realisasi Dana ({persenTerpakai}%)</span>
              <span className="anggaran-realisasi-nilai">{rupiah(totals.paid)}</span>
            </div>
            <span className="anggaran-realisasi-ket">dari {jumlahKategori} kategori terisi</span>
          </div>

          <div className="anggaran-stat-grid">
            <div className="anggaran-stat-kotak">
              <span className="anggaran-stat-label">Terpakai Saat Ini</span>
              <span className="anggaran-stat-nilai">{rupiah(totals.paid)}</span>
              <span className="anggaran-stat-ket">{persenTerpakai}% dari rencana</span>
            </div>
            <div className="anggaran-stat-kotak">
              <span className="anggaran-stat-label">
                {lewatBatas ? "Defisit Anggaran" : "Sisa Anggaran Aman"}
              </span>
              <span className="anggaran-stat-nilai" data-lewat={lewatBatas ? "ya" : "tidak"}>
                {rupiah(totals.remaining)}
              </span>
              <span className="anggaran-stat-ket">
                {lewatBatas ? "Perlu ditambah atau ditekan" : `${persenSisa}% cadangan`}
              </span>
            </div>
          </div>
        </div>
      </section>


      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah pos anggaran tidak
          bisa dilakukan sampai ada koneksi.
        </p>
      ) : null}

      {/* Satu panel untuk tab, saringan, daftar pos, dan rincian pengeluaran,
          supaya keadaan kosong tidak lagi mengambang di kanvas kosong
          (DESIGN.md komposisi desktop poin 5 dan 6). */}
      <div className="panel-daftar" aria-label="Daftar anggaran">
        <div className="panel-daftar-kepala">
          <div className="anggaran-tab" role="tablist" aria-label="Bagian anggaran">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "pos"}
              className="anggaran-tab-pil"
              data-aktif={tab === "pos" ? "ya" : "tidak"}
              onClick={() => setTab("pos")}
            >
              <IkonKedai size={16} />
              Daftar Pos
              <span className="anggaran-pil-angka">{rawItems.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "pengeluaran"}
              className="anggaran-tab-pil"
              data-aktif={tab === "pengeluaran" ? "ya" : "tidak"}
              onClick={() => setTab("pengeluaran")}
            >
              <IkonStruk size={16} />
              Rincian Pengeluaran
              <span className="anggaran-pil-angka">{bayarList.length}</span>
            </button>
          </div>
        </div>

      {tab === "pos" ? (
        <>
          {/* Saringan */}
          <div className="anggaran-saring">
            <input
              type="search"
              className="isian anggaran-cari"
              placeholder="Cari pos anggaran..."
              aria-label="Cari pos anggaran"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
            <label htmlFor="filterKategori" className="sr-only">
              Saring kategori
            </label>
            <select
              id="filterKategori"
              className="isian anggaran-pilih"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              <option value="semua">Semua kategori</option>
              {KATEGORI_UANG.map((k) => (
                <option key={k} value={k}>
                  {LABEL_KATEGORI_UANG[k]}
                </option>
              ))}
            </select>
          </div>

          {rawItems.length === 0 ? (
            <Kosong
              keadaan="Belum ada pos anggaran."
              jalanKeluar="Tambahkan dulu total yang sudah direncanakan, lalu isi pembayarannya."
            >
              {bisaUbah ? (
                <>
                  {/* Kepala halaman sudah memakai tombol utama "Tambah pos".
                      Dua jalan menuju penambahan (muat bawaan atau tulis
                      sendiri) jadi dua cara berbeda, jadi di keadaan kosong
                      keduanya sekunder supaya hanya ada satu tombol utama
                      (DESIGN.md komposisi desktop poin 11). */}
                  <button
                    type="button"
                    className="tombol tombol-sekunder"
                    disabled={sedangMuatBawaan}
                    onClick={pasangPosBawaan}
                  >
                    {sedangMuatBawaan ? "Memasang..." : "Muat pos bawaan"}
                  </button>
                  <button type="button" className="tombol tombol-sekunder" onClick={bukaTambah}>
                    Tulis pos sendiri
                  </button>
                </>
              ) : null}
            </Kosong>
          ) : items.length === 0 ? (
            <Kosong
              keadaan="Tidak ada yang cocok dengan pencarian itu."
              jalanKeluar="Coba periksa kata kunci atau ubah filter kategori."
            />
          ) : (
            <div className="anggaran-daftar">
              {items.map((item) => {
                const kategori = item.category as KategoriUang;
                const vendorTertaut = vendorList.filter((v) => v.budgetItemId === item.id);

                return (
                  <article
                    key={item.id}
                    className="anggaran-kartu"
                    data-lewat={item.overBudget ? "ya" : "tidak"}
                  >
                    <div className="anggaran-kartu-kepala">
                      <div className="anggaran-kartu-teks">
                        <div className="anggaran-kartu-baris">
                          <h2 className="anggaran-kartu-judul">{item.name}</h2>
                          <span className="anggaran-chip">
                            {LABEL_KATEGORI_UANG[kategori] ?? item.category}
                          </span>
                          {item.overBudget ? (
                            <span className="anggaran-chip anggaran-chip-bata">Lewat batas</span>
                          ) : item.paidAmount >= item.plannedAmount && item.plannedAmount > 0 ? (
                            <span className="anggaran-chip">Lunas</span>
                          ) : null}
                        </div>
                        {item.notes ? <p className="anggaran-kartu-catatan">{item.notes}</p> : null}
                      </div>

                      <div className="anggaran-kartu-aksi">
                        {bisaUbah ? (
                          <>
                            <button
                              type="button"
                              className="tombol tombol-sekunder anggaran-tombol-kecil"
                              onClick={() => bukaUbah(item)}
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              className="tombol tombol-sekunder anggaran-tombol-kecil anggaran-tombol-hapus"
                              onClick={() => setDihapus(item)}
                            >
                              Hapus
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="anggaran-kartu-angka">
                      <span>
                        Rencana <strong>{rupiah(item.plannedAmount)}</strong>
                      </span>
                      <span>
                        Terpakai <strong>{rupiah(item.paidAmount)}</strong>
                      </span>
                    </div>

                    <BudgetBar terpakai={item.paidAmount} batas={item.plannedAmount} ringkas />

                    {vendorTertaut.length > 0 ? (
                      <div className="anggaran-vendor">
                        <span className="anggaran-vendor-label">Vendor tertaut:</span>
                        {vendorTertaut.map((v) => (
                          <Link key={v.id} className="tautan-kalimat" href={`/rencana/vendor/${v.id}`}>
                            {v.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Rincian pengeluaran: baris pembayaran yang benar-benar tercatat */}
          <div className="anggaran-bayar-kepala">
            <h2 className="anggaran-bayar-judul">Riwayat Pembayaran Terakhir</h2>
            <span className="anggaran-bayar-jumlah">{bayarList.length} pembayaran tercatat</span>
          </div>

          {bayarList.length === 0 ? (
            <Kosong
              keadaan="Belum ada pembayaran tercatat."
              jalanKeluar="Catat pembayaran dari halaman vendor supaya rinciannya muncul di sini."
            >
              {/* Mengarahkan ke daftar vendor, bukan menambah apa pun di layar
                  ini, jadi bukan aksi utama layar (DESIGN.md komposisi desktop
                  poin 11). */}
              <Link className="tombol tombol-sekunder" href="/rencana/vendor">
                Buka daftar vendor
              </Link>
            </Kosong>
          ) : (
            <div className="anggaran-bayar-daftar">
              {bayarList.map((p) => (
                <div key={p.id} className="anggaran-bayar">
                  <span className="anggaran-bayar-ikon" aria-hidden="true">
                    <IkonDompet size={16} />
                  </span>
                  <div className="anggaran-bayar-teks">
                    <span className="anggaran-bayar-nama">{p.vendorName}</span>
                    <span className="anggaran-bayar-ket">
                      {tanggalPendekDari(p.paidAt)} •{" "}
                      {LABEL_METODE_BAYAR[p.method as MetodeBayar] ?? p.method}
                      {p.isFinal ? " • Pelunasan" : ""}
                    </span>
                    {p.notes ? <span className="anggaran-bayar-catatan">{p.notes}</span> : null}
                  </div>
                  <span className="anggaran-bayar-nilai">{rupiah(-p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="anggaran-bayar-total">
            <span>Total pengeluaran</span>
            <strong>{rupiah(totals.paid)}</strong>
          </div>
        </>
      )}
      </div>
      {/* Akhir panel daftar anggaran */}

      {/* Catatan penutup, isinya dihitung dari data nyata */}
      <div className="anggaran-tips">
        <span className="anggaran-tips-ikon" aria-hidden="true">
          <IkonKilau size={20} />
        </span>
        <div>
          <span className="anggaran-tips-judul">Catatan Anggaran</span>
          <p className="anggaran-tips-teks">
            {lewatBatas
              ? `Pengeluaran sudah ${rupiah(Math.abs(totals.remaining))} melebihi rencana. Tinjau pos yang paling besar dulu.`
              : `Sisa ${rupiah(totals.remaining)} masih tersedia untuk pos yang belum berjalan.`}
          </p>
        </div>
      </div>

      {/* Lembar Tambah / Ubah */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah pos anggaran" : "Tambah pos anggaran"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate className="tumpuk-sedang">
          <Isian label="Nama pos anggaran" id="formNama" galat={formGalat ?? undefined}>
            <input
              id="formNama"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Katering Prasmanan"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Kategori"
            id="formKategori"
            nilai={formKategori}
            onUbah={(v) => setFormKategori(v as KategoriUang)}
            opsi={KATEGORI_UANG.map((k) => ({
              nilai: k,
              label: LABEL_KATEGORI_UANG[k],
            }))}
          />

          <Isian
            label="Batas rencana biaya (Rp)"
            id="formBatas"
            bantuan="Berapa perkiraan batas maksimal dana yang dialokasikan untuk pos ini."
          >
            <input
              id="formBatas"
              className="isian"
              type="number"
              min={0}
              required
              placeholder="Contoh: 12000000"
              value={formBatas}
              onChange={(e) => setFormBatas(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan tambahan (opsional)" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Contoh: Sudah termasuk 400 porsi dan 4 stall makanan kecil."
              value={formCatatan}
              onChange={(e) => setFormCatatan(e.target.value)}
            />
          </Isian>

          {/* Pratinjau sisa. Untuk pos baru, terpakai selalu nol. */}
          {formBatas ? (
            <div className="kotak-catatan">
              <div>
                <strong>Sudah terpakai dari vendor:</strong>{" "}
                {rupiah(diedit ? diedit.paidAmount : 0)}
              </div>
              <div>
                <strong>Perkiraan sisa:</strong>{" "}
                {rupiah(parseInt(formBatas || "0", 10) - (diedit ? diedit.paidAmount : 0))}
              </div>
            </div>
          ) : null}

          <div className="dialog-tombol">
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setLembarBuka(false)}
            >
              Batal
            </button>
            <button type="submit" className="tombol tombol-utama" disabled={sedangSimpan}>
              {sedangSimpan ? "Menyimpan..." : "Simpan pos"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus pos anggaran"
        isi={`Pos "${dihapus?.name ?? ""}" akan dihapus. Vendor yang tertaut tidak akan terhapus, tetapi tidak lagi masuk ke hitungan pos ini.`}
        tombolYa="Hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />

      {bisaUbah ? (
        <button
          type="button"
          className="anggaran-fab tanpa-cetak"
          aria-label="Tambah pos anggaran baru"
          onClick={bukaTambah}
        >
          <IkonTambah size={18} />
          Tambah Pos Baru
        </button>
      ) : null}
    </div>
  );
}

function IkonKilau({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.4l1.9 5.3 5.3 1.9-5.3 1.9L12 16.8l-1.9-5.3L4.8 9.6l5.3-1.9L12 2.4z" />
      <path d="M18.6 15.4l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z" />
    </svg>
  );
}

function IkonDompet({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7.5A2.5 2.5 0 015.5 5h11A2.5 2.5 0 0119 7.5v1" />
      <rect x="3" y="7.5" width="18" height="11.5" rx="2.5" />
      <circle cx="16" cy="13.2" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IkonKedai({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16l-1.2 6.5A4 4 0 0115 14H9a4 4 0 01-3.8-3.5L4 4z" />
      <path d="M6 18h12" />
      <path d="M9 21h6" />
    </svg>
  );
}

function IkonStruk({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-3-1.6L12 21l-3-1.6L6 21V3z" />
      <path d="M9.5 8h5" />
      <path d="M9.5 11.5h5" />
      <path d="M9.5 15h3" />
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
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
