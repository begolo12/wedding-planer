"use client";

/**
 * Deteksi luring dan antrean perubahan.
 *
 * `navigator.onLine` tidak dipakai sendirian karena browser sering bilang
 * online di Wi-Fi yang sudah tidak punya internet. Yang dipakai: cek kecil ke
 * endpoint sendiri. Kalau gagal, dianggap luring, walaupun browser bilang
 * online.
 *
 * Ceknya tiap 30 detik dan tiap tab kembali aktif. Tidak ada sync periodik
 * yang berjalan diam-diam, karena itu memakai kuota data tanpa diminta.
 */

const NAMA_DB = "aisyah-luring";
const VERSI_DB = 1;
const NAMA_TABEL = "antrean";
const BATAS_ANTREAN = 200;

export type ItemAntrean = {
  id: string;
  method: string;
  path: string;
  body: string | null;
  createdAt: number;
  attempts: number;
  lastError: string | null;
};

function bukaDb(): Promise<IDBDatabase> {
  return new Promise((selesai, gagal) => {
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

/** Semua antrean, dari yang paling lama. Urutan ini yang dipakai saat kirim. */
export async function daftarAntrean(): Promise<ItemAntrean[]> {
  const semua = await jalan<ItemAntrean[]>("readonly", (toko) => toko.getAll());
  return semua.sort((a, b) => a.createdAt - b.createdAt);
}

export async function jumlahAntrean(): Promise<number> {
  return jalan<number>("readonly", (toko) => toko.count());
}

/**
 * Simpan satu perubahan yang gagal terkirim.
 *
 * Batasnya 200 item. Kalau lewat, yang paling tua dibuang dan orangnya diberi
 * tahu. Antrean yang membengkak tanpa batas memperlambat setiap pengiriman,
 * dan 200 perubahan luring sudah jauh melebihi yang realistis.
 */
export async function simpanKeAntrean(
  method: string,
  path: string,
  body: string | null,
): Promise<{ diterima: boolean; dibuang: number }> {
  const isi: ItemAntrean = {
    id: crypto.randomUUID(),
    method,
    path,
    body,
    createdAt: Date.now(),
    attempts: 0,
    lastError: null,
  };

  await jalan("readwrite", (toko) => toko.put(isi));

  const semua = await daftarAntrean();
  let dibuang = 0;
  if (semua.length > BATAS_ANTREAN) {
    for (const lama of semua.slice(0, semua.length - BATAS_ANTREAN)) {
      await buangAntrean(lama.id);
      dibuang += 1;
    }
  }

  return { diterima: dibuang === 0, dibuang };
}

export async function buangAntrean(id: string): Promise<void> {
  await jalan("readwrite", (toko) => toko.delete(id));
}

/**
 * Kirim antrean berurutan, berhenti di kegagalan pertama.
 *
 * Berhenti, bukan lanjut, karena urutannya bermakna: kalau orang menambah
 * lalu menghapus saat luring, hapus tidak boleh tiba sebelum tambah.
 */
export async function kirimAntrean(): Promise<{ terkirim: number; tersisa: number }> {
  const semua = await daftarAntrean();
  let terkirim = 0;

  for (const item of semua) {
    if (item.attempts >= 5) continue;

    try {
      const res = await fetch(item.path, {
        method: item.method,
        headers: item.body ? { "Content-Type": "application/json" } : undefined,
        body: item.body ?? undefined,
        credentials: "same-origin",
      });

      // 4xx berarti servernya sudah menjawab dan isinya tidak akan diterima
      // walau diulang, jadi itemnya dibuang, bukan ditahan selamanya.
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        await buangAntrean(item.id);
        terkirim += 1;
        continue;
      }

      await naikkanPercobaan(item, `Server membalas ${res.status}.`);
      break;
    } catch {
      await naikkanPercobaan(item, "Masih tidak ada koneksi.");
      break;
    }
  }

  return { terkirim, tersisa: await jumlahAntrean() };
}

async function naikkanPercobaan(item: ItemAntrean, pesan: string): Promise<void> {
  await jalan("readwrite", (toko) =>
    toko.put({ ...item, attempts: item.attempts + 1, lastError: pesan }),
  );
}

/** Cek koneksi sungguhan. `navigator.onLine` hanya jadi saringan pertama. */
export async function cekKoneksi(): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;
  try {
    const res = await fetch("/api/kesehatan", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    return res.ok || res.status === 401 || res.status === 404;
  } catch {
    return false;
  }
}
