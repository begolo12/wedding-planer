import { type ReactNode } from "react";
import { Fraunces, Public_Sans } from "next/font/google";
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

export const metadata = {
  title: {
    default: "Beranda - Aisyah & Bagas",
    template: "%s - Aisyah & Bagas",
  },
  description: "Perencanaan pernikahan yang tetap berguna saat sinyal hilang.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Aisyah",
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
 */
const skripTema = `(function(){try{var t=localStorage.getItem("aisyah-theme");if(t==="gelap"||t==="terang"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

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
