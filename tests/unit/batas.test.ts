import { describe, expect, it } from "vitest";
import { batasi } from "@/lib/batas";
import { GalatAplikasi } from "@/lib/galat";

/**
 * Batas laju in-memory. Kuncinya dibikin unik per test supaya map di
 * globalThis tidak bisa membuat test saling mempengaruhi.
 */
describe("batasi", () => {
  it("mengizinkan sampai batas, lalu melempar RATE_LIMITED dengan sisa waktu", () => {
    const kunci = `uji-${Date.now()}-${Math.random()}`;

    for (let i = 0; i < 3; i++) batasi(kunci, 3, 60);

    try {
      batasi(kunci, 3, 60);
      throw new Error("seharusnya melempar");
    } catch (err) {
      expect(err).toBeInstanceOf(GalatAplikasi);
      const galat = err as GalatAplikasi;
      expect(galat.kode).toBe("RATE_LIMITED");
      expect(galat.retryAfter).toBeGreaterThan(0);
      expect(galat.retryAfter).toBeLessThanOrEqual(60);
    }
  });
});
