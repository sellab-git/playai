import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { secureAssetResponse } from '../src/provider/asset-response';

describe('trusted static export security headers', () => {
  it('permits exact Next hydration scripts without permitting arbitrary inline scripts', async () => {
    const inline = 'self.__next_f.push([1,"hello\\nworld"]);';
    const document = `<html><script src="/_next/static/app.js" async></script><script>${inline}</script><script>${inline}</script></html>`;
    const response = await secureAssetResponse(new Response(document, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    const policy = response.headers.get('Content-Security-Policy')!;
    const expected = createHash('sha256').update(inline).digest('base64');
    expect(policy).toContain(`script-src 'self' 'sha256-${expected}'`);
    expect(policy.match(/sha256-/g)).toHaveLength(1);
    expect(policy.split('script-src')[1]).not.toContain('unsafe-inline');
    expect(policy).not.toContain(createHash('sha256').update('alert(1)').digest('base64'));
    expect(await response.text()).toBe(document);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
  });

  it('retains non-HTML asset bytes and caching metadata without inline script allowances', async () => {
    const response = await secureAssetResponse(new Response(new Uint8Array([0, 255, 3]), { headers: { 'Content-Type': 'image/png', ETag: 'asset-v1' } }));
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([0, 255, 3]));
    expect(response.headers.get('ETag')).toBe('asset-v1');
    expect(response.headers.get('Content-Security-Policy')).not.toContain('sha256-');
  });

  it('keeps bodyless responses valid', async () => {
    const response = await secureAssetResponse(new Response(null, { status: 304 }));
    expect(response.status).toBe(304);
    expect(response.body).toBeNull();
  });
});
