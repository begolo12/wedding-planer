import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { NAMA_PRODUK } from "@/lib/konstanta";

const TIGA_PULUH_HARI = 60 * 60 * 24 * 30;

// Google hanya didaftarkan kalau kuncinya ada. Provider yang tampil lalu gagal
// saat ditekan lebih buruk daripada provider yang tidak tampil sama sekali.
const googleAda = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Ubah nilai apa pun (URL penuh, host polos, atau origin) menjadi origin bersih
// tanpa garis miring di ujung. Nilai yang tidak bisa diparse diabaikan.
function keOrigin(nilai: string | undefined | null): string | null {
  const teks = nilai?.trim();
  if (!teks) return null;
  const denganSkema = teks.includes("://") ? teks : `https://${teks}`;
  try {
    return new URL(denganSkema).origin;
  } catch {
    return null;
  }
}

// Alamat yang sah mengirim permintaan autentikasi.
//
// Better Auth menolak setiap POST yang Origin-nya tidak ada di daftar ini dengan
// 403 INVALID_ORIGIN, dan itu mematikan tombol masuk di produksi kalau daftarnya
// meleset. Karena nilai BETTER_AUTH_URL di Vercel tidak bisa dibaca lagi
// (tersimpan sebagai rahasia), daftar ini dirakit dari beberapa sumber sekaligus
// agar tidak pernah bergantung pada satu variabel saja.
function kumpulkanOrigin(): string[] {
  const mentah: (string | undefined)[] = [
    // Sumber utama, sekaligus jalur pengembangan lokal.
    process.env.BETTER_AUTH_URL,
    "http://localhost:3000",
    // Daftar tambahan bebas, dipisah koma, tanpa perlu ubah kode.
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
    // Domain yang diisi Vercel sendiri pada tiap deployment.
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    // Alamat tetap yang dipakai orang, dan pola untuk preview per-cabang.
    "https://wedding-planer-self.vercel.app",
    "https://wedding-planer-*.vercel.app",
  ];

  const bersih = mentah
    .map((nilai) => (nilai?.includes("*") ? nilai.trim().replace(/\/+$/, "") : keOrigin(nilai)))
    .filter((nilai): nilai is string => Boolean(nilai));

  return Array.from(new Set(bersih));
}

export const auth = betterAuth({
  appName: NAMA_PRODUK,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  socialProviders: googleAda
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  session: {
    expiresIn: TIGA_PULUH_HARI,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  advanced: {
    // Better Auth membuat id sendiri dengan 32 huruf. Kolom id di sini bertipe
    // uuid, jadi insertions gagal dan tidak ada satu pun yang bisa mendaftar.
    // "uuid" memaksa pustaka itu memakai crypto.randomUUID().
    database: {
      generateId: "uuid",
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  },
  trustedOrigins: kumpulkanOrigin(),
});

export type SesiAuth = typeof auth.$Infer.Session;
export const googleTersedia = googleAda;
