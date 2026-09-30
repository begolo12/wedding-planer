// Satu kali jalan untuk mencari kelas dan token yang dipakai di komponen
// tapi tidak ada di globals.css. Kelas yang tidak ada berarti bentuknya
// hilang tanpa error, jadi harus ketahuan.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const AKAR = "src";
const css = readFileSync(join(AKAR, "app", "globals.css"), "utf8");

function semuaBerkas(dir) {
  const keluar = [];
  for (const nama of readdirSync(dir)) {
    const p = join(dir, nama);
    if (statSync(p).isDirectory()) keluar.push(...semuaBerkas(p));
    else if (/\.tsx?$/.test(nama)) keluar.push(p);
  }
  return keluar;
}

const kelasCss = new Set();
for (const m of css.matchAll(/\.([a-zA-Z][\w-]*)/g)) kelasCss.add(m[1]);

const kelasPakai = new Map();
const tokenPakai = new Map();

for (const berkas of semuaBerkas(AKAR)) {
  const isi = readFileSync(berkas, "utf8");

  for (const m of isi.matchAll(/className=\{?["`]([^"`]+)["`]/g)) {
    for (const k of m[1].split(/\s+/)) {
      if (!k || k.includes("{") || k.includes("}")) continue;
      if (!kelasPakai.has(k)) kelasPakai.set(k, berkas);
    }
  }
  for (const m of isi.matchAll(/var\((--[\w-]+)\)/g)) {
    if (!tokenPakai.has(m[1])) tokenPakai.set(m[1], berkas);
  }
}

const tokenCss = new Set();
for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) tokenCss.add(m[1]);

const kelasHilang = [...kelasPakai].filter(([k]) => !kelasCss.has(k));
const tokenHilang = [...tokenPakai].filter(([t]) => !tokenCss.has(t));

console.log("KELAS DIPAKAI TAPI TIDAK ADA DI CSS (" + kelasHilang.length + ")");
for (const [k, f] of kelasHilang) console.log("  ." + k + "  <- " + f);

console.log("");
console.log("TOKEN DIPAKAI TAPI TIDAK ADA DI CSS (" + tokenHilang.length + ")");
for (const [t, f] of tokenHilang) console.log("  " + t + "  <- " + f);
