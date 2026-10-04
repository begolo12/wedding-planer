import { describe, expect, it } from "vitest";
import {
  kelompokkan,
  namaPlaceholder,
  namaPlan,
  planIdDari,
  tanggalHariBesar,
  teksHitungMundur,
} from "@/lib/plan";
import { NAMA_PRODUK } from "@/lib/konstanta";
import { bacaTanggal, hariIni } from "@/lib/format";

function geserHari(n: number): string {
  const dasar = bacaTanggal(hariIni());
  if (!dasar) throw new Error("hariIni() tidak terbaca");
  dasar.setUTCDate(dasar.getUTCDate() + n);
  return dasar.toISOString().slice(0, 10);
}

/** true kalau "hari ini" di Asia/Jakarta jatuh pada hari Minggu. */
function hariIniMinggu(): boolean {
  const dasar = bacaTanggal(hariIni());
  return dasar ? dasar.getUTCDay() === 0 : false;
}

describe("namaPlan", () => {
  it("hanya memakai nama depan supaya kepala navigasi tidak panjang", () => {
    expect(namaPlan("Aisyah Putri", "Bagas Pratama")).toBe("Aisyah & Bagas");
  });

  it("spasi berlebih dirapikan", () => {
    expect(namaPlan("  Sarah  ", "  Dimas  ")).toBe("Sarah & Dimas");
  });

  it("nama satu kata tetap utuh", () => {
    expect(namaPlan("Rani", "Budi")).toBe("Rani & Budi");
  });
});

describe("namaPlaceholder", () => {
  it("memakai nama produk, bukan nama pasangan contoh", () => {
    expect(namaPlaceholder()).toBe(NAMA_PRODUK);
  });
});

describe("tanggalHariBesar", () => {
  it("mendahulukan hari-H yang sudah ditandai", () => {
    expect(
      tanggalHariBesar({ isDayOfDate: "2026-06-30", weddingDate: "2026-07-01" }),
    ).toBe("2026-06-30");
  });

  it("kalau hari-H belum ada, memakai tanggal pernikahan", () => {
    expect(tanggalHariBesar({ isDayOfDate: null, weddingDate: "2026-07-01" })).toBe("2026-07-01");
  });

  it("kalau dua-duanya kosong, tidak menebak", () => {
    expect(tanggalHariBesar({ isDayOfDate: null, weddingDate: null })).toBeNull();
  });
});

describe("teksHitungMundur", () => {
  it("kosong kalau tidak ada tanggal", () => {
    expect(teksHitungMundur(null)).toBeNull();
  });

  it("mengikuti hitung mundur", () => {
    expect(teksHitungMundur(geserHari(1))).toBe("besok");
  });
});

describe("kelompokkan", () => {
  it("tugas selesai selalu di kelompok selesai, walau ada tanggal", () => {
    expect(kelompokkan("2026-06-30", "selesai")).toBe("selesai");
  });

  it("tanpa tanggal masuk belum ada tenggat", () => {
    expect(kelompokkan(null, "belum")).toBe("tanpaTenggat");
  });

  it("tanggal lewat masuk lewat, hari ini masuk hari ini", () => {
    expect(kelompokkan(geserHari(-1), "belum")).toBe("lewat");
    expect(kelompokkan(geserHari(0), "belum")).toBe("hariIni");
  });

  it("jauh di depan masuk setelah minggu ini, bukan belum ada tenggat", () => {
    expect(kelompokkan(geserHari(60), "belum")).toBe("setelahMingguIni");
  });

  it("kelompok belum ada tenggat hanya untuk tugas tanpa tanggal", () => {
    // Label "Belum ada tenggat" tidak boleh lagi dipakai untuk tugas yang
    // punya tanggal, karena barisnya akan menampilkan tanggal di bawah judul
    // yang berbunyi tidak ada tenggat.
    expect(kelompokkan(null, "belum")).toBe("tanpaTenggat");
    expect(kelompokkan(geserHari(60), "belum")).not.toBe("tanpaTenggat");
    expect(kelompokkan(geserHari(0), "selesai")).not.toBe("tanpaTenggat");
  });

  it("masih di minggu ini masuk minggu ini, kecuali hari ini hari Minggu", () => {
    if (hariIniMinggu()) return;
    expect(kelompokkan(geserHari(1), "belum")).toBe("mingguIni");
  });
});

describe("planIdDari", () => {
  it("mengambil id plan dari query dan menolak yang bukan uuid", () => {
    const uuid = "22bd97ff-87a3-4f76-9ab5-882ce199d265";
    expect(planIdDari(new URL(`http://contoh.id/?plan=${uuid}`))).toBe(uuid);
    expect(planIdDari(new URL("http://contoh.id/?plan=bukan-uuid"))).toBeNull();
    expect(planIdDari(new URL("http://contoh.id/"))).toBeNull();
  });
});
