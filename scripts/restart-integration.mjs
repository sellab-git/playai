import assert from 'node:assert/strict';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { post, client } from './ws-client.mjs';
const path = process.env.PLAYAI_RESTART_FIXTURE ?? '.wrangler/restart-fixture.json';
const clients = [];
try {
  if (process.argv[2] === 'prepare') {
    const host = await post('/api/rooms', { name: 'RestartHost', faceId: 'face-01' });
    const guest = await post(`/api/rooms/${host.code}/join`, { name: 'RestartGuest', faceId: 'face-02' });
    const a = await client(host), b = await client(guest); clients.push(a,b);
    const intent = { actionId: crypto.randomUUID(), command: { type: 'start', gameId: 'blindstop', settings: { rounds: 1 } } };
    a.send({ type: 'intent', intent });
    const ack = (await a.wait(m => m.type === 'ack' && m.ack.actionId === intent.actionId)).ack;
    assert.equal(ack.accepted, true);
    await writeFile(path, JSON.stringify({ host, guest, intent, ack }));
    console.log('Prepared persisted active room. Restart the local Wrangler process before resume.');
  } else {
    const fixture = JSON.parse(await readFile(path, 'utf8'));
    const a = await client(fixture.host); clients.push(a);
    a.send({ type: 'intent', intent: fixture.intent });
    assert.deepEqual((await a.wait(m => m.type === 'ack' && m.ack.actionId === fixture.intent.actionId)).ack, fixture.ack);
    await a.wait(m => m.type === 'state' && m.snapshot.room.status === 'completed');
    assert.equal(a.latest().room.gamesPlayed, 1);
    assert.deepEqual(Object.values(a.latest().room.totals), [0,0]);
    console.log('PASS: actual Wrangler process restart restored membership, original Start outcome, overdue phase deadlines and exactly one zero-contribution award record.');
    await unlink(path);
  }
} finally { for (const c of clients) c.ws.terminate(); }
