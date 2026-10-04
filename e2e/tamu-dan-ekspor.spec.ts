import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { akunUnik, daftarAkun } from "./bantu";
import { hapusAkunUji } from "./db-uji";

/**
 * Rekap tamu (porsi katering dan kursi), sisi tamu, penandaan undangan
 * borongan, tautan undangan per acara, metode bayar QRIS, kategori anggaran
 * administrasi, dan ekspor data pribadi.
 *
 * Semua lewat kontrak API supaya yang diuji perilakunya, bukan tampilan yang
 * masih dikerjakan pekerja lain.
 */

type DaftarPlans = { plans: { id: string }[] };
type Tamu = {
  id: string;
  name: string;
  side: string | null;
  phone: string | null;
  invitedAt: string | null;
};
type RekapTamu = {
  baris: number;
  orang: number;
  hadir: number;
  belumKonfirmasi: number;
  tidakHadir: number;
  belumDiundang: number;
  belumDiundangBaris: number;
  porsi: number;
  kursi: number;
  perkiraanMaksimal: number;
  perSisi: { pria: number; wanita: number; bersama: number };
};
type DaftarTamu = { guests: Tamu[]; summary: RekapTamu };
type TamuBaru = { guest: Tamu };
type Galat = { error: { code: string; fields?: Record<string, string> } };
type Milestone = { milestone: { id: string; invitationUrl: string | null } };
type Vendor = { vendor: { id: string } };
type Pembayaran = { payment: { method: string } };
type PosAnggaran = { item: { category: string } };
type Ekspor = {
  ekspor: {
    plan: { id: string };
    guests: { name: string; phone: string | null }[];
    milestones: unknown[];
    tasks: unknown[];
    budgetItems: unknown[];
    vendors: unknown[];
    payments: unknown[];
    rundown: unknown[];
    announcements: unknown[];
    outfits: unknown[];
  };
};

function hariIniJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function planPertama(page: Page): Promise<string> {
  const daftar = await page.request.get("/api/plans");
  expect(daftar.status()).toBe(200);
  const data: DaftarPlans = await daftar.json();
  expect(data.plans.length).toBeGreaterThan(0);
  return data.plans[0]!.id;
}

async function buatTamu(
  page: Page,
  planId: string,
  data: Record<string, unknown>,
): Promise<Tamu> {
  const r = await page.request.post(`/api/plans/${planId}/guests`, { data });
  expect(r.status()).toBe(201);
  const isi: TamuBaru = await r.json();
  return isi.guest;
}

test("rekap porsi dan kursi, filter sisi dan undangan, tandai undangan borongan", async ({ page }) => {
  const email = akunUnik("e2e-tamu");
  await daftarAkun(page, email);

  try {
    const planId = await planPertama(page);
    const ahmad = await buatTamu(page, planId, {
      name: "Ahmad",
      guestCount: 3,
      side: "pria",
      phone: "0812-3456-7890",
    });
    await buatTamu(page, planId, { name: "Siti", guestCount: 2, side: "wanita" });
    const budi = await buatTamu(page, planId, { name: "Budi", guestCount: 4, side: "lainnya" });

    // Mengubah status ke hadir atau tidak hadir mengisi tanggal undangan.
    for (const [id, rsvpStatus] of [
      [ahmad.id, "hadir"],
      [budi.id, "tidak"],
    ] as const) {
      const r = await page.request.patch(`/api/plans/${planId}/guests/${id}`, {
        data: { rsvpStatus },
      });
      expect(r.status()).toBe(200);
    }

    const semua: DaftarTamu = await (await page.request.get(`/api/plans/${planId}/guests`)).json();
    expect(semua.summary).toMatchObject({
      baris: 3,
      orang: 9,
      hadir: 3,
      belumKonfirmasi: 2,
      tidakHadir: 4,
      belumDiundang: 2,
      belumDiundangBaris: 1,
      porsi: 5,
      kursi: 5,
      perkiraanMaksimal: 5,
    });
    expect(semua.summary.perSisi).toEqual({ pria: 3, wanita: 2, bersama: 4 });
    expect(ahmad.phone).toBe("6281234567890");

    const sisiPria: DaftarTamu = await (
      await page.request.get(`/api/plans/${planId}/guests?sisi=pria`)
    ).json();
    expect(sisiPria.guests.map((t) => t.name)).toEqual(["Ahmad"]);
    // Rekap tetap seluruh tamu walau daftarnya disaring.
    expect(sisiPria.summary.orang).toBe(9);

    const belum: DaftarTamu = await (
      await page.request.get(`/api/plans/${planId}/guests?undangan=belum`)
    ).json();
    expect(belum.guests.map((t) => t.name)).toEqual(["Siti"]);

    const tandai = await page.request.post(`/api/plans/${planId}/guests/undangan`, {
      data: { semua: true },
    });
    expect(tandai.status()).toBe(200);
    const hasil: { updated: number } = await tandai.json();
    // Tombol borongan menandai baris, jadi angkanya harus sama dengan jumlah
    // baris belum diundang, bukan jumlah orangnya.
    expect(hasil.updated).toBe(semua.summary.belumDiundangBaris);

    const sesudah: DaftarTamu = await (
      await page.request.get(`/api/plans/${planId}/guests?undangan=belum`)
    ).json();
    expect(sesudah.guests).toHaveLength(0);

    // Sisi di luar tiga nilai skema ditolak 422, bukan disimpan sebagai teks.
    const sisiBuruk = await page.request.post(`/api/plans/${planId}/guests`, {
      data: { name: "Salah", side: "sepupu" },
    });
    expect(sisiBuruk.status()).toBe(422);
    const galat: Galat = await sisiBuruk.json();
    expect(galat.error.code).toBe("VALIDATION_ERROR");
  } finally {
    await hapusAkunUji(email);
  }
});

