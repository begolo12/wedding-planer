import Link from "next/link";
import { Kosong } from "@/components/states";

export default function NotFound() {
  return (
    <main className="halaman-baca">
      <Kosong
        keadaan="Halaman tidak ditemukan (404)."
        jalanKeluar="Alamat yang kamu tuju mungkin salah ketik atau tautan sudah dipindahkan."
      >
        <Link className="tombol tombol-utama" href="/beranda">
          Kembali ke Beranda
        </Link>
      </Kosong>
    </main>
  );
}
