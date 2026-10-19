#!/usr/bin/env node
/**
 * Ukur waktu jawab endpoint.
 *
 *   node scripts/kinerja.mjs
 *   node scripts/kinerja.mjs --dasar http://127.0.0.1:3000 --n 200 --konkuren 10
 *
 * Yang diukur hanya dua endpoint publik yang aman dipanggil berulang:
 * `/api/kesehatan` (proses hidup) dan `/api/siap` (proses dan database).
 * Endpoint yang menulis tidak diukur, karena memanggilnya berulang akan
 * mengubah data.
 *
 * Tanpa cookie, karena keduanya tidak butuh sesi. Kalau nanti ada endpoint
 * bersesi yang mau diukur, itu ditambahkan sebagai parameter terpisah supaya
 * rahasia tidak pernah masuk ke argumen baris perintah.
 *
 * Angka yang dicetak: p50, p95, maks, dan jumlah galat. Persentil dipakai
 * karena rata-rata menyembunyikan ekor yang justru terasa oleh pengguna.
 */

const argumen = process.argv.slice(2);
const opsi = { dasar: "https://wedding-planer-self.vercel.app", n: 60, konkuren: 6 };

for (let i = 0; i < argumen.length; i += 2) {
  const kunci = argumen[i].replace(/^--/, "");
  const nilai = argumen[i + 1];
  if (kunci === "dasar") opsi.dasar = nilai.replace(/\/$/, "");
  else if (kunci === "n") opsi.n = Number(nilai);
  else if (kunci === "konkuren") opsi.konkuren = Number(nilai);
  else throw new Error(`opsi tidak dikenal: --${kunci}`);
}

const ENDPOINT = ["/api/kesehatan", "/api/siap"];

async function ukur(jalur) {
  const url = opsi.dasar + jalur;
  const waktu = [];
  const galat = {};
  let berikut = 0;

  async function pekerja() {
    while (berikut < opsi.n) {
      berikut++;
      const mulai = performance.now();
      try {
        const res = await fetch(url, { redirect: "manual" });
        await res.text();
        waktu.push(performance.now() - mulai);
        if (!res.ok) galat[res.status] = (galat[res.status] ?? 0) + 1;
      } catch (err) {
        galat[err.name] = (galat[err.name] ?? 0) + 1;
      }
    }
  }

  await Promise.all(Array.from({ length: opsi.konkuren }, pekerja));

  waktu.sort((a, b) => a - b);
  const persen = (q) => Math.round(waktu[Math.floor(waktu.length * q)] ?? 0);
  const jumlahGalat = Object.values(galat).reduce((a, b) => a + b, 0);

  console.log(
    [
      jalur.padEnd(16),
      `n=${waktu.length}`,
      `p50=${persen(0.5)}ms`,
      `p95=${persen(0.95)}ms`,
      `maks=${Math.round(waktu.at(-1) ?? 0)}ms`,
      `galat=${jumlahGalat}${jumlahGalat ? ` ${JSON.stringify(galat)}` : ""}`,
    ].join("  "),
  );

  return jumlahGalat;
}

console.log(`dasar ${opsi.dasar}  n=${opsi.n}  konkuren=${opsi.konkuren}`);
let gagal = 0;
for (const jalur of ENDPOINT) {
  gagal += await ukur(jalur);
}

// Skrip ini dipakai sebagai pemeriksaan, jadi keluar dengan kode gagal kalau
// ada permintaan yang tidak terjawab. Lambat tidak dianggap gagal, karena
// ambang waktu yang wajar berbeda antara mesin lokal dan produksi.
if (gagal > 0) {
  console.error(`${gagal} permintaan gagal`);
  process.exit(1);
}
