"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { TabRencana } from "@/components/tab-rencana";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, toast } from "@/components/toast";
import { Isian, Pilih } from "@/components/field";
import { Rupiah } from "@/components/rupiah";
import { minta, pesanGalat } from "@/lib/api-client";
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

      toast("Vendor berhasil ditambahkan");
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
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>Vendor Pernikahan</h1>
          <p>Daftar rekanan vendor, status kesepakatan, dan pencatatan pembayaran.</p>
        </div>
        <div>
          <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
            + Tambah vendor
          </button>
        </div>
      </div>

      <TabRencana />

      {/* Ringkasan Keuangan Vendor */}
      {vendors.length > 0 ? (
        <div className="rekap" style={{ marginBottom: 16 }}>
          <div className="rekap-item">
            <span className="rekap-nilai">{vendors.length}</span>
            <span className="rekap-label">Total vendor</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai">
              <Rupiah nilai={rekap.totalDibook} />
            </span>
            <span className="rekap-label">Total kontrak</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
              <Rupiah nilai={rekap.totalTerbayar} />
            </span>
            <span className="rekap-label">Sudah terbayar</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai" style={{ color: rekap.totalSisa > 0 ? "var(--color-bata)" : undefined }}>
              <Rupiah nilai={rekap.totalSisa} />
            </span>
            <span className="rekap-label">Sisa tagihan</span>
          </div>
        </div>
      ) : null}

      {/* Filter Bar */}
      <div
        className="kartu"
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
          padding: "12px 16px",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <input
            type="search"
            className="isian"
            placeholder="Cari nama vendor atau kontak..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="isian"
            style={{ width: "auto" }}
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

          <select
            className="isian"
            style={{ width: "auto" }}
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

      {/* Daftar Vendor */}
      {daftarTersaring.length === 0 ? (
        <Kosong
          keadaan={vendors.length === 0 ? "Belum ada vendor terdaftar." : "Tidak ada vendor yang cocok dengan filter."}
          jalanKeluar={
            vendors.length === 0
              ? "Catat vendor gedung, katering, foto, atau rias pengantin kamu."
              : "Coba ubah kata kunci atau saringan kategori."
          }
        >
          {vendors.length === 0 ? (
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              Tambah vendor
            </button>
          ) : null}
        </Kosong>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {daftarTersaring.map((v) => {
            const statusColor =
              v.status === "selesai"
                ? "var(--color-primary)"
                : v.status === "dibook"
                  ? "var(--color-ink)"
                  : "var(--color-muted)";

            return (
              <div
                key={v.id}
                className="kartu"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "var(--text-h3)" }}>
                        <Link
                          href={`/rencana/vendor/${v.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {v.name}
                        </Link>
                      </h3>
                      <span
                        style={{
                          fontSize: "var(--text-kecil)",
                          color: "var(--color-muted)",
                          display: "inline-block",
                          marginTop: 2,
                        }}
                      >
                        {LABEL_KATEGORI_UANG[v.category as KategoriUang] ?? v.category}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: "var(--text-kecil)",
                        fontWeight: 600,
                        background: "var(--color-netral)",
                        color: statusColor,
                      }}
                    >
                      {LABEL_STATUS_VENDOR[v.status as StatusVendor] ?? v.status}
                    </span>
                  </div>

                  {v.contactName || v.phone ? (
                    <div style={{ marginTop: 8, fontSize: "var(--text-kecil)" }}>
                      {v.contactName ? <div>Kontak: {v.contactName}</div> : null}
                      {v.phone ? (
                        <div style={{ marginTop: 2 }}>
                          <a
                            href={`https://wa.me/${v.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--color-primary)" }}
                          >
                            WhatsApp: {v.phone}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {v.plannedAmount > 0 ? (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid var(--color-garis)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "var(--text-kecil)",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--color-muted)" }}>Kontrak</div>
                        <div style={{ fontWeight: 600 }}>
                          <Rupiah nilai={v.plannedAmount} />
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "var(--color-muted)" }}>Terbayar</div>
                        <div style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                          <Rupiah nilai={v.paidAmount} />
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "var(--color-muted)" }}>Sisa</div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: v.remaining > 0 ? "var(--color-bata)" : "var(--color-ink)",
                          }}
                        >
                          <Rupiah nilai={v.remaining} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    paddingTop: 8,
                    borderTop: "1px solid var(--color-garis)",
                  }}
                >
                  <Link
                    href={`/rencana/vendor/${v.id}`}
                    className="tombol tombol-sekunder"
                    style={{ minHeight: 36, padding: "0 12px", fontSize: "var(--text-kecil)" }}
                  >
                    Detail & Pembayaran
                  </Link>
                </div>
              </div>
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
        <form onSubmit={simpanVendor} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Nama vendor" id="formNama" galat={formGalat ?? undefined}>
            <input
              id="formNama"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Sanggar Rias Melati, Catering Berkah"
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
    </div>
  );
}
