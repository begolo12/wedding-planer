import { z } from "zod";
import {
  AUIDENS,
  JENIS_TANGGAL,
  KATEGORI_TAMU,
  KATEGORI_TUGAS,
  KATEGORI_UANG,
  METODE_BAYAR,
  PEMILIK_BUSANA,
  PENUGASAN,
  PRIORITAS,
  STATUS_BUSANA,
  STATUS_HADIR,
  STATUS_PLAN,
  STATUS_VENDOR,
} from "./konstanta";

// Semua bentuk isian ditulis di satu berkas. Layar dan API membaca dari sini,
// jadi aturan tidak bisa berbeda antara form di layar dan pemeriksaan di server.

/**
 * Tanggal harus benar-benar ada di kalender, bukan cuma berbentuk benar.
 * Regex saja meloloskan 2026-02-30 dan 2026-13-45; nilai itu ditolak kolom
 * `date` Postgres dan berubah jadi 500, padahal kontrak mensyaratkan 422.
 */
function adaDiKalender(teks: string): boolean {
  const [tahun, bulan, hari] = teks.split("-").map(Number);
  if (bulan < 1 || bulan > 12 || hari < 1) return false;
  const dibuat = new Date(Date.UTC(tahun, bulan - 1, hari));
  // Date.UTC memetakan tahun 0-99 ke 1900-an, jadi tahunnya disetel ulang
  // dulu sebelum dibandingkan.
  dibuat.setUTCFullYear(tahun);
  return (
    dibuat.getUTCFullYear() === tahun &&
    dibuat.getUTCMonth() === bulan - 1 &&
    dibuat.getUTCDate() === hari
  );
}

const tanggal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus dalam bentuk 2026-06-30.")
  .refine(adaDiKalender, "Tanggal itu tidak ada di kalender.");

/**
 * Jam harus berada di rentang 00:00-23:59:59. Regex saja meloloskan 25:99,
 * yang ditolak kolom `time` Postgres dan berubah jadi 500, bukan 422.
 */
function jamSah(teks: string): boolean {
  const [h, m, s = 0] = teks.split(":").map(Number);
  return h <= 23 && m <= 59 && s <= 59;
}

const jam = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Jam harus dalam bentuk 07:00.")
  .refine(jamSah, "Jam harus antara 00:00 dan 23:59.");

const teksWajib = (nama: string, maks = 120) =>
  z.string().trim().min(1, `${nama} belum diisi.`).max(maks, `${nama} terlalu panjang.`);

