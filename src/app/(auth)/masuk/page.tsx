"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { PesanGalat } from "@/components/states";
import { IsianSandi } from "@/components/field";

/**
 * Masuk pakai email dan kata sandi. Tidak ada tombol "lupa kata sandi",
 * karena belum ada pengiriman email di tahap ini dan tombol yang tidak
 * berfungsi lebih buruk daripada tidak ada tombol.
 */
export default function HalamanMasuk() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [sedangJalan, setSedangJalan] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (sedangJalan) return;

    if (!email.trim() || !sandi) {
      setGalat("Isi email dan kata sandi.");
      return;
    }

    setGalat(null);
    setSedangJalan(true);

    try {
      const { error } = await signIn.email({
        email: email.trim(),
        password: sandi,
      });

      if (error) {
        setSedangJalan(false);
        // Email yang belum terdaftar dan sandi yang salah dibalas sama,
        // supaya layar ini tidak bisa dipakai menebak siapa yang punya akun.
        setGalat("Email atau kata sandi belum cocok.");
        return;
      }

      router.replace("/beranda");
      router.refresh();
    } catch {
      setSedangJalan(false);
      setGalat("Gagal menghubungi server. Periksa koneksi internet.");
    }
  }

  return (
    <>
      <div className="auth-judul-blok">
        <h1 className="auth-judul">Masuk</h1>
      </div>

      <form onSubmit={kirim} noValidate className="auth-form">
        <div className="isian-grup">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="isian"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <IsianSandi nilai={sandi} onUbah={setSandi} placeholder="" />

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
          Daftar
        </Link>
      </p>
    </>
  );
}
