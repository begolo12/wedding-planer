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
import { Rupiah } from "@/components/rupiah";
import { formatTanggalId, rupiah } from "@/lib/format";
import { minta, pesanGalat } from "@/lib/api-client";
import {
  PEMILIK_BUSANA,
  STATUS_BUSANA,
  type PemilikBusana,
  type StatusBusana,
  LABEL_PEMILIK_BUSANA,
  LABEL_STATUS_BUSANA,
} from "@/lib/konstanta";
import type { outfits } from "@/db/schema";

type Outfit = typeof outfits.$inferSelect;

/**
 * Layar Busana & Seragam.
 * Melacak pakaian pengantin, orang tua, keluarga besar, dan panitia/crew.
 * Fokus utama: tanggal ambil jangan sampai terlewat menjelang hari-H.
 */
export default function HalamanSeragam() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  const {
    data,
    memuat: memuatOutfits,
    galat: galatOutfits,
    muatUlang: muatOutfits,
  } = useMuat<{
    outfits: Outfit[];
    summary: {
      total: number;
      siap: number;
      belumSiap: number;
      perStatus: Record<StatusBusana, number>;
      estimatedCost: number;
    };
  }>(planId ? `/api/plans/${planId}/outfits` : null, {
    aktif: Boolean(planId),
  });

  // Pos anggaran dibaca supaya tombol "Masukkan ke anggaran" bisa memutuskan
  // memperbarui pos busana yang sudah ada atau membuat yang baru. Kalau tidak
  // dibaca dulu, biaya busana bisa tercatat dua kali.
  const {
    data: dataAnggaran,
    memuat: memuatAnggaran,
    galat: galatAnggaran,
    muatUlang: muatAnggaran,
  } = useMuat<{
    items: { id: string; name: string; category: string; plannedAmount: number }[];
  }>(planId ? `/api/plans/${planId}/budget-items` : null, {
    aktif: Boolean(planId),
  });

  const [filterPemilik, setFilterPemilik] = useState<string>("semua");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  const [lembarBuka, setLembarBuka] = useState(false);
  const [diedit, setDiedit] = useState<Outfit | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  const [dihapus, setDihapus] = useState<Outfit | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const [bukaMasukkanAnggaran, setBukaMasukkanAnggaran] = useState(false);
  const [sedangMasukkan, setSedangMasukkan] = useState(false);

  // Form states
  const [formNama, setFormNama] = useState("");
  const [formPemilik, setFormPemilik] = useState<PemilikBusana>("pengantinWanita");
  const [formStatus, setFormStatus] = useState<StatusBusana>("belum");
  const [formUkur, setFormUkur] = useState("");
  const [formAmbil, setFormAmbil] = useState("");
  const [formBiaya, setFormBiaya] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formGalat, setFormGalat] = useState<string | null>(null);

  function bukaTambah() {
    setDiedit(null);
    setFormNama("");
    setFormPemilik("pengantinWanita");
    setFormStatus("belum");
    setFormUkur("");
    setFormAmbil("");
    setFormBiaya("");
    setFormCatatan("");
    setFormGalat(null);
    setLembarBuka(true);
  }

  function bukaUbah(o: Outfit) {
    setDiedit(o);
    setFormNama(o.itemName);
    setFormPemilik(
      PEMILIK_BUSANA.includes(o.owner as PemilikBusana)
        ? (o.owner as PemilikBusana)
        : "pengantinWanita",
    );
    setFormStatus(
      STATUS_BUSANA.includes(o.status as StatusBusana)
        ? (o.status as StatusBusana)
        : "belum",
    );
    setFormUkur(o.measureDate ?? "");
    setFormAmbil(o.pickupDate ?? "");
    setFormBiaya(o.estimatedCost ? String(o.estimatedCost) : "");
    setFormCatatan(o.notes ?? "");
    setFormGalat(null);
    setLembarBuka(true);
  }

  async function ubahStatusCepat(o: Outfit, statusBaru: StatusBusana) {
    if (!planId) return;
    try {
      await minta(`/api/plans/${planId}/outfits/${o.id}`, {
        method: "PATCH",
        body: { status: statusBaru },
      });
      toast("Tersimpan");
      await muatOutfits();
    } catch (err) {
      toast(pesanGalat(err));
    }
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;

    if (!formNama.trim()) {
      setFormGalat("Nama busana wajib diisi.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    const angkaBiaya = formBiaya ? parseInt(formBiaya.replace(/\D/g, ""), 10) : null;

    try {
      const payload = {
        itemName: formNama.trim(),
        owner: formPemilik,
        status: formStatus,
        measureDate: formUkur || null,
        pickupDate: formAmbil || null,
        estimatedCost: isNaN(angkaBiaya as number) ? null : angkaBiaya,
        notes: formCatatan.trim() || null,
      };

      if (diedit) {
        await minta(`/api/plans/${planId}/outfits/${diedit.id}`, {
          method: "PATCH",
          body: payload,
        });
        toast("Tersimpan");
      } else {
        await minta(`/api/plans/${planId}/outfits`, {
          method: "POST",
          body: payload,
        });
        toast("Tersimpan");
      }

      setLembarBuka(false);
      await muatOutfits();
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
      await minta(`/api/plans/${planId}/outfits/${dihapus.id}`, {
        method: "DELETE",
      });
      toast("Dihapus");
      setDihapus(null);
      await muatOutfits();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangHapus(false);
    }
  }

  const rawDaftar = data?.outfits ?? [];
  const summary = data?.summary;

  // Total biaya busana datang dari server (jumlah estimatedCost semua barang),
  // jadi angkanya sama dengan yang tampil di ringkasan.
  const totalBiayaBusana = summary?.estimatedCost ?? 0;
  // Pos busana dicari lewat kategori, bukan cuma nama. Pos berkategori busana
  // dengan nama lain tetap dianggap pos yang sama, supaya biaya tidak tercatat
  // dua kali.
  const posBusana =
    dataAnggaran?.items.find((p) => p.category === "busana") ?? null;
  const anggaranSiap = !memuatAnggaran && !galatAnggaran;

  /**
   * Memasukkan total biaya busana ke pos anggaran berkategori busana.
   * Nilai pos diganti, bukan ditambah, supaya menekan tombol dua kali tidak
   * membuat biaya terhitung dobel.
   */
  async function masukkanKeAnggaran() {
    if (!planId || totalBiayaBusana <= 0) return;
    setSedangMasukkan(true);
    try {
      if (posBusana) {
        await minta(`/api/plans/${planId}/budget-items/${posBusana.id}`, {
          method: "PATCH",
          body: { plannedAmount: totalBiayaBusana },
        });
        toast("Pos busana diperbarui");
      } else {
        await minta(`/api/plans/${planId}/budget-items`, {
          method: "POST",
          body: {
            name: "Busana",
            category: "busana",
            plannedAmount: totalBiayaBusana,
          },
        });
        toast("Pos busana dibuat");
      }
      setBukaMasukkanAnggaran(false);
      await muatAnggaran();
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangMasukkan(false);
    }
  }

  const daftar = rawDaftar.filter((o) => {
    if (filterPemilik !== "semua" && o.owner !== filterPemilik) return false;
    if (filterStatus !== "semua" && o.status !== filterStatus) return false;
    return true;
  });

  if (memuatPlan || (planId && memuatOutfits && !data)) {
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

  if (galatOutfits) {
    return <Gagal apa="Daftar busana & seragam" onCoba={muatOutfits} />;
  }

  return (
    <div className="tumpuk-sedang">
      <div className="kepala-halaman">
        <div>
          <h1>Busana</h1>
          <p>Catatan ukuran, tenggat jahit, dan jadwal ambil baju pengantin serta keluarga.</p>
        </div>
        <div>
          {bisaUbah ? (
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              Tambah barang
            </button>
          ) : null}
        </div>
      </div>

      <TabRencana />

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Menambah atau mengubah busana tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      {summary && summary.total > 0 ? (
        <div className="rekap">
          <div className="rekap-item">
            <span className="rekap-nilai">{summary.total}</span>
            <span className="rekap-label">Total busana</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai teks-aksen">
              {summary.siap}
            </span>
            <span className="rekap-label">Sudah siap</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai teks-bahaya">
              {summary.belumSiap}
            </span>
            <span className="rekap-label">Belum siap</span>
          </div>
          <div className="rekap-item">
            <span className="rekap-nilai rekap-nilai-kecil">
              <Rupiah nilai={summary.estimatedCost} />
            </span>
            <span className="rekap-label">Total biaya busana</span>
          </div>
        </div>
      ) : null}

      {summary && summary.total > 0 ? (
        <section className="kartu tumpuk-rapat">
          <div className="bagian-kepala">
            <h2 className="label-bagian">Biaya busana dan anggaran</h2>
          </div>
          <div className="baris">
            <span className="baris-isi">Total biaya busana</span>
            <strong className="angka">
              <Rupiah nilai={summary.estimatedCost} />
            </strong>
          </div>
          <p className="keterangan">
            {posBusana ? (
              <>
                Pos anggaran &ldquo;{posBusana.name}&rdquo; sekarang berisi{" "}
                <Rupiah nilai={posBusana.plannedAmount} />. Tombol di bawah mengganti nilainya
                dengan total di atas, bukan menambah, supaya tidak terhitung dua kali.
              </>
            ) : anggaranSiap ? (
              "Belum ada pos anggaran berkategori busana. Tombol di bawah membuat pos baru bernama Busana."
            ) : galatAnggaran ? (
              "Daftar anggaran gagal dimuat, jadi pos busana belum bisa diperiksa. Coba muat ulang halaman."
            ) : (
              "Sedang memeriksa pos anggaran yang ada."
            )}
          </p>
          {bisaUbah ? (
            <button
              type="button"
              className="tombol tombol-utama"
              disabled={!anggaranSiap || summary.estimatedCost <= 0 || sedangMasukkan}
              onClick={() => setBukaMasukkanAnggaran(true)}
            >
              {posBusana ? "Perbarui pos Busana" : "Buat pos Busana"}
            </button>
          ) : null}
          {summary.estimatedCost <= 0 ? (
            <p className="keterangan">
              Isi perkiraan biaya tiap barang dulu supaya totalnya ada.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* Filter Bar */}
      <div className="filter-baris">
        <div className="filter-grup">
          <label htmlFor="filterPemilik">Pemilik</label>
          <select
            id="filterPemilik"
            className="isian"
            value={filterPemilik}
            onChange={(e) => setFilterPemilik(e.target.value)}
          >
            <option value="semua">Semua pemilik ({rawDaftar.length})</option>
            {PEMILIK_BUSANA.map((p) => {
              const jml = rawDaftar.filter((o) => o.owner === p).length;
              return (
                <option key={p} value={p}>
                  {LABEL_PEMILIK_BUSANA[p]} ({jml})
                </option>
              );
            })}
          </select>
        </div>

        <div className="filter-grup">
          <label htmlFor="filterStatus">Status</label>
          <select
            id="filterStatus"
            className="isian"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua status</option>
            {STATUS_BUSANA.map((s) => (
              <option key={s} value={s}>
                {LABEL_STATUS_BUSANA[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rawDaftar.length === 0 ? (
        <Kosong
          keadaan="Belum ada barang busana."
          jalanKeluar="Tambahkan baju yang perlu dijahit atau disewa."
        >
          {bisaUbah ? (
            <button type="button" className="tombol tombol-utama" onClick={bukaTambah}>
              Tambah barang
            </button>
          ) : null}
        </Kosong>
      ) : daftar.length === 0 ? (
        <Kosong
          keadaan="Tidak ada yang cocok dengan pencarian itu."
          jalanKeluar="Coba ubah pilihan pemilik atau status di atas."
        />
      ) : (
        <div className="tumpuk-rapat">
          {PEMILIK_BUSANA.map((p) => {
            const anggota = daftar.filter((o) => o.owner === p);
            if (anggota.length === 0) return null;
            return (
              <section key={p} className="tumpuk-rapat">
                <h2 className="label-bagian">
                  {LABEL_PEMILIK_BUSANA[p]} ({anggota.length} barang)
                </h2>
                {anggota.map((o) => {
            const statusBusana = o.status as StatusBusana;
            const pemilikBusana = o.owner as PemilikBusana;

            return (
              <article
                key={o.id}
                className="kartu tumpuk-rapat"
                data-sorot={statusBusana === "siap" ? "ya" : undefined}
              >
                <div className="bagian-kepala">
                  <div className="tumpuk-rapat isi-lentur">
                    <h2>{o.itemName}</h2>
                    <div className="aksi-baris">
                      <span className="lencana">
                        {LABEL_PEMILIK_BUSANA[pemilikBusana] ?? o.owner}
                      </span>

                      {/* Dropdown status cepat */}
                      {bisaUbah ? (
                        <>
                          <label className="sr-only" htmlFor={`status-${o.id}`}>
                            Ubah status busana
                          </label>
                          <select
                            id={`status-${o.id}`}
                            className="isian isian-mini"
                            data-siap={statusBusana === "siap" ? "ya" : "tidak"}
                            value={o.status}
                            onChange={(e) => ubahStatusCepat(o, e.target.value as StatusBusana)}
                          >
                            {STATUS_BUSANA.map((s) => (
                              <option key={s} value={s}>
                                {LABEL_STATUS_BUSANA[s]}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <span className="lencana">{LABEL_STATUS_BUSANA[statusBusana]}</span>
                      )}

                      {o.estimatedCost ? (
                        <span className="lencana lencana-aksen">
                          <Rupiah nilai={o.estimatedCost} />
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="aksi-baris">
                    {bisaUbah ? (
                      <>
                        <button
                          type="button"
                          className="tombol tombol-sekunder tombol-kecil"
                          onClick={() => bukaUbah(o)}
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="tombol tombol-bahaya tombol-kecil"
                          onClick={() => setDihapus(o)}
                        >
                          Hapus
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Info Tanggal Ukur & Ambil */}
                {(o.measureDate || o.pickupDate || o.notes) && (
                  <div className="kartu-kaki">
                    <div className="aksi-baris">
                      {o.measureDate ? (
                        <span className="keterangan keterangan-rapat">
                          <strong>Ukur:</strong> {formatTanggalId(o.measureDate)}
                        </span>
                      ) : null}
                      {o.pickupDate ? (
                        <span className="keterangan keterangan-rapat">
                          <strong>Jadwal ambil:</strong>{" "}
                          <span className="teks-aksen-tegas">
                            {formatTanggalId(o.pickupDate)}
                          </span>
                        </span>
                      ) : null}
                    </div>

                    {o.notes ? (
                      <p className="keterangan keterangan-miring">
                        &ldquo;{o.notes}&rdquo;
                      </p>
                    ) : null}
                  </div>
                )}
              </article>
            );
                })}
              </section>
            );
          })}
        </div>
      )}

      {/* Lembar Tambah / Ubah */}
      <Lembar
        buka={lembarBuka}
        judul={diedit ? "Ubah data busana" : "Tambah barang"}
        onTutup={() => setLembarBuka(false)}
      >
        <form onSubmit={simpan} noValidate className="tumpuk-sedang">
          <Isian label="Nama busana / seragam" id="formNama" galat={formGalat ?? undefined}>
            <input
              id="formNama"
              className="isian"
              type="text"
              required
              placeholder="Contoh: Kebaya Akad Pengantin Wanita"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
          </Isian>

          <Pilih
            label="Pemilik / pemakai"
            id="formPemilik"
            nilai={formPemilik}
            onUbah={(v) => setFormPemilik(v as PemilikBusana)}
            opsi={PEMILIK_BUSANA.map((p) => ({
              nilai: p,
              label: LABEL_PEMILIK_BUSANA[p],
            }))}
          />

          <Pilih
            label="Status pengerjaan"
            id="formStatus"
            nilai={formStatus}
            onUbah={(v) => setFormStatus(v as StatusBusana)}
            opsi={STATUS_BUSANA.map((s) => ({
              nilai: s,
              label: LABEL_STATUS_BUSANA[s],
            }))}
          />

          <div className="isian-baris-2">
            <Isian label="Tanggal ukur badan" id="formUkur">
              <input
                id="formUkur"
                className="isian"
                type="date"
                value={formUkur}
                onChange={(e) => setFormUkur(e.target.value)}
              />
            </Isian>

            <Isian label="Target tanggal ambil" id="formAmbil">
              <input
                id="formAmbil"
                className="isian"
                type="date"
                value={formAmbil}
                onChange={(e) => setFormAmbil(e.target.value)}
              />
            </Isian>
          </div>

          <Isian label="Perkiraan biaya (Rp)" id="formBiaya">
            <input
              id="formBiaya"
              className="isian"
              type="number"
              min={0}
              placeholder="Contoh: 1500000"
              value={formBiaya}
              onChange={(e) => setFormBiaya(e.target.value)}
            />
          </Isian>

          <Isian label="Catatan tambahan (opsional)" id="formCatatan">
            <textarea
              id="formCatatan"
              className="isian"
              rows={3}
              placeholder="Contoh: Warna sage green, bahan brokat, diambil di butik Melati."
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
              {sedangSimpan ? "Menyimpan..." : "Simpan busana"}
            </button>
          </div>
        </form>
      </Lembar>

      {/* Dialog Konfirmasi Hapus */}
      <DialogKonfirmasi
        buka={Boolean(dihapus)}
        judul="Hapus barang busana"
        isi={`Busana "${dihapus?.itemName ?? ""}" akan dihapus dari rencana.`}
        tombolYa="Hapus"
        sedangJalan={sedangHapus}
        onTutup={() => setDihapus(null)}
        onYa={konfirmasiHapus}
      />

      {/* Konfirmasi pemasukan biaya busana ke anggaran. Nilainya diganti,
          bukan ditambah, supaya menekan tombol dua kali tidak menggandakan. */}
      <DialogKonfirmasi
        buka={bukaMasukkanAnggaran}
        judul="Masukkan biaya busana ke anggaran"
        isi={
          posBusana
            ? `Pos anggaran "${posBusana.name}" akan diisi ${rupiah(totalBiayaBusana)}. Nilainya diganti, bukan ditambah, supaya tidak terhitung dua kali.`
            : `Pos anggaran baru bernama "Busana" akan dibuat dengan nilai ${rupiah(totalBiayaBusana)}.`
        }
        tombolYa={posBusana ? "Ganti nilai" : "Buat pos"}
        sedangJalan={sedangMasukkan}
        onTutup={() => setBukaMasukkanAnggaran(false)}
        onYa={masukkanKeAnggaran}
      />
    </div>
  );
}
