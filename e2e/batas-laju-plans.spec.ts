import { expect, test } from "@playwright/test";
import { SANDI_UJI, akunUnik } from "./bantu";
import { hapusAkunUji } from "./db-uji";

/**
 * Batas laju POST /api/plans: 30 permintaan per jam per pengguna.
 *
 * Satu file sendiri, dengan akun sendiri, karena batasnya per pengguna. Kalau
 * spec ini berbagi akun dengan spec lain di file yang sama, kuota 30 per jam
 * itu bisa membuat spec berikutnya ikut kena 429 tanpa sebab yang jelas.
 *
 * Akun didaftarkan lewat API, bukan lewat layar /daftar, supaya pendaftaran
 * tidak ikut memakai satu jatah (layar /daftar membuat plan pertama lewat
 * POST /api/plans). Badan tiap permintaan kosong, jadi tidak ada plan yang
 * benar-benar dibuat.
 */
test("batas laju POST /api/plans: 30 kali 422 lalu ke-31 429", async ({ page, baseURL }) => {
  const email = akunUnik("e2e-batas");
  try {
    // Buka satu halaman dulu supaya konteks punya asal yang sama.
    await page.goto("/masuk");

    const daftar = await page.request.post("/api/auth/sign-up/email", {
      headers: { origin: baseURL ?? "http://localhost:3110" },
      data: { email, password: SANDI_UJI, name: "Uji Batas" },
    });
    expect(daftar.status(), await daftar.text()).toBe(200);

    const status: number[] = [];
    let terakhir = { status: 0, body: "", retry: "" };

    for (let i = 0; i < 31; i++) {
      const res = await page.request.post("/api/plans", { data: {} });
      status.push(res.status());
      if (i === 30) {
        terakhir = {
          status: res.status(),
          body: await res.text(),
          retry: res.headers()["x-retry-after"] ?? "",
        };
      }
    }

    expect(status.slice(0, 30)).toEqual(Array(30).fill(422));
    expect(status[30]).toBe(429);
    expect((JSON.parse(terakhir.body) as { error: { code: string } }).error.code).toBe(
      "RATE_LIMITED",
    );
    expect(terakhir.retry).not.toBe("");

    // Badan kosong ditolak, jadi tidak ada plan yang terbuat.
    const sesudah = await page.request.get("/api/plans");
    expect(((await sesudah.json()) as { plans: unknown[] }).plans.length).toBe(0);
  } finally {
    await hapusAkunUji(email);
  }
});
