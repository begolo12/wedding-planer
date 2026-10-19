import { NextResponse } from "next/server";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { idempotencyKeys } from "@/db/schema";
import { GalatAplikasi } from "@/lib/galat";

/**
 * Kiriman ulang dari antrean luring.
 *
 * Antrean luring di perangkat bisa mengirim perubahan yang sama lebih dari
 * sekali: dua tab mengirim bersamaan, atau tab ditutup setelah server
 * memproses tapi sebelum antrean lokalnya terhapus. Tanpa penjagaan di sini,
 * tiap kiriman ulang menambah satu baris, dan catatan pembayaran yang dobel
 * lebih buruk daripada gagal terkirim.
 *
 * Client mengirim header `Idempotency-Key` berisi id item antreannya. Server
 * mengklaim kunci itu lebih dulu, menjalankan handler sekali, lalu menyimpan
 * balasannya. Kiriman berikutnya dengan kunci sama mendapat balasan yang sama
 * tanpa menjalankan handler lagi.
 *
 * Klaimnya atomik. Sebelum ini pengecekannya "baca dulu, tulis kemudian", dan
 * dua permintaan berkunci sama yang tiba hampir bersamaan sama-sama lolos
 * pengecekan lalu sama-sama menulis baris data. Sekarang yang menentukan siapa
 * boleh menulis adalah `insert ... on conflict do nothing returning`: hanya
 * satu permintaan yang mendapat baris klaim, sisanya menunggu.
 *
 * Batas kadaluarsa tidak dipakai. Baris kunci menumpuk sedikit (satu per
 * perubahan luring, bukan satu per permintaan) dan ikut terhapus saat
 * rencananya dihapus lewat cascade. Klaim yang ditinggalkan proses yang mati
 * diambil alih setelah satu menit, supaya kunci tidak macet selamanya.
 */

export const HEADER_KUNCI = "idempotency-key";

/** Panjang maksimum kunci dari header. UUID dari perangkat 36 karakter. */
const MAKS_KUNCI = 100;

/** Pola kunci yang diterima: huruf, angka, tanda hubung, garis bawah, titik. */
const POLA_KUNCI = /^[A-Za-z0-9._-]+$/;

/**
 * Status penanda klaim yang sedang diproses. Status HTTP yang sah selalu >= 200,
 * jadi 0 tidak mungkin bentrok dengan balasan sungguhan.
 */
const SEDANG_DIPROSES = 0;

/** Umur klaim yang dianggap ditinggalkan proses yang mati, dalam milidetik. */
const UMUR_KLAIM_BASI_MS = 60_000;

/** Berapa lama menunggu klaim lain selesai sebelum menyerah. */
const BATAS_TUNGGU_MS = 5_000;
const JEDA_TUNGGU_MS = 50;

type BarisKunci = { status: number; body: string };

function tunggu(ms: number): Promise<void> {
  return new Promise((selesai) => setTimeout(selesai, ms));
}

/**
 * Balasan tersimpan. Status tanpa body (204, 205, 304) tidak boleh membawa
 * body menurut spesifikasi Fetch; sebelum ini body kosong tetap dikirim ke
 * `new NextResponse`, dan konstruktornya melempar lalu berubah jadi 500.
 */
function balasTersimpan(baris: BarisKunci): NextResponse {
  const tanpaBody = baris.status === 204 || baris.status === 205 || baris.status === 304;
  return new NextResponse(tanpaBody ? null : baris.body, {
    status: baris.status,
    headers: { "Content-Type": "application/json", "X-Idempotent-Replay": "ya" },
  });
}

/** Baris kunci yang sudah selesai, atau null kalau belum ada atau masih diproses. */
async function barisSelesai(kunci: string, planId: string): Promise<BarisKunci | null> {
  const [ada] = await db
    .select({ status: idempotencyKeys.status, body: idempotencyKeys.body })
    .from(idempotencyKeys)
    .where(and(eq(idempotencyKeys.key, kunci), eq(idempotencyKeys.planId, planId)))
    .limit(1);
  if (!ada || ada.status === SEDANG_DIPROSES) return null;
  return ada;
}

