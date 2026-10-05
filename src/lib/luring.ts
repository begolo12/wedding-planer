"use client";

import { catatAntreanPenuh, catatHasilKirim } from "./status-luring";
import { penyimpananAntrean, urutkanAntrean, type ItemAntrean } from "./penyimpanan-antrean";

export type { ItemAntrean } from "./penyimpanan-antrean";

/**
 * Antrean perubahan saat luring.
 *
 * Penyimpanannya ada di `src/lib/penyimpanan-antrean.ts`, di balik antarmuka,
 * supaya bisa diganti implementasi in-memory saat test di Node. Berkas ini
 * yang mengatur aturannya: urutan kirim, batas antrean, dan kapan sebuah item
 * dianggap gagal.
 *
 * `navigator.onLine` tidak dipakai sendirian karena browser sering bilang
 * online di Wi-Fi yang sudah tidak punya internet. Yang dipakai: cek kecil ke
 * endpoint sendiri. Kalau gagal, dianggap luring, walaupun browser bilang
 * online.
 *
 * Ceknya tiap 30 detik dan tiap tab kembali aktif. Tidak ada sync periodik
 * yang berjalan diam-diam, karena itu memakai kuota data tanpa diminta.
 */

// Batas 500 diputuskan di docs/18 bagian 4: batas 200 membuang perubahan
// paling tua diam-diam, dan catatan pembayaran yang hilang tanpa pemberitahuan
// lebih buruk daripada antrean yang lebih panjang. Yang dibuang tetap
// dilaporkan lewat nilai balik simpanKeAntrean, bukan disembunyikan.
const BATAS_ANTREAN = 500;

/**
 * Berapa kali satu item boleh dicoba otomatis sebelum berhenti dicoba sendiri.
 *
 * Setelah batas ini, item tidak lagi dikirim otomatis dan hanya muncul sebagai
 * "perlu dikirim ulang manual" di pita. Tanpa batas, item yang isinya selalu
 * ditolak akan dicoba tiap 30 detik selamanya.
 */
const BATAS_PERCOBAAN = 5;

/** Semua antrean, dari yang paling lama. Urutan ini yang dipakai saat kirim. */
export async function daftarAntrean(): Promise<ItemAntrean[]> {
  return urutkanAntrean(await penyimpananAntrean().daftar());
}

export async function jumlahAntrean(): Promise<number> {
  return penyimpananAntrean().hitung();
}

/**
 * Simpan satu perubahan yang gagal terkirim.
 *
 * Batasnya 500 item. Kalau lewat, yang paling tua dibuang dan pemanggilnya
 * diberi tahu lewat `dibuang`. Antrean yang membengkak tanpa batas
 * memperlambat setiap pengiriman, jadi batas tetap ada, tapi pembuangan
 * sekarang kelihatan, bukan diam-diam.
 */
export async function simpanKeAntrean(
  method: string,
  path: string,
  body: string | null,
): Promise<{ diterima: boolean; dibuang: number }> {
  // Nomor urut diambil sebelum menyimpan, supaya dua perubahan yang tersimpan
  // pada milidetik yang sama tetap terkirim sesuai urutan orang menekannya.
  const sebelumnya = await daftarAntrean();
  const urut = (sebelumnya[sebelumnya.length - 1]?.urut ?? 0) + 1;

  const isi: ItemAntrean = {
    id: crypto.randomUUID(),
    method,
    path,
    body,
    createdAt: Date.now(),
    attempts: 0,
    lastError: null,
    urut,
  };

  await penyimpananAntrean().simpan(isi);

  const semua = await daftarAntrean();
  let dibuang = 0;
  if (semua.length > BATAS_ANTREAN) {
    for (const lama of semua.slice(0, semua.length - BATAS_ANTREAN)) {
      await buangAntrean(lama.id);
      dibuang += 1;
    }
  }

  // Diberitahukan ke layar lewat satu jalur data di src/lib/status-luring.ts,
  // supaya pembuangan tidak pernah terjadi diam-diam.
  catatAntreanPenuh(dibuang);

  return { diterima: dibuang === 0, dibuang };
}

export async function buangAntrean(id: string): Promise<void> {
  await penyimpananAntrean().hapus(id);
}

/**
 * Kirim antrean berurutan, berhenti di kegagalan pertama.
 *
 * Berhenti, bukan lanjut, karena urutannya bermakna: kalau orang menambah
 * lalu menghapus saat luring, hapus tidak boleh tiba sebelum tambah.
 *
 * Tiga keadaan yang dibedakan di sini, sesuai docs/18 bagian 4:
 * - 2xx: terkirim, itemnya dibuang dari antrean.
 * - 401: sesi habis. Antrean dihentikan dan itemnya ditahan, karena ini bisa
 *   diperbaiki orangnya sendiri dengan masuk lagi. Dulu 401 dihitung terkirim,
 *   jadi catatan pembayaran hilang padahal tidak pernah masuk server.
 * - 4xx lain: server menolak isinya, dan mengulang tidak akan menolong.
 *   Itemnya TIDAK dihitung terkirim dan TIDAK dibuang diam diam; alasannya
 *   disimpan di `lastError` supaya bisa ditunjukkan ke pengguna.
 */
