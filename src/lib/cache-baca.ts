/**
 * Cache baca per perangkat, untuk dipakai saat jaringan putus.
 *
 * Service worker sengaja TIDAK men-cache response `/api` (AGENTS.md bagian 5
 * dan docs/07), karena data keuangan yang basi lebih berbahaya daripada data
 * yang tidak ada. Karena itu cadangan luring disimpan aplikasi sendiri di
 * IndexedDB: response GET yang berhasil disalin ke sini, lalu dipakai kalau
 * GET berikutnya gagal karena jaringan.
 *
 * Isi yang disimpan mengikuti docs/07 bagian "Data plan saat luring":
 * rundown semua item (paling dibutuhkan di lokasi), tugas 50 pertama, tamu 50
 * pertama, dan anggaran semua pos karena jumlahnya kecil. Angka 50 dipilih
 * supaya perangkat tidak menyimpan ribuan baris yang jarang dibuka saat luring;
 * sisanya masih bisa dimuat begitu ada sinyal.
 *
 * Penyimpanannya di balik satu antarmuka supaya bisa diuji di Node tanpa
 * IndexedDB. Tidak ada pustaka baru.
 */

export type EntriBaca = {
  kunci: string;
  planId: string | null;
  waktu: number;
  data: unknown;
};

export interface PenyimpananBaca {
  ambil(kunci: string): Promise<EntriBaca | null>;
  simpan(entri: EntriBaca): Promise<void>;
  hapus(kunci: string): Promise<void>;
  daftar(): Promise<EntriBaca[]>;
}

const BATAS_TUGAS = 50;
const BATAS_TAMU = 50;

const NAMA_DB = "haribesar-baca";
const VERSI_DB = 1;
const NAMA_TABEL = "cache";

/** Jalur tanpa origin dan tanpa query, untuk mencocokkan bentuk response. */
function jalurDari(url: string): string {
  try {
    return new URL(url, "http://lokal").pathname;
  } catch {
    return url;
  }
}

/**
 * Hanya data plan yang dicache. `/api/kesehatan` dikecualikan karena itu
 * pemeriksa koneksi: kalau dijawab dari cache, aplikasi akan menganggap ada
 * koneksi padahal tidak. `/api/auth` tidak pernah dicache (docs/07).
 */
export function bolehDicache(url: string): boolean {
  return jalurDari(url).startsWith("/api/plans");
}

