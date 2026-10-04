import { expect, test } from "@playwright/test";
import { SANDI_UJI, akunUnik, daftarAkun } from "./bantu";
import { hapusAkunUji, hitungUser } from "./db-uji";

/**
 * Hapus akun sendiri: fitur paling berbahaya yang baru ditambahkan.
 *
 * Yang dibuktikan tiga: layar mengarahkan ke /masuk, sesi benar-benar mati,
 * dan baris user benar-benar hilang dari database. Data ujinya dihapus sendiri
 * oleh test, baik saat lulus maupun saat gagal di tengah jalan.
 */
test("hapus akun sendiri mematikan sesi dan menghapus baris user", async ({ page }) => {
  const email = akunUnik("e2e-hapus");
  await daftarAkun(page, email);

  try {
    await page.goto("/akun");
    await expect(page.getByRole("heading", { name: "Hapus akun" })).toBeVisible();

    // Tombol pertama membuka lembar konfirmasi; tombol terakhir di dalam
    // lembar itu yang benar-benar menghapus.
    await page.getByRole("button", { name: "Hapus akun" }).first().click();
    await page.locator("#sandiHapusAkun").fill(SANDI_UJI);
    await page.getByRole("button", { name: "Hapus akun" }).last().click();

    await expect(page).toHaveURL(/\/masuk/);

    // Sesi mati: get-session menjawab null (200) atau 401.
    const sesi = await page.request.get("/api/auth/get-session");
    const teks = (await sesi.text()).trim();
    const tanpaSesi = sesi.status() === 401 || teks === "" || teks === "null";
    expect(tanpaSesi, `status ${sesi.status()}, badan ${teks}`).toBe(true);

    // Baris user hilang dari database.
    expect(await hitungUser(email)).toBe(0);
  } finally {
    await hapusAkunUji(email);
  }
});
