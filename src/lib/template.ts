import { KATEGORI_TUGAS, type KategoriTugas } from "./konstanta";

/**
 * Template disimpan di kode, bukan di database. Isinya berubah jarang, tidak
 * perlu diedit pengguna, dan tidak menambah tabel yang harus dijaga. Alasannya
 * di docs/17-Rencana-Build.md bagian 2.
 */

export type TugasTemplate = {
  title: string;
  /** Tenggat dihitung mundur dari hari besar, dalam hari. */
  hMinus: number | null;
  priority: "rendah" | "sedang" | "tinggi";
};

/**
 * Isi tiap kategori datang dari docs/02a-Perencanaan.md bagian "Kategori tugas".
 * Tenggatnya dihitung mundur dari hari besar supaya urutannya masuk akal:
 * administrasi paling lama, persiapan venue paling akhir.
 */
export const TEMPLATE_TUGAS: Record<KategoriTugas, TugasTemplate[]> = {
  Administrasi: [
    { title: "Urus surat pengantar RT/RW", hMinus: 180, priority: "tinggi" },
    { title: "Siapkan fotokopi KK dan KTP", hMinus: 150, priority: "tinggi" },
    { title: "Daftar ke KUA dan cek berkas N1 sampai N4", hMinus: 120, priority: "tinggi" },
    { title: "Cek data nama orang tua di berkas", hMinus: 120, priority: "sedang" },
    { title: "Urus akta nikah dan buku nikah", hMinus: 60, priority: "tinggi" },
    { title: "Bayar administrasi KUA", hMinus: 30, priority: "sedang" },
  ],
  "Pencarian venue": [
    { title: "Tulis kebutuhan tamu dan konsep acara", hMinus: 240, priority: "tinggi" },
    { title: "Cari lima pilihan venue", hMinus: 210, priority: "tinggi" },
    { title: "Survei venue, cek listrik dan air", hMinus: 180, priority: "tinggi" },
    { title: "Cek akses mobil besar dan toilet", hMinus: 180, priority: "sedang" },
    { title: "Buat arah jalan untuk tamu", hMinus: 60, priority: "sedang" },
    { title: "Tentukan titik parkir dan petugasnya", hMinus: 30, priority: "sedang" },
  ],
  Vendor: [
    { title: "Pilih makeup dan uji rias", hMinus: 150, priority: "tinggi" },
    { title: "Pilih dekorasi dan kunci konsep", hMinus: 150, priority: "tinggi" },
    { title: "Pilih katering dan uji rasa", hMinus: 120, priority: "tinggi" },
    { title: "Pilih dokumentasi dan minta contoh hasil", hMinus: 120, priority: "sedang" },
    { title: "Pilih MC dan organ tunggal", hMinus: 90, priority: "sedang" },
    { title: "Pesan tenda dan kursi tambahan", hMinus: 60, priority: "sedang" },
  ],
  Sandang: [
    { title: "Pilih baju pengantin", hMinus: 180, priority: "tinggi" },
    { title: "Ukur badan untuk baju dan sepatu", hMinus: 150, priority: "tinggi" },
    { title: "Tentukan baju adat dan aksesorinya", hMinus: 120, priority: "sedang" },
    { title: "Siapkan jas dan kemeja", hMinus: 90, priority: "sedang" },
    { title: "Ambil baju yang sudah jadi", hMinus: 14, priority: "tinggi" },
  ],
  Pelengkap: [
    { title: "Tentukan tanggal akad dan resepsi", hMinus: 240, priority: "tinggi" },
    { title: "Siapkan mahar dan cincin", hMinus: 120, priority: "tinggi" },
    { title: "Atur urutan upacara adat", hMinus: 90, priority: "sedang" },
    { title: "Atur jadwal siraman", hMinus: 30, priority: "sedang" },
    { title: "Atur sesi foto keluarga", hMinus: 14, priority: "sedang" },
    { title: "Rencanakan pesta setelah resepsi", hMinus: 14, priority: "rendah" },
  ],
  Tamu: [
    { title: "Tentukan jumlah tamu yang diundang", hMinus: 150, priority: "tinggi" },
    { title: "Susun daftar nama per kategori", hMinus: 120, priority: "tinggi" },
    { title: "Cetak dan kirim undangan", hMinus: 45, priority: "tinggi" },
    { title: "Konfirmasi kehadiran satu per satu", hMinus: 21, priority: "tinggi" },
    { title: "Siapkan kotak kado dan angpau", hMinus: 7, priority: "sedang" },
    { title: "Buat buku tamu dan meja penerimaan", hMinus: 7, priority: "sedang" },
  ],
  "Hari-H": [
    { title: "Jadwalkan gladi resik", hMinus: 14, priority: "tinggi" },
    { title: "Briefing MC dan urutan acara", hMinus: 7, priority: "tinggi" },
    { title: "Briefing crew dan bagi tugas", hMinus: 7, priority: "tinggi" },
    { title: "Cek persiapan venue sehari sebelumnya", hMinus: 1, priority: "tinggi" },
    { title: "Susun urutan resepsi", hMinus: 1, priority: "sedang" },
  ],
};

