import { describe, expect, it } from "vitest";
import { navigasiAktif } from "@/lib/navigasi";

describe("navigasi aktif", () => {
  it.each(["/rencana/vendor", "/rencana/vendor/detail"])("Vendor tidak mengaktifkan dua menu sidebar: %s", (pathname) => {
    expect(navigasiAktif(pathname, "/rencana", true)).toBe(false);
    expect(navigasiAktif(pathname, "/rencana/vendor", true)).toBe(true);
    expect(navigasiAktif(pathname, "/rencana")).toBe(true);
  });
  it.each(["/rencana", "/rencana/tanggal", "/rencana/vendor-lain"])("Rencana tetap aktif: %s", (pathname) => {
    expect(navigasiAktif(pathname, "/rencana", true)).toBe(true);
  });
  it("mencocokkan batas segmen dan Beranda secara tepat", () => {
    expect(navigasiAktif("/tamunya", "/tamu")).toBe(false);
    expect(navigasiAktif("/beranda/detail", "/beranda")).toBe(false);
    expect(navigasiAktif("/beranda", "/beranda")).toBe(true);
  });
  it("menjaga tab Rencana aktif di halaman turunan", () => {
    expect(navigasiAktif("/rencana/vendor/abc", "/rencana/vendor")).toBe(true);
    expect(navigasiAktif("/rencana/vendor-lain", "/rencana/vendor")).toBe(false);
    expect(navigasiAktif("/rencana/vendor", "/rencana")).toBe(true);
  });
});
