import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { projectRoot } from './build-provenance.mjs';
const generated = resolve(projectRoot, 'public/assets/avatars');
const expected = resolve(projectRoot, 'public', 'assets', 'avatars');
if (generated !== expected || !generated.startsWith(projectRoot))
  throw new Error('Unexpected generated asset path.');
await rm(generated, { recursive: true, force: true });
await mkdir(generated, { recursive: true });
await cp(resolve(projectRoot, 'assets/avatars'), generated, { recursive: true });
