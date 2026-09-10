import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projectRoot, sourceFingerprint } from './build-provenance.mjs';

// Static export replaces its output directory. Never rebuild underneath the preview.
await new Promise((accept, reject) => {
  const probe = createServer();
  probe.once('error', () =>
    reject(
      new Error(
        'Stop the local preview on port 8787 before building. Restart with npm run dev.',
      ),
    ),
  );
  probe.listen(8787, '127.0.0.1', () => probe.close(accept));
});
const before = await sourceFingerprint();
for (const args of [
  ['scripts/copy-assets.mjs'],
  ['node_modules/next/dist/bin/next', 'build'],
]) {
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? accept() : reject(new Error(`Build step failed (${code}).`)),
    );
  });
}
const after = await sourceFingerprint();
if (before !== after)
  throw new Error(
    'Source changed during build. Build again before starting the preview.',
  );
await writeFile(
  resolve(projectRoot, 'out/build-info.json'),
  JSON.stringify({ sourceHash: after, builtAt: new Date().toISOString() }, null, 2),
);
console.log(`Verified source fingerprint: ${after}`);
