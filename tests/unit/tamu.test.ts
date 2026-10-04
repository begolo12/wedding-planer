import { describe, expect, it } from "vitest";
import { ringkasTamu, sisiDikenal, type TamuRingkasMasuk } from "@/lib/tamu";

/**
 * Satu fungsi rekap tamu yang dipakai endpoint /guests, ringkasan Beranda, dan
 * Laporan. Test ini mengunci aturan yang paling mudah salah: siapa yang
 * dihitung untuk porsi katering dan kursi.
 */

function tamu(isi: Partial<TamuRingkasMasuk>): TamuRingkasMasuk {
  return {
    category: "lainnya",
    side: null,
    rsvpStatus: "belum",
    guestCount: 1,
    tableName: null,
    invitedAt: null,
    ...isi,
  };
}

describe("ringkasTamu", () => {
  it("porsi dan kursi menghitung hadir ditambah yang belum konfirmasi, bukan yang menolak", () => {
    const rekap = ringkasTamu([
      tamu({ rsvpStatus: "hadir", guestCount: 3, side: "pria", category: "keluargaPasangan", tableName: "Meja 1", invitedAt: new Date("2026-06-01T00:00:00Z") }),
      tamu({ rsvpStatus: "belum", guestCount: 2, side: "wanita", category: "teman", tableName: "Meja 1" }),
      tamu({ rsvpStatus: "tidak", guestCount: 4, side: "lainnya", category: "kerja", invitedAt: new Date("2026-06-01T00:00:00Z") }),
    ]);

    expect(rekap).toMatchObject({
      baris: 3,
      orang: 9,
      hadir: 3,
      belumKonfirmasi: 2,
      tidakHadir: 4,
      porsi: 5,
      kursi: 5,
      perkiraanMaksimal: 5,
      belumDiundang: 2,
      belumDiundangBaris: 1,
    });
    expect(rekap.perSisi).toEqual({ pria: 3, wanita: 2, bersama: 4 });
    expect(rekap.perKategori.map((k) => k.kategori)).toEqual(["kerja", "keluargaPasangan", "teman"]);
    expect(rekap.perMeja.find((m) => m.meja === "Meja 1")).toMatchObject({ orang: 5, baris: 2 });
    expect(rekap.perMeja.find((m) => m.meja === null)).toMatchObject({ orang: 4, baris: 1 });
  });

  it("tidak menghitung tamu yang sudah menolak ke porsi", () => {
    const rekap = ringkasTamu([
      tamu({ rsvpStatus: "hadir", guestCount: 2 }),
      tamu({ rsvpStatus: "tidak", guestCount: 10 }),
    ]);
    expect(rekap.porsi).toBe(2);
    expect(rekap.kursi).toBe(2);
    expect(rekap.orang).toBe(12);
  });

  it("jumlah baris belum diundang bisa berbeda dari jumlah orangnya", () => {
    const rekap = ringkasTamu([
      tamu({ guestCount: 3 }),
      tamu({ guestCount: 1 }),
      tamu({ guestCount: 5, invitedAt: new Date("2026-06-01T00:00:00Z") }),
    ]);
    // Tiga baris belum diundang berisi 3 + 1 = 4 orang, sedangkan tombol
    // borongan menandai baris, jadi dua angka ini memang beda dan keduanya
    // perlu dikirim ke layar.
    expect(rekap.belumDiundang).toBe(4);
    expect(rekap.belumDiundangBaris).toBe(2);
  });

  it("sisi lama yang tidak dikenal masuk keranjang bersama", () => {
    const rekap = ringkasTamu([tamu({ side: "sepupu jauh", guestCount: 3 }), tamu({ side: null, guestCount: 1 })]);
    expect(rekap.perSisi).toEqual({ pria: 0, wanita: 0, bersama: 4 });
  });

  it("tanpa tamu semua angka nol, bukan undefined", () => {
    const rekap = ringkasTamu([]);
    expect(rekap).toMatchObject({
      baris: 0,
      orang: 0,
      hadir: 0,
      tidakHadir: 0,
      belumKonfirmasi: 0,
      belumDiundang: 0,
      belumDiundangBaris: 0,
      porsi: 0,
      kursi: 0,
      perkiraanMaksimal: 0,
    });
    expect(rekap.perKategori).toEqual([]);
    expect(rekap.perMeja).toEqual([]);
    expect(rekap.perSisi).toEqual({ pria: 0, wanita: 0, bersama: 0 });
  });
});

describe("sisiDikenal", () => {
  it("hanya tiga nilai skema yang dianggap dikenal", () => {
    expect(sisiDikenal("pria")).toBe("pria");
    expect(sisiDikenal("wanita")).toBe("wanita");
    expect(sisiDikenal("lainnya")).toBe("lainnya");
    expect(sisiDikenal("sepupu")).toBeNull();
    expect(sisiDikenal(null)).toBeNull();
  });
});
