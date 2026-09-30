import Link from "next/link";
import { Kosong } from "@/components/states";

export default function NotFound() {
  return (
    <main style={{ padding: "48px 16px", maxWidth: 600, margin: "0 auto" }}>
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
