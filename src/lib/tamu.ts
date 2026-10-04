import { SISI_TAMU, type SisiTamu } from "./konstanta";

/**
 * Satu perhitungan rekap tamu untuk semua layar.
 *
 * Rekap muncul di tiga tempat: endpoint tamu, ringkasan Beranda, dan Laporan.
 * Kalau tiap tempat menghitung sendiri, cepat atau lambat satu angka berbeda
 * dan pasangan tidak tahu mana yang benar. Jadi aturannya ditulis sekali di
 * sini, dan tempat lain memanggil fungsi yang sama.
 */

/** Kolom tamu yang dibutuhkan rekap. Sengaja minimal supaya ringan. */
export type TamuRingkasMasuk = {
  category: string;
  side: string | null;
  rsvpStatus: string;
  guestCount: number;
  tableName: string | null;
  invitedAt: Date | null;
};

export type PerSisiTamu = {
  /** Orang dari pihak mempelai pria. */
  pria: number;
  /** Orang dari pihak mempelai wanita. */
  wanita: number;
  /** Pihak bersama: nilai `lainnya` dan baris yang belum diisi sisinya. */
  bersama: number;
};

export type RingkasTamu = {
  baris: number;
  orang: number;
  hadir: number;
  tidakHadir: number;
  belumKonfirmasi: number;
  belumDiundang: number;
  /** Jumlah BARIS yang belum diundang, untuk tombol tandai borongan. */
  belumDiundangBaris: number;
  porsi: number;
  kursi: number;
  perkiraanMaksimal: number;
  perKategori: { kategori: string; orang: number; baris: number }[];
  perMeja: { meja: string | null; orang: number; baris: number }[];
  perSisi: PerSisiTamu;
};

/**
 * Sisi yang dikenal skema. Nilai lama di database yang tidak termasuk tiga ini
 * (termasuk null) dianggap belum dikelompokkan dan masuk keranjang bersama
 * saat dibaca, supaya data lama tidak membuat layar rusak.
 */
export function sisiDikenal(nilai: string | null | undefined): SisiTamu | null {
  return SISI_TAMU.includes(nilai as SisiTamu) ? (nilai as SisiTamu) : null;
}

export function ringkasTamu(daftar: TamuRingkasMasuk[]): RingkasTamu {
  let orang = 0;
  let hadir = 0;
  let tidakHadir = 0;
  let belumKonfirmasi = 0;
  let belumDiundang = 0;
  let belumDiundangBaris = 0;
  const perKategoriPeta = new Map<string, { orang: number; baris: number }>();
  const perMejaPeta = new Map<string | null, { orang: number; baris: number }>();
  const perSisi: PerSisiTamu = { pria: 0, wanita: 0, bersama: 0 };

  for (const tamu of daftar) {
    orang += tamu.guestCount;
    if (tamu.rsvpStatus === "hadir") hadir += tamu.guestCount;
    else if (tamu.rsvpStatus === "tidak") tidakHadir += tamu.guestCount;
    else belumKonfirmasi += tamu.guestCount;
    if (!tamu.invitedAt) {
      belumDiundang += tamu.guestCount;
      belumDiundangBaris += 1;
    }

    const kategori = perKategoriPeta.get(tamu.category) ?? { orang: 0, baris: 0 };
    kategori.orang += tamu.guestCount;
    kategori.baris += 1;
    perKategoriPeta.set(tamu.category, kategori);

    const meja = perMejaPeta.get(tamu.tableName) ?? { orang: 0, baris: 0 };
    meja.orang += tamu.guestCount;
    meja.baris += 1;
    perMejaPeta.set(tamu.tableName, meja);

    const sisi = sisiDikenal(tamu.side);
    if (sisi === "pria") perSisi.pria += tamu.guestCount;
    else if (sisi === "wanita") perSisi.wanita += tamu.guestCount;
    else perSisi.bersama += tamu.guestCount;
  }

  // Porsi katering dan kursi yang perlu disiapkan memakai angka yang sama
  // dengan sengaja: tamu yang sudah pasti hadir ditambah yang belum menjawab.
  // Tamu yang sudah menyatakan tidak hadir tidak dihitung. Dua pertanyaan itu
  // artinya sama, berapa orang yang perlu dilayani.
  //
  // Tidak ada cadangan otomatis di atas jumlah ini (keputusan pemilik produk,
  // 4 Oktober 2026): besaran cadangan berbeda antar vendor, menu, dan jumlah
  // anak, jadi angka porsi tidak dikarang dan pemilik rencana yang
  // menyesuaikan saat memesan.
  const perluDilayani = hadir + belumKonfirmasi;

  return {
    baris: daftar.length,
    orang,
    hadir,
    tidakHadir,
    belumKonfirmasi,
    belumDiundang,
    belumDiundangBaris,
    porsi: perluDilayani,
    kursi: perluDilayani,
    perkiraanMaksimal: perluDilayani,
    perKategori: [...perKategoriPeta.entries()]
      .map(([kategori, nilai]) => ({ kategori, orang: nilai.orang, baris: nilai.baris }))
      .sort((a, b) => b.orang - a.orang),
    perMeja: [...perMejaPeta.entries()]
      .map(([meja, nilai]) => ({ meja, orang: nilai.orang, baris: nilai.baris }))
      .sort((a, b) => (a.meja ?? "\uffff").localeCompare(b.meja ?? "\uffff", "id")),
    perSisi,
  };
}
