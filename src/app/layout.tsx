import { type ReactNode } from "react";
import { Fraunces, Public_Sans } from "next/font/google";
import { NAMA_PRODUK, NAMA_PRODUK_PENDEK } from "@/lib/konstanta";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
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
    { media: "(prefers-color-scheme: light)", color: "#FBF9F6" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1917" },
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
    <html lang="id" className={`${fraunces.variable} ${publicSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
