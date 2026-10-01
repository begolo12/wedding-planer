// Prod smoke check: sign in with the seeded account, then fetch key app routes
// and assert they render real content (not the login redirect) and that the
// version string reads 0.11.1.
const BASE = process.env.PROBE_BASE ?? "https://wedding-planer-self.vercel.app";
const EMAIL = process.env.PROBE_EMAIL ?? "desain@contoh.local";
const PASS = process.env.PROBE_PASS ?? "sandikuat123";

const jar = new Map();
function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
function absorb(res) {
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const c of raw) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    const k = pair.slice(0, i).trim();
    const v = pair.slice(i + 1).trim();
    if (v === "" || /expires=Thu, 01 Jan 1970/i.test(c)) jar.delete(k);
    else jar.set(k, v);
  }
}

const routes = [
  "/beranda",
  "/rencana",
  "/rencana/vendor",
  "/laporan",
  "/tamu",
  "/tamu/impor",
  "/anggaran",
  "/hari-h",
  "/akun",
  "/aplikasi",
  "/luring",
];

const out = [];
const login = await fetch(`${BASE}/api/auth/sign-in/email`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: BASE },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
  redirect: "manual",
});
absorb(login);
out.push(`LOGIN  ${login.status}  cookies=${jar.size}`);
if (!login.ok) {
  out.push(await login.text().catch(() => ""));
}

for (const r of routes) {
  const res = await fetch(`${BASE}${r}`, {
    headers: { cookie: cookieHeader() },
    redirect: "manual",
  });
  const html = res.status === 200 ? await res.text() : "";
  const redirectedToLogin = res.status >= 300 && res.status < 400;
  const looksLikeLogin = html.includes("Masuk ke akun") || html.includes('action="/api/auth');
  const marker = redirectedToLogin
    ? `-> ${res.headers.get("location")}`
    : looksLikeLogin
      ? "LOGIN PAGE"
      : `len=${html.length}`;
  out.push(`${String(res.status).padEnd(3)} ${r.padEnd(18)} ${marker}`);
}

const akun = await fetch(`${BASE}/akun`, { headers: { cookie: cookieHeader() } });
const akunHtml = await akun.text();
const verHit = /0\.11\.1/.test(akunHtml);
out.push(`/akun contains 0.11.1 : ${verHit}`);
const m = akunHtml.match(/Versi sistem[\s\S]{0,200}/);
out.push(`versi context: ${m ? m[0].replace(/\s+/g, " ").slice(0, 160) : "not found"}`);

console.log(out.join("\n"));