/** Kunci cache: jalur plus query, tanpa origin. Query berbeda, entri berbeda. */
export function kunciBaca(url: string): string {
  try {
    const u = new URL(url, "http://lokal");
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

/** planId dari `/api/plans/{uuid}/...`, null untuk endpoint lain. */
export function planIdDariUrl(url: string): string | null {
  const cocok = /^\/api\/plans\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i.exec(
    jalurDari(url),
  );
  return cocok?.[1] ?? null;
}

/**
 * Potong isi sebelum disimpan, sesuai batas di docs/07.
 *
 * Response asli yang dikembalikan ke layar tidak dipotong; yang dipotong cuma
 * salinan untuk cache. Rekap (jumlah orang, kursi) tetap utuh walaupun daftar
 * tamunya dipotong, karena rekap itu ringkasan seluruh plan dan bukan daftar.
 */
export function potongIsi(url: string, data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const jalur = jalurDari(url);
  const isi = data as Record<string, unknown>;

  if (/\/tasks$/.test(jalur) && Array.isArray(isi.tasks)) {
    return { ...isi, tasks: isi.tasks.slice(0, BATAS_TUGAS) };
  }
  if (/\/guests$/.test(jalur) && Array.isArray(isi.guests)) {
    return { ...isi, guests: isi.guests.slice(0, BATAS_TAMU) };
  }
  // Rundown: semua item. Anggaran: semua pos. Keduanya memang tidak dipotong.
  return data;
}

/** Penyimpanan IndexedDB, dipakai di browser. */
function penyimpananBacaIndexedDb(): PenyimpananBaca {
  function bukaDb(): Promise<IDBDatabase> {
    return new Promise((selesai, gagal) => {
      const permintaan = indexedDB.open(NAMA_DB, VERSI_DB);
      permintaan.onupgradeneeded = () => {
        const db = permintaan.result;
        if (!db.objectStoreNames.contains(NAMA_TABEL)) {
          db.createObjectStore(NAMA_TABEL, { keyPath: "kunci" });
        }
      };
      permintaan.onsuccess = () => selesai(permintaan.result);
      permintaan.onerror = () => gagal(permintaan.error);
    });
  }

  function jalan<T>(
    mode: IDBTransactionMode,
    aksi: (toko: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    return bukaDb().then(
      (db) =>
        new Promise<T>((selesai, gagal) => {
          const trx = db.transaction(NAMA_TABEL, mode);
          const permintaan = aksi(trx.objectStore(NAMA_TABEL));
          permintaan.onsuccess = () => selesai(permintaan.result);
          permintaan.onerror = () => gagal(permintaan.error);
          trx.oncomplete = () => db.close();
        }),
    );
  }

  return {
    async ambil(kunci) {
      const hasil = await jalan<EntriBaca | undefined>("readonly", (toko) => toko.get(kunci));
      return hasil ?? null;
    },
    async simpan(entri) {
      await jalan("readwrite", (toko) => toko.put(entri));
    },
    async hapus(kunci) {
      await jalan("readwrite", (toko) => toko.delete(kunci));
    },
    async daftar() {
      return jalan<EntriBaca[]>("readonly", (toko) => toko.getAll());
    },
  };
}

/** Penyimpanan in-memory, dipakai test di Node dan saat IndexedDB tidak ada. */
export function penyimpananBacaMemori(): PenyimpananBaca {
  const isi = new Map<string, EntriBaca>();
  return {
    async ambil(kunci) {
      const entri = isi.get(kunci);
      return entri ? { ...entri } : null;
    },
    async simpan(entri) {
      isi.set(entri.kunci, { ...entri });
    },
    async hapus(kunci) {
      isi.delete(kunci);
    },
    async daftar() {
      return [...isi.values()];
    },
  };
}

let aktif: PenyimpananBaca | null = null;

/** Penyimpanan yang sedang dipakai. Dipilih sekali, lalu dipakai terus. */
export function penyimpananBaca(): PenyimpananBaca {
  if (!aktif) {
    try {
      aktif =
        typeof indexedDB === "undefined" ? penyimpananBacaMemori() : penyimpananBacaIndexedDb();
    } catch {
      // IndexedDB bisa ditolak di mode penyamaran. Cadangan luring jadi tidak
      // ada, tetapi aplikasi tetap jalan.
      aktif = penyimpananBacaMemori();
    }
  }
  return aktif;
}

/** Dipakai test supaya IndexedDB tidak dibutuhkan. */
export function pasangPenyimpananBaca(penyimpanan: PenyimpananBaca): void {
  aktif = penyimpanan;
}

/** Simpan salinan response GET yang berhasil. Diam saja kalau tidak layak cache. */
export async function simpanBaca(url: string, data: unknown): Promise<void> {
  if (!bolehDicache(url)) return;
  if (data === undefined || data === null) return;
  try {
    await penyimpananBaca().simpan({
      kunci: kunciBaca(url),
      planId: planIdDariUrl(url),
      waktu: Date.now(),
      data: potongIsi(url, data),
    });
  } catch {
    // Cadangan cuma cadangan. Gagal menyimpan tidak boleh menggagalkan
    // permintaan yang sebenarnya sudah berhasil.
  }
}

/** Baca cadangan untuk satu URL. Null kalau tidak ada atau tidak layak cache. */
export async function ambilBaca(url: string): Promise<unknown | null> {
  if (!bolehDicache(url)) return null;
  try {
    const entri = await penyimpananBaca().ambil(kunciBaca(url));
    return entri ? entri.data : null;
  } catch {
    return null;
  }
}
