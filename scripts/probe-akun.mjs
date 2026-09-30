import postgres from "postgres";

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.log("TIDAK ADA DATABASE_URL");
  process.exit(1);
}

const sql = postgres(conn, { max: 1 });
try {
  const u = await sql`select id, email, name from users order by created_at desc limit 10`;
  const p = await sql`select id, user_id, partner_name, wedding_date, status from plans order by created_at desc limit 10`;
  const v = await sql`select count(*)::int as n from vendors`;
  const t = await sql`select count(*)::int as n from tasks`;
  const g = await sql`select count(*)::int as n from guests`;
  const r = await sql`select count(*)::int as n from rundown_items`;
  const m = await sql`select count(*)::int as n from milestones`;
  console.log("USERS", JSON.stringify(u));
  console.log("PLANS", JSON.stringify(p));
  console.log(
    "JUM",
    JSON.stringify({
      vendor: v[0].n,
      tugas: t[0].n,
      tamu: g[0].n,
      rundown: r[0].n,
      milestone: m[0].n,
    })
  );
} catch (e) {
  console.log("GALAT", e.message);
} finally {
  await sql.end();
}
