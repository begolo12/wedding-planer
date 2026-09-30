"use client";

import { useEffect, useState, type ReactNode } from "react";

const NAMA_EVENT = "haribesar-toast";

/**
 * Toast tanpa pustaka. Dipanggil dari mana saja, termasuk dari kode non-React,
 * karena hanya mengirim event di window.
 */
export function toast(pesan: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NAMA_EVENT, { detail: pesan }));
}

type Pesan = { id: number; teks: string };

export function ToastHost() {
  const [daftar, setDaftar] = useState<Pesan[]>([]);

  useEffect(() => {
    let urut = 0;
    function dengar(e: Event) {
      const teks = (e as CustomEvent<string>).detail;
      if (!teks) return;
      const id = ++urut;
      setDaftar((lama) => [...lama, { id, teks }]);
      setTimeout(() => setDaftar((lama) => lama.filter((p) => p.id !== id)), 3000);
    }
    window.addEventListener(NAMA_EVENT, dengar);
    return () => window.removeEventListener(NAMA_EVENT, dengar);
  }, []);

  if (daftar.length === 0) return null;

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {daftar.map((p) => (
        <div key={p.id} className="toast">
          {p.teks}
        </div>
      ))}
    </div>
  );
}

/**
 * Dialog konfirmasi memakai elemen `<dialog>` bawaan, bukan pustaka modal.
 * Alasannya: Escape, fokus terkunci, dan lapisan atas sudah ditangani browser.
 */
export function DialogKonfirmasi({
  buka,
  judul,
  isi,
  tombolYa,
  onTutup,
  onYa,
  sedangJalan,
}: {
  buka: boolean;
  judul: string;
  isi: string;
  tombolYa: string;
  onTutup: () => void;
  onYa: () => void;
  sedangJalan?: boolean;
}) {
  return (
    <dialog
      className="dialog"
      open={buka}
      onCancel={(e) => {
        e.preventDefault();
        onTutup();
      }}
    >
      <h2>{judul}</h2>
      <p>{isi}</p>
      <div className="dialog-tombol">
        <button type="button" className="tombol tombol-sekunder" onClick={onTutup}>
          Batal
        </button>
        <button
          type="button"
          className="tombol tombol-utama"
          onClick={onYa}
          disabled={sedangJalan}
        >
          {sedangJalan ? "Sebentar..." : tombolYa}
        </button>
      </div>
    </dialog>
  );
}

/** Panel geser dari bawah di HP, dialog di layar lebar. Satu bentuk saja. */
export function Lembar({
  buka,
  judul,
  onTutup,
  children,
}: {
  buka: boolean;
  judul: string;
  onTutup: () => void;
  children: ReactNode;
}) {
  if (!buka) return null;
  return (
    <div className="lembar-lapis" role="presentation" onClick={onTutup}>
      <div
        className="lembar"
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lembar-gagang" aria-hidden="true" />
        <div className="lembar-kepala">
          <h2>{judul}</h2>
          <button type="button" className="ikon-tombol" onClick={onTutup} aria-label="Tutup">
            <span aria-hidden="true">{"\u00D7"}</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
