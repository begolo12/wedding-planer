"use client";

import Link from "next/link";
import { usePlan } from "@/lib/use-plan";
import { useMuat } from "@/lib/use-muat";
import { useStatusLuring } from "@/lib/status-luring";
import type { RingkasanPlan } from "@/lib/ringkasan";
import { Kerangka, Kosong, Gagal } from "@/components/states";
import { TaskItem } from "@/components/task-item";
import { Rupiah } from "@/components/rupiah";
import { jamDari, tanggalPanjangDari } from "@/lib/format";

/**
 * Beranda utama aplikasi.
 *
 * Susunannya mengikuti layar Beranda dari rancangan Stitch
 * (docs/stitch_cute_wedding_planner/beranda_web_app_sweet_ties):
 *
 * 1. Banner hitung mundur dan kutipan.
 * 2. Tiga pil aksi cepat.
 * 3. Tiga kartu angka: checklist, konfirmasi tamu, anggaran.
 * 4. Daftar tugas prioritas.
 * 5. Sisi kanan: vendor utama, tanggal penting, catatan pasangan.
 *
 * Tiga hal sengaja tidak disalin apa adanya dari Stitch, dengan alasan:
 *
 * - Bilah atas Stitch berisi logo, lonceng, dan avatar. Aplikasi ini sudah
 *   punya NavSisi dan NavBawah di tata letak induk, jadi bilah itu dilipat
 *   keluar supaya tidak ada dua navigasi yang bertumpuk.
 * - Angka Stitch ditulis "Rp 185 Jt". AGENTS.md bagian 4 melarang singkatan
 *   juta, jadi semua uang ditulis penuh.
 * - Kotak centang Stitch berukuran 24px, di bawah batas sentuh 44px. Daftar
 *   tugas tetap memakai TaskItem supaya target sentuh dan aksi centangnya
 *   tidak berubah.
 *
 * Widget "Moodboard Impian" dari Stitch tidak dibangun karena belum ada fitur
 * unggah inspirasi, jadi tombolnya akan jadi tombol mati. Tempatnya dipakai
 * kartu "Tanggal Penting" yang datanya sudah ada.
 */
type ItemRundown = {
  id: string;
  title: string;
  startTime: string;
  location: string | null;
};

