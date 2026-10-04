"use client";

import { Gagal } from "@/components/states";

/**
 * Batas error paling luar. Dipakai kalau layout root sendiri gagal, jadi
 * komponen ini harus merender <html> dan <body> sendiri.
 *
 * Bentuk pesannya memakai komponen `Gagal` yang sama dengan
 * `src/app/error.tsx` supaya pengguna melihat layar yang sama, bukan dua
 * gaya galat yang berbeda.
 *
 * Gaya inline di bawah ini sengaja ditulis ulang seadanya: global-error
 * menggantikan layout root, dan `globals.css` tidak dijamin ikut termuat saat
 * root gagal. Tanpa gaya cadangan ini, layar bisa tampil tanpa warna dan
 * tanpa jarak, dan pesannya jadi sulit dibaca. Warnanya sama dengan token
 * di `globals.css`, bukan warna baru.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          padding: "48px 16px",
          background: "#fffdf9",
          color: "#4a3b43",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "16px",
          lineHeight: 1.5,
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <Gagal apa="Aplikasi" onCoba={reset} />
        </div>
      </body>
    </html>
  );
}
