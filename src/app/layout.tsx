import { type ReactNode } from "react";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import { NAMA_PRODUK, NAMA_PRODUK_PENDEK } from "@/lib/konstanta";
import "./globals.css";
/*
 * Aturan cetak dipisah ke berkas sendiri supaya tidak menambah bobot yang
 * diunduh di setiap layar. Berkas ini hanya berisi blok `@media print`, jadi
 * tidak ada aturan yang berefek sampai printer benar-benar diminta.
 *
 * Awalnya berkas ini sudah ada tapi tidak diimpor di mana pun, sehingga
 * navigasi, pita luring, dan pemenggalan halaman tetap ikut tercetak.
 */
import "./cetak.css";

/*
 * Dua keluarga huruf, satu untuk judul dan satu untuk isi, sesuai DESIGN.md.
 * Plus Jakarta Sans memegang judul dan label, Be Vietnam Pro memegang isi.
 * Nama variabelnya tetap `--font-judul` dan `--font-teks` supaya globals.css
 * tidak perlu tahu keluarga hurufnya apa.
 */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

/**
 * Nama produk dibaca dari satu konstanta supaya tidak ada dua tempat yang
 * menulis nama yang sama. Nama plan sebenarnya tidak dipakai di sini,
 * karena metadata harus bisa dirender tanpa tahu orang sudah masuk atau belum.
 */
export const metadata = {
  title: {
    default: `Beranda - ${NAMA_PRODUK}`,
    template: `%s - ${NAMA_PRODUK}`,
  },
  description: "Perencanaan pernikahan yang tetap berguna saat sinyal hilang.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: NAMA_PRODUK_PENDEK,
    statusBarStyle: "default" as const,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1317" },
  ],
};

/**
 * Tema dibaca sebelum React jalan supaya tidak ada kilatan warna putih
 * saat halaman dimuat dalam mode gelap.
 *
 * Tanpa pilihan tersimpan, tidak ada atribut yang dipasang: CSS
 * `prefers-color-scheme` yang menentukan, itu arti "Mengikuti Sistem".
 *
 * Kunci lama `aisyah-theme` masih dibaca sekali lalu dihapus. Kalau tidak,
 * orang yang sudah pernah memilih tema gelap akan balik ke terang begitu
 * versi baru dipasang. Memindahkan pilihan orang tidak boleh jadi alasan
 * dia harus mengatur ulang sendiri.
 */
const skripTema = `(function(){try{var b=localStorage,l="haribesar-tema",t=b.getItem(l);if(t!=="gelap"&&t!=="terang"){var o=b.getItem("aisyah-theme");if(o==="gelap"||o==="terang"){b.setItem(l,o);b.removeItem("aisyah-theme");t=o;}}if(t==="gelap"||t==="terang"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: skrip tema memasang data-theme sebelum React
    // jalan, jadi atribut di DOM tidak sama dengan hasil render server.
    // Peringatan itu memang diharapkan di sini, bukan cacat.
    <html
      lang="id"
      className={`${plusJakarta.variable} ${beVietnam.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
