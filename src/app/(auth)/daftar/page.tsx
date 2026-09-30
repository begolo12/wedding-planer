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
      <h1 className="auth-nama">Buat akun</h1>
      <p className="petunjuk" style={{ marginTop: 4 }}>
        Mulai rencana pernikahan kamu.
      </p>

      <form onSubmit={kirim} noValidate style={{ marginTop: 24 }}>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
          />
          <span className="petunjuk">Minimal 8 huruf.</span>
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
          {sedangJalan ? "Sedang membuat akun..." : "Lanjut"}
        </button>
      </form>

      <p className="auth-kaki">
        Sudah punya akun? <Link href="/masuk">Masuk</Link>
      </p>
    </>
  );
}
