import { ZONA } from "./konstanta";

const tanggalPanjang = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: ZONA,
});

const tanggalPendek = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: ZONA,
});

const hariSaja = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  timeZone: ZONA,
});

const bulanSaja = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: ZONA,
});

// Format ISO `YYYY-MM-DD`. Dipakai untuk "hari ini" di zona Asia/Jakarta.
// Dibuat sekali di sini supaya tidak ada formatter baru tiap pemanggilan.
const isoTanggal = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** `2026-06-30` jadi `30 Juni 2026`. Dipakai di layar dan dokumen. */
export function tanggalPanjangDari(nilai: string | Date | null | undefined): string {
  if (!nilai) return "Belum ada tanggal";
  const d = typeof nilai === "string" ? bacaTanggal(nilai) : nilai;
  if (!d) return "Belum ada tanggal";
  return tanggalPanjang.format(d);
}

/** Alias untuk format tanggal Indonesia panjang. */
export const formatTanggalId = tanggalPanjangDari;

/** `2026-06-30` jadi `30 Jun 2026`. Dipakai di daftar sempit. */
export function tanggalPendekDari(nilai: string | Date | null | undefined): string {
  if (!nilai) return "-";
  const d = typeof nilai === "string" ? bacaTanggal(nilai) : nilai;
  if (!d) return "-";
  return tanggalPendek.format(d);
}

export function namaHari(nilai: string | Date): string {
  const d = typeof nilai === "string" ? bacaTanggal(nilai) : nilai;
  if (!d) return "-";
  return hariSaja.format(d);
}

export function namaBulan(nilai: string | Date): string {
  const d = typeof nilai === "string" ? bacaTanggal(nilai) : nilai;
  if (!d) return "-";
  return bulanSaja.format(d);
}

/**
 * Tanggal disimpan sebagai tanggal murni tanpa jam, jadi dibaca sebagai UTC
 * supaya pergeseran zona waktu tidak menggeser harinya ke hari sebelumnya.
 */
export function bacaTanggal(nilai: string): Date | null {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nilai);
  if (!cocok) {
    const d = new Date(nilai);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return new Date(Date.UTC(Number(cocok[1]), Number(cocok[2]) - 1, Number(cocok[3])));
}

/** `07:00:00` jadi `07.00`. Jam selalu empat digit tanpa detik. */
export function jamDari(nilai: string | null | undefined): string {
  if (!nilai) return "--.--";
  const bagian = nilai.slice(0, 5).replace(":", ".");
  return bagian.length === 5 ? bagian : "--.--";
}

