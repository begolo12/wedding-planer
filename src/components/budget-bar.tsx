import { Rupiah } from "./rupiah";
import { persen, rupiah } from "@/lib/format";

/**
 * Porsi uang yang sudah terpakai.
 *
 * Ini bukan grafik, cuma satu batang tipis. Jumlah pos anggaran biasanya
 * belasan, jadi batang per pos tidak menambah apa pun yang belum terbaca dari
 * angkanya. Batang di sini menjawab satu pertanyaan saja: sudah berapa persen.
 *
 * Kalau terpakai melebihi batas, batangnya penuh dan warnanya berubah jadi
 * bata. Angkanya tetap ditulis apa adanya, termasuk kelebihannya, karena
 * menyembunyikan kelebihan justru yang bikin orang salah hitung.
 */
export function BudgetBar({
  terpakai,
  batas,
  label,
  ringkas = false,
}: {
  terpakai: number;
  batas: number;
  label?: string;
  ringkas?: boolean;
}) {
  const lewat = batas > 0 && terpakai > batas;
  const lebar = persen(terpakai, batas);
  const sisa = batas - terpakai;

  return (
    <div>
      {label || !ringkas ? (
        <div className="bar-kepala">
          <span className="label-bagian">{label ?? "Terpakai"}</span>
          <span className="keterangan-mini">
            <Rupiah nilai={terpakai} /> dari <Rupiah nilai={batas} />
          </span>
        </div>
      ) : null}

      <div
        className="bar"
        role="meter"
        aria-valuenow={lebar}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Terpakai ${lebar} persen dari batas`}
      >
        <div
          className={`bar-isi${lewat ? " bar-isi-lewat" : ""}`}
          style={{ width: `${batas > 0 ? Math.max(2, lebar) : 0}%` }}
        />
      </div>

      <p className="bar-catatan" data-nada={lewat ? "bahaya" : undefined}>
        {batas <= 0
          ? "Batas anggaran belum diisi."
          : lewat
            ? `Lebih ${rupiah(Math.abs(sisa))} dari yang direncanakan.`
            : `Sisa ${rupiah(sisa)}, ${lebar} persen terpakai.`}
      </p>
    </div>
  );
}
