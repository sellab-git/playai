# Readiness execution and production gates

User direction on 2026-09-09: complete the pre-production recommendations sequentially, delegating bounded work to cheaper models. This plan records deliverables and evidence requirements, not a second issue tracker. Live status stays in [SEL-25](https://linear.app/sellab/issue/81284da1-fb12-4f7a-80de-d4e3e1a8b4b2).

## Current preparation deliverables

- [Production decisions](../decisions/production-readiness.md): lifecycle, deadlines, scoring, content and submission rules selected for first playtest; balance values remain provisional.
- [Shared UI contract](../design/shared-game-ui.md): existing patterns and future delivery/reconnect/privacy behavior, with keyed copy.
- [Human playtest packet](../validation/pre-production-playtest.md): facilitated content/pacing session now, separate connected-build/device checks later; all results must be recorded rather than inferred.
- [Runner acceptance cases](../production/runner-acceptance.md): implementation order and failure cases for the real room.
- [Doplay evidence](../research/pre-production-review.md): inspected commit, useful patterns and rejected scope expansion.

## Sequential gates

| Gate | Concrete completion evidence | What may proceed |
| --- | --- | --- |
| R0: internally consistent baseline | Independent logic and UX review, corrected contradictions, pinned current decisions and old-baseline reconciliation | Facilitated content/pacing test and contract design |
| R1: first human content/pacing test | 4–6 real participants, varied content, observed review/vote durations, point/winner comprehension; no claim of synchronized software | Freeze the rules/content needed by the next Blindstop slice; retain later-game findings for P3 rather than blocking Blindstop on a complete trivia bank |
| P1: room + one Blindstop round | Real create/join/recovery, full snapshots, identity credentials, server alarms, current visibility policy, runner tests in CI; two phones and laptop with host browser closed mid-round | Complete the production stage-1 gate; only then broaden screens/features |
| P2: device and accessibility | Real Android/iPhone, docked keyboards and large text; code/QR entry, background/rejoin, announced state and reachable controls with recorded devices/results | User onboarding/gameplay acceptance, within observed group limits |
| P3: later games | One game folder and registry entry, contract tests and game-specific timeout/privacy/scoring tests, then real playtest | Add the next game without a core gameId branch |

Do not label R1, P1 or P2 passed based on the standalone mockup's VM suite or synthetic screen fixtures. R1 can be performed without multiplayer code through facilitated cards/sheets; P1 cannot. The first production implementation follows R1 and the existing roadmap gate, per the user's approved sequence. No extra confirmation of already authorized work is required; actual missing people/devices/evidence must be requested when needed.

## Production baseline reconciliation

The current decisions supersede the following historical build-kit values for future implementation, while preserving history:

| Historical reference | Current baseline |
| --- | --- |
| One game is the whole product / no picker | One game is the first production slice; the product and prototype have a persistent catalogue and four explored games |
| Room cap 8 | Model and UI support up to 20; actual launch claim limited by human/device evidence |
| Fixed 10 rounds / fixed 3-second Missed penalty | Accepted Blindstop settings 1–20/default 5, completed-round-first ranking, Missed below every tap and no invented error |
| Results always advance after 3 seconds | Manual progression by default, accepted 8-second automatic mode; bounded future manual waiting as in readiness decisions |
| Game state deleted immediately on finish | Finish atomically awards once and retains an immutable safe result snapshot for result/recovery presentation |
| N-to-1 scale without participation/team rules | Ranked N-to-1 with zero-contribution exception; explicit provisional team award for Impostor |
| Socket alone described as authentication | Room-scoped authenticated membership/recovery and current connection-generation authorization |
| No protocol retry/phase metadata | Stable logical action IDs, game/phase scope, acknowledgement, monotonic snapshots and server-owned deadline ordering |

The prototype's embedded fixture state and manual simulations remain unchanged until an implementation task updates and verifies them. A written production rule is not an assertion about current mockup behavior.


## Current external dependency

The user reported that a 4–6-person group is not currently available. R1 is Not run; its owner is Artur when participants are available. Prepared documents and source reviews do not satisfy this gate. The implementation sequence is retained, with no claim that the production application has started or that all readiness work is complete.
