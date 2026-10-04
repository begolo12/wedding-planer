"use client";

import type { KodeGalat } from "./galat";
import { simpanKeAntrean } from "./luring";
import { ambilBaca, bolehDicache, simpanBaca } from "./cache-baca";
import { catatSumberData, statusLuring } from "./status-luring";

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

const PESAN_ANTRE = "Tidak ada koneksi. Perubahan disimpan dan dikirim nanti.";
const PESAN_UMUM = "Ada yang tidak beres. Coba lagi sebentar.";

type GalatServer = { code: KodeGalat; message: string; fields?: Record<string, string> };

/**
 * Baca bentuk galat server dari isi yang belum dipercaya. Dibaca dengan
 * pemeriksaan tipe, bukan dengan cast ke bentuk yang diandaikan benar.
 */
function bacaGalat(isi: unknown): GalatServer | null {
  if (!isi || typeof isi !== "object" || !("error" in isi)) return null;
  const e = isi.error;
  if (!e || typeof e !== "object") return null;
  if (!("code" in e) || typeof e.code !== "string") return null;

  const message =
    "message" in e && typeof e.message === "string" ? e.message : PESAN_UMUM;

  let fields: Record<string, string> | undefined;
  if ("fields" in e && e.fields && typeof e.fields === "object") {
    fields = {};
    for (const [kunci, nilai] of Object.entries(e.fields)) {
      if (typeof nilai === "string") fields[kunci] = nilai;
    }
  }

  // Kode datang dari server sendiri. Nilai yang tidak dikenal tetap dibawa
  // apa adanya; layar hanya membandingkannya dengan daftar KodeGalat.
  return { code: e.code as KodeGalat, message, fields };
}

export async function minta<T>(
  url: string,
  opsi: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const { method = "GET", body, signal } = opsi;
  const badan = body === undefined ? null : JSON.stringify(body);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: badan ?? undefined,
      credentials: "same-origin",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // Tanpa respons sama sekali. Ini terjadi saat service worker belum
    // mengontrol halaman, jadi tidak ada balasan 503 LURING yang bisa dibaca.
    // Tulis tetap diantrekan supaya tidak hilang; baca dicoba dari cadangan.
    return tanpaRespons<T>(url, method, badan);
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
    const galat = bacaGalat(isi);
    const kode = galat?.code ?? "INTERNAL_ERROR";

    // Service Worker membalas 503 "LURING" saat jaringan putus.
    if (kode === "LURING") {
      // Tulis masuk antrean luring supaya tidak hilang dan terkirim saat
      // sinyal kembali. Baca tidak diantrekan: datanya diambil dari cadangan.
      if (method !== "GET") {
        await simpanKeAntrean(method, url, badan);
        throw {
          kode,
          pesan: galat?.message ?? PESAN_ANTRE,
          fields: galat?.fields,
        } satisfies GalatApi;
      }

      const cadangan = await pakaiCadangan<T>(url);
      if (cadangan !== null) return cadangan;
    }

    throw {
      kode,
      pesan: galat?.message ?? PESAN_UMUM,
      fields: galat?.fields,
    } satisfies GalatApi;
  }

  // Baca yang berhasil dari server disalin ke cadangan perangkat.
  //
  // Penanda "dari perangkat" hanya dimatikan kalau penjaga koneksi sudah
  // bilang daring. Alasannya: satu layar membaca beberapa endpoint, dan satu
  // GET yang berhasil saat perangkat masih luring tidak boleh membalik
  // penanda, karena data yang tampil di bagian lain layar masih dari
  // cadangan. Kalau dibalik, tombol tambah/ubah muncul padahal menekannya
  // akan gagal.
  if (method === "GET") {
    if (!statusLuring().luring) catatSumberData(false);
    await simpanBaca(url, isi);
  }

  return isi as T;
}

/** Baca dari cadangan perangkat, atau null kalau tidak ada. */
async function pakaiCadangan<T>(url: string): Promise<T | null> {
  if (!bolehDicache(url)) return null;
  const isi = await ambilBaca(url);
  if (isi === null) return null;
  catatSumberData(true);
  return isi as T;
}

async function tanpaRespons<T>(url: string, method: string, body: string | null): Promise<T> {
  if (method !== "GET") {
    await simpanKeAntrean(method, url, body);
    throw { kode: "LURING", pesan: PESAN_ANTRE } satisfies GalatApi;
  }
  const cadangan = await pakaiCadangan<T>(url);
  if (cadangan !== null) return cadangan;
  throw new GalatJaringan();
}

/** Ubah galat apa pun jadi satu kalimat yang bisa ditampilkan di layar. */
export function pesanGalat(err: unknown): string {
  if (err instanceof GalatJaringan) return err.message;
  if (err && typeof err === "object" && "pesan" in err && typeof err.pesan === "string") {
    return err.pesan;
  }
  return PESAN_UMUM;
}
