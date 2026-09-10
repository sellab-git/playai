const basePolicy = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";

/** Hash only scripts from trusted, build-generated static HTML, never request content. */
export async function secureAssetResponse(asset: Response): Promise<Response> {
  const html = asset.headers.get('Content-Type')?.toLowerCase().includes('text/html') && asset.body !== null;
  const body = html ? await asset.text() : asset.body;
  const scripts = typeof body === 'string'
    ? [...body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
      .filter(match => !/\bsrc\s*=/i.test(match[1]))
      .map(match => match[2])
    : [];
  const hashes = await Promise.all([...new Set(scripts)].map(async script => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(script));
    return `'sha256-${btoa(String.fromCharCode(...new Uint8Array(digest)))}'`;
  }));
  const response = new Response(body, asset);
  response.headers.set('Content-Security-Policy', `${basePolicy}; script-src 'self'${hashes.length ? ` ${hashes.join(' ')}` : ''}`);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
