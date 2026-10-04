import { describe, expect, it } from "vitest";
import { bacaDaftarTamu } from "@/lib/impor-tamu";

describe("bacaDaftarTamu", () => {
  it("membaca nama dan jumlah orang", () => {
    const hasil = bacaDaftarTamu("Ahmad, 3\nSiti 2\nRina");
    expect(hasil.map((b) => [b.name, b.guestCount, b.phone])).toEqual([
      ["Ahmad", 3, null],
      ["Siti", 2, null],
      ["Rina", 1, null],
    ]);
  });

  it("membuang baris nomor urut dan header tabel", () => {
    const hasil = bacaDaftarTamu("No\nNama\n1\nAhmad\n2.\nSiti");
    expect(hasil.map((b) => b.name)).toEqual(["Ahmad", "Siti"]);
  });

  it("memisah nomor HP yang menempel di nama dan menormalkannya", () => {
    const hasil = bacaDaftarTamu(
      [
        "Ahmad 081234567890",
        "Siti +62 812 3456 7890",
        "Budi 62-812-3456-7890",
        "Rina 0812-3456-7890, 2",
      ].join("\n"),
    );
    expect(hasil.map((b) => b.name)).toEqual(["Ahmad", "Siti", "Budi", "Rina"]);
    expect(hasil.map((b) => b.phone)).toEqual([
      "6281234567890",
      "6281234567890",
      "6281234567890",
      "6281234567890",
    ]);
    expect(hasil[0]?.catatan).toMatch(/Nomor HP/);
    expect(hasil[3]?.guestCount).toBe(2);
  });

  it("baris yang isinya cuma nomor bukan tamu", () => {
    expect(bacaDaftarTamu("081234567890")).toEqual([]);
  });

  it("menandai nama yang sudah ada tanpa membuatnya lagi", () => {
    const hasil = bacaDaftarTamu("Ahmad, 2\nAhmad, 3", ["Ahmad"]);
    expect(hasil[0]?.kembar).toBe(true);
    expect(hasil[1]?.kembar).toBe(true);
  });
});
