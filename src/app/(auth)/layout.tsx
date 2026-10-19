import type { ReactNode } from "react";
import Link from "next/link";
import { Merek } from "@/components/merek";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthHero } from "@/components/auth-hero";
import { NAMA_PRODUK } from "@/lib/konstanta";

/**
 * Kerangka layar masuk dan daftar.
 *
 * Susunannya satu kolom rata kiri: baris identitas berisi chip merek dan
 * tombol tema, satu sapaan, form, lalu satu catatan keamanan di kaki.
 *
 * Versi sebelumnya mengikuti layar Stitch dengan badan penuh hiasan: badge
 * melengkung, lambang bulat 96px, lencana di sudutnya, pita keunggulan, dan
 * dua kabut kabur di belakang kartu. Yang tersisa sekarang hanya yang dipakai
 * orang: nama produk, kalimat sambutan, form, dan satu keterangan bahwa
 * datanya tidak bisa dibuka orang lain. Hal yang tidak menambah kemampuan
 * tapi menambah tinggi layar dibuang, jadi form mulai lebih dekat ke atas.
 */
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <main className="bungkus layar-auth" id="konten">
      <a className="lompat" href="#konten">
        Lompat ke isi
      </a>

      <div className="auth-kontainer" data-visual-screen="auth">
        {/* Baris identitas layar: chip merek dan tombol tema. Ditaruh di
            tingkat kontainer, bukan di dalam kolom kepala, supaya di desktop
            bisa membentang di atas dua kolom dan tombol tema tidak
            menggantung di tengah kolom kiri. */}
        <header className="auth-navigasi-atas">
          <Link href="/" className="auth-merek-chip" aria-label={`Beranda ${NAMA_PRODUK}`}>
            <span className="auth-merek-ikon" aria-hidden="true">
              <Merek ukuran={32} />
            </span>
            <span className="auth-merek-nama">{NAMA_PRODUK}</span>
          </Link>
          <ThemeToggle />
        </header>

        <div className="auth-kepala">
          <AuthHero />
        </div>

        <div className="auth-kartu" data-visual-screen="auth-card">
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
