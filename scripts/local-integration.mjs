import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
const base = process.env.PLAYAI_URL ?? 'http://127.0.0.1:8787';
const sockets = [];
async function post(path, body, origin = base) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
function connect(member) {
  const ws = new WebSocket(`${base.replace('http', 'ws')}/api/rooms/${member.code}/socket`, { origin: base });
  sockets.push(ws);
  const messages = [];
  ws.on('message', raw => messages.push(JSON.parse(String(raw))));
  const wait = async (predicate, timeout = 25000) => {
    const deadline = performance.now() + timeout;
    while (performance.now() < deadline) {
      const found = messages.find(predicate); if (found) return found;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Timed out waiting for expected server message');
  };
  const send = data => ws.send(JSON.stringify(data));
  const latest = () => messages.filter(m => m.type === 'state').at(-1)?.snapshot;
  return new Promise((resolve, reject) => {
    ws.once('error', reject);
    ws.once('open', async () => {
      try {
        send({ type: 'auth', credential: member.credential });
        await wait(m => m.type === 'state');
        send({ type: 'ping', t0: 10 });
        const clock = await wait(m => m.type === 'clock'); assert.equal(clock.t0, 10); assert.ok(Number.isFinite(clock.serverNow));
        const version = latest().version;
        send({ type: 'ready', ready: true });
        await wait(m => m.type === 'state' && m.snapshot.version > version);
        resolve({ ws, messages, wait, send, latest });
      } catch (error) { reject(error); }
    });
  });
}
try {
  assert.equal((await post('/api/rooms', { name: 'Host', faceId: 'face-01' }, 'https://evil.test')).status, 403);
  const made = await post('/api/rooms', { name: 'Host', faceId: 'face-01' }); assert.equal(made.status, 201);
  const host = made.body;
  const joined = await post(`/api/rooms/${host.code}/join`, { name: 'Guest', faceId: 'face-02' }); assert.equal(joined.status, 201);
  const guest = joined.body;
  assert.notEqual(host.playerId, guest.playerId);
  assert.equal((await post(`/api/rooms/${host.code}/recover`, { credential: 'f'.repeat(64) })).status, 403);
  const a = await connect(host), b = await connect(guest);
  const start = { actionId: crypto.randomUUID(), command: { type: 'start', gameId: 'blindstop', settings: { rounds: 1 } } };
  b.send({ type: 'intent', intent: { ...start, actionId: 'guest-start' } });
  assert.equal((await b.wait(m => m.type === 'ack' && m.ack.actionId === 'guest-start')).ack.accepted, false);
  a.send({ type: 'intent', intent: start });
  assert.equal((await a.wait(m => m.type === 'ack' && m.ack.actionId === start.actionId)).ack.accepted, true);
  await a.wait(m => m.type === 'state' && m.snapshot.game?.phase.name === 'round');
  await b.wait(m => m.type === 'state' && m.snapshot.game?.phase.name === 'round');
  const state = a.latest();
  assert.deepEqual(state.game.public.rows, []);
  assert.ok(!JSON.stringify(state).includes(host.credential));
  const tap = { actionId: crypto.randomUUID(), command: { type: 'action', scope: state.game.scope, payload: { type: 'TAP', elapsedMs: state.game.public.targetMs } } };
  a.send({ type: 'intent', intent: tap });
  const ack = (await a.wait(m => m.type === 'ack' && m.ack.actionId === tap.actionId)).ack;
  assert.equal(ack.accepted, true);
  await b.wait(m => m.type === 'state' && m.snapshot.game?.public.submitted === 1);
  assert.deepEqual(b.latest().game.private, { submitted: false });
  assert.deepEqual(b.latest().game.public.rows, []);
  const recovered = await connect(host);
  recovered.send({ type: 'intent', intent: tap });
  assert.deepEqual((await recovered.wait(m => m.type === 'ack' && m.ack.actionId === tap.actionId)).ack, ack);
  recovered.send({ type: 'intent', intent: { actionId: tap.actionId, command: { ...tap.command, payload: { type: 'TAP', elapsedMs: 1 } } } });
  assert.equal((await recovered.wait(m => m.type === 'ack' && m.ack.code.includes('conflict'))).ack.accepted, false);
  b.send({ type: 'intent', intent: { actionId: crypto.randomUUID(), command: { type: 'action', scope: b.latest().game.scope, payload: { type: 'TAP', elapsedMs: state.game.public.targetMs + 100 } } } });
  await recovered.wait(m => m.type === 'state' && m.snapshot.room.status === 'completed');
  const final = recovered.latest(); assert.equal(final.room.gamesPlayed, 1); assert.equal(final.room.totals[host.playerId], 2); assert.equal(final.room.totals[guest.playerId], 1);
  assert.equal(final.game.public.rows.length, 2);
  const closeId = crypto.randomUUID(); recovered.send({ type: 'intent', intent: { actionId: closeId, command: { type: 'close' } } });
  assert.equal((await recovered.wait(m => m.type === 'ack' && m.ack.actionId === closeId)).ack.accepted, true);
  await b.wait(m => m.type === 'state' && m.snapshot.room.status === 'closed');
  assert.equal(b.latest().room.totals[host.playerId], 2);
  assert.notEqual((await post(`/api/rooms/${host.code}/recover`, { credential: host.credential })).status, 200);
  assert.notEqual((await post(`/api/rooms/${host.code}/join`, { name: 'Late', faceId: 'face-03' })).status, 201);
  console.log('PASS: local HTTP/WebSocket admission, origin/credential rejection, readiness, host authority, real alarm round transition, private delivery, reconnect generation, identical/conflicting retry, completion awards, terminal summary and closed admission.');
} finally { for (const ws of sockets) ws.close(); }
