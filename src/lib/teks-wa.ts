import { rupiah, tanggalPendekDari } from "./format";
import { BATAS_TEKS_WA } from "./konstanta";
import type { Laporan } from "./laporan";

/**
 * Penyusun teks WhatsApp.
 *
 * Teks disusun di server, bukan di layar. Alasannya angka: kalau layar yang
 * menyusun, formatter rupiah di browser dan di server bisa berbeda tipis, dan
 * satu angka yang beda membuat seluruh laporan tidak dipercaya. Satu fungsi
 * juga berarti teksnya bisa diuji tanpa membuka browser.
 *
 * Yang boleh diubah orang cuma kalimat tambahan. Angka, tanggal, dan tautan
 * tidak lewat parameter apa pun, jadi tidak ada jalan untuk mengubahnya
 * walaupun ada yang mengirim body tambahan.
 */

export type JenisBagikan = "ringkas" | "lengkap" | "tautan";

export type HasilTeks = {
  text: string;
  length: number;
  /** true kalau teks dipotong karena melewati batas. Harus jarang terjadi. */
  truncated: boolean;
  lines: number;
  variant: JenisBagikan;
};

function baris(...teks: (string | null | undefined | false)[]): string[] {
  return teks.filter((t): t is string => Boolean(t && String(t).trim()));
}

/**
 * Tautan `wa.me` untuk membagikan teks ke kontak mana pun.
 *
 * `encodeURIComponent` dipakai supaya baris baru jadi `%0A`, ampersand tidak
 * memotong query, dan karakter non-ASCII dienkode UTF-8. Kalau baris baru
 * dikirim apa adanya, WhatsApp bisa menggabungkan dua baris dan nominal
 * terbaca menyambung dengan label berikutnya.
 */
export function tautanWa(teks: string): string {
  return `https://wa.me/?text=${encodeURIComponent(teks)}`;
}

/** "371 hari lagi" atau "hari ini", tanpa mengulang kata yang sama. */
function teksMundur(l: Laporan): string {
  const n = l.hitungMundur.hari;
  if (n === null) return "tanggal belum ditentukan";
  if (n === 0) return "hari ini";
  if (n === 1) return "besok";
  if (n > 1) return `${n} hari lagi`;
  return `${Math.abs(n)} hari yang lalu`;
}

