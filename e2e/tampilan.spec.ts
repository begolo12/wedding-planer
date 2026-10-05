import { test, expect } from "@playwright/test";

test.describe("kontrak visual dasar", () => {
  test("layar masuk mobile tidak melebar dan fokus keyboard terlihat", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/masuk");

    await expect(page.getByRole("heading", { name: "Masuk" })).toBeAttached();
    await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus-visible")).toHaveCount(1);
  });

  test("layar masuk desktop tetap berada di dalam viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/masuk");

    const ukuran = await page.locator("body").evaluate((body) => ({
      lebarIsi: body.scrollWidth,
      lebarViewport: window.innerWidth,
    }));

    expect(ukuran.lebarIsi).toBeLessThanOrEqual(ukuran.lebarViewport);
  });

  test("kontrol tema punya ikon visual dan state kosong punya aksi jelas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/masuk");

    await expect(page.locator("[data-theme-control] .tema-ikon")).toBeVisible();
    await expect(page.locator("[data-theme-control]")).toHaveAttribute("aria-pressed");

    await page.goto("/not-found");
    await expect(page.locator('[data-state="kosong"]')).toBeVisible();
    await expect(page.getByRole("link", { name: "Kembali ke Beranda" })).toBeVisible();
  });

  for (const route of ["/masuk", "/daftar"]) {
    test(`${route} mempertahankan hierarki auth di mobile dan desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);

      await expect(page.locator('[data-visual-screen="auth"]')).toBeVisible();
      await expect(page.locator('[data-visual-screen="auth-card"]')).toBeVisible();
      await expect(page.locator("form.auth-form")).toBeVisible();
      await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
      await expect(page.locator(".auth-tombol-google")).toHaveCSS("border-radius", "16px");

      const tinggiTombol = await page.locator("form.auth-form button[type=submit]").evaluate(
        (button) => button.getBoundingClientRect().height,
      );
      expect(tinggiTombol).toBeGreaterThanOrEqual(44);

      await page.setViewportSize({ width: 1440, height: 900 });
      await page.reload();
      await expect(page.locator('[data-visual-screen="auth"]')).toBeVisible();
      await expect(page.locator(".auth-kontainer")).toHaveCSS(
        "grid-template-columns",
        /.+/,
      );
    });
  }

  test("rencana publik tetap mengarahkan pengguna tanpa sesi", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["/rencana", "/anggaran", "/tamu", "/hari-h"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/masuk/);
      await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
    }
  });

  test("public and offline screens keep their useful action visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/luring");
    await expect(page.getByRole("heading", { name: "Tidak ada internet" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Buka rundown" })).toBeVisible();
    await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);

    await page.goto("/aplikasi");
    await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  });

  test("system and policy screens keep readable mobile surfaces", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["/kebijakan", "/not-found", "/error"]) {
      await page.goto(route);
      await expect(page.locator("main.halaman-baca")).toBeVisible();
      await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
    }
  });

});
