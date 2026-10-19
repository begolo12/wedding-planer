/**
 * Lambang merek.
 *
 * Bentuknya dua bagian sederhana supaya tetap terbaca di ukuran 32px, tempat
 * lambang ini selalu muncul: satu kotak bersudut tumpul berwarna aksen, dan
 * satu pita penanda buku yang dilubangi dari kotak itu.
 *
 * Pita, bukan cincin atau hati. Dua cincin dan hati adalah gambar yang dipakai
 * hampir semua aplikasi pernikahan, jadi tidak membedakan apa pun. Pita
 * penanda buku cocok dengan pekerjaan produk ini: menandai posisi orang di
 * tengah rencana yang panjang supaya tidak ada yang terlewat.
 *
 * Digambar sebagai SVG sebaris, bukan berkas PNG seperti sebelumnya, karena
 * warnanya harus ikut tema. Berkas PNG hanya punya satu warna tetap, jadi di
 * mode gelap lambangnya harus diganti berkas lain. Dengan dua nilai token di
 * bawah, lambang ini benar di kedua tema tanpa berkas tambahan.
 *
 * Berkas PNG lama di `public/merek/` dan skrip pembuatnya sudah dihapus.
 * Ikon PWA di `public/ikon/` tetap dibuat dari bentuk yang sama lewat
 * `scripts/buat-ikon.ps1`, jadi lambang di layar utama dan di dalam aplikasi
 * masih satu gambar.
 */

import { NAMA_PRODUK } from "@/lib/konstanta";

export function Merek({ ukuran = 32 }: { ukuran?: number }) {
  return (
    <span className="merek-lambang" style={{ width: ukuran, height: ukuran }}>
      <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
        <rect width="24" height="24" rx="5.5" fill="currentColor" />
        <path
          d="M9.4 5.2h5.2a.9.9 0 0 1 .9.9v12.7L12 15.8l-3.5 3V6.1a.9.9 0 0 1 .9-.9z"
          style={{ fill: "var(--color-kartu-putih)" }}
        />
      </svg>
    </span>
  );
}

/** Nama produk yang ditulis di samping lambang. Dipisah supaya komponen
 *  lambang tetap murni gambar, sedangkan teks merek gampang diganti. */
export const NAMA_MEREK = NAMA_PRODUK;
