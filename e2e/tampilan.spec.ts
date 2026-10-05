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
});
