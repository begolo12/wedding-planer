import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/siap/route";

/**
 * Titik kesiapan harus membuktikan database benar-benar terbaca.
 *
 * Yang diuji di sini adalah bentuk balasannya, bukan koneksinya: koneksi
 * diuji oleh pemantau di luar. Kalau database di mesin uji tidak ada, test
 * ini akan gagal, dan itu memang benar, karena artinya lingkungan uji tidak
 * siap.
 */
describe("titik kesiapan", () => {
  it("menjawab siap dengan waktu dan tanpa cache", async () => {
    const res = await GET();
    const isi = await res.json();

    expect(res.status).toBe(200);
    expect(isi.siap).toBe(true);
    expect(typeof isi.waktu).toBe("string");
    expect(Number.isNaN(Date.parse(isi.waktu))).toBe(false);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("tidak membocorkan rincian database di balasannya", async () => {
    const res = await GET();
    const isi = await res.json();

    expect(Object.keys(isi).sort()).toEqual(["siap", "waktu"]);
    expect(JSON.stringify(isi)).not.toMatch(/postgres|password|host/i);
  });
});
