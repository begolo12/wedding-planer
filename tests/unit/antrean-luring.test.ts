import { describe, expect, it, beforeEach } from "vitest";
import { pasangPenyimpananAntrean, penyimpananAntreanMemori } from "@/lib/penyimpanan-antrean";
import { buangItemMacet, itemMacet, kirimAntrean, simpanKeAntrean } from "@/lib/luring";

/**
 * Aturan antrean luring yang paling mudah rusak kalau diubah tanpa sengaja.
 *
 * Ketiganya diuji tanpa jaringan sungguhan: `fetch` diganti fungsi yang
 * balasannya ditentukan test, dan penyimpanan antrean dipasang versi memori.
 */

type Panggilan = { url: string; method: string; kunci: string | null };

/** Pasang fetch palsu dengan jawaban per-status, sambil mencatat panggilan. */
function pasangFetch(jawab: (p: Panggilan, ke: number) => number): Panggilan[] {
  const dipanggil: Panggilan[] = [];
  globalThis.fetch = (async (url: string | URL, opsi: RequestInit = {}) => {
    const panggilan: Panggilan = {
      url: String(url),
      method: opsi.method ?? "GET",
      kunci: (opsi.headers as Record<string, string> | undefined)?.["Idempotency-Key"] ?? null,
    };
    dipanggil.push(panggilan);
    const status = jawab(panggilan, dipanggil.length);
    return new Response(status === 204 ? null : JSON.stringify({ ok: status < 400 }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return dipanggil;
}

describe("antrean luring", () => {
  beforeEach(() => {
    pasangPenyimpananAntrean(penyimpananAntreanMemori());
  });

  /**
   * Server menyimpan kunci idempotency, jadi dua kiriman dengan kunci yang
   * sama hanya menghasilkan satu baris. Yang diuji di sini: client benar
   * benar mengirim kuncinya, karena tanpa itu penjagaan di server tidak
   * pernah aktif.
   */
  it("setiap kiriman membawa kunci idempotency berisi id item antrean", async () => {
    await simpanKeAntrean("POST", "/api/plans/x/tasks", JSON.stringify({ title: "a" }));
    const dipanggil = pasangFetch(() => 201);

    await kirimAntrean();

    expect(dipanggil).toHaveLength(1);
    // Kuncinya adalah id item antrean, bukan angka urut atau teks tetap:
    // bentuknya UUID yang dibuat `crypto.randomUUID()` saat item disimpan.
    expect(dipanggil[0].kunci).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  /**
   * Dulu kegagalan 4xx menghentikan seluruh antrean, dan item di belakangnya
   * tidak pernah terkirim. Sekarang item yang ditolak server dilewati, dan
   * perubahan lain tetap jalan.
   */
  it("satu item yang ditolak server tidak menahan item di belakangnya", async () => {
    await simpanKeAntrean("POST", "/api/plans/x/tasks", JSON.stringify({ title: "ditolak" }));
    await simpanKeAntrean("POST", "/api/plans/x/tasks", JSON.stringify({ title: "lolos" }));

    let ke = 0;
    pasangFetch(() => {
      ke += 1;
      return ke === 1 ? 422 : 201;
    });

    const hasil = await kirimAntrean();

    expect(hasil.terkirim).toBe(1);
    expect(hasil.gagal).toBe(1);
    // Yang ditolak masih menunggu, yang lolos sudah terkirim.
    expect(hasil.tersisa).toBe(1);
  });

  /**
   * Setelah menembus batas percobaan, item tidak lagi dikirim otomatis dan
   * muncul di `itemMacet`, supaya pita bisa menawarkan tombol buang. Tanpa
   * ini, item yang isinya salah menahan antrean selamanya tanpa jalan keluar.
   */
  it("item yang selalu ditolak berhenti dicoba dan bisa dibuang", async () => {
    await simpanKeAntrean("POST", "/api/plans/x/tasks", JSON.stringify({ title: "selalu ditolak" }));
    let panggilan = 0;
    pasangFetch(() => {
      panggilan += 1;
      return 422;
    });

    // Lima kali percobaan otomatis, sesuai BATAS_PERCOBAAN.
    for (let i = 0; i < 5; i += 1) await kirimAntrean();

    expect(await itemMacet()).toHaveLength(1);
    const setelahLima = panggilan;

    // Percobaan berikutnya tidak lagi menghubungi server untuk item itu.
    await kirimAntrean();
    expect(panggilan).toBe(setelahLima);

    expect(await buangItemMacet()).toBe(1);
    expect(await itemMacet()).toHaveLength(0);
  });
});
