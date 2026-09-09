# Production readiness decisions — 2026-09-09

Status: implementation baseline selected by the lead under the user's instruction to complete the readiness work in order. Numeric defaults and game balance are provisional until the human playtest. This record specifies future behavior; it does not claim that the standalone mockup implements networking, deadlines or cross-game scoring. The five fixed architecture decisions remain binding.

## Scope and order

The product remains a persistent room for several games. First production delivery is one real room and one Blindstop round, with runner tests before a second runner feature. The four-game mockup remains the interaction reference and hidden-information contract check, not production source. No accounts, public matchmaking, bots, drawing, second locale or extra settings.

The room model permits 2–20 members. Initial supported playtest group is 4–6, then 8; 20 is a stress case, not a promise of enjoyable pacing. Blindstop/Categories/Bluff require at least 2 participants; Impostor at least 3. Before each start, validate connected participants against the registered game range. Keep manifests as the authority; do not add game-specific conditions to the room core. The physical/gameplay evidence must justify any narrower launch limits.

## Membership, recovery and room lifecycle

| Event | Required outcome |
| --- | --- |
| Temporary connection loss | Keep identity, frozen game seat, acknowledged actions and totals. The room keeps running. Show reconnect state; do not claim local input is saved. |
| Host disconnects | Allow 30 seconds to reconnect. Then select the longest-present connected member of the current game roster, or connected room member when no game is active. Order candidates by joinedAt ascending, then stable PlayerId ascending to break ties. Keep this host on the former host's return; no oscillating ownership. |
| Host intentionally leaves | Vacate host authority before transferring immediately by the same order. Former host loses authority immediately. Members cannot remove the current host; there is no separate moderator role. |
| Nobody eligible to host | The server still executes phase deadlines. When a member reconnects, elect a host if vacant. A game with fewer than its minimum connected participants for 60 continuous seconds aborts with no evening award. Recovery before the limit cancels this alarm. |
| Intentional leave / removal during play | Preserve the frozen seat and already accepted game contributions until that game ends, revoke that connection's intents and clear private content from the client. Preserve historical totals. Intentional leave ends that membership permanently. The person may join by code between games as a new identity with zero personal totals; their old completed totals remain as a departed entry. Confirm this consequence before leaving. Temporary disconnection is the path for same-identity recovery. A removed player cannot resume using the revoked credential; blocking a new identity by room code is outside this private-room v1. |
| Late join during play | Explain that the round is in progress; do not admit a new member or disclose game state until the game returns to preparation/catalogue. No spectator mode in v1. |
| Refresh / browser reopen | Offer Return to room only after server validation. Recover the same membership using a room-scoped opaque server-issued credential, not name, room code or device correlation ID. Restore the current authoritative phase; conceal private role text until explicitly revealed again. |
| Two tabs for one membership | The newest authenticated connection owns input; invalidate the previous connection generation and show Session opened elsewhere there. Do not create a second seat or duplicate submission. |
| Server restart / room reactivation | Restore durable room and game state, award ledger and deadlines; process overdue alarms once. No dependency on a host browser to advance time. |
| User ends a game early | Confirm Abort game for everyone; discard this game's unawarded result, preserve previously completed games and room membership. |
| Normal game completion | Atomically change active/incomplete to completed, retain an immutable safe result snapshot, commit the award once and cancel all game-phase and insufficient-participant alarms, then show results. Completed games cannot abort or lose their award. Replay opens preparation; another game opens catalogue. Do not delete the result before everyone can read it. |
| Host ends evening | Confirm, freeze the evening summary and close membership. Show the final summary to currently connected players; no account/history feature. |
| Inactive room | Retain the existing cleanup rule: older than 8 hours AND nobody seen for an hour. Server-authoritative activity updates only. Closed rooms reject joins. Remove private data and credentials with the room. |

The transient 60-second insufficient-participant alarm applies only to active/incomplete games and is distinct from room expiry. Count distinct frozen-roster seats with a valid authenticated current connection generation. Start the interval on crossing below the game minimum, cancel it on recovery, and ignore late/non-roster or invalidated sockets. Host-disconnect grace runs concurrently, not before this interval. Completed result navigation never calls abort or changes its award. A reconnecting participant recovers their original seat, including any missed phase outcomes. New names do not recover prior points or roles.

