// Label dan daftar nilai tetap. Dipakai di layar dan di API supaya
// penulisannya tidak bisa berbeda antar tempat.

export const KATEGORI_TUGAS = [
  "Administrasi",
  "Pencarian venue",
  "Vendor",
  "Sandang",
  "Pelengkap",
  "Tamu",
  "Hari-H",
] as const;
export type KategoriTugas = (typeof KATEGORI_TUGAS)[number];

export const KATEGORI_UANG = [
  "venue",
  "katering",
  "dekorasi",
  "busana",
  "dokumentasi",
  "adat",
  "transport",
  "administrasi",
  "lainnya",
] as const;
export type KategoriUang = (typeof KATEGORI_UANG)[number];

export const LABEL_KATEGORI_UANG: Record<KategoriUang, string> = {
  venue: "Venue",
  katering: "Katering",
  dekorasi: "Dekorasi",
  busana: "Busana",
  dokumentasi: "Dokumentasi",
  adat: "Adat",
  transport: "Transport",
  administrasi: "Administrasi",
  lainnya: "Lainnya",
};

export const KATEGORI_TAMU = [
  "keluargaPasangan",
  "keluargaBesar",
  "teman",
  "kerja",
  "anak",
  "lainnya",
] as const;
export type KategoriTamu = (typeof KATEGORI_TAMU)[number];

export const LABEL_KATEGORI_TAMU: Record<KategoriTamu, string> = {
  keluargaPasangan: "Keluarga pengantin",
  keluargaBesar: "Keluarga pihak lain",
  teman: "Teman",
  kerja: "Kerja",
  anak: "Anak",
  lainnya: "Lainnya",
};

/**
 * Sisi tamu menurut docs/02b-Tamu.md bagian 05. Nilai `lainnya` ditampilkan
 * sebagai "Bersama" karena di layar orang berpikir "tamu kedua pihak", bukan
 * "lainnya". Nilai lama di database yang tidak termasuk tiga ini dibaca
 * kembali sebagai `lainnya` supaya data lama tidak membuat layar rusak.
 */
export const SISI_TAMU = ["pria", "wanita", "lainnya"] as const;
export type SisiTamu = (typeof SISI_TAMU)[number];

export const LABEL_SISI_TAMU: Record<SisiTamu, string> = {
  pria: "Pihak pria",
  wanita: "Pihak wanita",
  lainnya: "Bersama",
};

export const JENIS_TANGGAL = [
  "akad",
  "resepsi",
  "prewedding",
  "adat",
  "seragam",
  "lainnya",
] as const;
export type JenisTanggal = (typeof JENIS_TANGGAL)[number];

export const LABEL_JENIS_TANGGAL: Record<JenisTanggal, string> = {
  akad: "Akad nikah",
  resepsi: "Resepsi",
  prewedding: "Prewedding",
  adat: "Adat",
  seragam: "Seragam",
  lainnya: "Lainnya",
};

export const PRIORITAS = ["rendah", "sedang", "tinggi"] as const;
export type Prioritas = (typeof PRIORITAS)[number];

export const LABEL_PRIORITAS: Record<Prioritas, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
};

export const PENUGASAN = ["saya", "pasangan", "keluarga"] as const;
export type Penugasan = (typeof PENUGASAN)[number];

export const LABEL_PENUGASAN: Record<Penugasan, string> = {
  saya: "Saya",
  pasangan: "Pasangan",
  keluarga: "Keluarga",
};

export const STATUS_VENDOR = ["calon", "dibook", "selesai"] as const;
export type StatusVendor = (typeof STATUS_VENDOR)[number];

export const LABEL_STATUS_VENDOR: Record<StatusVendor, string> = {
  calon: "Calon",
  dibook: "Dibook",
  selesai: "Selesai",
};

export const METODE_BAYAR = ["transfer", "tunai", "kartu", "ewallet", "qris"] as const;
export type MetodeBayar = (typeof METODE_BAYAR)[number];

