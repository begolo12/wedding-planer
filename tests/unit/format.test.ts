import { describe, expect, it } from "vitest";
import {
  akhirMingguIni,
  awalHariJakarta,
  bacaRupiah,
  bacaTanggal,
  hariIni,
  hitungMundur,
  jamDari,
  jamSelesai,
  namaBulan,
  namaHari,
  normalkanNomorWa,
  persen,
  rupiah,
  rupiahPolos,
  selisihHari,
  sudahLewat,
  tanggalPendekDari,
  tanggalPanjangDari,
} from "@/lib/format";

/**
 * Tanggal N hari dari "hari ini" menurut kalender Asia/Jakarta.
 *
 * Dipakai supaya test hitung mundur tidak bergantung pada tanggal berapa test
 * dijalankan. Patokannya `hariIni()` yang sama dengan yang dipakai
 * `selisihHari`, jadi hasilnya pasti di zona proses mana pun dan di jam berapa
 * pun, termasuk saat tengah malam WIB belum lewat di server UTC.
 */
function geserHari(n: number): string {
  const dasar = bacaTanggal(hariIni());
  if (!dasar) throw new Error("hariIni() tidak terbaca");
  dasar.setUTCDate(dasar.getUTCDate() + n);
  return dasar.toISOString().slice(0, 10);
}

describe("rupiah", () => {
  it("memakai titik tiap tiga angka dan tanpa desimal", () => {
    expect(rupiah(4_500_000)).toBe("Rp 4.500.000");
    expect(rupiah(1_000)).toBe("Rp 1.000");
    expect(rupiah(0)).toBe("Rp 0");
  });

  it("membulatkan desimal, karena uang selalu integer rupiah", () => {
    expect(rupiah(1_234.6)).toBe("Rp 1.235");
  });

  it("menaruh tanda minus di depan", () => {
    expect(rupiah(-1_500)).toBe("-Rp 1.500");
  });

  it("nilai kosong dianggap nol", () => {
    expect(rupiah(null)).toBe("Rp 0");
    expect(rupiah(undefined)).toBe("Rp 0");
  });

  it("rupiahPolos membuang awalan Rp", () => {
    expect(rupiahPolos(4_500_000)).toBe("4.500.000");
  });

  it("bacaRupiah menerima bentuk yang ditulis orang Indonesia", () => {
    expect(bacaRupiah("4.500.000")).toBe(4_500_000);
    expect(bacaRupiah("Rp 4.500.000")).toBe(4_500_000);
    expect(bacaRupiah("Rp4.500.000")).toBe(4_500_000);
    expect(bacaRupiah("4500000")).toBe(4_500_000);
    expect(bacaRupiah("4 500 000")).toBe(4_500_000);
    // Notasi rupiah penuh dengan tanda hubung di belakang.
    expect(bacaRupiah("Rp 4.500.000,-")).toBe(4_500_000);
  });

  it("bacaRupiah menerima bentuk singkat yang lazim di WhatsApp", () => {
    // Tanpa aturan ini, `4,5jt` dulu terbaca `45`, dan anggaran meleset
    // seratus kali. Pembulatan ke rupiah penuh tetap dilakukan.
    expect(bacaRupiah("4,5jt")).toBe(4_500_000);
    expect(bacaRupiah("4.5jt")).toBe(4_500_000);
    expect(bacaRupiah("2 juta")).toBe(2_000_000);
    expect(bacaRupiah("500rb")).toBe(500_000);
    expect(bacaRupiah("3k")).toBe(3_000);
    expect(bacaRupiah("1,5jt")).toBe(1_500_000);
  });

  it("bacaRupiah membulatkan desimal karena uang selalu rupiah penuh", () => {
    expect(bacaRupiah("1.500.000,50")).toBe(1_500_001);
    expect(bacaRupiah("1.500.000,4")).toBe(1_500_000);
  });

  it("bacaRupiah tetap terbaca saat satu digit dihapus di tengah angka", () => {
    // Isian uang diformat ulang tiap ketukan, jadi nilai antara harus tetap
    // terbaca. Kalau tidak, menghapus satu digit mengosongkan seluruh isian.
    expect(bacaRupiah("4.500.00")).toBe(450_000);
    expect(bacaRupiah("4.500.")).toBe(4_500);
    expect(bacaRupiah("4.")).toBe(4);
  });

  it("bacaRupiah tidak menebak dari teks yang tidak dikenali", () => {
    expect(bacaRupiah("")).toBe(0);
    expect(bacaRupiah("bukan angka")).toBe(0);
    expect(bacaRupiah("12a34")).toBe(0);
    expect(bacaRupiah(".")).toBe(0);
  });
});

