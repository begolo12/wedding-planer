"use client";

import type { KodeGalat } from "./galat";

/**
 * Satu tempat membaca galat API, supaya setiap layar menampilkan pesan
 * dengan bentuk yang sama. Bentuk galatnya dari docs/04-API-Contract.md.
 */
export type GalatApi = {
  kode: KodeGalat;
  pesan: string;
  fields?: Record<string, string>;
};

/** Galat jaringan dipisah dari galat server, karena penanganannya berbeda. */
export class GalatJaringan extends Error {
  constructor(pesan = "Tidak ada koneksi. Coba lagi nanti.") {
    super(pesan);
    this.name = "GalatJaringan";
  }
}

export async function minta<T>(
  url: string,
  opsi: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const { method = "GET", body, signal } = opsi;

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new GalatJaringan();
  }

  if (res.status === 204) return undefined as T;

  const teks = await res.text();
  let isi: unknown = null;
  if (teks) {
    try {
      isi = JSON.parse(teks);
    } catch {
      isi = null;
    }
  }

  if (!res.ok) {
    const e = (isi as { error?: { code: KodeGalat; message: string; fields?: Record<string, string> } })
      ?.error;
    const kode = e?.code ?? "INTERNAL_ERROR";

    // Service Worker membalas 503 "LURING" saat jaringan putus. Tulis yang
    // gagal masuk antrean luring supaya tidak hilang dan terkirim saat sinyal
    // kembali. Baca (GET) tidak diantrekan: datanya bisa dimuat ulang.
    if (kode === "LURING" && method !== "GET") {
      const { simpanKeAntrean } = await import("./luring");
      await simpanKeAntrean(method, url, body === undefined ? null : JSON.stringify(body));
    }

    throw {
      kode,
      pesan: e?.message ?? "Ada yang tidak beres. Coba lagi sebentar.",
      fields: e?.fields,
    } satisfies GalatApi;
  }

  return isi as T;
}

/** Ubah galat apa pun jadi satu kalimat yang bisa ditampilkan di layar. */
export function pesanGalat(err: unknown): string {
  if (err instanceof GalatJaringan) return err.message;
  if (err && typeof err === "object" && "pesan" in err) {
    return String((err as GalatApi).pesan);
  }
  return "Ada yang tidak beres. Coba lagi sebentar.";
}