## Delivery, ordering and privacy

Every mutating intent carries an opaque actionId; game intents additionally carry game instance ID, phase epoch and round identity. The server binds the actor and connection generation, validates membership/host permissions, schema, payload limits and current scope, then processes atomically. A retry reuses the same ID and returns the original acknowledgement without reapplying. A new round is a new scope; old actions cannot land in it. Duplicate detection must survive process restart. Retain room-command outcomes (including Start, abort, leave and host navigation) for the room lifetime; retain game-action outcomes through the completed result and until room cleanup. Close permanently invalidates the room identity, so a retry can only acknowledge its terminal absence and must never recreate it. Bound admission/action rates and accepted payload sizes rather than silently evicting outcomes that still authorize a retry. Stale intents return current state and a specific code, not a success toast.

Full state snapshots include monotonic version and the appropriate public/private projection. Ignore older snapshots. A successful send is not confirmation: show Saved only after acknowledgement or an authoritative snapshot containing that accepted submission. Unknown delivery retains the original request identity for retry/status resolution. Clear obsolete pending inputs on phase changes. Never blindly replay a timing Tap or final vote into another phase.

A server-issued high-entropy resume credential is separate from the persistent device correlation ID. Use secure transport, bind credentials to one room/member, revoke on removal/intentional leave, and never place credentials in URLs, telemetry or public state. Join by code is admission to a new identity, not authentication of an old one. Resolve cookie/token transport and browser storage in the stage-1 security design before implementation; the existing socket-authentication sentence alone is not a protocol.

The unprojected authoritative game state is the server-only secret layer; there is no secretView transport API. Never serialize that state into client payloads, logs or errors. Compose each recipient snapshot separately from room-public data, publicView, and privateView for the authenticated frozen-roster player. Nonmembers, revoked former members, late joiners and non-roster room members receive no game private view.

Do not send secret words to impostors, Bluff truth/author mappings before reveal, other players' drafts, or private state to former members. Concealing a DOM element is not secrecy. On backgrounding, conceal role presentation immediately without pausing shared state.

## Phase deadlines and outcomes

Defaults below are fixed for the first playtest, not a settings matrix. The server owns deadlines, and a stale alarm is ignored by game instance/phase epoch. At `now >= endsAt`, process the timeout before a newly arriving intent. Reveal truth only after all eligible votes are recorded or the deadline closes.

| Game / phase | Default and expiration outcome |
| --- | --- |
| Blindstop countdown / tap | Preserve 3-second countdown and target + 8-second round close. Server-confirmed taps received before close count; missing taps are Missed. Measure elapsed locally with performance.now and synchronized future start; no fabricated elapsed penalty. |
| Blindstop manual round results | 120 seconds for host Next; expiration aborts the incomplete match, preserves earlier completed games and returns to preparation with an explanation. Automatic results retain the accepted 8-second progression. |
| Impostor role reading | 60 seconds; progress to clues, with a concealed reminder still available. |
| Impostor clue | 30 seconds per speaker; mark a missed clue and advance. Speaker or current host can advance earlier. |
| Impostor discussion / vote | Host may open voting early; at 90 seconds the server opens voting automatically. Voting lasts 60 seconds. Missing ballots abstain; tie or no ballots eliminates nobody, consistent with existing round rules. |
| Categories writing | 120 seconds maximum. Stop requires four filled answers; current host may finish early with blanks. All server-accepted drafts freeze on Stop/timeout. |
| Categories review | 90 seconds per category, resetting only on category transition, not on every edit. Host may confirm earlier. Expiration aborts the incomplete game; never silently approve unreviewed answers. |
| Bluff writing / voting | 90 seconds writing, then 60 seconds voting. Missing submissions produce no authored option; missing votes abstain. A non-submitter may vote. If every option is the truth, supply one clearly attributed-at-reveal house lie. |
| Completed game result | No action is required for a finished game to count; keep result until host chooses replay/another game or room cleanup. Never auto-start another game. |

Safety alarms may abort an active/incomplete game first if too few connected participants remain. They never abort a completed result. For manual-result pauses the remaining 120-second safety budget is not reset or suspended by menu opening. Values and abort wording must be exercised with people; they are not validated by VM tests.

## Scoring baseline

