import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sedang tanpa koneksi",
  robots: { index: false },
};

/**
 * Halaman yang muncul kalau navigasi gagal dan halamannya belum pernah dibuka.
 *
 * Isinya bukan "terjadi kesalahan" generik. Yang berguna saat luring hanya
 * tiga layar, dan yang paling berguna cuma satu: rundown. Jadi di sini
 * disebutkan layar mana yang masih bisa dibuka, bukan cuma bahwa ada masalah.
 *
 * Halaman ini tidak memakai navigasi aplikasi. Kalau navigasi ikut dirender
 * dan datanya diambil dari server, halaman ini sendiri yang akan gagal tampil
 * saat paling dibutuhkan.
 */
export default function HalamanLuring() {
  return (
    <main className="halaman-baca tumpuk">
      <div className="kepala-halaman">
        <p className="label-bagian">Tanpa koneksi</p>
        <h1>Tidak ada internet</h1>
        <p>
          Aplikasinya tetap bisa dibuka, tapi hanya layar yang sudah pernah kamu buka sebelumnya.
          Halaman yang belum pernah dibuka tidak punya salinan di perangkat ini.
        </p>
      </div>

      <div className="kartu tumpuk-rapat">
        <p className="label-bagian">Yang biasanya masih bisa dibuka</p>
        <ul className="daftar-butir">
          <li>Rundown hari-H, ini yang paling sering dibutuhkan di lokasi</li>
          <li>Daftar tugas, untuk dibaca saja</li>
          <li>Daftar tamu, untuk dibaca saja</li>
          <li>Anggaran, untuk dibaca saja</li>
          <li>Info untuk keluarga, kalau sudah pernah dibuka</li>
        </ul>
      </div>

      <p>
        Menambah atau mengubah data saat luring tetap bisa. Perubahannya disimpan di perangkat dan
        dikirim sendiri setelah ada koneksi lagi.
      </p>

      <div className="aksi-baris">
        <Link className="tombol tombol-utama" href="/hari-h">
          Buka rundown
        </Link>
        <Link className="tombol tombol-sekunder" href="/beranda">
          Coba beranda
        </Link>
      </div>

      <p className="keterangan">
        Kalau layarnya kosong, itu berarti halamannya memang belum pernah dibuka di perangkat ini.
        Bukan datanya yang hilang.
      </p>
    </main>
  );
}
