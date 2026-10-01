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
  const [surel, setSurel] = useState("");
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

        <IsianSandi
          nilai={sandi}
          onUbah={setSandi}
          autoComplete="new-password"
          placeholder="Minimal 8 huruf"
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
