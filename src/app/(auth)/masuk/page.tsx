"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { PesanGalat } from "@/components/states";
import { IsianSandi } from "@/components/field";
import { TombolGoogle } from "@/components/tombol-google";
import { NAMA_PRODUK } from "@/lib/konstanta";

/**
 * Masuk pakai email dan kata sandi.
 *
 * Kotak "Ingat saya" hanya menyimpan email di localStorage dan mengisinya
 * lagi lain kali. Sesi sendiri sudah disimpan oleh auth-client, jadi kotak
 * ini tidak mengubah cara masuk, hanya menghemat mengetik.
 *
 * Tidak ada tombol "lupa kata sandi" dan tidak ada tombol masuk lewat Google
 * atau Apple, karena belum ada pengiriman email dan belum ada penyedia
 * masuk sosial di tahap ini. Tombol yang tidak berfungsi lebih buruk
 * daripada tidak ada tombol.
 */
export default function HalamanMasuk() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [ingat, setIngat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sedangJalan, setSedangJalan] = useState(false);

  /*
   * Email yang tersimpan dibaca setelah halaman terpasang, bukan saat
   * render pertama. Kalau dibaca di dalam useState, server tidak punya
   * localStorage dan selalu merender kotak dalam keadaan kosong; React
   * lalu tidak memasang ulang properti `checked` saat hidrasi, jadi
   * kotaknya tetap terlihat kosong walau atributnya ada. Membacanya di
   * sini membuat hasil server dan hasil klien sama dulu, baru diisi.
   */
  useEffect(() => {
    try {
      const tersimpan = window.localStorage.getItem("haribesar-email-ingat");
      if (tersimpan !== null) {
        setEmail(tersimpan);
        setIngat(true);
      }
    } catch {
      // localStorage bisa ditolak di mode penyamaran. Cukup dilewati.
    }
  }, []);

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
        const err = error as { code?: string; status?: number };
        if (err.status === 429 || err.code === "RATE_LIMITED") {
          setGalat("Terlalu banyak percobaan. Coba lagi sebentar lagi.");
          return;
        }
        // Email yang belum terdaftar dan sandi yang salah dibalas sama,
        // supaya layar ini tidak bisa dipakai menebak siapa yang punya akun.
        setGalat("Email atau kata sandi belum cocok.");
        return;
      }

      simpanIngat(ingat, email.trim());
      router.replace("/beranda");
      router.refresh();
    } catch {
      setSedangJalan(false);
      setGalat("Gagal menghubungi server. Periksa koneksi internet.");
    }
  }

  return (
    <>
      <h1 className="sr-only">Masuk</h1>

      <form onSubmit={kirim} noValidate className="auth-form">
        <div className="isian-grup">
          <div className="auth-label-baris">
            <label htmlFor="email">Email Pasangan</label>
            <span className="auth-label-aksen">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Akun berdua
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
              placeholder="contoh: romeo.juliet@rapinikah.id"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <IsianSandi
          label="Kata Sandi"
          nilai={sandi}
          onUbah={setSandi}
          placeholder="Minimal 8 karakter"
        />

        <div className="auth-baris-bantu">
          <label className="auth-ingat">
            <input
              type="checkbox"
              className="auth-ingat-kotak"
              checked={ingat}
              onChange={(e) => setIngat(e.target.checked)}
            />
            <span className="auth-ingat-tanda" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
            Ingat Saya
          </label>
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
            `Masuk ke ${NAMA_PRODUK}`
          )}
        </button>

        <div className="auth-pemisah" role="separator" aria-label="pilihan masuk lain">
          <span className="auth-pemisah-garis" aria-hidden="true" />
          <span className="auth-pemisah-teks">ATAU</span>
          <span className="auth-pemisah-garis" aria-hidden="true" />
        </div>

        <TombolGoogle label="Masuk dengan Google" onError={setGalat} />
      </form>

      <p className="auth-kaki">
        Belum punya akun?{" "}
        <Link className="tautan-kalimat" href="/daftar">
          Daftar Sekarang
        </Link>
      </p>
    </>
  );
}

/**
 * Menyimpan email untuk lain kali. localStorage bisa ditolak di mode
 * penyamaran, dan kalau itu terjadi kotak "ingat saya" cukup tidak
 * berpengaruh sampai halaman dimuat ulang.
 */
function simpanIngat(ingat: boolean, email: string) {
  try {
    if (ingat) {
      window.localStorage.setItem("haribesar-email-ingat", email);
    } else {
      window.localStorage.removeItem("haribesar-email-ingat");
    }
  } catch {
    // Tidak perlu diberitahukan. Ini kenyamanan, bukan data penting.
  }
}
