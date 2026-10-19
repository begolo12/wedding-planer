"use client";

import { useEffect, useState } from "react";

const KUNCI = "haribesar-tema";

/**
 * Tema disimpan di localStorage, bukan di cookie, karena tidak ada server
 * yang perlu tahu. Skrip di layout sudah memasang tema sebelum React jalan,
 * jadi tombol ini hanya menyamakan tampilannya.
 */
export function ThemeToggle() {
  const [gelap, setGelap] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    // Tanpa atribut, tema ditentukan sistem. Tombol harus menunjukkan keadaan
    // yang benar-benar terlihat, bukan selalu "terang".
    const atribut = document.documentElement.dataset.theme;
    setGelap(
      atribut
        ? atribut === "gelap"
        : window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
    setSiap(true);
  }, []);

  function ganti() {
    const berikut = !gelap;
    setGelap(berikut);
    document.documentElement.dataset.theme = berikut ? "gelap" : "terang";
    try {
      localStorage.setItem(KUNCI, berikut ? "gelap" : "terang");
    } catch {
      // Mode penyamaran bisa menolak localStorage. Tema tetap jalan sampai
      // halaman dimuat ulang, dan itu cukup.
    }
  }

  return (
    <button
      type="button"
      className="ikon-tombol"
      data-theme-control="true"
      onClick={ganti}
      aria-pressed={siap ? gelap : undefined}
      title={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      <span className="tema-ikon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {gelap ? (
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10L5.6 18.4" />
            </>
          )}
        </svg>
      </span>
      <span className="sr-only">
        {gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      </span>
    </button>
  );
}
