/**
 * Pembaca daftar tamu yang ditempel dari WhatsApp atau Excel.
 *
 * Yang ditangani:
 * - Satu tamu per baris
 * - Format "Ahmad, 3" atau "Ahmad 3" atau "Ahmad\t3"
 * - Nomor HP yang kebetulan menempel di nama
 * - Baris yang isinya cuma angka (biasanya nomor urut dari Excel) dibuang
 *
 * Yang tidak dilakukan: menebak kategori. Kategori dipilih orangnya, karena
 * menebak dari nama akan sering salah dan lebih merepotkan daripada mengisi
 * satu dropdown.
 */

export type BarisTamu = {
  name: string;
  guestCount: number;
  /** Kenapa baris ini perlu dilihat lagi. Kosong berarti aman. */
  catatan: string | null;
  /** Nama ini sudah ada di daftar, jadi tidak akan dibuat dua kali. */
  kembar: boolean;
};

const NOMOR_HP = /^(\+?62|0)8\d{7,12}$/;

/**
 * Pisahkan nama dan jumlah orang.
 *
 * Pemisah yang diterima koma, tab, titik dua, atau spasi sebelum angka di
 * ujung baris. Angka di tengah nama tidak dianggap jumlah orang, karena nama
 * seperti "Ahmad 2" hampir tidak pernah ada tapi "Jl. Melati 2" jelas bukan
 * jumlah orang.
 */
function pecah(baris: string): { nama: string; jumlah: number | null } {
  const bersih = baris.replace(/\s+/g, " ").trim();

  const cocok = /^(.*?)[\s,;:]+(\d{1,2})\s*(orang|pax)?$/i.exec(bersih);
  if (cocok && cocok[1].trim()) {
    const jumlah = Number(cocok[2]);
    if (jumlah >= 1 && jumlah <= 50) {
      return { nama: cocok[1].trim().replace(/[,\s;:]+$/, ""), jumlah };
    }
  }

  return { nama: bersih, jumlah: null };
}

export function bacaDaftarTamu(teks: string, namaSudahAda: string[] = []): BarisTamu[] {
  const ada = new Set(namaSudahAda.map((n) => n.trim().toLowerCase()));
  const dalamTeks = new Set<string>();
  const hasil: BarisTamu[] = [];

  for (const mentah of teks.split(/\r?\n/)) {
    const baris = mentah.replace(/\s+/g, " ").trim();

    // Baris kosong dan baris yang cuma angka adalah nomor urut, bukan tamu.
    if (!baris) continue;
    if (/^\d+[.)]?$/.test(baris)) continue;
    // Header tabel dari Excel ikut tersalin cukup sering, jadi dibuang.
    if (/^(nama|no|nomor|jumlah|kategori|hp|telepon)(\s+(nama|orang|hp|telepon))*$/i.test(baris)) {
      continue;
    }

    const { nama, jumlah } = pecah(baris.replace(/^\d+[.)]\s*/, ""));
    if (!nama) continue;

    let catatan: string | null = null;
    let namaFinal = nama;

    // Nomor HP yang ikut di baris yang sama dipisah, karena kalau tidak,
    // nomornya jadi bagian nama dan tidak bisa dipakai untuk kirim undangan.
    const bagian = nama.split(/[\s,;]+/);
    const nomor = bagian.find((b) => NOMOR_HP.test(b.replace(/[\s-]/g, "")));
    if (nomor && bagian.length > 1) {
      namaFinal = bagian.filter((b) => b !== nomor).join(" ").replace(/[,\s;:]+$/, "").trim();
      catatan = "Nomor HP ikut terbaca, cek dulu sebelum disimpan.";
    }

    if (!namaFinal) {
      catatan = "Nama tidak terbaca, tulis ulang baris ini.";
      namaFinal = nama;
    }

    const kunci = namaFinal.toLowerCase();
    const kembar = ada.has(kunci) || dalamTeks.has(kunci);
    if (kembar) catatan = "Nama sudah ada, jumlah belum berubah.";
    dalamTeks.add(kunci);

    hasil.push({
      name: namaFinal,
      // Tanpa angka, satu orang. Menebak lebih dari satu akan melebihkan
      // hitungan kursi, dan kursi yang dipesan tidak bisa dikembalikan.
      guestCount: jumlah ?? 1,
      catatan,
      kembar,
    });
  }

  return hasil;
}