const teksOpsional = (maks = 500) =>
  z
    .string()
    .trim()
    .max(maks, `Teks terlalu panjang, maksimal ${maks} huruf.`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

/** Uang selalu integer rupiah. Tidak pernah desimal, tidak pernah float. */
const uang = z
  .coerce.number()
  .int("Jumlah harus angka bulat, tanpa desimal.")
  .min(0, "Jumlah tidak boleh kurang dari nol.")
  .max(100_000_000_000, "Jumlah terlalu besar.");

export const skemaPlanBaru = z.object({
  partnerName: teksWajib("Nama pasangan", 80),
  weddingDate: tanggal.optional().nullable(),
  notes: teksOpsional(1000),
});

export const skemaPlanUbah = z.object({
  partnerName: teksWajib("Nama pasangan", 80).optional(),
  weddingDate: tanggal.optional().nullable(),
  isDayOfDate: tanggal.optional().nullable(),
  status: z.enum(STATUS_PLAN).optional(),
  notes: teksOpsional(1000),
});

export const skemaMilestone = z.object({
  title: teksWajib("Nama tanggal", 120),
  eventDate: tanggal,
  eventTime: jam.optional().nullable(),
  type: z.enum(JENIS_TANGGAL).default("lainnya"),
  isDayOf: z.coerce.boolean().default(false),
  notes: teksOpsional(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const skemaMilestoneUbah = skemaMilestone.partial();

export const skemaTugas = z.object({
  title: teksWajib("Nama tugas", 160),
  category: z.enum(KATEGORI_TUGAS).default("Pelengkap"),
  dueDate: tanggal.optional().nullable(),
  status: z.enum(["belum", "selesai"]).default("belum"),
  priority: z.enum(PRIORITAS).default("sedang"),
  assignee: z.enum(PENUGASAN).optional().nullable(),
  budgetItemId: z.string().uuid().optional().nullable(),
  notes: teksOpsional(1000),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const skemaTugasUbah = skemaTugas.partial();

export const skemaPosAnggaran = z.object({
  name: teksWajib("Nama pos", 120),
  category: z.enum(KATEGORI_UANG).default("lainnya"),
  plannedAmount: uang.default(0),
  notes: teksOpsional(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const skemaPosAnggaranUbah = skemaPosAnggaran.partial();

export const skemaVendor = z.object({
  name: teksWajib("Nama vendor", 120),
  category: z.enum(KATEGORI_UANG).default("lainnya"),
  budgetItemId: z.string().uuid().optional().nullable(),
  contactName: teksOpsional(80),
  phone: z
    .string()
    .trim()
    .max(24, "Nomor telepon terlalu panjang.")
    .optional()
    .nullable()
    .transform((v) => (v ? v.replace(/[^\d+]/g, "") : null)),
  address: teksOpsional(240),
  status: z.enum(STATUS_VENDOR).default("calon"),
  notes: teksOpsional(1000),
});

export const skemaVendorUbah = skemaVendor.partial();

export const skemaPembayaran = z.object({
  amount: uang.refine((v) => v > 0, "Jumlah pembayaran belum diisi."),
  paidAt: tanggal,
  method: z.enum(METODE_BAYAR).default("transfer"),
  isFinal: z.coerce.boolean().default(false),
  notes: teksOpsional(500),
});

export const skemaPembayaranUbah = skemaPembayaran.partial();

export const skemaTamu = z.object({
  name: teksWajib("Nama tamu", 120),
  phone: teksOpsional(24),
  category: z.enum(KATEGORI_TAMU).default("lainnya"),
  side: teksOpsional(40),
  rsvpStatus: z.enum(STATUS_HADIR).default("belum"),
  guestCount: z.coerce
    .number()
    .int("Jumlah orang harus angka bulat.")
    .min(0, "Jumlah orang tidak boleh kurang dari nol.")
    .max(50, "Maksimal 50 orang per baris.")
    .default(1),
  tableName: teksOpsional(40),
  notes: teksOpsional(500),
});

export const skemaTamuUbah = skemaTamu.partial();

export const skemaImporTamu = z.object({
  teks: z.string().trim().min(1, "Tempel dulu daftar namanya.").max(20_000, "Terlalu banyak teks sekaligus."),
  category: z.enum(KATEGORI_TAMU).default("lainnya"),
});

export const skemaRundown = z.object({
  title: teksWajib("Nama acara", 120),
  startTime: jam,
  durationMinutes: z.coerce
    .number()
    .int()
    .min(1, "Durasi minimal 1 menit.")
    .max(1440, "Durasi maksimal 24 jam.")
    .default(15),
  location: teksOpsional(120),
  picName: teksOpsional(80),
  notes: teksOpsional(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const skemaRundownUbah = skemaRundown.partial();

export const skemaPengumuman = z.object({
  title: teksWajib("Judul pengumuman", 160),
  body: teksWajib("Isi pengumuman", 2000),
  audience: z.enum(AUIDENS).default("semua"),
  isPinned: z.coerce.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
});

export const skemaPengumumanUbah = skemaPengumuman.partial();

export const skemaBusana = z.object({
  itemName: teksWajib("Nama barang", 120),
  owner: z.enum(PEMILIK_BUSANA).default("pengantinWanita"),
  status: z.enum(STATUS_BUSANA).default("belum"),
  measureDate: tanggal.optional().nullable(),
  pickupDate: tanggal.optional().nullable(),
  estimatedCost: uang.optional().nullable(),
  notes: teksOpsional(500),
});

export const skemaBusanaUbah = skemaBusana.partial();

export const skemaBagikanTeks = z.object({
  jenis: z.enum(["ringkas", "lengkap", "tautan"]),
  pesanTambahan: z
    .string()
    .trim()
    .max(400, "Pesan tambahan maksimal 400 huruf.")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

export const skemaTautan = z.object({
  label: teksWajib("Nama tautan", 40),
  target: z.enum(["keluarga", "crew", "tamu", "laporan"]).default("keluarga"),
});
