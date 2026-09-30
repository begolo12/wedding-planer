"use client";

import type { ReactNode } from "react";
import { bacaRupiah, rupiahPolos } from "@/lib/format";

/**
 * Isian berlabel. Label selalu ada, placeholder tidak pernah menggantikannya,
 * karena placeholder hilang begitu orang mulai mengetik dan isian jadi tidak
 * jelas isinya apa.
 *
 * Pesan galat ditaruh tepat di bawah isian yang salah, bukan dikumpulkan di
 * atas form, supaya orang tidak perlu mencari isian mana yang bermasalah.
 */
export function Isian({
  label,
  id,
  petunjuk,
  bantuan,
  galat,
  children,
}: {
  label: string;
  id: string;
  petunjuk?: string;
  bantuan?: string;
  galat?: string;
  children: ReactNode;
}) {
  const teksPetunjuk = petunjuk ?? bantuan;
  return (
    <div className="isian-grup">
      <label htmlFor={id}>{label}</label>
      {children}
      {teksPetunjuk && !galat ? <span className="petunjuk">{teksPetunjuk}</span> : null}
      {galat ? (
        <span className="pesan-galat" role="alert">
          <span aria-hidden="true">{"\u25B2"}</span> {galat}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Isian rupiah.
 *
 * Yang ditampilkan bertitik, yang dikirim angka polos. Titiknya dihitung ulang
 * tiap kali orang mengetik dari angka yang benar benar dibaca, bukan dari teks
 * yang diketik, jadi tidak mungkin ada "Rp 4.5.0.0.000".
 */
export function IsianRupiah({
  nilai,
  onUbah,
  id = "nominal",
  label = "Nominal",
  petunjuk,
  galat,
}: {
  nilai: number;
  onUbah: (nilai: number) => void;
  id?: string;
  label?: string;
  petunjuk?: string;
  galat?: string;
}) {
  return (
    <Isian label={label} id={id} petunjuk={petunjuk} galat={galat}>
      <input
        id={id}
        className="isian angka"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={nilai ? rupiahPolos(nilai) : ""}
        placeholder="0"
        onChange={(e) => onUbah(bacaRupiah(e.target.value))}
      />
    </Isian>
  );
}

/** Dua isian berdampingan di layar lebar, tetap satu kolom di HP. */
export function BarisIsian({ children }: { children: ReactNode }) {
  return <div className="isian-baris isian-baris-2">{children}</div>;
}

/** Pilihan berbentuk tombol, dipakai untuk prio, status, dan kategori singkat. */
export function PilihanTombol<T extends string>({
  label,
  id,
  nilai,
  opsi,
  onUbah,
}: {
  label: string;
  id: string;
  nilai: T;
  opsi: readonly { nilai: T; label: string }[];
  onUbah: (nilai: T) => void;
}) {
  return (
    <div className="isian-grup">
      <span id={id} className="petunjuk" style={{ fontWeight: 600, color: "var(--color-ink)" }}>
        {label}
      </span>
      <div className="filter" role="group" aria-labelledby={id}>
        {opsi.map((o) => (
          <button
            key={o.nilai}
            type="button"
            className="tombol tombol-sekunder"
            aria-pressed={nilai === o.nilai}
            data-aktif={nilai === o.nilai ? "ya" : undefined}
            style={
              nilai === o.nilai
                ? { background: "var(--color-netral)", borderColor: "var(--color-ink)" }
                : undefined
            }
            onClick={() => onUbah(o.nilai)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Pilihan dari daftar tetap. Dipakai untuk kategori dan metode bayar. */
export function Pilih({
  label,
  id,
  nilai,
  onUbah,
  opsi,
  petunjuk,
  galat,
  kosong = false,
}: {
  label: string;
  id: string;
  nilai: string;
  onUbah: (nilai: string) => void;
  opsi: readonly { nilai: string; label: string }[];
  petunjuk?: string;
  galat?: string;
  kosong?: boolean;
}) {
  return (
    <Isian label={label} id={id} petunjuk={petunjuk} galat={galat}>
      <select
        id={id}
        className="isian"
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
      >
        {kosong ? <option value="">Belum dipilih</option> : null}
        {opsi.map((o) => (
          <option key={o.nilai} value={o.nilai}>
            {o.label}
          </option>
        ))}
      </select>
    </Isian>
  );
}
