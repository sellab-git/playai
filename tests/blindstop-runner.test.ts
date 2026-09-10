import { describe, expect, it } from 'vitest';
import { RoomRunner } from '../src/room/runner';
import { blindstop } from '../src/games/blindstop/engine';
import type { Connection, DurableRecord } from '../src/room/types';
import type { GameScope, Intent, Json } from '../src/engine';
import { harness, profile } from './fixtures';

function setup(pace: 'manual' | 'auto' = 'manual', count = 2, practice = false) {
  const clock = harness();
  const deps = { ...clock.deps, games: { blindstop } };
  const runner = new RoomRunner(null, deps);
  runner.create('ABCDE');
  const connections: Connection[] = [];
  for (const [index, name] of ['Ada', 'Ben'].slice(0, count).entries()) {
    const credential = String(index + 1).repeat(64);
    const joined = runner.join(profile(name), credential);
    if (!joined.ok) throw new Error(joined.code);
    const connected = runner.connect(credential);
    if (!connected.ok) throw new Error(connected.code);
    connections.push(connected.value);
    runner.ready(connected.value);
  }
  expect(runner.intent(connections[0]!, { actionId: 'start', command: { type: 'start', gameId: 'blindstop', settings: { rounds: 2, pace, practice } } }).accepted).toBe(true);
  return { runner, deps, clock, connections };
}
type Setup = ReturnType<typeof setup>;
function projection(s: Setup): Record<string, Json> {
  const value = s.runner.snapshot(s.connections[0]!)?.game?.public;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected public projection');
  return value;
}
function scope(s: Setup): GameScope {
  const value = s.runner.snapshot(s.connections[0]!)?.game?.scope;
  if (!value) throw new Error('Expected scope');
  return value;
}
function action(s: Setup, actionId: string, payload: Json, savedScope = scope(s)): Intent {
  return { actionId, command: { type: 'action', scope: savedScope, payload } };
}
function restore(s: Setup): void {
  s.runner = new RoomRunner(JSON.parse(JSON.stringify(s.runner.record)) as DurableRecord, s.deps);
}
function completeRound(s: Setup): void {
  const round = Number(projection(s).round);
  s.clock.setNow(Number(projection(s).startAt));
  s.runner.advance();
  const targetMs = Number(projection(s).targetMs);
  for (let index = 0; index < s.connections.length; index++) {
    expect(s.runner.intent(s.connections[index]!, action(s, `tap-${round}-${index}`, { type: 'TAP', elapsedMs: targetMs + index * 100 })).accepted).toBe(true);
  }
  expect(projection(s).phase).toBe('result');
}
function room(s: Setup) {
  const record = s.runner.record;
  if (record?.kind !== 'room') throw new Error('Expected room record');
  return record.value;
}

