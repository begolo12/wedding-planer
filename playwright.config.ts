import { defineConfig, devices } from "@playwright/test";

/**
 * Konfigurasi Playwright.
 *
 * Alasan memakai Playwright: alur daftar sampai catat pembayaran, dan alur
 * luring, hanya bisa dibuktikan di browser sungguhan. Keduanya disebut
 * docs/06-Stack-dan-Batas.md bagian 3 sebagai "cukup".
 *
 * Port 3100 dipakai supaya tidak berebut dengan dev server pengembangan di
 * port 3000. `webServer` di bawah baru dijalankan kalau `npm run test:e2e`
 * dipanggil; kalau di port itu sudah ada server yang jalan, yang itu dipakai
 * ulang (reuseExistingServer).
 *
 * Catatan menjalankan di mesin ini: jangan panggil `npm run test:e2e` saat
 * dev server pengembangan masih memegang folder `.next`, karena dua proses
 * yang menulis `.next` bersamaan saling merusak hasil kompilasi.
 *
 * Database: alur ini membuat akun dan data sungguhan. Pakai
 * `TEST_DATABASE_URL` kalau ada supaya tidak menyentuh data pengembangan.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `node scripts/dev.mjs -p ${PORT}`,
    url: `http://localhost:${PORT}/api/kesehatan`,
    reuseExistingServer: true,
    timeout: 180_000,
    // Better Auth menolak POST dari Origin yang tidak dikenal dengan 403
    // INVALID_ORIGIN. Port uji tidak ada di daftar bawaan src/lib/auth.ts,
    // jadi ditambahkan lewat kait BETTER_AUTH_TRUSTED_ORIGINS yang memang
    // sudah disediakan untuk itu.
    env: {
      BETTER_AUTH_TRUSTED_ORIGINS: `http://localhost:${PORT},http://127.0.0.1:${PORT}`,
    },
  },
});