/**
 * Jalankan handler, tapi hanya sekali per kunci.
 *
 * Kunci yang tidak dikirim atau tidak sah berarti permintaan biasa: handler
 * jalan seperti sebelumnya. Ini disengaja supaya endpoint tetap bisa dipakai
 * tanpa header, dan supaya kunci yang aneh tidak menolak permintaan yang sah.
 *
 * @param planId rencana yang sedang ditulis, dipakai untuk cascade dan audit
 * @param kunci nilai header `Idempotency-Key`, kalau ada
 * @param jalan handler yang benar-benar menulis
 */
export async function sekaliPerKunci(
  planId: string,
  kunci: string | null,
  jalan: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const bersih = kunci?.trim() ?? "";
  if (!bersih || bersih.length > MAKS_KUNCI || !POLA_KUNCI.test(bersih)) {
    return jalan();
  }

  const klaim = () =>
    db
      .insert(idempotencyKeys)
      .values({ key: bersih, planId, status: SEDANG_DIPROSES, body: "" })
      .onConflictDoNothing()
      .returning({ key: idempotencyKeys.key });

  // Insert klaim yang menentukan siapa yang boleh menulis. Yang kalah tidak
  // menjalankan handler, jadi tidak ada baris data dobel.
  let dapat = await klaim();

  if (dapat.length === 0) {
    const sudah = await barisSelesai(bersih, planId);
    if (sudah) return balasTersimpan(sudah);

    // Permintaan lain sedang memproses kunci ini. Tunggu sebentar.
    const mulai = Date.now();
    while (Date.now() - mulai < BATAS_TUNGGU_MS) {
      await tunggu(JEDA_TUNGGU_MS);
      const tersimpan = await barisSelesai(bersih, planId);
      if (tersimpan) return balasTersimpan(tersimpan);
    }

    // Klaim basi: pemiliknya mungkin mati di tengah jalan. Buang yang basi,
    // lalu coba klaim lagi sekali.
    await db.delete(idempotencyKeys).where(
      and(
        eq(idempotencyKeys.key, bersih),
        eq(idempotencyKeys.planId, planId),
        eq(idempotencyKeys.status, SEDANG_DIPROSES),
        lt(idempotencyKeys.createdAt, new Date(Date.now() - UMUR_KLAIM_BASI_MS)),
      ),
    );

    dapat = await klaim();
    if (dapat.length === 0) {
      const akhir = await barisSelesai(bersih, planId);
      if (akhir) return balasTersimpan(akhir);
      throw new GalatAplikasi(
        "CONFLICT",
        "Perubahan ini masih diproses. Tunggu sebentar lalu coba lagi.",
      );
    }
  }

  try {
    const hasil = await jalan();
    const tanpaBody = hasil.status === 204 || hasil.status === 205 || hasil.status === 304;
    const badan = tanpaBody ? "" : await hasil.clone().text();
    try {
      await db
        .update(idempotencyKeys)
        .set({ status: hasil.status, body: badan })
        .where(and(eq(idempotencyKeys.key, bersih), eq(idempotencyKeys.planId, planId)));
    } catch {
      // Data sudah tertulis. Kalau penyimpanan balasan gagal, jangan ubah
      // jawaban menjadi galat; klaim akan diambil alih setelah basi.
    }
    return hasil;
  } catch (err) {
    // Gagal di tengah jalan: lepaskan klaim supaya percobaan berikutnya bisa.
    try {
      await db
        .delete(idempotencyKeys)
        .where(
          and(
            eq(idempotencyKeys.key, bersih),
            eq(idempotencyKeys.planId, planId),
            eq(idempotencyKeys.status, SEDANG_DIPROSES),
          ),
        );
    } catch {
      // Diamkan: galat aslinya yang penting sampai ke pemanggil.
    }
    throw err;
  }
}
