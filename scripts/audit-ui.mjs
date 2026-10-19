import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

// Port bisa diganti lewat AUDIT_URL supaya skrip ini tidak terikat ke satu
// port pengembangan.
const DASAR = process.env.AUDIT_URL ?? "http://127.0.0.1:3130";
const LAYAR = [
  ["beranda", "/beranda"],
  ["rencana", "/rencana"],
  ["rencana-tanggal", "/rencana/tanggal"],
  ["anggaran", "/anggaran"],
  ["tamu", "/tamu"],
  ["hari-h", "/hari-h"],
  ["laporan", "/laporan"],
  ["akun", "/akun"],
];

mkdirSync(".shots/audit", { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();

const email = `audit-${Date.now()}@gmail.com`;
await p.goto(`${DASAR}/daftar`);
await p.getByLabel("Nama Kamu").fill("Sarah");
await p.getByLabel("Nama Pasangan Impian").fill("Dimas");
await p.getByLabel("Email Bersama / Utama").fill(email);
await p.getByLabel("Kata Sandi Rahasia").fill("rahasia-uji-123");
await p.locator("label.auth-syarat").click();
await p.getByRole("button", { name: "Buat Akun Pernikahan Kami" }).click();
await p.waitForURL(/beranda/, { timeout: 30000 });

const daftar = await p.request.get(`${DASAR}/api/plans`);
let planId = (await daftar.json()).plans?.[0]?.id;
if (!planId) {
  const buat = await p.request.post(`${DASAR}/api/plans`, { data: { partnerName: "Dimas" } });
  planId = (await buat.json()).plan.id;
}

// Isi data supaya layar tidak kosong.
const seed = async (jalur, data) => {
  const r = await p.request.post(`${DASAR}/api/plans/${planId}${jalur}`, { data });
  if (!r.ok()) console.log("SEED GAGAL", jalur, r.status(), (await r.text()).slice(0, 160));
};

await p.request.patch(`${DASAR}/api/plans/${planId}`, {
  data: { partnerName: "Dimas", weddingDate: "2027-06-30", status: "berlangsung" },
});
for (const [i, t] of ["Bayar DP katering", "Fitting busana", "Konfirmasi dekorasi", "Kirim undangan"].entries()) {
  await seed("/tasks", { title: t, category: "Vendor", priority: i === 0 ? "tinggi" : "sedang" });
}
for (const [i, b] of [["Katering", 45000000], ["Dekorasi", 28000000], ["Busana", 12000000]].entries()) {
  await seed("/budget-items", { name: b[0], plannedAmount: b[1], category: "lainnya" });
}
for (const n of ["Ahmad", "Siti", "Budi", "Rina"]) {
  await seed("/guests", { name: n, guestCount: 2 });
}
await seed("/milestones", { title: "Akad nikah", eventDate: "2027-06-30", type: "akad" });
await seed("/rundown", { title: "Prosesi akad", startTime: "08:00", endTime: "09:00", pic: "Koordinator" });

const ukur = async (nama, jalur, lebar) => {
  await p.setViewportSize({ width: lebar, height: 844 });
  await p.goto(`${DASAR}${jalur}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);

  const m = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const isi = q("main") ?? document.body;
    const kepala = q(".kepala-layar") ?? q("main h1")?.parentElement ?? null;
    // Baris daftar tidak selalu `li`: daftar tamu memakai div per baris, dan
    // daftar pos memakai div juga. Yang dihitung adalah elemen berulang yang
    // benar-benar terlihat, bukan tag tertentu.
    const baris = [...document.querySelectorAll("main li, main tr, main article, main .pos-baris, main .tugas")];
    const kecil = [...document.querySelectorAll("main button, main a, main [role=button], main input, main select")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44);
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        const label = (el.textContent ?? el.getAttribute("aria-label") ?? el.tagName).trim().slice(0, 24);
        return `${Math.round(r.width)}x${Math.round(r.height)} ${label}`;
      });
    return {
      geser: document.body.scrollWidth - window.innerWidth,
      kepala: kepala ? Math.round(kepala.getBoundingClientRect().height) : null,
      isiPertama: baris.length ? Math.round(baris[0].getBoundingClientRect().top) : null,
      baris: baris.length,
      kecil: kecil.slice(0, 6),
      kecilJumlah: kecil.length,
    };
  });

  console.log(
    `${nama.padEnd(18)} ${String(lebar).padEnd(5)} geser=${m.geser} kepala=${m.kepala ?? "-"} isiPertama=${m.isiPertama ?? "-"} baris=${m.baris} targetKecil=${m.kecilJumlah}${m.kecil.length ? " " + m.kecil.join(" | ") : ""}`,
  );

  await p.screenshot({ path: `.shots/audit/${nama}-${lebar}.png`, fullPage: false });
};

for (const [nama, jalur] of LAYAR) {
  await ukur(nama, jalur, 390);
}
for (const [nama, jalur] of LAYAR) {
  await ukur(nama, jalur, 1440);
}

// Bersihkan akun uji supaya database tidak menumpuk akun audit.
await p.request.post(`${DASAR}/api/auth/delete-user`, { data: { password: "rahasia-uji-123" } });

await b.close();
console.log("selesai");
