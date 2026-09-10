/** Provider-independent contracts. Authoritative game state never crosses transport. */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type PlayerId = string;
export interface Player {
  id: PlayerId;
  name: string;
  faceId: string;
  tile: string;
  joinedAt: number;
  lastSeenAt: number;
  connected: boolean;
  departed: boolean;
}
export interface RoomState {
  code: string;
  createdAt: number;
  hostId: PlayerId | null;
  players: Player[];
  status: 'lobby' | 'playing' | 'completed' | 'closed';
  gameId: string | null;
  totals: Record<PlayerId, number>;
  gamesPlayed: number;
  /** Accepted starts, including aborted games; absent in older saved rooms. */
  gamesStarted?: number;
  /** Generic preparation, retained between games; absent in legacy rooms. */
  setup?: { gameId: string; settings: Json } | null;
}
export interface GameManifest<C = Json> {
  id: string;
  nameKey: string;
  taglineKey: string;
  markId: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedMinutes: [number, number];
  defaultSettings: C;
  awardPolicy: 'ranked' | 'team';
}
export interface Ctx {
  now: number;
  rng: () => number;
  hostId: PlayerId | null;
}
export interface InitCtx<C> extends Ctx {
  players: Player[];
  settings: C;
  seed: number;
}
export interface ActionCtx extends Ctx {
  /** Null identifies a server-only deadline event, never a client identity. */
  actor: PlayerId | null;
}
export type SystemAction = { type: 'TICK' };
export interface GamePhase {
  name: string;
  /** Unique transition token, including turns within a phase name. */
  token: string;
  roundId: string;
  endsAt: number | null;
}
export type Reduction<S> =
  | { accepted: true; state: S }
  | { accepted: false; code: string };
export interface GameEngine<S, A, C> {
  manifest: GameManifest<C>;
  parseSettings(raw: unknown): C | null;
  parseAction(raw: unknown): A | null;
  init(ctx: InitCtx<C>): S;
  /** Pure, total; semantic rejections are explicit and keyed. */
  reduce(state: S, action: A | SystemAction, ctx: ActionCtx): Reduction<S>;
  publicView(state: S, players: Player[]): Json;
  privateView(state: S, playerId: PlayerId): Json;
  phase(state: S): GamePhase;
  isFinished(state: S): boolean;
  /** Exactly the frozen roster, integer 0..N awards. Game owns ranked/team policy. */
  scores(state: S): Record<PlayerId, number>;
}
/** Runtime interface. Use registerGame to retain concrete game types safely. */
export type GameEntry = GameEngine<Json, Json, Json>;
export function registerGame<S extends Json, A extends Json, C extends Json>(
  engine: GameEngine<S, A, C>, decode: (raw: Json) => S | null,
): GameEntry {
  const state = (raw: Json): S => {
    const value = decode(raw);
    if (value === null) throw new Error('Invalid durable game state');
    return value;
  };
  return {
    manifest: engine.manifest,
    parseSettings: engine.parseSettings,
    parseAction: engine.parseAction,
    init: ctx => {
      const settings = engine.parseSettings(ctx.settings);
      if (settings === null) throw new Error('Invalid stored game settings');
      return engine.init({ ...ctx, settings });
    },
    reduce: (raw, action, ctx) => {
      const parsed = ctx.actor === null ? { type: 'TICK' as const } : engine.parseAction(action);
      return parsed === null ? { accepted: false, code: 'action.invalid' } : engine.reduce(state(raw), parsed, ctx);
    },
    publicView: (raw, players) => engine.publicView(state(raw), players),
    privateView: (raw, playerId) => engine.privateView(state(raw), playerId),
    phase: raw => engine.phase(state(raw)),
    isFinished: raw => engine.isFinished(state(raw)),
    scores: raw => engine.scores(state(raw)),
  };
}
export interface GameScope {
  gameInstanceId: string;
  phaseEpoch: number;
  roundId: string;
}
export type Command =
  | { type: 'configure'; setup: { gameId: string; settings: Json } | null }
  | { type: 'profile'; profile: { name: string; faceId: string } }
  | { type: 'start'; gameId: string; settings: Json }
  | { type: 'action'; scope: GameScope; payload: Json }
  | { type: 'lobby'; destination?: 'catalogue' | 'preparation' }
  | { type: 'abort' | 'leave' | 'close' }
  | { type: 'kick'; playerId: PlayerId };
export interface Intent {
  actionId: string;
  command: Command;
}
export interface Acknowledgement {
  actionId: string;
  accepted: boolean;
  code: string;
  version: number;
}
export interface GameSnapshot {
  gameId: string;
  scope: GameScope;
  phase: GamePhase;
  public: Json;
  private: Json;
}
export interface Snapshot {
  version: number;
  /** Latest durable outcome for this recipient only, resolving a lost direct reply. */
  acknowledgement: Acknowledgement | null;
  room: RoomState;
  selfId: PlayerId;
  game: GameSnapshot | null;
  notice: string | null;
}
export type ServerMessage =
  | { type: 'state'; snapshot: Snapshot }
  | { type: 'ack'; ack: Acknowledgement }
  | { type: 'clock'; t0: number; serverNow: number }
  | { type: 'error'; code: string };

// Runner-first acceptance: docs/production/runner-acceptance.md R01–R24.
// Authenticate before retry lookup. Persist state + outcomes + awards atomically
// before reply. At equality deadlines precede intents. Completed results cannot abort.
