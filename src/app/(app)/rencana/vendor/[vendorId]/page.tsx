"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { Lembar, DialogKonfirmasi, toast } from "@/components/toast";
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
  METODE_BAYAR,
  type MetodeBayar,
  LABEL_METODE_BAYAR,
} from "@/lib/konstanta";
import { tanggalPanjangDari } from "@/lib/format";

type VendorDetail = {
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
};

type PaymentItem = {
  id: string;
  amount: number;
  paidAt: string;
  method: string;
  isFinal: boolean;
  notes: string | null;
  createdAt: string;
};

/**
 * Layar Detail Vendor dan Pembayaran Termin.
 * Pasangan dapat mencatat DP, cicilan bertahap, dan pelunasan vendor.
 */
export default function HalamanDetailVendor() {
  const params = useParams<{ vendorId: string }>();
  const router = useRouter();
  const vendorId = params?.vendorId;

  const { plan, planId, memuat: memuatPlan, galat: galatPlan } = usePlan();

  const {
    data,
    memuat: memuatData,
    galat: galatData,
    muatUlang,
  } = useMuat<{ vendor: VendorDetail; payments: PaymentItem[] }>(
    planId && vendorId ? `/api/plans/${planId}/vendors/${vendorId}` : null,
    { aktif: Boolean(planId && vendorId) },
  );

  // Lembar Catat Pembayaran
  const [bukaBayar, setBukaBayar] = useState(false);
  const [bayarJumlah, setBayarJumlah] = useState("");
  const [bayarTanggal, setBayarTanggal] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [bayarMetode, setBayarMetode] = useState<MetodeBayar>("transfer");
  const [bayarLunas, setBayarLunas] = useState(false);
  const [bayarCatatan, setBayarCatatan] = useState("");
  const [sedangSimpanBayar, setSedangSimpanBayar] = useState(false);
  const [galatBayar, setGalatBayar] = useState<string | null>(null);

  // Lembar Edit Vendor
  const [bukaUbahVendor, setBukaUbahVendor] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editKategori, setEditKategori] = useState<KategoriUang>("venue");
  const [editStatus, setEditStatus] = useState<StatusVendor>("calon");
  const [editKontak, setEditKontak] = useState("");
  const [editTelepon, setEditTelepon] = useState("");
  const [editAlamat, setEditAlamat] = useState("");
  const [editCatatan, setEditCatatan] = useState("");
  const [sedangSimpanVendor, setSedangSimpanVendor] = useState(false);
  const [galatUbahVendor, setGalatUbahVendor] = useState<string | null>(null);

  // Dialog Hapus Pembayaran
  const [hapusBayarId, setHapusBayarId] = useState<string | null>(null);
  const [sedangHapusBayar, setSedangHapusBayar] = useState(false);

  // Dialog Hapus Vendor
  const [bukaHapusVendor, setBukaHapusVendor] = useState(false);
  const [sedangHapusVendor, setSedangHapusVendor] = useState(false);

  function mulaiUbahVendor(v: VendorDetail) {
    setEditNama(v.name);
    setEditKategori(
      KATEGORI_UANG.includes(v.category as KategoriUang)
        ? (v.category as KategoriUang)
        : "venue",
    );
    setEditStatus(
      STATUS_VENDOR.includes(v.status as StatusVendor)
        ? (v.status as StatusVendor)
        : "calon",
    );
    setEditKontak(v.contactName ?? "");
    setEditTelepon(v.phone ?? "");
    setEditAlamat(v.address ?? "");
    setEditCatatan(v.notes ?? "");
    setGalatUbahVendor(null);
    setBukaUbahVendor(true);
  }

  async function simpanPerubahanVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!planId || !vendorId) return;

    if (!editNama.trim()) {
      setGalatUbahVendor("Nama vendor wajib diisi.");
      return;
    }

    setSedangSimpanVendor(true);
    setGalatUbahVendor(null);

    try {
      await minta(`/api/plans/${planId}/vendors/${vendorId}`, {
        method: "PATCH",
        body: {
          name: editNama.trim(),
          category: editKategori,
          status: editStatus,
          contactName: editKontak.trim() || null,
          phone: editTelepon.trim() || null,
          address: editAlamat.trim() || null,
          notes: editCatatan.trim() || null,
        },
      });

      toast("Data vendor diperbarui");
      setBukaUbahVendor(false);
      await muatUlang();
    } catch (err) {
      setGalatUbahVendor(pesanGalat(err));
    } finally {
      setSedangSimpanVendor(false);
    }
  }

  async function simpanPembayaran(e: React.FormEvent) {
    e.preventDefault();
    if (!planId || !vendorId) return;

    const nominal = parseInt(bayarJumlah.replace(/\D/g, ""), 10);
    if (!nominal || nominal <= 0) {
      setGalatBayar("Masukkan jumlah pembayaran yang valid.");
      return;
    }
    if (!bayarTanggal) {
      setGalatBayar("Tanggal pembayaran wajib diisi.");
      return;
    }

    setSedangSimpanBayar(true);
    setGalatBayar(null);

    try {
      await minta(`/api/plans/${planId}/vendors/${vendorId}/payments`, {
        method: "POST",
        body: {
          amount: nominal,
          paidAt: bayarTanggal,
          method: bayarMetode,
          isFinal: bayarLunas,
          notes: bayarCatatan.trim() || null,
        },
      });

      toast("Pembayaran berhasil dicatat");
      setBukaBayar(false);
      setBayarJumlah("");
      setBayarLunas(false);
      setBayarCatatan("");
      await muatUlang();
    } catch (err) {
      setGalatBayar(pesanGalat(err));
    } finally {
      setSedangSimpanBayar(false);
    }
  }

  async function konfirmasiHapusBayar() {
    if (!planId || !vendorId || !hapusBayarId) return;
    setSedangHapusBayar(true);
    try {
      await minta(
        `/api/plans/${planId}/vendors/${vendorId}/payments/${hapusBayarId}`,
        { method: "DELETE" },
      );
      toast("Catatan pembayaran dihapus");
      setHapusBayarId(null);
      await muatUlang();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapusBayar(false);
    }
  }

  async function konfirmasiHapusVendor() {
    if (!planId || !vendorId) return;
    setSedangHapusVendor(true);
    try {
      await minta(`/api/plans/${planId}/vendors/${vendorId}`, {
        method: "DELETE",
      });
      toast("Vendor berhasil dihapus");
      router.push("/rencana/vendor");
    } catch (err) {
      toast(pesanGalat(err));
      setSedangHapusVendor(false);
    }
  }

  if (memuatPlan || (planId && vendorId && memuatData && !data)) {
    return <Kerangka baris={6} />;
  }

  if (galatPlan) {
    return <Gagal apa="Rencana pernikahan" onCoba={muatUlang} />;
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

  if (galatData || !data) {
    return <Gagal apa="Data detail vendor" onCoba={muatUlang} />;
  }

  const { vendor, payments } = data;
  const sudahLunas =
    payments.some((p) => p.isFinal) ||
    (vendor.plannedAmount > 0 && vendor.remaining <= 0);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link className="tautan-kalimat" href="/rencana/vendor">
          ← Kembali ke daftar vendor
        </Link>
      </div>

      <div className="kepala-halaman">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>{vendor.name}</h1>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: "var(--text-kecil)",
                fontWeight: 600,
                background: "var(--color-netral)",
                color: "var(--color-ink)",
              }}
            >
              {LABEL_STATUS_VENDOR[vendor.status as StatusVendor] ?? vendor.status}
            </span>
            {sudahLunas ? (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: "var(--text-kecil)",
                  fontWeight: 600,
                  background: "var(--color-netral)",
                  color: "var(--color-primary)",
                }}
              >
                Lunas
              </span>
            ) : null}
          </div>
          <p style={{ margin: "4px 0 0" }}>
            Kategori: {LABEL_KATEGORI_UANG[vendor.category as KategoriUang] ?? vendor.category}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={() => mulaiUbahVendor(vendor)}
          >
            Ubah info
          </button>
          <button
            type="button"
            className="tombol tombol-utama"
            onClick={() => {
              setBayarJumlah("");
              setBayarTanggal(new Date().toISOString().slice(0, 10));
              setBayarMetode("transfer");
              setBayarLunas(false);
              setBayarCatatan("");
              setGalatBayar(null);
              setBukaBayar(true);
            }}
          >
            + Catat bayar
          </button>
        </div>
      </div>

      {/* Ringkasan Finansial Vendor */}
      <div className="rekap" style={{ marginBottom: 16 }}>
        <div className="rekap-item">
          <span className="rekap-nilai">
            <Rupiah nilai={vendor.plannedAmount} />
          </span>
          <span className="rekap-label">
            {vendor.budgetItemName ? `Kontrak (${vendor.budgetItemName})` : "Total kontrak"}
          </span>
        </div>
        <div className="rekap-item">
          <span className="rekap-nilai" style={{ color: "var(--color-primary)" }}>
            <Rupiah nilai={vendor.paidAmount} />
          </span>
          <span className="rekap-label">Sudah terbayar</span>
        </div>
        <div className="rekap-item">
          <span
            className="rekap-nilai"
            style={{ color: vendor.remaining > 0 ? "var(--color-bata)" : undefined }}
          >
            <Rupiah nilai={vendor.remaining} />
          </span>
          <span className="rekap-label">Sisa tagihan</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, alignItems: "start" }}>
        {/* Kolom Kiri: Info Kontak & Catatan */}
        <div className="kartu" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-h3)" }}>Informasi Kontak</h2>

          <div>
            <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
              Narahubung (PIC)
            </div>
            <div>{vendor.contactName || "Belum ada narahubung"}</div>
          </div>

          <div>
            <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
              Nomor WhatsApp / Telepon
            </div>
            {vendor.phone ? (
              <div>
                <a
                  href={`https://wa.me/${vendor.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--color-primary)", fontWeight: 600 }}
                >
                  {vendor.phone} (Buka WhatsApp)
                </a>
              </div>
            ) : (
              <div>Belum ada nomor telepon</div>
            )}
          </div>

          <div>
            <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>Alamat</div>
            <div>{vendor.address || "Belum ada alamat"}</div>
          </div>

          {vendor.notes ? (
            <div>
              <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>Catatan</div>
              <div style={{ whiteSpace: "pre-line", fontSize: "var(--text-kecil)" }}>
                {vendor.notes}
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--color-garis)" }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              style={{ color: "var(--color-bata)", width: "100%" }}
              onClick={() => setBukaHapusVendor(true)}
            >
              Hapus vendor ini
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Pembayaran */}
        <div className="kartu" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-h3)" }}>Riwayat Pembayaran</h2>
            <button
              type="button"
              className="tombol tombol-sekunder"
              style={{ minHeight: 44, padding: "0 12px", fontSize: "var(--text-kecil)" }}
              onClick={() => {
                setBayarJumlah("");
                setBayarTanggal(new Date().toISOString().slice(0, 10));
                setBayarMetode("transfer");
                setBayarLunas(false);
                setBayarCatatan("");
                setGalatBayar(null);
                setBukaBayar(true);
              }}
            >
              + Catat bayar
            </button>
          </div>

          {payments.length === 0 ? (
            <Kosong
              keadaan="Belum ada riwayat pembayaran."
              jalanKeluar="Catat uang muka (DP) atau cicilan pertama untuk vendor ini."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {payments.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    padding: 12,
                    borderRadius: 4,
                    border: "1px solid var(--color-garis)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--text-h3)" }}>
                        <Rupiah nilai={p.amount} />
                      </span>
                      {p.isFinal ? (
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: "var(--text-kecil)",
                            fontWeight: 600,
                            background: "var(--color-netral)",
                            color: "var(--color-primary)",
                          }}
                        >
                          Pelunasan
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "var(--text-kecil)",
                            color: "var(--color-muted)",
                          }}
                        >
                          Termin {idx + 1}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "var(--text-kecil)", color: "var(--color-muted)", marginTop: 2 }}>
                      {tanggalPanjangDari(p.paidAt)} • Melalui{" "}
                      {LABEL_METODE_BAYAR[p.method as MetodeBayar] ?? p.method}
                      {p.notes ? ` • ${p.notes}` : ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="tombol tombol-sekunder"
                    style={{
                      padding: "0 8px",
                      fontSize: "var(--text-kecil)",
                      color: "var(--color-bata)",
                    }}
                    onClick={() => setHapusBayarId(p.id)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lembar Catat Pembayaran */}
      <Lembar
        buka={bukaBayar}
        judul="Catat pembayaran vendor"
        onTutup={() => setBukaBayar(false)}
      >
        <form onSubmit={simpanPembayaran} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Jumlah pembayaran (Rupiah)" id="bayarJumlah" galat={galatBayar ?? undefined}>
            <input
              id="bayarJumlah"
              className="isian"
              type="number"
              min="1000"
              step="1000"
              required
              placeholder="Contoh: 5000000"
              value={bayarJumlah}
              onChange={(e) => setBayarJumlah(e.target.value)}
            />
          </Isian>

          <Isian label="Tanggal pembayaran" id="bayarTanggal">
            <input
              id="bayarTanggal"
              className="isian"
              type="date"
              required
              value={bayarTanggal}
              onChange={(e) => setBayarTanggal(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Metode pembayaran"
            id="bayarMetode"
            nilai={bayarMetode}
            onUbah={(v) => setBayarMetode(v as MetodeBayar)}
            opsi={METODE_BAYAR.map((m) => ({ nilai: m, label: LABEL_METODE_BAYAR[m] }))}
          />

          <div className="isian-grup">
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={bayarLunas}
                onChange={(e) => setBayarLunas(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span>Tandai sebagai pelunasan akhir</span>
            </label>
          </div>

          <Isian label="Catatan atau keterangan" id="bayarCatatan">
            <input
              id="bayarCatatan"
              className="isian"
              type="text"
              placeholder="Contoh: DP 30%, Cicilan kedua, dll."
              value={bayarCatatan}
              onChange={(e) => setBayarCatatan(e.target.value)}
            />
          </Isian>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setBukaBayar(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="tombol tombol-utama"
              disabled={sedangSimpanBayar}
            >
              {sedangSimpanBayar ? "Menyimpan..." : "Simpan pembayaran"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Lembar Ubah Vendor */}
      <Lembar
        buka={bukaUbahVendor}
        judul="Ubah data vendor"
        onTutup={() => setBukaUbahVendor(false)}
      >
        <form onSubmit={simpanPerubahanVendor} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Isian label="Nama vendor" id="editNama" galat={galatUbahVendor ?? undefined}>
            <input
              id="editNama"
              className="isian"
              type="text"
              required
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Kategori"
            id="editKategori"
            nilai={editKategori}
            onUbah={(v) => setEditKategori(v as KategoriUang)}
            opsi={KATEGORI_UANG.map((k) => ({ nilai: k, label: LABEL_KATEGORI_UANG[k] }))}
          />

          <Pilih
            label="Status"
            id="editStatus"
            nilai={editStatus}
            onUbah={(v) => setEditStatus(v as StatusVendor)}
            opsi={STATUS_VENDOR.map((s) => ({ nilai: s, label: LABEL_STATUS_VENDOR[s] }))}
          />

          <Isian label="Nama narahubung (PIC)" id="editKontak">
            <input
              id="editKontak"
              className="isian"
              type="text"
              value={editKontak}
              onChange={(e) => setEditKontak(e.target.value)}
            />
          </Isian>

          <Isian label="Nomor WhatsApp" id="editTelepon">
            <input
              id="editTelepon"
              className="isian"
              type="tel"
              value={editTelepon}
              onChange={(e) => setEditTelepon(e.target.value)}
            />
          </Isian>

          <Isian label="Alamat" id="editAlamat">
            <input
              id="editAlamat"
              className="isian"
              type="text"
              value={editAlamat}
              onChange={(e) => setEditAlamat(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan" id="editCatatan">
            <textarea
              id="editCatatan"
              className="isian"
              rows={3}
              value={editCatatan}
              onChange={(e) => setEditCatatan(e.target.value)}
            />
          </Isian>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setBukaUbahVendor(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="tombol tombol-utama"
              disabled={sedangSimpanVendor}
            >
              {sedangSimpanVendor ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus Pembayaran */}
      <DialogKonfirmasi
        buka={Boolean(hapusBayarId)}
        judul="Hapus catatan pembayaran?"
        isi="Catatan pembayaran ini akan dihapus dari histori dan sisa tagihan akan disesuaikan."
        tombolYa="Ya, hapus"
        sedangJalan={sedangHapusBayar}
        onTutup={() => setHapusBayarId(null)}
        onYa={konfirmasiHapusBayar}
      />

      {/* Dialog Konfirmasi Hapus Vendor */}
      <DialogKonfirmasi
        buka={bukaHapusVendor}
        judul="Hapus vendor ini?"
        isi={`Vendor "${vendor.name}" beserta seluruh histori pembayarannya akan dihapus.`}
        tombolYa="Ya, hapus vendor"
        sedangJalan={sedangHapusVendor}
        onTutup={() => setBukaHapusVendor(false)}
        onYa={konfirmasiHapusVendor}
      />
    </div>
  );
}
