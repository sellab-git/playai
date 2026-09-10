import type { Acknowledgement, GameEntry, GamePhase, Json, PlayerId, RoomState } from '../engine';

export interface Membership {
  credentialHash: string;
  generation: number;
  revoked: boolean;
  ready: boolean;
}
export interface SafeResult {
  public: Json;
  private: Record<PlayerId, Json>;
  phase: GamePhase;
}
export interface GameInstance {
  id: string;
  gameId: string;
  roster: PlayerId[];
  phaseEpoch: number;
  phaseToken: string;
  state: Json;
  seed: number;
  /** Advances only on accepted reductions; retries/rejections consume no randomness. */
  transition: number;
  status: 'active' | 'completed';
  result: SafeResult | null;
}
export interface StoredOutcome {
  fingerprint: string;
  ack: Acknowledgement;
}
export interface AlarmScope {
  at: number;
  gameInstanceId: string | null;
  phaseEpoch: number | null;
}
export interface Aggregate {
  version: number;
  room: RoomState;
  memberships: Record<PlayerId, Membership>;
  game: GameInstance | null;
  /** Membership ID then logical action ID; independent of connection generation. */
  outcomes: Record<PlayerId, Record<string, StoredOutcome>>;
  awards: Record<string, Record<PlayerId, number>>;
  hostDeadline: number | null;
  insufficientDeadline: number | null;
  alarm: AlarmScope | null;
  notice: string | null;
  lastActivity: number;
}
export type DurableRecord = { kind: 'room'; value: Aggregate } | { kind: 'tombstone' };
export interface Connection { playerId: PlayerId; generation: number }
export interface RunnerDependencies {
  now: () => number;
  id: () => string;
  seed: () => number;
  games: Readonly<Record<string, GameEntry>>;
}
/** A provider commits aggregate/tombstone + scheduled alarm atomically before output. */
export interface RoomStorage {
  load(): Promise<DurableRecord | null>;
  commit(record: DurableRecord, alarmAt: number | null): Promise<void>;
}
