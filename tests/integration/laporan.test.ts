import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems, guests, payments, plans, users, vendors } from "@/db/schema";
import { susunLaporan } from "@/lib/laporan";

/**
 * Test integrasi laporan.
 *
 * Dua hal yang dijaga:
 * 1. Satuan "belum diundang" harus orang, sama dengan Beranda dan endpoint
 *    /guests. Dulu laporan menghitung baris, jadi angka di laporan berbeda
 *    dari angka di dua layar lain untuk data yang sama.
 * 2. Daftar vendor per baris harus ada, karena docs/16 bagian 2 menyebut
 *    "Vendor: yang belum lunas" sebagai isi laporan.
 *
 * Menyentuh database seperti test integrasi lain, dan menghapus datanya
 * sendiri lewat cascade saat user dihapus. Tabel tidak pernah dibuat di sini.
 */
describe("susunLaporan", () => {
  const cap = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let userId!: string;
  let planId!: string;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({ name: "Uji Laporan", email: `uji-laporan-${cap}@contoh.id` })
      .returning();
    userId = user.id;

    const [plan] = await db
      .insert(plans)
      .values({ userId, partnerName: "Pasangan Laporan" })
      .returning();
    planId = plan.id;

    const [pos] = await db
      .insert(budgetItems)
      .values({ planId, name: "Dekorasi", category: "dekorasi", plannedAmount: 5_000_000 })
      .returning();

    const [vendorLunas] = await db
      .insert(vendors)
      .values({ planId, name: "Dekorasi Lunas", category: "dekorasi", budgetItemId: pos.id })
      .returning();
    await db.insert(vendors).values({ planId, name: "Vendor Tanpa Tagihan" });

    await db.insert(payments).values({
      planId,
      vendorId: vendorLunas.id,
      amount: 5_000_000,
      paidAt: "2026-06-30",
      method: "transfer",
      isFinal: true,
    });

    await db.insert(guests).values([
      { planId, name: "Belum Diundang A", guestCount: 3, invitedAt: null, rsvpStatus: "belum", side: "pria" },
      { planId, name: "Belum Diundang B", guestCount: 1, invitedAt: null, rsvpStatus: "belum", side: "wanita" },
      { planId, name: "Sudah Diundang", guestCount: 4, invitedAt: new Date(), rsvpStatus: "hadir", side: "lainnya" },
      { planId, name: "Menolak", guestCount: 2, invitedAt: new Date(), rsvpStatus: "tidak" },
    ]);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, userId));
  });

  it("belum diundang dihitung dalam orang, sama dengan dua layar lain", async () => {
    const laporan = await susunLaporan(planId);
    // Dua baris tamu belum diundang dengan jumlah orang 3 + 1 = 4.
    expect(laporan.tamu.belumDiundang).toBe(4);
    expect(laporan.tamu.baris).toBe(4);
    expect(laporan.tamu.orang).toBe(10);
  });

  it("porsi katering dan kursi memakai angka yang sama dan tidak menghitung yang menolak", async () => {
    const laporan = await susunLaporan(planId);
    // Hadir 4 + belum konfirmasi 4 = 8. Yang menolak (2) tidak ikut.
    expect(laporan.tamu).toMatchObject({
      hadir: 4,
      belumKonfirmasi: 4,
      tidakHadir: 2,
      porsi: 8,
      kursi: 8,
    });
    expect(laporan.tamu.perSisi).toEqual({ pria: 3, wanita: 1, bersama: 6 });
  });

  it("daftar vendor per baris berisi tagihan, dibayar, sisa, dan status lunas", async () => {
    const laporan = await susunLaporan(planId);
    expect(laporan.vendor.daftar).toHaveLength(2);

    const lunas = laporan.vendor.daftar.find((v) => v.nama === "Dekorasi Lunas");
    expect(lunas).toMatchObject({
      tagihan: 5_000_000,
      dibayar: 5_000_000,
      sisa: 0,
      sudahLunas: true,
      labelKategori: "Dekorasi",
    });

    const belum = laporan.vendor.daftar.find((v) => v.nama === "Vendor Tanpa Tagihan");
    expect(belum).toMatchObject({ tagihan: 0, dibayar: 0, sudahLunas: false });

    expect(laporan.vendor.belumLunas).toBe(1);
  });
});
