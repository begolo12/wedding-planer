import { describe, expect, it } from "vitest";
import {
  skemaBagikanTeks,
  skemaMilestone,
  skemaPembayaran,
  skemaPengumumanUbah,
  skemaPosAnggaran,
  skemaTamu,
  skemaTamuUbah,
  skemaTandaiUndangan,
  skemaTugas,
  skemaTugasUbah,
  skemaVendor,
} from "@/lib/skema";

describe("bentuk tanggal dan jam di isian", () => {
  const dasar = { title: "Akad nikah" };

  it("tanggal yang benar diterima, jauh di masa depan sekalipun", () => {
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "2026-06-30" }).success).toBe(true);
    // Tahun 9999 masih di dalam jangkauan kolom date Postgres, jadi diartikan
    // benar, bukan ditolak.
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "9999-12-31" }).success).toBe(true);
  });

  it("tahun dua digit dan bentuk lain ditolak, bukan ditebak", () => {
    for (const buruk of ["26-06-30", "2026-6-30", "30-06-2026", "20260630"]) {
      expect(skemaMilestone.safeParse({ ...dasar, eventDate: buruk }).success).toBe(false);
    }
  });

  it("tanggal yang tidak ada di kalender ditolak", () => {
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "2026-02-30" }).success).toBe(false);
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "2026-13-01" }).success).toBe(false);
  });

  it("tahun 0000 ditolak supaya jawabannya 422, bukan 500 dari Postgres", () => {
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "0000-01-01" }).success).toBe(false);
    // Tahun 1 Masehi masih sah.
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "0001-01-01" }).success).toBe(true);
  });

  it("jam 24:00 dan 07:60 ditolak, bukan dikirim apa adanya ke database", () => {
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "2026-06-30", eventTime: "24:00" }).success).toBe(false);
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "2026-06-30", eventTime: "07:60" }).success).toBe(false);
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "2026-06-30", eventTime: "07:00" }).success).toBe(true);
    expect(skemaMilestone.safeParse({ ...dasar, eventDate: "2026-06-30", eventTime: "23:59" }).success).toBe(true);
  });
});

describe("skemaPembayaran", () => {
  it("mengisi nilai bawaan saat field tidak dikirim", () => {
    expect(skemaPembayaran.parse({ amount: 5_000_000, paidAt: "2026-06-30" })).toEqual({
      amount: 5_000_000,
      paidAt: "2026-06-30",
      method: "transfer",
      isFinal: false,
      notes: null,
    });
  });

  it("jumlah berbentuk teks dari form tetap dibaca angka", () => {
    expect(skemaPembayaran.parse({ amount: "5000000", paidAt: "2026-06-30" }).amount).toBe(5_000_000);
  });

  it("jumlah nol ditolak, karena pembayaran nol tidak bermakna", () => {
    expect(skemaPembayaran.safeParse({ amount: 0, paidAt: "2026-06-30" }).success).toBe(false);
  });

  it("jumlah desimal ditolak, karena uang selalu integer rupiah", () => {
    expect(skemaPembayaran.safeParse({ amount: 1_500.5, paidAt: "2026-06-30" }).success).toBe(false);
  });

  it("tanggal yang tidak ada di kalender ditolak, bukan jadi galat database", () => {
    expect(skemaPembayaran.safeParse({ amount: 1_000, paidAt: "2026-02-30" }).success).toBe(false);
    expect(skemaPembayaran.safeParse({ amount: 1_000, paidAt: "2026-13-01" }).success).toBe(false);
  });

  /**
   * Batas atas uang harus sama dengan kapasitas kolom `integer` Postgres.
   * Kalau validasi lebih longgar, nilainya lolos ke database dan yang keluar
   * adalah 500 (integer out of range), padahal kontraknya 422.
   */
  it("nilai tepat di batas kolom integer diterima", () => {
    expect(skemaPembayaran.safeParse({ amount: 2_147_483_647, paidAt: "2026-06-30" }).success).toBe(true);
  });

  it("satu rupiah di atas batas kolom integer ditolak validasi, bukan database", () => {
    expect(skemaPembayaran.safeParse({ amount: 2_147_483_648, paidAt: "2026-06-30" }).success).toBe(false);
  });

  it("nilai miliaran yang dulu lolos sekarang ditolak di validasi", () => {
    expect(skemaPembayaran.safeParse({ amount: 3_000_000_000, paidAt: "2026-06-30" }).success).toBe(false);
  });

  it("isFinal dibaca apa adanya, bukan lewat Boolean()", () => {
    const dasar = { amount: 1_000, paidAt: "2026-06-30" };
    expect(skemaPembayaran.parse({ ...dasar, isFinal: "false" }).isFinal).toBe(false);
    expect(skemaPembayaran.parse({ ...dasar, isFinal: "true" }).isFinal).toBe(true);
    expect(skemaPembayaran.parse({ ...dasar, isFinal: false }).isFinal).toBe(false);
  });
});

