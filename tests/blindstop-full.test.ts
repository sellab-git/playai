import { describe, expect, it } from 'vitest';
import { blindstop } from '../src/games/blindstop/engine';
import type { Json } from '../src/engine';

const players = ['a', 'b'].map((id, index) => ({ id, name: id, faceId: 'face-01', tile: 'tYel', joinedAt: index, lastSeenAt: 0, connected: true, departed: false }));
const ctx = { now: 1000, rng: () => 0.5, hostId: 'a' };
function view(state: Json): Record<string, Json> {
  const value = blindstop.publicView(state, players);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid projection');
  return value;
}
function reduce(state: Json, action: Json, actor: string | null, now: number): Json {
  const result = blindstop.reduce(state, action, { ...ctx, actor, now });
  if (!result.accepted) throw new Error(result.code);
  return JSON.parse(JSON.stringify(result.state)) as Json;
}
function init(rounds = 2, pace = 'manual', practice = false): Json {
  return blindstop.init({ ...ctx, players, settings: { rounds, pace, practice }, seed: 1 });
}
function complete(state: Json, errors: [number | null, number | null] = [0, 100]): Json {
  const started = reduce(state, { type: 'TICK' }, null, Number(view(state).startAt));
  let current = started;
  for (const [index, error] of errors.entries()) if (error !== null) current = reduce(current, { type: 'TAP', elapsedMs: Number(view(current).targetMs) + error }, players[index]!.id, Number(view(current).startAt) + 100);
  return view(current).phase === 'result' ? current : reduce(current, { type: 'TICK' }, null, Number(view(current).endsAt));
}

