import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems, payments, plans, users, vendors } from "@/db/schema";
import { jumlahPembayaran, jumlahPembayaranVendor } from "@/lib/agregat-uang";

/**
 * Test integrasi agregat uang.
 *
 * Dua hal yang dijaga, keduanya pernah jadi bug di `docs/20` temuan 7 dan 18:
 *
 * 1. Total di atas batas `int4` (2.147.483.647) tidak boleh melempar
 *    `integer out of range`, karena uang selalu integer rupiah dan totalnya
 *    bisa melewati batas itu.
 * 2. Hasilnya harus `number`, bukan `string`. Driver `postgres` mengembalikan
 *    `bigint` sebagai string, dan string itu dulu membuat `total += nilai` di
 *    layar vendor berubah jadi penggabungan teks.
 *
 * Menyentuh database seperti test integrasi lain, dan menghapus datanya
 * sendiri lewat cascade saat user dihapus. Tabel tidak pernah dibuat di sini.
 */
describe("agregat uang", () => {
  const cap = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let userId!: string;
  let planId!: string;
  let vendorId!: string;

  beforeAll(async () => {
    const [user] = await db
      .insert(users)
      .values({ name: "Uji Agregat Uang", email: `uji-agregat-${cap}@contoh.id` })
      .returning();
    userId = user.id;

    const [plan] = await db
      .insert(plans)
      .values({ userId, partnerName: "Pasangan Agregat" })
      .returning();
    planId = plan.id;

    const [pos] = await db
      .insert(budgetItems)
      .values({ planId, name: "Gedung", category: "gedung", plannedAmount: 2_147_483_647 })
      .returning();

    const [vendor] = await db
      .insert(vendors)
      .values({ planId, name: "Gedung Mewah", category: "gedung", budgetItemId: pos.id })
      .returning();
    vendorId = vendor.id;

    // Dua pembayaran yang masing-masing masih muat di kolom `integer`, tetapi
    // totalnya 4.000.000.000, di atas kapasitas `int4`.
    await db.insert(payments).values([
      {
        planId,
        vendorId,
        amount: 2_000_000_000,
        paidAt: "2026-06-30",
        method: "transfer",
        isFinal: false,
      },
      {
        planId,
        vendorId,
        amount: 2_000_000_000,
        paidAt: "2026-07-31",
        method: "transfer",
        isFinal: true,
      },
    ]);
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, userId));
  });

  it("total per vendor berupa angka dan melewati batas int4", async () => {
    // Sengaja tanpa join: query satu tabel memicu optimasi Drizzle yang
    // melepas prefiks tabel, dan rujukan berkorelasi harus tetap benar.
    const [baris] = await db
      .select({ total: jumlahPembayaranVendor(planId, vendors.id) })
      .from(vendors)
      .where(eq(vendors.id, vendorId));

    expect(baris.total).toBe(4_000_000_000);
    expect(typeof baris.total).toBe("number");

    // Penjumlahan di layar tidak boleh berubah jadi penggabungan teks.
    let totalTerbayar = 0;
    totalTerbayar += baris.total;
    expect(totalTerbayar).toBe(4_000_000_000);
  });

  it("total seluruh pembayaran berupa angka", async () => {
    const [baris] = await db
      .select({ total: jumlahPembayaran })
      .from(payments)
      .where(eq(payments.planId, planId));

    expect(baris.total).toBe(4_000_000_000);
    expect(typeof baris.total).toBe("number");
  });

  it("tanpa mapWith, driver mengembalikan bigint sebagai string", async () => {
    // Bukti akar masalah, bukan sekadar klaim: kalau perilaku driver ini
    // berubah, alasan `mapWith(Number)` di src/lib/agregat-uang.ts harus
    // ditinjau ulang.
    const [mentah] = await db
      .select({ total: sql`coalesce(sum(${payments.amount}), 0)::bigint` })
      .from(payments)
      .where(eq(payments.planId, planId));

    expect(typeof mentah.total).toBe("string");
  });
});
