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
  const semua = await daftarAntrean();
  let terkirim = 0;
  let gagal = 0;
  let perluMasuk = false;
  let pesanGagal: string | null = null;

  for (const item of semua) {
    if (item.attempts >= 5) {
      gagal += 1;
      pesanGagal = pesanGagal ?? item.lastError;
      continue;
    }

    try {
      const res = await fetch(item.path, {
        method: item.method,
        headers: item.body ? { "Content-Type": "application/json" } : undefined,
        body: item.body ?? undefined,
        credentials: "same-origin",
      });

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
        pesanGagal = `Server menolak perubahan ini (${res.status}).`;
        await naikkanPercobaan(item, pesanGagal);
        gagal += 1;
        break;
      }

      pesanGagal = `Server membalas ${res.status}.`;
      await naikkanPercobaan(item, pesanGagal);
      gagal += 1;
      break;
    } catch {
      pesanGagal = "Masih tidak ada koneksi.";
      await naikkanPercobaan(item, pesanGagal);
      gagal += 1;
      break;
    }
  }

  // Satu jalur data ke layar, lihat src/lib/status-luring.ts.
  catatHasilKirim({ gagal, perluMasuk, pesanGagal });

  return { terkirim, tersisa: await jumlahAntrean(), gagal, perluMasuk };
}

async function naikkanPercobaan(item: ItemAntrean, pesan: string): Promise<void> {
  await penyimpananAntrean().simpan({ ...item, attempts: item.attempts + 1, lastError: pesan });
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
