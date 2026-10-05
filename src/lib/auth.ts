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
    // Dukung semua port pengembangan lokal (mis. 3001, 3002, 3110) dan loopback IP.
    "http://localhost:*",
    "https://localhost:*",
    "http://127.0.0.1:*",
    "https://127.0.0.1:*",
    // Daftar tambahan bebas, dipisah koma, tanpa perlu ubah kode.
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
    // Domain yang diisi Vercel sendiri pada tiap deployment.
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    // Alamat tetap yang dipakai orang, dan pola untuk preview per-cabang.
    "https://wedding-planer-self.vercel.app",
    "https://wedding-planer-*.vercel.app",
    // Akses perangkat lokal lewat LAN di mode dev (misalnya tes dari HP).
    ...(process.env.NODE_ENV !== "production"
      ? ["http://192.168.*:*", "http://10.*:*", "http://172.*:*"]
      : []),
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
  // Hak "Tarik persetujuan: Hapus akun" dari docs/08 bagian Privasi dan
  // docs/13 tahap 3 nomor 11.
  //
  // Jalur yang dipilih: pengguna mengetik kata sandinya sendiri, lalu akun
  // langsung dihapus. Bukan tautan verifikasi surel, karena pengiriman surel
  // ditunda ke P2 (docs/18 bagian 11) dan belum ada penyedia surel. Karena
  // `sendDeleteAccountVerification` tidak diisi, Better Auth memverifikasi
  // kata sandi lalu menghapus akun, sesi, dan cookies sesi saat itu juga.
  //
  // Semua data turunan ikut terhapus lewat cascade foreign key yang sudah ada
  // di src/db/schema.ts (plans, tasks, guests, payments, dan seterusnya).
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  // databaseHooks sengaja tidak otomatis memasukkan plan saat pendaftaran email biasa,
  // karena halaman pendaftaran (/daftar) dan form rencana masing-masing sudah mengelola
  // pembuatan plan pertama bersama nama pasangannya secara eksplisit.
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
  // Batas laju memakai bawaan Better Auth 1.7, bukan helper sendiri, karena
  // pustakanya sudah mengirim 429 sebelum handler dijalankan dan kuncinya
  // sudah dihitung per alamat IP. Menulis ulang di route cuma menambah satu
  // sistem kedua untuk masalah yang sama. docs/18 bagian 7 memutuskan angka
  // untuk dua endpoint ini.
  rateLimit: {
    // Bawaan pustakanya cuma aktif di produksi. Di mode dev batas dilonggarkan
    // agar pengujian lokal dan pendaftaran tidak terkunci 1 jam saat mencoba.
    enabled: true,
    window: 60,
    max: 300,
    customRules: {
      // 5 permintaan per jam per alamat IP di produksi. Di mode dev dilonggarkan.
      "/sign-up/email": {
        window: 60 * 60,
        max: process.env.NODE_ENV === "production" ? 5 : 100,
      },
      // 10 permintaan per 15 menit per alamat IP di produksi.
      "/sign-in/email": {
        window: 15 * 60,
        max: process.env.NODE_ENV === "production" ? 10 : 100,
      },
    },
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
