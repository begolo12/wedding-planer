/**
 * Membuat ikon PWA dari kode, tanpa pustaka gambar.
 *
 * Ikon tidak dibuat di editor gambar karena hasilnya tidak bisa ditinjau di
 * riwayat perubahan. Berkas biner hanya bisa dilihat, tidak bisa dibaca
 * bedanya. Dengan skrip ini, kalau warnanya berubah, perubahannya terbaca
 * sebagai satu baris di `git diff`.
 *
 * Jalankan dengan: node scripts/buat-ikon.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const AKAR = join(dirname(fileURLToPath(import.meta.url)), "..");
const KELUARAN = join(AKAR, "public", "ikon");

const TERAKOTA = [0xb5, 0x64, 0x3c];
const KRIM = [0xfb, 0xf9, 0xf6];

/** Ukuran gambar dibuat dua kali lalu diperkecil, supaya tepinya tidak bergerigi. */
const LEWAT = 2;

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function potongan(tipe, data) {
  const panjang = Buffer.alloc(4);
  panjang.writeUInt32BE(data.length);
  const isi = Buffer.concat([Buffer.from(tipe, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(isi));
  return Buffer.concat([panjang, isi, crc]);
}

function tulisPng(ukuran, piksel) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ukuran, 0);
  ihdr.writeUInt32BE(ukuran, 4);
  ihdr[8] = 8; // 8 bit per kanal
  ihdr[9] = 6; // RGBA
  const baris = Buffer.alloc(ukuran * (ukuran * 4 + 1));
  for (let y = 0; y < ukuran; y++) {
    const mulai = y * (ukuran * 4 + 1);
    baris[mulai] = 0; // tanpa filter
    for (let x = 0; x < ukuran; x++) {
      const s = (y * ukuran + x) * 4;
      const t = mulai + 1 + x * 4;
      baris[t] = piksel[s];
      baris[t + 1] = piksel[s + 1];
      baris[t + 2] = piksel[s + 2];
      baris[t + 3] = piksel[s + 3];
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    potongan("IHDR", ihdr),
    potongan("IDAT", deflateSync(baris, { level: 9 })),
    potongan("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Dua cincin yang saling bertaut, satu-satunya lambang yang tidak perlu
 * dijelaskan untuk aplikasi pernikahan.
 */
function warnaPiksel(x, y, ukuran, melingkar) {
  const jari = melingkar ? ukuran * 0.19 : 0;
  if (melingkar && sudutLuar(x, y, ukuran, jari)) return [0, 0, 0, 0];

  const skala = ukuran / 512;
  const cincin = [
    [196 * skala, 236 * skala],
    [316 * skala, 236 * skala],
  ];
  const jariCincin = 106 * skala;
  const tebal = 21 * skala;

  for (const [cx, cy] of cincin) {
    const d = Math.hypot(x - cx, y - cy);
    if (Math.abs(d - jariCincin) <= tebal / 2) {
      return [...KRIM, 255];
    }
  }
  return [...TERAKOTA, 255];
}

function sudutLuar(x, y, ukuran, jari) {
  const px = Math.min(x, ukuran - x - 1);
  const py = Math.min(y, ukuran - y - 1);
  if (px >= jari || py >= jari) return false;
  return Math.hypot(jari - px, jari - py) > jari;
}

function gambar(ukuran, melingkar) {
  const besar = ukuran * LEWAT;
  const lapis = Buffer.alloc(besar * besar * 4);
  for (let y = 0; y < besar; y++) {
    for (let x = 0; x < besar; x++) {
      const w = warnaPiksel(x, y, besar, melingkar);
      const i = (y * besar + x) * 4;
      lapis[i] = w[0];
      lapis[i + 1] = w[1];
      lapis[i + 2] = w[2];
      lapis[i + 3] = w[3];
    }
  }

  const hasil = Buffer.alloc(ukuran * ukuran * 4);
  for (let y = 0; y < ukuran; y++) {
    for (let x = 0; x < ukuran; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < LEWAT; dy++) {
        for (let dx = 0; dx < LEWAT; dx++) {
          const i = ((y * LEWAT + dy) * besar + (x * LEWAT + dx)) * 4;
          r += lapis[i];
          g += lapis[i + 1];
          b += lapis[i + 2];
          a += lapis[i + 3];
        }
      }
      const n = LEWAT * LEWAT;
      const j = (y * ukuran + x) * 4;
      hasil[j] = Math.round(r / n);
      hasil[j + 1] = Math.round(g / n);
      hasil[j + 2] = Math.round(b / n);
      hasil[j + 3] = Math.round(a / n);
    }
  }
  return tulisPng(ukuran, hasil);
}

mkdirSync(KELUARAN, { recursive: true });

const daftar = [
  ["ikon-192.png", gambar(192, true)],
  ["ikon-512.png", gambar(512, true)],
  ["ikon-maskable-512.png", gambar(512, false)],
  ["apple-touch-icon.png", gambar(180, false)],
];

for (const [nama, isi] of daftar) {
  writeFileSync(join(KELUARAN, nama), isi);
  console.log(`${nama} ${isi.length} bita`);
}
