#!/usr/bin/env node
/**
 * Cadangan dan pemulihan database.
 *
 * Dua hal yang dikerjakan skrip ini, dan keduanya tidak boleh dicampur:
 *
 *   node scripts/cadangan.mjs             menulis satu berkas dump
 *   node scripts/cadangan.mjs --pulihkan <berkas> <database-tujuan>
 *
 * Alasan tidak memakai layanan cadangan bawaan penyedia: penyedia database
 * belum dipastikan, dan `docs/18` bagian 18 mencatat bahwa dump harian belum
 * terbukti berjalan. Skrip ini bisa dijalankan di mana saja `pg_dump` ada,
 * jadi tidak menambah vendor dan tidak mengunci keputusan ke satu penyedia.
 *
 * Formatnya custom (`-Fc`), bukan SQL teks, karena `pg_restore` bisa memilih
 * tabel tertentu dan memulihkan dalam satu transaksi.
 *
 * Keterbatasan yang harus ditulis jujur: skrip ini tidak menjadwalkan dirinya
 * sendiri, dan tidak mengunggah hasilnya ke mana pun. Penjadwalan dan tempat
 * penyimpanan di luar mesin ini adalah keputusan terpisah.
 */

import "dotenv/config";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const FOLDER = "cadangan";
const SIMPAN = 7;

/** `pg_dump` tidak selalu ada di PATH di Windows, jadi dicari di lokasi bawaan. */
function cariAlat(nama) {
  if (process.env.PG_BIN) {
    const jalur = join(process.env.PG_BIN, `${nama}.exe`);
    if (existsSync(jalur)) return jalur;
    throw new Error(`PG_BIN diisi, tapi ${jalur} tidak ada.`);
  }

  try {
    execFileSync(nama, ["--version"], { stdio: "ignore" });
    return nama;
  } catch {
    // Lanjut ke pencarian di lokasi bawaan Windows.
  }

  for (const versi of ["17", "16", "15"]) {
    const jalur = `C:\\Program Files\\PostgreSQL\\${versi}\\bin\\${nama}.exe`;
    if (existsSync(jalur)) return jalur;
  }

  throw new Error(
    `${nama} tidak ditemukan. Pasang klien PostgreSQL, atau isi PG_BIN dengan folder bin-nya.`,
  );
}

function urlDatabase() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi. Salin .env.example jadi .env.");
  }
  return url;
}

function capWaktu() {
  const d = new Date();
  const dua = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${dua(d.getMonth() + 1)}${dua(d.getDate())}-${dua(d.getHours())}${dua(d.getMinutes())}`;
}

/** Berkas dump diurutkan dari yang paling baru. */
function daftarDump() {
  if (!existsSync(FOLDER)) return [];
  return readdirSync(FOLDER)
    .filter((n) => n.endsWith(".dump"))
    .map((n) => ({ nama: n, waktu: statSync(join(FOLDER, n)).mtimeMs }))
    .sort((a, b) => b.waktu - a.waktu);
}

function buatCadangan() {
  mkdirSync(FOLDER, { recursive: true });
  const nama = `rapi-nikah-${capWaktu()}.dump`;
  const tujuan = join(FOLDER, nama);

  execFileSync(cariAlat("pg_dump"), [
    "--format=custom",
    "--no-owner",
    "--no-privileges",
    "--file",
    tujuan,
    urlDatabase(),
  ]);

  const ukuran = statSync(tujuan).size;
  console.log(`cadangan ditulis: ${tujuan} (${ukuran} byte)`);

  const semua = daftarDump();
  for (const lama of semua.slice(SIMPAN)) {
    unlinkSync(join(FOLDER, lama.nama));
    console.log(`cadangan lama dihapus: ${lama.nama}`);
  }
  console.log(`tersimpan ${Math.min(semua.length, SIMPAN)} berkas, sisanya dihapus`);
}

function pulihkan(berkas, databaseTujuan) {
  if (!existsSync(berkas)) throw new Error(`berkas cadangan tidak ada: ${berkas}`);
  if (!databaseTujuan) {
    throw new Error("Sebutkan database tujuan. Pemulihan tidak pernah menimpa database sumber.");
  }

  const sumber = new URL(urlDatabase());
  if (sumber.pathname.slice(1) === databaseTujuan) {
    throw new Error(
      "Database tujuan sama dengan database sumber. Pemulihan harus ke database lain, supaya berkas cadangan tidak menimpa data yang sedang dipakai.",
    );
  }

  const tujuan = new URL(sumber.toString());
  tujuan.pathname = `/${databaseTujuan}`;

  execFileSync(cariAlat("pg_restore"), [
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-privileges",
    "--dbname",
    tujuan.toString(),
    berkas,
  ]);

  console.log(`dipulihkan: ${berkas} -> ${databaseTujuan}`);
}

const argumen = process.argv.slice(2);

if (argumen[0] === "--pulihkan") {
  pulihkan(argumen[1], argumen[2]);
} else if (argumen[0] === "--daftar") {
  const semua = daftarDump();
  if (semua.length === 0) console.log("belum ada berkas cadangan");
  for (const d of semua) {
    console.log(`${d.nama}  ${(statSync(join(FOLDER, d.nama)).size / 1024).toFixed(1)} KB`);
  }
} else {
  buatCadangan();
}
