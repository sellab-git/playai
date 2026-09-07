/**
 * Blindstop — the contract every game in this codebase implements.
 *
 * Read `docs/ARCHITECTURE.md` first. This file is the shape, not an
 * implementation; Blindstop itself is one game that fills it in.
 *
 * Two things in here are load-bearing and neither is obvious:
 *
 *  1. The room is not the game. Players, the host, the code and the running
 *     score across an evening belong to the room and survive a game ending.
 *     A game is a cartridge: it is loaded, played and unloaded, and everything
 *     inside it is thrown away. Mixing the two is the mistake that makes the
 *     second game a rewrite instead of two days' work.
 *
 *  2. The engine is pure. No Date.now(), no Math.random(), no I/O, no throwing.
 *     Time and randomness arrive in `ctx`. That is the only reason a whole
 *     session can be replayed deterministically in a test.
 *
 * The runner around this — sockets, storage, alarms — is where the bugs are.
 * Test that first. Cases are listed at the bottom of this file.
 */

export type PlayerId = string;

/* ------------------------------------------------------------------ *
 * Room — owned by the platform core. No game may modify these.       *
 * ------------------------------------------------------------------ */

export interface Player {
  id: PlayerId;
  name: string;
  faceId: string;
  /** Token name, e.g. "tYel". The player's identity colour, stable for the room. */
  tile: string;
  joinedAt: number;
  /** Last ping. The room's lifetime is derived from the newest of these. */
  lastSeenAt: number;
}

export interface RoomState {
  code: string;
  createdAt: number;
  hostId: PlayerId;
  players: Player[];
  status: "lobby" | "playing";
  /** null in the lobby. The id of the loaded game while playing. */
  gameId: string | null;
  /**
   * The evening's table. Accumulated from `scores()` after each finished game,
   * never touched while a game is running. This is what survives a game ending
   * and what the closing summary is built from.
   */
  totals: Record<PlayerId, number>;
  gamesPlayed: number;
}

/* ------------------------------------------------------------------ *
 * Game manifest — the card the lobby's picker renders from.          *
 * ------------------------------------------------------------------ */

export interface GameManifest<C = unknown> {
  /** Stable forever. It is written into room records; renaming it orphans them. */
  id: string;
  /** i18n keys, never literal copy. See ARCHITECTURE.md, fixed decision 4. */
  nameKey: string;
  taglineKey: string;
  /**
   * Symbol id in the hand-drawn ink sprite. Deliberately not an emoji and not a
   * colour: `docs/DESIGN.md` allows colour in avatar tiles and the highlighter
   * and nowhere else, so a per-game accent would break the design language.
   */
  markId: string;
  minPlayers: number;
  maxPlayers: number;
  /** Shown on the card as a range, e.g. [3, 5] → "3–5 min". */
  estimatedMinutes: [number, number];
  defaultSettings: C;
}

/* ------------------------------------------------------------------ *
 * Context — the only way time, randomness and identity enter a game.  *
 * ------------------------------------------------------------------ */

export interface Ctx {
  /** Milliseconds, server clock. Supplied by the runner, never read in here. */
  now: number;
  /** Seeded PRNG. Never Math.random. */
  rng: () => number;
}

export interface InitCtx<C> extends Ctx {
  players: Player[];
  settings: C;
  /** Stored with the game state so a session can be replayed exactly. */
  seed: number;
}

export interface ActionCtx extends Ctx {
  /**
   * Who acted, already authenticated by the runner against the socket.
   *
   * The actor is in the context and not in the action on purpose: an action
   * carrying its own player id is a claim the client makes, and every engine
   * would then have to remember to check it. Here it cannot be forged.
   *
   * "__system__" for actions the runner injects, i.e. TICK.
   */
  actor: PlayerId | "__system__";
}

/** Injected by the runner when a phase alarm fires. Never sent by a client. */
export type SystemAction = { type: "TICK" };

/** A game's own phase. Names are the game's business; the room has no opinion. */
export interface GamePhase {
  name: string;
  /** Absolute server time the phase ends, or null for no deadline. */
  endsAt: number | null;
}

/* ------------------------------------------------------------------ *
 * The engine contract.                                                *
 * ------------------------------------------------------------------ */

export interface GameEngine<S, A, C> {
  manifest: GameManifest<C>;

  /**
   * Validates a raw client message into an action. Returns null if it is not a
   * legal action for this game — the runner then answers with an error code
   * rather than passing it on. Zod is the expected implementation.
   *
   * This is the system boundary. Nothing reaches `reduce` unvalidated.
   */
  parseAction(raw: unknown): A | null;

  init(ctx: InitCtx<C>): S;

  /**
   * Pure and total. An action that is legal in shape but not allowed right now
   * — a second tap, a tap from a dead player — returns the state unchanged.
   *
   * The player is not left guessing: the runner checks membership, phase and
   * duplicates before calling, and answers those with an error code. `reduce`
   * returning state unchanged is the last line, not the only one.
   */
  reduce(state: S, action: A | SystemAction, ctx: ActionCtx): S;

  /** Safe to send to every device in the room. Nothing secret may pass through. */
  publicView(state: S, players: Player[]): unknown;

  /** Sent to one player only: their role, their card, their score before reveal. */
  privateView(state: S, playerId: PlayerId): unknown;

  phase(state: S): GamePhase;

  isFinished(state: S): boolean;

  /**
   * Points this game contributes to the room's running total, per player.
   *
   * These must be comparable across games. The engine converts its own outcome
   * — milliseconds off, letters guessed, nights survived — into points on one
   * shared scale. Never return a raw game metric: an average error in
   * milliseconds added to a word score is a meaningless evening table.
   *
   * The shared scale is placement. With N players the winner gets N points and
   * last place gets 1; tied players share the higher figure. A game that wants
   * to reward a near-miss does it inside its own result screen, not here.
   */
  scores(state: S): Record<PlayerId, number>;
}

/* ------------------------------------------------------------------ *
 * The registry.                                                       *
 * ------------------------------------------------------------------ */

/**
 * Adding a game is one folder under `src/games/<id>/` and one entry here.
 * No conditionals anywhere in the core: nothing outside a game's own folder may
 * ever read `gameId` and branch on it. If the core seems to need a change to
 * fit a new game, stop and fix the contract for every game instead.
 *
 * Screen components are registered separately and lazily, because this file has
 * to be importable on the server where React is not. That second registry is
 * the only permitted duplication, and a contract test asserts that every id
 * here has a view there — a game silently missing from one list is the failure
 * mode this arrangement is designed to make impossible.
 */
export interface GameEntry {
  manifest: GameManifest<unknown>;
  engine: GameEngine<unknown, unknown, unknown>;
}

/**
 * Runner test cases. Not hypothetical — every one of these is a defect found in
 * a comparable production codebase, and half of them were found after launch:
 *
 *  - two TAPs from one player in one round
 *  - a TAP arriving after the phase has already closed
 *  - a TAP from a player id that is not in the room
 *  - two TICKs firing concurrently
 *  - the host leaving mid-round, and the room continuing
 *  - START from someone who is not the host
 *  - a player rejoining mid-game and keeping their score
 *  - a phase with no deadline that is waiting on a player who has gone
 *  - returning to the lobby: game state gone, room totals intact
 *  - the same action delivered twice by a retry
 */
