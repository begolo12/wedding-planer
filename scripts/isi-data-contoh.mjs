/**
 * Skrip isi data contoh.
 *
 * Dipakai hanya untuk mengisi database lokal saat assesses tampilan. Data
 * lewat endpoint HTTP yang sama dengan dipakai aplikasi, jadi bentuk
 * request dan validasinya ikut teruji.
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

let cookie = "";

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      origin: BASE,
      ...(cookie ? { cookie } : {}),
      ...(options.headers ?? {}),
    },
    redirect: "manual",
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(/,(?=[^;]+=)/).map((b) => b.split(";")[0]).join("; ");
  const teks = await res.text();
  let body = null;
  try {
    body = JSON.parse(teks);
  } catch {
    body = teks.slice(0, 200);
  }
  return { status: res.status, body };
}

async function buat(path, body) {
  const r = await api(path, { method: "POST", body: JSON.stringify(body) });
  if (r.status >= 400) {
    console.log("GAGAL", path, r.status, JSON.stringify(r.body).slice(0, 300));
  }
  return r;
}

const surel = process.env.SUREL ?? "desain@contoh.local";
const sandi = "sandikuat123";
const nama = "Dewi Rahayu";

const daftar = await api("/api/auth/sign-up/email", {
  method: "POST",
  body: JSON.stringify({ name: nama, email: surel, password: sandi }),
});
if (daftar.status >= 400) {
  const kode = String(daftar.body?.code ?? "");
  if (!kode.includes("ALREADY_EXISTS")) {
    console.log("DAFTAR GAGAL", daftar.status, JSON.stringify(daftar.body).slice(0, 300));
    process.exit(1);
  }
}

const masuk = await api("/api/auth/sign-in/email", {
  method: "POST",
  body: JSON.stringify({ email: surel, password: sandi }),
});
if (masuk.status >= 400) {
  console.log("MASUK GAGAL", masuk.status, JSON.stringify(masuk.body).slice(0, 300));
  process.exit(1);
}

let plans = await api("/api/plans");
if (!plans.body?.plans?.length) {
  plans = await buat("/api/plans", { partnerName: "Rangga" });
}
const planId = plans.body?.plans?.[0]?.id ?? plans.body?.plan?.id ?? plans.body?.id;
if (!planId) {
  console.log("TIDAK ADA PLAN", JSON.stringify(plans.body).slice(0, 400));
  process.exit(1);
}
console.log("PLAN", planId);

const hariH = "2026-11-14";

await api(`/api/plans/${planId}`, {
  method: "PATCH",
  body: JSON.stringify({ partnerName: "Rangga", weddingDate: hariH, status: "perencanaan" }),
});

const tanggal = [
  { title: "Akad nikah", eventDate: hariH, eventTime: "08:00", type: "akad", isDayOf: true, sortOrder: 0 },
  { title: "Resepsi", eventDate: hariH, eventTime: "11:00", type: "resepsi", sortOrder: 1 },
  { title: "Dekorasi pelaminan", eventDate: "2026-11-13", eventTime: "14:00", type: "lainnya", sortOrder: 2 },
  { title: "Sesi foto prewedding", eventDate: "2026-10-03", eventTime: "09:00", type: "prewedding", sortOrder: 3 },
  { title: "Surat pengantar RT", eventDate: "2026-10-20", type: "adat", sortOrder: 4 },
];
for (const t of tanggal) {
  await buat(`/api/plans/${planId}/milestones`, t);
}

const tugas = [
  { title: "Bayar DP dekorasi", category: "Vendor", dueDate: "2026-09-20", priority: "tinggi", assignee: "saya", status: "belum" },
  { title: "Pemesanan gaun pengantin", category: "Sandang", dueDate: "2026-10-01", priority: "tinggi", assignee: "pasangan", status: "belum" },
  { title: "Cek dekorasi pelaminan", category: "Tamu", dueDate: "2026-10-25", priority: "sedang", assignee: "saya", status: "belum" },
  { title: "Foto untuk undangan digital", category: "Administrasi", dueDate: "2026-10-15", priority: "sedang", assignee: "pasangan", status: "belum" },
  { title: "Daftar tamu undangan", category: "Tamu", dueDate: null, priority: "sedang", assignee: "saya", status: "belum" },
  { title: "Cek katering menu", category: "Vendor", dueDate: "2026-09-15", priority: "sedang", assignee: "saya", status: "selesai" },
  { title: "Bungkus baju pelaminan", category: "Sandang", dueDate: "2026-09-12", priority: "rendah", assignee: "keluarga", status: "selesai" },
  { title: "Ambil kartu resepsi", category: "Administrasi", dueDate: null, priority: "rendah", assignee: "pasangan", status: "selesai" },
];
for (const t of tugas) {
  await buat(`/api/plans/${planId}/tasks`, t);
}

const uang = [
  { name: "Venue gedung", category: "venue", plannedAmount: 35000000 },
  { name: "Katering 400 porsi", category: "katering", plannedAmount: 60000000 },
  { name: "Dekorasi pelaminan", category: "dekorasi", plannedAmount: 45000000 },
  { name: "Busana pengantin", category: "busana", plannedAmount: 28000000 },
  { name: "Dokumentasi foto dan video", category: "dokumentasi", plannedAmount: 15000000 },
  { name: "Seserahan", category: "adat", plannedAmount: 8000000 },
  { name: "Transport dan akomodasi", category: "transport", plannedAmount: 6000000 },
  { name: "Undangan cetak", category: "lainnya", plannedAmount: 2500000 },
];
for (const u of uang) {
  await buat(`/api/plans/${planId}/budget-items`, u);
}

const vendor = [
  { name: "Gedung Serbagga Melati", category: "venue", contactName: "Pak Rahmat", phone: "081234567890", status: "dibook" },
  { name: "Katering Bu Sri", category: "katering", contactName: "Bu Sri", phone: "082345678901", status: "dibook" },
  { name: "Dekorasi Sekar Arum", category: "dekorasi", contactName: "Mba Ayu", phone: "083456789012", status: "dibook" },
  { name: "Sanggar Rias Melati", category: "lainnya", contactName: "Mba Lilis", phone: "081234567890", status: "calon" },
  { name: "Atelier Busana Rani", category: "busana", contactName: "Mba Rani", phone: "085678901234", status: "dibook" },
  { name: "Dokumentasi Abadi", category: "dokumentasi", contactName: "Pak Adi", phone: "087890123456", status: "calon" },
];
const buatVendor = [];
for (const v of vendor) {
  const r = await buat(`/api/plans/${planId}/vendors`, v);
  if (r.body?.vendor?.id) buatVendor.push(r.body.vendor);
  else if (r.body?.id) buatVendor.push(r.body);
}

for (const v of buatVendor) {
  const nominal = { "Gedung Serbagga Melati": 10000000, "Katering Bu Sri": 15000000, "Dekorasi Sekar Arum": 15000000, "Atelier Busana Rani": 8000000 };
  const n = nominal[v.name] ?? 3000000;
  if (!n) continue;
  await buat(`/api/plans/${planId}/vendors/${v.id}/payments`, {
    amount: n,
    paidAt: "2026-09-10",
    method: "transfer",
    notes: "DP",
  });
}

const tamu = [
  { name: "Bapak Sutrisno", category: "keluargaPasangan", side: "pria", rsvpStatus: "hadir", guestCount: 2, tableName: "Meja 1" },
  { name: "Ibu Maryati", category: "keluargaPasangan", side: "wanita", rsvpStatus: "hadir", guestCount: 2, tableName: "Meja 1" },
  { name: "Kak Danu", category: "keluargaBesar", side: "pria", rsvpStatus: "belum", guestCount: 4, tableName: "Meja 3" },
  { name: "Tante Yuni", category: "keluargaBesar", side: "wanita", rsvpStatus: "hadir", guestCount: 3, tableName: "Meja 3" },
  { name: "Rina@lur", category: "teman", side: "wanita", rsvpStatus: "tidak", guestCount: 1 },
  { name: "Pak Hendra", category: "kerja", side: "pria", rsvpStatus: "belum", guestCount: 2, tableName: "Meja 5" },
  { name: "Anak-anakXJ", category: "anak", side: "pria", rsvpStatus: "hadir", guestCount: 3, tableName: "Meja 7" },
];
for (const t of tamu) {
  await buat(`/api/plans/${planId}/guests`, t);
}

const rundown = [
  { title: "Persiapan rumah pengantin", startTime: "07:00", durationMinutes: 60, location: "Rumah pengantin", picName: "Ibu" },
  { title: "Dekorasi satu", startTime: "08:00", durationMinutes: 30, location: "Gedung", picName: "Mba Ayu" },
  { title: "Akad nikah", startTime: "08:30", durationMinutes: 60, location: "Gedung", picName: "Penghulu" },
  { title: "Sesi foto keluarga", startTime: "09:45", durationMinutes: 45, location: "Taman gedung", picName: "Dokumentasi" },
  { title: "Pemasangan seserahan", startTime: "10:30", durationMinutes: 30, location: "Gedung", picName: "Bu Sri" },
  { title: "Makan bersama", startTime: "11:30", durationMinutes: 120, location: "Gedung", picName: "Bu Sri" },
];
for (const r of rundown) {
  await buat(`/api/plans/${planId}/rundown`, r);
}

const busana = [
  { itemName: "Gaun pengantin", owner: "pengantinWanita", status: "dijahit", measureDate: "2026-09-10", pickupDate: "2026-11-01", estimatedCost: 12000000 },
  { itemName: "Baju melati", owner: "pengantinPria", status: "dicari", estimatedCost: 5000000 },
  { itemName: "Baju orang tua", owner: "orangTua", status: "belum", estimatedCost: 2500000 },
  { itemName: "Baju pelaminan", owner: "keluarga", status: "siap" },
];
for (const b of busana) {
  await buat(`/api/plans/${planId}/outfits`, b);
}

const cek = await api(`/api/plans/${planId}/overview`);
console.log("RINGKASAN", JSON.stringify(cek.body).slice(0, 600));
console.log("SELESAI");
