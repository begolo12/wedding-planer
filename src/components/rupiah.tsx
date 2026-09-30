import { rupiah } from "@/lib/format";

/**
 * Angka rupiah selalu ditulis dengan komponen ini, karena komponen ini yang
 * memakai tabular-nums. Tanpa itu, kolom nominal tidak sejajar dan tidak
 * bisa dibandingkan sekali lihat.
 */
export function Rupiah({
  nilai,
  className,
  negatifMerah = true,
}: {
  nilai: number | null | undefined;
  className?: string;
  negatifMerah?: boolean;
}) {
  const angka = Math.round(Number(nilai ?? 0));
  const minus = angka < 0 && negatifMerah;
  return (
    <span className={`angka ${className ?? ""}`} data-minus={minus ? "ya" : undefined}>
      {rupiah(angka)}
    </span>
  );
}

/** Persen dengan lebar angka tetap, supaya tidak bergetar saat nilainya berubah. */
export function Persen({ nilai }: { nilai: number }) {
  return <span className="angka">{nilai} persen</span>;
}
