import { z } from 'zod';
import type { Acknowledgement, Intent, ServerMessage, Snapshot } from '../engine';
const acknowledgement = z.object({ actionId: z.string(), accepted: z.boolean(), code: z.string(), version: z.number().int() });
const player = z.object({ id: z.string(), name: z.string(), faceId: z.string(), tile: z.string(), joinedAt: z.number(), lastSeenAt: z.number(), connected: z.boolean(), departed: z.boolean() });
const phase = z.object({ name: z.string(), token: z.string(), roundId: z.string(), endsAt: z.number().nullable() });
export const snapshotSchema: z.ZodType<Snapshot> = z.object({
  version: z.number().int().nonnegative(), selfId: z.string(), notice: z.string().nullable(),
  acknowledgement: acknowledgement.nullable(),
  room: z.object({ code: z.string(), createdAt: z.number(), hostId: z.string().nullable(), players: z.array(player), status: z.enum(['lobby', 'playing', 'completed', 'closed']), gameId: z.string().nullable(), totals: z.record(z.string(), z.number()), gamesPlayed: z.number().int(), gamesStarted: z.number().int().nonnegative().optional(), setup: z.object({ gameId: z.string(), settings: z.json() }).nullable().optional() }),
  game: z.object({ gameId: z.string(), scope: z.object({ gameInstanceId: z.string(), phaseEpoch: z.number().int(), roundId: z.string() }), phase, public: z.json(), private: z.json() }).nullable(),
});
const messageSchema: z.ZodType<ServerMessage> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('state'), snapshot: snapshotSchema }),
  z.object({ type: z.literal('ack'), ack: z.object({ actionId: z.string(), accepted: z.boolean(), code: z.string(), version: z.number().int() }) }),
  z.object({ type: z.literal('clock'), t0: z.number(), serverNow: z.number() }),
  z.object({ type: z.literal('error'), code: z.string() }),
]);
export function parseMessage(raw: string): ServerMessage | null {
  try { const result = messageSchema.safeParse(JSON.parse(raw)); return result.success ? result.data : null; } catch { return null; }
}
export function newerSnapshot(current: Snapshot | null, next: Snapshot): Snapshot {
  return current && current.version >= next.version ? current : next;
}
export function pendingOutcome(pending: Intent | null, ack: Acknowledgement | null): Acknowledgement | null {
  return pending && ack?.actionId === pending.actionId ? ack : null;
}