/** `07:00:00` + durasi jadi `07.00` dan `08.30`. */
export function jamSelesai(startTime: string, durationMinutes: number): string {
  const cocok = /^(\d{2}):(\d{2})/.exec(startTime);
  if (!cocok) return "--.--";
  const total = Number(cocok[1]) * 60 + Number(cocok[2]) + Math.max(0, durationMinutes);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

/** `Rp 4.500.000`. Uang selalu integer rupiah, tidak pernah desimal. */
export function rupiah(nilai: number | null | undefined): string {
  const angka = Math.round(Number(nilai ?? 0));
  const tanda = angka < 0 ? "-" : "";
  const digit = Math.abs(angka).toString();
  const berkelompok = digit.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${tanda}Rp ${berkelompok}`;
}

/** Tanpa awalan `Rp`, untuk sumbu dan label sempit. */
export function rupiahPolos(nilai: number | null | undefined): string {
  return rupiah(nilai).replace("Rp ", "");
}

/**
 * Berapa hari lagi dari hari ini. Negatif berarti sudah lewat.
 *
 * "Hari ini" selalu dihitung di zona Asia/Jakarta, bukan zona proses tempat
 * fungsi ini berjalan. Alasannya: produksi berjalan di server UTC, sedangkan
 * pengguna di WIB. Kalau memakai zona proses, antara pukul 00.00 dan 07.00 WIB
 * server masih menganggapnya kemarin, sehingga tugas yang jatuh tempo hari ini
 * terbaca "besok" dan tugas yang lewat sehari terbaca "hari ini". Patokan
 * Asia/Jakarta dipilih karena docs/02-Domain-Spec.md bagian prinsip 3
 * menetapkan setiap tanggal memakai zona itu. Hasilnya sekarang sama di zona
 * proses mana pun.
 *
 * `Date` yang dikirim dibaca sebagai UTC (bentuk yang dihasilkan
 * `bacaTanggal`), jadi tanggal murni tidak digeser lagi oleh zona.
 */
export function selisihHari(tanggal: string | Date | null | undefined): number | null {
  if (!tanggal) return null;
  const target = typeof tanggal === "string" ? bacaTanggal(tanggal) : tanggal;
  if (!target) return null;
  const awalHariIni = bacaTanggal(hariIni());
  if (!awalHariIni) return null;
  const awalTarget = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );
  return Math.round((awalTarget - awalHariIni.getTime()) / 86_400_000);
}

/** `371 hari` dengan tulisannya yang enak dibaca. */
export function hitungMundur(nilai: string | Date | null | undefined): string {
  const hari = selisihHari(nilai);
  if (hari === null) return "belum ada tanggal";
  if (hari === 0) return "hari ini";
  if (hari === 1) return "besok";
  if (hari === -1) return "kemarin";
  if (hari > 0) return `${hari} hari`;
  return `${Math.abs(hari)} hari lewat`;
}

/**
 * `Rp 4.500.000` jadi `4500000`. Dipakai saat membaca isian pengguna.
 *
 * Aturan yang diterapkan, dan alasannya:
 * - `Rp`, spasi (termasuk spasi tak-putus), dan garis bawah dibuang lebih dulu.
 * - Pemisah ribuan titik dan desimal koma dibaca sesuai kebiasaan Indonesia:
 *   `4.500.000` = 4.500.000, `1.500.000,50` = 1.500.000,5.
 * - Bentuk singkat yang lazim ditulis di WhatsApp diterima: `4,5jt`, `2 juta`,
 *   `500rb`, `3k`. Tanpa ini `4,5jt` terbaca `45`, dan anggaran meleset seratus
 *   kali tanpa ada yang sadar, itu kesalahan yang lebih mahal daripada menolak.
 * - Karena uang selalu rupiah penuh (docs/02 prinsip 2), hasil desimal
 *   dibulatkan ke bilangan bulat terdekat, sama seperti `rupiah()`.
 * - Teks yang tidak bisa dibaca jadi 0, bukan angka karangan. Tidak ada kanal
 *   galat di isian angka, jadi 0 dipakai sebagai "belum ada nilai"; validasi
 *   API tetap menolak nilai yang tidak sah.
 */
export function bacaRupiah(teks: string): number {
  if (!teks) return 0;
  let bersih = teks
    .toLowerCase()
    .replace(/rp/g, "")
    .replace(/[\s\u00a0\u202f_]/g, "");
  if (!bersih) return 0;

  // Notasi `Rp 4.500.000,-` lazim ditulis untuk rupiah penuh; tanda hubung di
  // belakang tidak membawa nilai, jadi dibuang.
  bersih = bersih.replace(/,-$/, "");
  if (!bersih) return 0;

  let negatif = false;
  if (bersih.startsWith("-")) {
    negatif = true;
    bersih = bersih.slice(1);
  }

  // Bentuk singkat: juta/jt, ribu/rb, k.
  const singkat = /(juta|jt|ribu|rb|k)$/.exec(bersih);
  const pengali = singkat
    ? singkat[1] === "k" || singkat[1] === "rb" || singkat[1] === "ribu"
      ? 1_000
      : 1_000_000
    : 1;
  if (singkat) bersih = bersih.slice(0, -singkat[1].length);
  if (!bersih) return 0;

  const angka = bacaAngkaIndonesia(bersih, Boolean(singkat));
  if (angka === null) return 0;
  const hasil = Math.round(angka * pengali);
  return negatif ? -hasil : hasil;
}

/**
 * Baca angka dengan pemisah ala Indonesia.
 *
 * Tanpa bentuk singkat, titik selalu pemisah ribuan dan koma desimal, jadi
 * `4.500.000` dan `1.500.000,50` terbaca benar. Titik tidak diwajibkan
 * berkelompok tiga supaya isian tidak kosong saat orang menghapus satu digit
 * di tengah angka yang sudah diformat (misalnya `4.500.00`).
 *
 * Kalau ada bentuk singkat, titik dan koma dua-duanya boleh jadi desimal
 * karena `4.5jt` juga lazim ditulis. Mengembalikan null kalau bentuknya tidak
 * dikenali supaya pemanggil memutuskan sendiri dan tidak menebak.
 */
function bacaAngkaIndonesia(teks: string, titikDesimal: boolean): number | null {
  if (titikDesimal) {
    if (!/^\d*([.,]\d*)?$/.test(teks)) return null;
    const angka = Number(teks.replace(",", ".") || "0");
    return Number.isFinite(angka) ? angka : null;
  }

  const koma = teks.indexOf(",");
  const utuh = koma >= 0 ? teks.slice(0, koma) : teks;
  const desimal = koma >= 0 ? teks.slice(koma + 1) : null;
  // Titik boleh di mana saja sebagai pemisah ribuan, termasuk di ujung, dan
  // desimal boleh kosong sementara orang masih mengetik komanya.
  if (!/^\d+(\.\d+)*\.?$/.test(utuh)) return null;
  if (desimal !== null && !/^\d*$/.test(desimal)) return null;
  const bulat = Number(utuh.replace(/\./g, ""));
  if (!Number.isFinite(bulat)) return null;
  return desimal === null ? bulat : bulat + Number(`0.${desimal}`);
}

/**
 * Nomor WhatsApp dalam bentuk internasional tanpa `+`, spasi, atau tanda
 * hubung, siap ditempel ke `https://wa.me/<nomor>`.
 *
 * Bentuk Indonesia yang diterima: `0812...`, `62-812...`, `+62 812...`, dan
 * `812...` (tanpa nol depan). Bentuk yang sudah memakai `+` dipertahankan
 * sebagai nomor internasional apa adanya, jadi tamu dari luar negeri tidak
 * dipaksa jadi nomor Indonesia. Mengembalikan null kalau nomornya tidak bisa
 * dipastikan, supaya pemanggil menolaknya dengan pesan jelas daripada
 * menyimpan nomor yang tautannya nanti salah saat undangan dikirim.
 */
export function normalkanNomorWa(nilai: string | null | undefined): string | null {
  if (!nilai) return null;
  const bersih = String(nilai).trim();
  if (!bersih) return null;
  const digit = bersih.replace(/\D/g, "");
  if (!digit) return null;

  if (bersih.startsWith("+")) {
    return /^[1-9]\d{6,14}$/.test(digit) ? digit : null;
  }

  let kandidat: string;
  if (digit.startsWith("62")) kandidat = digit;
  else if (digit.startsWith("0")) kandidat = `62${digit.slice(1)}`;
  else if (digit.startsWith("8")) kandidat = `62${digit}`;
  else return null;

  // Nomor HP Indonesia setelah kode negara 62 selalu mulai dengan 8.
  return /^628\d{7,11}$/.test(kandidat) ? kandidat : null;
}

/** Persen dari dua angka, dibatasi 0 sampai 100. */
export function persen(bagian: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((bagian / total) * 100)));
}

