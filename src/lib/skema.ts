import { z } from "zod";
import {
  AUIDENS,
  BATAS_PESAN_TAMBAHAN,
  JENIS_TANGGAL,
  KATEGORI_TAMU,
  KATEGORI_TUGAS,
  KATEGORI_UANG,
  METODE_BAYAR,
  PEMILIK_BUSANA,
  PENUGASAN,
  PRIORITAS,
  SISI_TAMU,
  STATUS_BUSANA,
  STATUS_HADIR,
  STATUS_PLAN,
  STATUS_VENDOR,
} from "./konstanta";
import { normalkanNomorWa } from "./format";

// Semua bentuk isian ditulis di satu berkas. Layar dan API membaca dari sini,
// jadi aturan tidak bisa berbeda antara form di layar dan pemeriksaan di server.

/**
 * Tanggal harus benar-benar ada di kalender, bukan cuma berbentuk benar.
 * Regex saja meloloskan 2026-02-30 dan 2026-13-45; nilai itu ditolak kolom
 * `date` Postgres dan berubah jadi 500, padahal kontrak mensyaratkan 422.
 */
function adaDiKalender(teks: string): boolean {
  const [tahun, bulan, hari] = teks.split("-").map(Number);
  // Postgres tidak mengenal tahun 0000 (kalendernya langsung dari 1 SM ke 1 M),
  // jadi 0000-01-01 ditolak di sini supaya jawabannya 422, bukan 500.
  if (tahun < 1 || bulan < 1 || bulan > 12 || hari < 1) return false;
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

/**
 * Nomor WhatsApp, dipakai tamu dan vendor dari satu tempat.
 *
 * Normalisasi ada di sini, bukan di route, supaya skema dan penyimpanan tidak
 * punya dua aturan yang bisa berbeda. Bentuk yang diterima dinormalkan ke 628xx
 * (langsung siap untuk wa.me); kosong berarti tidak ada nomor; terisi tetapi
 * tidak dikenali ditolak dengan pesan yang bisa dibaca, bukan disimpan lalu
 * gagal saat undangan dikirim.
 */
const nomorWa = z
  .string()
  .trim()
  .max(24, "Nomor telepon terlalu panjang.")
  .optional()
  .nullable()
  .transform((v) => (v ? v : null))
  .refine(
    (v) => v === null || normalkanNomorWa(v) !== null,
    "Nomor WhatsApp tidak dikenali. Tulis 08xx atau +62 8xx.",
  )
  .transform((v) => (v ? normalkanNomorWa(v) : null));

/**
 * Sisi tamu, hanya tiga nilai dari docs/02b. Nilai lain ditolak 422 di sini,
 * bukan disimpan sebagai teks bebas. String kosong berarti belum diisi.
 */
const sisiTamu = z
  .union([z.enum(SISI_TAMU), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v ? v : null));

/**
 * Tautan undangan digital per acara. Hanya http dan https, karena tautan ini
 * dibuka orang lain dan skema seperti `javascript:` berbahaya.
 */
const tautanUndangan = z
  .union([z.string(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v ? v.trim() : null))
  .refine(
    (v) => v === null || /^https?:\/\//i.test(v),
    "Tautan undangan harus dimulai dengan http:// atau https://.",
  )
  .refine((v) => v === null || v.length <= 500, "Tautan undangan terlalu panjang.");

/**
 * Nilai benar atau salah dari JSON.
 *
 * `z.coerce.boolean()` tidak dipakai karena `Boolean("false")` bernilai true,
 * jadi client yang mengirim `{"isFinal":"false"}` diam-diam mencatat
 * pembayaran sebagai pelunasan. String yang jelas dibaca apa adanya, angka 1
 * dan 0 diterima karena form lama mengirim keduanya. Transform dipasang
 * sebelum `default()` supaya `removeDefault()` bisa membuang bawaannya untuk
 * skema PATCH di `untukUbah`.
 */
export const bendera = (bawaan = false) =>
  z
    .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
    .transform((v) => (typeof v === "boolean" ? v : v === "true" || v === "1"))
    .default(bawaan);

/**
 * Semua field jadi opsional tanpa nilai bawaan, untuk PATCH.
 *
 * `.partial()` bawaan Zod tidak dipakai karena di Zod 4 `.optional()` tidak
 * mematikan `.default()`: field yang tidak dikirim tetap muncul terisi nilai
 * bawaan, lalu route mengirimnya ke UPDATE dan menimpa kolom yang sebenarnya
 * tidak diubah. Contoh nyatanya: mengubah nama tamu ikut mereset status
 * kehadiran dan jumlah orangnya, dan mengubah judul tugas ikut mereset
 * prioritasnya. Body yang kosong pun ditolak 422, bukan jadi UPDATE tanpa
 * kolom yang bikin 500.
 */
function untukUbah<T extends z.ZodObject<z.ZodRawShape>>(
  skema: T,
): z.ZodType<Partial<z.infer<T>>> {
  const bentuk: Record<string, z.ZodType> = {};
  for (const [nama, field] of Object.entries(skema.shape)) {
    const dasar = field as unknown as {
      removeDefault?: () => z.ZodType;
      optional: () => z.ZodType;
    };
    const tanpaBawaan =
      typeof dasar.removeDefault === "function" ? dasar.removeDefault() : (field as unknown as z.ZodType);
    bentuk[nama] = tanpaBawaan.optional();
  }
  return z
    .object(bentuk as z.ZodRawShape)
    .refine((v) => Object.keys(v).length > 0, "Tidak ada yang diubah.") as unknown as z.ZodType<
    Partial<z.infer<T>>
  >;
}

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
  isDayOf: bendera(),
  invitationUrl: tautanUndangan,
  notes: teksOpsional(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const skemaMilestoneUbah = untukUbah(skemaMilestone);

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

export const skemaTugasUbah = untukUbah(skemaTugas);

export const skemaPosAnggaran = z.object({
  name: teksWajib("Nama pos", 120),
  category: z.enum(KATEGORI_UANG).default("lainnya"),
  plannedAmount: uang.default(0),
  notes: teksOpsional(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const skemaPosAnggaranUbah = untukUbah(skemaPosAnggaran);

export const skemaVendor = z.object({
  name: teksWajib("Nama vendor", 120),
  category: z.enum(KATEGORI_UANG).default("lainnya"),
  budgetItemId: z.string().uuid().optional().nullable(),
  contactName: teksOpsional(80),
  phone: nomorWa,
  address: teksOpsional(240),
  status: z.enum(STATUS_VENDOR).default("calon"),
  notes: teksOpsional(1000),
});

export const skemaVendorUbah = untukUbah(skemaVendor);

export const skemaPembayaran = z.object({
  amount: uang.refine((v) => v > 0, "Jumlah pembayaran belum diisi."),
  paidAt: tanggal,
  method: z.enum(METODE_BAYAR).default("transfer"),
  isFinal: bendera(),
  notes: teksOpsional(500),
});

export const skemaPembayaranUbah = untukUbah(skemaPembayaran);

export const skemaTamu = z.object({
  name: teksWajib("Nama tamu", 120),
  phone: nomorWa,
  category: z.enum(KATEGORI_TAMU).default("lainnya"),
  side: sisiTamu,
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

export const skemaTamuUbah = untukUbah(skemaTamu);

export const skemaImporTamu = z.object({
  teks: z.string().trim().min(1, "Tempel dulu daftar namanya.").max(20_000, "Terlalu banyak teks sekaligus."),
  category: z.enum(KATEGORI_TAMU).default("lainnya"),
});

/**
 * Body POST /api/plans/{planId}/guests/undangan. Salah satu dari `ids` atau
 * `semua` harus diisi; body tanpa keduanya tidak menandai apa pun dan
 * jawabannya akan menyesatkan.
 */
export const skemaTandaiUndangan = z
  .object({
    ids: z
      .array(z.string().uuid("Id tamu tidak dikenal."))
      .max(500, "Paling banyak 500 tamu sekali kirim.")
      .optional(),
    semua: bendera(),
  })
  .refine((v) => v.semua || Boolean(v.ids && v.ids.length > 0), {
    message: "Pilih tamu yang ditandai, atau tandai semua.",
    path: ["ids"],
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

export const skemaRundownUbah = untukUbah(skemaRundown);

export const skemaPengumuman = z.object({
  title: teksWajib("Judul pengumuman", 160),
  body: teksWajib("Isi pengumuman", 2000),
  audience: z.enum(AUIDENS).default("semua"),
  isPinned: bendera(),
  publishedAt: z.coerce.date().optional().nullable(),
});

// `publishedAt` sengaja tidak bisa diubah lewat PATCH; penerbitan punya
// endpoint sendiri di skemaTerbitPengumuman. Kalau ikut di sini, body yang
// cuma berisi publishedAt lolos validasi tapi tidak ada kolom yang ditulis,
// dan UPDATE tanpa kolom berakhir jadi galat database 500.
export const skemaPengumumanUbah = untukUbah(skemaPengumuman.omit({ publishedAt: true }));

export const skemaBusana = z.object({
  itemName: teksWajib("Nama barang", 120),
  owner: z.enum(PEMILIK_BUSANA).default("pengantinWanita"),
  status: z.enum(STATUS_BUSANA).default("belum"),
  measureDate: tanggal.optional().nullable(),
  pickupDate: tanggal.optional().nullable(),
  estimatedCost: uang.optional().nullable(),
  notes: teksOpsional(500),
});

export const skemaBusanaUbah = untukUbah(skemaBusana);

/**
 * Body POST /api/plans/{id}/report/share-text.
 *
 * Nama field mengikuti kontrak di docs/04-API-Contract.md (`variant`,
 * `message`, `linkId`), sama dengan yang dikirim layar Laporan. Sebelumnya
 * route ini punya type `Body` sendiri yang menerima dua nama untuk satu field
 * (`variant` dan `jenis`), dan nilainya di-cast langsung tanpa diperiksa.
 * Sekarang satu nama, dan isinya diperiksa di sini.
 */
export const skemaBagikanTeks = z.object({
  variant: z.enum(["ringkas", "lengkap", "tautan"]),
  message: z
    .string()
    .trim()
    .max(BATAS_PESAN_TAMBAHAN, `Pesan tambahan maksimal ${BATAS_PESAN_TAMBAHAN} huruf.`)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  // Tautan yang ikut dikirim. Bentuknya diperiksa di sini, kepemilikannya
  // diperiksa route lewat filter planId.
  linkId: z.string().uuid("Tautan yang dipilih tidak dikenal.").optional().nullable(),
});

/**
 * Body PATCH /api/plans/{id}/announcements: terbitkan banyak pengumuman
 * sekaligus. Salah satu dari `audience` atau `publishAll` harus diisi, kalau
 * tidak tidak ada yang diterbitkan dan jawabannya menyesatkan.
 */
export const skemaTerbitPengumuman = z
  .object({
    audience: z.enum(AUIDENS).optional(),
    publishAll: bendera(),
  })
  .refine((v) => Boolean(v.audience) || v.publishAll, {
    message: "Pilih audien atau terbitkan semua.",
    path: ["audience"],
  });

/**
 * Body POST /api/plans/{id}/announcements/{id}/share.
 *
 * `rotate` menentukan kunci lama dibuang dan diganti. Nilainya harus benar
 * benar boolean; kalau tidak, string apa pun yang dikirim client akan
 * mematikan tautan yang sudah disebar ke keluarga.
 */
export const skemaBagikanPengumuman = z.object({
  rotate: bendera(),
});

export const skemaTautan = z.object({
  label: teksWajib("Nama tautan", 40),
  target: z.enum(["keluarga", "crew", "tamu", "laporan"]).default("keluarga"),
});
