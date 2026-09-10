import { describe, expect, it } from 'vitest';
import { credentialHash, randomToken, sameOrigin, readBody } from '../src/provider/security';
describe('transport boundaries', () => {
  it('requires same-origin secure or loopback requests', () => {
    expect(sameOrigin(new Request('https://play.test/api', { headers: { Origin: 'https://evil.test' } }))).toBe(false);
    expect(sameOrigin(new Request('https://play.test/api', { headers: { Origin: 'https://play.test' } }))).toBe(true);
    expect(sameOrigin(new Request('http://play.test/api', { headers: { Origin: 'http://play.test' } }))).toBe(false);
    expect(sameOrigin(new Request('http://127.0.0.1:8787/api', { headers: { Origin: 'http://127.0.0.1:8787' } }))).toBe(true);
  });
  it('issues unpredictable credentials and stores hashes instead of bearer values', async () => {
    const token = randomToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(randomToken()).not.toBe(token);
    expect(await credentialHash(token)).not.toBe(token);
    expect(await credentialHash(token)).toBe(await credentialHash(token));
  });
  it('bounds streamed bodies regardless of content-length', async () => {
    expect(await readBody(new Request('https://test/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 'x'.repeat(4096) }) }))).toBeNull();
  });
});