/** Tanggal hari ini di zona Asia/Jakarta dalam bentuk `2026-06-30`. */
export function hariIni(): string {
  return isoTanggal.format(new Date());
}

/**
 * Awal hari di Asia/Jakarta sebagai instan UTC, untuk kolom timestamp yang
 * sebenarnya menyimpan tanggal, misalnya "undangan dikirim". Jakarta tidak
 * memakai daylight saving, jadi offsetnya tetap +07:00, dan tanggalnya pasti
 * tanggal pengguna, bukan tanggal zona proses.
 */
export function awalHariJakarta(tanggal: string = hariIni()): Date {
  return new Date(`${tanggal}T00:00:00+07:00`);
}

/** Dipakai untuk membandingkan tanggal pada aturan lewat tenggat. */
export function sudahLewat(tanggal: string | null | undefined): boolean {
  if (!tanggal) return false;
  const hari = selisihHari(tanggal);
  return hari !== null && hari < 0;
}

/**
 * Sisa hari sampai akhir minggu ini. Minggu dihitung sampai hari Minggu.
 *
 * Kalau hari ini Minggu, hasilnya hari ini juga (minggu sudah berakhir).
 * Perhitungannya dari kalender Asia/Jakarta, sama seperti `hariIni`, supaya
 * batas minggu tidak bergeser satu hari di server UTC.
 */
export function akhirMingguIni(): string {
  const hari = hariIni();
  const d = bacaTanggal(hari);
  if (!d) return hari;
  const geser = d.getUTCDay() === 0 ? 0 : 7 - d.getUTCDay();
  return geserTanggal(hari, geser);
}

/**
 * Geser tanggal murni `YYYY-MM-DD` sebanyak n hari, tanpa menyentuh jam.
 * Dipakai untuk batas minggu; zona proses tidak berpengaruh karena
 * perhitungannya memakai UTC dan tanggalnya murni.
 */
function geserTanggal(tanggal: string, hari: number): string {
  const d = bacaTanggal(tanggal);
  if (!d) return tanggal;
  d.setUTCDate(d.getUTCDate() + hari);
  return d.toISOString().slice(0, 10);
}
