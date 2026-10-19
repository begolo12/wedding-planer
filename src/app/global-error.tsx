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
 * tanpa jarak, dan pesannya jadi sulit dibaca. Dua nilai warnanya diambil
 * dari token `--color-base` dan `--color-ink` di `globals.css`, bukan warna
 * baru, supaya layar gagal tidak terasa asing dari aplikasi.
 *
 * Mode gelap tidak bisa mengandalkan atribut `data-theme`, karena skrip tema
 * ada di layout root yang justru sedang gagal. Karena itu pasangan gelapnya
 * ditulis lewat `<style>` dengan `prefers-color-scheme`, satu-satunya sinyal
 * tema yang masih bisa dipercaya di sini. Tanpa ini, layar gagal menyala
 * terang di perangkat gelap.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "@media (prefers-color-scheme: dark){body{background:#0e0e14;color:#edebe6}}",
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: "48px 16px",
          background: "#f4f2ea",
          color: "#1b1b21",
          colorScheme: "light dark",
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
