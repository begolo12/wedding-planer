"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { minta } from "./api-client";

/**
 * Pengambil data untuk layar yang perlu memuat ulang tanpa pindah halaman.
 *
 * Ditulis satu kali karena empat keadaan (memuat, isi, kosong, gagal) harus
 * selalu ada berbarengan. Kalau tiap layar menulis sendiri, cepat atau lambat
 * ada layar yang lupa keadaan gagal, dan layar itu terlihat rusak saat server
 * sedang bermasalah.
 *
 * `muatUlang` sengaja mengembalikan Promise supaya pemanggil bisa menunggu
 * sebelum menampilkan pesan berhasil.
 */
export type HasilMuat<T> = {
  data: T | null;
  memuat: boolean;
  galat: string | null;
  muatUlang: () => Promise<void>;
  /** Ganti data yang ada tanpa memanggil server, dipakai setelah simpan. */
  setData: (nilai: T | null) => void;
};

export function useMuat<T>(url: string | null, opsi: { aktif?: boolean } = {}): HasilMuat<T> {
  const aktif = opsi.aktif ?? true;
  const [data, setData] = useState<T | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  // Dipakai untuk membatalkan permintaan lama saat URL berubah cepat, misalnya
  // saat orang mengetik di kolom pencarian.
  const kendali = useRef<AbortController | null>(null);

  const jalan = useCallback(
    async (tampilkanMemuat: boolean) => {
      if (!url || !aktif) {
        setMemuat(false);
        return;
      }
      kendali.current?.abort();
      const c = new AbortController();
      kendali.current = c;

      if (tampilkanMemuat) setMemuat(true);
      try {
        const hasil = await minta<T>(url, { signal: c.signal });
        setData(hasil);
        setGalat(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setGalat(pesanRingkas(err));
      } finally {
        if (!c.signal.aborted) setMemuat(false);
      }
    },
    [url, aktif],
  );

  useEffect(() => {
    void jalan(true);
    return () => kendali.current?.abort();
  }, [jalan]);

  const muatUlang = useCallback(async () => {
    await jalan(false);
  }, [jalan]);

  return { data, memuat, galat, muatUlang, setData };
}

function pesanRingkas(err: unknown): string {
  if (err && typeof err === "object" && "pesan" in err) return String((err as { pesan: string }).pesan);
  if (err instanceof Error) return err.message;
  return "Ada yang tidak beres. Coba lagi sebentar.";
}
