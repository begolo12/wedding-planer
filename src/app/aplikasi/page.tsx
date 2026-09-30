import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasang di layar utama",
  robots: { index: false },
};

/**
 * Penjelasan cara memasang aplikasi. Halaman ini dibuka dari ajakan pasang di
 * dalam aplikasi, dan sengaja tidak memakai navigasi aplikasi supaya tetap
 * bisa dibuka saat luring. Halaman ini juga ikut disimpan Service Worker.
 */
export default function HalamanAplikasi() {
  return (
    <main className="halaman-baca">
      <p className="label-bagian">Aplikasi</p>
      <h1>Pasang di layar utama</h1>

      <p>
        Dipasang atau tidak, aplikasinya tetap jalan. Bedanya tiga hal: bisa dibuka tanpa internet,
        tidak perlu mencari alamatnya lagi, dan tampilannya penuh tanpa bilah peramban.
      </p>

      <div className="panel" style={{ marginTop: 24 }}>
        <p className="label-bagian">Android, lewat Chrome</p>
        <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li>Buka menu tiga titik di kanan atas</li>
          <li>Pilih &ldquo;Pasang aplikasi&rdquo; atau &ldquo;Tambahkan ke Layar utama&rdquo;</li>
          <li>Konfirmasi</li>
        </ol>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <p className="label-bagian">iPhone, lewat Safari</p>
        <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li>Ketuk tombol Bagikan di bawah layar</li>
          <li>Pilih &ldquo;Tambah ke Layar Utama&rdquo;</li>
          <li>Ketuk Tambah</li>
        </ol>
        <p style={{ marginTop: 8, fontSize: "var(--text-kecil)", color: "var(--color-muted)" }}>
          Safari tidak memberi tombol pasang otomatis, jadi langkahnya memang harus dilakukan sendiri.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <p className="label-bagian">Setelah dipasang</p>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li>Rundown tetap terbuka saat sinyal di venue hilang</li>
          <li>Tamu, anggaran, dan pembayaran bisa dibaca dari salinan di perangkat</li>
          <li>Perubahan yang dibuat saat luring disimpan dan dikirim sendiri setelah ada koneksi</li>
        </ul>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
        <Link className="tombol tombol-utama" href="/beranda">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}