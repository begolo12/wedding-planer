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
