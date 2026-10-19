"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigasiAktif as aktif } from "@/lib/navigasi";
import { ThemeToggle } from "./theme-toggle";
import { Merek, NAMA_MEREK } from "./merek";

// Ikon bilah bawah. Digambar sebagai SVG, bukan glyph Unicode, karena glyph
// jatuh di baseline font yang berbeda-beda: ketebalan garisnya tidak seragam,
// ukurannya tidak sama, dan posisinya bergeser sedikit antar perangkat. Empat
// ikon ini memakai kotak gambar 24px dan ketebalan garis 2px yang sama, jadi
// bilahnya terbaca sebagai satu set.
//
// Semua ikon `aria-hidden`; label teks di bawahnya yang membawa nama tujuan.
type IkonBawah = (props: { className?: string }) => React.JSX.Element;

const IkonBeranda: IkonBawah = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </svg>
);

const IkonRencana: IkonBawah = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h9M4 12h9M4 17h9" />
    <path d="m16 16 2 2 4-5" />
  </svg>
);

const IkonAnggaran: IkonBawah = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 8h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M4 8V7a1 1 0 0 1 1-1h11v2" />
    <path d="M16 13h2" />
  </svg>
);

const IkonTamu: IkonBawah = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

const IkonHariH: IkonBawah = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M8 3v4m8-4v4M4 10h16m-12 4h3m-3 3h6" />
  </svg>
);

const IkonLainnya: IkonBawah = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="5" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="19" cy="12" r="1.7" />
  </svg>
);

// Lima item bawah dari docs/05-IA-dan-Layar.md bagian 3. Hari-H naik ke
// bilah bawah karena rundown adalah janji produk nomor tiga (AGENTS.md
// bagian 1): orang di lokasi harus bisa membukanya satu tap dari halaman
// mana pun, bukan lewat kartu Beranda. Layar 360px tetap muat karena label
// memakai --text-mini dan ikon tetap 24px.
const BAWAH = [
  { href: "/beranda", label: "Beranda", ikon: <IkonBeranda /> },
  { href: "/rencana", label: "Rencana", ikon: <IkonRencana /> },
  { href: "/hari-h", label: "Hari-H", ikon: <IkonHariH /> },
  { href: "/anggaran", label: "Anggaran", ikon: <IkonAnggaran /> },
  { href: "/tamu", label: "Tamu", ikon: <IkonTamu /> },
];

// Sisi kiri di layar lebar. Isinya lima item bawah ditambah Vendor dan
// Laporan yang tidak muat di bilah bawah.
const SISI = [
  ...BAWAH,
  { href: "/rencana/vendor", label: "Vendor", ikon: <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v10h16V10M3 10l2-6h14l2 6M8 20v-6h5v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></svg> },
  { href: "/laporan", label: "Laporan", ikon: <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8m-8 4h6" /></svg> },
];

export function NavBawah() {
  const pathname = usePathname();
  const [lainnyaTerbuka, setLainnyaTerbuka] = useState(false);

  // Lembar ditutup saat pindah halaman supaya tidak menutupi layar baru.
  useEffect(() => {
    setLainnyaTerbuka(false);
  }, [pathname]);

  // Selama lembar terbuka, isi halaman tidak bisa digulir.
  useEffect(() => {
    document.body.style.overflow = lainnyaTerbuka ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lainnyaTerbuka]);

  // Lembar "Lainnya" aktif kalau halaman sekarang adalah tujuan di dalamnya.
  const lainnyaAktif =
    pathname.startsWith("/laporan") || pathname.startsWith("/akun");

  return (
    <>
      <nav className="nav-bawah tanpa-cetak" aria-label="Navigasi utama">
        {BAWAH.map((item) => {
          const ini = aktif(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nav-item"
              aria-current={ini ? "page" : undefined}
              data-aktif={ini ? "ya" : undefined}
            >
              <span className="nav-ikon" aria-hidden="true">
                {item.ikon}
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className="nav-item"
          aria-expanded={lainnyaTerbuka}
          data-aktif={lainnyaAktif || lainnyaTerbuka ? "ya" : undefined}
          onClick={() => setLainnyaTerbuka((b) => !b)}
        >
          <span className="nav-ikon" aria-hidden="true">
            <IkonLainnya />
          </span>
          <span className="nav-label">Lainnya</span>
        </button>
      </nav>

      {lainnyaTerbuka ? (
        <div className="lembar-lapis" onClick={() => setLainnyaTerbuka(false)}>
          <div
            className="lembar-bawah tanpa-cetak"
            role="dialog"
            aria-modal="true"
            aria-label="Menu lainnya"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lembar-pegangan" aria-hidden="true" />
            <ThemeToggleBaris />
            <Link href="/laporan" className="lembar-tautan">
              <span className="nav-ikon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8m-8 4h6" /></svg>
              </span>
              Laporan
              <span className="lembar-tautan-keterangan">Uang, tugas, tamu</span>
            </Link>
            <Link href="/akun" className="lembar-tautan">
              <span className="nav-ikon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
              </span>
              Akun
              <span className="lembar-tautan-keterangan">Identitas dan tema</span>
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}

// Baris tema di dalam lembar Lainnya. Dipisah dari ThemeToggle murni supaya
// bentuk baris daftar dan tombolnya satu pola dengan tautan lain.
function ThemeToggleBaris() {
  return (
    <div className="lembar-tautan lembar-tautan-statis">
      <span className="nav-ikon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" /></svg>
      </span>
      Mode tampilan
      <ThemeToggle />
    </div>
  );
}

export function NavSisi({ namaPasangan }: { namaPasangan: string }) {
  const pathname = usePathname();

  return (
    <nav className="nav-sisi tanpa-cetak" aria-label="Navigasi samping">
      {/* Satu kepala untuk layar lebar: merek, tema, dan Akun semua di sini.
          Header atas dihapus supaya identitas tidak tertulis dua kali. */}
      <div className="nav-kepala">
        <Link className="nav-merek" href="/beranda" aria-label="Beranda Rapi Nikah">
          <span className="nav-merek-lambang">
            <Merek ukuran={32} />
          </span>
          <span className="nav-merek-nama">{NAMA_MEREK}</span>
        </Link>
        <p className="nav-nama">{namaPasangan}</p>
      </div>

      <ul className="nav-daftar">
        {SISI.map((item) => {
          const ini = aktif(pathname, item.href, true);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="nav-tautan"
                aria-current={ini ? "page" : undefined}
                data-aktif={ini ? "ya" : undefined}
              >
                <span className="nav-ikon">{item.ikon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="nav-kaki">
        <ThemeToggle />
        <Link
          href="/akun"
          className="nav-tautan nav-akun-tautan"
          data-aktif={aktif(pathname, "/akun") ? "ya" : undefined}
        >
          Akun
        </Link>
      </div>
    </nav>
  );
}
