import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Better Auth menangani semua endpoint di bawah /api/auth sendiri.
// Tidak ada handler tulis sendiri di sini supaya bentuk response tetap
// sama dengan yang diharapkan pustakanya.
export const { GET, POST } = toNextJsHandler(auth);