/** Ubah tenggat hari besar jadi tanggal `2026-06-30`. */
export function tanggalDariHMinus(hariBesar: string | null, hMinus: number | null): string | null {
  if (!hariBesar || hMinus === null) return null;
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(hariBesar);
  if (!cocok) return null;
  const d = new Date(Date.UTC(Number(cocok[1]), Number(cocok[2]) - 1, Number(cocok[3])));
  d.setUTCDate(d.getUTCDate() - hMinus);
  return d.toISOString().slice(0, 10);
}

export function daftarKategoriTemplate(): KategoriTugas[] {
  return [...KATEGORI_TUGAS];
}

/**
 * Template pos anggaran. Angkanya sengaja nol, bukan angka contoh, karena
 * angka tanpa sumber dilarang AGENTS.md bagian 3 aturan 5.
 */
export const TEMPLATE_POS: { name: string; category: string }[] = [
  { name: "Venue", category: "venue" },
  { name: "Katering", category: "katering" },
  { name: "Dekorasi", category: "dekorasi" },
  { name: "Busana", category: "busana" },
  { name: "Dokumentasi", category: "dokumentasi" },
  { name: "Adat", category: "adat" },
  { name: "Transport", category: "transport" },
  { name: "Administrasi KUA", category: "administrasi" },
  { name: "Berkas dan akta", category: "administrasi" },
  { name: "Lainnya", category: "lainnya" },
];

/**
 * Template rundown per adat, dari docs/02c-Hari-H.md bagian 08. Jamnya
 * disusun berurutan, dan durasinya dibuat wajar untuk acara keluarga.
 */
export type RundownTemplate = { title: string; startTime: string; durationMinutes: number };

export const TEMPLATE_RUNDOWN: Record<string, RundownTemplate[]> = {
  Muslim: [
    { title: "Persiapan keluarga", startTime: "07:00", durationMinutes: 60 },
    { title: "Akad nikah", startTime: "08:00", durationMinutes: 60 },
    { title: "Sungkeman", startTime: "09:00", durationMinutes: 30 },
    { title: "Makan bersama keluarga", startTime: "09:30", durationMinutes: 60 },
    { title: "Resepsi", startTime: "11:00", durationMinutes: 180 },
    { title: "Walimah", startTime: "18:00", durationMinutes: 120 },
  ],
  Jawa: [
    { title: "Siraman", startTime: "07:00", durationMinutes: 90 },
    { title: "Midodareni", startTime: "09:00", durationMinutes: 60 },
    { title: "Akad nikah", startTime: "10:00", durationMinutes: 60 },
    { title: "Balangan gantal", startTime: "11:00", durationMinutes: 30 },
    { title: "Saweran", startTime: "11:30", durationMinutes: 30 },
    { title: "Resepsi", startTime: "12:00", durationMinutes: 240 },
  ],
  Minang: [
    { title: "Malam bainai", startTime: "19:00", durationMinutes: 120 },
    { title: "Manjapuik marapulai", startTime: "08:00", durationMinutes: 120 },
    { title: "Akad nikah", startTime: "10:00", durationMinutes: 60 },
    { title: "Baralek", startTime: "11:00", durationMinutes: 240 },
  ],
  Sunda: [
    { title: "Akad nikah", startTime: "08:00", durationMinutes: 60 },
    { title: "Saweran", startTime: "09:00", durationMinutes: 30 },
    { title: "Huap lingkung", startTime: "09:30", durationMinutes: 60 },
    { title: "Resepsi", startTime: "11:00", durationMinutes: 240 },
    { title: "Ngunduh mantu", startTime: "18:00", durationMinutes: 120 },
  ],
  Bali: [
    { title: "Mesakapan", startTime: "07:00", durationMinutes: 90 },
    { title: "Mewidhi widana", startTime: "09:00", durationMinutes: 120 },
    { title: "Resepsi", startTime: "12:00", durationMinutes: 240 },
  ],
  Modern: [
    { title: "Prewedding", startTime: "07:00", durationMinutes: 120 },
    { title: "Akad nikah", startTime: "10:00", durationMinutes: 60 },
    { title: "Resepsi", startTime: "11:00", durationMinutes: 240 },
    { title: "Pesta setelah resepsi", startTime: "19:00", durationMinutes: 180 },
  ],
};

export const NAMA_ADAT = Object.keys(TEMPLATE_RUNDOWN);
