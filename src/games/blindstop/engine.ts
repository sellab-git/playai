import { registerGame, type GameEngine, type Json } from '../../engine';

type State = {
  roster: string[];
  targetMs: number;
  startAt: number;
  endsAt: number;
  phase: 'countdown' | 'round' | 'result';
  taps: Record<string, number>;
};
type Tap = { type: 'TAP'; elapsedMs: number };
type Settings = { rounds: number };
const object = (raw: unknown): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null && !Array.isArray(raw);
const decode = (raw: Json): State | null => {
  if (!object(raw) || !Array.isArray(raw.roster) || !raw.roster.every(id => typeof id === 'string') || !object(raw.taps)) return null;
  if (typeof raw.targetMs !== 'number' || !Number.isFinite(raw.targetMs) || typeof raw.startAt !== 'number' || !Number.isFinite(raw.startAt) || typeof raw.endsAt !== 'number' || !Number.isFinite(raw.endsAt)) return null;
  if (raw.phase !== 'countdown' && raw.phase !== 'round' && raw.phase !== 'result') return null;
  const taps: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw.taps)) {
    if (!raw.roster.includes(id) || typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
    taps[id] = value;
  }
  return { roster: raw.roster, targetMs: raw.targetMs, startAt: raw.startAt, endsAt: raw.endsAt, phase: raw.phase, taps };
};
const rows = (state: State) => {
  const ordered = state.roster.map(playerId => {
    const elapsedMs = state.taps[playerId] ?? null;
    const errorMs = elapsedMs === null ? null : Math.round((elapsedMs - state.targetMs) / 10) * 10;
    return { playerId, elapsedMs, errorMs };
  }).sort((a, b) => (a.errorMs === null ? Infinity : Math.abs(a.errorMs)) - (b.errorMs === null ? Infinity : Math.abs(b.errorMs)));
  return ordered.map(row => {
    const rank = row.errorMs === null ? ordered.filter(r => r.errorMs !== null).length + 1 : ordered.filter(r => r.errorMs !== null && Math.abs(r.errorMs) < Math.abs(row.errorMs!)).length + 1;
    return { ...row, rank, award: row.errorMs === null ? 0 : state.roster.length - rank + 1 };
  });
};
const engine: GameEngine<State, Tap, Settings> = {
  manifest: { id: 'blindstop', nameKey: 'blindstop.name', taglineKey: 'blindstop.tagline', markId: 'stopwatch', minPlayers: 2, maxPlayers: 20, estimatedMinutes: [1, 1], defaultSettings: { rounds: 1 }, awardPolicy: 'ranked' },
  parseSettings: raw => object(raw) && Object.keys(raw).length === 1 && raw.rounds === 1 ? { rounds: 1 } : null,
  parseAction: raw => object(raw) && Object.keys(raw).length === 2 && raw.type === 'TAP' && typeof raw.elapsedMs === 'number' && Number.isFinite(raw.elapsedMs) && raw.elapsedMs >= 0 && raw.elapsedMs <= 60000 ? { type: 'TAP', elapsedMs: raw.elapsedMs } : null,
  init: ctx => {
    const targetMs = (311 + Math.floor(ctx.rng() * 879)) * 10;
    const startAt = ctx.now + 3300;
    return { roster: ctx.players.map(p => p.id), targetMs, startAt, endsAt: startAt + targetMs + 8000, phase: 'countdown', taps: {} };
  },
  reduce: (state, action, ctx) => {
    if (action.type === 'TICK') {
      if (ctx.actor !== null || state.phase === 'result') return { accepted: false, code: 'action.stale' };
      if (ctx.now >= state.endsAt) return { accepted: true, state: { ...state, phase: 'result' } };
      if (ctx.now >= state.startAt && state.phase === 'countdown') return { accepted: true, state: { ...state, phase: 'round' } };
      return { accepted: false, code: 'action.stale' };
    }
    if (!ctx.actor || !state.roster.includes(ctx.actor)) return { accepted: false, code: 'action.permissionLost' };
    if (state.phase !== 'round' || ctx.now < state.startAt || ctx.now >= state.endsAt) return { accepted: false, code: 'action.stale' };
    if (Object.hasOwn(state.taps, ctx.actor)) return { accepted: false, code: 'action.alreadySubmitted' };
    const elapsedMs = Math.min(action.elapsedMs, state.targetMs + 8000);
    const taps = { ...state.taps, [ctx.actor]: elapsedMs };
    return { accepted: true, state: { ...state, taps, phase: Object.keys(taps).length === state.roster.length ? 'result' : 'round' } };
  },
  publicView: state => ({ targetMs: state.targetMs, startAt: state.startAt, endsAt: state.endsAt, phase: state.phase, submitted: Object.keys(state.taps).length, total: state.roster.length, rows: state.phase === 'result' ? rows(state) : [] }),
  privateView: (state, playerId) => ({ submitted: Object.hasOwn(state.taps, playerId) }),
  phase: state => ({ name: state.phase, token: `1:${state.phase}`, roundId: '1', endsAt: state.phase === 'result' ? null : state.phase === 'countdown' ? state.startAt : state.endsAt }),
  isFinished: state => state.phase === 'result',
  scores: state => Object.fromEntries(rows(state).map(row => [row.playerId, state.phase === 'result' ? row.award : 0])),
};
export const blindstop = registerGame(engine, decode);
