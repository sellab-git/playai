import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configFiles = [
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'postcss.config.mjs',
  'tsconfig.json',
  'components.json',
  'wrangler.json',
];
async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(resolve(projectRoot, directory), {
    withFileTypes: true,
  })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await filesIn(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
export async function sourceFingerprint() {
  const files = [
    ...configFiles,
    ...(await filesIn('src')),
    ...(await filesIn('assets')),
    ...(await filesIn('scripts')),
  ].sort();
  const hash = createHash('sha256');
  for (const path of files) {
    hash.update(path);
    hash.update('\0');
    hash.update(await readFile(resolve(projectRoot, path)));
    hash.update('\0');
  }
  return hash.digest('hex');
}
