#!/usr/bin/env node
/**
 * Gerbang dependensi.
 *
 * `npm audit --audit-level=high` saja tidak bisa dipakai karena satu temuan
 * tinggi berasal dari `postcss` yang dibawa `next`, dan menaikkan `next` ke
 * versi mayor 16 adalah keputusan terpisah yang belum diambil. Tanpa daftar
 * pengecualian, gerbangnya akan merah terus dan orang akan berhenti
 * membacanya.
 *
 * Aturannya: temuan tinggi dan kritis menggagalkan pemeriksaan, kecuali yang
 * tercantum di DAFTAR_DIKETAHUI dengan alasan yang bisa diperiksa. Temuan baru
 * tetap merah.
 *
 * Jalankan dengan: node scripts/periksa-dependensi.mjs
 */

import { execFileSync, execSync } from "node:child_process";

/**
 * Temuan yang sudah diperiksa dan diterima. Kuncinya nama paket, nilainya
 * alasan penerimaan. Jangan menambah baris tanpa alasan yang bisa diuji.
 */
const DAFTAR_DIKETAHUI = {
  postcss:
    "XSS lewat </style> pada stringify CSS. Aplikasi ini hanya mengolah CSS yang ditulis sendiri di repo, tidak pernah CSS dari pengguna, jadi jalur serangannya tidak ada. Menunggu next menaikkan versi postcss.",
};

function jalankanAudit() {
  // Di Linux dan macOS `npm` bisa dipanggil langsung. Di Windows `npm` adalah
  // berkas .cmd, dan Node 24 menolak menjalankannya tanpa shell. Perintahnya
  // tetap, tidak ada masukan pengguna, jadi `execSync` aman di sini.
  const windows = process.platform === "win32";
  try {
    return windows
      ? execSync("npm audit --json", { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
      : execFileSync("npm", ["audit", "--json"], {
          encoding: "utf8",
          maxBuffer: 32 * 1024 * 1024,
        });
  } catch (err) {
    // npm audit keluar dengan kode 1 kalau ada temuan. Keluarannya tetap JSON.
    if (err.stdout) return err.stdout;
    throw err;
  }
}

const laporan = JSON.parse(jalankanAudit());
const temuan = laporan.vulnerabilities ?? {};

const gagal = [];
const diterima = [];

for (const [nama, info] of Object.entries(temuan)) {
  const tingkat = info.severity;
  if (tingkat !== "high" && tingkat !== "critical") continue;
  if (DAFTAR_DIKETAHUI[nama]) {
    diterima.push(`${nama} (${tingkat})`);
    continue;
  }
  gagal.push(`${nama} (${tingkat})`);
}

for (const baris of diterima) {
  console.log(`diterima: ${baris} - ${DAFTAR_DIKETAHUI[baris.split(" ")[0]]}`);
}

if (gagal.length > 0) {
  console.error(`gagal: ${gagal.length} temuan tinggi atau kritis tanpa alasan`);
  for (const baris of gagal) console.error(`  ${baris}`);
  process.exit(1);
}

console.log(`lulus: tidak ada temuan tinggi atau kritis di luar daftar yang diketahui`);
