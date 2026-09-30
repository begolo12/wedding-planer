import { wajibMasuk, planMilikSaya, type Pengguna } from "@/lib/sesi";

/**
 * Dua hal yang harus dilakukan setiap route plan: pastikan ada sesi, lalu
 * pastikan plan itu milik orangnya. Ditulis sekali di sini supaya urutannya
 * tidak bisa tertukar dan tidak ada route yang lupa salah satunya.
 */
export async function konteksPlan(planId: string): Promise<{
  pengguna: Pengguna;
  plan: Awaited<ReturnType<typeof planMilikSaya>>;
}> {
  const pengguna = await wajibMasuk();
  const plan = await planMilikSaya(planId, pengguna);
  return { pengguna, plan };
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
