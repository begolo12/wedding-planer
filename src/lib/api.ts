import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { budgetItems } from "@/db/schema";
import { tidakDitemukan } from "@/lib/galat";
import { wajibMasuk, planMilikSaya, type Pengguna, type Plan } from "@/lib/sesi";

/**
 * Dua hal yang harus dilakukan setiap route plan: pastikan ada sesi, lalu
 * pastikan plan itu milik orangnya. Ditulis sekali di sini supaya urutannya
 * tidak bisa tertukar dan tidak ada route yang lupa salah satunya.
 */
export async function konteksPlan(planId: string): Promise<{
  pengguna: Pengguna;
  plan: Plan;
}> {
  const pengguna = await wajibMasuk();
  const plan = await planMilikSaya(planId, pengguna);
  return { pengguna, plan };
}

/**
 * Pos anggaran yang ditunjuk harus benar-benar milik plan yang sama.
 *
 * uuid yang bentuknya sah tapi tidak ada di database dulu diteruskan apa
 * adanya ke insert, dan kolom foreign key-nya berakhir jadi 500 INTERNAL_ERROR,
 * padahal kontraknya 404. Filter planId di sini sekaligus menutup celah tugas
 * atau vendor menunjuk pos milik plan orang lain.
 */
export async function pastikanPosAnggaran(planId: string, id: string): Promise<void> {
  const [baris] = await db
    .select({ id: budgetItems.id })
    .from(budgetItems)
    .where(and(eq(budgetItems.planId, planId), eq(budgetItems.id, id)))
    .limit(1);
  if (!baris) throw tidakDitemukan("Pos anggaran");
}

/** Ambil nilai query yang tidak kosong. */
export function cariParam(url: URL, nama: string): string | null {
  const nilai = url.searchParams.get(nama);
  return nilai && nilai.trim() ? nilai.trim() : null;
}

/** Nilai yang dikirim layar tapi tidak boleh dipercaya apa adanya. */
export function bersihkan(nilai: string | undefined): string {
  return (nilai ?? "").trim();
}
