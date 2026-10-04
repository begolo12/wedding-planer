"use client";

import { usePathname } from "next/navigation";
import { Merek } from "@/components/merek";
import { NAMA_PRODUK } from "@/lib/konstanta";

/**
 * Kepala layar auth: badge, lambang, dan sapaan.
 *
 * Layar "Masuk" dan "Daftar" di proyek Stitch punya kepala yang berbeda, jadi
 * komponen ini memilih versinya dari alamat halaman yang sedang dibuka, bukan
 * dari satu teks bersama. Isi tiap versi diambil apa adanya dari layar Stitch
 * yang bersangkutan, hanya nama produk dari `NAMA_PRODUK` yang tetap sama.
 *
 * Ikon hiasan (bunga kecil di sudut lambang, percikan di badge) dibuat sendiri
 * sebagai SVG sebaris, bukan mengambil font ikon. Alasannya supaya tidak ada
 * permintaan jaringan tambahan hanya untuk hiasan, dan supaya warna ikonnya
 * ikut token warna yang sudah ada.
 */

const JALUR_HATI =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

export function AuthHero() {
  const pathname = usePathname();
  const halamanDaftar = pathname?.startsWith("/daftar") ?? false;

  if (halamanDaftar) {
    return (
      <div className="auth-hero">
        <span className="auth-lambang-bungkus">
          <span className="auth-lambang-glow" aria-hidden="true" />
          <span className="auth-emblem auth-emblem-daftar">
            <Merek ukuran={64} />
            <span className="auth-emblem-lencana auth-emblem-lencana-cinta" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d={JALUR_HATI} />
              </svg>
            </span>
          </span>
        </span>

        <span className="auth-badge auth-badge-langkah">
          <svg
            className="auth-badge-ikon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
          </svg>
          Langkah Pertama Menuju Selamanya
        </span>

        <h2 className="auth-sapaan auth-sapaan-besar">Mulai Kisah Bahagiamu</h2>
        <p className="auth-sapaan-sub">
          Daftarkan rencanamu dan wujudkan pernikahan impian berdua.
        </p>

        <div className="auth-pita">
          <span className="auth-pita-ikon" aria-hidden="true">
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
              <path d="M4 21h16" />
              <path d="M6 21V9l6-4 6 4v12" />
              <path d="M10 21v-5h4v5" />
            </svg>
          </span>
          <span className="auth-pita-teks">
            <span className="auth-pita-judul">100% Gratis &amp; Bebas Stres</span>
            <span className="auth-pita-sub">
              Merencanakan hari bahagia kalian bersama {NAMA_PRODUK}.
            </span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-hero">
      <span className="auth-badge auth-badge-cinta">
        <svg
          className="auth-badge-ikon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={JALUR_HATI} />
        </svg>
        Perjalanan Cinta Menuju Pelaminan
        <svg
          className="auth-badge-ikon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </span>

      <span className="auth-lambang-bungkus">
        <span className="auth-lambang-glow" aria-hidden="true" />
        <span className="auth-emblem">
          <Merek ukuran={64} />
          <span className="auth-emblem-lencana auth-emblem-lencana-bunga" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="6.6" r="3" />
              <circle cx="12" cy="17.4" r="3" />
              <circle cx="6.6" cy="12" r="3" />
              <circle cx="17.4" cy="12" r="3" />
            </svg>
          </span>
        </span>
      </span>

      <h2 className="auth-sapaan">
        Selamat Datang Kembali,{" "}
        <span className="auth-sapaan-aksen">Lovebirds!</span>
      </h2>
      <p className="auth-sapaan-sub">
        Lanjutkan persiapan hari bahagiamu bersama pasangan tercinta
      </p>
    </div>
  );
}
