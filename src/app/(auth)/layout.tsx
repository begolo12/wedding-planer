import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Kerangka layar masuk dan daftar.
 * Dilengkapi navigasi atas minimalis untuk kembali dan beralih tema (terang/gelap),
 * serta kartu terpusat yang ramah sentuhan mobile.
 */
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <main className="bungkus layar-auth" id="konten">
      <a className="lompat" href="#konten">
        Lompat ke isi
      </a>
      <div className="auth-kontainer">
        <header className="auth-navigasi-atas">
          <Link href="/" className="auth-tautan-balik">
            <span aria-hidden="true">←</span> Beranda
          </Link>
          <div className="auth-alat">
            <ThemeToggle />
          </div>
        </header>

        <div className="auth-kartu">
          <div className="auth-kepala">
            <Link href="/" className="auth-logo" aria-label="Beranda Hari Besar">
              <span className="auth-emblem" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <circle cx="9" cy="12" r="5" stroke="var(--color-sage)" />
                  <circle cx="15" cy="12" r="5" stroke="var(--color-terracotta)" />
                  <path d="M12 9v6" stroke="var(--color-marigold)" strokeLinecap="round" />
                </svg>
              </span>
              <span className="auth-merek-teks">
                <span className="auth-merek-judul">Hari Besar</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
