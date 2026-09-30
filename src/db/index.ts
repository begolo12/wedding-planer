import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Satu koneksi dipakai ulang antar hot reload di mode dev.
const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
};

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/wedding_planer";

const sql =
  globalForDb.sql ??
  postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });
export { sql };
