import type { ReactNode } from "react";
import Link from "next/link";
import { Merek } from "@/components/merek";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthHero } from "@/components/auth-hero";
import { NAMA_PRODUK } from "@/lib/konstanta";

/**
 * Kerangka layar masuk dan daftar. Susunannya mengikuti layar Stitch: kepala
 * berisi chip merek, satu badge kecil, lambang bulat dengan kabut di
 * belakangnya, lalu sapaan. Isi form ada di kartu putih.
 *
 * Kepala (badge, lambang, sapaan) ada di komponen `AuthHero`, karena layar
 * "Masuk" dan "Daftar" di Stitch punya kepala yang berbeda. Chip merek dan
 * kartu form tetap di sini karena kedua layar memakainya sama.
 *
 * Lambang merek diambil dari logo Stitch lewat komponen `Merek`, jadi kepala
 * dan lambang besar memakai gambar yang sama persis dengan desain aslinya.
 *
 * Badge di Stitch dipakai untuk CTA. Di sini badge tidak bisa diklik, karena
 * tombol yang tidak berfungsi lebih buruk daripada tidak ada tombol.
 */
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <main className="bungkus layar-auth" id="konten">
      <a className="lompat" href="#konten">
        Lompat ke isi
      </a>

      <div className="auth-kontainer">
        <div className="auth-kepala">
          <header className="auth-navigasi-atas">
            <Link href="/" className="auth-merek-chip" aria-label={`Beranda ${NAMA_PRODUK}`}>
              <span className="auth-merek-ikon" aria-hidden="true">
                <Merek ukuran={32} />
              </span>
              <span className="auth-merek-nama">{NAMA_PRODUK}</span>
            </Link>
            <ThemeToggle />
          </header>

          <AuthHero />
        </div>

        <div className="auth-kartu">
          <span className="auth-kabut auth-kabut-atas" aria-hidden="true" />
          <span className="auth-kabut auth-kabut-bawah" aria-hidden="true" />
          {children}
        </div>

        <div className="auth-aman">
          <span className="auth-aman-ikon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
            </svg>
          </span>
          <span className="auth-aman-teks">
            <span className="auth-aman-judul">Catatan kalian tersimpan rapi</span>
            <span className="auth-aman-sub">
              Data rencana hanya bisa dibuka oleh akun yang kamu daftarkan.
            </span>
          </span>
        </div>
      </div>
    </main>
  );
}
