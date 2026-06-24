const https = require('https');

const SUPABASE_URL = 'https://yprhnqjzmhbqlgtdnxby.supabase.co';
const SERVICE_KEY = 'sb_secret_waKfO-zC82DRMYR8YemjYA_jj5M9jGP';

function fetch(url, opts) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: opts.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        ...opts.headers,
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

const users = [
  { email: 'linggasari.id@gmail.com', password: 'Admin123!', nama: 'Super Admin', role: 'SA' },
  { email: 'headga@company.com', password: 'HeadGA123!', nama: 'Budi Hartono', role: 'HGA' },
  { email: 'kacab@company.com', password: 'Kacab123!', nama: 'Ahmad Kacab', role: 'KCB' },
  { email: 'piccab@company.com', password: 'PIC123!', nama: 'Rudi PIC', role: 'PCB' },
  { email: 'kagud@company.com', password: 'Gudang123!', nama: 'Siti Gudang', role: 'KGD' },
  { email: 'auditor@company.com', password: 'Audit123!', nama: 'Dewi Auditor', role: 'AUD' },
];

async function getRoleId(roleCode) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/roles?select=id&kode=eq.' + roleCode, { method: 'GET' });
  if (res.status === 200 && res.data.length > 0) return res.data[0].id;
  return null;
}

async function createAuthUser(email, password) {
  const res = await fetch(SUPABASE_URL + '/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  return res;
}

async function upsertUser(email, nama, idRole) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/users?on_conflict=email', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ email, nama, id_role: idRole, is_active: true }),
  });
  return res;
}

async function main() {
  console.log('=== CREATE TEST USERS ===\n');

  for (const u of users) {
    process.stdout.write('  ' + u.email + '... ');

    // Get role
    const roleId = await getRoleId(u.role);
    if (!roleId) {
      console.log('✗ Role ' + u.role + ' not found');
      continue;
    }

    // Create in Auth
    const authRes = await createAuthUser(u.email, u.password);
    if (authRes.status === 200 || authRes.status === 201) {
      process.stdout.write('Auth✓ ');
    } else if (authRes.data && authRes.data.msg && authRes.data.msg.includes('already')) {
      process.stdout.write('Auth~ ');
    } else {
      console.log('✗ ' + JSON.stringify(authRes.data));
      continue;
    }

    // Create in users table
    const userRes = await upsertUser(u.email, u.nama, roleId);
    if (userRes.status === 200 || userRes.status === 201) {
      console.log('DB✓ → ' + u.nama + ' (' + u.role + ')');
    } else {
      console.log('DB✗ ' + JSON.stringify(userRes.data));
    }
  }

  console.log('\n=== DONE ===');
}

main().catch(console.error);
