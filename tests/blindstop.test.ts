import { describe, expect, it } from 'vitest';
import { blindstop } from '../src/games/blindstop/engine';
const players = ['a', 'b'].map((id, i) => ({ id, name: id, faceId: 'face-01', tile: 'tYel', joinedAt: i, lastSeenAt: 0, connected: true, departed: false }));
const ctx = { now: 1000, rng: () => 0.5, hostId: 'a' };
describe('one-round Blindstop', () => {
  it('hides timings until result, guards duplicate taps and awards ties once per game-owned policy', () => {
    let state = blindstop.init({ ...ctx, players, settings: { rounds: 1 }, seed: 1 });
    const phase = blindstop.phase(state);
    const tick = blindstop.reduce(state, { type: 'TICK' }, { ...ctx, now: phase.endsAt!, actor: null });
    if (!tick.accepted) throw new Error('Expected tick');
    state = tick.state;
    const tapCtx = { ...ctx, now: phase.endsAt! + 1000, actor: 'a' };
    const tapped = blindstop.reduce(state, { type: 'TAP', elapsedMs: 7000 }, tapCtx);
    if (!tapped.accepted) throw new Error('Expected tap');
    state = tapped.state;
    expect(JSON.stringify(blindstop.publicView(state, players))).not.toContain('7000');
    expect(blindstop.privateView(state, 'a')).toEqual({ submitted: true });
    expect(blindstop.reduce(state, { type: 'TAP', elapsedMs: 8000 }, tapCtx)).toEqual({ accepted: false, code: 'action.alreadySubmitted' });
    const finished = blindstop.reduce(state, { type: 'TAP', elapsedMs: 7000 }, { ...tapCtx, actor: 'b' });
    if (!finished.accepted) throw new Error('Expected second tap');
    expect(blindstop.isFinished(finished.state)).toBe(true);
    expect(blindstop.scores(finished.state)).toEqual({ a: 2, b: 2 });
  });
  it('times out missing players without fabricated penalties or awards', () => {
    const state = blindstop.init({ ...ctx, players, settings: { rounds: 1 }, seed: 1 });
    const tick = blindstop.reduce(state, { type: 'TICK' }, { ...ctx, now: 100000, actor: null });
    if (!tick.accepted) throw new Error('Expected tick');
    expect(blindstop.isFinished(tick.state)).toBe(true);
    expect(blindstop.scores(tick.state)).toEqual({ a: 0, b: 0 });
  });
  it('rejects malformed, nonfinite, injected actors, early and late taps', () => {
    for (const raw of [{ type: 'TAP', elapsedMs: Infinity }, { type: 'TAP', elapsedMs: -1 }, { type: 'TAP', elapsedMs: 10, actor: 'b' }, { type: 'TICK' }]) expect(blindstop.parseAction(raw)).toBeNull();
    const state = blindstop.init({ ...ctx, players, settings: { rounds: 1 }, seed: 1 });
    expect(blindstop.reduce(state, { type: 'TAP', elapsedMs: 10 }, { ...ctx, actor: 'a' }).accepted).toBe(false);
    expect(blindstop.reduce(state, { type: 'TAP', elapsedMs: 10 }, { ...ctx, now: 100000, actor: 'a' }).accepted).toBe(false);
  });
});
