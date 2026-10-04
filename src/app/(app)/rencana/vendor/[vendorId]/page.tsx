"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
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
import { tanggalPanjangDari, hariIni, normalkanNomorWa } from "@/lib/format";

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

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

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
  const [bayarTanggal, setBayarTanggal] = useState(hariIni());
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

      toast("Tersimpan");
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

      toast("Tersimpan");
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
      toast("Dihapus");
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
      toast("Dihapus");
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
    <div className="tumpuk-sedang">
      <Link className="tautan-kalimat" href="/rencana/vendor">
        ← Kembali ke daftar vendor
      </Link>

      <div className="kepala-halaman">
        <div>
          <div className="aksi-baris">
            <h1>{vendor.name}</h1>
            <span className="lencana">
              {LABEL_STATUS_VENDOR[vendor.status as StatusVendor] ?? vendor.status}
            </span>
            {sudahLunas ? <span className="lencana lencana-aksen">Lunas</span> : null}
          </div>
          <p>
            Kategori: {LABEL_KATEGORI_UANG[vendor.category as KategoriUang] ?? vendor.category}
          </p>
        </div>

        <div className="aksi-baris">
          {bisaUbah ? (
            <>
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
                  setBayarTanggal(hariIni());
                  setBayarMetode("transfer");
                  setBayarLunas(false);
                  setBayarCatatan("");
                  setGalatBayar(null);
                  setBukaBayar(true);
                }}
              >
                Catat pembayaran
              </button>
            </>
          ) : null}
        </div>
      </div>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah data vendor tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      {/* Ringkasan Finansial Vendor */}
      <div className="rekap">
        <div className="rekap-item">
          <span className="rekap-nilai rekap-nilai-kecil">
            <Rupiah nilai={vendor.plannedAmount} />
          </span>
          <span className="rekap-label">
            {vendor.budgetItemName ? `Kontrak (${vendor.budgetItemName})` : "Total kontrak"}
          </span>
        </div>
        <div className="rekap-item">
          <span className="rekap-nilai rekap-nilai-kecil teks-aksen">
            <Rupiah nilai={vendor.paidAmount} />
          </span>
          <span className="rekap-label">Sudah terbayar</span>
        </div>
        <div className="rekap-item">
          <span
            className="rekap-nilai rekap-nilai-kecil"
            data-nada={vendor.remaining > 0 ? "bahaya" : undefined}
          >
            <Rupiah nilai={vendor.remaining} />
          </span>
          <span className="rekap-label">Sisa tagihan</span>
        </div>
      </div>

      <div className="kolom-detail">
        {/* Kolom Kiri: Info Kontak & Catatan */}
        <div className="kartu tumpuk-sedang">
          <h2>Informasi Kontak</h2>

          <div className="tumpuk-rapat">
            <span className="keterangan keterangan-rapat">
              Narahubung (PIC)
            </span>
            <span>{vendor.contactName || "Belum ada narahubung"}</span>
          </div>

          <div className="tumpuk-rapat">
            <span className="keterangan keterangan-rapat">
              Nomor WhatsApp / Telepon
            </span>
            {vendor.phone && normalkanNomorWa(vendor.phone) ? (
              <a
                className="tautan-kalimat"
                href={`https://wa.me/${normalkanNomorWa(vendor.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {vendor.phone} (Buka WhatsApp)
              </a>
            ) : (
              <span>Belum ada nomor telepon</span>
            )}
          </div>

          <div className="tumpuk-rapat">
            <span className="keterangan keterangan-rapat">
              Alamat
            </span>
            <span>{vendor.address || "Belum ada alamat"}</span>
          </div>

          {vendor.notes ? (
            <div className="tumpuk-rapat">
              <span className="keterangan keterangan-rapat">
                Catatan
              </span>
              <p className="blok-teks">{vendor.notes}</p>
            </div>
          ) : null}

          <div className="kartu-kaki">
            {bisaUbah ? (
              <button
                type="button"
                className="tombol tombol-bahaya tombol-lebar"
                onClick={() => setBukaHapusVendor(true)}
              >
                Hapus vendor ini
              </button>
            ) : null}
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Pembayaran */}
        <div className="kartu tumpuk-sedang">
          <div className="bagian-kepala">
            <h2>Riwayat Pembayaran</h2>
            {bisaUbah ? (
              <button
                type="button"
                className="tombol tombol-sekunder tombol-kecil"
                onClick={() => {
                  setBayarJumlah("");
                  setBayarTanggal(hariIni());
                  setBayarMetode("transfer");
                  setBayarLunas(false);
                  setBayarCatatan("");
                  setGalatBayar(null);
                  setBukaBayar(true);
                }}
              >
                Catat pembayaran
              </button>
            ) : null}
          </div>

          {payments.length === 0 ? (
            <Kosong
              keadaan="Belum ada pembayaran untuk vendor ini."
              jalanKeluar="Catat DP pertama di sini."
            />
          ) : (
            <div className="tumpuk-rapat">
              {payments.map((p, idx) => (
                <div key={p.id} className="baris-kotak">
                  <div className="tumpuk-rapat">
                    <div className="aksi-baris">
                      <span className="rekap-nilai rekap-nilai-kecil">
                        <Rupiah nilai={p.amount} />
                      </span>
                      {p.isFinal ? (
                        <span className="lencana lencana-aksen">Pelunasan</span>
                      ) : (
                        <span className="keterangan keterangan-rapat">
                          Termin {idx + 1}
                        </span>
                      )}
                    </div>

                    <span className="keterangan keterangan-rapat">
                      {tanggalPanjangDari(p.paidAt)} • Melalui{" "}
                      {LABEL_METODE_BAYAR[p.method as MetodeBayar] ?? p.method}
                      {p.notes ? ` • ${p.notes}` : ""}
                    </span>
                  </div>

                  {bisaUbah ? (
                    <button
                      type="button"
                      className="tombol tombol-bahaya tombol-kecil"
                      onClick={() => setHapusBayarId(p.id)}
                    >
                      Hapus
                    </button>
                  ) : null}
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
        <form onSubmit={simpanPembayaran} noValidate className="tumpuk-sedang">
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

          <Pilih
            label="Tahap"
            id="bayarTahap"
            nilai={bayarLunas ? "pelunasan" : "dp"}
            onUbah={(v) => setBayarLunas(v === "pelunasan")}
            opsi={[
              { nilai: "dp", label: "DP" },
              { nilai: "pelunasan", label: "Pelunasan" },
            ]}
          />

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

          <div className="dialog-tombol">
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
        <form onSubmit={simpanPerubahanVendor} noValidate className="tumpuk-sedang">
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

          <div className="dialog-tombol">
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
        judul="Hapus catatan pembayaran"
        isi="Jumlah yang sudah tercatat akan berubah."
        tombolYa="Hapus"
        sedangJalan={sedangHapusBayar}
        onTutup={() => setHapusBayarId(null)}
        onYa={konfirmasiHapusBayar}
      />

      {/* Dialog Konfirmasi Hapus Vendor */}
      <DialogKonfirmasi
        buka={bukaHapusVendor}
        judul="Hapus vendor"
        isi={`Vendor "${vendor.name}" beserta seluruh histori pembayarannya akan dihapus.`}
        tombolYa="Hapus"
        sedangJalan={sedangHapusVendor}
        onTutup={() => setBukaHapusVendor(false)}
        onYa={konfirmasiHapusVendor}
      />
    </div>
  );
}