export default function HalamanBeranda() {
  const { plan, planId, memuat: memuatPlan, galat: galatPlan, muatUlang: muatPlan } = usePlan();

  const { luring, dariPerangkat } = useStatusLuring();
  const bisaUbah = !luring && !dariPerangkat;

  const {
    data: ringkasan,
    memuat: memuatRingkasan,
    galat: galatRingkasan,
    muatUlang: muatRingkasan,
  } = useMuat<RingkasanPlan>(planId ? `/api/plans/${planId}/overview` : null, {
    aktif: Boolean(planId),
  });

  // Rundown diambil terpisah karena /overview sengaja dibatasi lima sumber data.
  // Kartunya hanya muncul kalau sudah ada acara, jadi tidak menambah state
  // kosong kedua di Beranda yang tidak diatur docs/05 bagian 6.
  const { data: dataRundown } = useMuat<{ rundown: ItemRundown[] }>(
    planId ? `/api/plans/${planId}/rundown` : null,
    { aktif: Boolean(planId) },
  );

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
    vendorUtama,
    tamu,
    tanggalBerikut,
  } = ringkasan;

  // Semua persentase di bawah dihitung dari nol, bukan dari angka contoh.
  // Pembagian dengan nol dijaga supaya kartu kosong menampilkan 0, bukan NaN.
  const persenTugas = jumlahTugas.total
    ? Math.round((jumlahTugas.selesai / jumlahTugas.total) * 100)
    : 0;
  const persenAnggaran = uang.planned ? Math.round((uang.paid / uang.planned) * 100) : 0;
  const persenHadir = tamu.orang ? Math.round((tamu.hadir / tamu.orang) * 100) : 0;
  const tugasSisa = jumlahTugas.total - jumlahTugas.selesai;
  const mingguLagi = hariKe !== null && hariKe > 0 ? Math.floor(hariKe / 7) : null;

  const sapaan = plan.partnerName
    ? `Halo, ${plan.partnerName}! Selamat merencanakan hari bahagia`
    : "Halo! Selamat merencanakan hari bahagia";

  if (!hariBesar && jumlahTugas.total === 0 && jumlahVendor === 0) {
    return (
      <div className="beranda">
        <div className="kepala-halaman">
          <div>
            <h1>Beranda</h1>
            <p>Ringkasan hari ini: tugas terdekat, sisa anggaran, dan hitung mundur menuju hari besar.</p>
          </div>
        </div>
        <section className="beranda-awal">
          <span className="beranda-awal-ikon" aria-hidden="true"><IkonHati size={32} /></span>
          <Kosong
            keadaan="Rencana kamu masih kosong."
            jalanKeluar="Tambahkan tugas pertama, lalu anggaran dan daftar tamu menyusul."
          >
            {bisaUbah ? (
              <Link className="tombol tombol-utama" href="/rencana">
                <IkonTambah size={18} />
                Tambah tugas pertama
              </Link>
            ) : null}
          </Kosong>
        </section>
      </div>
    );
  }

  return (
    <div className="beranda">
      {/* Kepala halaman: judul dan satu aksi utama. Tombol "Tambah Tugas"
          milik hero dihapus supaya tidak ada dua tombol utama untuk pekerjaan
          yang sama di satu layar. */}
      <div className="kepala-halaman">
        <div>
          <h1>Beranda</h1>
          <p>
            Ringkasan hari ini: tugas terdekat, sisa anggaran, dan hitung mundur menuju hari
            besar.
          </p>
        </div>
        {bisaUbah ? (
          <Link className="tombol tombol-utama" href="/rencana">
            <IkonTambah size={18} />
            Tambah tugas
          </Link>
        ) : null}
      </div>

      <section className="beranda-hero">
        <div className="beranda-hero-isi">
          <div className="beranda-hero-kiri">
            <span className="beranda-pil-aksen">
              <IkonHati size={16} />
              Hitung Mundur Menuju Pelaminan
            </span>
            <p className="beranda-sapa">{sapaan}</p>
            <p className="beranda-tanggal">
              <IkonKalender size={20} />
              {hariBesar ? tanggalPanjangDari(hariBesar) : "Tanggal pernikahan belum ditentukan"}
              {tanggalBerikut ? (
                <>
                  <span className="beranda-pemisah" aria-hidden="true">
                    •
                  </span>
                  <IkonTanda size={20} />
                  {tanggalBerikut.title}
                </>
              ) : null}
            </p>
            <span className="beranda-kutip">
              <IkonKutip size={14} />
              Satu langkah kecil tiap hari, dan hari besar itu makin dekat.
            </span>
          </div>

          {hariKe !== null ? (
            <div className="beranda-mundur">
              <div className="beranda-mundur-kotak">
                <span className="beranda-mundur-besar">
                  {hariKe < 0 ? Math.abs(hariKe) : hariKe}
                </span>
                <span className="beranda-mundur-kecil">
                  {hariKe < 0 ? "Hari Berlalu" : "Hari Lagi"}
                </span>
              </div>
              <div className="beranda-mundur-sisi">
                <div className="beranda-mundur-grid">
                  <div className="beranda-mundur-sel">
                    <span className="beranda-mundur-nilai">{mingguLagi ?? "-"}</span>
                    <span className="beranda-mundur-sel-label">Minggu</span>
                  </div>
                  <div className="beranda-mundur-sel">
                    <span className="beranda-mundur-nilai">{tugasSisa}</span>
                    <span className="beranda-mundur-sel-label">Tugas Sisa</span>
                  </div>
                </div>
                <p className="beranda-mundur-pita">
                  {teksHitungMundur ?? "Menuju hari pernikahan"}
                </p>
              </div>
            </div>
          ) : (
            <div className="beranda-mundur">
              <div className="beranda-mundur-sisi">
                <p className="beranda-mundur-pita">Tanggal hari-H belum diisi.</p>
                {bisaUbah ? (
                  <Link className="beranda-kartu-tautan" href="/rencana/tanggal">
                    Tambah tanggal akad
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/*
          Maksimal tiga aksi sekunder, dan ketiganya menuju modul berbeda:
          rencana, anggaran, dan tamu. "Bagikan" dan "Cetak laporan" dihapus
          karena keduanya berakhir di modul laporan yang sama, jadi dua tombol
          itu satu pekerjaan di dua tempat, dan laporan tetap terjangkau lewat
          item "Laporan" di navigasi. Tidak ada tombol bergaya utama di baris
          ini: aksi utama layar sudah ada di kepala halaman.
          Ketiganya tetap disembunyikan saat luring, karena isinya menambah
          data dan penambahan data butuh koneksi.
        */}
        <div className="beranda-aksi">
          {bisaUbah ? (
            <>
              <Link className="beranda-aksi-pil" href="/rencana">
                <IkonChecklist size={18} />
                Muat checklist
              </Link>
              <Link className="beranda-aksi-pil" href="/anggaran">
                <IkonUang size={18} />
                Catat Pengeluaran
              </Link>
              <Link className="beranda-aksi-pil" href="/tamu">
                <IkonTamu size={18} />
                Tamu Baru
              </Link>
            </>
          ) : null}
        </div>
      </section>

      <div className="beranda-grid">
        <div className="beranda-kolom-utama">
          {dataRundown && dataRundown.rundown.length > 0 ? (
            <section className="kartu beranda-kartu">
              <div className="beranda-kartu-kepala">
                <span className="label-bagian">Rundown hari ini</span>
                <Link className="beranda-kartu-tautan" href="/hari-h">
                  Lihat rundown
                  <IkonPanah size={16} />
                </Link>
              </div>
              <div className="tumpuk-rapat">
                {dataRundown.rundown.slice(0, 4).map((r) => (
                  <div className="butir" key={r.id}>
                    <span className="lencana lencana-aksen angka">{jamDari(r.startTime)}</span>
                    <div className="butir-isi">
                      <div className="butir-judul">{r.title}</div>
                      {r.location ? <div className="butir-ket">{r.location}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="beranda-metrik">
            <section className="kartu beranda-kartu">
              <div className="beranda-kartu-kepala">
                <span className="label-bagian">Tugas</span>
                <span className="beranda-ikon-bulat beranda-ikon-utama">
                  <IkonChecklist size={18} />
                </span>
              </div>
              <div className="beranda-kartu-isi">
                <div className="beranda-kartu-angka">
                  <span className="beranda-kartu-besar">{persenTugas}%</span>
                  <span className="beranda-kartu-kecil">
                    {jumlahTugas.selesai} / {jumlahTugas.total} selesai
                  </span>
                </div>
                <div className="beranda-bar">
                  <span
                    className="beranda-bar-isi beranda-bar-utama"
                    style={{ width: `${persenTugas}%` }}
                  />
                </div>
              </div>
              {jumlahTugas.lewat > 0 ? (
                <Link
                  className="beranda-kartu-catatan beranda-catatan-bahaya"
                  href="/rencana"
                >
                  <IkonPenting size={15} />
                  {jumlahTugas.lewat} tugas lewat tenggat, lihat daftarnya
                </Link>
              ) : (
                <p className="beranda-kartu-catatan">
                  {jumlahTugas.tanpaTenggat} tugas belum punya tenggat
                </p>
              )}
            </section>

            <section className="kartu beranda-kartu">
              <div className="beranda-kartu-kepala">
                <span className="label-bagian">Konfirmasi Tamu</span>
                <span className="beranda-ikon-bulat beranda-ikon-tersier">
                  <IkonTamu size={18} />
                </span>
              </div>
              <div className="beranda-kartu-isi">
                <div className="beranda-kartu-angka">
                  <span className="beranda-kartu-besar">{tamu.porsi}</span>
                  <span className="beranda-kartu-kecil">perkiraan porsi katering</span>
                  <span className="beranda-kartu-kecil beranda-kartu-tanda">
                    {persenHadir}% sudah menyatakan hadir
                  </span>
                </div>
                <span className="beranda-cincin" aria-hidden="true">
                  <svg viewBox="0 0 36 36">
                    <circle className="beranda-cincin-dasar" cx="18" cy="18" r="15.9155" />
                    <circle
                      className="beranda-cincin-isi"
                      cx="18"
                      cy="18"
                      r="15.9155"
                      strokeDasharray={`${persenHadir}, 100`}
                    />
                  </svg>
                  <span className="beranda-cincin-teks">{persenHadir}%</span>
                </span>
              </div>
              <div className="beranda-pil-baris">
                <span className="beranda-pil beranda-pil-utama">{tamu.hadir} Hadir</span>
                <span className="beranda-pil beranda-pil-kedua">
                  {tamu.belumKonfirmasi} Belum konfirmasi hadir
                </span>
                <span className="beranda-pil beranda-pil-redup">
                  {tamu.tidakHadir} Tidak hadir
                </span>
              </div>
            </section>

            <section className="kartu beranda-kartu">
              <div className="beranda-kartu-kepala">
                <span className="label-bagian">Anggaran Pernikahan</span>
                <span className="beranda-ikon-bulat beranda-ikon-kedua">
                  <IkonUang size={18} />
                </span>
              </div>
              <div className="beranda-kartu-isi">
                <div className="beranda-kartu-angka">
                  <span className="beranda-kartu-besar">
                    <Rupiah nilai={uang.paid} />
                  </span>
                  <span className="beranda-kartu-kecil">
                    Dari <Rupiah nilai={uang.planned} /> ({persenAnggaran}%)
                  </span>
                </div>
                <div className="beranda-bar">
                  <span
                    className="beranda-bar-isi beranda-bar-kedua"
                    style={{ width: `${persenAnggaran}%` }}
                  />
                </div>
              </div>
              <div className="beranda-kartu-kaki">
                <span>Sisa anggaran</span>
                <span className="beranda-kartu-tebal">
                  <Rupiah nilai={uang.remaining} /> ({100 - persenAnggaran}%)
                </span>
              </div>
            </section>
          </div>

          <section className="kartu beranda-tugas">
            <div className="beranda-tugas-kepala">
              <div className="beranda-tugas-judul">
                <IkonDaftar size={24} />
                <h2>Tugas Prioritas</h2>
                {tugasTerdekat.length > 0 ? (
                  <span className="beranda-pil beranda-pil-utama">
                    {tugasTerdekat.length} Tugas
                  </span>
                ) : null}
              </div>
              <Link className="beranda-kartu-tautan" href="/rencana">
                Lihat seluruh tugas
                <IkonPanah size={16} />
              </Link>
            </div>

            {tugasTerdekat.length === 0 ? (
              <p className="beranda-tugas-kosong">
                Tidak ada tugas yang mendesak saat ini. Tambah tugas baru untuk mengisi daftar
                ini.
              </p>
            ) : (
              <div className="beranda-tugas-daftar">
                {tugasTerdekat.map((t) => (
                  <TaskItem key={t.id} tugas={t} planId={plan.id} onUbah={() => muatRingkasan()} />
                ))}
              </div>
            )}

            <div className="beranda-tugas-kaki">
              <span className="beranda-tugas-petunjuk">
                Tekan lingkaran untuk menandai tugas selesai
              </span>
              <Link className="beranda-kartu-tautan" href="/rencana">
                Lihat semua tugas
                <IkonPanah size={16} />
              </Link>
            </div>
          </section>
        </div>

        <aside className="beranda-kolom-sisi">
          {tanggalBerikut ? (
            <section className="kartu beranda-kartu">
              <div className="beranda-kartu-kepala">
                <div className="beranda-kartu-judul">
                  <IkonKalender size={20} />
                  <h3>Tanggal Penting</h3>
                </div>
                <Link className="beranda-kartu-tautan" href="/rencana/tanggal">
                  Semua tanggal
                </Link>
              </div>
              <div className="beranda-tanggal-besar">
                <span className="beranda-tanggal-angka">{tanggalBerikut.eventDate.slice(8, 10)}</span>
                <div className="beranda-tanggal-teks">
                  <span className="beranda-tanggal-nama">{tanggalBerikut.title}</span>
                  <span className="beranda-kartu-kecil">
                    {tanggalPanjangDari(tanggalBerikut.eventDate)}
                    {tanggalBerikut.eventTime ? ` jam ${jamDari(tanggalBerikut.eventTime)}` : ""}
                  </span>
                  <span className="beranda-kartu-kecil">
                    {tanggalBerikut.selisihHari === 0
                      ? "Hari ini"
                      : tanggalBerikut.selisihHari < 0
                        ? `${Math.abs(tanggalBerikut.selisihHari)} hari lalu`
                        : `${tanggalBerikut.selisihHari} hari lagi`}
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          <section className="kartu beranda-kartu">
            <div className="beranda-kartu-kepala">
              <div className="beranda-kartu-judul">
                <IkonVendor size={20} />
                <h3>Vendor Utama</h3>
              </div>
              {jumlahVendor > 0 ? (
                <span className="beranda-pil beranda-pil-kedua">{jumlahVendor} Aktif</span>
              ) : null}
            </div>

            {vendorUtama.length === 0 ? (
              <p className="beranda-tugas-kosong">
                Belum ada vendor yang dicatat.{" "}
                {bisaUbah ? (
                  <Link className="beranda-kartu-tautan" href="/rencana/vendor">
                    Tambah vendor
                  </Link>
                ) : null}
              </p>
            ) : (
              <div className="beranda-vendor-daftar">
                {vendorUtama.map((v) => (
                  <div className="beranda-vendor" key={v.id}>
                    <div className="beranda-vendor-isi">
                      <span className="beranda-vendor-ikon" aria-hidden="true">
                        {v.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="beranda-vendor-teks">
                        <span className="beranda-vendor-nama">{v.name}</span>
                        <span className="beranda-vendor-kategori">{v.category}</span>
                      </span>
                    </div>
                    {v.phone ? (
                      <a
                        className="beranda-ikon-tombol"
                        href={`tel:${v.phone}`}
                        aria-label={`Telepon ${v.name}`}
                      >
                        <IkonTelepon size={18} />
                      </a>
                    ) : null}
                  </div>
                ))}
                <Link className="beranda-kartu-tautan" href="/rencana/vendor">
                  Lihat semua vendor
                </Link>
              </div>
            )}
          </section>

          <section className="beranda-catatan">
            <span className="beranda-catatan-kepala">
              <IkonHati size={18} />
              Catatan Manis Pasangan
            </span>
            <p className="beranda-catatan-teks">
              Luangkan waktu santai berdua malam ini tanpa membahas vendor, anggaran, atau
              persiapan pernikahan. Seduh teh hangat dan saling bertukar senyum ya.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

/** Ikon garis. Semua digambar sendiri, bukan font ikon, supaya tidak ada
 * permintaan berkas tambahan yang bisa gagal saat sinyal hilang. */
function Ikon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

function IkonHati({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 21s-7.5-4.6-9.6-9A5.4 5.4 0 0 1 12 6.3 5.4 5.4 0 0 1 21.6 12c-2.1 4.4-9.6 9-9.6 9z" />
    </svg>
  );
}

const IkonKalender = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M4 7h16v13H4zM4 7l0-2h16v2M8 3v4M16 3v4" />
);
const IkonTanda = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11z" />
);
const IkonKutip = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M9 7H5v4h4v6H5M19 7h-4v4h4v6h-4" />
);
const IkonTambah = ({ size }: { size?: number }) => <Ikon size={size} d="M12 5v14M5 12h14" />;
const IkonUang = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M3 7h18v10H3zM7 12h.01M17 12h.01" />
);
const IkonTamu = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M15 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M11.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M18 8v6M21 11h-6" />
);
const IkonChecklist = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M4 7h4v4H4zM4 15h4v4H4zM11 9h9M11 17h9" />
);
const IkonPenting = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M12 4v10M12 18h.01" />
);
const IkonDaftar = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M4 6h16M4 12h16M4 18h10" />
);
const IkonPanah = ({ size }: { size?: number }) => <Ikon size={size} d="M5 12h14M13 6l6 6-6 6" />;
const IkonVendor = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M4 20v-9l8-6 8 6v9M9 20v-6h6v6" />
);
const IkonTelepon = ({ size }: { size?: number }) => (
  <Ikon size={size} d="M6 4h4l2 5-2 1.5a12 12 0 0 0 5 5L16.5 13l3.5 1v4a1 1 0 0 1-1 1A15 15 0 0 1 5 5a1 1 0 0 1 1-1z" />
);


