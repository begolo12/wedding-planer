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
  return { status: res.status, teks: await res.text(), headers: res.headers };
}

const masuk = await api("/api/auth/sign-in/email", {
  method: "POST",
  body: JSON.stringify({ email: "desain@contoh.local", password: "sandikuat123" }),
});
console.log("MASUK", masuk.status);

const beranda = await api("/beranda");
console.log("BERANDA", beranda.status);
const html = beranda.teks;
const cek = [
  "beranda-hero",
  "beranda-cahaya-kanan",
  "beranda-pil-aksen",
  "beranda-mundur-besar",
  "beranda-aksi-pil",
  "beranda-metrik",
  "beranda-cincin",
  "Tugas Prioritas",
  "Vendor Utama",
  "Tanggal Penting",
  "Catatan Manis Pasangan",
  "Lihat seluruh tugas",
  "Tambah tugas pertama",
];
for (const t of cek) console.log((html.includes(t) ? "ADA   " : "TIDAK ") + t);
console.log("PANJANG", html.length);

const api2 = await api(`/api/plans`);
const planId = JSON.parse(api2.teks)?.plans?.[0]?.id;
const over = await api(`/api/plans/${planId}/overview`);
console.log("OVERVIEW", over.status, over.teks.slice(0, 240));