describe('full Blindstop', () => {
  it('advances real rounds durably and awards only at final, using completed count then quantized mean', () => {
    let state = complete(init(), [null, 1000]);
    expect(blindstop.isFinished(state)).toBe(false);
    expect(blindstop.scores(state)).toEqual({ a: 0, b: 0 });
    expect(blindstop.phase(state).endsAt).not.toBeNull();
    state = reduce(state, { type: 'NEXT' }, 'a', Number(view(state).startAt) + 20000);
    expect(blindstop.phase(state).roundId).toBe('2');
    expect(view(state).rows).toEqual([]);
    expect((view(state).history as Json[])).toHaveLength(1);
    state = complete(state, [0, 1000]);
    state = reduce(state, { type: 'NEXT' }, 'a', Number(view(state).startAt) + 20000);
    expect(view(state).phase).toBe('final');
    expect(blindstop.isFinished(state)).toBe(true);
    expect(blindstop.scores(state)).toEqual({ b: 2, a: 1 });
    expect(blindstop.phase(state).endsAt).toBeNull();
    expect(blindstop.reduce(state, { type: 'NEXT' }, { ...ctx, actor: 'a' }).accepted).toBe(false);
  });

  it('keeps practice unscored, then lets the current host begin round one', () => {
    let state = init(1, 'auto', true);
    expect(view(state).targetMs).toBe(6370);
    expect(blindstop.phase(state).roundId).toBe('practice');
    state = complete(state);
    expect(view(state).history).toEqual([]);
    expect(blindstop.scores(state)).toEqual({ a: 0, b: 0 });
    expect(Number(view(state).nextAt) - (Number(view(state).startAt) + 100)).toBe(900000);
    expect(blindstop.reduce(state, { type: 'START' }, { ...ctx, actor: 'b' })).toEqual({ accepted: false, code: 'room.hostOnly' });
    const started = blindstop.reduce(state, { type: 'START' }, { ...ctx, actor: 'b', hostId: 'b', now: Number(view(state).startAt) + 200 });
    expect(started.accepted).toBe(true);
    if (!started.accepted) return;
    state = started.state;
    expect(view(state).practice).toBe(false);
    expect(blindstop.phase(state).roundId).toBe('1');
    expect(view(state).submittedIds).toEqual([]);
  });

  it('enforces auto eight-second boundary, pause/resume, and generous paused safety deadline', () => {
    let state = complete(init(2, 'auto'));
    let deadline = Number(view(state).nextAt);
    const initialToken = blindstop.phase(state).token;
    expect(blindstop.reduce(state, { type: 'PAUSE' }, { ...ctx, actor: 'a', now: deadline }).accepted).toBe(false);
    expect(blindstop.reduce(state, { type: 'TICK' }, { ...ctx, actor: null, now: deadline - 1 }).accepted).toBe(false);
    state = reduce(state, { type: 'PAUSE' }, 'a', deadline - 2000);
    expect(view(state).paused).toBe(true);
    const pausedToken = blindstop.phase(state).token;
    expect(blindstop.reduce(state, { type: 'TICK' }, { ...ctx, actor: null, now: deadline }).accepted).toBe(false);
    state = reduce(state, { type: 'RESUME' }, 'a', deadline + 8000);
    expect(blindstop.phase(state).token).not.toBe(pausedToken);
    expect(blindstop.phase(state).token).not.toBe(initialToken);
    expect(view(state).nextAt).toBe(deadline + 10000);
    deadline = Number(view(state).nextAt);
    state = reduce(state, { type: 'TICK' }, null, deadline);
    expect(view(state).round).toBe(2);
    state = complete(state);
    state = reduce(state, { type: 'PAUSE' }, 'a', Number(view(state).nextAt) - 1);
    state = reduce(state, { type: 'TICK' }, null, Number(view(state).nextAt));
    expect(blindstop.isFinished(state)).toBe(true);
  });

  it('restores older paused states without a saved remaining duration', () => {
    let state = complete(init(1, 'auto'));
    const now = Number(view(state).nextAt) - 2000;
    state = reduce(state, { type: 'PAUSE' }, 'a', now);
    if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Expected state');
    delete state.autoRemainingMs;
    state = reduce(state, { type: 'RESUME' }, 'a', now + 10000);
    expect(view(state).nextAt).toBe(now + 18000);
  });

  it('generates mockup targets without duplicates or adjacent targets closer than 0.80 seconds', () => {
    let state = init(20);
    const targets: number[] = [];
    for (let round = 1; round <= 20; round++) {
      const target = Number(view(state).targetMs);
      expect(target).toBeGreaterThanOrEqual(3110);
      expect(target).toBeLessThanOrEqual(11890);
      expect((target / 10) % 5).not.toBe(0);
      if (targets.length) expect(Math.abs(target - targets.at(-1)!)).toBeGreaterThanOrEqual(800);
      targets.push(target);
      state = complete(state);
      state = reduce(state, { type: 'NEXT' }, 'a', Number(view(state).startAt) + 20000);
    }
    expect(new Set(targets).size).toBe(20);
    expect(blindstop.isFinished(state)).toBe(true);
  });

  it('reveals submitted identities but never unrevealed timing and restores legacy durable states', () => {
    let state = init();
    state = reduce(state, { type: 'TICK' }, null, Number(view(state).startAt));
    state = reduce(state, { type: 'TAP', elapsedMs: 4321 }, 'a', Number(view(state).startAt) + 10);
    expect(view(state).submittedIds).toEqual(['a']);
    expect(view(state).rows).toEqual([]);
    expect(view(state).history).toEqual([]);
    expect(JSON.stringify(view(state))).not.toContain('4321');
    const legacy = { roster: ['a', 'b'], targetMs: 7000, startAt: 4300, endsAt: 19300, phase: 'result', taps: { a: 7000, b: 7100 } };
    expect(blindstop.isFinished(legacy)).toBe(true);
    expect(blindstop.scores(legacy)).toEqual({ a: 2, b: 1 });
  });

  it('rejects invalid settings and scores rounded equal means as ties', () => {
    for (const settings of [{ rounds: 0 }, { rounds: 21 }, { rounds: 1.5 }, { rounds: 2, pace: 'fast' }, { rounds: 2, practice: 'true' }]) expect(blindstop.parseSettings(settings)).toBeNull();
    for (const settings of [{ rounds: 5, legacy: true }, { rounds: 1, practice: true, legacy: true }, { rounds: 1, pace: 'auto', legacy: true }]) expect(blindstop.parseSettings(settings)).toBeNull();
    const legacy = blindstop.parseSettings({ rounds: 1 });
    expect(legacy).toEqual({ rounds: 1, pace: 'manual', practice: false, legacy: true });
    expect(blindstop.parseSettings(legacy)).toEqual(legacy);
    let state = complete(init(1), [101, 104]);
    state = reduce(state, { type: 'NEXT' }, 'a', Number(view(state).startAt) + 20000);
    expect(blindstop.scores(state)).toEqual({ a: 2, b: 2 });
    expect(blindstop.parseAction({ type: 'NEXT', actor: 'a' })).toBeNull();
  });
});




