import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { akunUnik, daftarAkun } from "./bantu";
import { hapusAkunUji } from "./db-uji";

/**
 * Dua hal yang paling berisiko dihitung salah untuk pengguna Indonesia:
 * hitung mundur/lewat tenggat yang bergeser satu hari, dan nomor WhatsApp yang
 * disimpan dalam bentuk lokal sehingga tautan wa.me tidak mengenalinya.
 *
 * Test ini memakai tanggal yang dihitung dari kalender Asia/Jakarta, bukan
 * dari jam proses, jadi hasilnya sama walau test dijalankan di zona mana pun
 * (dibuktikan dengan menjalankan berkas ini di `TZ=UTC` dan
 * `TZ=Pacific/Kiritimati`).
 */

type DaftarPlans = { plans: { id: string }[] };
type Ringkasan = {
  hariBesar: string | null;
  hariKe: number | null;
  teksHitungMundur: string | null;
  jumlahTugas: { lewat: number };
  tugasTerdekat: { kelompok: string }[];
};
type Laporan = {
  hitungMundur: { hari: number | null; teks: string };
  tugas: { lewat: number };
};
type ResponsLaporan = { report: Laporan };
type Tamu = { guest: { phone: string | null } };
type Vendor = { vendor: { phone: string | null } };
type Galat = { error: { code: string } };

/** Tanggal hari ini di Asia/Jakarta, bentuk `YYYY-MM-DD`. */
function hariIniJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Geser tanggal murni sebanyak n hari. */
function geserTanggal(tanggal: string, n: number): string {
  const d = new Date(`${tanggal}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function planPertama(page: Page): Promise<string> {
  const daftar = await page.request.get("/api/plans");
  expect(daftar.status()).toBe(200);
  const data: DaftarPlans = await daftar.json();
  expect(data.plans.length).toBeGreaterThan(0);
  return data.plans[0]!.id;
}

test("hitung mundur dan lewat tenggat sama di zona proses mana pun", async ({ page }) => {
  const email = akunUnik("e2e-zona");
  await daftarAkun(page, email);

  try {
    const planId = await planPertama(page);
    const hariIni = hariIniJakarta();
    const kemarin = geserTanggal(hariIni, -1);

    // Hari besar dipatok ke hari ini menurut kalender Asia/Jakarta.
    const patch = await page.request.patch(`/api/plans/${planId}`, {
      data: { weddingDate: hariIni },
    });
    expect(patch.status()).toBe(200);

    const buatTugas = async (title: string, dueDate: string) => {
      const r = await page.request.post(`/api/plans/${planId}/tasks`, {
        data: { title, dueDate },
      });
      expect(r.status()).toBe(201);
    };
    await buatTugas("Bayar DP katering", kemarin);
    await buatTugas("Konfirmasi dekorasi", hariIni);

    const ringkasan: Ringkasan = await (
      await page.request.get(`/api/plans/${planId}/overview`)
    ).json();
    expect(ringkasan.hariBesar).toBe(hariIni);
    expect(ringkasan.hariKe).toBe(0);
    expect(ringkasan.teksHitungMundur).toBe("hari ini");
    expect(ringkasan.jumlahTugas.lewat).toBe(1);
    expect(ringkasan.tugasTerdekat.map((t) => t.kelompok)).toContain("hariIni");
    expect(ringkasan.tugasTerdekat.map((t) => t.kelompok)).not.toContain("lewat");

    const responsLaporan: ResponsLaporan = await (
      await page.request.get(`/api/plans/${planId}/report`)
    ).json();
    const laporan = responsLaporan.report;
    expect(laporan.hitungMundur.hari).toBe(0);
    expect(laporan.hitungMundur.teks).toBe("hari ini");
    expect(laporan.tugas.lewat).toBe(1);
  } finally {
    await hapusAkunUji(email);
  }
});

test("nomor WhatsApp disimpan sebagai 628xx dan yang salah ditolak 422", async ({ page }) => {
  const email = akunUnik("e2e-nomor");
  await daftarAkun(page, email);

  try {
    const planId = await planPertama(page);

    const tamu = await page.request.post(`/api/plans/${planId}/guests`, {
      data: { name: "Ahmad", phone: "0812-3456-7890" },
    });
    expect(tamu.status()).toBe(201);
    const tamuIsi: Tamu = await tamu.json();
    expect(tamuIsi.guest.phone).toBe("6281234567890");

    const vendor = await page.request.post(`/api/plans/${planId}/vendors`, {
      data: { name: "Dekorasi Melati", phone: "+62 812 3456 7890" },
    });
    expect(vendor.status()).toBe(201);
    const vendorIsi: Vendor = await vendor.json();
    expect(vendorIsi.vendor.phone).toBe("6281234567890");

    const buruk = await page.request.post(`/api/plans/${planId}/guests`, {
      data: { name: "Salah", phone: "bukan nomor" },
    });
    expect(buruk.status()).toBe(422);
    const burukIsi: Galat = await buruk.json();
    expect(burukIsi.error.code).toBe("VALIDATION_ERROR");
  } finally {
    await hapusAkunUji(email);
  }
});