export function susunTeksBagikan(
  laporan: Laporan,
  jenis: JenisBagikan,
  pesanTambahan: string | null,
  tautan: string | null,
): HasilTeks {
  const sapaan = pesanTambahan?.trim() ? pesanTambahan.trim() : null;
  const nama = laporan.judul.namaPasangan || "kami";

  if (jenis === "tautan") {
    return rapikan(
      baris(
        sapaan,
        `Laporan pernikahan ${nama} bisa dilihat di sini:`,
        tautan ?? "Tautan belum dibuat.",
      ),
      jenis,
    );
  }

  const u = laporan.uang;
  const t = laporan.tugas;
  const m = laporan.tamu;

  const bagianUang = baris(
    "Uang",
    `Batas ${rupiah(u.planned)}`,
    `Terpakai ${rupiah(u.paid)}`,
    u.remaining < 0 ? `Lebih ${rupiah(Math.abs(u.remaining))}` : `Sisa ${rupiah(u.remaining)}`,
  );

  const bagianTugas = baris(
    "Tugas",
    `${t.selesai} selesai dari ${t.total}${t.mingguIni > 0 ? `, ${t.mingguIni} harus minggu ini` : ""}${t.lewat > 0 ? `, ${t.lewat} lewat tanggal` : ""}`,
  );

  const bagianTamu = baris(
    "Tamu",
    `${m.orang} orang, ${m.hadir} sudah konfirmasi${m.belumKonfirmasi > 0 ? `, ${m.belumKonfirmasi} belum konfirmasi` : ""}${m.tidakHadir > 0 ? `, ${m.tidakHadir} tidak hadir` : ""}`,
    // Porsi dan kursi sengaja angka yang sama: tamu yang sudah pasti hadir
    // ditambah yang belum menjawab, karena dua pertanyaan itu artinya sama.
    `Perkiraan porsi katering ${m.porsi}, kursi yang perlu disiapkan ${m.kursi}`,
  );

  const kaki = tautan ? [`Lebih lengkap di tautan: ${tautan}`] : [];

  const ringkas = baris(
    sapaan,
    `Hari-H: ${laporan.judul.tanggalTeks}, ${teksMundur(laporan)}`,
    "",
    ...bagianUang,
    "",
    ...bagianTugas,
    "",
    ...bagianTamu,
    ...(kaki.length ? ["", ...kaki] : []),
  );

  if (jenis === "ringkas") return rapikan(ringkas, jenis);

  // Lengkap menambahkan rincian per pos dan rundown. Daftar tamu per kategori
  // tidak ikut karena berisi nama keluarga, dan teks WhatsApp diteruskan
  // orang tanpa dibaca ulang.
  const bagianPos = u.pos.length
    ? [
        "",
        "Rincian uang",
        ...u.pos.map(
          (p) =>
            `${p.name}: ${rupiah(p.paid)} dari ${rupiah(p.planned)}${p.remaining < 0 ? " (lebih)" : ""}`,
        ),
      ]
    : [];

  const bagianRundown = laporan.rundown.total
    ? [
        "",
        "Rundown",
        `${laporan.rundown.total} item${laporan.rundown.jamMulai ? `, dari ${laporan.rundown.jamMulai.slice(0, 5).replace(":", ".")}` : ""}${laporan.rundown.jamSelesai ? ` sampai ${laporan.rundown.jamSelesai}` : ""}`,
      ]
    : [];

  const bagianVendor = laporan.vendor.total
    ? [
        "",
        "Vendor",
        `${laporan.vendor.total} vendor, ${laporan.vendor.dibook} dibook, ${laporan.vendor.belumLunas} belum lunas`,
        `${rupiah(laporan.vendor.totalDibayar)} sudah dibayar`,
      ]
    : [];

  const bagianBusana = laporan.busana.total
    ? ["", "Busana", `${laporan.busana.siap} siap dari ${laporan.busana.total}`]
    : [];

  const bagianJadwal = laporan.jadwal.length
    ? [
        "",
        "Jadwal",
        ...laporan.jadwal.slice(0, 5).map((j) => `${tanggalPendekDari(j.eventDate)}: ${j.title}`),
      ]
    : [];

  return rapikan(
    baris(
      ...ringkas.filter((b, i) => !(b === "" && i === ringkas.length - 1)),
      ...bagianPos,
      ...bagianRundown,
      ...bagianVendor,
      ...bagianBusana,
      ...bagianJadwal,
    ),
    jenis,
  );
}

/**
 * Potong kalau melewati batas, dan laporkan bahwa dipotong.
 *
 * Memotong diam-diam bukan pilihan: kalau teks dipotong di tengah nominal,
 * yang terbaca bukan angka salah tapi angka lain yang kelihatan benar. Jadi
 * yang dipotong selalu baris utuh, dan pemotongannya dilaporkan ke pemanggil
 * supaya layar bisa memberi tahu sebelum orang menekan tombol.
 */
function rapikan(isi: string[], variant: JenisBagikan): HasilTeks {
  let teks = isi.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  let truncated = false;

  if (teks.length > BATAS_TEKS_WA) {
    const potong = teks.slice(0, BATAS_TEKS_WA);
    const akhirBaris = potong.lastIndexOf("\n");
    teks = (akhirBaris > 0 ? potong.slice(0, akhirBaris) : potong).trimEnd();
    truncated = true;
  }

  return {
    text: teks,
    length: teks.length,
    truncated,
    lines: teks.split("\n").length,
    variant,
  };
}
