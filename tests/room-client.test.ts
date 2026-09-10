// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { createRoomClient, type RoomClient } from '../src/client/room-client';
import type { Intent, Snapshot } from '../src/engine';
class Socket extends EventTarget {
  static OPEN = 1; static instances: Socket[] = [];
  readyState = 1; sent: Array<{ type: string; intent?: Intent; t0?: number }> = [];
  constructor() { super(); Socket.instances.push(this); }
  send(data: string): void { this.sent.push(JSON.parse(data)); }
  close(): void { this.readyState = 3; this.dispatchEvent(new Event('close')); }
  message(data: unknown): void { this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) })); }
}
const clients: RoomClient[] = [];
function makeClient(): RoomClient { const client = createRoomClient(); clients.push(client); return client; }
afterEach(() => { for (const client of clients) client.dispose(); clients.length = 0; Socket.instances = []; vi.restoreAllMocks(); vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('serializes rapid edits before Start and cancels queued work after rejection', async () => {
  vi.useFakeTimers(); document.body.innerHTML = '<div id="app"></div>';
  localStorage.clear(); sessionStorage.clear();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.stubGlobal('WebSocket', Socket);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'ABCDE', credential: '1'.repeat(64) }) }));
  const client = makeClient(); client.start();
  client.actions.create('Test', 'face-01');
  await vi.waitFor(() => expect(Socket.instances.length).toBe(1));
  const socket = Socket.instances[0]!;
  const snapshot: Snapshot = { version: 1, acknowledgement: null, selfId: 'host', game: null, notice: null, room: { code: 'ABCDE', createdAt: 0, hostId: 'host', players: [], status: 'lobby', gameId: null, totals: {}, gamesPlayed: 0, setup: { gameId: 'blindstop', settings: { rounds: 5, pace: 'manual', practice: false } } } };
  socket.message({ type: 'state', snapshot });
  const ping = socket.sent.find(value => value.type === 'ping')!;
  socket.message({ type: 'clock', t0: ping.t0, serverNow: performance.now() });
  const edit = (rounds: number) => client.actions.send({ type: 'configure', setup: { gameId: 'blindstop', settings: { rounds, pace: 'manual', practice: false } } });
  const intents = () => socket.sent.filter(value => value.intent).map(value => value.intent!);
  edit(3); edit(10); edit(20);
  expect(intents()).toHaveLength(1);
  expect(client.getSnapshot().pending).toBe(false);
  expect(client.getSnapshot().delivery).toBeNull();
  expect(client.getSnapshot().settingsDraft?.settings).toMatchObject({ rounds: 20 });
  client.actions.send({ type: 'start', gameId: 'blindstop', settings: { rounds: 20, pace: 'manual', practice: true } });
  expect(client.getSnapshot().pending).toBe(true);
  socket.message({ type: 'ack', ack: { actionId: intents()[0]!.actionId, accepted: true, code: 'ok', version: 2 } });
  expect(intents()).toHaveLength(2);
  expect(intents()[1]!.command).toMatchObject({ type: 'configure', setup: { settings: { rounds: 20 } } });
  expect(client.getSnapshot().settingsDraft?.settings).toMatchObject({ rounds: 20 });
  socket.message({ type: 'ack', ack: { actionId: intents()[1]!.actionId, accepted: true, code: 'ok', version: 3 } });
  expect(intents()[2]!.command).toMatchObject({ type: 'start', settings: { rounds: 20, practice: true } });
  socket.message({ type: 'ack', ack: { actionId: intents()[2]!.actionId, accepted: false, code: 'room.invalidSettings', version: 3 } });
  expect(client.getSnapshot().settingsDraft).toBeNull();
  edit(5); edit(15);
  socket.message({ type: 'ack', ack: { actionId: intents()[3]!.actionId, accepted: false, code: 'room.hostOnly', version: 4 } });
  expect(intents()).toHaveLength(4);
  expect(client.getSnapshot().pending).toBe(false);
  expect(client.getSnapshot().error).toBe('room.hostOnly');
  expect(client.getSnapshot().settingsDraft).toBeNull();
  edit(10);
  const original = intents()[4]!;
  socket.close();
  await vi.advanceTimersByTimeAsync(1200);
  const recovered = Socket.instances[1]!;
  recovered.message({ type: 'state', snapshot: { ...snapshot, version: 5 } });
  const recoveryPing = recovered.sent.find(value => value.type === 'ping')!;
  recovered.message({ type: 'clock', t0: recoveryPing.t0, serverNow: performance.now() });
  expect(recovered.sent.filter(value => value.intent).map(value => value.intent)).toEqual([original]);
  recovered.message({ type: 'ack', ack: { actionId: original.actionId, accepted: true, code: 'ok', version: 6 } });
  expect(client.getSnapshot().settingsDraft?.settings).toMatchObject({ rounds: 10 });
  recovered.message({ type: 'state', snapshot: { ...snapshot, version: 6, room: { ...snapshot.room, setup: { gameId: 'blindstop', settings: { rounds: 10, pace: 'manual', practice: false } } } } });
  expect(client.getSnapshot().settingsDraft).toBeNull();

});

