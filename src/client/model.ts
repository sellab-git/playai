import type { Command, Snapshot, Json } from '../engine';

export interface UiModel {
  snapshot: Snapshot | null;
  connected: boolean;
  calibrated: boolean;
  pending: boolean;
  admissionPending?: boolean;
  persistenceWarning?: string | null;
  settingsDraft?: { gameId: string; settings: Json } | null;
  error: string | null;
  delivery: string | null;
  savedRoomCode: string | null;
  now: number;
  serverToLocal(serverTimestamp: number): number;
}
export interface UiActions {
  create(name: string, faceId: string): void;
  join(code: string, name: string, faceId: string): void;
  resume(): void;
  send(command: Command): void;
  fresh(): void;
}
