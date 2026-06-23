const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres:Sukamulya%40123@db.yprhnqjzmhbqlgtdnxby.supabase.co:5432/postgres' });

(async () => {
  await c.connect();
  const { rows: funcs } = await c.query(
    "SELECT p.proname FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND p.prokind='f' ORDER BY p.proname"
  );
  console.log('Functions:');
  funcs.forEach(f => console.log('  ' + f.proname));
  await c.end();
})();
