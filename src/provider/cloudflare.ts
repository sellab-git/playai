import { secureAssetResponse } from './asset-response';
import { DurableObject } from 'cloudflare:workers';
import { games } from '../games/registry';
import { RoomRunner } from '../room/runner';
import type { Connection, DurableRecord } from '../room/types';
import { credentialHash, isObject, json, now, randomToken, readBody, roomCode, sameOrigin, validCredential } from './security';

interface Env {
  ROOMS: DurableObjectNamespace<RoomObject>;
  LIMITS: DurableObjectNamespace<AdmissionLimiter>;
  ASSETS: Fetcher;
}
type Attachment = { connection: Connection | null; openedAt: number; windowAt: number; count: number };
const tiles = ['tYel', 'tRed', 'tBlu', 'tGrn', 'tPur', 'tOrg', 'tPnk', 'tGry'];

/** Provider owns serialization, storage, credentials, sockets and alarms only. */
export class RoomObject extends DurableObject<Env> {
  private queue: Promise<unknown> = Promise.resolve();
  private serialized<T>(run: () => Promise<T>): Promise<T> {
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }
  private async load(): Promise<RoomRunner> {
    return new RoomRunner(await this.ctx.storage.get<DurableRecord>('room') ?? null, {
      now, id: () => crypto.randomUUID(), seed: () => crypto.getRandomValues(new Uint32Array(1))[0], games,
    });
  }
  private async save(runner: RoomRunner): Promise<void> {
    const record = runner.record;
    if (!record) return;
    await this.ctx.storage.transaction(async tx => {
      await tx.put('room', record);
      const waiting = this.ctx.getWebSockets().map(ws => this.attachment(ws)).filter(a => !a.connection).map(a => a.openedAt + 10000);
      const deadlines = [...waiting, ...(runner.nextAlarm === null ? [] : [runner.nextAlarm])];
      if (deadlines.length) await tx.setAlarm(Math.min(...deadlines));
      else await tx.deleteAlarm();
    });
  }
  private attachment(ws: WebSocket): Attachment { return ws.deserializeAttachment() as Attachment; }
  private send(ws: WebSocket, data: unknown): void {
    try { ws.send(JSON.stringify(data)); } catch { /* Close event reconciles membership. */ }
  }
  private broadcast(runner: RoomRunner): void {
    for (const ws of this.ctx.getWebSockets()) {
      const connection = this.attachment(ws).connection;
      if (!connection) continue;
      const snapshot = runner.snapshot(connection);
      if (snapshot) this.send(ws, { type: 'state', snapshot });
      else {
        const record = runner.record;
        const membership = record?.kind === 'room' ? record.value.memberships[connection.playerId] : null;
        this.send(ws, { type: 'error', code: membership && !membership.revoked && membership.generation !== connection.generation ? 'session.replaced' : 'session.ended' });
        ws.close(1000, 'Session ended');
      }
    }
  }
  async fetch(request: Request): Promise<Response> {
    return this.serialized(async () => {
      const url = new URL(request.url);
      const code = url.pathname.split('/')[3];
      if (!sameOrigin(request)) return json({ code: 'request.origin' }, 403);
      const runner = await this.load();
      runner.advance();
      if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
        if (!runner.record || runner.record.kind === 'tombstone' || runner.record.value.room.status === 'closed') return json({ code: 'room.closed' }, 410);
        if (this.ctx.getWebSockets().length >= 48) return json({ code: 'request.rateLimited' }, 429);
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        this.ctx.acceptWebSocket(server);
        server.serializeAttachment({ connection: null, openedAt: now(), windowAt: now(), count: 0 } satisfies Attachment);
        await this.save(runner);
        return new Response(null, { status: 101, webSocket: client });
      }
      if (request.method !== 'POST') return json({ code: 'request.invalid' }, 405);
      const body = await readBody(request);
      if (!isObject(body)) return json({ code: 'request.invalid' }, 400);
      if (url.pathname.endsWith('/recover')) {
        if (!validCredential(body.credential)) return json({ code: 'session.invalid' }, 403);
        const hash = await credentialHash(body.credential);
        const record = runner.record;
        await this.save(runner);
        if (record?.kind !== 'room' || record.value.room.status === 'closed' || !Object.values(record.value.memberships).some(m => !m.revoked && m.credentialHash === hash)) return json({ code: 'session.invalid' }, 403);
        return json({ code, valid: true });
      }
      if (!url.pathname.endsWith('/join') && !url.pathname.endsWith('/create')) return json({ code: 'request.invalid' }, 404);
      if (url.pathname.endsWith('/create')) {
        const made = runner.create(code);
        if (!made.ok) return json({ code: made.code }, 409);
      }
      const token = randomToken();
      const record = runner.record;
      const count = record?.kind === 'room' ? record.value.room.players.length : 0;
      const joined = runner.join({ name: typeof body.name === 'string' ? body.name : '', faceId: typeof body.faceId === 'string' ? body.faceId : '', tile: tiles[count % tiles.length] }, await credentialHash(token));
      if (!joined.ok) { await this.save(runner); return json({ code: joined.code }, 400); }
      await this.save(runner);
      this.broadcast(runner);
      return json({ code, credential: token, playerId: joined.value }, 201);
    });
  }
  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    await this.serialized(async () => {
      const attachment = this.attachment(ws);
      if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 4096) { ws.close(1009, 'Frame too large'); return; }
      if (now() - attachment.windowAt >= 10000) { attachment.windowAt = now(); attachment.count = 0; }
      attachment.count++;
      ws.serializeAttachment(attachment);
      if (attachment.count > 60) { ws.close(1008, 'Rate limit'); return; }
      let message: unknown;
      try { message = JSON.parse(raw); } catch { this.send(ws, { type: 'error', code: 'request.invalid' }); return; }
      if (!isObject(message)) return;
      const runner = await this.load();
      if (!attachment.connection) {
        if (message.type !== 'auth' || !validCredential(message.credential)) { ws.close(1008, 'Authentication required'); return; }
        const connected = runner.connect(await credentialHash(message.credential));
        if (!connected.ok) { this.send(ws, { type: 'error', code: connected.code }); ws.close(1008, 'Session invalid'); return; }
        attachment.connection = connected.value;
        ws.serializeAttachment(attachment);
        await this.save(runner);
        this.broadcast(runner);
        return;
      }
      if (!runner.snapshot(attachment.connection)) { this.send(ws, { type: 'error', code: 'session.ended' }); ws.close(1008, 'Session invalid'); return; }
      runner.advance();
      if (message.type === 'ping' && typeof message.t0 === 'number' && Number.isFinite(message.t0)) {
        runner.touch(attachment.connection);
        await this.save(runner);
        this.send(ws, { type: 'clock', t0: message.t0, serverNow: now() });
        this.broadcast(runner);
      } else if (message.type === 'ready' && typeof message.ready === 'boolean') {
        runner.ready(attachment.connection, message.ready);
        await this.save(runner);
        this.broadcast(runner);
      } else if (message.type === 'intent') {
        const ack = runner.intent(attachment.connection, message.intent);
        await this.save(runner);
        this.send(ws, { type: 'ack', ack });
        this.broadcast(runner);
      } else { this.send(ws, { type: 'error', code: 'request.invalid' }); }
    });
  }
  async webSocketClose(ws: WebSocket): Promise<void> {
    await this.serialized(async () => {
      const connection = this.attachment(ws).connection;
      if (!connection) return;
      const runner = await this.load();
      runner.disconnect(connection);
      await this.save(runner);
      this.broadcast(runner);
    });
  }
  async webSocketError(ws: WebSocket): Promise<void> { await this.webSocketClose(ws); }
  async alarm(): Promise<void> {
    await this.serialized(async () => {
      for (const ws of this.ctx.getWebSockets()) {
        const a = this.attachment(ws);
        if (!a.connection && now() >= a.openedAt + 10000) ws.close(1008, 'Authentication timeout');
      }
      const runner = await this.load();
      runner.advance();
      await this.save(runner);
      this.broadcast(runner);
    });
  }
}

