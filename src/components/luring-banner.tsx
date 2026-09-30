"use client";

import { useEffect, useState } from "react";
import { cekKoneksi, jumlahAntrean, kirimAntrean } from "@/lib/luring";

/**
 * Bar tipis di bawah layar yang memberi tahu keadaan sambungan.
 *
 * Muncul hanya kalau memang ada yang perlu diberitahukan: sedang luring, ada
 * antrean menunggu, atau baru saja selesai mengirim. Bar yang selalu ada
 * walaupun semua normal cuma jadi hiasan yang mengganggu.
 *
 * Cek koneksi dilakukan tiap 30 detik dan tiap kali tab kembali aktif.
 * `navigator.onLine` tidak dipakai sendirian karena browser sering melaporkan
 * online di Wi-Fi yang sudah tidak punya internet.
 */
export function LuringBanner() {
  const [luring, setLuring] = useState(false);
  const [antrean, setAntrean] = useState(0);
  const [mengirim, setMengirim] = useState(false);
  const [pesanSelesai, setPesanSelesai] = useState<string | null>(null);

  useEffect(() => {
    let hidup = true;

    async function periksa() {
      const tersambung = await cekKoneksi();
      if (!hidup) return;
      setLuring(!tersambung);
      setAntrean(await jumlahAntrean());

      if (tersambung) {
        const menunggu = await jumlahAntrean();
        if (menunggu > 0) {
          setMengirim(true);
          const hasil = await kirimAntrean();
          if (!hidup) return;
          setMengirim(false);
          setAntrean(hasil.tersisa);
          if (hasil.terkirim > 0) {
            setPesanSelesai(
              hasil.tersisa === 0
                ? "Semua perubahan sudah terkirim."
                : `${hasil.terkirim} perubahan terkirim, ${hasil.tersisa} masih menunggu.`,
            );
            setTimeout(() => hidup && setPesanSelesai(null), 4000);
          }
        }
      }
    }

    periksa();
    const jam = setInterval(periksa, 30_000);
    const saatAktif = () => document.visibilityState === "visible" && periksa();
    document.addEventListener("visibilitychange", saatAktif);

    return () => {
      hidup = false;
      clearInterval(jam);
      document.removeEventListener("visibilitychange", saatAktif);
    };
  }, []);

  if (!luring && antrean === 0 && !pesanSelesai) return null;

  const teks = luring
    ? antrean > 0
      ? `Luring. ${antrean} perubahan disimpan dan dikirim setelah ada internet.`
      : "Luring. Perubahan akan disimpan dan dikirim nanti."
    : mengirim
      ? "Mengirim perubahan yang tertunda."
      : (pesanSelesai ?? `${antrean} perubahan menunggu dikirim.`);

  return (
    <div className="pita-luring" data-nada={luring ? "luring" : "info"} role="status">
      <span>{teks}</span>
      {!luring && antrean > 0 && !mengirim ? (
        <button
          type="button"
          className="tombol tombol-halus"
          onClick={async () => {
            setMengirim(true);
            const hasil = await kirimAntrean();
            setMengirim(false);
            setAntrean(hasil.tersisa);
          }}
        >
          Kirim sekarang
        </button>
      ) : null}
    </div>
  );
}