it('does not publish stale admission after disposal and can restart under StrictMode', async () => {
  vi.useFakeTimers(); localStorage.clear(); sessionStorage.clear();
  vi.stubGlobal('WebSocket', Socket);
  let finish: ((response: { ok: boolean; json: () => Promise<unknown> }) => void) | undefined;
  vi.stubGlobal('fetch', vi.fn(() => new Promise(resolve => { finish = resolve; })));
  const client = makeClient();
  const listener = vi.fn(); const unsubscribe = client.subscribe(listener);
  const initial = client.getSnapshot();
  expect(client.getSnapshot()).toBe(initial);
  client.start(); client.actions.create('Test', 'face-01');
  client.dispose();
  const calls = listener.mock.calls.length;
  finish!({ ok: true, json: async () => ({ code: 'ABCDE', credential: '1'.repeat(64) }) });
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  expect(listener).toHaveBeenCalledTimes(calls);
  expect(Socket.instances).toHaveLength(0);
  expect(localStorage.getItem('playai.membership')).toBeNull();
  const baselineTimers = vi.getTimerCount();
  client.start(); client.start();
  expect(vi.getTimerCount()).toBe(baselineTimers);
  expect(client.getSnapshot().pending).toBe(false);
  client.dispose();
  expect(vi.getTimerCount()).toBe(baselineTimers);
  unsubscribe();
});

it('publishes immutable values without changing earlier snapshots', async () => {
  localStorage.clear(); sessionStorage.clear();
  vi.stubGlobal('WebSocket', Socket);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'ABCDE', credential: '1'.repeat(64) }) }));
  const client = makeClient(); client.start();
  const before = client.getSnapshot();
  client.actions.create('Test', 'face-01');
  const during = client.getSnapshot();
  expect(before.admissionPending).toBe(false);
  expect(during.admissionPending).toBe(true);
  expect(Object.isFrozen(during)).toBe(true);
  await vi.waitFor(() => expect(Socket.instances).toHaveLength(1));
  expect(during.admissionPending).toBe(true);
  expect(client.getSnapshot().pending).toBe(false);
});

const recoveredSnapshot: Snapshot = {
  version: 1, acknowledgement: null, selfId: 'host', game: null, notice: null,
  room: { code: 'ABCDE', createdAt: 0, hostId: 'host', players: [], status: 'lobby', gameId: null, totals: {}, gamesPlayed: 0,
    setup: { gameId: 'blindstop', settings: { rounds: 5, pace: 'manual', practice: false } } },
};
function calibrate(socket: Socket): void {
  socket.message({ type: 'state', snapshot: recoveredSnapshot });
  const ping = socket.sent.find(value => value.type === 'ping')!;
  socket.message({ type: 'clock', t0: ping.t0, serverNow: performance.now() });
}
function prepareRecovery(intent: Intent, queued: Intent['command'][] = []): void {
  localStorage.clear(); sessionStorage.clear();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  localStorage.setItem('playai.membership', JSON.stringify({ code: 'ABCDE', credential: '1'.repeat(64) }));
  sessionStorage.setItem('playai.pending', JSON.stringify({ code: 'ABCDE', intent, settingsEdit: intent.command.type === 'configure', queued }));
  vi.stubGlobal('WebSocket', Socket);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
}

