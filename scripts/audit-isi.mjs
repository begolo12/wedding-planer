/**
 * Audit sementara. Hanya membaca, tidak menulis ke database.
 * Dipakai untuk mencari akun yang punya data paling lengkap supaya
 * halaman dalam bisa diaudit dengan isi, bukan dengan keadaan kosong.
 */
import postgres from "postgres";

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.log("TIDAK ADA DATABASE_URL");
  process.exit(1);
}

const sql = postgres(conn, { max: 1 });
try {
  const plans = await sql`
    select p.id, p.partner_name, u.email, u.name
    from plans p join users u on u.id = p.user_id
    order by p.created_at`;
  console.log("PLANS");
  for (const p of plans) {
    console.log(`  ${p.id.slice(0, 8)} | ${p.email} | ${p.name} | ${p.partner_name}`);
  }

  const isi = await sql`
    select u.email,
      (select count(*)::int from vendors v where v.plan_id = p.id) as vendor,
      (select count(*)::int from tasks t where t.plan_id = p.id) as tugas,
      (select count(*)::int from guests g where g.plan_id = p.id) as tamu,
      (select count(*)::int from rundown_items r where r.plan_id = p.id) as rundown
    from users u left join plans p on p.user_id = u.id
    group by u.email, p.id`;
  console.log("ISI");
  for (const i of isi) {
    console.log(`  ${i.email} vendor=${i.vendor} tugas=${i.tugas} tamu=${i.tamu} rundown=${i.rundown}`);
  }
} catch (e) {
  console.log("GALAT", e.message);
} finally {
  await sql.end();
}
