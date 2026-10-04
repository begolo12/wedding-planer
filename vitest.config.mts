import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Konfigurasi Vitest.
 *
 * Alasan memakai Vitest: unit test murni untuk hitungan uang dan tanggal tidak
 * butuh browser, dan test integrasi kepemilikan plan cukup memanggil fungsi
 * yang sudah ada. Vitest dan Playwright sudah disebut docs/06-Stack-dan-Batas.md
 * bagian 3 sebagai "cukup", jadi tidak ada pustaka baru yang perlu ditimbang.
 *
 * Alias `@` disamakan dengan tsconfig supaya impor di test sama persis dengan
 * impor di aplikasi. `process.cwd()` dipakai karena vitest selalu dijalankan
 * dari akar repo lewat `npm test`.
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    testTimeout: 20_000,
  },
});
