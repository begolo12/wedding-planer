import { describe, expect, it } from "vitest";
import { susunTeksBagikan, tautanWa } from "@/lib/teks-wa";
import type { Laporan } from "@/lib/laporan";

describe("tautanWa", () => {
  it("mengubah baris baru jadi %0A supaya tidak menyambung", () => {
    expect(tautanWa("Sisa Rp 4.500.000\nTugas 3 dari 10")).toBe(
      "https://wa.me/?text=Sisa%20Rp%204.500.000%0ATugas%203%20dari%2010",
    );
  });

  it("mengenkode karakter non-ASCII sebagai UTF-8", () => {
    expect(tautanWa("Sisa dana")).toBe("https://wa.me/?text=Sisa%20dana");
    expect(tautanWa("Anda & pasangan")).toBe("https://wa.me/?text=Anda%20%26%20pasangan");
    // Huruf beraksen dan tanda kutip ikut dienkode, bukan dikirim mentah.
    const url = tautanWa("café “kutip”");
    expect(url).toContain("%C3%A9");
    expect(url).toContain("%E2%80%9C");
    expect(decodeURIComponent(url.replace("https://wa.me/?text=", ""))).toBe("café “kutip”");
  });

  it("bisa dibuka balik persis jadi teks semula", () => {
    const teks = "Hari-H: 30 Juni 2026, hari ini\nUang\nSisa Rp 4.500.000";
    const url = tautanWa(teks);
    expect(decodeURIComponent(url.replace("https://wa.me/?text=", ""))).toBe(teks);
  });
});

describe("susunTeksBagikan", () => {
  // Varian "tautan" hanya membaca nama pasangan, jadi objek ini cukup diisi
  // satu field. Cast sengaja supaya test tidak perlu membangun seluruh
  // Laporan yang panjang untuk satu perilaku.
  const laporan = {
    judul: { namaPasangan: "Sarah & Dimas", tanggal: null, tanggalTeks: "-" },
  } as unknown as Laporan;

  it("varian tautan menyusun kalimat yang pasti dan tautan wa.me terenkode", () => {
    const hasil = susunTeksBagikan(laporan, "tautan", null, "https://contoh.id/bagikan/abc");
    expect(hasil.text).toContain("Sarah & Dimas");
    expect(hasil.text).toContain("https://contoh.id/bagikan/abc");
    expect(hasil.truncated).toBe(false);
    expect(tautanWa(hasil.text)).toContain("%0A");
  });
});

/**
 * Laporan lengkap untuk varian ringkas dan lengkap. Dibuat sebagai objek
 * literal supaya tiap field yang dibaca penyusun teks terlihat jelas.
 */
function laporanUji(jumlahTamu: number): Laporan {
  return {
    dibuatPada: "2026-06-30T00:00:00.000Z",
    judul: { namaPasangan: "Sarah & Dimas", tanggal: "2026-06-30", tanggalTeks: "30 Juni 2026" },
    hitungMundur: { teks: "hari ini", hari: 0 },
    uang: {
      planned: 50_000_000,
      paid: 20_000_000,
      remaining: 30_000_000,
      persenTerpakai: 40,
      jumlahPos: 2,
      pos: [
        {
          id: "p1",
          name: "Katering",
          category: "katering",
          labelKategori: "Katering",
          planned: 30_000_000,
          paid: 10_000_000,
          remaining: 20_000_000,
        },
      ],
    },
    tugas: { total: 10, selesai: 4, lewat: 1, mingguIni: 2, tanpaTenggat: 3, daftarTerdekat: [] },
    tamu: {
      baris: 500,
      orang: jumlahTamu,
      hadir: 1_800,
      tidakHadir: 200,
      kursi: 2_800,
      porsi: 2_800,
      belumKonfirmasi: 1_000,
      belumDiundang: 300,
      perKategori: [],
      perSisi: { pria: 1_500, wanita: 1_400, bersama: 100 },
    },
    rundown: { total: 0, jamMulai: null, jamSelesai: null, item: [] },
    vendor: { total: 0, dibook: 0, belumLunas: 0, totalTagihan: 0, totalDibayar: 0, daftar: [] },
    busana: { total: 0, siap: 0, belumSiap: 0 },
    jadwal: [{ id: "m1", title: "Akad nikah", eventDate: "2026-06-30", type: "akad" }],
  } as unknown as Laporan;
}

describe("susunTeksBagikan ringkas dan lengkap", () => {
  it("menampilkan porsi katering dan kursi dari satu angka yang sama", () => {
    const hasil = susunTeksBagikan(laporanUji(3_000), "ringkas", null, null);
    expect(hasil.text).toContain("Perkiraan porsi katering 2800");
    expect(hasil.text).toContain("kursi yang perlu disiapkan 2800");
  });

  it("menulis tanggal jadwal dalam bahasa Indonesia, bukan ISO", () => {
    const hasil = susunTeksBagikan(laporanUji(10), "lengkap", null, null);
    expect(hasil.text).toContain("30 Jun 2026: Akad nikah");
    expect(hasil.text).not.toContain("2026-06-30:");
  });

  it("tetap di bawah 800 karakter walau tamunya 3.000 orang", () => {
    // Ringkasan memakai angka, bukan daftar nama, jadi jumlah tamu tidak
    // menambah panjang. Kalau suatu saat daftar ikut, test ini yang menangkap.
    const hasil = susunTeksBagikan(laporanUji(3_000), "ringkas", null, null);
    expect(hasil.truncated).toBe(false);
    expect(hasil.length).toBeLessThanOrEqual(800);
  });
});