describe('full Blindstop through RoomRunner', () => {
  it.each([1, 2])('keeps manual results visible for %i players across alarms and restoration until the host continues', count => {
    const s = setup('manual', count);
    const oldRoundDeadline = Number(projection(s).endsAt);
    completeRound(s);
    const revealedAt = s.clock.now();
    const resultScope = scope(s);
    const history = projection(s).history;
    expect(projection(s).pace).toBe('manual');
    expect(projection(s).nextAt).toBe(revealedAt + 15 * 60 * 1000);
    expect(s.runner.nextAlarm).toBe(revealedAt + 15 * 60 * 1000);
    for (const now of [revealedAt, revealedAt + 8000, oldRoundDeadline, revealedAt + 15 * 60 * 1000 - 1]) {
      s.clock.setNow(now);
      restore(s);
      s.runner.advance();
      s.runner.advance();
      expect(projection(s).phase).toBe('result');
      expect(projection(s).round).toBe(1);
      expect(projection(s).history).toEqual(history);
      expect(scope(s)).toEqual(resultScope);
      expect(room(s).room.gamesPlayed).toBe(0);
    }
    expect(s.runner.intent(s.connections[0]!, action(s, 'explicit-manual-next', { type: 'NEXT' })).accepted).toBe(true);
    expect(projection(s).phase).toBe('countdown');
    expect(projection(s).round).toBe(2);
  });

  it('plays solo practice and multiple real rounds, awards one point and replays with real deadlines', () => {
    const s = setup('manual', 1, true);
    expect(room(s).game?.roster).toEqual([s.connections[0]!.playerId]);
    expect(room(s).insufficientDeadline).toBeNull();
    expect(projection(s).practice).toBe(true);
    expect(projection(s).targetMs).toBe(6370);
    completeRound(s);
    expect(projection(s).history).toEqual([]);
    expect(Object.values(room(s).room.totals)).toEqual([0]);
    expect(s.runner.intent(s.connections[0]!, action(s, 'start-real', { type: 'START' })).accepted).toBe(true);
    completeRound(s);
    expect(s.runner.intent(s.connections[0]!, action(s, 'solo-next', { type: 'NEXT' })).accepted).toBe(true);
    restore(s);
    completeRound(s);
    expect(s.runner.intent(s.connections[0]!, action(s, 'solo-final', { type: 'NEXT' })).accepted).toBe(true);
    expect(projection(s).phase).toBe('final');
    expect(Object.values(room(s).room.totals)).toEqual([1]);
    expect(room(s).room.gamesPlayed).toBe(1);
    expect(s.runner.intent(s.connections[0]!, { actionId: 'replay-lobby', command: { type: 'lobby' } }).accepted).toBe(true);
    expect(s.runner.intent(s.connections[0]!, { actionId: 'replay-start', command: { type: 'start', gameId: 'blindstop', settings: { rounds: 1, pace: 'auto', practice: false } } }).accepted).toBe(true);
    expect(projection(s).practice).toBe(false);
    s.clock.setNow(Number(projection(s).endsAt));
    s.runner.advance();
    expect(projection(s).phase).toBe('result');
    expect(projection(s).rows).toEqual([{ playerId: s.connections[0]!.playerId, elapsedMs: null, errorMs: null, rank: 1, award: 0 }]);
    s.clock.setNow(Number(projection(s).nextAt));
    s.runner.advance();
    expect(projection(s).phase).toBe('final');
    expect(room(s).room.gamesPlayed).toBe(2);
    expect(Object.values(room(s).room.totals)).toEqual([1]);
  });

  it('retains ordinary disconnect recovery and insufficient-player abort for solo games', () => {
    const s = setup('manual', 1);
    completeRound(s);
    s.runner.disconnect(s.connections[0]!);
    const deadline = room(s).insufficientDeadline!;
    expect(deadline).toBe(s.clock.now() + 60000);
    restore(s);
    s.clock.setNow(deadline - 1);
    const recovered = s.runner.connect('1'.repeat(64));
    if (!recovered.ok) throw new Error(recovered.code);
    s.connections[0] = recovered.value;
    s.runner.ready(recovered.value);
    expect(room(s).insufficientDeadline).toBeNull();
    expect(projection(s).phase).toBe('result');
    s.runner.disconnect(recovered.value);
    const newDeadline = room(s).insufficientDeadline!;
    s.clock.setNow(newDeadline);
    s.runner.advance();
    expect(room(s).game).toBeNull();
    expect(room(s).room.status).toBe('lobby');
    expect(room(s).notice).toBe('game.insufficientPlayers');
    expect(room(s).room.gamesPlayed).toBe(0);
    expect(Object.values(room(s).room.totals)).toEqual([0]);
  });
  it('persists multiple rounds and reconnects with retained history, private tap and frozen targets', () => {
    const s = setup();
    completeRound(s);
    const history = projection(s).history;
    const next = action(s, 'next-1', { type: 'NEXT' });
    expect(s.runner.intent(s.connections[0]!, next).accepted).toBe(true);
    const target = projection(s).targetMs;
    restore(s);
    s.runner.disconnect(s.connections[1]!);
    const connected = s.runner.connect('2'.repeat(64));
    if (!connected.ok) throw new Error(connected.code);
    s.connections[1] = connected.value;
    s.runner.ready(connected.value);
    expect(projection(s).round).toBe(2);
    expect(projection(s).targetMs).toBe(target);
    expect(projection(s).history).toEqual(history);
    expect(s.runner.snapshot(connected.value)?.game?.private).toEqual({ submitted: false });
    s.clock.setNow(Number(projection(s).startAt));
    s.runner.advance();
    expect(s.runner.intent(connected.value, action(s, 'second-round-tap', { type: 'TAP', elapsedMs: Number(target) })).accepted).toBe(true);
    restore(s);
    expect(s.runner.snapshot(connected.value)?.game?.private).toEqual({ submitted: true });
    expect(projection(s).rows).toEqual([]);
    expect(room(s).room.gamesPlayed).toBe(0);
  });

  it('replays a lost NEXT acknowledgement after JSON restoration without advancing twice', () => {
    const s = setup();
    completeRound(s);
    const request = action(s, 'next-lost', { type: 'NEXT' });
    const acknowledgement = s.runner.intent(s.connections[0]!, request);
    expect(acknowledgement.accepted).toBe(true);
    const transition = room(s).game?.transition;
    restore(s);
    expect(s.runner.intent(s.connections[0]!, request)).toEqual(acknowledgement);
    expect(room(s).game?.transition).toBe(transition);
    expect(projection(s).round).toBe(2);
  });

  it('rejects an old PAUSE scope after PAUSE, RESUME and restore while retrying the original acknowledgement', () => {
    const s = setup('auto');
    completeRound(s);
    const oldScope = scope(s);
    const originalDeadline = Number(projection(s).nextAt);
    s.clock.setNow(originalDeadline - 2000);
    const pause = action(s, 'pause', { type: 'PAUSE' }, oldScope);
    const acknowledgement = s.runner.intent(s.connections[0]!, pause);
    expect(acknowledgement.accepted).toBe(true);
    restore(s);
    s.clock.setNow(originalDeadline + 8000);
    expect(s.runner.intent(s.connections[0]!, action(s, 'resume', { type: 'RESUME' })).accepted).toBe(true);
    restore(s);
    expect(s.runner.intent(s.connections[0]!, action(s, 'stale-pause', { type: 'PAUSE' }, oldScope)).code).toBe('game.staleScope');
    expect(s.runner.intent(s.connections[0]!, pause)).toEqual(acknowledgement);
    expect(projection(s).paused).toBe(false);
    expect(projection(s).nextAt).toBe(originalDeadline + 10000);
    s.clock.setNow(Number(projection(s).nextAt));
    s.runner.advance();
    expect(projection(s).round).toBe(2);
  });

  it('applies final awards exactly once across final NEXT replay, restart, reads and alarms', () => {
    const s = setup();
    completeRound(s);
    expect(s.runner.intent(s.connections[0]!, action(s, 'next', { type: 'NEXT' })).accepted).toBe(true);
    completeRound(s);
    expect(Object.values(room(s).room.totals)).toEqual([0, 0]);
    const final = action(s, 'finish', { type: 'NEXT' });
    const acknowledgement = s.runner.intent(s.connections[0]!, final);
    expect(acknowledgement.accepted).toBe(true);
    expect(projection(s).phase).toBe('final');
    expect(room(s).room.gamesPlayed).toBe(1);
    expect(Object.values(room(s).room.totals)).toEqual([2, 1]);
    restore(s);
    expect(s.runner.intent(s.connections[0]!, final)).toEqual(acknowledgement);
    s.runner.advance(); s.runner.advance();
    s.runner.snapshot(s.connections[1]!);
    expect(room(s).room.gamesPlayed).toBe(1);
    expect(Object.values(room(s).room.totals)).toEqual([2, 1]);
    expect(Object.keys(room(s).awards)).toHaveLength(1);
  });

  it('restores an old active one-round durable state and completes it without duplicate awards', () => {
    const s = setup();
    const record = s.runner.record;
    if (record?.kind !== 'room' || !record.value.game) throw new Error('Expected stored game');
    const game = record.value.game;
    game.state = { roster: game.roster, targetMs: 7000, startAt: 4300, endsAt: 19300, phase: 'round', taps: {} };
    game.phaseToken = blindstop.phase(game.state).token;
    record.value.alarm = { at: 19300, gameInstanceId: game.id, phaseEpoch: game.phaseEpoch };
    s.runner = new RoomRunner(JSON.parse(JSON.stringify(record)) as DurableRecord, s.deps);
    s.clock.setNow(5000);
    for (let index = 0; index < 2; index++) expect(s.runner.intent(s.connections[index]!, action(s, `legacy-${index}`, { type: 'TAP', elapsedMs: 7000 })).accepted).toBe(true);
    expect(room(s).room.gamesPlayed).toBe(1);
    expect(Object.values(room(s).room.totals)).toEqual([2, 2]);
    restore(s);
    s.runner.advance();
    expect(room(s).room.gamesPlayed).toBe(1);
  });
});
