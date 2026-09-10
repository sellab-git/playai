import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist/assets/avatars', { recursive: true });
await cp('assets/avatars', 'dist/assets/avatars', { recursive: true });
