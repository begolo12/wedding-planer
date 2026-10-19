import { describe, expect, it, vi, afterEach } from "vitest";
import { NextResponse } from "next/server";
import { balasGalat, bungkus, tidakDitemukan } from "@/lib/galat";

/**
 * Galat tak terduga harus bisa dicocokkan dengan satu baris log.
 *
 * Yang diuji: bentuk balasan, header rujukan, dan isi baris log. Isi log
 * sengaja JSON satu baris supaya bisa disaring di dashboard platform tanpa
 * alat tambahan.
 */
describe("galat tak terduga", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("memberi rujukan pendek yang sama di badan, header, dan log", async () => {
    const catat = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = balasGalat(new Error("koneksi database putus"), {
      metode: "POST",
      jalur: "/api/plans",
      mulai: performance.now() - 12,
    });
    const isi = await res.json();

    expect(res.status).toBe(500);
    expect(isi.error.code).toBe("INTERNAL_ERROR");
    expect(isi.error.ref).toMatch(/^[0-9a-f]{8}$/);
    expect(res.headers.get("X-Galat-Ref")).toBe(isi.error.ref);

    expect(catat).toHaveBeenCalledTimes(1);
    const baris = JSON.parse(String(catat.mock.calls[0]![0]));
    expect(baris.ref).toBe(isi.error.ref);
    expect(baris.level).toBe("error");
    expect(baris.status).toBe(500);
    expect(baris.metode).toBe("POST");
    expect(baris.jalur).toBe("/api/plans");
    expect(baris.pesan).toBe("koneksi database putus");
    expect(typeof baris.durasiMs).toBe("number");
  });

  it("tidak menulis log atau rujukan untuk galat yang sudah dikenal", async () => {
    const catat = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = balasGalat(tidakDitemukan("Tugas"), {
      metode: "GET",
      jalur: "/api/plans/x/tasks/y",
      mulai: performance.now(),
    });
    const isi = await res.json();

    expect(res.status).toBe(404);
    expect(isi.error.ref).toBeUndefined();
    expect(res.headers.get("X-Galat-Ref")).toBeNull();
    expect(catat).not.toHaveBeenCalled();
  });

  it("bungkus meneruskan metode dan jalur dari permintaan", async () => {
    const catat = vi.spyOn(console, "error").mockImplementation(() => {});

    const handler = bungkus(async (_req: Request) => {
      throw new Error("meledak");
    });

    const req = new Request("https://contoh.test/api/plans/abc/tasks?x=1", { method: "PATCH" });
    const res = await handler(req);

    expect(res.status).toBe(500);
    const baris = JSON.parse(String(catat.mock.calls[0]![0]));
    expect(baris.metode).toBe("PATCH");
    expect(baris.jalur).toBe("/api/plans/abc/tasks");
  });

  it("bungkus tidak mengubah jawaban yang berhasil", async () => {
    const handler = bungkus(async (_req: Request) => NextResponse.json({ ok: true }));
    const res = await handler(new Request("https://contoh.test/api/kesehatan"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
