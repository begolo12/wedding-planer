import type { ReactNode } from "react";

/**
 * Judul tab untuk layar daftar.
 *
 * Halaman `page.tsx` di folder ini adalah komponen klien, dan komponen klien
 * tidak boleh mengekspor `metadata`. Tanpa berkas ini, judul tab jatuh ke
 * judul bawaan di layout akar ("Beranda - Hari Besar"), jadi tabnya
 * menyesatkan. Tata letak ini hanya menitipkan judul lalu meneruskan isi
 * apa adanya, tidak mengubah tampilan.
 */
export const metadata = {
  title: "Daftar",
};

export default function LayoutDaftar({ children }: { children: ReactNode }) {
  return children;
}
