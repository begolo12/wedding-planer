import { expect, test } from "@playwright/test";
import { akunUnik, daftarAkun } from "./bantu";
import { hapusAkunUji } from "./db-uji";

/**
 * Kontrak POST /api/plans/{id}/report/share-text.
 *
 * Yang dijaga: nama field mengikuti docs/04 (`variant`), nama lama `jenis`
 * ditolak, dan jawaban sukses memuat semua field yang dipakai layar Laporan.
 * Dipanggil lewat request context supaya yang diuji kontraknya, bukan
 * tampilannya.
 */
test("share-text memakai variant dan menolak nama lama", async ({ page }) => {
  const email = akunUnik("e2e-share");
  await daftarAkun(page, email);

  try {
    const daftar = await page.request.get("/api/plans");
    expect(daftar.status()).toBe(200);
    const { plans } = (await daftar.json()) as { plans: { id: string }[] };
    expect(plans.length).toBeGreaterThan(0);
    const url = `/api/plans/${plans[0]!.id}/report/share-text`;

    const sukses = await page.request.post(url, { data: { variant: "ringkas" } });
    expect(sukses.status()).toBe(200);
    const isi = (await sukses.json()) as {
      text: string;
      length: number;
      limit: number;
      truncated: boolean;
      lines: number;
      variant: string;
      waUrl: string;
    };
    expect(typeof isi.text).toBe("string");
    expect(isi.text.length).toBeGreaterThan(0);
    expect(typeof isi.length).toBe("number");
    expect(isi.length).toBe(isi.text.length);
    expect(isi.limit).toBe(800);
    expect(typeof isi.truncated).toBe("boolean");
    expect(typeof isi.lines).toBe("number");
    expect(isi.variant).toBe("ringkas");
    expect(isi.waUrl.startsWith("https://wa.me/?text=")).toBe(true);

    const lama = await page.request.post(url, { data: { jenis: "ringkas" } });
    expect(lama.status()).toBe(422);
    expect(((await lama.json()) as { error: { code: string } }).error.code).toBe("VALIDATION_ERROR");

    const salah = await page.request.post(url, { data: { variant: "salah" } });
    expect(salah.status()).toBe(422);
    expect(((await salah.json()) as { error: { code: string } }).error.code).toBe("VALIDATION_ERROR");
  } finally {
    await hapusAkunUji(email);
  }
});
