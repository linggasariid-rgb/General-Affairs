const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const FUNCTIONS_DIR = path.join(__dirname, 'functions');

const CONNECTION_STRING = 'postgresql://postgres:Sukamulya%40123@db.yprhnqjzmhbqlgtdnxby.supabase.co:5432/postgres';

const MIGRATION_FILES = [
  '001_schema_master.sql',
  '002_schema_asset.sql',
  '003_schema_maintenance.sql',
  '004_schema_procurement.sql',
  '005_schema_building_support.sql',
  '006_indexes_rls.sql',
  '007_seed_data.sql',
  '008_produk.sql',
  '009_schema_atk.sql',
  '010_seed_cabang_gudang.sql',
  '011_schema_atk_laporan_stok_cabang.sql',
  '012_seed_users_admin_cabang.sql',
];

function splitSQL(sql) {
  const statements = [];
  let current = '';
  let inDollar = false;
  let dollarTag = '';

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (!inDollar && ch === '$') {
      const match = sql.substring(i).match(/^\$(\w*)\$/);
      if (match) {
        inDollar = true;
        dollarTag = match[1];
        current += match[0];
        i += match[0].length - 1;
        continue;
      }
    }

    if (inDollar && ch === '$') {
      const endMatch = sql.substring(i).match(new RegExp(`^\\$${dollarTag}\\$`));
      if (endMatch) {
        inDollar = false;
        dollarTag = '';
        current += endMatch[0];
        i += endMatch[0].length - 1;
        continue;
      }
    }

    if (!inDollar && ch === ';') {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      current = '';
      i++;
      continue;
    }

    // Skip single-line comments
    if (!inDollar && ch === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed && !trimmed.startsWith('--')) {
    statements.push(trimmed);
  }

  return statements.filter(s => s.length > 0);
}

async function runMigration(client, filePath, label) {
  const rawSql = fs.readFileSync(filePath, 'utf-8');
  const statements = splitSQL(rawSql);

  console.log(`\n▶ ${label} (${statements.length} statements)`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.query(stmt + ';');
      process.stdout.write('✓');
    } catch (err) {
      if (err.code === '42710' || err.code === '42P07' || err.code === '42701') {
        process.stdout.write('∼');
      } else {
        console.error(`\n  ✗ [${i + 1}] ${err.message}`);
        console.error(`  SQL: ${stmt.substring(0, 200)}...`);
        throw err;
      }
    }
  }
  console.log(` ✅`);
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  GA ENTERPRISE - DATABASE MIGRATION');
  console.log('═══════════════════════════════════════════');

  const client = new Client({ connectionString: CONNECTION_STRING });

  try {
    await client.connect();
    console.log('  ✅ Connected to database\n');

    // Run migrations
    console.log('📦 Migrations');
    for (const file of MIGRATION_FILES) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      if (fs.existsSync(filePath)) {
        await runMigration(client, filePath, file);
      } else {
        console.log(`\n  ⚠ ${file} not found`);
      }
    }

    // Run functions
    console.log('\n📦 Functions');
    const functionFiles = fs.readdirSync(FUNCTIONS_DIR).filter(f => f.endsWith('.sql'));
    for (const file of functionFiles) {
      const filePath = path.join(FUNCTIONS_DIR, file);
      await runMigration(client, filePath, `functions/${file}`);
    }

    // Verify
    console.log('\n📊 Verification');
    const { rows: tables } = await client.query(
      "SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_type, table_name"
    );
    console.log(`  Tables: ${tables.filter(t => t.table_type === 'BASE TABLE').length}`);
    console.log(`  Views: ${tables.filter(t => t.table_type === 'VIEW').length}`);

    const { rows: enums } = await client.query(
      "SELECT t.typname FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid GROUP BY t.typname"
    );
    if (enums.length > 0) {
      console.log(`  Enums: ${enums.map(e => e.typname).join(', ')}`);
    }

    const { rows: funcs } = await client.query(
      "SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace ORDER BY proname"
    );
    console.log(`  Functions: ${funcs.map(f => f.proname).join(', ')}`);

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
