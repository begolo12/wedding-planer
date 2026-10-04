import { beforeEach, describe, expect, it } from "vitest";
import {
  bersihkanAntreanPenuh,
  catatAntreanPenuh,
  catatHasilKirim,
  catatLuring,
  catatSumberData,
  statusLuring,
} from "@/lib/status-luring";

/**
 * Satu jalur data dari antrean luring ke layar. Banner luring membaca store
 * ini lewat useStatusLuring(), jadi bentuk dan isinya harus dijaga di sini.
 */
describe("status luring", () => {
  beforeEach(() => {
    catatHasilKirim({ gagal: 0, perluMasuk: false, pesanGagal: null });
    catatLuring(false);
    catatSumberData(false);
    bersihkanAntreanPenuh();
  });

  it("mulai dari keadaan kosong", () => {
    expect(statusLuring()).toEqual({
      dibuang: 0,
      gagal: 0,
      pesanGagal: null,
      perluMasuk: false,
      luring: false,
      dariPerangkat: false,
    });
  });

  it("mencatat jumlah item yang dibuang karena antrean penuh", () => {
    catatAntreanPenuh(3);
    expect(statusLuring().dibuang).toBe(3);
  });

  it("dibuang nol tidak menimpa pemberitahuan yang belum dilihat", () => {
    catatAntreanPenuh(3);
    catatAntreanPenuh(0);
    expect(statusLuring().dibuang).toBe(3);
  });

  it("bersihkanAntreanPenuh mengosongkan pemberitahuan setelah ditutup", () => {
    catatAntreanPenuh(2);
    bersihkanAntreanPenuh();
    expect(statusLuring().dibuang).toBe(0);
  });

  it("mencatat item gagal beserta pesannya dan keadaan sesi habis", () => {
    catatHasilKirim({
      gagal: 2,
      perluMasuk: true,
      pesanGagal: "Sesi habis. Masuk lagi supaya perubahan ini bisa terkirim.",
    });
    expect(statusLuring()).toMatchObject({
      gagal: 2,
      perluMasuk: true,
      pesanGagal: "Sesi habis. Masuk lagi supaya perubahan ini bisa terkirim.",
    });
  });

  it("putaran kirim berikutnya yang bersih mengembalikan keadaan normal", () => {
    catatHasilKirim({ gagal: 1, perluMasuk: true, pesanGagal: "Server membalas 500." });
    catatHasilKirim({ gagal: 0, perluMasuk: false, pesanGagal: null });
    expect(statusLuring()).toMatchObject({ gagal: 0, perluMasuk: false, pesanGagal: null });
  });

  it("menandai saat data dilayani dari perangkat, lalu bersih lagi saat dari server", () => {
    catatSumberData(true);
    expect(statusLuring().dariPerangkat).toBe(true);
    catatSumberData(false);
    expect(statusLuring().dariPerangkat).toBe(false);
  });

  it("mencatat keadaan koneksi dari satu penulis saja", () => {
    catatLuring(true);
    expect(statusLuring().luring).toBe(true);
    catatLuring(false);
    expect(statusLuring().luring).toBe(false);
  });
});
