"use client";

import { useState, type ReactNode } from "react";
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
 * Isian kata sandi dengan tombol intip terintegrasi.
 * Tombol intip berada di dalam kolom untuk menghemat ruang vertikal
 * dan memiliki target sentuh minimal 44x44px.
 */
export function IsianSandi({
  id = "sandi",
  label = "Kata sandi",
  nilai,
  onUbah,
  petunjuk,
  galat,
  autoComplete = "current-password",
  placeholder = "Masukkan kata sandi",
  required = true,
  minLength,
}: {
  id?: string;
  label?: string;
  nilai: string;
  onUbah: (nilai: string) => void;
  petunjuk?: string;
  galat?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [lihat, setLihat] = useState(false);

  return (
    <Isian label={label} id={id} petunjuk={petunjuk} galat={galat}>
      <div className="auth-sandi-bungkus">
        <input
          id={id}
          className="isian"
          type={lihat ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          value={nilai}
          onChange={(e) => onUbah(e.target.value)}
        />
        <button
          type="button"
          className="auth-tombol-mata"
          onClick={() => setLihat((v) => !v)}
          aria-pressed={lihat}
          aria-label={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
          title={lihat ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
        >
          {lihat ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </Isian>
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
