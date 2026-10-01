"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { PesanGalat } from "@/components/states";

/**
 * Daftar akun. Nama dipakai di kepala aplikasi, jadi diminta di sini
 * supaya tidak ada layar yang tampil tanpa nama orang.
 */
export default function HalamanDaftar() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [surel, setSurel] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sedangJalan, setSedangJalan] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setGalat(null);

    if (sandi.length < 8) {
      setGalat("Kata sandi minimal 8 huruf.");
      return;
    }

    setSedangJalan(true);

    const { error } = await signUp.email({
      name: nama.trim(),
      email: surel.trim(),
      password: sandi,
    });

    if (error) {
      setSedangJalan(false);
      const kode = (error as { code?: string }).code;
      if (kode === "USER_ALREADY_EXISTS") {
        setGalat("Surel ini sudah dipakai. Masuk saja dengan surel yang sama.");
        return;
      }
      setGalat("Pendaftaran belum berhasil. Coba lagi sebentar.");
      return;
    }

    router.replace("/beranda");
    router.refresh();
  }

  return (
    <>
      <div className="auth-judul-blok">
        <h1 className="auth-judul">Buat Akun Baru</h1>
        <p className="auth-subjudul">
          Mulai dan rancang rencana pernikahan kamu berdua.
        </p>
      </div>

      <form onSubmit={kirim} noValidate className="auth-form">
        <div className="isian-grup">
          <label htmlFor="nama">Nama panggilan</label>
          <input
            id="nama"
            className="isian"
            type="text"
            autoComplete="name"
            placeholder="Contoh: Budi"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

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
              autoComplete="new-password"
              placeholder="Minimal 8 huruf"
              required
              minLength={8}
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
          <span className="petunjuk">Minimal 8 karakter.</span>
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
              Sedang membuat akun...
            </span>
          ) : (
            "Daftar Sekarang"
          )}
        </button>
      </form>

      <p className="auth-kaki">
        Sudah punya akun?{" "}
        <Link className="tautan-kalimat" href="/masuk">
          Masuk di sini
        </Link>
      </p>
    </>
  );
}
