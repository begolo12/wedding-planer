import { expect, test } from "@playwright/test";
import { akunUnik, daftarAkun, jumlahAntreanIdb, paksaPeriksaKoneksi } from "./bantu";
import { hapusAkunUji } from "./db-uji";

/**
 * Alur luring, dua sisi sekaligus.
 *
 * Sisi pertama: perubahan saat luring harus benar-benar masuk object store
 * `antrean` di database `haribesar-luring`, bukan cuma tinggal di memori.
 * Sisi kedua: setelah daring, antrean habis terkirim dan urutan permintaan
 * ke server persis urutan orang menekannya.
 *
 * Kenapa lewat service worker tidak disyaratkan lagi: kegagalan fetch tanpa
 * respons pun sudah diantrekan (src/lib/api-client.ts), jadi jalur luring
 * tetap jalan walau service worker belum mengontrol halaman.
 *
 * Urutan permintaan dicatat MULAI setelah tiga klik luring, supaya percobaan
 * yang gagal saat luring tidak ikut terhitung.
 */
test("tiga perubahan luring masuk antrean di perangkat lalu terkirim dengan urutan benar", async ({
  page,
  context,
}) => {
  const email = akunUnik("e2e-luring");
  await daftarAkun(page, email);

  try {
    await page.goto("/rencana");

    // Tiga tugas dibuat saat daring, id-nya dicatat dalam urutan pembuatan.
    const idTugas: string[] = [];
    const judulTugas = ["Tugas luring satu", "Tugas luring dua", "Tugas luring tiga"];

    for (const judul of judulTugas) {
      const tungguJawaban = page.waitForResponse(
        (res) =>
          res.request().method() === "POST" &&
          /\/api\/plans\/[0-9a-f-]{36}\/tasks$/.test(new URL(res.url()).pathname),
      );
      await page.getByRole("button", { name: "Tambah tugas" }).first().click();
      await page.getByLabel("Judul tugas").fill(judul);
      await page.getByRole("button", { name: "Simpan", exact: true }).click();

      const jawaban = await tungguJawaban;
      const isi = (await jawaban.json()) as { task: { id: string } };
      idTugas.push(isi.task.id);
      await expect(page.getByText(judul).first()).toBeVisible();
    }
    expect(idTugas).toHaveLength(3);

    // Luring: perubahan pertama harus terbukti masuk IndexedDB.
    await context.setOffline(true);
    await page.getByRole("checkbox", { name: `Tandai selesai ${judulTugas[0]}` }).click();
    await expect
      .poll(() => jumlahAntreanIdb(page), { timeout: 15_000 })
      .toBe(1);

    // Dua perubahan berikutnya menambah antrean sampai tiga.
    for (const judul of judulTugas.slice(1)) {
      await page.getByRole("checkbox", { name: `Tandai selesai ${judul}` }).click();
    }
    await expect
      .poll(() => jumlahAntreanIdb(page), { timeout: 15_000 })
      .toBe(3);

    // Mulai dari sini, catat urutan permintaan yang benar-benar keluar ke server.
    const urutanToggle: string[] = [];
    page.on("request", (req) => {
      if (req.method() !== "POST") return;
      const cocok = /\/api\/plans\/[0-9a-f-]{36}\/tasks\/([0-9a-f-]{36})\/toggle$/.exec(
        new URL(req.url()).pathname,
      );
      if (cocok) urutanToggle.push(cocok[1]);
    });

    // Daring: paksa banner memeriksa sekarang, lalu tunggu antrean habis.
    await context.setOffline(false);
    await paksaPeriksaKoneksi(page);

    await expect.poll(() => urutanToggle.length, { timeout: 60_000 }).toBe(3);
    expect(urutanToggle).toEqual(idTugas);
    await expect
      .poll(() => jumlahAntreanIdb(page), { timeout: 30_000 })
      .toBe(0);
  } finally {
    await hapusAkunUji(email);
  }
});
