# ARCHITECTURE — Blindstop

## Five decisions that are fixed

Everything else in this document is negotiable. These five are not, because changing
any of them after the second screen exists means rewriting the app.

1. **The server owns the state.** The client never writes game state. It sends
   intents and renders what comes back. This is not paranoia about cheating in a
   stopwatch game — it is what makes every later game (hidden roles, secret words)
   possible without a rewrite.
2. **The engine is a pure function.** No `Date.now()`, no `Math.random()` anywhere
   inside it. Time and randomness arrive through a context object. This is the only
   reason a whole session can be replayed deterministically in a test.
3. **Three visibility layers from day one**: public state, per-player private state,
   server-only secret state. Blindstop barely needs the second and third. The next
   game will, and retrofitting them is a rewrite.
4. **Every user-facing string is an i18n key from the first commit.** English is the
   only locale. Retrofitting i18n onto a working app is the worst job in this
   project.
5. **The room is not the game.** Players, the host, the code and the running total
   for the evening belong to the room and outlive any game. A game is loaded into the
   room, played, and unloaded; everything it wrote is discarded. Nothing outside a
   game's own folder may read `gameId` and branch on it.

Decision 5 is the newest and the one with a visible price. It is here because the
product is a room games are loaded into, and because the seam is free to build now
and costs a rewrite once two games exist on either side of it.

## Room and game

```
RoomState                          Game
  code                               state          created at start, gone at end
  hostId                             phases         its own names, its own deadlines
  players[]        survive a game    publicView     what everyone sees
  totals{}         survive a game    privateView    what one player sees
  status                             scores()       points added to totals at the end
  gameId
```

The room is a state machine with two states, `lobby` and `playing`. Loading a game
sets `gameId` and creates its state. Ending a game reads `scores()` into `totals`,
deletes the game state, and returns to `lobby` with the same players.

### The registry

Adding a game is one folder under `src/games/<id>/` and one entry in
`src/games/registry.ts`. That file holds manifests and engines only — no React — so
it is importable both on the server, where the runner needs the engine, and on the
client, where the lobby needs the manifest to draw a card.

Screen components are registered separately and lazily, because the server cannot
import React components. **That second registry is the only permitted duplication,
and a contract test iterates the first and asserts every game has a view in the
second.**

The test is not ceremony. In the codebase this design was reviewed against, a game
had to be registered in six places, none of them type-checked: miss one and the game
silently stopped working in one screen, which is far harder to notice than a failed
build. Two registries with a test that binds them is the smallest arrangement that
cannot fail that way.

### The manifest

Each game ships a manifest: id, name and tagline as i18n keys, min and max players,
estimated length, default settings, and the id of its hand-drawn ink mark. The lobby's
game picker renders straight from the list of manifests, and the start handler
validates player count against `minPlayers`/`maxPlayers` from the same place. The core
therefore never learns the name of a single game.

No per-game accent colour and no emoji, deliberately: `docs/DESIGN.md` permits colour
in avatar tiles and the highlighter and nowhere else.

## Runtime

**Cloudflare Durable Objects, via PartyKit.** One Durable Object per room. Room and
game state live in the object's memory. Players connect over WebSocket. Phase timeouts
use `ctx.storage.setAlarm()`. Disconnect arrives as an event, not as a missed
heartbeat.

Why not Firestore: a room is an actor with eight connections and a life measured in
hours. A document store makes you simulate that with heartbeats, write-rate limits
(~1 write per second per document), tick coordination and manual host migration. That
is where most of the complexity in comparable projects lives, and it is avoidable.

Frontend: Next.js on Vercel, or plain Vite + React. Two deploy targets is the only
real cost of this split.

### Room lifetime and cleanup

A room is deleted when it is older than 8 hours **and** no player has been seen for an
hour. Both conditions, because a session can run longer than the cap and a room that
dies mid-game takes the evening's totals with it.

Deletion must remove the room and everything under it in one operation. A partial
delete leaves per-player private state orphaned — invisible in any console, out of
reach of the cleanup job, and full of exactly the data the third visibility layer
exists to protect.

## Identity

Every device is issued a permanent, opaque id on first use, stored in `localStorage`.
There is no sign-up and no screen. It identifies a browser, not a person.

It exists because the product's one metric — does a player later create a room of
their own — is not measurable without it. Treat it as infrastructure: never display
it, never put it in a URL, and never use it as an authorisation claim on its own. The
socket connection is what authenticates a player into a room; the device id is a
correlation key.

## Message protocol

Client → server:

