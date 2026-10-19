import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Bentuk galat selalu sama, jadi layar cukup punya satu cara membaca galat.
// Bentuknya dari docs/04-API-Contract.md bagian 2.

export type KodeGalat =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "LIMIT_REACHED"
  | "INTERNAL_ERROR"
  // Dilempar Service Worker, bukan route handler: jaringan putus, tulisannya
  // diantrekan di perangkat. Lihat src/lib/api-client.ts.
  | "LURING";

const STATUS: Record<KodeGalat, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  LIMIT_REACHED: 429,
  INTERNAL_ERROR: 500,
  LURING: 503,
};

/** Bagian permintaan yang ikut dicatat saat galat tak terduga terjadi. */
export type KonteksGalat = {
  metode: string | null;
  jalur: string | null;
  mulai: number;
};

/**
 * Rujukan pendek untuk satu galat tak terduga.
 *
 * Delapan huruf, bukan UUID penuh, karena angkanya akan dibaca orang lewat
 * telepon atau tangkapan layar. Peluang dua galat bertabrakan dalam satu
 * minggu sangat kecil, dan yang dibutuhkan hanya kecocokan dengan satu baris
 * log.
 */
function rujukanGalat(): string {
  return Math.random().toString(16).slice(2, 10);
}

/** Galat yang sengaja dilempar aplikasi dan sudah punya pesan bahasa Indonesia. */
export class GalatAplikasi extends Error {
  kode: KodeGalat;
  fields?: Record<string, string>;
  /**
   * Berapa detik lagi boleh mencoba, kalau galatnya batas laju. Dikirim juga
   * sebagai header `X-Retry-After` supaya client bisa menunggu tanpa menebak.
   */
  retryAfter?: number;

  constructor(
    kode: KodeGalat,
    message: string,
    fields?: Record<string, string>,
    retryAfter?: number,
  ) {
    super(message);
    this.name = "GalatAplikasi";
    this.kode = kode;
    this.fields = fields;
    this.retryAfter = retryAfter;
  }
}

export const belumMasuk = () =>
  new GalatAplikasi("UNAUTHENTICATED", "Kamu perlu masuk dulu.");
export const tidakPunyaAkses = () =>
  new GalatAplikasi("FORBIDDEN", "Rencana ini bukan milikmu.");
export const tidakDitemukan = (apa = "Data") =>
  new GalatAplikasi("NOT_FOUND", `${apa} tidak ditemukan.`);
export const tidakValid = (message: string, fields?: Record<string, string>) =>
  new GalatAplikasi("VALIDATION_ERROR", message, fields);

const POLA_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Id yang datang dari path harus UUID yang sah. Nilai lain tidak mungkin ada
 * di database, jadi langsung dijawab NOT_FOUND. Tanpa pemeriksaan ini, id
 * seperti "undefined" atau 36 tanda hubung sampai ke Postgres sebagai uuid
 * dan berubah jadi 500 INTERNAL_ERROR, padahal kontrak mensyaratkan 404.
 */
export function idUuid(nilai: string, apa = "Data"): string {
  if (!POLA_UUID.test(nilai)) throw tidakDitemukan(apa);
  return nilai;
}

function dariZod(err: ZodError): GalatAplikasi {
  const fields: Record<string, string> = {};
  for (const isu of err.issues) {
    const kunci = isu.path.join(".") || "umum";
    if (!fields[kunci]) fields[kunci] = isu.message;
  }
  const pertama = Object.values(fields)[0] ?? "Ada isian yang belum benar.";
  return new GalatAplikasi("VALIDATION_ERROR", pertama, fields);
}

/** Ubah galat apa pun jadi response dengan bentuk yang sama. */
export function balasGalat(err: unknown, konteks?: KonteksGalat) {
  if (err instanceof GalatAplikasi) {
    // Batas laju menyertakan sisa waktunya, jadi client tidak perlu menebak.
    const headers = err.retryAfter ? { "X-Retry-After": String(err.retryAfter) } : undefined;
    return NextResponse.json(
      { error: { code: err.kode, message: err.message, ...(err.fields ? { fields: err.fields } : {}) } },
      { status: STATUS[err.kode], headers },
    );
  }

  if (err instanceof ZodError) {
    const g = dariZod(err);
    return NextResponse.json(
      { error: { code: g.kode, message: g.message, fields: g.fields } },
      { status: STATUS[g.kode] },
    );
  }

  // Galat yang tidak dikenal berarti ada yang salah di sisi kami, dan
  // pengguna tidak bisa memperbaikinya. Yang bisa dilakukan pengguna hanya
  // melaporkannya, jadi balasan ini membawa satu rujukan pendek yang juga
  // dicatat di log. Tanpa itu, laporan "aplikasinya error" tidak bisa
  // dicocokkan dengan satu baris log pun.
  const ref = rujukanGalat();
  const status = STATUS.INTERNAL_ERROR;

  console.error(
    JSON.stringify({
      level: "error",
      waktu: new Date().toISOString(),
      ref,
      kode: "INTERNAL_ERROR",
      status,
      metode: konteks?.metode ?? null,
      jalur: konteks?.jalur ?? null,
      durasiMs: konteks ? Math.round(performance.now() - konteks.mulai) : null,
      pesan: err instanceof Error ? err.message : String(err),
      nama: err instanceof Error ? err.name : typeof err,
    }),
  );

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ada masalah di server. Coba lagi sebentar.",
        ref,
      },
    },
    { status, headers: { "X-Galat-Ref": ref } },
  );
}

/** Bungkus handler supaya tiap route tidak menulis try/catch sendiri. */
export function bungkus<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
) {
  return async (...args: A): Promise<Response> => {
    const mulai = performance.now();
    const req = args[0];
    const konteks: KonteksGalat =
      req instanceof Request
        ? { metode: req.method, jalur: new URL(req.url).pathname, mulai }
        : { metode: null, jalur: null, mulai };

    try {
      return await handler(...args);
    } catch (err) {
      return balasGalat(err, konteks);
    }
  };
}

/** Body JSON. Body kosong dianggap objek kosong, bukan galat. */
export async function bacaJson(req: Request): Promise<unknown> {
  try {
    const teks = await req.text();
    if (!teks.trim()) return {};
    return JSON.parse(teks);
  } catch {
    throw tidakValid("Isi permintaan bukan JSON yang benar.");
  }
}
