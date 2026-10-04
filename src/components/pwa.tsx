"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Dua hal yang hanya jalan di peramban: mendaftarkan Service Worker dan
 * menawarkan pemasangan ke layar utama. Keduanya dipisah dari komponen lain
 * karena tidak menyentuh data.
 *
 * Service Worker didaftarkan setelah `load`, bukan saat komponen dipasang,
 * supaya unduhan dan penguraian skrip tidak berebut jatah jaringan dengan
 * halaman pertama. Tanpa pendaftaran ini file public/sw.js tidak pernah jalan,
 * dan seluruh perilaku luring yang dijanjikan tidak aktif.
 */
export function DaftarServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const daftar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Pendaftaran gagal (misalnya peramban lama). Aplikasi tetap jalan,
        // hanya tanpa luring, dan itu lebih baik daripada memblokir halaman.
      });
    };
    if (document.readyState === "complete") daftar();
    else window.addEventListener("load", daftar);
    return () => window.removeEventListener("load", daftar);
  }, []);

  return null;
}

/**
 * Ajakan memasang aplikasi ke layar utama.
 *
 * Android dan iOS diperlakukan berbeda karena memang berbeda. Chrome punya
 * `beforeinstallprompt` yang bisa dipanggil, Safari tidak punya sama sekali.
 * Di iOS satu-satunya jalan adalah tombol Bagikan lalu "Tambah ke Layar
 * Utama", jadi yang ditampilkan instruksi, bukan tombol yang mengira dirinya
 * bisa memasang aplikasi.
 *
 * Ajakan ini bisa ditutup dan tidak muncul lagi. Orang yang sudah pernah
 * menolak tidak perlu ditanya dua kali.
 */

const KUNCI_TOLAK = "haribesar-install-ditolak";

type PeristiwaPasang = Event & { prompt: () => Promise<void> };

export function InstallPrompt() {
  const [peristiwa, setPeristiwa] = useState<PeristiwaPasang | null>(null);
  const [ios, setIos] = useState(false);
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KUNCI_TOLAK) === "ya") return;

    // Sudah dipasang: jalan di jendela sendiri, bukan di dalam tab browser.
    const sudahDIPasang =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (sudahDIPasang) return;

    const ua = window.navigator.userAgent;
    const perangkatIos = /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (perangkatIos) {
      setIos(true);
      setTampil(true);
      return;
    }

    const tangkap = (e: Event) => {
      e.preventDefault();
      setPeristiwa(e as PeristiwaPasang);
      setTampil(true);
    };
    window.addEventListener("beforeinstallprompt", tangkap);
    return () => window.removeEventListener("beforeinstallprompt", tangkap);
  }, []);

  function tolak() {
    localStorage.setItem(KUNCI_TOLAK, "ya");
    setTampil(false);
  }

  if (!tampil) return null;

  return (
    <div className="pita tanpa-cetak">
      <span className="pita-isi">
        {ios ? (
          <>
            Biar bisa dibuka tanpa internet: ketuk Bagikan, lalu pilih Tambah ke
            Layar Utama.{" "}
            <Link className="tautan-kalimat" href="/aplikasi">
              Cara memasang
            </Link>
          </>
        ) : (
          <>
            Pasang aplikasinya biar rundown, tamu, dan catatan pembayaran tetap
            terbuka saat sinyal di venue hilang.{" "}
            <Link className="tautan-kalimat" href="/aplikasi">
              Selengkapnya
            </Link>
          </>
        )}
      </span>

      {ios ? null : peristiwa ? (
        <button
          type="button"
          className="tombol tombol-sekunder"
          onClick={async () => {
            await peristiwa.prompt();
            setTampil(false);
          }}
        >
          Pasang
        </button>
      ) : null}

      <button type="button" className="tombol tombol-halus" onClick={tolak}>
        Nanti saja
      </button>
    </div>
  );
}