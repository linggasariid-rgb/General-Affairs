const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres:Sukamulya%40123@db.yprhnqjzmhbqlgtdnxby.supabase.co:5432/postgres' });
(async () => {
  await c.connect();
  const { rows } = await c.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
  );
  console.log('Total: ' + rows.length + ' tables\n');
  rows.forEach(r => console.log('  ' + r.table_name));
  await c.end();
})();