describe("normalkanNomorWa", () => {
  it("menormalkan semua bentuk nomor Indonesia ke 628xx", () => {
    const harapan = "6281234567890";
    expect(normalkanNomorWa("081234567890")).toBe(harapan);
    expect(normalkanNomorWa("0812-3456-7890")).toBe(harapan);
    expect(normalkanNomorWa("0812 3456 7890")).toBe(harapan);
    expect(normalkanNomorWa("+62 812 3456 7890")).toBe(harapan);
    expect(normalkanNomorWa("+6281234567890")).toBe(harapan);
    expect(normalkanNomorWa("62-812-3456-7890")).toBe(harapan);
    expect(normalkanNomorWa("6281234567890")).toBe(harapan);
    expect(normalkanNomorWa("81234567890")).toBe(harapan);
  });

  it("mempertahankan nomor internasional non-Indonesia apa adanya", () => {
    expect(normalkanNomorWa("+65 9123 4567")).toBe("6591234567");
  });

  it("menolak yang bukan nomor HP, bukan diartikan jadi nomor lain", () => {
    expect(normalkanNomorWa("")).toBeNull();
    expect(normalkanNomorWa(null)).toBeNull();
    expect(normalkanNomorWa("bukan nomor")).toBeNull();
    expect(normalkanNomorWa("021-5551234")).toBeNull();
    expect(normalkanNomorWa("0812")).toBeNull();
  });
});

describe("persen", () => {
  it("membulatkan hasil bagi", () => {
    expect(persen(4_500_000, 10_000_000)).toBe(45);
    expect(persen(1, 3)).toBe(33);
  });

  it("dibatasi 0 sampai 100", () => {
    expect(persen(20_000_000, 10_000_000)).toBe(100);
    expect(persen(-5, 100)).toBe(0);
  });

  it("total nol atau negatif menghasilkan nol, bukan pembagian tak tentu", () => {
    expect(persen(5, 0)).toBe(0);
    expect(persen(5, -1)).toBe(0);
  });
});

describe("tanggal", () => {
  it("tanggal panjang dan pendek dalam bahasa Indonesia", () => {
    expect(tanggalPanjangDari("2026-06-30")).toBe("30 Juni 2026");
    expect(tanggalPendekDari("2026-06-30")).toBe("30 Jun 2026");
  });

  it("nilai kosong memakai teks cadangan, bukan kosong tanpa penjelasan", () => {
    expect(tanggalPanjangDari(null)).toBe("Belum ada tanggal");
    expect(tanggalPendekDari(null)).toBe("-");
  });

  it("teks yang bukan tanggal juga memakai teks cadangan", () => {
    expect(tanggalPanjangDari("bukan tanggal")).toBe("Belum ada tanggal");
    expect(tanggalPendekDari("bukan tanggal")).toBe("-");
  });

  it("namaHari dan namaBulan membaca tanggal lokal tanpa geser hari", () => {
    expect(namaHari("2026-06-30")).toBe("Selasa");
    expect(namaBulan("2026-06-30")).toBe("Juni 2026");
  });

  it("bacaTanggal membaca tanggal murni sebagai UTC", () => {
    const d = bacaTanggal("2026-06-30");
    expect(d?.toISOString()).toBe("2026-06-30T00:00:00.000Z");
    expect(bacaTanggal("bukan tanggal")).toBeNull();
  });
});

describe("jam", () => {
  it("memakai titik sebagai pemisah dan tanpa detik", () => {
    expect(jamDari("07:00:00")).toBe("07.00");
    expect(jamDari("19:45")).toBe("19.45");
    expect(jamDari(null)).toBe("--.--");
  });

  it("jamSelesai menambahkan durasi dan melewati tengah malam dengan benar", () => {
    expect(jamSelesai("07:00", 90)).toBe("08.30");
    expect(jamSelesai("23:30", 90)).toBe("01.00");
    expect(jamSelesai("bukan jam", 10)).toBe("--.--");
  });
});

describe("hitung mundur", () => {
  it("hari ini, besok, kemarin ditulis dengan kata", () => {
    expect(hitungMundur(geserHari(0))).toBe("hari ini");
    expect(hitungMundur(geserHari(1))).toBe("besok");
    expect(hitungMundur(geserHari(-1))).toBe("kemarin");
  });

  it("beberapa hari lagi dan beberapa hari lewat", () => {
    expect(hitungMundur(geserHari(371))).toBe("371 hari");
    expect(hitungMundur(geserHari(-2))).toBe("2 hari lewat");
  });

  it("tanpa tanggal tidak menampilkan angka karangan", () => {
    expect(hitungMundur(null)).toBe("belum ada tanggal");
    expect(selisihHari(null)).toBeNull();
  });

  it("selisihHari negatif berarti sudah lewat", () => {
    expect(selisihHari(geserHari(-1))).toBe(-1);
    expect(selisihHari(geserHari(3))).toBe(3);
    expect(sudahLewat(geserHari(-1))).toBe(true);
    expect(sudahLewat(geserHari(1))).toBe(false);
    expect(sudahLewat(null)).toBe(false);
  });
});

describe("batas hari", () => {
  it("hariIni berbentuk YYYY-MM-DD", () => {
    expect(hariIni()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("akhirMingguIni berbentuk YYYY-MM-DD dan tidak sebelum hari ini", () => {
    const batas = akhirMingguIni();
    expect(batas).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(batas >= hariIni()).toBe(true);
  });

  it("awalHariJakarta menaruh tengah malam di WIB, bukan UTC", () => {
    // 00.00 WIB 30 Juni sama dengan 17.00 UTC 29 Juni.
    expect(awalHariJakarta("2026-06-30").toISOString()).toBe("2026-06-29T17:00:00.000Z");
    // Tanpa argumen memakai hari ini di Asia/Jakarta, tengah malamnya selalu
    // pukul 17.00 UTC hari sebelumnya.
    expect(awalHariJakarta().toISOString().slice(11)).toBe("17:00:00.000Z");
  });
});
