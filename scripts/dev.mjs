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
 * kode native, buffer, dan source map yang Next.js paksa nyala untuk dev
 * server, jadi angka di Task Manager bisa di atas 1 GB. Yang dijamin 1 GB
 * adalah heap-nya.
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
 * Angka 1024 hasil pengukuran, bukan tebakan. Metodenya memukul sepuluh route
 * inti sebanyak tiga kali tiap route, lalu menyentuh `globals.css` tiga kali
 * untuk memaksa kompilasi ulang. Skenario yang menentukan bukan request HTTP
 * saja, tapi browser sungguhan yang membuka halaman dalam sambil login, karena
 * itu yang menyisakan modul dan cache paling banyak.
 *
 * | Batas heap | Hasil                                                      |
 * | ---------- | ---------------------------------------------------------- |
 * | 512 MB     | mati `heap out of memory` di kompilasi `/luring`           |
 * | 576 MB     | selamat putaran pertama, mati di putaran kedua             |
 * | 640 MB     | lolos uji request, tapi mati saat browser membuka halaman dalam |
 * | 1024 MB    | aman                                                       |
 *
 * 640 MB sempat terlihat cukup karena uji pertamanya hanya memanggil endpoint
 * dari luar browser. Begitu halaman dalam benar-benar dibuka di browser yang
 * sudah login, modul yang dimuat lebih banyak dan heap menyentuh 634 MB lalu
 * mati dengan `Ineffective mark-compacts`. Batas 1 GB dipilih supaya pemakaian
 * nyata tidak menyentuh batas itu.
 *
 * Kalau proses tetap terasa berat, tutupkan dev server dulu. Angka itu
 * menumpuk selama satu sesi dan tidak turun sendiri.
 */
const MB_DEFAULT = 1024;

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
