import { beforeEach, describe, expect, it } from "vitest";
import {
  ambilBaca,
  bolehDicache,
  kunciBaca,
  pasangPenyimpananBaca,
  penyimpananBacaMemori,
  planIdDariUrl,
  potongIsi,
  simpanBaca,
} from "@/lib/cache-baca";

const UUID = "22bd97ff-87a3-4f76-9ab5-882ce199d265";

/** Daftar 60 item generik, untuk menguji pemotongan. */
function daftar60(): { id: string }[] {
  return Array.from({ length: 60 }, (_, i) => ({ id: `item-${i}` }));
}

describe("cache baca: aturan URL", () => {
  it("hanya data plan yang boleh dicache", () => {
    expect(bolehDicache("/api/plans")).toBe(true);
    expect(bolehDicache(`/api/plans/${UUID}/tasks`)).toBe(true);
    expect(bolehDicache("/api/kesehatan")).toBe(false);
    expect(bolehDicache("/api/auth/session")).toBe(false);
  });

  it("mengambil planId dari jalur, bukan dari endpoint lain", () => {
    expect(planIdDariUrl(`/api/plans/${UUID}/rundown`)).toBe(UUID);
    expect(planIdDariUrl(`/api/plans/${UUID}`)).toBe(UUID);
    expect(planIdDariUrl("/api/plans")).toBeNull();
    expect(planIdDariUrl("/api/kesehatan")).toBeNull();
  });

  it("kunci cache membuang origin tetapi menyimpan query", () => {
    expect(kunciBaca(`https://contoh.id/api/plans/${UUID}/tasks?status=belum`)).toBe(
      `/api/plans/${UUID}/tasks?status=belum`,
    );
  });
});

describe("cache baca: batas isi sesuai docs/07", () => {
  it("tugas dipotong ke 50 pertama", () => {
    const hasil = potongIsi(`/api/plans/${UUID}/tasks`, { tasks: daftar60() }) as {
      tasks: { id: string }[];
    };
    expect(hasil.tasks).toHaveLength(50);
    expect(hasil.tasks[0]?.id).toBe("item-0");
    expect(hasil.tasks[49]?.id).toBe("item-49");
  });

  it("tamu dipotong ke 50 pertama, rekapnya tetap utuh", () => {
    const hasil = potongIsi(`/api/plans/${UUID}/guests`, {
      guests: daftar60(),
      summary: { orang: 120 },
    }) as { guests: { id: string }[]; summary: { orang: number } };
    expect(hasil.guests).toHaveLength(50);
    expect(hasil.summary.orang).toBe(120);
  });

  it("rundown tidak dipotong, karena paling dibutuhkan saat luring", () => {
    const hasil = potongIsi(`/api/plans/${UUID}/rundown`, { rundown: daftar60() }) as {
      rundown: { id: string }[];
    };
    expect(hasil.rundown).toHaveLength(60);
  });

  it("anggaran tidak dipotong, karena jumlahnya kecil", () => {
    const hasil = potongIsi(`/api/plans/${UUID}/budget-items`, { items: daftar60() }) as {
      items: { id: string }[];
    };
    expect(hasil.items).toHaveLength(60);
  });
});

describe("cache baca: simpan dan ambil", () => {
  beforeEach(() => {
    pasangPenyimpananBaca(penyimpananBacaMemori());
  });

  it("menyimpan dan mengambil kembali response GET", async () => {
    const url = `https://contoh.id/api/plans/${UUID}/overview`;
    await simpanBaca(url, { uang: { paid: 4_500_000 } });
    expect(await ambilBaca(url)).toEqual({ uang: { paid: 4_500_000 } });
  });

  it("menerapkan batas saat menyimpan, bukan saat mengambil", async () => {
    const url = `/api/plans/${UUID}/tasks`;
    await simpanBaca(url, { tasks: daftar60() });
    const tersimpan = (await ambilBaca(url)) as { tasks: unknown[] };
    expect(tersimpan.tasks).toHaveLength(50);
  });

  it("endpoint yang tidak layak cache tidak disimpan dan tidak dibaca", async () => {
    await simpanBaca("/api/kesehatan", { ok: true });
    expect(await ambilBaca("/api/kesehatan")).toBeNull();
  });

  it("url yang belum pernah dibuka mengembalikan null", async () => {
    expect(await ambilBaca(`/api/plans/${UUID}/rundown`)).toBeNull();
  });
});
