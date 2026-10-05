"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cekKoneksi, buangItemMacet, itemMacet, jumlahAntrean, kirimAntrean } from "@/lib/luring";
import { bersihkanAntreanPenuh, catatLuring, useStatusLuring } from "@/lib/status-luring";

/**
 * Bar tipis di bawah layar yang memberi tahu keadaan sambungan.
 *
 * Muncul kalau memang ada yang perlu diberitahukan. Pemicunya dua kelompok:
 *
 * 1. Data sedang atau pernah tidak datang dari jaringan. Ini yang diminta
 *    docs/05 bagian 6: pita tipis "Menampilkan data dari perangkat". Pemicunya
 *    bukan hanya "sedang luring", tapi juga "sudah pernah gagal menyambung
 *    sejak halaman ini dibuka". Alasannya: begitu koneksi putus sebentar
 *    (sinyal di lokasi yang jelek), data yang tampil sudah bukan dari
 *    jaringan, walaupun sedetik kemudian jaringan kembali dan cek berikutnya
 *    sudah hijau. Kalau bendera itu tidak disimpan, pita justru hilang tepat
 *    saat datanya masih dari perangkat.
 *
 * 2. Ada antrean atau hasil pengiriman yang perlu dibaca orangnya. Isinya
 *    dibaca dari src/lib/status-luring.ts, satu jalur data yang diisi
 *    src/lib/luring.ts. Yang muncul: sesi habis (docs/14 baris 184),
 *    perubahan gagal beserta pesannya (baris 206), dan antrean penuh beserta
 *    jumlah yang dibuang (baris 207, docs/18 bagian 4).
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
  const [macet, setMacet] = useState(0);
  const { perluMasuk, gagal, pesanGagal, dibuang, dariPerangkat } = useStatusLuring();

  useEffect(() => {
    let hidup = true;

    async function periksa() {
      const tersambung = await cekKoneksi();
      if (!hidup) return;
      setLuring(!tersambung);
      // Item yang sudah menembus batas percobaan tidak lagi dikirim otomatis.
      // Jumlahnya dibaca di sini supaya pita bisa menawarkan tombol buang,
      // bukan membiarkannya macet tanpa jalan keluar.
      setMacet((await itemMacet()).length);
      // Penjaga koneksi ini penulis tunggal status luring untuk seluruh layar.
      // Tanpa ini, useStatusLuring().luring selalu false dan tombol ubah tidak
      // pernah disembunyikan saat data dibaca dari perangkat.
      catatLuring(!tersambung);
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

  async function kirimUlang() {
    setMengirim(true);
    const hasil = await kirimAntrean();
    setMengirim(false);
    setAntrean(hasil.tersisa);
    setMacet((await itemMacet()).length);
    if (hasil.terkirim > 0 && hasil.tersisa === 0) setPesanSelesai("Semua perubahan sudah terkirim.");
  }

  /** Buang item yang sudah tidak bisa dikirim otomatis, supaya antrean bersih. */
  async function buangMacet() {
    const dibuangMacet = await buangItemMacet();
    setMacet(0);
    setAntrean(await jumlahAntrean());
    if (dibuangMacet > 0) setPesanSelesai(`${dibuangMacet} perubahan yang macet dibuang.`);
  }

  // Pemicu utama dari src/lib/status-luring.ts, diisi src/lib/api-client.ts:
  // true berarti pembacaan data terakhir dilayani dari cadangan perangkat.
  // `luring` dipakai sebagai cadangan supaya pita tetap muncul begitu
  // perangkat kehilangan koneksi, sebelum jalur data sempat terisi.
  const tampilkanPerangkat = dariPerangkat || luring;
  if (!tampilkanPerangkat && antrean === 0 && !pesanSelesai && !perluMasuk && gagal === 0 && dibuang === 0) {
    return null;
  }

  let teks: string;
  let nada = "info";
  if (perluMasuk) {
    teks = "Sesi kamu sudah habis. Masuk lagi untuk melanjutkan.";
    nada = "bahaya";
  } else if (dibuang > 0) {
    teks = `Antrean penuh. Perubahan lama yang belum terkirim dibuang (${dibuang} item).`;
    nada = "bahaya";
  } else if (gagal > 0) {
    teks = macet > 0
      ? `${macet} perubahan tidak bisa dikirim otomatis dan perlu perhatian. ${pesanGagal ?? ""}`.trim()
      : pesanGagal
        ? `Satu perubahan gagal dikirim dan perlu dikirim ulang manual. ${pesanGagal}`
        : "Satu perubahan gagal dikirim dan perlu dikirim ulang manual.";
    nada = "bahaya";
  } else if (tampilkanPerangkat) {
    teks = antrean > 0
      ? `Menampilkan data dari perangkat. ${antrean} perubahan menunggu dikirim.`
      : "Menampilkan data dari perangkat.";
    if (luring) nada = "luring";
  } else if (mengirim) {
    teks = "Mengirim perubahan yang tertunda.";
  } else {
    teks = pesanSelesai ?? `${antrean} perubahan menunggu dikirim.`;
  }

  return (
    <div className="pita-luring" data-nada={nada} role="status">
      <span>{teks}</span>

      {perluMasuk ? (
        <Link className="tombol tombol-halus" href="/masuk">
          Masuk lagi
        </Link>
      ) : dibuang > 0 ? (
        <button type="button" className="tombol tombol-halus" onClick={bersihkanAntreanPenuh}>
          Tutup
        </button>
      ) : gagal > 0 && macet > 0 ? (
        // Item yang macet tidak akan berhasil dikirim ulang, jadi tombolnya
        // "Buang", bukan "Kirim ulang". Tanpa jalan keluar ini, satu item
        // berisi data yang ditolak server menahan antrean selamanya.
        <button
          type="button"
          className="tombol tombol-halus"
          onClick={() => void buangMacet()}
        >
          Buang yang macet
        </button>
      ) : gagal > 0 ? (
        <button type="button" className="tombol tombol-halus" onClick={kirimUlang} disabled={mengirim}>
          Kirim ulang
        </button>
      ) : !luring && antrean > 0 && !mengirim ? (
        <button type="button" className="tombol tombol-halus" onClick={kirimUlang}>
          Kirim sekarang
        </button>
      ) : null}
    </div>
  );
}
