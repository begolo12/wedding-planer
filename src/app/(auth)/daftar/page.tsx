"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { minta } from "@/lib/api-client";
import { PesanGalat } from "@/components/states";
import { IsianSandi } from "@/components/field";

/**
 * Daftar akun.
 *
 * Layar Stitch "Daftar Akun Baru" meminta empat isian: nama orang yang
 * mendaftar, nama pasangan impian, email, dan kata sandi. Nama pasangan
 * bukan bagian dari akun, jadi setelah akun jadi kami sekaligus membuat
 * rencana pertama lewat /api/plans supaya namanya tidak hilang dan
 * langsung muncul di kepala aplikasi.
 *
 * Tombol masuk lewat Google dan tautan "Syarat dan Kebijakan Manis" tidak
 * dipasang: penyedia masuk Google belum dikonfigurasi di tahap ini dan
 * halaman syarat belum ada. Tombol dan tautan yang tidak berfungsi lebih
 * buruk daripada tidak ada.
 */
export default function HalamanDaftar() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [pasangan, setPasangan] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sedangJalan, setSedangJalan] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (sedangJalan) return;
    setGalat(null);

    if (!nama.trim() || !pasangan.trim()) {
      setGalat("Isi nama kamu dan nama pasangan.");
      return;
    }

    if (!setuju) {
      setGalat("Centang dulu persetujuan syarat dan kebijakan.");
      return;
    }

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

    /*
     * Akun sudah jadi dan sesi sudah aktif. Rencana pertama dibuat di sini
     * supaya nama pasangan tersimpan. Kalau langkah ini gagal, pendaftaran
     * tetap dianggap berhasil: namanya masih bisa diisi ulang di halaman
     * Rencana, jadi orang tidak perlu mengulang dari awal.
     */
    try {
      await minta("/api/plans", {
        method: "POST",
        body: { partnerName: pasangan.trim() },
      });
    } catch {
      // Diamkan. Nama pasangan bisa diisi lagi di halaman Rencana.
    }

    router.replace("/beranda");
    router.refresh();
  }

  return (
    <>
      <h1 className="sr-only">Daftar</h1>

      <form onSubmit={kirim} noValidate className="auth-form">
        <div className="isian-grup">
          <div className="auth-label-baris">
            <label htmlFor="nama">Nama Kamu</label>
            <span className="auth-label-aksen">Calon Mempelai</span>
          </div>
          <div className="auth-isian-bungkus">
            <span className="auth-isian-ikon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
            </span>
            <input
              id="nama"
              className="isian"
              type="text"
              autoComplete="name"
              placeholder="misal: Sarah Wijaya"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
        </div>

        <div className="isian-grup">
          <div className="auth-label-baris">
            <label htmlFor="pasangan">Nama Pasangan Impian</label>
            <span className="auth-label-aksen" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
          </div>
          <div className="auth-isian-bungkus">
            <span className="auth-isian-ikon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3h12l4 6-10 12L2 9z" />
                <path d="M2 9h20" />
                <path d="m8 3 4 6 4-6" />
                <path d="m12 21-4-12" />
                <path d="m12 21 4-12" />
              </svg>
            </span>
            <input
              id="pasangan"
              className="isian"
              type="text"
              autoComplete="off"
              placeholder="misal: Dimas Pratama"
              required
              value={pasangan}
              onChange={(e) => setPasangan(e.target.value)}
            />
          </div>
        </div>

        <div className="isian-grup">
          <label htmlFor="email">Email Bersama / Utama</label>
          <div className="auth-isian-bungkus">
            <span className="auth-isian-ikon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                <path d="m3.5 7 8.5 6 8.5-6" />
              </svg>
            </span>
            <input
              id="email"
              className="isian"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="email"
              placeholder="cinta@kisahkita.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <IsianSandi
          label="Kata Sandi Rahasia"
          nilai={sandi}
          onUbah={setSandi}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          minLength={8}
          petunjuk="Minimal 8 karakter."
        />

        <label className="auth-syarat">
          <input
            type="checkbox"
            className="auth-syarat-kotak"
            checked={setuju}
            onChange={(e) => setSetuju(e.target.checked)}
            required
          />
          <span className="auth-syarat-tanda" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
          </span>
          <span className="auth-syarat-teks">
            Saya &amp; pasangan setuju dengan <strong>Syarat &amp; Kebijakan Manis</strong> Hari
            Besar {"\ud83d\udc8c"}
          </span>
        </label>

        {galat ? <PesanGalat teks={galat} /> : null}

        <button
          type="submit"
          className="tombol tombol-lebar auth-tombol-daftar"
          disabled={sedangJalan}
        >
          {sedangJalan ? (
            <span className="auth-loading-teks">
              <span className="auth-spinner" aria-hidden="true" />
              Sedang membuat akun...
            </span>
          ) : (
            "Buat Akun Pernikahan Kami \ud83c\udf38"
          )}
        </button>
      </form>

      <p className="auth-kaki">
        Sudah punya akun?{" "}
        <Link className="tautan-kalimat" href="/masuk">
          Masuk di sini {"\ud83d\udc95"}
        </Link>
      </p>
    </>
  );
}
