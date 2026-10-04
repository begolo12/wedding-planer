import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GalatJaringan, minta } from "@/lib/api-client";
import { pasangPenyimpananBaca, penyimpananBacaMemori } from "@/lib/cache-baca";
import { daftarAntrean, jumlahAntrean } from "@/lib/luring";
import {
  pasangPenyimpananAntrean,
  penyimpananAntreanMemori,
} from "@/lib/penyimpanan-antrean";
import {
  bersihkanAntreanPenuh,
  catatHasilKirim,
  catatLuring,
  catatSumberData,
  statusLuring,
} from "@/lib/status-luring";

const UUID = "22bd97ff-87a3-4f76-9ab5-882ce199d265";
const URL_OVERVIEW = `/api/plans/${UUID}/overview`;

function jawaban(isi: unknown, status = 200): Response {
  return new Response(JSON.stringify(isi), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function gagalJaringan(): never {
  throw new TypeError("gagal jaringan");
}

describe("api-client saat luring", () => {
  beforeEach(() => {
    pasangPenyimpananBaca(penyimpananBacaMemori());
    pasangPenyimpananAntrean(penyimpananAntreanMemori());
    catatHasilKirim({ gagal: 0, perluMasuk: false, pesanGagal: null });
    catatLuring(false);
    catatSumberData(false);
    bersihkanAntreanPenuh();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GET yang gagal karena jaringan memakai cadangan perangkat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jawaban({ uang: { paid: 1_000 } })),
    );
    const pertama = await minta<{ uang: { paid: number } }>(URL_OVERVIEW);
    expect(pertama.uang.paid).toBe(1_000);
    expect(statusLuring().dariPerangkat).toBe(false);

    vi.stubGlobal("fetch", vi.fn(gagalJaringan));
    const kedua = await minta<{ uang: { paid: number } }>(URL_OVERVIEW);
    expect(kedua).toEqual({ uang: { paid: 1_000 } });
    expect(statusLuring().dariPerangkat).toBe(true);
  });

  it("GET yang dijawab 503 LURING oleh service worker juga memakai cadangan", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jawaban({ rundown: [{ id: "r1" }] })),
    );
    await minta(`/api/plans/${UUID}/rundown`);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jawaban({ error: { code: "LURING", message: "Tidak ada koneksi." } }, 503)),
    );
    const hasil = await minta<{ rundown: { id: string }[] }>(`/api/plans/${UUID}/rundown`);
    expect(hasil.rundown).toEqual([{ id: "r1" }]);
    expect(statusLuring().dariPerangkat).toBe(true);
  });

  it("GET tanpa cadangan tetap melempar GalatJaringan", async () => {
    vi.stubGlobal("fetch", vi.fn(gagalJaringan));
    await expect(minta(URL_OVERVIEW)).rejects.toBeInstanceOf(GalatJaringan);
  });

  it("satu GET yang berhasil saat luring tidak mematikan penanda dari perangkat", async () => {
    // Cache dulu saat daring.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jawaban({ uang: { paid: 500 } })),
    );
    await minta(URL_OVERVIEW);
    expect(statusLuring().dariPerangkat).toBe(false);

    // Luring: GET gagal, dilayani cadangan.
    catatLuring(true);
    vi.stubGlobal("fetch", vi.fn(gagalJaringan));
    await minta(URL_OVERVIEW);
    expect(statusLuring().dariPerangkat).toBe(true);

    // Ada GET yang berhasil, tetapi penjaga koneksi masih bilang luring.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jawaban({ uang: { paid: 500 } })),
    );
    await minta(URL_OVERVIEW);
    expect(statusLuring().dariPerangkat).toBe(true);

    // Penjaga koneksi bilang daring, baru penanda dimatikan.
    catatLuring(false);
    await minta(URL_OVERVIEW);
    expect(statusLuring().dariPerangkat).toBe(false);
  });

  it("tulis yang gagal tanpa respons masuk antrean dengan urutan yang benar", async () => {
    vi.stubGlobal("fetch", vi.fn(gagalJaringan));
    const jalur = `/api/plans/${UUID}/tasks`;
    const judul = ["satu", "dua", "tiga"];

    for (const t of judul) {
      await expect(minta(jalur, { method: "POST", body: { title: t } })).rejects.toMatchObject({
        kode: "LURING",
      });
    }

    expect(await jumlahAntrean()).toBe(3);
    const antrean = await daftarAntrean();
    expect(antrean.map((a) => a.method)).toEqual(["POST", "POST", "POST"]);
    expect(antrean.map((a) => JSON.parse(a.body ?? "{}").title)).toEqual(judul);
  });

  it("tulis yang dijawab 503 LURING juga masuk antrean, tanpa dobel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jawaban({ error: { code: "LURING", message: "Tidak ada koneksi." } }, 503)),
    );
    const jalur = `/api/plans/${UUID}/tasks`;
    await expect(minta(jalur, { method: "POST", body: { title: "satu" } })).rejects.toMatchObject({
      kode: "LURING",
    });
    await expect(minta(jalur, { method: "DELETE" })).rejects.toMatchObject({ kode: "LURING" });

    expect(await jumlahAntrean()).toBe(2);
    const antrean = await daftarAntrean();
    expect(antrean.map((a) => a.method)).toEqual(["POST", "DELETE"]);
  });
});
