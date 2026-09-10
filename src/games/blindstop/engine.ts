import { registerGame, type GameEngine, type Json } from '../../engine';

type Row = { playerId: string; elapsedMs: number | null; errorMs: number | null; rank: number; award: number };
type History = { round: number; targetMs: number; rows: Row[] };
type Settings = { rounds: number; pace: 'manual' | 'auto'; practice: boolean; legacy: boolean };
type State = {
  roster: string[]; targetMs: number; startAt: number; endsAt: number;
  phase: 'countdown' | 'round' | 'result' | 'final'; taps: Record<string, number>;
  rounds: number; round: number; pace: 'manual' | 'auto'; practice: boolean;
  autoRemainingMs: number; controlRevision: number; paused: boolean; nextAt: number | null; targets: number[]; history: History[]; legacy: boolean;
};
type Action = { type: 'TAP'; elapsedMs: number } | { type: 'NEXT' | 'START' | 'PAUSE' | 'RESUME' };
const object = (raw: unknown): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null && !Array.isArray(raw);
const finite = (raw: unknown): raw is number => typeof raw === 'number' && Number.isFinite(raw);
const AUTO_DELAY = 8000;
const SAFETY_DELAY = 15 * 60 * 1000;

function roundRows(state: Pick<State, 'roster' | 'taps' | 'targetMs'>): Row[] {
  const ordered = state.roster.map(playerId => {
    const elapsedMs = state.taps[playerId] ?? null;
    return { playerId, elapsedMs, errorMs: elapsedMs === null ? null : Math.round((elapsedMs - state.targetMs) / 10) * 10 };
  }).sort((a, b) => (a.errorMs === null ? Infinity : Math.abs(a.errorMs)) - (b.errorMs === null ? Infinity : Math.abs(b.errorMs)));
  return ordered.map(row => {
    const rank = 1 + ordered.filter(other => other.errorMs !== null && (row.errorMs === null || Math.abs(other.errorMs) < Math.abs(row.errorMs))).length;
    return { ...row, rank, award: row.errorMs === null ? 0 : state.roster.length - rank + 1 };
  });
}
function standings(state: State) {
  const values = state.roster.map(playerId => {
    const errors = state.history.flatMap(round => round.rows.filter(row => row.playerId === playerId && row.errorMs !== null).map(row => Math.abs(row.errorMs!)));
    return { playerId, completed: errors.length, missed: state.history.length - errors.length, meanErrorMs: errors.length ? Math.round(errors.reduce((sum, error) => sum + error, 0) / errors.length / 10) * 10 : null };
  });
  const better = (a: typeof values[number], b: typeof values[number]): boolean => a.completed > b.completed || (a.completed === b.completed && (a.meanErrorMs ?? Infinity) < (b.meanErrorMs ?? Infinity));
  return values.map(value => {
    const rank = 1 + values.filter(other => better(other, value)).length;
    return { ...value, rank, award: value.completed ? state.roster.length - rank + 1 : 0 };
  }).sort((a, b) => a.rank - b.rank);
}
function makeTargets(count: number, rng: () => number): number[] {
  const pool: number[] = [];
  for (let whole = 3; whole <= 11; whole++) for (let part = 11; part <= 89; part++) if (part % 5 !== 0) pool.push((whole * 100 + part) * 10);
  const result: number[] = [];
  for (let index = 0; index < count; index++) {
    const previous = result.at(-1);
    const choices = pool.filter(target => previous === undefined || Math.abs(target - previous) >= 800);
    const candidate = choices[Math.min(choices.length - 1, Math.max(0, Math.floor(rng() * choices.length)))]!;
    result.push(candidate); pool.splice(pool.indexOf(candidate), 1);
  }
  return result;
}
function startRound(state: State, now: number, round: number): State {
  const targetMs = state.targets[round - 1]!;
  const startAt = now + 3300;
  return { ...state, round, practice: false, targetMs, startAt, endsAt: startAt + targetMs + 8000, phase: 'countdown', taps: {}, paused: false, autoRemainingMs: AUTO_DELAY, nextAt: null };
}
function reveal(state: State, now: number): State {
  const history = state.practice ? state.history : [...state.history, { round: state.round, targetMs: state.targetMs, rows: roundRows(state) }];
  return { ...state, history, phase: 'result', paused: false, autoRemainingMs: AUTO_DELAY, nextAt: state.legacy ? null : now + (state.pace === 'auto' && !state.practice ? AUTO_DELAY : SAFETY_DELAY) };
}
function advance(state: State, now: number): State {
  if (state.practice) return startRound(state, now, 1);
  return state.round < state.rounds ? startRound(state, now, state.round + 1) : { ...state, phase: 'final', nextAt: null, paused: false };
}

