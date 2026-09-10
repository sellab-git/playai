import { describe, expect, it } from 'vitest';
import { RoomRunner } from '../src/room/runner';
import { harness, profile } from './fixtures';
import { newerSnapshot, parseMessage, pendingOutcome } from '../src/client/protocol';
describe('client delivery and snapshot boundary', () => {
  it('recovers own outcome from full state without revealing it to another member', () => {
    const h = harness(), runner = new RoomRunner(null, h.deps); runner.create('ABCDE');
    const hash = 'a'.repeat(64), hash2 = 'b'.repeat(64);
    runner.join(profile('A'), hash); runner.join(profile('B'), hash2);
    const a = runner.connect(hash), b = runner.connect(hash2); if (!a.ok || !b.ok) throw new Error('setup');
    const before = runner.snapshot(a.value)!;
    const pending = { actionId: 'lost-reply', command: { type: 'abort' as const } };
    const ack = runner.intent(a.value, pending);
    const after = runner.snapshot(a.value)!;
    expect(pendingOutcome(pending, after.acknowledgement)).toEqual(ack);
    expect(runner.snapshot(b.value)!.acknowledgement).toBeNull();
    expect(newerSnapshot(after, before)).toBe(after);
    expect(pendingOutcome({ ...pending, actionId: 'other' }, after.acknowledgement)).toBeNull();
    expect(parseMessage(JSON.stringify({ type: 'state', snapshot: after }))).not.toBeNull();
    expect(parseMessage('{"type":"state","snapshot":{"version":99}}')).toBeNull();
  });
});
