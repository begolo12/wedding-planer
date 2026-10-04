import { NAMA_PRODUK } from "./konstanta";
import { akhirMingguIni, hitungMundur, selisihHari } from "./format";

/**
 * Aturan plan yang dipakai di lebih dari satu tempat ditulis di sini.
 * Murni komputasi tanpa akses database langsung supaya aman diimpor komponen client.
 */

/** Nama yang tampil di kepala navigasi. Hanya nama depan, biar tidak panjang. */
export function namaPlan(namaPengguna: string, partnerName: string) {
  const depan = (teks: string) => teks.trim().split(/\s+/)[0] ?? teks.trim();
  return `${depan(namaPengguna)} & ${depan(partnerName)}`;
}

/** Judul cadangan saat plan belum ada, supaya tidak ada layar tanpa judul. */
export function namaPlaceholder() {
  return NAMA_PRODUK;
}

/**
 * Tanggal hari besar. Diambil dari milestone yang ditandai `isDayOf`, dan
 * kalau belum ada dipakai tanggal pernikahan di plan. Urutan ini disengaja:
 * hari-H yang sebenarnya lebih dipercaya daripada tanggal perkiraan.
 */
export function tanggalHariBesar(plan: {
  weddingDate: string | null;
  isDayOfDate: string | null;
}): string | null {
  return plan.isDayOfDate ?? plan.weddingDate;
}

/** Kalimat hitung mundur untuk kepala Beranda. Null berarti tidak ditampilkan. */
export function teksHitungMundur(tanggal: string | null): string | null {
  if (!tanggal) return null;
  return hitungMundur(tanggal);
}

/**
 * Kelompok waktu sebuah tugas. Dipakai Beranda, Rencana, dan laporan supaya
 * pengelompokannya persis sama. Minggu dihitung sampai hari Minggu, bukan
 * tujuh hari ke depan, karena orang berpikir dalam minggu kalender.
 */
export type KelompokWaktu =
  | "lewat"
  | "hariIni"
  | "mingguIni"
  | "setelahMingguIni"
  | "tanpaTenggat"
  | "selesai";

export function kelompokkan(tanggal: string | null, status: string): KelompokWaktu {
  if (status === "selesai") return "selesai";
  if (!tanggal) return "tanpaTenggat";
  const selisih = selisihHari(tanggal);
  if (selisih === null) return "tanpaTenggat";
  if (selisih < 0) return "lewat";
  if (selisih === 0) return "hariIni";
  return tanggal <= akhirMingguIni() ? "mingguIni" : "setelahMingguIni";
}

/**
 * Label tiap kelompok. "Belum ada tenggat" hanya untuk tugas yang benar-benar
 * tidak punya tanggal. Sebelumnya tugas bertenggat jauh juga masuk ke sana,
 * jadi baris bertanggal muncul di bawah judul "Belum ada tenggat" dan judulnya
 * berbohong.
 */
export const LABEL_KELOMPOK: Record<KelompokWaktu, string> = {
  lewat: "Lewat jatuh tempo",
  hariIni: "Hari ini",
  mingguIni: "Minggu ini",
  setelahMingguIni: "Setelah minggu ini",
  tanpaTenggat: "Belum ada tenggat",
  selesai: "Sudah selesai",
};

export const URUTAN_KELOMPOK: KelompokWaktu[] = [
  "lewat",
  "hariIni",
  "mingguIni",
  "setelahMingguIni",
  "tanpaTenggat",
  "selesai",
];

/** Ambil planId dari URL pencarian, dipakai tab yang menyimpan pilihan di URL. */
export function planIdDari(url: URL): string | null {
  const nilai = url.searchParams.get("plan");
  return nilai && /^[0-9a-f-]{36}$/i.test(nilai) ? nilai : null;
}
