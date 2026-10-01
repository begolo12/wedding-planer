import { NAMA_PRODUK } from "@/lib/konstanta";

/**
 * Lambang merek: satu bulatan blush dengan dua cincin bertaut di tengahnya.
 * Bentuknya persis logo yang dipakai Stitch. Berkasnya hasil potong dari
 * `docs/stitch_cute_wedding_planner/sweet_ties_wedding_planner_logo` lewat
 * `scripts/buat-merek.ps1`, latar kremnya sudah dibuang jadi tembus pandang.
 *
 * Karena latarnya tembus pandang, lambang ini bisa duduk di atas warna apa pun
 * tanpa ikut membawa kotak putih. Dipakai seragam di chip kepala layar masuk
 * dan di lambang besar kartu masuk. Kalau logo diganti lagi, cukup jalankan
 * ulang `scripts/buat-merek.ps1`; tidak ada berkas lain yang perlu diubah.
 *
 * Ukuran berkas dipilih menurut besar tampilnya supaya chip 32px tidak ikut
 * mengunduh berkas 512px hanya untuk ditampilkan kecil.
 */
export function Merek({ ukuran = 32 }: { ukuran?: number }) {
  const berkas = ukuran >= 64 ? "/merek/merek-512.png" : "/merek/merek-192.png";

  return (
    <img
      className="merek-lambang"
      src={berkas}
      alt=""
      width={ukuran}
      height={ukuran}
      decoding="async"
    />
  );
}

/** Nama produk yang ditulis di samping lambang. Dipisah supaya komponen
 *  lambang tetap murni gambar, sedangkan teks merek gampang diganti. */
export const NAMA_MEREK = NAMA_PRODUK;
