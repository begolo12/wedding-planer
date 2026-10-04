"use client";

import { useSyncExternalStore } from "react";

/**
 * Satu jalur data dari antrean luring ke layar.
 *
 * Alasannya satu jalur: banner luring (src/components/luring-banner.tsx)
 * butuh tiga hal yang tidak bisa dibaca dari jumlah antrean saja, yaitu
 * berapa item yang baru dibuang karena antrean penuh, ada item yang gagal
 * beserta pesannya, dan apakah sesi sudah habis sehingga pengguna harus masuk
 * lagi. Tiga hal itu terjadi di dalam src/lib/luring.ts saat menyimpan dan
 * mengirim, jadi kalau tiap tempat menyimpannya sendiri, layar harus tahu ke
 * mana harus melihat. Di sini semua ditulis ke satu tempat, dan layar cuma
 * membaca satu tempat.
 *
 * Bentuknya store kecil plus hook `useSyncExternalStore`, tanpa pustaka baru.
 * Hook dipakai supaya banner ikut berubah begitu statusnya berubah, bukan
 * menunggu jadwal periksa 30 detik. Snapshot-nya diganti hanya saat isinya
 * berubah, karena `useSyncExternalStore` membandingkan referensi.
 *
 * Keterbatasan yang ditulis jujur: status ini hidup di memori tab. Kalau
 * halaman dimuat ulang, nilainya kembali kosong, dan hal yang sama terjadi
 * setelah pesan dibersihkan. Untuk pemberitahuan sekali tampil seperti ini,
 * itu cukup; kalau nanti butuh riwayat, tempatnya bukan di sini.
 */

export type StatusLuring = {
  /** Jumlah item yang dibuang pada pengisian antrean terakhir karena penuh. */
  dibuang: number;
  /** Jumlah item yang gagal terkirim pada percobaan kirim terakhir. */
  gagal: number;
  /** Pesan galat item gagal pertama, untuk ditampilkan. Null kalau tidak ada. */
  pesanGagal: string | null;
  /** true kalau pengiriman terakhir berhenti karena 401 (sesi habis). */
  perluMasuk: boolean;
  /**
   * true kalau perangkat sedang luring, menurut penjaga koneksi (pemeriksa
   * berkala di banner luring). Satu tempat saja, supaya layar tidak menyimpulkan
   * sendiri keadaan koneksi dari satu permintaan yang kebetulan berhasil.
   */
  luring: boolean;
  /**
   * true kalau pembacaan data terakhir dilayani dari cadangan perangkat,
   * bukan dari server. Layar memakainya untuk menampilkan pita "Menampilkan
   * data dari perangkat" dan menyembunyikan tombol tambah/ubah (docs/07).
   */
  dariPerangkat: boolean;
};

const AWAL: StatusLuring = {
  dibuang: 0,
  gagal: 0,
  pesanGagal: null,
  perluMasuk: false,
  luring: false,
  dariPerangkat: false,
};

let status: StatusLuring = AWAL;
const pendengar = new Set<() => void>();

/**
 * Dipanggil setelah dialog "antrean penuh" ditutup, supaya pemberitahuan yang
 * sama tidak muncul berkali-kali. Hanya layar yang memanggil ini.
 */
export function bersihkanAntreanPenuh(): void {
  if (status.dibuang === 0) return;
  status = { ...status, dibuang: 0 };
  for (const dengar of pendengar) dengar();
}

/**
 * Dipakai src/lib/luring.ts, bukan layar. Mencatat berapa item yang dibuang
 * karena antrean penuh. Nol berarti tidak ada pemberitahuan baru.
 */
export function catatAntreanPenuh(dibuang: number): void {
  if (dibuang <= 0) return;
  status = { ...status, dibuang };
  for (const dengar of pendengar) dengar();
}

/**
 * Dipakai src/lib/luring.ts, bukan layar. Mencatat hasil satu putaran kirim.
 * Dipanggil setiap putaran, termasuk saat semuanya berhasil, supaya papan
 * pemberitahuan ikut bersih lagi.
 */
export function catatHasilKirim(hasil: {
  gagal: number;
  perluMasuk: boolean;
  pesanGagal: string | null;
}): void {
  if (
    status.gagal === hasil.gagal &&
    status.perluMasuk === hasil.perluMasuk &&
    status.pesanGagal === hasil.pesanGagal
  ) {
    return;
  }
  status = { ...status, ...hasil };
  for (const dengar of pendengar) dengar();
}

/**
 * Satu-satunya penulis keadaan koneksi. Dipanggil penjaga koneksi (pemeriksa
 * berkala di banner luring), bukan layar lain.
 *
 * Dipisah dari `dariPerangkat` karena keduanya menjawab pertanyaan berbeda:
 * `luring` soal ada tidaknya jaringan, sedangkan `dariPerangkat` soal asal
 * data yang sedang tampil. Satu GET yang berhasil tidak boleh membuat layar
 * mengira sudah daring penuh.
 */
export function catatLuring(luring: boolean): void {
  if (status.luring === luring) return;
  status = { ...status, luring };
  for (const dengar of pendengar) dengar();
}

/**
 * Dipakai src/lib/api-client.ts, bukan layar. Mencatat dari mana pembacaan
 * data terakhir datang: true berarti dari cadangan perangkat.
 *
 * Aturan resetnya ada di pemanggil: `dariPerangkat` dikembalikan ke false
 * HANYA saat ada GET yang berhasil DAN `luring` sedang false. Alasannya,
 * halaman membaca beberapa endpoint sekaligus, dan satu GET yang berhasil
 * tidak boleh membalik penanda selama penjaga koneksi masih bilang luring.
 */
export function catatSumberData(dariPerangkat: boolean): void {
  if (status.dariPerangkat === dariPerangkat) return;
  status = { ...status, dariPerangkat };
  for (const dengar of pendengar) dengar();
}

/** Pembacaan tanpa React, dipakai kode non-komponen. */
export function statusLuring(): StatusLuring {
  return status;
}

function langgan(dengar: () => void): () => void {
  pendengar.add(dengar);
  return () => {
    pendengar.delete(dengar);
  };
}

/**
 * Status luring untuk layar.
 *
 * Cara pakai satu baris:
 * `const { perluMasuk, gagal, pesanGagal, dibuang } = useStatusLuring();`
 */
export function useStatusLuring(): StatusLuring {
  return useSyncExternalStore(langgan, statusLuring, () => AWAL);
}