it('allows explicit recovery of an unresolved command and retries its exact identity once calibrated', async () => {
  const intent: Intent = { actionId: 'pending-leave', command: { type: 'leave' } };
  prepareRecovery(intent);
  const client = makeClient(); client.start();
  await vi.waitFor(() => expect(client.getSnapshot().savedRoomCode).toBe('ABCDE'));
  expect(client.getSnapshot().pending).toBe(true);
  expect(client.getSnapshot().admissionPending).toBe(false);
  client.actions.resume(); client.actions.resume();
  expect(Socket.instances).toHaveLength(1);
  expect(client.getSnapshot().admissionPending).toBe(true);
  const socket = Socket.instances[0]!;
  expect(socket.sent.filter(value => value.intent)).toEqual([]);
  calibrate(socket);
  expect(socket.sent.filter(value => value.intent).map(value => value.intent)).toEqual([intent]);
  expect(client.getSnapshot().admissionPending).toBe(false);
  socket.message({ type: 'ack', ack: { actionId: intent.actionId, accepted: true, code: 'ok', version: 2 } });
  expect(client.getSnapshot().pending).toBe(false);
  expect(client.getSnapshot().savedRoomCode).toBeNull();
  expect(localStorage.getItem('playai.membership')).toBeNull();
  expect(sessionStorage.getItem('playai.pending')).toBeNull();
});

it('restores ordered settings and Start without blocking recovery, and permits abandoning them', async () => {
  const setup = { gameId: 'blindstop', settings: { rounds: 10, pace: 'manual', practice: false } };
  const intent: Intent = { actionId: 'pending-settings', command: { type: 'configure', setup } };
  const start: Intent['command'] = { type: 'start', gameId: 'blindstop', settings: setup.settings };
  prepareRecovery(intent, [start]);
  const client = makeClient(); client.start();
  await vi.waitFor(() => expect(client.getSnapshot().savedRoomCode).toBe('ABCDE'));
  expect(client.getSnapshot().pending).toBe(true);
  expect(client.getSnapshot().admissionPending).toBe(false);
  client.actions.resume(); const socket = Socket.instances[0]!; calibrate(socket);
  expect(socket.sent.filter(value => value.intent).map(value => value.intent)).toEqual([intent]);
  socket.message({ type: 'ack', ack: { actionId: intent.actionId, accepted: true, code: 'ok', version: 2 } });
  expect(socket.sent.filter(value => value.intent).map(value => value.intent!.command)).toEqual([intent.command, start]);
  client.actions.fresh();
  expect(client.getSnapshot()).toMatchObject({ pending: false, admissionPending: false, savedRoomCode: null, snapshot: null });
  expect(sessionStorage.getItem('playai.pending')).toBeNull();
});

it('continues current-tab admission and exact retries when storage writes fail, with a persistent warning', async () => {
  vi.useFakeTimers(); localStorage.clear(); sessionStorage.clear();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.stubGlobal('WebSocket', Socket);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'ABCDE', credential: '1'.repeat(64) }) }));
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new DOMException('Denied', 'SecurityError'); });
  const client = makeClient(); client.start(); client.actions.create('Test', 'face-01');
  await vi.waitFor(() => expect(Socket.instances).toHaveLength(1));
  const socket = Socket.instances[0]!; calibrate(socket);
  client.actions.send({ type: 'close' });
  const intent = socket.sent.find(value => value.intent)!.intent!;
  expect(client.getSnapshot().persistenceWarning).toBe('storage.unavailable');
  socket.close(); await vi.advanceTimersByTimeAsync(1200);
  const reconnected = Socket.instances[1]!; calibrate(reconnected);
  expect(reconnected.sent.filter(value => value.intent).map(value => value.intent)).toEqual([intent]);
  reconnected.message({ type: 'ack', ack: { actionId: intent.actionId, accepted: true, code: 'ok', version: 2 } });
  expect(client.getSnapshot().pending).toBe(false);
  expect(client.getSnapshot().persistenceWarning).toBe('storage.unavailable');
  expect(() => client.actions.fresh()).not.toThrow();
});

it('handles inaccessible storage reads and has no global countdown publication timer', async () => {
  vi.useFakeTimers(); localStorage.clear(); sessionStorage.clear();
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Denied', 'SecurityError'); });
  const client = makeClient(), listener = vi.fn(); client.subscribe(listener); client.start();
  expect(client.getSnapshot().persistenceWarning).toBe('storage.unavailable');
  const published = client.getSnapshot(); const count = listener.mock.calls.length;
  await vi.advanceTimersByTimeAsync(5000);
  expect(client.getSnapshot()).toBe(published);
  expect(listener).toHaveBeenCalledTimes(count);
  expect(vi.getTimerCount()).toBe(0);
});