export async function kirimAntrean(): Promise<{
  terkirim: number;
  tersisa: number;
  gagal: number;
  perluMasuk: boolean;
}> {
  /*
   * Satu pengiriman pada satu waktu, lintas tab.
   *
   * Tiap tab memasang pemeriksa koneksi sendiri tiap 30 detik, dan tanpa kunci
   * ini dua tab bisa mengambil daftar antrean yang sama lalu mengirim item
   * yang sama bersamaan. Kuncinya dari Web Locks API, jadi tidak butuh
   * pustaka. Di peramban yang belum punya, kiriman jalan seperti sebelumnya;
   * dobelnya tetap dicegah server lewat kunci idempotency, jadi yang hilang
   * cuma penghematan, bukan kebenaran.
   */
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return navigator.locks.request("haribesar-kirim-antrean", () => kirimAntreanSekali());
  }
  return kirimAntreanSekali();
}

async function kirimAntreanSekali(): Promise<{
  terkirim: number;
  tersisa: number;
  gagal: number;
  perluMasuk: boolean;
}> {
  const semua = await daftarAntrean();
  let terkirim = 0;
  let gagal = 0;
  let perluMasuk = false;
  let pesanGagal: string | null = null;

  /*
   * Berhenti hanya untuk kegagalan yang memang menghalangi sisanya, bukan
   * untuk setiap kegagalan.
   *
   * Urutannya bermakna: kalau orang menambah lalu menghapus saat luring,
   * hapus tidak boleh tiba sebelum tambah. Karena itu kegagalan yang mungkin
   * hilang sendiri (jaringan, 5xx) dan kegagalan sesi (401) tetap menghentikan
   * seluruh antrean.
   *
   * 4xx lain berbeda: isinya memang ditolak server dan mengulang tidak akan
   * menolong. Dulu ini juga menghentikan antrean, dan akibatnya satu item
   * yang isinya salah membuat semua perubahan di belakangnya tidak pernah
   * terkirim. Sekarang item itu dipisahkan dari jalur otomatis, lalu kiriman
   * lanjut ke item berikutnya.
   */
  for (const item of semua) {
    if (item.attempts >= BATAS_PERCOBAAN) {
      gagal += 1;
      pesanGagal = pesanGagal ?? item.lastError ?? "Satu perubahan perlu dikirim ulang manual.";
      continue;
    }

    let res: Response;
    try {
      res = await fetch(item.path, {
        method: item.method,
        headers: {
          // Kunci idempotency: id item antrean ini sendiri. Server menyimpan
          // kunci beserta balasannya, jadi kiriman ulang dengan kunci yang
          // sama tidak menambah baris kedua.
          "Idempotency-Key": item.id,
          ...(item.body ? { "Content-Type": "application/json" } : {}),
        },
        body: item.body ?? undefined,
        credentials: "same-origin",
      });
    } catch {
      pesanGagal = "Masih tidak ada koneksi.";
      await naikkanPercobaan(item, pesanGagal);
      gagal += 1;
      break;
    }

    if (res.ok) {
      await buangAntrean(item.id);
      terkirim += 1;
      continue;
    }

    if (res.status === 401) {
      await naikkanPercobaan(
        item,
        "Sesi habis. Masuk lagi supaya perubahan ini bisa terkirim.",
      );
      perluMasuk = true;
      break;
    }

    if (res.status >= 400 && res.status < 500) {
      const pesan = `Server menolak perubahan ini (${res.status}).`;
      await naikkanPercobaan(item, pesan);
      gagal += 1;
      pesanGagal = pesanGagal ?? pesan;
      // Lanjut, bukan berhenti: item ini tidak akan membaik kalau dicoba lagi,
      // dan menahannya di sini membuat item di belakangnya ikut tertahan.
      continue;
    }

    pesanGagal = `Server membalas ${res.status}.`;
    await naikkanPercobaan(item, pesanGagal);
    gagal += 1;
    break;
  }

  // Satu jalur data ke layar, lihat src/lib/status-luring.ts.
  catatHasilKirim({ gagal, perluMasuk, pesanGagal });

  return { terkirim, tersisa: await jumlahAntrean(), gagal, perluMasuk };
}

async function naikkanPercobaan(item: ItemAntrean, pesan: string): Promise<void> {
  await penyimpananAntrean().simpan({ ...item, attempts: item.attempts + 1, lastError: pesan });
}

/**
 * Item yang sudah menembus batas percobaan dan tidak lagi dicoba otomatis.
 *
 * Dipisahkan supaya layar bisa menampilkannya sebagai "perlu perhatian", bukan
 * diam-diam dilewati. Sebelum ini, item seperti itu terus dihitung gagal tapi
 * tidak pernah muncul dengan alasan yang bisa dibaca orangnya.
 */
export async function itemMacet(): Promise<ItemAntrean[]> {
  const semua = await daftarAntrean();
  return semua.filter((i) => i.attempts >= BATAS_PERCOBAAN);
}

/**
 * Buang semua item yang macet, supaya antrean bisa kosong lagi.
 *
 * Dipakai tombol "Buang yang macet" di pita. Tanpa ini, item yang isinya salah
 * menahan antrean selamanya dan orangnya tidak punya jalan keluar selain
 * menghapus data peramban.
 */
export async function buangItemMacet(): Promise<number> {
  const macet = await itemMacet();
  for (const item of macet) await buangAntrean(item.id);
  return macet.length;
}

/** Cek koneksi sungguhan. `navigator.onLine` hanya jadi saringan pertama. */
export async function cekKoneksi(): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;
  try {
    const res = await fetch("/api/kesehatan", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    return res.ok || res.status === 401 || res.status === 404;
  } catch {
    return false;
  }
}
