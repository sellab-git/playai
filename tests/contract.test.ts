import { describe, expect, it } from 'vitest';
import { registerGame, type GameEngine } from '../src/engine';

type State = { ticks: number };
type Action = { type: 'ADD' };
type Settings = { limit: number };
const engine: GameEngine<State, Action, Settings> = {
  manifest: { id: 'fixture', nameKey: 'fixture.name', taglineKey: 'fixture.tagline', markId: 'fixture', minPlayers: 2, maxPlayers: 20, estimatedMinutes: [1, 1], defaultSettings: { limit: 1 }, awardPolicy: 'ranked' },
  parseSettings: raw => typeof raw === 'object' && raw !== null && 'limit' in raw && typeof raw.limit === 'number' ? { limit: raw.limit } : null,
  parseAction: raw => typeof raw === 'object' && raw !== null && 'type' in raw && raw.type === 'ADD' ? { type: 'ADD' } : null,
  init: () => ({ ticks: 0 }),
  reduce: s => ({ accepted: true, state: { ticks: s.ticks + 1 } }),
  publicView: s => ({ ticks: s.ticks }), privateView: () => null,
  phase: s => ({ name: 'step', token: String(s.ticks), roundId: '1', endsAt: 100 }),
  isFinished: s => s.ticks > 0, scores: () => ({}),
};
const entry = registerGame(engine, raw => typeof raw === 'object' && raw !== null && !Array.isArray(raw) && typeof raw.ticks === 'number' ? { ticks: raw.ticks } : null);
describe('generic registry seam', () => {
  it('accepts a concrete typed engine and validates JSON state', () => {
    expect(entry.publicView({ ticks: 2 }, [])).toEqual({ ticks: 2 });
    expect(() => entry.publicView({ secret: 'invalid' }, [])).toThrow('Invalid durable game state');
    expect(entry.reduce({ ticks: 0 }, { type: 'OTHER' }, { actor: 'p', hostId: 'p', now: 0, rng: () => 0 })).toEqual({ accepted: false, code: 'action.invalid' });
  });
});
