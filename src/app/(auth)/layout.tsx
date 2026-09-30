import type { ReactNode } from "react";
import Link from "next/link";
import { namaPlaceholder } from "@/lib/plan";

/**
 * Kerangka layar masuk dan daftar. Tanpa navigasi, karena orang yang belum
 * masuk tidak punya tempat lain untuk pergi. Semua jalan keluar ada di
 * dalam kartu.
 */
export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <main className="bungkus layar-auth" id="konten">
      <a className="lompat" href="#konten">
        Lompat ke isi
      </a>
      <div className="auth-kartu">
        <Link href="/" className="auth-merek">
          <span className="label-bagian">Rencana pernikahan</span>
          <span className="auth-nama">{namaPlaceholder()}</span>
        </Link>
        {children}
      </div>
    </main>
  );
}
