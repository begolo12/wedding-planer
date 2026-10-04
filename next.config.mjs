import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Satu sumber versi: package.json. Layar akun menampilkannya lewat
// NEXT_PUBLIC_APP_VERSION, jadi tidak ada angka versi kedua yang bisa
// menyimpang.
const { version } = JSON.parse(
  readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  /**
   * Header keamanan untuk semua rute. Lima header ini diputuskan di
   * docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md bagian 8. CSP sengaja
   * tidak ada: CSP yang terlalu ketat bisa merusak service worker dan inline
   * style dari DESIGN.md, dan belum ada kejadian nyata yang perlu diblokir.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Browser tidak menebak tipe berkas sendiri. Tanpa ini, berkas
            // yang isinya teks bisa dijalankan sebagai script.
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Surel dan path lengkap tidak ikut terkirim ke pihak lain.
            // Alamat share yang bocor lewat Referer bisa membuka laporan
            // orang lain, jadi ini juga menjaga tautan baca-saja.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Tidak ada halaman aplikasi yang perlu dibuka di dalam frame.
            // DENY lebih ketat dari SAMEORIGIN dan tidak merusak apa pun.
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Tidak ada fitur yang memakai kamera, mikrofon, atau lokasi.
            // Bukti pembayaran diinput sebagai nama berkas, bukan dari kamera.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Hanya berlaku di HTTPS. Dua tahun, termasuk subdomain, supaya
            // kunjungan berikutnya tidak bisa diturunkan ke HTTP.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Yang memangkas memori dev server. Webpack menahan dua salinan setiap
    // string modul dan cache buffer ganda selama kompilasi. Setelah modul
    // terbaca, salinan itu tidak pernah dipakai lagi tapi tetap tertahan sampai
    // proses selesai. Opsi ini membuang keduanya.
    webpackMemoryOptimizations: true,
    // Opsi ini tidak kena dev server. `next dev` sudah dikunci ke satu worker
    // di dalam Next.js, berapa pun jumlah intinya. Yang memakai `cpus` adalah
    // `next build`, saat halaman statis dan data halaman dikumpulkan dengan
    // beberapa worker sekaligus. Repo ini punya 25 halaman statis, jadi dua
    // worker sudah cukup dan build tidak meledak.
    cpus: 2,
  },
};

export default nextConfig;
