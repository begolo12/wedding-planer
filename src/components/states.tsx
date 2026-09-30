import type { ReactNode } from "react";

/**
 * Empat tampilan wajib tiap data dari DESIGN.md R-27: isi, kosong, memuat,
 * gagal, plus luring. Ditulis sekali di sini supaya tidak ada layar yang
 * lupa salah satunya.
 */

/** Memuat. Bentuknya sama dengan isi, jadi tata letaknya tidak melompat. */
export function Kerangka({ baris = 4 }: { baris?: number }) {
  return (
    <div className="kerangka-grup" aria-busy="true" aria-live="polite">
      <span className="sr-only">Sedang memuat</span>
      {Array.from({ length: baris }).map((_, i) => (
        <div
          key={i}
          className="kerangka"
          style={{ height: i === 0 ? 44 : 20, width: i === 0 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

/**
 * Kosong. Selalu dua kalimat: keadaan, lalu jalan keluar. Satu kalimat saja
 * membuat orang berhenti di layar itu.
 */
export function Kosong({
  keadaan,
  jalanKeluar,
  children,
}: {
  keadaan: string;
  jalanKeluar: string;
  children?: ReactNode;
}) {
  return (
    <div className="kosong">
      <p className="kosong-judul">{keadaan}</p>
      <p>{jalanKeluar}</p>
      {children ? <div className="kosong-aksi">{children}</div> : null}
    </div>
  );
}

/**
 * Gagal. Menyebut tindakan yang gagal, lalu menyalahkan server, bukan
 * orang yang sedang menunggu.
 */
export function Gagal({
  apa = "Data ini",
  onCoba,
}: {
  apa?: string;
  onCoba?: () => void;
}) {
  return (
    <div className="kosong">
      <p className="kosong-judul">{apa} gagal dimuat.</p>
      <p>Bukan salahmu, coba lagi.</p>
      {onCoba ? (
        <div className="kosong-aksi">
          <button type="button" className="tombol tombol-sekunder" onClick={onCoba}>
            Coba lagi
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Baris pesan galat kecil, untuk kegagalan yang tidak menghapus seluruh layar. */
export function PesanGalat({ teks }: { teks: string }) {
  return (
    <p className="pesan-galat" role="alert">
      <span aria-hidden="true">{"\u25B2"}</span> {teks}
    </p>
  );
}
