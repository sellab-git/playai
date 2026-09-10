import { sourceFingerprint } from './build-provenance.mjs';
const expected = await sourceFingerprint();
const response = await fetch('http://127.0.0.1:8787/build-info.json', {
  cache: 'no-store',
});
if (!response.ok) throw new Error(`Preview provenance unavailable (${response.status}).`);
const actual = await response.json();
if (actual.sourceHash !== expected)
  throw new Error('Preview is stale: rebuild and restart the canonical application.');
console.log(`Preview matches canonical source: ${expected} (built ${actual.builtAt}).`);
