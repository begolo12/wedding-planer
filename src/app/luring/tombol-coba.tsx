"use client";

/**
 * Tombol muat ulang untuk halaman luring.
 *
 * Dipisah jadi Client Component supaya halaman luring sendiri tetap Server
 * Component dan tetap tampil walau JavaScript belum jalan. Ini tombol
 * "Coba lagi" dari wireframe 12a bagian 6, dan dia benar-benar memuat ulang
 * halaman, bukan berpindah ke layar lain.
 */
export function TombolCoba() {
  return (
    <button
      type="button"
      className="tombol tombol-utama"
      onClick={() => window.location.reload()}
    >
      Coba lagi
    </button>
  );
}
