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

/** Berapa hari lagi dari hari ini. Negatif berarti sudah lewat. */
export function selisihHari(tanggal: string | Date | null | undefined): number | null {
  if (!tanggal) return null;
  const target = typeof tanggal === "string" ? bacaTanggal(tanggal) : tanggal;
  if (!target) return null;
  const hariIni = new Date();
  const awalHariIni = Date.UTC(
    hariIni.getFullYear(),
    hariIni.getMonth(),
    hariIni.getDate(),
  );
  const awalTarget = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );
  return Math.round((awalTarget - awalHariIni) / 86_400_000);
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

/** `Rp 4.500.000` jadi `4500000`. Dipakai saat membaca isian pengguna. */
export function bacaRupiah(teks: string): number {
  const bersih = teks.replace(/[^\d-]/g, "");
  const angka = Number.parseInt(bersih, 10);
  return Number.isFinite(angka) ? angka : 0;
}

/** Persen dari dua angka, dibatasi 0 sampai 100. */
export function persen(bagian: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((bagian / total) * 100)));
}

/** Tanggal hari ini di zona Asia/Jakarta dalam bentuk `2026-06-30`. */
export function hariIni(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Dipakai untuk membandingkan tanggal pada aturan lewat tenggat. */
export function sudahLewat(tanggal: string | null | undefined): boolean {
  if (!tanggal) return false;
  const hari = selisihHari(tanggal);
  return hari !== null && hari < 0;
}

/** Sisa hari sampai akhir minggu ini. Minggu dihitung sampai hari Minggu. */
export function akhirMingguIni(): string {
  const d = new Date();
  const geser = 7 - (d.getDay() === 0 ? 7 : d.getDay());
  d.setDate(d.getDate() + geser);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
