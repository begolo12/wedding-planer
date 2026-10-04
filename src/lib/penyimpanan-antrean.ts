/**
 * Penyimpanan antrean luring, di balik satu antarmuka.
 *
 * Alasannya dipisah: kode antrean dan cache harus bisa diuji di Node, yang
 * tidak punya IndexedDB. Dengan antarmuka ini, test memasang implementasi
 * in-memory, sedangkan browser memakai IndexedDB. Tidak ada pustaka baru.
 *
 * `urut` diisi naik satu setiap penyimpanan, dan dipakai sebagai pemecah
 * seri saat dua item disimpan pada milidetik yang sama. Tanpa itu, urutan
 * kirim bisa berbeda dari urutan perubahan hanya karena jamnya sama, dan
 * docs/07 bagian "Antrean luring" menjanjikan kirim dari yang paling lama.
 */

export type ItemAntrean = {
  id: string;
  method: string;
  path: string;
  body: string | null;
  createdAt: number;
  attempts: number;
  lastError: string | null;
  /** Nomor urut naik, pemecah seri saat createdAt sama. Entri lama boleh kosong. */
  urut?: number;
};

export interface PenyimpananAntrean {
  daftar(): Promise<ItemAntrean[]>;
  simpan(item: ItemAntrean): Promise<void>;
  hapus(id: string): Promise<void>;
  hitung(): Promise<number>;
}

/**
 * Urutkan dari yang paling lama. createdAt jadi patokan utama, urut jadi
 * pemecah seri. Entri lama yang belum punya urut dianggap 0.
 */
export function urutkanAntrean(semua: ItemAntrean[]): ItemAntrean[] {
  return [...semua].sort((a, b) => a.createdAt - b.createdAt || (a.urut ?? 0) - (b.urut ?? 0));
}

const NAMA_DB = "haribesar-luring";
const NAMA_DB_LAMA = "aisyah-luring";
const VERSI_DB = 1;
const NAMA_TABEL = "antrean";

/**
 * Pindahkan antrean dari nama database lama ke nama baru.
 *
 * Nama database ikut nama produk. Kalau cuma diganti, antrean milik orang
 * yang sedang luring tertinggal di database lama dan tidak akan pernah dikirim
 * lagi. Perubahan pembayaran yang tidak terkirim itu hilang tanpa jejak, dan
 * catatan pembayaran yang hilang lebih buruk daripada aplikasi yang error.
 *
 * Yang lama dihapus setelah semua item tersalin, supaya kalau gagal di tengah
 * jalan tidak ada salinan yang tidak lengkap dan antrean asli masih utuh.
 */
function pindahkanAntreanLama(): Promise<void> {
  return new Promise((selesai) => {
    let permintaanLama: IDBOpenDBRequest;
    try {
      permintaanLama = indexedDB.open(NAMA_DB_LAMA, VERSI_DB);
    } catch {
      selesai();
      return;
    }
    permintaanLama.onerror = () => selesai();
    permintaanLama.onblocked = () => selesai();
    permintaanLama.onsuccess = () => {
      const lama = permintaanLama.result;
      if (!lama.objectStoreNames.contains(NAMA_TABEL)) {
        lama.close();
        selesai();
        return;
      }
      const baca = lama.transaction(NAMA_TABEL, "readonly").objectStore(NAMA_TABEL);
      const semua = baca.getAll();
      semua.onsuccess = () => {
        const isi = semua.result as ItemAntrean[];
        lama.close();
        if (isi.length === 0) {
          selesai();
          return;
        }
        salinLaluHapus(isi).then(selesai, () => selesai());
      };
      semua.onerror = () => {
        lama.close();
        selesai();
      };
    };
  });
}

function salinLaluHapus(isi: ItemAntrean[]): Promise<void> {
  return new Promise((selesai, gagal) => {
    const permintaan = indexedDB.open(NAMA_DB, VERSI_DB);
    permintaan.onupgradeneeded = () => {
      const db = permintaan.result;
      if (!db.objectStoreNames.contains(NAMA_TABEL)) {
        const toko = db.createObjectStore(NAMA_TABEL, { keyPath: "id" });
        toko.createIndex("createdAt", "createdAt");
      }
    };
    permintaan.onerror = () => gagal(permintaan.error);
    permintaan.onsuccess = () => {
      const db = permintaan.result;
      const trx = db.transaction(NAMA_TABEL, "readwrite");
      const toko = trx.objectStore(NAMA_TABEL);
      for (const item of isi) toko.put(item);
      trx.oncomplete = () => {
        db.close();
        // Baru setelah selesai menulis, yang lama dihapus.
        indexedDB.deleteDatabase(NAMA_DB_LAMA);
        selesai();
      };
      trx.onerror = () => {
        db.close();
        gagal(trx.error);
      };
      trx.onabort = () => {
        db.close();
        gagal(trx.error);
      };
    };
  });
}

function bukaDb(): Promise<IDBDatabase> {
  return pindahkanAntreanLama().then(
    () =>
      new Promise<IDBDatabase>((selesai, gagal) => {
        const permintaan = indexedDB.open(NAMA_DB, VERSI_DB);
        permintaan.onupgradeneeded = () => {
          const db = permintaan.result;
          if (!db.objectStoreNames.contains(NAMA_TABEL)) {
            const toko = db.createObjectStore(NAMA_TABEL, { keyPath: "id" });
            toko.createIndex("createdAt", "createdAt");
          }
        };
        permintaan.onsuccess = () => selesai(permintaan.result);
        permintaan.onerror = () => gagal(permintaan.error);
      }),
  );
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

/** Penyimpanan IndexedDB, dipakai di browser. */
export function penyimpananAntreanIndexedDb(): PenyimpananAntrean {
  return {
    async daftar() {
      return jalan<ItemAntrean[]>("readonly", (toko) => toko.getAll());
    },
    async simpan(item) {
      await jalan("readwrite", (toko) => toko.put(item));
    },
    async hapus(id) {
      await jalan("readwrite", (toko) => toko.delete(id));
    },
    async hitung() {
      return jalan<number>("readonly", (toko) => toko.count());
    },
  };
}

/** Penyimpanan in-memory, dipakai test di Node dan saat IndexedDB tidak ada. */
export function penyimpananAntreanMemori(): PenyimpananAntrean {
  const isi = new Map<string, ItemAntrean>();
  return {
    async daftar() {
      return [...isi.values()];
    },
    async simpan(item) {
      isi.set(item.id, { ...item });
    },
    async hapus(id) {
      isi.delete(id);
    },
    async hitung() {
      return isi.size;
    },
  };
}

let aktif: PenyimpananAntrean | null = null;

/** Penyimpanan yang sedang dipakai. Dipilih sekali, lalu dipakai terus. */
export function penyimpananAntrean(): PenyimpananAntrean {
  if (!aktif) {
    try {
      aktif =
        typeof indexedDB === "undefined"
          ? penyimpananAntreanMemori()
          : penyimpananAntreanIndexedDb();
    } catch {
      // Kalau IndexedDB ditolak, antrean tetap jalan di memori supaya tulis
      // tidak langsung hilang. Keterbatasannya: isinya hilang saat muat ulang.
      aktif = penyimpananAntreanMemori();
    }
  }
  return aktif;
}

/** Dipakai test supaya IndexedDB tidak dibutuhkan. */
export function pasangPenyimpananAntrean(penyimpanan: PenyimpananAntrean): void {
  aktif = penyimpanan;
}
