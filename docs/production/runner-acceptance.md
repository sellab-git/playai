# Runner acceptance contract

Status: the generic contract is implemented and reviewed for the local P1 slice. Runner, pure-engine, client-clock/protocol and provider-boundary tests execute in `npm test`; real local HTTP/WebSocket and process-restart scenarios execute in `npm run test:adapter`. See [local execution evidence and limitations](../validation/local-room-review.md). This case list remains the acceptance specification; automated evidence does not pass the physical-device or human gates. Read [readiness decisions](../decisions/production-readiness.md) and [the implemented local contract](local-contract.md) for the current boundary and bounded one-round settings.

## Generic amendment required before a game implementation

Use one runtime-owned game instance wrapper for instanceId, frozen roster, phaseEpoch, snapshot version, award status and retained safe result. Game-owned state stays opaque and server-only. Room-owned membership tracks connection generation, connected status and host authority. No core gameId switches.

The action envelope contains actionId, gameInstanceId, phaseEpoch, round identity and payload. The runner owns envelope validation and retry bookkeeping; the game owns payload shape and game-specific legality. Add a generic pure action validation/result contract if the UI needs a game-specific rejection reason: return accepted/state or rejected/code without throwing, rather than asking the runner to interpret game fields. A repeated equal action ID and identical payload returns the recorded acknowledgement; the same ID with different content is rejected. Authenticate before looking up any private acknowledgement.

Expose current room authority in the engine context generically, including current hostId. Do not store an authoritative hostId forever in game init state. Determine phase identity with an engine-supplied opaque phase/turn token or an explicit transition result; a reusable phase name alone cannot distinguish consecutive speakers. Keep phaseEpoch runtime-monotonic and validate TICK against it. Decide and type this amendment once for all games before writing reducers.

Treat terminal results as a safe snapshot retained by the runtime after finishing, separate from the next game's state. Keep future UI data JSON-serializable, but never serialize the engine's full state to a client. Replace the historical scores() universal-placement requirement with game-declared ranked/team awards as defined in readiness decisions. Return exactly the frozen roster, nonnegative integer awards in 0..N. The room core persists these awards exactly once and does not know why one game's points differ.

## Test-first integration scenarios

Write each scenario before implementing its corresponding runner capability. The complete R01–R24 suite must pass before the P1 gate and before broadening beyond the first production slice. Establish the runner test harness before adding its second capability; do not postpone tests until all capabilities exist.

| ID | Setup / event | Required assertion |
| --- | --- | --- |
| R01 | Create room, join second authenticated member | Distinct identity and own private projection; code does not recover another member |
| R02 | Reconnect with same valid membership credential | Same PlayerId/seat/totals, current phase, fresh connection generation |
| R03 | Present forged, other-room, revoked or removed credential | No membership takeover, private payload or successful intent |
| R04 | Open a second tab, then send from first socket | Newest socket owns input; first is rejected; one player slot |
| R05 | Guest sends START/abort/close or former host sends after transfer | Host-only rejection from current authority; no state mutation |
| R06 | Host disconnects 29s then returns; separately disconnects 31s | Grace case retains host; transfer case chooses deterministic eligible member and does not revert |
| R07 | Host explicitly leaves during active round | Immediate transfer; prior accepted action preserved; revoked socket cannot act |
| R08 | Insufficient connected participants for 59s vs 61s | Recover cancels safety alarm; prolonged case aborts once without new evening points |
| R09 | Two equal actionId+payload deliveries, with an acknowledgement lost | Exactly one reduction, same successful acknowledgement on retry |
| R10 | Same actionId with different payload | Explicit conflict rejection, original outcome unchanged |
| R11 | Valid old action arrives after next round or new game | Stale scope rejected, current state returned, no new round mutation |
| R12 | Blindstop sends two distinct TAP IDs in same round | Game-level first-action guard retains first value and reports already submitted |
| R13 | Submit before/exactly at/after endsAt while alarm is delayed | Only before-close action accepted; equality/deadline ordering deterministic |
| R14 | Two alarms or stale alarm fire after early completion | One valid transition; no skip/double award; next alarm targets current scope |
| R15 | Server restarts between acceptance and reply / at expiry | Durable state, idempotency and deadline restore; no fabricated success/lost accepted input |
| R16 | Completion and host abort race | Serialized winning transition determines exactly one outcome: completed award or aborted zero; never both |
| R17 | Completion retried after result/reconnect/replay | One award record and gamesPlayed increment; totals unchanged on result reads; completed games ignore later abort/insufficient-participant alarms |
| R18 | Leave/kick during game then complete | Frozen roster and retained contributions follow game rules; historical totals retained |
| R19 | New member joins during play | Entry held outside membership; no current private/game payload; join permitted between games |
| R20 | Room qualifies for cleanup | Remove room/private data/credentials together; no recovery into orphaned state |
| R21 | Room closed with clients connected | Final safe summary broadcast, terminal rejection of future joins/intents, no new room created by retry |
| R22 | Multi-recipient snapshots and log/error capture | No secret state, wrong-player private data, resume credentials or unrevealed answers in public payloads/logs |
| R23 | Reordered full snapshots and acknowledgements | Client applies latest version only; pending delivery cannot roll state backward |
| R24 | No accepted contributions, ties and team result | Expected game-owned awards (including 0), no raw-unit addition or change of N |

For clock estimation test synthetic RTT spikes/asymmetry, visibility resync and unsynchronized readiness. Use performance.now for client elapsed measurements. A room start must not silently treat a failed initial clock sync as calibrated. Do not certify timing fairness from one machine's VM clock.

## Additional game gates before those games ship

- Impostor: host changes during clue/discussion, private-view word exclusion, opaque role reminder after reconnect, timeout speaker advance, no-vote/tie outcome and ballot-gated evening eligibility.
- Categories: increasing private draft revisions; delayed older revision rejected; Player Stop requires complete final sheet while host Finish early permits blanks; both require a newer final-sheet revision and freeze other acknowledged revisions atomically; unacknowledged local text never appears counted; correction updates duplicate groups; review expiry aborts without partial award.
- Bluff: source-verified content and per-question aliases; missing submissions/votes; merged authors; own truth cannot leak through validation; frozen opaque options; no truth/author projection until close; full equivalent retry and reveal-only details.
- Registry: every engine has matching lazy UI registration, sane supported counts, serialized projections and a deterministic path to completion or documented abort using scripted time.

## Evidence record

Every future run must record commit, runtime/version, test command, outcome and genuine limitations. Unit/VM/fixture inspection, local server integration, emulator and physical multiplayer are distinct evidence classes. All scenarios in this file are currently Not run against a production server because that server does not exist yet.
