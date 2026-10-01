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

        <div className="isian-grup">
          <label htmlFor="sandi">Kata sandi</label>
          <div className="auth-sandi-bungkus">
            <input
              id="sandi"
              className="isian"
              type={lihat ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              required
              value={sandi}
              onChange={(e) => setSandi(e.target.value)}
            />
            <button
              type="button"
              className="auth-tombol-mata"
              onClick={() => setLihat((v) => !v)}
              aria-pressed={lihat}
              aria-label={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
              title={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
            >
              {lihat ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

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
