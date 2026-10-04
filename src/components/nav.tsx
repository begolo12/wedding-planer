"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

// Empat item bawah dari docs/05-IA-dan-Layar.md bagian 3. Sengaja empat,
// bukan lima, supaya bilah bawah tetap muat di layar 360px tanpa mengecilkan
// tulisan. Modul lain masuk lewat halaman Rencana.
const BAWAH = [
  { href: "/beranda", label: "Beranda", ikon: "\u25A6" },
  { href: "/rencana", label: "Rencana", ikon: "\u2713" },
  { href: "/anggaran", label: "Anggaran", ikon: "\u25B2" },
  { href: "/tamu", label: "Tamu", ikon: "\u25CB" },
];

// Sisi kiri di layar lebar. Isinya empat item bawah, ditambah Hari-H, Vendor,
// dan Laporan yang tidak muat di bilah bawah.
const SISI = [
  { href: "/beranda", label: "Beranda" },
  { href: "/rencana", label: "Rencana" },
  { href: "/anggaran", label: "Anggaran" },
  { href: "/tamu", label: "Tamu" },
  { href: "/hari-h", label: "Hari-H" },
  { href: "/rencana/vendor", label: "Vendor" },
  { href: "/laporan", label: "Laporan" },
];

function aktif(pathname: string, href: string) {
  if (href === "/beranda") return pathname === "/beranda";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
          const ini = aktif(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="nav-tautan"
                aria-current={ini ? "page" : undefined}
                data-aktif={ini ? "ya" : undefined}
              >
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
