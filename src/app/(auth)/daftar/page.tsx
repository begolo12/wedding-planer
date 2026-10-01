"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { PesanGalat } from "@/components/states";
import { IsianSandi } from "@/components/field";

/**
 * Daftar akun. Nama dipakai di kepala aplikasi, jadi diminta di sini
 * supaya tidak ada layar yang tampil tanpa nama orang.
 */
export default function HalamanDaftar() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
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
      email: email.trim(),
      password: sandi,
    });

    if (error) {
      setSedangJalan(false);
      const kode = (error as { code?: string }).code;
      if (kode === "USER_ALREADY_EXISTS") {
        setGalat("Email ini sudah dipakai. Masuk saja.");
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
        <h1 className="auth-judul">Daftar</h1>
      </div>

      <form onSubmit={kirim} noValidate className="auth-form">
        <div className="isian-grup">
          <label htmlFor="nama">Nama</label>
          <input
            id="nama"
            className="isian"
            type="text"
            autoComplete="name"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

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

        <IsianSandi
          nilai={sandi}
          onUbah={setSandi}
          autoComplete="new-password"
          placeholder=""
          minLength={8}
          petunjuk="Minimal 8 karakter."
        />

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
            "Daftar"
          )}
        </button>
      </form>

      <p className="auth-kaki">
        Sudah punya akun?{" "}
        <Link className="tautan-kalimat" href="/masuk">
          Masuk
        </Link>
      </p>
    </>
  );
}
