"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
import { TabRencana } from "@/components/tab-rencana";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { Rupiah } from "@/components/rupiah";
import { minta, pesanGalat } from "@/lib/api-client";
import { normalkanNomorWa } from "@/lib/format";
import {
  STATUS_VENDOR,
  type StatusVendor,
  LABEL_STATUS_VENDOR,
  KATEGORI_UANG,
  type KategoriUang,
  LABEL_KATEGORI_UANG,
} from "@/lib/konstanta";

type VendorItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  contactName: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  budgetItemId: string | null;
  budgetItemName: string | null;
  plannedAmount: number;
  paidAmount: number;
  remaining: number;
  belumAdaPembayaran: boolean;
};

/**
 * Layar Daftar Vendor.
 * Menampilkan seluruh vendor pernikahan berdasarkan status: calon, dibook, atau selesai.
 */
export default function HalamanVendor() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  const {
    data,
    memuat: memuatVendor,
    galat: galatVendor,
    muatUlang: muatVendor,
  } = useMuat<{ vendors: VendorItem[] }>(
    planId ? `/api/plans/${planId}/vendors` : null,
    { aktif: Boolean(planId) },
  );

  const [tabStatus, setTabStatus] = useState<string>("semua");
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [kataKunci, setKataKunci] = useState("");

  // Lembar Tambah Vendor
  const [lembarBuka, setLembarBuka] = useState(false);
  const [formNama, setFormNama] = useState("");
  const [formKategori, setFormKategori] = useState<KategoriUang>("venue");
  const [formStatus, setFormStatus] = useState<StatusVendor>("calon");
  const [formKontak, setFormKontak] = useState("");
  const [formTelepon, setFormTelepon] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setFormNama("");
    setFormKategori("venue");
    setFormStatus("calon");
    setFormKontak("");
    setFormTelepon("");
    setFormAlamat("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function simpanVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formNama.trim()) {
      setFormGalat("Nama vendor wajib diisi.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      await minta(`/api/plans/${planId}/vendors`, {
        method: "POST",
        body: {
          name: formNama.trim(),
          category: formKategori,
          status: formStatus,
          contactName: formKontak.trim() || null,
          phone: formTelepon.trim() || null,
          address: formAlamat.trim() || null,
          notes: formCatatan.trim() || null,
        },
      });

      toast("Tersimpan");
      setLembarBuka(false);
      await muatVendor();
    } catch (err) {
      setFormGalat(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
    }
  }

  const vendors = data?.vendors ?? [];

  const daftarTersaring = useMemo(() => {
    return vendors.filter((v) => {
      if (tabStatus !== "semua" && v.status !== tabStatus) return false;
      if (filterKategori !== "semua" && v.category !== filterKategori) return false;
      if (kataKunci.trim()) {
        const cari = kataKunci.toLowerCase();
        const cocokNama = v.name.toLowerCase().includes(cari);
        const cocokKontak = v.contactName?.toLowerCase().includes(cari) ?? false;
        const cocokKategori = v.category.toLowerCase().includes(cari);
        if (!cocokNama && !cocokKontak && !cocokKategori) return false;
      }
      return true;
    });
  }, [vendors, tabStatus, filterKategori, kataKunci]);

  // Rekap kalkulasi
  const rekap = useMemo(() => {
    let totalDibook = 0;
    let totalTerbayar = 0;
    let totalSisa = 0;

    for (const v of vendors) {
      if (v.status !== "calon") {
        totalDibook += v.plannedAmount;
        totalTerbayar += v.paidAmount;
        totalSisa += v.remaining;
      }
    }

    return { totalDibook, totalTerbayar, totalSisa };
  }, [vendors]);

  if (memuatPlan || (planId && memuatVendor && !data)) {
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

  if (galatVendor) {
    return <Gagal apa="Daftar vendor" onCoba={muatVendor} />;
  }

  return (
    <div className="tumpuk-sedang">
      <div className="kepala-halaman">
        <div>
          <h1>Vendor</h1>
          <p>Daftar rekanan vendor, status kesepakatan, dan pencatatan pembayaran.</p>
        </div>
        <div>
          {bisaUbah ? (
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              + Tambah vendor
            </button>
          ) : null}
        </div>
      </div>

      <TabRencana />

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah vendor tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      {/* Ringkasan Keuangan Vendor */}
      {vendors.length > 0 ? (
        <div className="rekap">
          <div className="rekap-item">
            <span className="rekap-nilai">{vendors.length}</span>
            <span className="rekap-label">Total vendor</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai rekap-nilai-kecil">
              <Rupiah nilai={rekap.totalDibook} />
            </span>
            <span className="rekap-label">Total kontrak</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai rekap-nilai-kecil teks-aksen">
              <Rupiah nilai={rekap.totalTerbayar} />
            </span>
            <span className="rekap-label">Sudah terbayar</span>
          </div>
          <div className="rekap-item">
            <span
              className="rekap-nilai rekap-nilai-kecil"
              data-nada={rekap.totalSisa > 0 ? "bahaya" : undefined}
            >
              <Rupiah nilai={rekap.totalSisa} />
            </span>
            <span className="rekap-label">Sisa tagihan</span>
          </div>
        </div>
      ) : null}

      {/* Filter Bar */}
      <div className="kartu tumpuk-rapat">
        <input
          type="search"
          className="isian"
          placeholder="Cari nama vendor atau kontak..."
          aria-label="Cari vendor"
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
        />

        <div className="filter-baris">
          <div className="filter-grup">
            <label htmlFor="filterStatusVendor">Status</label>
            <select
              id="filterStatusVendor"
              className="isian isian-mini"
              value={tabStatus}
              onChange={(e) => setTabStatus(e.target.value)}
            >
              <option value="semua">Semua status</option>
              {STATUS_VENDOR.map((s) => (
                <option key={s} value={s}>
                  {LABEL_STATUS_VENDOR[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-grup">
            <label htmlFor="filterKategoriVendor">Kategori</label>
            <select
              id="filterKategoriVendor"
              className="isian isian-mini"
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
        </div>
      </div>

      {/* Daftar Vendor */}
      {daftarTersaring.length === 0 ? (
        <Kosong
          keadaan={vendors.length === 0 ? "Belum ada vendor." : "Tidak ada yang cocok dengan pencarian itu."}
          jalanKeluar={
            vendors.length === 0
              ? "Tambahkan vendor yang sudah kamu tanda tangani."
              : "Coba ubah kata kunci atau saringan kategori."
          }
        >
          {vendors.length === 0 ? (
            bisaUbah ? (
              <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
                Tambah vendor
              </button>
            ) : null
          ) : null}
        </Kosong>
      ) : (
        <div className="kisi-kartu">
          {daftarTersaring.map((v) => {
            const statusNada =
              v.status === "selesai" ? "aksen" : v.status === "dibook" ? undefined : "redup";

            return (
              <article key={v.id} className="kartu tumpuk-rapat">
                <div className="bagian-kepala">
                  <div className="tumpuk-rapat isi-lentur-sempit">
                    <h2 className="judul-tautan">
                      <Link href={`/rencana/vendor/${v.id}`}>{v.name}</Link>
                    </h2>
                    <span className="keterangan keterangan-rapat">
                      {LABEL_KATEGORI_UANG[v.category as KategoriUang] ?? v.category}
                    </span>
                  </div>

                  <span className="lencana" data-nada={statusNada}>
                    {LABEL_STATUS_VENDOR[v.status as StatusVendor] ?? v.status}
                  </span>
                </div>

                {v.contactName || v.phone ? (
                  <div className="tumpuk-rapat">
                    {v.contactName ? (
                      <span className="keterangan keterangan-rapat">
                        Kontak: {v.contactName}
                      </span>
                    ) : null}
                    {v.phone && normalkanNomorWa(v.phone) ? (
                      <a
                        className="tautan-kalimat"
                        href={`https://wa.me/${normalkanNomorWa(v.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp: {v.phone}
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {v.plannedAmount > 0 ? (
                  <div className="kartu-kaki">
                    <div className="kaki-angka">
                      <div>
                        <div className="kaki-angka-label">Kontrak</div>
                        <div className="kaki-angka-nilai">
                          <Rupiah nilai={v.plannedAmount} />
                        </div>
                      </div>
                      <div>
                        <div className="kaki-angka-label">Terbayar</div>
                        <div className="kaki-angka-nilai teks-aksen">
                          <Rupiah nilai={v.paidAmount} />
                        </div>
                      </div>
                      <div>
                        <div className="kaki-angka-label">Sisa</div>
                        <div
                          className="kaki-angka-nilai"
                          data-nada={v.remaining > 0 ? "bahaya" : undefined}
                        >
                          <Rupiah nilai={v.remaining} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="kartu-kaki">
                  <div className="aksi-baris" data-ratakan="akhir">
                    <Link
                      href={`/rencana/vendor/${v.id}`}
                      className="tombol tombol-sekunder tombol-kecil"
                    >
                      Detail &amp; Pembayaran
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Lembar Tambah Vendor */}
      <Lembar
        buka={lembarBuka}
        judul="Tambah vendor baru"
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpanVendor} noValidate className="tumpuk-sedang">
          <Isian label="Nama vendor" id="formNama" galat={formGalat ?? undefined}>
            <input
              id="formNama"
              className="isian"
              type="text"
              required
              placeholder="Nama vendor"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Kategori vendor"
            id="formKategori"
            nilai={formKategori}
            onUbah={(v) => setFormKategori(v as KategoriUang)}
            opsi={KATEGORI_UANG.map((k) => ({ nilai: k, label: LABEL_KATEGORI_UANG[k] }))}
          />

          <Pilih
            label="Status kesepakatan"
            id="formStatus"
            nilai={formStatus}
            onUbah={(v) => setFormStatus(v as StatusVendor)}
            opsi={STATUS_VENDOR.map((s) => ({ nilai: s, label: LABEL_STATUS_VENDOR[s] }))}
          />

          <Isian label="Nama narahubung (PIC)" id="formKontak">
            <input
              id="formKontak"
              className="isian"
              type="text"
              placeholder="Mbak Dwi / Mas Andi"
              value={formKontak}
              onChange={(e) => setFormKontak(e.target.value)}
            />
          </Isian>

          <Isian label="Nomor WhatsApp / Telepon" id="formTelepon" petunjuk="Contoh: 081234567890">
            <input
              id="formTelepon"
              className="isian"
              type="tel"
              placeholder="081234567890"
              value={formTelepon}
              onChange={(e) => setFormTelepon(e.target.value)}
            />
          </Isian>

          <Isian label="Alamat / Lokasi" id="formAlamat">
            <input
              id="formAlamat"
              className="isian"
              type="text"
              placeholder="Kota atau alamat studio / kantor"
              value={formAlamat}
              onChange={(e) => setFormAlamat(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan tambahan" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Paket yang ditawarkan, bonus, atau catatan negosiasi."
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
    </div>
  );
}
