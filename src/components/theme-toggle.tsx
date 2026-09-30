"use client";

import { useEffect, useState } from "react";

const KUNCI = "aisyah-theme";

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
      onClick={ganti}
      aria-pressed={siap ? gelap : undefined}
      title={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      <span aria-hidden="true">{gelap ? "\u25D1" : "\u25D0"}</span>
      <span className="sr-only">
        {gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      </span>
    </button>
  );
}
