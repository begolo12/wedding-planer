"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut, deleteUser } from "@/lib/auth-client";
import { usePlan, type Plan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
import { Kerangka, Gagal, PesanGalat } from "@/components/states";
import { Lembar, toast } from "@/components/toast";
import { minta, pesanGalat } from "@/lib/api-client";
import { tanggalPanjangDari, selisihHari, hariIni } from "@/lib/format";
import { tanggalHariBesar } from "@/lib/plan";
import { LABEL_STATUS_PLAN, STATUS_PLAN, type StatusPlan } from "@/lib/konstanta";

type PilihanTema = "terang" | "gelap" | "sistem";

// Sama dengan kunci di src/app/layout.tsx dan src/components/theme-toggle.tsx.
// Dulu layar ini memakai kunci lain, jadi pilihan gelap hilang saat halaman
// dimuat ulang.
const KUNCI_TEMA = "haribesar-tema";

/**
 * Layar Akun dan Pengaturan.
 *
 * Susunannya mengikuti rancangan Stitch
 * docs/stitch_cute_wedding_planner/atur_rencana_profil_calon_pengantin:
 * kartu identitas, kartu konfigurasi, banner bantuan, lalu aksi utama.
 *
 * Yang sengaja tidak diambil dari rancangan itu, karena di sini tidak ada
 * datanya atau tidak ada tujuannya:
 * - unggah foto pasangan, belum ada penyimpanan berkas untuk avatar
 * - langkah 1 dari 3 dan persentase kesiapan, tidak ada alur bertahap
 * - penggeser estimasi tamu dan pilihan gaya pernikahan, tabel plans tidak
 *   punya kolomnya
 * - tombol "lanjut" dan "atur nanti saja", tidak ada tujuan yang bisa dibuka
 */
export default function HalamanAkun() {
  const router = useRouter();
  const { data: sesi, isPending: memuatSesi } = useSession();
  const {
    plan,
    planId,
    daftarPlan,
    memuat: memuatPlan,
    galat: galatPlan,
    muatUlang: muatPlan,
    pilihPlan,
  } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  // Tanggal hari-H diambil dari milestone yang ditandai, sama seperti Beranda
  // dan Laporan. Kalau hanya membaca plan.weddingDate, angka hitung mundur di
  // Akun bisa berbeda dengan layar lain saat hari-H diubah lewat tanggal penting.
  const { data: dataMilestone, memuat: memuatMilestone, galat: galatMilestone } = useMuat<{
    milestones: { eventDate: string; isDayOf: boolean }[];
  }>(planId ? `/api/plans/${planId}/milestones` : null, {
    aktif: Boolean(planId),
  });

  const [tema, setTema] = useState<PilihanTema>("sistem");
  const [online, setOnline] = useState(true);
  const [sedangKeluar, setSedangKeluar] = useState(false);
  const [sedangUnduh, setSedangUnduh] = useState(false);

  // Data dasar rencana. Disunting di sini lewat PATCH /api/plans/{id},
  // endpoint yang sama dengan layar /rencana/plan.
  const [namaPasangan, setNamaPasangan] = useState("");
  const [tanggalNikah, setTanggalNikah] = useState("");
  const [statusPilihan, setStatusPilihan] = useState<StatusPlan>("perencanaan");
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const [formGalat, setFormGalat] = useState<string | null>(null);

  const [bukaHapusAkun, setBukaHapusAkun] = useState(false);
  const [sandiHapus, setSandiHapus] = useState("");
  const [sedangHapusAkun, setSedangHapusAkun] = useState(false);
  const [galatHapusAkun, setGalatHapusAkun] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) return;
    setNamaPasangan(plan.partnerName ?? "");
    setTanggalNikah(plan.weddingDate ?? "");
    const kode = (plan.status ?? "perencanaan") as StatusPlan;
    setStatusPilihan(STATUS_PLAN.includes(kode) ? kode : "perencanaan");
  }, [plan]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const temaSimpan = localStorage.getItem(KUNCI_TEMA) as PilihanTema | null;
    if (temaSimpan && ["terang", "gelap", "sistem"].includes(temaSimpan)) {
      setTema(temaSimpan);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function gantiTema(temaBaru: PilihanTema) {
    setTema(temaBaru);
    localStorage.setItem(KUNCI_TEMA, temaBaru);

    if (temaBaru === "gelap") {
      document.documentElement.setAttribute("data-theme", "gelap");
    } else if (temaBaru === "terang") {
      document.documentElement.setAttribute("data-theme", "terang");
    } else {
      // "sistem": lepas atributnya dan biarkan aturan prefers-color-scheme
      // di globals.css yang memutuskan, termasuk saat pengguna mengganti tema
      // perangkat tanpa membuka layar ini lagi.
      document.documentElement.removeAttribute("data-theme");
    }
  }

  async function simpanDasar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!planId || sedangSimpan) return;

    if (!namaPasangan.trim()) {
      setFormGalat("Nama pasangan wajib diisi.");
      return;
    }

    setSedangSimpan(true);
    setFormGalat(null);

    try {
      await minta(`/api/plans/${planId}`, {
        method: "PATCH",
        body: {
          partnerName: namaPasangan.trim(),
          weddingDate: tanggalNikah || null,
          status: statusPilihan,
        },
      });
      toast("Data dasar rencana tersimpan");
      await muatPlan();
    } catch (err) {
      setFormGalat(pesanGalat(err));
    } finally {
      setSedangSimpan(false);
    }
  }

  async function tanganiKeluar() {
    if (sedangKeluar) return;
    setSedangKeluar(true);
    try {
      await signOut();
      toast("Berhasil keluar dari akun");
      router.push("/masuk");
    } catch (err) {
      toast(pesanGalat(err));
      setSedangKeluar(false);
    }
  }

  async function konfirmasiHapusAkun(e: React.FormEvent) {
    e.preventDefault();
    if (sedangHapusAkun) return;
    if (!sandiHapus) {
      setGalatHapusAkun("Masukkan kata sandi untuk mengonfirmasi.");
      return;
    }
    setSedangHapusAkun(true);
    setGalatHapusAkun(null);
    try {
      const hasil = await deleteUser({ password: sandiHapus });
      if (hasil.error) {
        setGalatHapusAkun(
          hasil.error.message ?? "Kata sandi salah, akun belum dihapus.",
        );
        return;
      }
      router.replace("/masuk");
      router.refresh();
    } catch (err) {
      setGalatHapusAkun(pesanGalat(err));
    } finally {
      setSedangHapusAkun(false);
    }
  }

  async function unduhCadanganJson() {
    if (!planId) {
      toast("Pilih rencana aktif terlebih dahulu");
      return;
    }

    setSedangUnduh(true);
    try {
      // /ekspor mengembalikan baris apa adanya, termasuk nama dan nomor tamu,
      // beda dari ringkasan yang cuma punya agregat. Itu yang dipakai hak
      // unduh data pribadi di docs/08-NFR.md.
      const data = await minta<{ ekspor: unknown }>(`/api/plans/${planId}/ekspor`);

      const blob = new Blob([JSON.stringify(data.ekspor, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const tautan = document.createElement("a");
      tautan.href = url;
      tautan.download = `cadangan-pernikahan-${plan?.partnerName?.replace(/\s+/g, "-").toLowerCase() || "plan"}-${hariIni()}.json`;
      document.body.appendChild(tautan);
      tautan.click();
      document.body.removeChild(tautan);
      URL.revokeObjectURL(url);

      toast("Cadangan JSON berhasil diunduh");
    } catch (err) {
      toast(pesanGalat(err));
    } finally {
      setSedangUnduh(false);
    }
  }

  if (
    memuatSesi ||
    memuatPlan ||
    memuatMilestone ||
    (planId && !dataMilestone && !galatMilestone)
  ) {
    return <Kerangka baris={6} />;
  }

  if (galatPlan) {
    return <Gagal apa="Data akun dan rencana" onCoba={muatPlan} />;
  }

  const pengguna = sesi?.user;
  const inisial =
    pengguna?.name?.charAt(0) || pengguna?.email?.charAt(0) || "U";

  // Hitung mundur ditulis dari tanggal yang benar benar tersimpan, bukan dari
  // angka yang dipatok di markup. Aturan tanggalnya sama dengan Beranda dan
  // Laporan: milestone hari-H menang atas tanggal pernikahan di plan.
  const hariOf = dataMilestone?.milestones.find((m) => m.isDayOf) ?? null;
  const hariBesar = plan
    ? tanggalHariBesar({
        weddingDate: plan.weddingDate,
        isDayOfDate: hariOf?.eventDate ?? null,
      })
    : null;
  const hari = selisihHari(hariBesar);
  const teksMundur =
    hari === null
      ? null
      : hari > 0
        ? `${hari} hari lagi menuju hari bahagia`
        : hari === 0
          ? "Hari ini hari bahagiamu!"
          : "Hari bahagia sudah lewat";


  return (
    <div className="akun">
      <h1 className="sr-only">Akun dan Pengaturan</h1>

      {/* Sapa singkat. Nadanya sama dengan layar lain, isinya dari data nyata. */}
      <div className="akun-sapa">
        <span className="akun-sapa-ikon">
          <IkonKilau />
        </span>
        <p className="akun-sapa-teks">
          Semua pengaturan akun dan rencana ada di satu tempat.
        </p>
        {hariBesar ? (
          <span className="akun-sapa-lencana">{hari !== null && hari > 0 ? `H-${hari}` : hari === 0 ? "Hari ini" : "Sudah lewat"}</span>
        ) : null}
      </div>

      <section className="akun-kartu akun-profil">
        <div className="akun-avatar" aria-hidden="true">
          {inisial}
        </div>
        <div className="akun-profil-teks">
          <strong>{pengguna?.name || "Pengguna"}</strong>
          <span>{pengguna?.email || "-"}</span>
        </div>
        <button
          type="button"
          className="akun-tombol akun-tombol-sekunder"
          disabled={sedangKeluar}
          onClick={tanganiKeluar}
        >
          {sedangKeluar ? "Keluar..." : "Keluar akun"}
        </button>
      </section>

      {!plan ? (
        <section className="akun-kartu akun-kosong">
          <h2>Belum ada rencana pernikahan</h2>
          <p>
            Buat rencana pernikahan pertamamu supaya data dasar, anggaran, dan
            daftar tamu bisa diisi.
          </p>
          {bisaUbah ? (
            <Link className="akun-tombol akun-tombol-utama" href="/rencana/plan">
              Buat rencana sekarang
            </Link>
          ) : null}
        </section>
      ) : (
        <>
          <form id="formAkun" className="akun-kartu akun-konfig" onSubmit={simpanDasar}>
            <div className="akun-konfig-kepala">
              <span className="akun-konfig-ikon">
                <IkonHati />
              </span>
              <div>
                <h2>Data Dasar Rencana</h2>
                <p>Nama pasangan, tanggal, dan status persiapan.</p>
              </div>
            </div>

            <div className="akun-isian-grup">
              <label htmlFor="akun-nama">Panggilan pasangan</label>
              <input
                id="akun-nama"
                className="akun-isian"
                type="text"
                maxLength={80}
                autoComplete="off"
                placeholder="Contoh: Rangga"
                value={namaPasangan}
                onChange={(e) => setNamaPasangan(e.target.value)}
              />
            </div>

            <div className="akun-isian-grup">
              <label htmlFor="akun-tanggal">Rencana tanggal hari bahagia</label>
              <input
                id="akun-tanggal"
                className="akun-isian akun-isian-tanggal"
                type="date"
                value={tanggalNikah}
                onChange={(e) => setTanggalNikah(e.target.value)}
              />
            </div>

            {teksMundur ? (
              <div className="akun-mundur">
                <span className="akun-mundur-kiri">
                  <IkonJamPasir />
                  Hitung mundur
                </span>
                <span className="akun-mundur-pil">{teksMundur}</span>
              </div>
            ) : null}

            <div className="akun-isian-grup">
              <span className="akun-label-teks" id="akun-status-label">
                Status persiapan
              </span>
              <div className="akun-status" role="group" aria-labelledby="akun-status-label">
                {STATUS_PLAN.map((kode) => (
                  <button
                    key={kode}
                    type="button"
                    className="akun-status-pil"
                    data-aktif={statusPilihan === kode ? "ya" : undefined}
                    onClick={() => setStatusPilihan(kode)}
                  >
                    {LABEL_STATUS_PLAN[kode]}
                  </button>
                ))}
              </div>
            </div>

            {formGalat ? (
              <p className="akun-galat" role="alert">
                {formGalat}
              </p>
            ) : null}
          </form>

          <section className="akun-kartu">
            <div className="akun-kepala">
              <div>
                <h2>Rencana Pernikahan</h2>
                <p>Pilih rencana aktif atau tambah rencana baru.</p>
              </div>
              {bisaUbah ? (
                <Link className="akun-tombol akun-tombol-sekunder" href="/rencana/plan">
                  + Rencana baru
                </Link>
              ) : null}
            </div>

            <div className="akun-rencana-daftar">
              {daftarPlan.map((p: Plan) => {
                const aktif = p.id === planId;
                return (
                  <div
                    key={p.id}
                    className="akun-rencana-baris"
                    data-aktif={aktif ? "ya" : undefined}
                  >
                    <div className="akun-rencana-teks">
                      <div className="akun-rencana-nama">
                        <strong>
                          {p.partnerName ? `Bersama ${p.partnerName}` : "Rencana Pernikahan"}
                        </strong>
                        {aktif ? <span className="akun-lencana">Aktif</span> : null}
                      </div>
                      <span className="akun-rencana-ket">
                        {tanggalPanjangDari(p.weddingDate)} ·{" "}
                        {p.status ? LABEL_STATUS_PLAN[p.status as StatusPlan] ?? p.status : "Perencanaan"}
                      </span>
                    </div>
                    <div className="akun-rencana-aksi">
                      {!aktif ? (
                        <button
                          type="button"
                          className="akun-tombol akun-tombol-sekunder"
                          onClick={() => {
                            pilihPlan(p.id);
                            toast(`Beralih ke rencana bersama ${p.partnerName || "Pasangan"}`);
                          }}
                        >
                          Jadikan aktif
                        </button>
                      ) : null}
                      {bisaUbah ? (
                        <Link className="akun-tombol akun-tombol-sekunder" href="/rencana/plan">
                          Kelola rincian
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <section className="akun-kartu">
        <div className="akun-kepala">
          <div>
            <h2>Tema Tampilan</h2>
            <p>Mode gelap dirancang dengan pasangan warna kontras tinggi, bukan pembalikan warna.</p>
          </div>
        </div>

        <div className="akun-tema-pilih">
          <button
            type="button"
            className="akun-tema-chip"
            data-aktif={tema === "terang" ? "ya" : undefined}
            onClick={() => gantiTema("terang")}
          >
            <span className="akun-tema-teks">
              <strong>Mode Terang</strong>
              <small>Selalu cerah</small>
            </span>
          </button>
          <button
            type="button"
            className="akun-tema-chip"
            data-aktif={tema === "gelap" ? "ya" : undefined}
            onClick={() => gantiTema("gelap")}
          >
            <span className="akun-tema-teks">
              <strong>Mode Gelap</strong>
              <small>Nyaman saat malam</small>
            </span>
          </button>
          <button
            type="button"
            className="akun-tema-chip"
            data-aktif={tema === "sistem" ? "ya" : undefined}
            onClick={() => gantiTema("sistem")}
          >
            <span className="akun-tema-teks">
              <strong>Mengikuti Sistem</strong>
              <small>Ikut pengaturan perangkat</small>
            </span>
          </button>
        </div>
      </section>

      <section className="akun-kartu">
        <div className="akun-kepala">
          <div>
            <h2>Cadangan Data Mandiri</h2>
            <p>
              Unduh seluruh data rencanamu, termasuk nama dan nomor tamu, ke satu berkas JSON
              supaya kamu selalu punya salinannya.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="akun-tombol akun-tombol-sekunder akun-cadangan-tombol"
          disabled={sedangUnduh || !planId}
          onClick={unduhCadanganJson}
        >
          <IkonUnduh />
          {sedangUnduh ? "Mengunduh..." : "Unduh Cadangan JSON"}
        </button>
      </section>

      <section className="akun-kartu akun-info">
        <h2>Informasi Aplikasi dan Luring</h2>
        <div className="akun-info-daftar">
          <div className="akun-info-baris">
            <span>Status koneksi</span>
            <strong data-online={online ? "ya" : "tidak"}>
              {online ? "Terhubung" : "Luring"}
            </strong>
          </div>
          <div className="akun-info-baris">
            <span>Aplikasi web progresif</span>
            <Link className="tautan-kalimat" href="/aplikasi">
              Cara memasang
            </Link>
          </div>
          <div className="akun-info-baris">
            <span>Versi sistem</span>
            <span className="akun-info-versi">
              {process.env.NEXT_PUBLIC_APP_VERSION} (Next.js 15 + PostgreSQL)
            </span>
          </div>
        </div>
      </section>

      <div className="akun-tips">
        <span className="akun-tips-ikon">
          <IkonTips />
        </span>
        <p>
          <strong>Catatan tenang:</strong> semua data ini bisa kamu ubah kapan
          saja. Kalau sinyal hilang, catatan baru masuk antrean dan terkirim
          sendiri begitu online.
        </p>
      </div>

      <section className="akun-kartu">
        <div className="akun-kepala">
          <div>
            <h2>Hapus akun</h2>
            <p>
              Menghapus akun akan menghapus seluruh rencana dan data di dalamnya. Tindakan
              ini tidak bisa dibatalkan.
            </p>
          </div>
        </div>
        {bisaUbah ? (
          <button
            type="button"
            className="akun-tombol akun-tombol-sekunder"
            onClick={() => {
              setSandiHapus("");
              setGalatHapusAkun(null);
              setBukaHapusAkun(true);
            }}
          >
            Hapus akun
          </button>
        ) : null}
      </section>

      {dariPerangkat ? (
        <p className="keterangan">
          Data ini dibuka dari cadangan perangkat. Mengubah data akun dan rencana tidak bisa
          dilakukan sampai ada koneksi.
        </p>
      ) : null}

      <div className="akun-aksi">
        {plan && bisaUbah ? (
          <button
            type="button"
            onClick={() => simpanDasar()}
            className="akun-tombol akun-tombol-utama akun-aksi-utama"
            disabled={sedangSimpan}
          >
            {sedangSimpan ? "Menyimpan..." : "Simpan data dasar"}
            <IkonPanah />
          </button>
        ) : null}
        <Link className="akun-aksi-halus" href="/rencana/plan">
          Atur rincian lengkap di Rencana
        </Link>
      </div>

      <Lembar
        buka={bukaHapusAkun}
        judul="Hapus akun"
        onTutup={() => setBukaHapusAkun(false)}
      >
        <form onSubmit={konfirmasiHapusAkun} noValidate className="tumpuk-sedang">
          <p className="keterangan">
            Semua rencana dan data kamu akan dihapus permanen. Masukkan kata sandi untuk
            mengonfirmasi.
          </p>
          {galatHapusAkun ? <PesanGalat teks={galatHapusAkun} /> : null}
          <label className="keterangan" htmlFor="sandiHapusAkun">
            Kata sandi
          </label>
          <input
            id="sandiHapusAkun"
            className="isian"
            type="password"
            autoComplete="current-password"
            value={sandiHapus}
            onChange={(e) => setSandiHapus(e.target.value)}
          />
          <div className="dialog-tombol">
            <button
              type="button"
              className="tombol tombol-sekunder"
              onClick={() => setBukaHapusAkun(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="tombol tombol-bahaya"
              disabled={sedangHapusAkun}
            >
              {sedangHapusAkun ? "Menghapus..." : "Hapus akun"}
            </button>
          </div>
        </form>
      </Lembar>
    </div>
  );
}

function IkonKilau({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9Z" />
      <path d="M19 4v3M17.5 5.5h3" />
    </svg>
  );
}

function IkonHati({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.3 12 20 12 20Z" />
    </svg>
  );
}

function IkonJamPasir({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3h10M7 21h10" />
      <path d="M8 3v3.5c0 2.2 4 3.8 4 5.5s-4 3.3-4 5.5V21" />
      <path d="M16 3v3.5c0 2.2-4 3.8-4 5.5s4 3.3 4 5.5V21" />
    </svg>
  );
}

function IkonUnduh({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </svg>
  );
}

function IkonTips({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20s-7-4.4-7-9a4.2 4.2 0 0 1 7-3.1A4.2 4.2 0 0 1 19 11c0 4.6-7 9-7 9Z" />
      <path d="M9.5 11.5h5" />
    </svg>
  );
}

function IkonPanah({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </svg>
  );
}
