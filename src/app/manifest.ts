import type { MetadataRoute } from "next";
import { NAMA_PRODUK, NAMA_PRODUK_PENDEK } from "@/lib/konstanta";

/**
 * Manifest PWA.
 *
 * `background_color` dan `theme_color` harus sama persis dengan `--color-base`
 * di globals.css. Kalau beda, memasang aplikasi ke layar utama akan
 * menampilkan kedipan warna lain sebelum halaman termuat.
 *
 * Nama diambil dari `NAMA_PRODUK` supaya tidak ada dua tempat yang menulis
 * nama produk. Nama plan yang sebenarnya diisi setelah orang mendaftar,
 * jadi nama produk tidak diambil dari data plan.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: NAMA_PRODUK,
    short_name: NAMA_PRODUK_PENDEK,
    description: "Catatan rencana pernikahan: tugas, anggaran, tamu, dan rundown hari-H.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf9f6",
    theme_color: "#fbf9f6",
    orientation: "portrait-primary",
    lang: "id-ID",
    dir: "ltr",
    categories: ["lifestyle", "productivity"],
    icons: [
      { src: "/ikon/ikon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/ikon/ikon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/ikon/ikon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Rundown hari-H", url: "/hari-h" },
      { name: "Daftar tugas", url: "/rencana" },
      { name: "Daftar tamu", url: "/tamu" },
    ],
  };
}
