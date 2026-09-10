import { registerGame, type GameEngine, type Json, type PlayerId } from '../src/engine';
import type { DurableRecord, RunnerDependencies } from '../src/room/types';

type FixtureState = {
  roster: string[];
  phase: number;
  endsAt: number;
  submissions: Record<string, number>;
  secret: string;
  mode: 'ranked' | 'team';
};
type FixtureAction = { type: 'SUBMIT'; value: number } | { type: 'NEXT' };
type FixtureSettings = { deadlineMs: number; mode: 'ranked' | 'team' };

const fixtureEngine: GameEngine<FixtureState, FixtureAction, FixtureSettings> = {
  manifest: {
    id: 'fixture', nameKey: 'fixture.name', taglineKey: 'fixture.tagline', markId: 'fixture',
    minPlayers: 2, maxPlayers: 20, estimatedMinutes: [1, 1],
    defaultSettings: { deadlineMs: 1_000, mode: 'ranked' }, awardPolicy: 'ranked',
  },
  parseSettings: raw => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
    const value = raw as Record<string, unknown>;
    return typeof value.deadlineMs === 'number' && (value.mode === 'ranked' || value.mode === 'team')
      ? { deadlineMs: value.deadlineMs, mode: value.mode } : null;
  },
  parseAction: raw => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
    const value = raw as Record<string, unknown>;
    if (value.type === 'NEXT') return { type: 'NEXT' };
    return value.type === 'SUBMIT' && typeof value.value === 'number'
      ? { type: 'SUBMIT', value: value.value } : null;
  },
  init: ctx => ({
    roster: ctx.players.map(player => player.id), phase: 0,
    endsAt: ctx.now + ctx.settings.deadlineMs, submissions: {},
    secret: `hidden-${ctx.seed}`, mode: ctx.settings.mode,
  }),
  reduce: (state, action, ctx) => {
    if (action.type === 'TICK' || action.type === 'NEXT') {
      return { accepted: true, state: { ...state, phase: state.phase + 1, endsAt: ctx.now + 1_000 } };
    }
    if (ctx.actor === null) return { accepted: false, code: 'action.actor' };
    if (state.submissions[ctx.actor] !== undefined) return { accepted: false, code: 'action.alreadySubmitted' };
    return { accepted: true, state: { ...state, submissions: { ...state.submissions, [ctx.actor]: action.value } } };
  },
  publicView: state => ({ phase: state.phase, submitted: Object.keys(state.submissions).length }),
  privateView: (state, playerId) => ({ marker: `${state.secret}:${playerId}`, own: state.submissions[playerId] ?? null }),
  phase: state => ({ name: 'turn', token: `turn-${state.phase}`, roundId: `round-${state.phase}`, endsAt: state.phase < 2 ? state.endsAt : null }),
  isFinished: state => state.phase >= 2,
  scores: state => {
    const n = state.roster.length;
    return Object.fromEntries(state.roster.map((id, index) => {
      if (state.mode === 'team') return [id, index % 2 === 0 ? n : 0];
      if (state.submissions[id] === undefined) return [id, 0];
      const rank = [...Object.entries(state.submissions)].sort((a, b) => a[1] - b[1]).findIndex(([key]) => key === id);
      return [id, n - rank];
    }));
  },
};

function decodeFixture(raw: Json): FixtureState | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const value = raw as Record<string, Json>;
  if (!Array.isArray(value.roster) || typeof value.phase !== 'number' || typeof value.endsAt !== 'number'
      || typeof value.submissions !== 'object' || value.submissions === null || Array.isArray(value.submissions)
      || typeof value.secret !== 'string' || (value.mode !== 'ranked' && value.mode !== 'team')) return null;
  if (!value.roster.every(item => typeof item === 'string')) return null;
  const submissions: Record<string, number> = {};
  for (const [key, item] of Object.entries(value.submissions)) {
    if (typeof item !== 'number') return null;
    submissions[key] = item;
  }
  return { roster: value.roster, phase: value.phase, endsAt: value.endsAt, submissions, secret: value.secret, mode: value.mode };
}

export const fixtureEntry = registerGame(fixtureEngine, decodeFixture);

export function harness(record: DurableRecord | null = null) {
  let now = 1_000;
  let sequence = 0;
  const deps: RunnerDependencies = {
    now: () => now,
    id: () => `id-${++sequence}`,
    seed: () => 42 + sequence,
    games: { fixture: fixtureEntry },
  };
  return { deps, now: () => now, setNow: (value: number) => { now = value; }, record };
}

export function scope(record: DurableRecord | null) {
  if (record?.kind !== 'room' || record.value.game === null) throw new Error('Expected active game');
  const game = record.value.game;
  return { gameInstanceId: game.id, phaseEpoch: game.phaseEpoch, roundId: fixtureEntry.phase(game.state).roundId };
}

export const profile = (name: string) => ({ name, faceId: 'face-01', tile: 'tYel' });
export const submit = (playerId: PlayerId, value: number): Json => ({ type: 'SUBMIT', value, playerId });