```
{ type: "join",    name, faceId }
{ type: "leave" }
{ type: "kick",    playerId }        // host only
{ type: "start",   gameId, settings } // host only, from lobby
{ type: "endGame" }                  // host only, back to lobby
{ type: "close" }                    // host only, ends the room, shows the summary
{ type: "action",  payload }         // game-specific, validated by the game's parseAction
{ type: "ping",    t0 }
```

Server → client:

```
{ type: "state",   room, public, private }  // full state, on every change
{ type: "clock",   serverNow }              // for offset calibration
{ type: "error",   code }
```

Blindstop's tap is `{ type: "action", payload: { type: "TAP", elapsedMs } }`. There is
no game-specific message at the protocol level.

**The actor is never in the payload.** The runner knows which player a socket belongs
to and puts that into the engine's context itself. An action carrying its own player
id is a claim the client makes, and every engine would then have to remember to check
it.

Send full state, not diffs. State is small, rooms are short-lived, and diffing is a
bug factory.

## Clock synchronisation — read this before writing the round

This is the one thing that has to be right the first time. Getting it wrong makes the
game feel arbitrary and you will not know why.

**Never send a timestamp and let the server compute elapsed time.** That measures
network latency, not the player's counting.

On join, and every 30 seconds after, do a round trip: client sends `t0`, server
replies with `serverNow`, client records `t1`. Offset is `serverNow − (t0 + t1) / 2`,
round-trip time is `t1 − t0`. Keep the median of the last 5 samples and discard
samples whose RTT is more than twice the median.

Resync on `visibilitychange` as well. A phone that spent two minutes in a pocket comes
back with a drifted offset, and the first round after that is the one that feels
arbitrary.

The round start is announced as a **server timestamp in the future** — around 300 ms
ahead, translated into local time using the offset. Every device starts its local
`performance.now()` reference at that instant. When the player taps, the client sends
`elapsedMs` measured locally with `performance.now()`. The server trusts that number
but clamps it to a sane range.

`performance.now()`, not `Date.now()` — the wall clock can jump.

## Engine contract

See `src/engine.ts`. In short:

```ts
manifest                                  // the card the picker renders
parseAction(raw)             → A | null   // the system boundary
init(ctx)                    → State
reduce(state, action, ctx)   → State      // pure, total, never throws
publicView(state, players)   → unknown
privateView(state, playerId) → unknown
phase(state)                 → { name, endsAt }
isFinished(state)            → boolean
scores(state)                → Record<PlayerId, number>
```

`ctx` carries `now`, `rng` and the authenticated `actor`. The engine reads time,
randomness and identity from nowhere else.

`scores()` returns points on a shared placement scale, not the game's own units, so
they can be added to a running total that spans different games.

**A phase that waits on a player must have a deadline.** `endsAt: null` in a phase
waiting for everyone to confirm is a deadlock: one person whose phone died hangs the
evening for everyone with no way out but abandoning the game. Deadlines there are
generous — they catch people who left the table, they do not hurry people who are
playing.

The runner around the engine is the part that talks to storage and sockets. It is
about 250 lines and it is where the bugs are. In the project this design was reviewed
against, that layer had **zero** tests while hundreds covered the pure engines, and
the defect list written after launch is almost entirely its: no host migration, no
protection against a double tap, a return-to-lobby that was not atomic, a clock that
never resynced after backgrounding. All four were fixed later, at a higher price. Do
not repeat that: the runner gets tests first.

## Testing

- Engine: replay whole sessions with a fixed seed and a scripted clock. Cheap, fast,
  and where most rules bugs are caught.
- Runner: this is the priority. The case list is at the bottom of `src/engine.ts`.
  Use a local Durable Object via `wrangler dev` / PartyKit's test harness.
- Clock: unit-test the offset estimator against synthetic RTT samples including
  asymmetric and spiky ones.
- Registry: one contract test that iterates every registered game and asserts it has a
  view, a manifest whose player range is sane, and an engine that reaches
  `isFinished` from `init` under a scripted clock.

CI from the first commit: typecheck, lint, test on every push. Add
`"typecheck": "tsc --noEmit"` as its own script — test runners use esbuild and will
not catch type errors.

## Abuse and cost

Not optional, even for a small project:

- rate limit room creation and joins per IP
- cap players at 8 in the join handler, not only at game start
- name filter against a wordlist, host can remove any player
- reject oversized payloads

A 5-character code space is about 33 million combinations, which makes blind
enumeration pointless. Without join rate limiting it is not.
