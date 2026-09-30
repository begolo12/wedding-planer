"use client";

import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import type { RingkasanPlan } from "@/lib/ringkasan";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { TaskItem } from "@/components/task-item";
import { BudgetBar } from "@/components/budget-bar";
import { Rupiah } from "@/components/rupiah";
import { tanggalPanjangDari } from "@/lib/format";

/**
 * Beranda utama aplikasi.
 *
 * Menampilkan ringkasan hari ini dalam sekali pandang:
 * 1. Hitung mundur hari-H di bagian atas.
 * 2. Rekap cepat tugas, sisa anggaran, dan vendor.
 * 3. Tata letak 60/40 di layar lebar:
 *    - 60%: Tanggal penting terdekat dan maksimal 5 tugas terdekat.
 *    - 40%: Porsi sisa anggaran dan pintasan aksi cepat.
 */
export default function HalamanBeranda() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const {
    data: ringkasan,
    memuat: memuatRingkasan,
    galat: galatRingkasan,
    muatUlang: muatRingkasan,
  } = useMuat<RingkasanPlan>(planId ? `/api/plans/${planId}/overview` : null, {
    aktif: Boolean(planId),
  });

  if (memuatPlan || (planId && memuatRingkasan && !ringkasan)) {
    return <Kerangka baris={6} />;
  }

  if (galatPlan) {
    return <Gagal apa="Rencana pernikahan" onCoba={muatPlan} />;
  }

  if (!plan) {
    return (
      <Kosong
        keadaan="Belum ada rencana pernikahan."
        jalanKeluar="Mulai buat rencana pertama kamu sekarang untuk mengatur tugas, anggaran, dan rundown."
      >
        <Link className="tombol tombol-utama" href="/rencana/plan">
          Buat rencana
        </Link>
      </Kosong>
    );
  }

  if (galatRingkasan) {
    return <Gagal apa="Ringkasan beranda" onCoba={muatRingkasan} />;
  }

  if (!ringkasan) {
    return <Kerangka baris={4} />;
  }

  const {
    hariBesar,
    teksHitungMundur,
    hariKe,
    jumlahTugas,
    tugasTerdekat,
    uang,
    jumlahVendor,
    tanggalBerikut,
  } = ringkasan;

  return (
    <div>
      <div className="kepala-halaman">
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--text-h1)" }}>
            {plan.partnerName ? `Rencana bersama ${plan.partnerName}` : "Rencana Pernikahan"}
          </h1>
          <p>
            {hariBesar
              ? tanggalPanjangDari(hariBesar)
              : "Tanggal pernikahan belum ditentukan."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="tombol tombol-sekunder" href="/laporan/bagikan">
            Bagikan
          </Link>
          <Link className="tombol tombol-utama" href="/rencana">
            Kelola tugas
          </Link>
        </div>
      </div>

      {hariBesar ? (
        <div className="kartu" style={{ margin: "16px 0 24px" }}>
          <div className="mundur">
            <span className="mundur-angka">
              {hariKe !== null
                ? hariKe === 0
                  ? "Hari ini"
                  : hariKe < 0
                    ? `${Math.abs(hariKe)} hari lewat`
                    : `${hariKe} hari lagi`
                : "Tanggal belum ditentukan"}
            </span>
            <span className="mundur-label">{teksHitungMundur ?? "Menuju hari pernikahan"}</span>
          </div>
        </div>
      ) : null}

      <div className="rekap" style={{ marginBottom: 24 }}>
        <div className="kartu rekap-item">
          <span className="rekap-nilai">
            {jumlahTugas.selesai}/{jumlahTugas.total}
          </span>
          <span className="rekap-label">Tugas selesai</span>
        </div>
        <div className="kartu rekap-item">
          <span
            className="rekap-nilai"
            style={{ color: jumlahTugas.lewat > 0 ? "var(--color-bata)" : undefined }}
          >
            {jumlahTugas.lewat}
          </span>
          <span className="rekap-label">Tugas lewat tenggat</span>
        </div>
        <div className="kartu rekap-item">
          <span className="rekap-nilai">
            <Rupiah nilai={uang.remaining} />
          </span>
          <span className="rekap-label">Sisa anggaran</span>
        </div>
        <div className="kartu rekap-item">
          <span className="rekap-nilai">{jumlahVendor}</span>
          <span className="rekap-label">Vendor terdaftar</span>
        </div>
      </div>

      <div className="kolom-6040">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tanggalBerikut ? (
            <div className="kartu">
              <p className="label-bagian" style={{ margin: "0 0 4px" }}>
                Tanggal penting berikutnya
              </p>
              <h2 style={{ fontSize: "var(--text-h3)", margin: "4px 0" }}>
                {tanggalBerikut.title}
              </h2>
              <p style={{ margin: 0, color: "var(--color-muted)" }}>
                {tanggalPanjangDari(tanggalBerikut.eventDate)}
                {tanggalBerikut.eventTime ? ` jam ${tanggalBerikut.eventTime}` : ""}
                {` (${
                  tanggalBerikut.selisihHari === 0
                    ? "Hari ini"
                    : tanggalBerikut.selisihHari < 0
                      ? `${Math.abs(tanggalBerikut.selisihHari)} hari lalu`
                      : `${tanggalBerikut.selisihHari} hari lagi`
                })`}
              </p>
              <div style={{ marginTop: 12 }}>
                <Link className="tombol tombol-sekunder" href="/rencana/tanggal">
                  Semua tanggal penting
                </Link>
              </div>
            </div>
          ) : null}

          <div className="kartu">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: 0, fontSize: "var(--text-h3)" }}>Tugas terdekat</h2>
              <Link className="tautan-kalimat" href="/rencana">
                Buka semua
              </Link>
            </div>

            {tugasTerdekat.length === 0 ? (
              <p style={{ color: "var(--color-muted)", margin: "8px 0" }}>
                Tidak ada tugas yang mendesak saat ini.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tugasTerdekat.map((t) => (
                  <TaskItem
                    key={t.id}
                    tugas={t}
                    planId={plan.id}
                    onUbah={() => muatRingkasan()}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Link className="tombol tombol-sekunder" href="/rencana">
                Lihat semua tugas
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="kartu">
            <h2 style={{ margin: "0 0 12px", fontSize: "var(--text-h3)" }}>Status Anggaran</h2>
            <BudgetBar terpakai={uang.paid} batas={uang.planned} />
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px solid var(--color-line)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: "var(--text-kecil)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-muted)" }}>Total rencana</span>
                <Rupiah nilai={uang.planned} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-muted)" }}>Sudah terbayar</span>
                <Rupiah nilai={uang.paid} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>Sisa</span>
                <Rupiah nilai={uang.remaining} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Link className="tombol tombol-sekunder" href="/anggaran">
                Kelola anggaran
              </Link>
            </div>
          </div>

          <div className="kartu">
            <h2 style={{ margin: "0 0 12px", fontSize: "var(--text-h3)" }}>Pintasan</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link className="tombol tombol-sekunder" href="/hari-h">
                Rundown acara
              </Link>
              <Link className="tombol tombol-sekunder" href="/rencana/vendor">
                Daftar vendor
              </Link>
              <Link className="tombol tombol-sekunder" href="/tamu">
                Daftar tamu
              </Link>
              <Link className="tombol tombol-sekunder" href="/laporan">
                Laporan pernikahan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
