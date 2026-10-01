// Tinjau PNG: baca header, histogram warna, kotak isi, dan ASCII kasar.
// Dipakai supaya logo Stitch bisa dianalisis tanpa membuka penampil gambar
// (penampil gambar pada berkas raster besar menghabiskan kuota konteks).
//
// Pakai: node scripts/tinjau-png.mjs <berkas.png> [lebar-ascii]

import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const berkas = process.argv[2];
if (!berkas) {
  console.error("Pakai: node scripts/tinjau-png.mjs <berkas.png> [lebar-ascii]");
  process.exit(1);
}
const lebarAscii = Number(process.argv[3] ?? 56);

const buf = readFileSync(berkas);

// Kumpulkan chunk.
let pos = 8;
let ihdr = null;
const idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const tipe = buf.subarray(pos + 4, pos + 8).toString("latin1");
  const data = buf.subarray(pos + 8, pos + 8 + len);
  if (tipe === "IHDR") {
    ihdr = {
      w: data.readUInt32BE(0),
      h: data.readUInt32BE(4),
      depth: data[8],
      color: data[9],
      interlace: data[12],
    };
  }
  if (tipe === "IDAT") idat.push(data);
  pos += 12 + len;
  if (tipe === "IEND") break;
}

if (!ihdr) throw new Error("IHDR tidak ada");
if (ihdr.depth !== 8 || ihdr.interlace !== 0 || (ihdr.color !== 2 && ihdr.color !== 6)) {
  throw new Error(
    `Format belum didukung: depth=${ihdr.depth} color=${ihdr.color} interlace=${ihdr.interlace}`
  );
}

const salur = ihdr.color === 2 ? 3 : 4;
const { w, h } = ihdr;
const mentah = inflateSync(Buffer.concat(idat));
const langkah = w * salur;

// Buang filter tiap baris (tipe 0..4).
const piksel = Buffer.alloc(w * h * salur);
for (let y = 0; y < h; y++) {
  const tipeFilter = mentah[y * (langkah + 1)];
  const baris = mentah.subarray(y * (langkah + 1) + 1, y * (langkah + 1) + 1 + langkah);
  const keluar = piksel.subarray(y * langkah, (y + 1) * langkah);
  const sebelum = y > 0 ? piksel.subarray((y - 1) * langkah, y * langkah) : null;
  for (let i = 0; i < langkah; i++) {
    const a = i >= salur ? keluar[i - salur] : 0;
    const b = sebelum ? sebelum[i] : 0;
    const c = sebelum && i >= salur ? sebelum[i - salur] : 0;
    let v = baris[i];
    if (tipeFilter === 1) v += a;
    else if (tipeFilter === 2) v += b;
    else if (tipeFilter === 3) v += (a + b) >> 1;
    else if (tipeFilter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
    keluar[i] = v & 0xff;
  }
}

const ambil = (x, y) => {
  const o = (y * w + x) * salur;
  return [piksel[o], piksel[o + 1], piksel[o + 2], salur === 4 ? piksel[o + 3] : 255];
};
const hex = (r, g, b) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

// Warna pojok = dugaan latar.
const pojok = [
  ambil(0, 0),
  ambil(w - 1, 0),
  ambil(0, h - 1),
  ambil(w - 1, h - 1),
];
const rata = pojok
  .reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0])
  .map((v) => Math.round(v / 4));
console.log(`${berkas}`);
console.log(
  `ukuran ${w}x${h} color=${ihdr.color} latar-dugaan ${hex(...rata)} ${rata.join(",")}`
);

// Histogram warna kuantisasi 16 langkah.
const hist = new Map();
for (let y = 0; y < h; y += 2) {
  for (let x = 0; x < w; x += 2) {
    const p = ambil(x, y);
    const k = `${p[0] >> 4},${p[1] >> 4},${p[2] >> 4}`;
    const e = hist.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += p[0];
    e.g += p[1];
    e.b += p[2];
    hist.set(k, e);
  }
}
const total = [...hist.values()].reduce((s, e) => s + e.n, 0);
const teratas = [...hist.values()].sort((a, b) => b.n - a.n).slice(0, 12);
console.log("12 warna terbanyak:");
for (const e of teratas) {
  console.log(
    `  ${((e.n / total) * 100).toFixed(2).padStart(6)}%  ${hex(
      Math.round(e.r / e.n),
      Math.round(e.g / e.n),
      Math.round(e.b / e.n)
    )}`
  );
}

// Selisih terhadap latar.
const selisih = (p) =>
  Math.max(Math.abs(p[0] - rata[0]), Math.abs(p[1] - rata[1]), Math.abs(p[2] - rata[2]));

// Kotak isi.
let kiri = w;
let kanan = -1;
let atas = h;
let bawah = -1;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const p = ambil(x, y);
    if (p[3] > 24 && selisih(p) >= 40) {
      if (x < kiri) kiri = x;
      if (x > kanan) kanan = x;
      if (y < atas) atas = y;
      if (y > bawah) bawah = y;
    }
  }
}
console.log(`kotak isi x=${kiri}..${kanan} (${kanan - kiri + 1}) y=${atas}..${bawah} (${bawah - atas + 1})`);

// ASCII kasar pada kotak isi.
const langkahX = Math.max(1, Math.ceil((kanan - kiri + 1) / lebarAscii));
const tinggiAscii = Math.max(
  1,
  Math.round(((bawah - atas + 1) / langkahX) * 0.5)
);
const langkahY = Math.max(1, Math.ceil((bawah - atas + 1) / tinggiAscii));
const tangga = " .:-=+*#%@";
console.log("ASCII (kotak isi):");
for (let y = atas; y <= bawah; y += langkahY) {
  let baris = "";
  for (let x = kiri; x <= kanan; x += langkahX) {
    let maks = 0;
    let n = 0;
    for (let dy = 0; dy < langkahY && y + dy <= bawah; dy++) {
      for (let dx = 0; dx < langkahX && x + dx <= kanan; dx++) {
        const p = ambil(x + dx, y + dy);
        if (p[3] <= 24) continue;
        maks = Math.max(maks, selisih(p));
        n++;
      }
    }
    if (!n) {
      baris += " ";
      continue;
    }
    const i = Math.min(tangga.length - 1, Math.round((maks / 255) * (tangga.length - 1)));
    baris += tangga[i];
  }
  console.log("|" + baris + "|");
}
