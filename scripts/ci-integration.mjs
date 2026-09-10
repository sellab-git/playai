import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
const base = 'http://127.0.0.1:8790';
const persist = await mkdtemp(join(tmpdir(), 'playai-integration-'));
let server;
let output = '';
const run = (file, args = []) => new Promise((resolve, reject) => {
  const task = spawn(process.execPath, [file, ...args], { stdio: 'inherit', env: { ...process.env, PLAYAI_URL: base, PLAYAI_RESTART_FIXTURE: join(persist, 'restart-fixture.json') } });
  task.once('error', reject); task.once('exit', code => code === 0 ? resolve() : reject(new Error(`Integration subprocess exited ${code}`)));
});
async function start() {
  let occupied = false;
  try { await fetch(base, { signal: AbortSignal.timeout(500) }); occupied = true; } catch { /* No local service. */ }
  if (occupied) throw new Error('Integration port 8790 is already in use; no existing process was changed.');
  server = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'dev', '--ip', '127.0.0.1', '--port', '8790', '--persist-to', persist], { detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
  server.stdout.on('data', data => { output = (output + data).slice(-6000); });
  server.stderr.on('data', data => { output = (output + data).slice(-6000); });
  const deadline = performance.now() + 30000;
  while (performance.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Local Worker exited before startup: ${output}`);
    try { if (output.includes(`Ready on ${base}`) && (await fetch(base)).ok) return; } catch { /* Wait for local workerd startup. */ }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`Local Worker failed to start: ${output}`);
}
async function stop() {
  if (!server?.pid) return;
  const stopped = new Promise(resolve => server.once('exit', resolve));
  if (process.platform === 'win32') {
    await new Promise(resolve => { const kill = spawn('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); kill.once('exit', resolve); });
  } else process.kill(-server.pid, 'SIGTERM');
  await stopped;
  server = null;
}
try {
  await start();
  await run('scripts/local-integration.mjs');
  await run('scripts/full-game-integration.mjs');
  await run('scripts/restart-integration.mjs', ['prepare']);
  await stop();
  await start();
  await run('scripts/restart-integration.mjs', ['resume']);
  console.log('PASS: isolated local adapter suite including a real process-tree restart.');
} finally {
  await stop();
  const target = resolve(persist);
  if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith('playai-integration-')) throw new Error('Refusing cleanup outside the dedicated integration directory');
  await rm(target, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
}
