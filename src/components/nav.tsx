"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigasiAktif as aktif } from "@/lib/navigasi";
import { ThemeToggle } from "./theme-toggle";
import { Merek, NAMA_MEREK } from "./merek";

/**
 * Kepala aplikasi untuk breakpoint expanded. Isinya sengaja tetap di semua
 * layar: identitas produk, tombol tema, dan jalan ke Akun. Judul halaman dan
 * aksi utamanya tidak di sini, tapi di `.kepala-halaman` milik tiap halaman,
 * supaya judul tidak pernah tertulis dua kali dan tiap halaman tetap bisa
 * memilih aksi utamanya sendiri.
 */
export function KepalaApp() {
  return (
    <header className="kepala-app tanpa-cetak">
      <div className="kepala-app-dalam">
        <Link className="kepala-app-merek" href="/beranda">
          <span className="kepala-app-lambang">
            <Merek ukuran={32} />
          </span>
          <span className="kepala-app-nama">{NAMA_MEREK}</span>
        </Link>
        <div className="kepala-app-aksi">
          <ThemeToggle />
          <Link className="kepala-app-akun" href="/akun">
            Akun
          </Link>
        </div>
      </div>
    </header>
  );
}

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

// Empat item bawah dari docs/05-IA-dan-Layar.md bagian 3. Sengaja empat,
// bukan lima, supaya bilah bawah tetap muat di layar 360px tanpa mengecilkan
// tulisan. Modul lain masuk lewat halaman Rencana.
const BAWAH = [
  { href: "/beranda", label: "Beranda", ikon: <IkonBeranda /> },
  { href: "/rencana", label: "Rencana", ikon: <IkonRencana /> },
  { href: "/anggaran", label: "Anggaran", ikon: <IkonAnggaran /> },
  { href: "/tamu", label: "Tamu", ikon: <IkonTamu /> },
];

// Sisi kiri di layar lebar. Isinya empat item bawah, ditambah Hari-H, Vendor,
// dan Laporan yang tidak muat di bilah bawah.
const SISI = [
  ...BAWAH,
  { href: "/hari-h", label: "Hari-H", ikon: <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 10h16m-12 4h3m-3 3h6" /></svg> },
  { href: "/rencana/vendor", label: "Vendor", ikon: <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v10h16V10M3 10l2-6h14l2 6M8 20v-6h5v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></svg> },
  { href: "/laporan", label: "Laporan", ikon: <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8m-8 4h6" /></svg> },
];

export function NavBawah() {
  const pathname = usePathname();

  return (
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
    </nav>
  );
}

export function NavSisi({ namaPasangan }: { namaPasangan: string }) {
  const pathname = usePathname();

  return (
    <nav className="nav-sisi tanpa-cetak" aria-label="Navigasi samping">
      <div className="nav-kepala">
        <span className="label-bagian">Rencana pernikahan</span>
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
        <Link
          href="/akun"
          className="nav-tautan"
          data-aktif={aktif(pathname, "/akun") ? "ya" : undefined}
        >
          Akun
        </Link>
      </div>
    </nav>
  );
}
