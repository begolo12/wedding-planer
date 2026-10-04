import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  akhirMingguIni,
  hariIni,
  hitungMundur,
  selisihHari,
  sudahLewat,
  tanggalPanjangDari,
} from "@/lib/format";
import { kelompokkan } from "@/lib/plan";

/**
 * Perilaku waktu harus sama di zona proses mana pun.
 *
 * Produksi berjalan di server UTC, sedangkan pengguna di WIB, WITA, atau WIT.
 * Test ini memaku satu titik waktu (instan UTC), lalu memeriksa hari, hitung
 * mundur, dan batas minggu. Karena titik waktunya absolut, hasil yang benar
 * harus sama di `TZ=UTC`, `TZ=Asia/Jakarta`, `TZ=Pacific/Kiritimati`, dan
 * `TZ=America/Los_Angeles`. Perbandingan lintas zona dilakukan dengan
 * menjalankan berkas ini di beberapa TZ, lihat laporan.
 *
 * Titik waktu yang dipilih sengaja berada di sekitar tengah malam WIB:
 * 17.00 UTC sama dengan 00.00 WIB hari berikutnya.
 */

function paku(instan: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(instan));
}

describe("hari dan hitung mundur memakai kalender Asia/Jakarta", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("pukul 00.30 WIB sudah hari baru walau UTC masih kemarin", () => {
    // 2026-06-29T17:30Z = 30 Jun 2026 00:30 WIB.
    paku("2026-06-29T17:30:00Z");
    expect(hariIni()).toBe("2026-06-30");
    expect(selisihHari("2026-06-30")).toBe(0);
    expect(hitungMundur("2026-06-30")).toBe("hari ini");
    expect(kelompokkan("2026-06-30", "belum")).toBe("hariIni");
    expect(sudahLewat("2026-06-29")).toBe(true);
    expect(sudahLewat("2026-06-30")).toBe(false);
  });

  it("pukul 23.59 WIB masih hari yang sama", () => {
    // 2026-06-29T16:59:59Z = 29 Jun 2026 23:59:59 WIB.
    paku("2026-06-29T16:59:59Z");
    expect(hariIni()).toBe("2026-06-29");
    expect(selisihHari("2026-06-30")).toBe(1);
    expect(hitungMundur("2026-06-30")).toBe("besok");
    expect(kelompokkan("2026-06-30", "belum")).toBe("mingguIni");
  });

  it("tepat tengah malam WIB hari berganti tanpa sisa detik", () => {
    // 2026-06-30T17:00:00Z = 1 Jul 2026 00:00 WIB.
    paku("2026-06-30T17:00:00Z");
    expect(hariIni()).toBe("2026-07-01");
    expect(selisihHari("2026-06-30")).toBe(-1);
    expect(hitungMundur("2026-06-30")).toBe("kemarin");
    // 1 Jul 2026 jatuh pada hari Rabu.
    expect(tanggalPanjangDari("2026-07-01")).toBe("1 Juli 2026");
  });

  it("batas minggu berakhir di hari Minggu, bukan tujuh hari ke depan", () => {
    // 2026-07-05T10:00:00Z = 5 Jul 2026 17:00 WIB, hari Minggu.
    paku("2026-07-05T10:00:00Z");
    expect(hariIni()).toBe("2026-07-05");
    expect(akhirMingguIni()).toBe("2026-07-05");
    expect(kelompokkan("2026-07-05", "belum")).toBe("hariIni");
    // Senin berikutnya sudah di luar minggu ini.
    expect(kelompokkan("2026-07-06", "belum")).toBe("tanpaTenggat");
  });

  it("sehari sebelum Minggu masih masuk minggu ini", () => {
    // 2026-07-04T10:00:00Z = 4 Jul 2026 17:00 WIB, hari Sabtu.
    paku("2026-07-04T10:00:00Z");
    expect(hariIni()).toBe("2026-07-04");
    expect(akhirMingguIni()).toBe("2026-07-05");
    expect(kelompokkan("2026-07-05", "belum")).toBe("mingguIni");
  });
});
