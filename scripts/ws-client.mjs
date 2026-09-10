import { WebSocket } from 'ws';
export const base = process.env.PLAYAI_URL ?? 'http://127.0.0.1:8787';
export async function post(path, body) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
export async function client(member) {
  const ws = new WebSocket(`${base.replace('http', 'ws')}/api/rooms/${member.code}/socket`, { origin: base });
  const messages = [];
  ws.on('message', raw => messages.push(JSON.parse(String(raw))));
  const wait = async predicate => {
    const until = performance.now() + 30000;
    while (performance.now() < until) { const result = messages.find(predicate); if (result) return result; await new Promise(r => setTimeout(r, 20)); }
    throw new Error('Server message timeout');
  };
  await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
  const send = value => ws.send(JSON.stringify(value));
  send({ type: 'auth', credential: member.credential });
  await wait(m => m.type === 'state');
  send({ type: 'ready', ready: true });
  const latest = () => messages.filter(m => m.type === 'state').at(-1)?.snapshot;
  return { ws, send, wait, latest, messages };
}
