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

/** Galat yang sengaja dilempar aplikasi dan sudah punya pesan bahasa Indonesia. */
export class GalatAplikasi extends Error {
  kode: KodeGalat;
  fields?: Record<string, string>;

  constructor(kode: KodeGalat, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "GalatAplikasi";
    this.kode = kode;
    this.fields = fields;
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
export function balasGalat(err: unknown) {
  if (err instanceof GalatAplikasi) {
    return NextResponse.json(
      { error: { code: err.kode, message: err.message, ...(err.fields ? { fields: err.fields } : {}) } },
      { status: STATUS[err.kode] },
    );
  }

  if (err instanceof ZodError) {
    const g = dariZod(err);
    return NextResponse.json(
      { error: { code: g.kode, message: g.message, fields: g.fields } },
      { status: STATUS[g.kode] },
    );
  }

  console.error("[api] galat tak terduga:", err);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ada masalah di server. Coba lagi sebentar.",
      },
    },
    { status: 500 },
  );
}

/** Bungkus handler supaya tiap route tidak menulis try/catch sendiri. */
export function bungkus<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      return balasGalat(err);
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
