import { GalatAplikasi } from "@/lib/galat";

/**
 * Batas laju sederhana, satu map di memori proses.
 *
 * Cara ini diputuskan di docs/18-Rencana-Produksi-dan-Pemakaian-Harian.md
 * bagian 7. Yang dipakai jendela tetap: hitungan dimulai saat permintaan
 * pertama, lalu direset penuh saat jendelanya habis. docs/08-NFR.md menulis
 * token bucket, tetapi itu dokumen lama dan docs/18 yang berlaku; selisih ini
 * dicatat supaya pekerja dokumen menyelaraskan docs/08.
 *
 * Keterbatasan yang harus ditulis jujur: map ini hilang saat proses restart,
 * dan tidak dibagi antar instance. Jalan saat ini satu proses (lihat
 * vercel.json, satu deployment), jadi cukup. Kalau nanti ada lebih dari satu
 * instance, batas laju harus pindah ke tempat yang dibagi, dan itu keputusan
 * terpisah, bukan tambahan diam-diam di sini.
 *
 * Map disimpan di `globalThis` supaya tidak hilang saat hot reload di mode
 * dev, sama seperti koneksi database di src/db/index.ts.
 */

type Catatan = {
  /** Jumlah permintaan pada jendela yang sedang berjalan. */
  jumlah: number;
  /** Waktu mulai jendela, dalam milidetik. */
  mulai: number;
};

const globalForBatas = globalThis as unknown as {
  batasLaju?: Map<string, Catatan>;
};

const peta: Map<string, Catatan> = (globalForBatas.batasLaju ??= new Map());

/**
 * Batas jumlah catatan sebelum pembersihan dijalankan. Satu catatan paling
 * besar hidup selama jendela terlama, jadi angka ini longgar sekali dan cuma
 * untuk mencegah map tumbuh tanpa henti di proses yang hidup lama.
 */
const BATAS_CATATAN = 5_000;

function bersihkan(sekarang: number, jendelaTerlamaMs: number) {
  if (peta.size <= BATAS_CATATAN) return;
  for (const [kunci, catatan] of peta) {
    if (sekarang - catatan.mulai >= jendelaTerlamaMs) peta.delete(kunci);
  }
}

/**
 * Hitung satu permintaan terhadap batas. Melempar RATE_LIMITED kalau lewat.
 *
 * Pemanggil yang menentukan kuncinya, karena kuncinya beda per endpoint:
 * batas akun dan masuk memakai alamat IP (ditangani bawaan Better Auth),
 * sedangkan endpoint plan dan pembayaran memakai id pengguna, sesuai tabel
 * batas di docs/18 bagian 7.
 *
 * @param kunci nama unik untuk satu jenis permintaan dan satu pihak
 * @param batas jumlah permintaan yang boleh dalam satu jendela
 * @param jendelaDetik panjang jendela, dalam detik
 */
export function batasi(kunci: string, batas: number, jendelaDetik: number): void {
  const sekarang = Date.now();
  const jendelaMs = jendelaDetik * 1_000;
  const catatan = peta.get(kunci);

  if (!catatan || sekarang - catatan.mulai >= jendelaMs) {
    peta.set(kunci, { jumlah: 1, mulai: sekarang });
    bersihkan(sekarang, jendelaMs);
    return;
  }

  catatan.jumlah += 1;
  if (catatan.jumlah > batas) {
    const sisa = Math.max(1, Math.ceil((catatan.mulai + jendelaMs - sekarang) / 1_000));
    throw new GalatAplikasi(
      "RATE_LIMITED",
      `Terlalu banyak permintaan. Coba lagi sekitar ${sisa} detik lagi.`,
      undefined,
      sisa,
    );
  }
}