const decode = (raw: Json): State | null => {
  if (!object(raw) || !Array.isArray(raw.roster) || !raw.roster.every(id => typeof id === 'string') || new Set(raw.roster).size !== raw.roster.length || !object(raw.taps)) return null;
  if (!finite(raw.targetMs) || !finite(raw.startAt) || !finite(raw.endsAt) || !['countdown', 'round', 'result', 'final'].includes(String(raw.phase))) return null;
  const taps: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw.taps)) {
    if (!raw.roster.includes(id) || !finite(value) || value < 0) return null;
    taps[id] = value;
  }
  const base = { roster: raw.roster as string[], targetMs: raw.targetMs, startAt: raw.startAt, endsAt: raw.endsAt, phase: raw.phase as State['phase'], taps };
  if (raw.rounds === undefined) {
    return { ...base, rounds: 1, round: 1, pace: 'manual', practice: false, controlRevision: 0, paused: false, autoRemainingMs: AUTO_DELAY, nextAt: null, targets: [base.targetMs], history: base.phase === 'result' ? [{ round: 1, targetMs: base.targetMs, rows: roundRows(base) }] : [], legacy: true };
  }
  if (!Number.isInteger(raw.rounds) || !finite(raw.rounds) || raw.rounds < 1 || raw.rounds > 20 || !finite(raw.round) || !Number.isInteger(raw.round) || raw.round < 0 || raw.round > raw.rounds || (raw.pace !== 'manual' && raw.pace !== 'auto') || typeof raw.practice !== 'boolean' || typeof raw.paused !== 'boolean' || typeof raw.legacy !== 'boolean' || (raw.nextAt !== null && !finite(raw.nextAt)) || !Array.isArray(raw.targets) || raw.targets.length !== raw.rounds || !raw.targets.every(finite) || !Array.isArray(raw.history)) return null;
  const history: History[] = [];
  for (const entry of raw.history) {
    if (!object(entry) || !finite(entry.round) || !Number.isInteger(entry.round) || entry.round !== history.length + 1 || entry.round > raw.rounds || !finite(entry.targetMs) || !Array.isArray(entry.rows) || entry.rows.length !== base.roster.length) return null;
    const rows: Row[] = [];
    for (const row of entry.rows) {
      if (!object(row) || typeof row.playerId !== 'string' || !base.roster.includes(row.playerId) || rows.some(other => other.playerId === row.playerId) || (row.elapsedMs !== null && !finite(row.elapsedMs)) || (row.errorMs !== null && !finite(row.errorMs)) || !finite(row.rank) || !finite(row.award)) return null;
      rows.push({ playerId: row.playerId, elapsedMs: row.elapsedMs, errorMs: row.errorMs, rank: row.rank, award: row.award });
    }
    history.push({ round: entry.round, targetMs: entry.targetMs, rows });
  }
  if (raw.practice !== (raw.round === 0)) return null;
  if (raw.controlRevision !== undefined && (!finite(raw.controlRevision) || !Number.isInteger(raw.controlRevision) || raw.controlRevision < 0)) return null;
  if (raw.autoRemainingMs !== undefined && (!finite(raw.autoRemainingMs) || raw.autoRemainingMs < 0 || raw.autoRemainingMs > AUTO_DELAY)) return null;
  return { ...base, autoRemainingMs: typeof raw.autoRemainingMs === 'number' ? raw.autoRemainingMs : AUTO_DELAY, controlRevision: typeof raw.controlRevision === 'number' ? raw.controlRevision : 0, rounds: raw.rounds, round: raw.round, pace: raw.pace, practice: raw.practice, paused: raw.paused, legacy: raw.legacy, nextAt: raw.nextAt, targets: raw.targets as number[], history };
};
const engine: GameEngine<State, Action, Settings> = {
  manifest: { id: 'blindstop', nameKey: 'blindstop.name', taglineKey: 'blindstop.tagline', markId: 'stopwatch', minPlayers: 1, maxPlayers: 20, estimatedMinutes: [2, 8], defaultSettings: { rounds: 5, pace: 'manual', practice: false, legacy: false }, awardPolicy: 'ranked' },
  parseSettings: raw => {
    if (!object(raw) || Object.keys(raw).some(key => !['rounds', 'pace', 'practice', 'legacy'].includes(key)) || !finite(raw.rounds) || !Number.isInteger(raw.rounds) || raw.rounds < 1 || raw.rounds > 20 || (raw.pace !== undefined && raw.pace !== 'manual' && raw.pace !== 'auto') || (raw.practice !== undefined && typeof raw.practice !== 'boolean') || (raw.legacy !== undefined && typeof raw.legacy !== 'boolean')) return null;
    if (raw.legacy === true && (raw.rounds !== 1 || (raw.pace !== undefined && raw.pace !== 'manual') || raw.practice === true)) return null;
    return { rounds: raw.rounds, pace: raw.pace ?? 'manual', practice: raw.practice ?? false, legacy: raw.legacy === true || (Object.keys(raw).length === 1 && raw.rounds === 1) };
  },
  parseAction: raw => {
    if (!object(raw)) return null;
    if (raw.type === 'TAP' && Object.keys(raw).length === 2 && finite(raw.elapsedMs) && raw.elapsedMs >= 0 && raw.elapsedMs <= 60000) return { type: 'TAP', elapsedMs: raw.elapsedMs };
    if (Object.keys(raw).length === 1 && (raw.type === 'NEXT' || raw.type === 'START' || raw.type === 'PAUSE' || raw.type === 'RESUME')) return { type: raw.type };
    return null;
  },
  init: ctx => {
    const targets = makeTargets(ctx.settings.rounds, ctx.rng);
    const targetMs = ctx.settings.practice ? 6370 : targets[0]!;
    const startAt = ctx.now + 3300;
    return { roster: ctx.players.map(player => player.id), targetMs, startAt, endsAt: startAt + targetMs + 8000, phase: 'countdown', taps: {}, ...ctx.settings, round: ctx.settings.practice ? 0 : 1, controlRevision: 0, paused: false, autoRemainingMs: AUTO_DELAY, nextAt: null, targets, history: [] };
  },
  reduce: (state, action, ctx) => {
    if (action.type === 'TICK') {
      if (ctx.actor !== null || state.phase === 'final' || (state.legacy && state.phase === 'result')) return { accepted: false, code: 'action.stale' };
      if (state.phase === 'result') return state.nextAt !== null && ctx.now >= state.nextAt ? { accepted: true, state: advance(state, ctx.now) } : { accepted: false, code: 'action.stale' };
      if (ctx.now >= state.endsAt) return { accepted: true, state: reveal(state, ctx.now) };
      if (ctx.now >= state.startAt && state.phase === 'countdown') return { accepted: true, state: { ...state, phase: 'round' } };
      return { accepted: false, code: 'action.stale' };
    }
    if (!ctx.actor || !state.roster.includes(ctx.actor)) return { accepted: false, code: 'action.permissionLost' };
    if (action.type !== 'TAP') {
      if (ctx.actor !== ctx.hostId) return { accepted: false, code: 'room.hostOnly' };
      if (state.phase !== 'result' || state.legacy || (state.nextAt !== null && ctx.now >= state.nextAt)) return { accepted: false, code: 'action.stale' };
      if (action.type === 'NEXT' || (action.type === 'START' && state.practice)) return { accepted: true, state: advance(state, ctx.now) };
      if (state.practice || state.pace !== 'auto') return { accepted: false, code: 'action.stale' };
      if (action.type === 'PAUSE' && !state.paused) return { accepted: true, state: { ...state, controlRevision: state.controlRevision + 1, paused: true, autoRemainingMs: Math.max(0, (state.nextAt ?? ctx.now + AUTO_DELAY) - ctx.now), nextAt: ctx.now + SAFETY_DELAY } };
      if (action.type === 'RESUME' && state.paused) return { accepted: true, state: { ...state, controlRevision: state.controlRevision + 1, paused: false, nextAt: ctx.now + state.autoRemainingMs } };
      return { accepted: false, code: 'action.stale' };
    }
    if (state.phase !== 'round' || ctx.now < state.startAt || ctx.now >= state.endsAt) return { accepted: false, code: 'action.stale' };
    if (Object.hasOwn(state.taps, ctx.actor)) return { accepted: false, code: 'action.alreadySubmitted' };
    const tapped = { ...state, taps: { ...state.taps, [ctx.actor]: Math.min(action.elapsedMs, state.targetMs + 8000) } };
    return { accepted: true, state: Object.keys(tapped.taps).length === state.roster.length ? reveal(tapped, ctx.now) : tapped };
  },
  publicView: state => ({ targetMs: state.targetMs, startAt: state.startAt, endsAt: state.endsAt, phase: state.phase, submitted: Object.keys(state.taps).length, submittedIds: Object.keys(state.taps), total: state.roster.length, rows: state.phase === 'result' || state.phase === 'final' ? roundRows(state) : [], rounds: state.rounds, round: state.round, practice: state.practice, pace: state.pace, paused: state.paused, nextAt: state.nextAt, standings: standings(state), history: state.history }),
  privateView: (state, playerId) => ({ submitted: Object.hasOwn(state.taps, playerId) }),
  phase: state => ({ name: state.phase, token: `${state.practice ? 'practice' : state.round}:${state.phase}:${state.controlRevision}`, roundId: state.practice ? 'practice' : String(state.round), endsAt: state.phase === 'final' ? null : state.phase === 'result' ? state.nextAt : state.phase === 'countdown' ? state.startAt : state.endsAt }),
  isFinished: state => state.phase === 'final' || (state.legacy && state.phase === 'result'),
  scores: state => Object.fromEntries(standings(state).map(row => [row.playerId, state.phase === 'final' || (state.legacy && state.phase === 'result') ? row.award : 0])),
};
export const blindstop = registerGame(engine, decode);
