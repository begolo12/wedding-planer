"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { PesanGalat } from "@/components/states";

/**
 * Masuk pakai surel dan kata sandi. Tidak ada tombol "lupa kata sandi",
 * karena belum ada pengiriman surel di tahap ini dan tombol yang tidak
 * berfungsi lebih buruk daripada tidak ada tombol.
 */
export default function HalamanMasuk() {
  const router = useRouter();
  const [surel, setSurel] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sedangJalan, setSedangJalan] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat(null);
    setSedangJalan(true);

    const { error } = await signIn.email({
      email: surel.trim(),
      password: sandi,
    });

    if (error) {
      setSedangJalan(false);
      // Surel yang belum terdaftar dan sandi yang salah dibalas sama,
      // supaya layar ini tidak bisa dipakai menebak siapa yang punya akun.
      setGalat("Surel atau kata sandi belum cocok. Coba periksa lagi.");
      return;
    }

    router.replace("/beranda");
    router.refresh();
  }

  return (
    <>
      <h1 className="auth-nama">Masuk</h1>
      <p className="petunjuk" style={{ marginTop: 4 }}>
        Lanjutkan rencana yang sedang kamu kerjakan.
      </p>

      <form onSubmit={kirim} noValidate style={{ marginTop: 24 }}>
        <div className="isian-grup">
          <label htmlFor="surel">Surel</label>
          <input
            id="surel"
            className="isian"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={surel}
            onChange={(e) => setSurel(e.target.value)}
          />
        </div>

        <div className="isian-grup">
          <label htmlFor="sandi">Kata sandi</label>
          <input
            id="sandi"
            className="isian"
            type={lihat ? "text" : "password"}
            autoComplete="current-password"
            required
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
          />
          <button
            type="button"
            className="tombol tombol-halus"
            onClick={() => setLihat((v) => !v)}
            aria-pressed={lihat}
            style={{ alignSelf: "flex-start" }}
          >
            {lihat ? "Sembunyikan" : "Lihat"}
          </button>
        </div>

        {galat ? <PesanGalat teks={galat} /> : null}

        <button
          type="submit"
          className="tombol tombol-utama tombol-lebar"
          disabled={sedangJalan}
          style={{ marginTop: 16 }}
        >
          {sedangJalan ? "Sedang masuk..." : "Masuk"}
        </button>
      </form>

      <p className="auth-kaki">
        Belum punya akun? <Link href="/daftar">Daftar</Link>
      </p>
    </>
  );
}
