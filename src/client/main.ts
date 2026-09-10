import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './styles.css';
import { z } from 'zod';
import type { Acknowledgement, Command, Intent } from '../engine';
import { ClockEstimator } from './clock';
import { newerSnapshot, parseMessage, pendingOutcome } from './protocol';
import { parseIntent } from '../room/validation';
import { t } from './i18n';
import { render, type UiModel, type UiActions } from './ui';

const root = document.querySelector<HTMLElement>('#app')!;
document.title = t('app.title');
const clock = new ClockEstimator();
const savedSchema = z.object({ code: z.string().regex(/^[A-HJ-NP-Z2-9]{5}$/), credential: z.string().regex(/^[a-f0-9]{64}$/) });
type Saved = z.infer<typeof savedSchema>;
const storageKey = 'playai.membership';
let saved: Saved | null = null;
let socket: WebSocket | null = null;
let pending: Intent | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let active = false;
let retrySent = false;
let lastCountdown = '';
const pings = new Set<number>();
const model: UiModel = { snapshot: null, connected: false, calibrated: false, pending: false, error: null, delivery: null, savedRoomCode: null, now: 0, serverToLocal: time => clock.localTime(time) };
function paint(): void { model.now = performance.now() + clock.offset; render(root, model, actions); }
function storeMembership(): void {
  if (saved) localStorage.setItem(storageKey, JSON.stringify(saved));
  else localStorage.removeItem(storageKey);
}
function clearPending(): void {
  pending = null; model.pending = false; retrySent = false;
  sessionStorage.removeItem('playai.pending');
  if (pendingTimer) clearTimeout(pendingTimer);
}
function acceptOutcome(outcome: Acknowledgement | null): void {
  const confirmed = pendingOutcome(pending, outcome);
  if (!confirmed || !pending) return;
  const command = pending.command;
  clearPending();
  model.delivery = confirmed.accepted ? 'delivery.saved' : null;
  model.error = confirmed.accepted ? null : confirmed.code;
  if (confirmed.accepted && command.type === 'leave') fresh();
}
function sendWire(value: unknown): void { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(value)); }
function ping(): void { const t0 = performance.now(); pings.add(t0); if (pings.size > 10) pings.delete(pings.values().next().value!); sendWire({ type: 'ping', t0 }); }
function transmitPending(): void {
  if (!pending || !model.connected || !clock.ready) return;
  retrySent = true;
  sendWire({ type: 'intent', intent: pending });
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => { if (pending) { model.delivery = 'delivery.unknown'; socket?.close(); paint(); } }, 5000);
}
function connect(): void {
  if (!saved || !active) return;
  clock.reset(); pings.clear(); model.calibrated = false; model.connected = false; retrySent = false;
  const url = new URL(`/api/rooms/${saved.code}/socket`, location.href); url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(url); socket = ws;
  ws.addEventListener('open', () => { if (socket === ws) sendWire({ type: 'auth', credential: saved?.credential }); });
  ws.addEventListener('message', event => {
    if (socket !== ws || typeof event.data !== 'string') return;
    const message = parseMessage(event.data);
    if (!message) { model.error = 'request.invalid'; paint(); return; }
    if (message.type === 'state') {
      const old = model.snapshot;
      model.snapshot = newerSnapshot(old, message.snapshot);
      acceptOutcome(model.snapshot.acknowledgement);
      model.connected = true;
      if (!clock.ready && pings.size === 0) ping();
      if (!pingTimer) pingTimer = setInterval(ping, 30000);
      if (model.snapshot.room.hostId !== old?.room.hostId && old) model.delivery = 'room.hostChanged';
      if (model.snapshot.notice) model.error = model.snapshot.notice;
      if (model.snapshot.room.status === 'closed') { active = false; saved = null; storeMembership(); clearPending(); }
    } else if (message.type === 'clock') {
      if (!pings.delete(message.t0)) return;
      if (clock.sample(message.t0, performance.now(), message.serverNow)) {
        model.calibrated = true;
        sendWire({ type: 'ready', ready: !document.hidden });
        if (pending && !retrySent) transmitPending();
      }
    } else if (message.type === 'ack') {
      acceptOutcome(message.ack);
    } else {
      model.error = message.code;
      if (['session.ended', 'session.invalid', 'room.closed', 'auth.invalid', 'auth.staleConnection', 'session.revoked', 'session.replaced'].includes(message.code)) {
        active = false; model.connected = false; model.snapshot = null; model.savedRoomCode = null;
        saved = null; storeMembership(); clearPending(); ws.close();
      }
    }
    paint();
  });
  ws.addEventListener('close', () => {
    if (socket !== ws) return;
    model.connected = false; model.calibrated = false;
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
    if (pending) model.delivery = 'delivery.unknown';
    if (active) reconnectTimer = setTimeout(connect, 1200);
    paint();
  });
}
function fresh(): void {
  active = false;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  socket?.close(); socket = null; saved = null; storeMembership(); clearPending();
  model.snapshot = null; model.savedRoomCode = null; model.connected = false; model.calibrated = false; model.error = null; model.delivery = null;
  paint();
}
async function admit(path: string, name: string, faceId: string): Promise<void> {
  if (model.pending) return;
  model.pending = true; model.error = null; paint();
  try {
    let deviceId = localStorage.getItem('playai.device');
    if (!deviceId) { deviceId = crypto.randomUUID(); localStorage.setItem('playai.device', deviceId); }
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, faceId, deviceId }) });
    const raw: unknown = await response.json();
    const parsed = savedSchema.safeParse(raw);
    if (!response.ok || !parsed.success) {
      model.error = z.object({ code: z.string() }).safeParse(raw).data?.code ?? 'delivery.failed';
      return;
    }
    clearPending(); saved = parsed.data; storeMembership(); model.snapshot = null; active = true; connect();
  } catch { model.error = 'delivery.failed'; } finally { model.pending = false; paint(); }
}
const actions: UiActions = {
  create: (name, faceId) => { void admit('/api/rooms', name, faceId); },
  join: (code, name, faceId) => { void admit(`/api/rooms/${code}/join`, name, faceId); },
  resume: () => { if (saved && model.savedRoomCode) { active = true; model.snapshot = null; connect(); } },
  send: (command: Command) => {
    if (pending || !model.connected || !model.calibrated || document.hidden) return;
    pending = { actionId: crypto.randomUUID(), command }; model.pending = true; model.delivery = 'delivery.sending'; model.error = null;
    sessionStorage.setItem('playai.pending', JSON.stringify({ code: saved?.code, intent: pending }));
    transmitPending(); paint();
  },
  fresh,
};
document.addEventListener('visibilitychange', () => {
  if (!active) return;
  model.calibrated = false; clock.reset(); pings.clear(); sendWire({ type: 'ready', ready: false });
  if (!document.hidden) { if (socket?.readyState === WebSocket.OPEN) ping(); else connect(); }
  paint();
});
function viewport(): void { document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport?.height ?? window.innerHeight}px`); }
window.visualViewport?.addEventListener('resize', viewport); viewport();
setInterval(() => {
  const phase = model.snapshot?.game?.phase;
  const signature = `${phase?.token}:${phase?.endsAt ? Math.ceil((phase.endsAt - (performance.now() + clock.offset)) / 1000) : ''}`;
  if (phase?.endsAt !== null && signature !== lastCountdown && !document.hidden) { lastCountdown = signature; paint(); }
}, 100);
async function boot(): Promise<void> {
  try {
    const parsed = savedSchema.safeParse(JSON.parse(localStorage.getItem(storageKey) ?? 'null'));
    if (parsed.success) {
      const response = await fetch(`/api/rooms/${parsed.data.code}/recover`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: parsed.data.credential }) });
      if (response.ok) {
        saved = parsed.data; model.savedRoomCode = saved.code;
        const stored = z.object({ code: z.string(), intent: z.unknown() }).safeParse(JSON.parse(sessionStorage.getItem('playai.pending') ?? 'null'));
        if (stored.success && stored.data.code === saved.code) {
          pending = parseIntent(stored.data.intent);
          model.pending = pending !== null;
          if (pending) model.delivery = 'delivery.unknown';
        }
      }
    }
  } catch { /* Fresh entry remains available if storage or recovery is unavailable. */ }
  paint();
}
paint(); void boot();
