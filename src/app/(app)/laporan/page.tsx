"use client";

import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { BudgetBar } from "@/components/budget-bar";
import { Rupiah } from "@/components/rupiah";
import { LABEL_KATEGORI_TAMU, type KategoriTamu } from "@/lib/konstanta";
import type { Laporan } from "@/lib/laporan";

/**
 * Layar Laporan Keadaan Pernikahan.
 * Menjawab pertanyaan "kondisi sekarang bagaimana" dalam sekali baca.
 * Semua angka dihitung langsung di server tanpa data stale.
 */
export default function HalamanLaporan() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const urlApi = planId ? `/api/plans/${planId}/report` : null;
  const {
    data,
    memuat: memuatLaporan,
    galat: galatLaporan,
    muatUlang: muatLaporan,
  } = useMuat<{ report: Laporan }>(urlApi, {
    aktif: Boolean(planId),
  });

  const rep = data?.report;

  if (memuatPlan || (planId && memuatLaporan && !rep)) {
    return <Kerangka baris={8} />;
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

  if (galatLaporan) {
    return <Gagal apa="Laporan keadaan" onCoba={muatLaporan} />;
  }

  if (!rep) return null;

  const adaPosLebih = rep.uang.pos.some((p) => p.remaining < 0);

  return (
    <div className="laporan">
      <div className="kepala-halaman">
        <div>
          <h1>Laporan Keadaan</h1>
          <p>
            {rep.judul.namaPasangan ? `Pernikahan ${rep.judul.namaPasangan} • ` : ""}
            {rep.judul.tanggalTeks} ({rep.hitungMundur.teks})
          </p>
        </div>
        <div className="aksi-baris">
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={() => window.print()}
          >
            Cetak PDF / Laporan
          </button>
          <Link className="tombol tombol-utama" href="/laporan/bagikan">
            Bagikan ke WhatsApp →
          </Link>
        </div>
      </div>

      <div className="tumpuk">
        {/* Bagian 1: Ringkasan Uang */}
        <section className="kartu tumpuk-sedang">
          <div className="bagian-kepala">
            <h2>Ringkasan Anggaran & Keuangan</h2>
            <Link href="/anggaran" className="tautan-kalimat">
              Buka rincian anggaran →
            </Link>
          </div>

          <div className="rekap rekap-tiga">
            <div className="rekap-item">
              <span className="rekap-nilai">
                <Rupiah nilai={rep.uang.planned} />
              </span>
              <span className="rekap-label">Total rencana batas</span>
            </div>
            <div className="rekap-item">
              <span className="rekap-nilai teks-aksen">
                <Rupiah nilai={rep.uang.paid} />
              </span>
              <span className="rekap-label">Sudah dibayar ({rep.uang.persenTerpakai}%)</span>
            </div>
            <div className="rekap-item">
              <span
                className="rekap-nilai"
                data-nada={rep.uang.remaining < 0 ? "bahaya" : undefined}
              >
                <Rupiah nilai={Math.abs(rep.uang.remaining)} />
              </span>
              <span className="rekap-label">
                {rep.uang.remaining < 0 ? "Lebih dari anggaran" : "Sisa anggaran"}
              </span>
            </div>
          </div>

          <BudgetBar
            terpakai={rep.uang.paid}
            batas={rep.uang.planned}
            label="Penggunaan Anggaran Keseluruhan"
          />

          {adaPosLebih ? (
            <p className="peringatan peringatan-bahaya">
              Ada pos pengeluaran yang melebihi batas yang direncanakan.
            </p>
          ) : null}

          {rep.uang.pos.length > 0 ? (
            <div className="tumpuk-rapat">
              <span className="label-bagian">Pos Pengeluaran Utama</span>
              <div className="butir-kisi">
                {rep.uang.pos.slice(0, 6).map((pos) => (
                  <div className="butir" key={pos.id}>
                    <div className="butir-isi">
                      <div className="butir-judul">{pos.name}</div>
                      <div className="butir-ket">{pos.labelKategori}</div>
                    </div>
                    <div className="butir-angka">
                      <div className="angka">
                        <Rupiah nilai={pos.paid} />
                      </div>
                      <div className="butir-ket">
                        dari <Rupiah nilai={pos.planned} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* Bagian 2: Dua Kolom (Tugas & Tamu) */}
        <div className="kisi-kartu">
          {/* Kolom Tugas */}
          <section className="kartu tumpuk-rapat">
            <div className="bagian-kepala">
              <h2>Kesiapan Tugas</h2>
              <Link href="/rencana" className="tautan-kalimat">
                Ke daftar tugas →
              </Link>
            </div>

            <div className="rekap rekap-dua">
              <div className="rekap-item">
                <span className="rekap-nilai">
                  {rep.tugas.selesai} / {rep.tugas.total}
                </span>
                <span className="rekap-label">Tugas selesai</span>
              </div>
              <div className="rekap-item">
                <span
                  className="rekap-nilai"
                  data-nada={rep.tugas.lewat > 0 ? "bahaya" : undefined}
                >
                  {rep.tugas.lewat}
                </span>
                <span className="rekap-label">Lewat tanggal</span>
              </div>
            </div>

            {rep.tugas.daftarTerdekat.length > 0 ? (
              <div className="tumpuk-rapat">
                <span className="label-bagian">Tugas Terdekat yang Perlu Dikerjakan</span>
                {rep.tugas.daftarTerdekat.map((t) => (
                  <div className="butir" key={t.id}>
                    <span className="butir-judul">{t.title}</span>
                    <span className="butir-ket">
                      {t.assignee ? `PIC: ${t.assignee}` : t.dueDate ?? "tanpa tanggal"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="keterangan">
                Tidak ada tugas mendesak yang menunggu saat ini.
              </p>
            )}
          </section>

          {/* Kolom Tamu */}
          <section className="kartu tumpuk-rapat">
            <div className="bagian-kepala">
              <h2>Tamu & Undangan</h2>
              <Link href="/tamu" className="tautan-kalimat">
                Ke daftar tamu →
              </Link>
            </div>

            <div className="rekap rekap-dua">
              <div className="rekap-item">
                <span className="rekap-nilai">{rep.tamu.orang}</span>
                <span className="rekap-label">Perkiraan hadir (orang)</span>
              </div>
              <div className="rekap-item">
                <span className="rekap-nilai teks-aksen">
                  {rep.tamu.kursi}
                </span>
                <span className="rekap-label">Pasti hadir (kursi)</span>
              </div>
            </div>

            <div className="daftar">
              <div className="baris">
                <span className="baris-isi">Belum konfirmasi RSVP</span>
                <strong className="angka">{rep.tamu.belumKonfirmasi} orang</strong>
              </div>
              <div className="baris">
                <span className="baris-isi">Undangan belum dikirim</span>
                <strong
                  className="angka"
                  data-nada={rep.tamu.belumDiundang > 0 ? "bahaya" : undefined}
                >
                  {rep.tamu.belumDiundang} undangan
                </strong>
              </div>
            </div>

            {rep.tamu.perKategori.length > 0 ? (
              <div className="tumpuk-rapat">
                <span className="label-bagian">Sebaran Kategori Tamu</span>
                <div className="aksi-baris">
                  {rep.tamu.perKategori.map((k) => (
                    <span className="lencana" key={k.kategori}>
                      {LABEL_KATEGORI_TAMU[k.kategori as KategoriTamu] ?? k.kategori}
                      <strong className="angka">{k.orang}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {/* Bagian 3: Rundown Hari-H & Vendor */}
        <div className="kisi-kartu">
          {/* Rundown Hari-H */}
          <section className="kartu tumpuk-rapat">
            <div className="bagian-kepala">
              <h2>Rundown Acara Hari-H</h2>
              <Link href="/hari-h" className="tautan-kalimat">
                Ke jadwal hari-H →
              </Link>
            </div>

            <p className="keterangan">
              {rep.rundown.total > 0
                ? `${rep.rundown.total} acara terdaftar, mulai ${rep.rundown.jamMulai ?? "-"} sampai ${rep.rundown.jamSelesai ?? "-"}`
                : "Belum ada susunan acara rundown."}
            </p>

            {rep.rundown.item.length > 0 ? (
              <div className="tumpuk-rapat">
                {rep.rundown.item.slice(0, 5).map((r) => (
                  <div className="butir" key={r.id}>
                    <span className="lencana lencana-aksen angka">{r.startTime}</span>
                    <div className="butir-isi">
                      <div className="butir-judul">{r.title}</div>
                      {r.location ? <div className="butir-ket">{r.location}</div> : null}
                    </div>
                  </div>
                ))}
                {rep.rundown.item.length > 5 ? (
                  <p className="keterangan keterangan-tengah">
                    + {rep.rundown.item.length - 5} acara lainnya di halaman Hari-H
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>

          {/* Vendor & Seragam */}
          <section className="kartu tumpuk-rapat">
            <div className="bagian-kepala">
              <h2>Vendor & Seragam</h2>
              <Link href="/rencana/vendor" className="tautan-kalimat">
                Ke daftar vendor →
              </Link>
            </div>

            <div className="rekap rekap-dua">
              <div className="rekap-item">
                <span className="rekap-nilai">
                  {rep.vendor.dibook} / {rep.vendor.total}
                </span>
                <span className="rekap-label">Vendor dibook</span>
              </div>
              <div className="rekap-item">
                <span
                  className="rekap-nilai"
                  data-nada={rep.vendor.belumLunas > 0 ? "bahaya" : undefined}
                >
                  {rep.vendor.belumLunas}
                </span>
                <span className="rekap-label">Belum lunas</span>
              </div>
            </div>

            <div className="daftar">
              <div className="baris">
                <span className="baris-isi">Status Seragam & Busana</span>
                <strong className="angka">
                  {rep.busana.siap} siap dari {rep.busana.total} seragam
                </strong>
              </div>
              <div className="baris">
                <span className="baris-isi">Total Biaya Vendor</span>
                <strong className="angka">
                  <Rupiah nilai={rep.vendor.totalTagihan} />
                </strong>
              </div>
              <div className="baris">
                <span className="baris-isi">Sudah Dibayarkan</span>
                <strong className="angka teks-aksen">
                  <Rupiah nilai={rep.vendor.totalDibayar} />
                </strong>
              </div>
            </div>
          </section>
        </div>

        {/* Tindakan Cepat di Bawah */}
        <div className="kartu kartu-netral bagian-kepala">
          <div>
            <div className="butir-judul">Mau bagikan keadaan ini ke keluarga besar?</div>
            <p className="keterangan">
              Kirim teks ringkas langsung ke WhatsApp atau cetak dalam format dokumen rapi.
            </p>
          </div>
          <div className="aksi-baris">
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => window.print()}
            >
              Cetak Dokumen
            </button>
            <Link className="tombol tombol-utama" href="/laporan/bagikan">
              Bagikan ke WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
