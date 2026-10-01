const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const email = `probe-${Date.now()}@contoh.id`;

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

const daftar = await api("/api/auth/sign-up/email", {
  method: "POST",
  body: JSON.stringify({ email, password: "rahasia12345", name: "Probe" }),
});
console.log("DAFTAR", daftar.status);

const plan = await api("/api/plans", {
  method: "POST",
  body: JSON.stringify({ partnerName: "Probe", weddingDate: "2026-11-14" }),
});
const planId = plan.body?.plan?.id;
console.log("PLAN", plan.status, planId);

await api(`/api/plans/${planId}/vendors`, {
  method: "POST",
  body: JSON.stringify({ name: "Dekorasi Ayu", category: "dekorasi", phone: "08123456789" }),
});
await api(`/api/plans/${planId}/guests`, {
  method: "POST",
  body: JSON.stringify({ name: "Budi", guestCount: 2, rsvpStatus: "hadir" }),
});

const over = await api(`/api/plans/${planId}/overview`);
console.log("OVERVIEW", over.status);
console.log("vendorUtama", JSON.stringify(over.body?.vendorUtama));
console.log("tamu", JSON.stringify(over.body?.tamu));
console.log("jumlahTugas", JSON.stringify(over.body?.jumlahTugas));
console.log("uang", JSON.stringify(over.body?.uang));
