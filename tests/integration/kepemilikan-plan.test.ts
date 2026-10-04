import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { plans, users } from "@/db/schema";
import { GalatAplikasi } from "@/lib/galat";
import { planMilikSaya, type Pengguna } from "@/lib/sesi";

/**
 * Test integrasi kepemilikan plan.
 *
 * `planMilikSaya` adalah satu-satunya penjaga kepemilikan, dan bagian yang
 * paling tidak boleh gagal diam-diam. Yang diuji di sini tiga hal yang paling
 * mahal kalau salah: plan orang lain harus FORBIDDEN (bukan NOT_FOUND supaya
 * mudah didiagnosis), plan yang tidak ada harus NOT_FOUND, dan jawabannya
 * tidak boleh membawa data plan yang bukan miliknya.
 *
 * Test ini menyentuh database. Kalau TEST_DATABASE_URL ada, tests/setup.ts
 * menimpa DATABASE_URL ke database uji. Kalau tidak ada, test berjalan di
 * database pengembangan, dan itulah keterbatasan yang ditulis di tests/setup.ts.
 * Tabel tidak pernah dibuat di sini.
 */
describe("kepemilikan plan", () => {
  const cap = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let penggunaA!: Pengguna;
  let penggunaB!: Pengguna;
  let planA!: { id: string };

  beforeAll(async () => {
    const [a] = await db
      .insert(users)
      .values({ name: "Uji A", email: `uji-a-${cap}@contoh.id` })
      .returning();
    const [b] = await db
      .insert(users)
      .values({ name: "Uji B", email: `uji-b-${cap}@contoh.id` })
      .returning();
    penggunaA = { id: a.id, name: a.name, email: a.email, image: a.image ?? null };
    penggunaB = { id: b.id, name: b.name, email: b.email, image: b.image ?? null };

    const [plan] = await db
      .insert(plans)
      .values({ userId: penggunaA.id, partnerName: "Pasangan Rahasia" })
      .returning();
    planA = plan;
  });

  afterAll(async () => {
    // Cascade di foreign key ikut menghapus plan. Satu query sudah cukup.
    await db.delete(users).where(inArray(users.id, [penggunaA.id, penggunaB.id]));
  });

  it("pemilik menerima datanya", async () => {
    const plan = await planMilikSaya(planA.id, penggunaA);
    expect(plan.id).toBe(planA.id);
    expect(plan.userId).toBe(penggunaA.id);
  });

  it("plan milik orang lain dibalas FORBIDDEN, bukan NOT_FOUND", async () => {
    await expect(planMilikSaya(planA.id, penggunaB)).rejects.toMatchObject({ kode: "FORBIDDEN" });
  });

  it("plan yang tidak ada dibalas NOT_FOUND", async () => {
    await expect(
      planMilikSaya("00000000-0000-0000-0000-000000000000", penggunaB),
    ).rejects.toMatchObject({ kode: "NOT_FOUND" });
  });

  it("id yang bukan uuid dibalas NOT_FOUND, bukan 500", async () => {
    await expect(planMilikSaya("bukan-uuid", penggunaB)).rejects.toMatchObject({
      kode: "NOT_FOUND",
    });
  });

  it("jawaban FORBIDDEN tidak membocorkan data plan", async () => {
    try {
      await planMilikSaya(planA.id, penggunaB);
      throw new Error("seharusnya melempar");
    } catch (err) {
      expect(err).toBeInstanceOf(GalatAplikasi);
      const galat = err as GalatAplikasi;
      expect(galat.kode).toBe("FORBIDDEN");
      expect(galat.message).not.toContain("Pasangan Rahasia");
      expect("plan" in galat).toBe(false);
      expect(galat.fields).toBeUndefined();
    }
  });
});
