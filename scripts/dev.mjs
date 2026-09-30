/**
 * Menjalankan dev server dengan batas memori 1 GB.
 *
 * Batasnya tidak bisa ditulis di `package.json` sebagai
 * `NODE_OPTIONS=--max-old-space-size=1024 next dev`. Sintaks itu hanya jalan di
 * shell POSIX, tidak jalan di cmd.exe maupun PowerShell, dan repo ini dipakai di
 * dua-duanya. Skrip ini menulis variabelnya lewat Node lalu menjalankan
 * `next dev` sebagai proses anak. `NODE_OPTIONS` diwarisi ke semua cucu,
 * termasuk proses kompilasi yang diturunkan Next.js, dan Next.js hanya
 * membuang flag `--inspect` dari warisan itu sebelum meneruskannya ke worker.
 *
 * Yang dibatasi adalah heap V8, bukan seluruh memori proses. Di luar heap ada
 * kode native, buffer, dan ruang yang dipin Node sendiri, jadi angka yang
 * muncul di Task Manager bisa sedikit di atas batas.
 *
 * Batas 1 GB cukup untuk repo ini karena Next.js sudah menjalankan dev server
 * dengan satu worker saja, bukan satu worker per inti. Yang boros justru
 * kompilasi webpack, dan itu dikecilkan lewat `webpackMemoryOptimizations` di
 * `next.config.mjs`.
 *
 * Batas bisa diganti tanpa mengedit berkas ini:
 * `BATCH_DEV_MB=2048 npm run dev`
 *
 * Jalankan dengan: node scripts/dev.mjs
 */

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AKAR = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Batas heap default dalam megabita. Bisa ditimpa lewat BATCH_DEV_MB.
 *
 * Angka 640 bukan tebakan. Diuji di mesin ini dengan memukul sepuluh route inti
 * sebanyak tiga kali tiap route, lalu menyentuh `globals.css` tiga kali untuk
 * memaksa kompilasi ulang:
 *
 * | Batas heap | Hasil                                                    |
 * | ---------- | -------------------------------------------------------- |
 * | 512 MB     | mati `heap out of memory` di kompilasi `/luring`           |
 * | 576 MB     | selamat putaran pertama, mati `heap out of memory` di putaran kedua |
 * | 640 MB     | dua putaran penuh selesai, tidak ada `out of memory`       |
 * | 1024 MB    | aman, tapi working set server 1261 MB                     |
 *
 * Yang diukur adalah flag heap-nya, bukan working set. Working set di Task
 * Manager selalu lebih besar karena kode native, buffer, dan source map hidup
 * di luar heap. Pada 640 MB, total rantai spawn (launcher, cli Next.js, dan
 * server) ada di 1033 MB setelah putaran pertama dan 1194 MB setelah putaran
 * kedua.
 *
 * Kalau 640 MB terasa sempit, naikkan lewat BATCH_DEV_MB. Kalau tetap 640 dan
 * proses masih terasa berat, tutupkan dev server dulu, karena angka itu menumpuk
 * selama sesi dan tidak turun sendiri.
 */
const MB_DEFAULT = 640;

const mb = Number(process.env.BATCH_DEV_MB) > 0 ? Number(process.env.BATCH_DEV_MB) : MB_DEFAULT;

/** Flag inspect dibuang Next.js sebelum meneruskan NODE_OPTIONS ke worker. */
const nodeOptions = [process.env.NODE_OPTIONS, `--max-old-space-size=${mb}`]
  .filter(Boolean)
  .join(" ");

const children = spawn(process.execPath, [join(AKAR, "node_modules", "next", "dist", "bin", "next"), "dev", ...process.argv.slice(2)], {
  cwd: AKAR,
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
  shell: false,
});

children.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
