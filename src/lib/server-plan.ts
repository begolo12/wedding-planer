import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { plans, tasks } from "@/db/schema";
import { tidakDitemukan } from "./galat";

/**
 * Operasi database terkait plan di sisi server.
 * Dipisahkan dari plan.ts supaya komponen client tidak menarik driver postgres ke browser.
 */

/** Tugas dianggap belum beres selama statusnya bukan selesai. */
export function belumSelesai() {
  return ne(tasks.status, "selesai");
}

/**
 * Plan pertama pengguna. Dipakai saat URL belum memuat planId, jadi orang
 * yang cuma punya satu rencana tidak perlu memilih apa pun dulu.
 */
export async function planPertamaPengguna(userId: string) {
  const [plan] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.userId, userId), isNull(plans.deletedAt)))
    .orderBy(asc(plans.createdAt))
    .limit(1);
  return plan ?? null;
}

/** Sama, tapi melempar kalau memang belum ada rencana sama sekali. */
export async function wajibPunyaPlan(userId: string) {
  const plan = await planPertamaPengguna(userId);
  if (!plan) throw tidakDitemukan("Rencana");
  return plan;
}
