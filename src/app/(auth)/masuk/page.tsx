"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { PesanGalat } from "@/components/states";
import { IsianSandi } from "@/components/field";

/**
 * Masuk pakai surel dan kata sandi. Tidak ada tombol "lupa kata sandi",
 * karena belum ada pengiriman surel di tahap ini dan tombol yang tidak
 * berfungsi lebih buruk daripada tidak ada tombol.
 */
export default function HalamanMasuk() {
  const router = useRouter();
  const [surel, setSurel] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [sedangJalan, setSedangJalan] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (sedangJalan) return;

    if (!surel.trim() || !sandi) {
      setGalat("Isi surel dan kata sandi untuk masuk.");
      return;
    }

    setGalat(null);
    setSedangJalan(true);

    try {
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
    } catch {
      setSedangJalan(false);
      setGalat("Gagal menghubungkan ke server. Periksa koneksi internet.");
    }
  }

  return (
    <>
      <div className="auth-judul-blok">
        <h1 className="auth-judul">Masuk ke Akun</h1>
        <p className="auth-subjudul">
          Lanjutkan rencana pernikahan yang sedang kamu susun.
        </p>
      </div>

      <form onSubmit={kirim} noValidate className="auth-form">
        <div className="isian-grup">
          <label htmlFor="surel">Surel</label>
          <input
            id="surel"
            className="isian"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="email"
            placeholder="nama@contoh.com"
            required
            value={surel}
            onChange={(e) => setSurel(e.target.value)}
          />
        </div>

        <IsianSandi nilai={sandi} onUbah={setSandi} />

        {galat ? <PesanGalat teks={galat} /> : null}

        <button
          type="submit"
          className="tombol tombol-utama tombol-lebar auth-tombol-kirim"
          disabled={sedangJalan}
        >
          {sedangJalan ? (
            <span className="auth-loading-teks">
              <span className="auth-spinner" aria-hidden="true" />
              Sedang masuk...
            </span>
          ) : (
            "Masuk"
          )}
        </button>
      </form>

      <p className="auth-kaki">
        Belum punya akun?{" "}
        <Link className="tautan-kalimat" href="/daftar">
          Daftar sekarang
        </Link>
      </p>
    </>
  );
}
