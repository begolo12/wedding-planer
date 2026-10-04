import { expect, test } from "@playwright/test";
import { akunUnik, daftarAkun } from "./bantu";
import { hapusAkunUji } from "./db-uji";

/**
 * Alur utama: daftar, tambah vendor, catat pembayaran, lihat ringkasan.
 *
 * Urutan ini yang paling sering dikeluhkan pengguna, dan cacat generateId
 * dulu mematahkannya di langkah pertama. Test ini menjaga supaya tidak
 * terulang.
 *
 * Database: test ini membuat akun dan data sungguhan, lalu menghapus akunnya
 * sendiri di blok finally. Jalankan dengan TEST_DATABASE_URL kalau ada, supaya
 * tidak menyentuh data pengembangan.
 */
test("daftar sampai ringkasan berjalan tanpa langkah yang diam-diam gagal", async ({ page }) => {
  const email = akunUnik("e2e-utama");
  await daftarAkun(page, email);

  try {
    // Tambah vendor.
    await page.goto("/rencana/vendor");
    await page.getByRole("button", { name: /Tambah vendor/ }).first().click();
    await page.getByLabel("Nama vendor").fill("Dekorasi Melati");
    await page.getByRole("button", { name: "Simpan", exact: true }).click();
    await expect(page.getByText("Dekorasi Melati").first()).toBeVisible();

    // Buka detail vendor, lalu catat satu pembayaran.
    await page.getByRole("link", { name: "Detail & Pembayaran" }).first().click();
    await expect(page).toHaveURL(/\/rencana\/vendor\/[0-9a-f-]{36}$/);

    await page.getByRole("button", { name: "Catat pembayaran" }).first().click();
    await page.getByLabel("Jumlah pembayaran (Rupiah)").fill("5000000");
    await page.getByRole("button", { name: "Simpan pembayaran" }).click();
    await expect(page.getByText("Rp 5.000.000").first()).toBeVisible();

    // Ringkasan di Beranda memakai angka yang sama.
    await page.goto("/beranda");
    await expect(page).toHaveURL(/\/beranda/);
    await expect(page.getByText("Rp 5.000.000").first()).toBeVisible();
  } finally {
    await hapusAkunUji(email);
  }
});