export const LABEL_METODE_BAYAR: Record<MetodeBayar, string> = {
  transfer: "Transfer",
  tunai: "Tunai",
  kartu: "Kartu",
  ewallet: "E-wallet",
  qris: "QRIS",
};

export const STATUS_HADIR = ["belum", "hadir", "tidak"] as const;
export type StatusHadir = (typeof STATUS_HADIR)[number];

export const LABEL_STATUS_HADIR: Record<StatusHadir, string> = {
  belum: "Belum konfirmasi",
  hadir: "Hadir",
  tidak: "Tidak hadir",
};

export const AUIDENS = ["semua", "keluarga", "crew", "tamu"] as const;
export type Audien = (typeof AUIDENS)[number];

export const LABEL_AUDIEN: Record<Audien, string> = {
  semua: "Semua",
  keluarga: "Keluarga",
  crew: "Crew",
  tamu: "Tamu",
};

export const PEMILIK_BUSANA = [
  "pengantinPria",
  "pengantinWanita",
  "orangTua",
  "keluarga",
  "crew",
] as const;
export type PemilikBusana = (typeof PEMILIK_BUSANA)[number];

export const LABEL_PEMILIK_BUSANA: Record<PemilikBusana, string> = {
  pengantinPria: "Pengantin pria",
  pengantinWanita: "Pengantin wanita",
  orangTua: "Orang tua",
  keluarga: "Keluarga",
  crew: "Crew",
};

export const STATUS_BUSANA = ["belum", "dicari", "dijahit", "siap"] as const;
export type StatusBusana = (typeof STATUS_BUSANA)[number];

export const LABEL_STATUS_BUSANA: Record<StatusBusana, string> = {
  belum: "Belum",
  dicari: "Dicari",
  dijahit: "Dijahit",
  siap: "Siap",
};

export const STATUS_PLAN = ["perencanaan", "berlangsung", "selesai"] as const;
export type StatusPlan = (typeof STATUS_PLAN)[number];

export const LABEL_STATUS_PLAN: Record<StatusPlan, string> = {
  perencanaan: "Perencanaan",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
};

export const ZONA = "Asia/Jakarta";

/**
 * Nama produk. Ini satu-satunya tempat nama ditulis.
 *
 * Diputuskan "Rapi Nikah" pada 2026-10-04. Alasan singkat: berbahasa
 * Indonesia, netral untuk semua agama dan adat, 10 karakter sehingga aman
 * untuk `short_name` (dibatasi 12), dan langsung menyebut inti produk:
 * catatan yang rapi dan pernikahan. Saat dipilih, tidak ada merek lain
 * dengan nama ini, dan domain rapinikah.id serta rapinikah.com belum
 * terdaftar. Riwayat lengkapnya ada di `CHANGELOG.md` 0.14.0.
 *
 * Semua yang menampilkan nama produk (judul halaman, manifest, nama sesi)
 * harus baca dari sini, bukan menulis ulang. Kalau nama diganti lagi, cuma
 * baris ini yang berubah.
 *
 * Nama di kunci perangkat sengaja TIDAK ikut berubah, dan itu keputusan
 * tetap: database IndexedDB "haribesar-luring" dan "haribesar-baca", kunci
 * localStorage "haribesar-tema", "haribesar-email-ingat", dan
 * "haribesar-install-ditolak", nama cache service worker "haribesar-*", dan
 * nama event "haribesar-toast". Menggantinya membuat data pengguna yang
 * sudah ada tidak terbaca lagi dan cache luring terbuang, padahal nama kunci
 * itu tidak pernah terlihat pengguna. Alasannya juga ditulis di
 * `CHANGELOG.md` 0.14.0.
 *
 * Batas `short_name` di manifest adalah 12 karakter, jadi jangan lewat.
 */
export const NAMA_PRODUK = "Rapi Nikah";

/** Nama pendek untuk layar utama HP dan nama tab browser. 10 karakter. */
export const NAMA_PRODUK_PENDEK = "Rapi Nikah";

export const BATAS_TAUTAN = 5;
export const BATAS_TEKS_WA = 800;
export const BATAS_PESAN_TAMBAHAN = 400;
