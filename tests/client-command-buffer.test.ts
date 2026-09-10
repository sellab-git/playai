import { describe, expect, it } from 'vitest';
import type { Command } from '../src/engine';
import { CommandBuffer } from '../src/client/command-buffer';

const settings = (rounds: number, gameId = 'test'): Command => ({ type: 'configure', setup: { gameId, settings: { rounds } } });
const start: Command = { type: 'start', gameId: 'test', settings: { rounds: 10, practice: true } };

describe('preparation command buffer', () => {
  it('sends idle commands directly, coalesces rapid edits and starts with the latest settings exactly once', () => {
    const buffer = new CommandBuffer();
    const active = settings(3);
    expect(buffer.submit(active, null, true)).toBe('send');
    expect(buffer.submit(settings(5), active, true)).toBe('queued');
    expect(buffer.submit(settings(10), active, true)).toBe('queued');
    expect(buffer.submit(start, active, false)).toBe('queued');
    expect(buffer.queuedCommands()).toEqual([settings(10), start]);
    expect(buffer.submit(start, active, false)).toBe('reject');
    expect(buffer.submit(settings(20), active, true)).toBe('reject');
    expect(buffer.takeNext()).toEqual(settings(10));
    expect(buffer.takeNext()).toEqual(start);
    expect(buffer.takeNext()).toBeNull();
  });

  it('preserves game-derived start settings while waiting for acknowledgement', () => {
    const buffer = new CommandBuffer();
    expect(buffer.submit(start, settings(15), false)).toBe('queued');
    expect(buffer.takeNext()).toEqual(start);
  });

  it('cancels unsent edits and start after failure or context loss', () => {
    const buffer = new CommandBuffer();
    buffer.submit(settings(5), settings(3), true);
    buffer.submit(start, settings(3), false);
    buffer.clear();
    expect(buffer.queuedCommands()).toEqual([]);
    expect(buffer.takeNext()).toBeNull();
    expect(buffer.submit(start, null, false)).toBe('send');
  });

  it('never buffers game actions or mismatched settings edits', () => {
    const buffer = new CommandBuffer();
    const action: Command = { type: 'action', scope: { gameInstanceId: 'a', phaseEpoch: 1, roundId: 'r' }, payload: { type: 'tap' } };
    for (const command of [action, { type: 'close' } as Command, settings(5, 'other'), { ...start, gameId: 'other' }, { type: 'configure', setup: null } as Command]) {
      expect(buffer.submit(command, settings(3), true)).toBe('reject');
    }
    expect(buffer.submit(settings(5), action, true)).toBe('reject');
    expect(buffer.submit(action, action, false)).toBe('reject');
    expect(buffer.takeNext()).toBeNull();
  });

  it('orders one room command after settings without changing its payload', () => {
    const commands: Command[] = [
      { type: 'close' }, { type: 'leave' }, { type: 'abort' }, { type: 'lobby', destination: 'catalogue' },
      { type: 'kick', playerId: 'guest' }, { type: 'profile', profile: { name: 'Ada', faceId: 'face01' } },
      settings(5, 'other'), { type: 'configure', setup: null }, { ...start, gameId: 'other' },
    ];
    for (const command of commands) {
      const buffer = new CommandBuffer();
      buffer.submit(settings(10), settings(3), true);
      expect(buffer.submit(command, settings(3), false)).toBe('queued');
      expect(buffer.hasBarrier).toBe(true);
      expect(buffer.submit(command, settings(3), false)).toBe('reject');
      expect(buffer.takeNext()).toEqual(settings(10));
      expect(buffer.takeNext()).toEqual(command);
      expect(buffer.hasBarrier).toBe(false);
      expect(buffer.takeNext()).toBeNull();
    }
  });

  it('captures queued values rather than later mutation of a form draft', () => {
    const buffer = new CommandBuffer();
    const draft = { type: 'configure' as const, setup: { gameId: 'test', settings: { rounds: 5 } } };
    buffer.submit(draft, settings(3), true);
    draft.setup.settings.rounds = 20;
    expect(buffer.takeNext()).toEqual(settings(5));
  });
});
