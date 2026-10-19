"use client";

import { usePathname } from "next/navigation";

/**
 * Kepala layar auth: satu sapaan dan satu kalimat penjelas.
 *
 * Versi sebelumnya punya badge, bulatan lambang, lencana di sudutnya, dan pita
 * keunggulan. Semuanya hiasan: lambangnya sudah ada di chip merek di atas
 * kepala, dan pita "100% Gratis" itu janji yang tidak diukur di mana pun.
 * Layar masuk sekarang hanya berisi kata sambutan, form, dan satu catatan
 * keamanan di kaki, jadi tidak ada yang perlu dilewati sebelum mengisi form.
 *
 * Rata kiri, bukan rata tengah, karena form di bawahnya rata kiri. Dua sumbu
 * perataan di satu layar membuat mata harus menyesuaikan lagi di tengah alur.
 */

export function AuthHero() {
  const pathname = usePathname();
  const halamanDaftar = pathname?.startsWith("/daftar") ?? false;

  if (halamanDaftar) {
    return (
      <div className="auth-hero">
        <h2 className="auth-sapaan">Mulai rencanakan hari bahagiamu</h2>
        <p className="auth-sapaan-sub">
          Satu akun untuk berdua. Isi daftar tamu, anggaran, dan rundown dari HP.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-hero">
      <h2 className="auth-sapaan">Selamat datang kembali</h2>
      <p className="auth-sapaan-sub">
        Lanjutkan rencana yang sudah kamu susun bersama pasangan.
      </p>
    </div>
  );
}
