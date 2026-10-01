const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: BASE },
  body: JSON.stringify({ email: "desain@contoh.local", password: "sandikuat123" }),
  redirect: "manual",
});
console.log("STATUS", res.status);
const sets = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")];
for (const s of sets) console.log("COOKIE", s);
