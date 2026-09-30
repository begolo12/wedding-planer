import { headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { auth } from "@/lib/auth";
import { belumMasuk, tidakDitemukan, tidakPunyaAkses } from "@/lib/galat";

export type Pengguna = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

/** Sesi sekarang, atau null. Tidak melempar, karena dipakai juga di layout. */
export async function sesiSekarang(): Promise<Pengguna | null> {
  const sesi = await auth.api.getSession({ headers: await headers() });
  if (!sesi?.user) return null;
  const u = sesi.user;
  return { id: u.id, name: u.name, email: u.email, image: u.image ?? null };
}

/** Sesi sekarang, atau lempar UNAUTHENTICATED. Dipakai di semua route API. */
export async function wajibMasuk(): Promise<Pengguna> {
  const pengguna = await sesiSekarang();
  if (!pengguna) throw belumMasuk();
  return pengguna;
}

/**
 * Memastikan plan ini milik pengguna. Ini satu-satunya tempat kepemilikan
 * diperiksa, jadi route lain tinggal memanggilnya dan tidak bisa lupa.
 * Plan yang sudah dihapus lembut dianggap tidak ada.
 */
export async function planMilikSaya(planId: string, pengguna: Pengguna) {
  if (!planId || !/^[0-9a-f-]{36}$/i.test(planId)) {
    throw tidakDitemukan("Rencana");
  }

  const [plan] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.id, planId), eq(plans.userId, pengguna.id), isNull(plans.deletedAt)))
    .limit(1);

  if (!plan) {
    // Plan ada tapi bukan miliknya tetap dibalas FORBIDDEN, bukan NOT_FOUND.
    // Pemisahan keduanya disengaja, alasannya di docs/04-API-Contract.md.
    const [ada] = await db
      .select({ id: plans.id })
      .from(plans)
      .where(and(eq(plans.id, planId), isNull(plans.deletedAt)))
      .limit(1);
    if (ada) throw tidakPunyaAkses();
    throw tidakDitemukan("Rencana");
  }

  return plan;
}

/** Plan pertama milik pengguna. Dipakai kalau planId belum ada di URL. */
export async function planPertama(pengguna: Pengguna) {
  const [plan] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.userId, pengguna.id), isNull(plans.deletedAt)))
    .limit(1);
  return plan ?? null;
}
