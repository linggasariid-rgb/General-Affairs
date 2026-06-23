const { spawn } = require('child_process');
const http = require('http');

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => { res.resume(); resolve(true); });
        req.on('error', reject);
        req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error('Server did not start');
}

async function testEndpoint(url) {
  try {
    const data = await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });
    console.log(`  ✓ ${url} → ${JSON.stringify(data).substring(0, 100)}`);
  } catch (err) {
    console.log(`  ✗ ${url} → ${err.message}`);
  }
}

async function main() {
  console.log('Starting backend server...');
  const proc = spawn('npx', ['wrangler', 'dev', '--port', '8787'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  let output = '';
  proc.stdout.on('data', d => { output += d.toString(); });
  proc.stderr.on('data', d => { output += d.toString(); });
  proc.on('error', (err) => { console.error('spawn error:', err); process.exit(1); });

  try {
    await waitForServer('http://127.0.0.1:8787/', 45000);
    console.log('Server started!\n');

    console.log('Testing API endpoints:');
    await testEndpoint('http://127.0.0.1:8787/');
    await testEndpoint('http://127.0.0.1:8787/api/v1/asset');
    await testEndpoint('http://127.0.0.1:8787/api/v1/asset?perPage=5');
    await testEndpoint('http://127.0.0.1:8787/api/v1/maintenance/ticket');
    await testEndpoint('http://127.0.0.1:8787/api/v1/procurement/purchase-request');

    console.log('\nDone testing.');
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Server output:', output.substring(0, 1000));
  }

  proc.kill();
  setTimeout(() => process.exit(0), 1000);
}

main();
