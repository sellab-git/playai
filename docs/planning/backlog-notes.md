# Next work

## Approved immediate direction

- The user considers Impostor logical and Categories acceptable for the current stage. Bluff's false-answer/voting mockup is now approved; see [scope](../games/bluff/prototype.md). Drawing games are deferred. This does not start the production roadmap.
- Establish comparable evening scoring across games, including Impostor. Categories round scoring does not settle that conversion.

1. Handoff and reviewed fixes are published on `codex/blindstop-prototype-handoff` in PR #1. Keep subsequent refinements reviewable.
2. Keep current state, accepted decisions, implemented rules, and unresolved proposals distinct in documentation.
3. Continue focused mockup refinements from user feedback; validate relevant behavior and keep English app copy.

The revised separate catalogue/preparation flow is accepted and implemented in the mockup; see [DECISIONS.md](../decisions/prototype.md). The first desktop viewport review is complete. See [LOCAL-REVIEW.md](../validation/handoff-review.md). Automatic-result menu focus is now fixed and browser-verified. Next validation should cover physical-phone behavior and user feedback on a complete game. Continue the mockup; do not start production architecture work.

## Proposed only — not separately approved or implemented

- Replace per-player waiting statuses with a count only. Assess against the stable-avatar requirement before changing anything.
- Balance short, medium, and long targets across a game. The current generator guarantees uniqueness and separation, not equal proportions.
- Implement the full room lifecycle, including between-game joins, returning disconnected players, and real host transfer. The local leave/rejoin repair does not complete this proposal.

## Future production concerns

Server scheduling, cross-device clock measurement, independent disconnections, idempotent writes, room persistence, real room codes, and join URLs remain outside current scope.

The original proposal list is preserved in `prototypes/blindstop/docs/handoff/NEXT.md`.
