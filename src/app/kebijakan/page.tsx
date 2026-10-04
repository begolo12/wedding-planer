import Link from "next/link";
import type { Metadata } from "next";
import { NAMA_PRODUK } from "@/lib/konstanta";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Data apa yang dikumpulkan aplikasi ini, untuk apa, dan hak kamu menurut UU PDP.",
};

/**
 * Halaman kebijakan privasi.
 *
 * Halaman ini harus bisa dibuka tanpa masuk, karena calon pengguna baru
 * membacanya sebelum setuju saat mendaftar. Isinya mengikuti
 * docs/08-NFR.md bagian Privasi. Alamat kontak yang tersedia cuma repositori
 * proyek, jadi itu yang ditulis; surel resmi belum dipublikasikan dan tidak
 * dikarang.
 */
export default function HalamanKebijakan() {
  return (
    <main className="halaman-baca tumpuk">
      <div className="kepala-halaman">
        <p className="label-bagian">Kebijakan privasi</p>
        <h1>Kebijakan Privasi</h1>
        <p>
          Ini penjelasan jujur tentang data apa yang disimpan {NAMA_PRODUK}, untuk apa, dan apa
          yang bisa kamu lakukan terhadapnya. Dasarnya Undang-Undang Nomor 27 Tahun 2022 tentang
          Pelindungan Data Pribadi (UU PDP).
        </p>
      </div>

      <section className="kartu tumpuk-rapat">
        <h2 className="label-bagian">Data yang dikumpulkan dan untuk apa</h2>
        <div className="daftar">
          <div className="baris">
            <span className="baris-isi">Nama dan email</span>
            <strong className="angka">Masuk ke akun</strong>
          </div>
          <div className="baris">
            <span className="baris-isi">Nama pasangan dan nama tamu</span>
            <strong className="angka">Isi rencana dan daftar tamu</strong>
          </div>
          <div className="baris">
            <span className="baris-isi">Tanggal pernikahan</span>
            <strong className="angka">Hitung mundur dan laporan</strong>
          </div>
          <div className="baris">
            <span className="baris-isi">Nominal pembayaran</span>
            <strong className="angka">Catatan anggaran</strong>
          </div>
        </div>
        <p className="keterangan">
          Data itu dipakai hanya untuk menjalankan aplikasi ini. Tidak ada data yang dipakai
          untuk iklan. Foto bukti transfer tidak disimpan karena unggah berkas belum dibangun.
        </p>
      </section>

      <section className="kartu tumpuk-rapat">
        <h2 className="label-bagian">Yang tidak kami lakukan</h2>
        <ul className="daftar-butir">
          <li>Tidak ada iklan di dalam aplikasi.</li>
          <li>Tidak ada analitik pihak ketiga dan tidak ada pixel pelacak.</li>
          <li>
            Cookie yang dipakai cuma satu, yaitu cookie sesi untuk menjaga kamu tetap masuk.
            Tidak ada cookie iklan dan tidak ada cookie pelacak.
          </li>
          <li>Pilihan tema disimpan di perangkat kamu, bukan dikirim ke server.</li>
        </ul>
      </section>

      <section className="kartu tumpuk-rapat">
        <h2 className="label-bagian">Hak kamu menurut UU PDP</h2>
        <ul className="daftar-butir">
          <li>
            <strong>Akses.</strong> Semua data rencanamu bisa dilihat langsung di aplikasi.
          </li>
          <li>
            <strong>Koreksi.</strong> Semua data bisa kamu ubah kapan saja dari layar masing
            masing.
          </li>
          <li>
            <strong>Ekspor.</strong> Tombol cadangan di layar Akun mengunduh seluruh data
            rencanamu sebagai satu berkas JSON, termasuk daftar nama dan nomor tamu. Nama dan
            email akunmu sendiri tidak ikut di berkas itu karena bukan bagian dari rencana.
          </li>
          <li>
            <strong>Hapus.</strong> Menghapus rencana menghapus semua data turunannya. Menghapus
            akun menghapus akun dan seluruh rencana milikmu.
          </li>
          <li>
            <strong>Tarik persetujuan.</strong> Kamu bisa berhenti memakai aplikasi dan menghapus
            akun kapan saja.
          </li>
        </ul>
      </section>

      <section className="kartu tumpuk-rapat">
        <h2 className="label-bagian">Berapa lama data disimpan</h2>
        <p>
          Selama akunmu ada, data disimpan supaya rencananya tetap bisa dibuka. Kami menargetkan
          akun yang tidak aktif selama 24 bulan dihapus. Mekanisme itu belum dijalankan pada
          tahap sekarang, jadi cara paling pasti untuk menghapus data adalah tombol hapus akun
          di layar Akun.
        </p>
      </section>

      <section className="kartu tumpuk-rapat">
        <h2 className="label-bagian">Cara menghubungi pemilik produk</h2>
        <p>
          Surel resmi belum dipublikasikan. Sementara ini, sampai ada surel resmi, pertanyaan soal
          data pribadi bisa dikirim lewat halaman Issues repositori proyek di{" "}
          <a
            className="tautan-kalimat"
            href="https://github.com/begolo12/wedding-planer/issues"
            target="_blank"
            rel="noreferrer"
          >
            github.com/begolo12/wedding-planer/issues
          </a>
          . Kanal ini sementara; alamat surel khusus privasi akan ditambahkan di halaman ini
          begitu tersedia.
        </p>
      </section>

      <div className="aksi-baris">
        <Link className="tombol tombol-utama" href="/daftar">
          Kembali ke pendaftaran
        </Link>
        <Link className="tombol tombol-sekunder" href="/masuk">
          Masuk
        </Link>
      </div>
    </main>
  );
}