test("tautan undangan acara, qris, administrasi, dan ekspor data pribadi", async ({ page }) => {
  const email = akunUnik("e2e-ekspor");
  await daftarAkun(page, email);

  try {
    const planId = await planPertama(page);
    await buatTamu(page, planId, { name: "Ahmad", phone: "+62 812 3456 7890" });

    const tanggal = hariIniJakarta();

    const milestone = await page.request.post(`/api/plans/${planId}/milestones`, {
      data: {
        title: "Akad nikah",
        eventDate: tanggal,
        invitationUrl: "https://contoh.id/undangan-akad",
      },
    });
    expect(milestone.status()).toBe(201);
    const milestoneIsi: Milestone = await milestone.json();
    expect(milestoneIsi.milestone.invitationUrl).toBe("https://contoh.id/undangan-akad");

    const tautanBuruk = await page.request.post(`/api/plans/${planId}/milestones`, {
      data: { title: "Resepsi", eventDate: tanggal, invitationUrl: "javascript:alert(1)" },
    });
    expect(tautanBuruk.status()).toBe(422);

    const pos = await page.request.post(`/api/plans/${planId}/budget-items`, {
      data: { name: "Administrasi KUA", category: "administrasi", plannedAmount: 750_000 },
    });
    expect(pos.status()).toBe(201);
    const posIsi: PosAnggaran = await pos.json();
    expect(posIsi.item.category).toBe("administrasi");

    const vendor = await page.request.post(`/api/plans/${planId}/vendors`, {
      data: { name: "Katering Melati" },
    });
    expect(vendor.status()).toBe(201);
    const vendorIsi: Vendor = await vendor.json();

    const bayar = await page.request.post(
      `/api/plans/${planId}/vendors/${vendorIsi.vendor.id}/payments`,
      { data: { amount: 1_000_000, paidAt: tanggal, method: "qris" } },
    );
    expect(bayar.status()).toBe(201);
    const bayarIsi: Pembayaran = await bayar.json();
    expect(bayarIsi.payment.method).toBe("qris");

    const ekspor = await page.request.get(`/api/plans/${planId}/ekspor`);
    expect(ekspor.status()).toBe(200);
    const isiEkspor: Ekspor = await ekspor.json();
    expect(isiEkspor.ekspor.plan.id).toBe(planId);
    expect(isiEkspor.ekspor.guests.map((g) => g.name)).toEqual(["Ahmad"]);
    expect(isiEkspor.ekspor.guests[0]?.phone).toBe("6281234567890");
    for (const kunci of [
      "milestones",
      "tasks",
      "budgetItems",
      "vendors",
      "payments",
      "rundown",
      "announcements",
      "outfits",
    ] as const) {
      expect(Array.isArray(isiEkspor.ekspor[kunci])).toBe(true);
    }
  } finally {
    await hapusAkunUji(email);
  }
});
