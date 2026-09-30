/*
 * Service worker untuk Hari Besar.
 *
 * Ditulis tangan, bukan pakai Workbox. Alasannya bukan soal ukuran berkas,
 * tapi soal berapa banyak yang perlu dipahami orang berikutnya. Strategi di
 * sini cuma empat, dan empat penanganan tidak sepadan dengan satu pustaka
 * beserta API-nya yang harus dipelajari lebih dulu.
 *
 * Aturan yang tidak boleh dilanggar: response /api/ tidak pernah masuk cache.
 * Kalau pembayaran dicache, orang bisa melihat pembayaran sudah tercatat
 * padahal server belum menerima. Untuk data uang, data basi lebih berbahaya
 * daripada data yang tidak ada.
 */

const VERSI = "v2";
const CACHE_HALAMAN = `haribesar-halaman-${VERSI}`;
const CACHE_ASET = `haribesar-aset-${VERSI}`;
const CACHE_FONT = `haribesar-font-${VERSI}`;
const SEMUA_CACHE = [CACHE_HALAMAN, CACHE_ASET, CACHE_FONT];

const HALAMAN_LURING = "/luring";
// Layar penjelasan pemasangan. Ikut disimpan supaya ajakan pasang yang muncul
// di dalam aplikasi tetap bisa dibuka saat luring.
const HALAMAN_APLIKASI = "/aplikasi";
const BATAS_NAVIGASI = 3000;
const BATAS_FONT = 30;

self.addEventListener("install", (e) => {
  // Halaman luring disimpan lebih dulu supaya selalu ada cadangan, walaupun
  // orangnya belum pernah membuka halaman itu sebelumnya.
  e.waitUntil(
    caches
      .open(CACHE_HALAMAN)
      .then((c) => c.addAll([HALAMAN_LURING, HALAMAN_APLIKASI]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nama) =>
        Promise.all(nama.filter((n) => !SEMUA_CACHE.includes(n)).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Hanya urus permintaan ke asal sendiri. Permintaan ke layanan lain
  // dibiarkan lewat, karena kita tidak tahu apa yang dilakukannya.
  if (url.origin !== self.location.origin) return;

  // Tautan baca-saja tidak pernah di-cache. Satu alamat bisa dibuka kapan
  // saja, dan isinya bisa dicabut. Menyimpannya berarti orang yang sudah
  // dicabut aksesnya masih bisa membukanya.
  if (url.pathname.startsWith("/bagikan/")) return;

  if (url.pathname.startsWith("/api/")) {
    e.respondWith(tanganiApi(request));
    return;
  }

  if (request.mode === "navigate") {
    e.respondWith(tanganiNavigasi(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/ikon/")) {
    e.respondWith(cacheDulu(request, CACHE_ASET));
    return;
  }

  if (request.destination === "font") {
    e.respondWith(cacheDulu(request, CACHE_FONT, BATAS_FONT));
    return;
  }
});

/**
 * API selalu dari jaringan. Kalau gagal, tidak ada yang dikembalikan dari
 * cache, dan perubahan yang berupa tulis masuk ke antrean di sisi halaman.
 */
async function tanganiApi(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({
        error: { code: "LURING", message: "Tidak ada koneksi. Perubahan disimpan dan dikirim nanti." },
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
}

/**
 * Halaman: coba jaringan dengan batas waktu, baru pakai cache.
 *
 * Batas waktunya 3 detik. Tanpa itu, satu permintaan yang menggantung di
 * sinyal satu bar membuat halaman terlihat rusak, padahal salinan lama sudah
 * ada dan masih berguna.
 */
async function tanganiNavigasi(request) {
  const cache = await caches.open(CACHE_HALAMAN);
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, gagal) => setTimeout(() => gagal(new Error("lewat batas")), BATAS_NAVIGASI)),
    ]);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const tersimpan = await cache.match(request);
    if (tersimpan) return tersimpan;
    const luring = await cache.match(HALAMAN_LURING);
    if (luring) return luring;
    return new Response("Tidak ada koneksi.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Aset statis: pakai cache dulu.
 *
 * Nama berkasnya sudah mengandung hash, jadi isi satu nama tidak pernah
 * berubah. Tidak ada gunanya menanyakan ulang ke jaringan.
 */
async function cacheDulu(request, namaCache, batas) {
  const cache = await caches.open(namaCache);
  const tersimpan = await cache.match(request);
  if (tersimpan) return tersimpan;

  const res = await fetch(request);
  if (res.ok) {
    cache.put(request, res.clone());
    if (batas) potongCache(namaCache, batas);
  }
  return res;
}

/** Font jarang berubah, tapi tidak ada gunanya menyimpan semuanya. */
async function potongCache(namaCache, batas) {
  const cache = await caches.open(namaCache);
  const kunci = await cache.keys();
  if (kunci.length <= batas) return;
  for (const k of kunci.slice(0, kunci.length - batas)) await cache.delete(k);
}

// Service worker baru tidak langsung mengambil alih. Orangnya mungkin sedang
// mengisi formulir, dan memuat ulang di tengah pengisian membuang isinya.
self.addEventListener("message", (e) => {
  if (e.data === "ambil-alih") self.skipWaiting();
});
