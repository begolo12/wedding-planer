import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Better Auth menangani semua endpoint di bawah /api/auth sendiri.
// Tidak ada handler tulis sendiri di sini supaya bentuk response tetap
// sama dengan yang diharapkan pustakanya. `auth.handler` adalah fungsi yang
// sama dengan yang dipakai `toNextJsHandler` untuk GET dan POST.

/**
 * Batas laju bawaan Better Auth membalas 429 dengan badan
 * `{ "message": "..." }` dan tanpa `code`. docs/04-API-Contract.md menulis
 * satu bentuk galat untuk semua endpoint, jadi badan 429 itu diterjemahkan
 * di sini, bukan dibiarkan jadi bentuk kedua yang harus ditebak client.
 * Header `X-Retry-After` dari pustakanya tetap diteruskan apa adanya.
 */
async function denganBentukGalat(req: Request): Promise<Response> {
  const res = await auth.handler(req);

  if (res.status !== 429) return res;

  const retryAfter = res.headers.get("X-Retry-After");
  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Terlalu banyak percobaan. Coba lagi sebentar lagi.",
      },
    },
    {
      status: 429,
      headers: retryAfter ? { "X-Retry-After": retryAfter } : undefined,
    },
  );
}

export const GET = denganBentukGalat;
export const POST = denganBentukGalat;
