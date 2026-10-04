import { expect, type Page } from "@playwright/test";

/** Email unik supaya test bisa diulang tanpa bentrok akun lama. */
export function akunUnik(awalan: string): string {
  return `${awalan}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@contoh.id`;
}

export const SANDI_UJI = "rahasia-uji-123";

/**
 * Daftar akun baru lewat layar. Pendaftaran sekaligus membuat plan pertama,
 * jadi tidak ada langkah "buat plan" terpisah.
 */
export async function daftarAkun(page: Page, email: string) {
  await page.goto("/daftar");
  await page.getByLabel("Nama Kamu").fill("Sarah");
  await page.getByLabel("Nama Pasangan Impian").fill("Dimas");
  await page.getByLabel("Email Bersama / Utama").fill(email);
  await page.getByLabel("Kata Sandi Rahasia").fill(SANDI_UJI);
  // Kotak syarat disembunyikan secara visual (`opacity: 0`, `pointer-events:
  // none`), jadi yang diklik adalah labelnya. Labelnya membungkus input, dan
  // itu memang cara kontrol buatan ini dinyalakan.
  await page.locator("label.auth-syarat").click();
  await expect(page.locator("input.auth-syarat-kotak")).toBeChecked();
  await page.getByRole("button", { name: "Buat Akun Pernikahan Kami" }).click();
  await expect(page).toHaveURL(/\/beranda/);
}

/**
 * Memaksa banner memeriksa ulang sekarang, bukan menunggu jadwal 30 detik.
 * Dipakai supaya test luring tidak ikut menunggu jam.
 */
export async function paksaPeriksaKoneksi(page: Page) {
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
}

/**
 * Jumlah item di object store `antrean`, database `haribesar-luring`,
 * dibaca dari dalam halaman.
 *
 * Nama database dan store ditulis apa adanya di sini dengan sengaja: test ini
 * membuktikan bahwa `simpanKeAntrean` benar-benar menulis ke tempat yang
 * dijanjikan, bukan cuma ke memori. `onupgradeneeded` menyiapkan store yang
 * sama kalau database-nya belum ada, supaya membaca tidak mengubah bentuk
 * database yang sudah dibuat aplikasi.
 */
export async function jumlahAntreanIdb(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((selesai) => {
        const permintaan = indexedDB.open("haribesar-luring", 1);
        permintaan.onerror = () => selesai(-1);
        permintaan.onblocked = () => selesai(-1);
        permintaan.onupgradeneeded = () => {
          const db = permintaan.result;
          if (!db.objectStoreNames.contains("antrean")) {
            const toko = db.createObjectStore("antrean", { keyPath: "id" });
            toko.createIndex("createdAt", "createdAt");
          }
        };
        permintaan.onsuccess = () => {
          const db = permintaan.result;
          if (!db.objectStoreNames.contains("antrean")) {
            db.close();
            selesai(0);
            return;
          }
          const trx = db.transaction("antrean", "readonly");
          const semua = trx.objectStore("antrean").getAll();
          semua.onsuccess = () => {
            const jumlah = semua.result.length;
            db.close();
            selesai(jumlah);
          };
          semua.onerror = () => {
            db.close();
            selesai(-1);
          };
        };
      }),
  );
}
