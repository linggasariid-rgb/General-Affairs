const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres:Sukamulya%40123@db.yprhnqjzmhbqlgtdnxby.supabase.co:5432/postgres' });

(async () => {
  await c.connect();

  const { rows: tables } = await c.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
  );
  console.log('TABLES (' + tables.length + '):');
  tables.forEach(t => console.log('  ' + t.table_name));

  const { rows: funcs } = await c.query(
    "SELECT p.proname AS f FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND p.prokind='f' ORDER BY p.proname"
  );
  console.log('\nFUNCTIONS:');
  funcs.forEach(f => console.log('  ' + f.f));

  const { rows: enums } = await c.query(
    "SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid GROUP BY t.typname"
  );
  if (enums.length > 0) {
    console.log('\nENUMS:');
    enums.forEach(e => console.log('  ' + e.typname + ': ' + e.labels.join(', ')));
  }

  await c.end();
})();
