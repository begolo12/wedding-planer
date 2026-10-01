const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const email = "probe-beranda@contoh.id";
const password = "rahasia12345";

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

const masuk = await api("/api/auth/sign-in/email", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
let ok = masuk.status === 200;
if (!ok) {
  const d = await api("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ email, password, name: "Probe Beranda" }),
  });
  ok = d.status === 200;
  console.log("BUAT", d.status);
}
console.log("MASUK", masuk.status);

const plans = await api("/api/plans");
let planId = plans.body?.plans?.[0]?.id;
if (!planId) {
  const p = await api("/api/plans", {
    method: "POST",
    body: JSON.stringify({ partnerName: "Rangga", weddingDate: "2026-11-14" }),
  });
  planId = p.body?.plan?.id;
}
console.log("PLANID", planId);

const tugas = await api(`/api/plans/${planId}/tasks`);
if ((tugas.body?.tasks ?? tugas.body ?? []).length === 0) {
  for (const t of [
    { title: "Pemesanan gaun pengantin", category: "Sandang", dueDate: "2026-10-01", priority: "tinggi" },
    { title: "Foto untuk undangan digital", category: "Administrasi", dueDate: "2026-10-15" },
    { title: "Cicipi menu katering", category: "Konsumsi", dueDate: "2026-11-01" },
  ]) {
    await api(`/api/plans/${planId}/tasks`, { method: "POST", body: JSON.stringify(t) });
  }
}
const vendors = await api(`/api/plans/${planId}/vendors`);
if ((vendors.body?.vendors ?? []).length === 0) {
  await api(`/api/plans/${planId}/vendors`, {
    method: "POST",
    body: JSON.stringify({ name: "Dekorasi Ayu", category: "dekorasi", phone: "08123456789" }),
  });
  await api(`/api/plans/${planId}/vendors`, {
    method: "POST",
    body: JSON.stringify({ name: "Katering Bunda", category: "katering", phone: "08129876543" }),
  });
}
const tamu = await api(`/api/plans/${planId}/guests`);
if ((tamu.body?.guests ?? []).length === 0) {
  await api(`/api/plans/${planId}/guests`, {
    method: "POST",
    body: JSON.stringify({ name: "Budi", guestCount: 2, rsvpStatus: "hadir" }),
  });
  await api(`/api/plans/${planId}/guests`, {
    method: "POST",
    body: JSON.stringify({ name: "Sari", guestCount: 3, rsvpStatus: "belum" }),
  });
}
const over = await api(`/api/plans/${planId}/overview`);
console.log("OVERVIEW", over.status);
console.log("METRIK", JSON.stringify({
  tugas: over.body?.jumlahTugas,
  uang: over.body?.uang,
  tamu: over.body?.tamu,
  vendor: over.body?.jumlahVendor,
  vendorUtama: over.body?.vendorUtama?.length,
  tanggal: over.body?.tanggalBerikut?.title ?? null,
}));