describe("skemaTugas", () => {
  it("mengisi nilai bawaan saat field tidak dikirim", () => {
    expect(skemaTugas.parse({ title: "Booking dekorasi" })).toEqual({
      title: "Booking dekorasi",
      category: "Pelengkap",
      status: "belum",
      priority: "sedang",
      sortOrder: 0,
      notes: null,
    });
  });

  it("kategori di luar daftar ditolak", () => {
    expect(skemaTugas.safeParse({ title: "A", category: "kategori karangan" }).success).toBe(false);
  });
});

describe("skemaTugasUbah (PATCH sebagian)", () => {
  it("hanya mengembalikan field yang benar-benar dikirim", () => {
    // Ini penjaga utama: `.partial()` bawaan Zod di Zod 4 tetap mengisi nilai
    // bawaan, jadi sebelum diperbaiki mengubah judul tugas juga mereset
    // kategori, prioritas, status, dan urutannya.
    expect(skemaTugasUbah.parse({ title: "Judul baru" })).toEqual({ title: "Judul baru" });
  });

  it("field yang tidak dikirim tetap tidak ada di hasil", () => {
    const hasil = skemaTugasUbah.parse({ status: "selesai" });
    expect(hasil).toEqual({ status: "selesai" });
    expect("category" in hasil).toBe(false);
    expect("priority" in hasil).toBe(false);
    expect("sortOrder" in hasil).toBe(false);
  });

  it("body kosong ditolak supaya tidak jadi UPDATE tanpa kolom", () => {
    expect(() => skemaTugasUbah.parse({})).toThrow();
  });

  it("nilai yang salah tetap ditolak", () => {
    expect(skemaTugasUbah.safeParse({ priority: "super" }).success).toBe(false);
  });
});

describe("skemaTamuUbah", () => {
  it("mengubah nama saja tidak ikut mereset status dan jumlah orang", () => {
    expect(skemaTamuUbah.parse({ name: "Budi" })).toEqual({ name: "Budi" });
  });
});

describe("skemaPengumumanUbah", () => {
  it("publishedAt tidak bisa diubah lewat PATCH", () => {
    // Penerbitan punya endpoint sendiri. Kalau publishedAt diterima di sini,
    // body yang cuma berisi publishedAt lolos validasi tapi tidak ada kolom
    // yang ditulis, dan itu berakhir jadi galat database.
    expect(skemaPengumumanUbah.safeParse({ publishedAt: "2026-06-30" }).success).toBe(false);
  });

  it("judul saja tetap diterima", () => {
    expect(skemaPengumumanUbah.parse({ title: "Halo" })).toEqual({ title: "Halo" });
  });
});

describe("skemaBagikanTeks", () => {
  it("menerima variant dan mengubah pesan kosong jadi null", () => {
    expect(skemaBagikanTeks.parse({ variant: "ringkas", message: "" })).toEqual({
      variant: "ringkas",
      message: null,
    });
  });

  it("nama lama ditolak, karena hanya ada satu nama per field", () => {
    expect(skemaBagikanTeks.safeParse({ jenis: "ringkas" }).success).toBe(false);
  });

  it("variant di luar tiga pilihan ditolak", () => {
    expect(skemaBagikanTeks.safeParse({ variant: "apa saja" }).success).toBe(false);
  });

  it("linkId yang bukan uuid ditolak", () => {
    expect(skemaBagikanTeks.safeParse({ variant: "tautan", linkId: "bukan-uuid" }).success).toBe(false);
  });
});