/** One small durable per-IP admission budget; no credentials or player payloads. */
export class AdmissionLimiter extends DurableObject<Env> {
  async fetch(): Promise<Response> {
    const allowed = await this.ctx.storage.transaction(async tx => {
      const saved = await tx.get<{ at: number; count: number }>('budget');
      const budget = saved && now() - saved.at < 60000 ? saved : { at: now(), count: 0 };
      budget.count++;
      await tx.put('budget', budget);
      await tx.setAlarm(budget.at + 60000);
      return budget.count <= 20;
    });
    return json({ allowed }, allowed ? 200 : 429);
  }
  async alarm(): Promise<void> { await this.ctx.storage.deleteAll(); }
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      // HTML must include its body so its CSP always covers the current build's hydration scripts.
      const headers = new Headers(request.headers);
      if (request.headers.get('Accept')?.includes('text/html') || url.pathname === '/' || url.pathname.endsWith('.html')) {
        headers.delete('If-None-Match'); headers.delete('If-Modified-Since');
      }
      const asset = await env.ASSETS.fetch(new Request(request, { headers }));
      return secureAssetResponse(asset);
    }
    if (!sameOrigin(request)) return json({ code: 'request.origin' }, 403);
    if (request.method === 'POST' && (url.pathname === '/api/rooms' || url.pathname.endsWith('/join'))) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
      const limit = await env.LIMITS.get(env.LIMITS.idFromName(await credentialHash(ip))).fetch('https://limiter.internal');
      if (!limit.ok) return json({ code: 'request.rateLimited' }, 429);
    }
    if (url.pathname === '/api/rooms' && request.method === 'POST') {
      const body = await readBody(request);
      if (!isObject(body)) return json({ code: 'request.invalid' }, 400);
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = roomCode();
        const target = new URL(`/api/rooms/${code}/create`, url);
        const created = await env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(new Request(target, { method: 'POST', headers: { Origin: url.origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
        if (created.status !== 409) return created;
      }
      return json({ code: 'room.unavailable' }, 503);
    }
    const match = /^\/api\/rooms\/([A-HJ-NP-Z2-9]{5})\/(join|recover|socket)$/.exec(url.pathname);
    if (!match) return json({ code: 'request.invalid' }, 404);
    return env.ROOMS.get(env.ROOMS.idFromName(match[1])).fetch(request);
  },
} satisfies ExportedHandler<Env>;