Keep native game points/results separate from the evening column. For ranked games use the historical placement scale `N - rank + 1`, where N is the frozen start roster and ties use competition ranks (1, 1, 3). Blindstop keeps its completed-round-first ranking. Categories and Bluff rank their own game points. A player with zero qualifying contributions earns zero evening points even when everyone ties at zero: Blindstop requires an accepted Tap, Categories at least one accepted scoring answer, Bluff at least one native game point. Missing/invalid-only participation does not farm evening points.

For the initial one-round Impostor, winning-side participants earn N and losing-side participants earn 0; this is an explicit team exception, not artificial individual ranks. A winning participant must have submitted a confirmed ballot to earn the award. Disconnecting after an acknowledged ballot does not erase it. Reveal winning side separately from personal award eligibility. No-vote rounds award nobody even if the impostor technically survives. This is a provisional balance choice requiring playtest, not a claim of equal expected reward between roles.

One completed game creates one award record keyed by game instance; rerender, replay navigation, reconnect, duplicate completion and concurrent alarms cannot award again. Aborted games and practice award zero. Joined-later players cannot receive previous game awards. Existing departed players retain completed-game totals. Larger groups and more games can yield more points under this inherited scale; the evening is a social cumulative total, not a skill rating. Do not add partial rounds on abort or change N mid-game.

## Content and Categories review

Keep host review of each answer, previous-category correction before finalization, 10/5/0 points and no automated semantic judge. The group may voice a dispute; host records the judgment. Test participant-led dispute voting on paper only if review pace fails, before adding its states. Trim and collapse whitespace for duplicate comparison, case-insensitively; don't silently treat semantic synonyms as equal. Record any changed normalization as a rule change before implementation.

Categories keeps the latest server-acknowledged draft revision per player. Draft intents carry increasing revision; older revisions never overwrite newer drafts. Player Stop and host Finish early are distinct intents. Each includes the actor's full final sheet and a strictly newer draft revision. Player Stop requires four filled fields; host Finish early permits blanks and checks current host authority. Reject an equal/older final-sheet revision and return the current draft for reconciliation rather than overwriting it. In one serialized transaction, accept the newer final sheet and freeze everyone's acknowledged revision. A draft ordered before freeze counts; a draft ordered after freeze is rejected with the frozen sheet and version. Other clients clearly distinguish local unsent text from Saved; no grace period is invented to hide network loss. Preserve pending local text for explanation without counting it after close. This race needs an explicit integration test.

Bluff content entries need stable ID, English question/truth, curated equivalent truths, a nontruth house option, source URL and review date. The existing octopus aliases are only valid for that entry. Normalize text/whitespace/case before alias matching; don't advertise general semantic truth detection. Merge matching lies and credit every author per fooled voter; own merged options remain unavailable, including truth submissions. Truth submissions earn exactly 2 truth points at reveal and no deception credit. Never indicate a truth match before reveal. Use opaque randomized option order frozen for the voting phase, not a truth-first/source-order arrangement.

Retain used content IDs across replay in the same room; draw without repetition until exhaustion, then announce that the set has been used before cycling. Content data must stay game-owned. The first paper playtest packet contains several examples; it is not a production trivia bank. Build source-verified content before claiming replayability.

## Required contract reconciliation before production code

The existing src/engine.ts is a historical interface sketch. It lacks explicit current-host context, runtime result retention, authenticated recovery, action acknowledgement/versioning, generic abort semantics and exactly-once awards. These cannot be solved by gameId branches. Before stage 1, review a generic contract amendment covering these capabilities for all games; preserve pure reducers and the public/private projections of server-only state. Do not silently implement a game-specific core workaround.

Explicitly replace scores()'s historical universal-placement comment: each game returns final evening awards under its declared ranked or team policy, for exactly the frozen roster, as nonnegative integers in 0..N. Ranked policy uses the N-to-1 and zero-contribution rules above; team policy uses N/0 with game-owned eligibility. The generic runner validates award shape/range and persists it, never branches on gameId. This is a required contract amendment, not merely a copy change.

This record supersedes conflicting limits/scoring assumptions in the build-kit prose for future implementation. It does not retroactively change prototype behavior or declare the stage-1 gate passed. See the execution plan and human playtest packet for evidence gates.
