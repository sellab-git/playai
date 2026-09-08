# Next work

## Approved immediate direction

1. Preserve the handoff and reviewed fixes in GitHub with a reviewable commit and pull request.
2. Keep current state, accepted decisions, implemented rules, and unresolved proposals distinct in documentation.
3. Continue focused mockup refinements from user feedback; validate relevant behavior and keep English app copy.

The first desktop viewport review is complete. See `LOCAL-REVIEW.md`. Next validation should cover physical-phone behavior and focus after automatic-result menu rerenders. Continue the mockup; do not start production architecture work.

## Proposed only — not separately approved or implemented

- Replace per-player waiting statuses with a count only. Assess against the stable-avatar requirement before changing anything.
- Balance short, medium, and long targets across a game. The current generator guarantees uniqueness and separation, not equal proportions.
- Implement the full room lifecycle, including between-game joins, returning disconnected players, and real host transfer. The local leave/rejoin repair does not complete this proposal.

## Future production concerns

Server scheduling, cross-device clock measurement, independent disconnections, idempotent writes, room persistence, real room codes, and join URLs remain outside current scope.

The original proposal list is preserved in `handoff/NEXT.md`.