describe("sisi tamu", () => {
  it("hanya menerima pria, wanita, lainnya", () => {
    for (const sisi of ["pria", "wanita", "lainnya"]) {
      expect(skemaTamu.safeParse({ name: "Ahmad", side: sisi }).success).toBe(true);
    }
    expect(skemaTamu.safeParse({ name: "Ahmad", side: "sepupu" }).success).toBe(false);
  });

  it("string kosong dan field kosong jadi null", () => {
    expect(skemaTamu.parse({ name: "Ahmad", side: "" }).side).toBeNull();
    expect(skemaTamu.parse({ name: "Ahmad" }).side).toBeNull();
  });
});

describe("nomor WhatsApp di skema", () => {
  it("dinormalkan ke 628xx di satu tempat, bukan di route", () => {
    expect(skemaTamu.parse({ name: "Ahmad", phone: "0812-3456-7890" }).phone).toBe("6281234567890");
    expect(skemaVendor.parse({ name: "Melati", phone: "+62 812 3456 7890" }).phone).toBe(
      "6281234567890",
    );
    expect(skemaTamu.parse({ name: "Ahmad" }).phone).toBeNull();
  });

  it("sampah ditolak, tidak lagi berubah jadi string kosong", () => {
    expect(skemaVendor.safeParse({ name: "Melati", phone: "bukan nomor" }).success).toBe(false);
    expect(skemaTamu.safeParse({ name: "Ahmad", phone: "bukan nomor" }).success).toBe(false);
  });

  it("kosong tetap boleh", () => {
    expect(skemaVendor.parse({ name: "Melati", phone: "" }).phone).toBeNull();
  });
});

describe("tautan undangan acara", () => {
  it("menerima http dan https", () => {
    const dasar = { title: "Akad nikah", eventDate: "2026-06-30" };
    expect(
      skemaMilestone.parse({ ...dasar, invitationUrl: "https://contoh.id/undangan" }).invitationUrl,
    ).toBe("https://contoh.id/undangan");
    expect(
      skemaMilestone.parse({ ...dasar, invitationUrl: "http://contoh.id" }).invitationUrl,
    ).toBe("http://contoh.id");
  });

  it("menolak skema lain dan tautan tanpa skema", () => {
    const dasar = { title: "Akad nikah", eventDate: "2026-06-30" };
    for (const buruk of ["javascript:alert(1)", "data:text/html,x", "contoh.id/undangan"]) {
      expect(skemaMilestone.safeParse({ ...dasar, invitationUrl: buruk }).success).toBe(false);
    }
  });
});

describe("metode bayar dan kategori anggaran baru", () => {
  it("qris diterima sebagai metode bayar", () => {
    expect(
      skemaPembayaran.parse({ amount: 1_000, paidAt: "2026-06-30", method: "qris" }).method,
    ).toBe("qris");
  });

  it("administrasi diterima sebagai kategori pos", () => {
    expect(skemaPosAnggaran.parse({ name: "Administrasi KUA", category: "administrasi" }).category).toBe(
      "administrasi",
    );
  });
});

describe("skemaTandaiUndangan", () => {
  it("butuh daftar id atau penanda semua", () => {
    expect(skemaTandaiUndangan.safeParse({}).success).toBe(false);
    expect(skemaTandaiUndangan.safeParse({ semua: true }).success).toBe(true);
    expect(skemaTandaiUndangan.safeParse({ ids: ["22bd97ff-87a3-4f76-9ab5-882ce199d265"] }).success).toBe(true);
    expect(skemaTandaiUndangan.safeParse({ ids: ["bukan-uuid"] }).success).toBe(false);
  });
});

