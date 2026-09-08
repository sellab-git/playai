# Current state — 2026-09-08

## Scope

Continue the Blindstop HTML mockup in `mockups/blindstop.html`. The user approved preserving the handoff in GitHub, reconciling documentation, and continuing tested refinements. The user subsequently approved the room-level UX update in `DECISIONS.md`, including a single-game selection view and editing room identity. This does not start the full application or approve the remaining proposals in `NEXT.md`.

The prototype supports 2–20 simulated players, 1–20 rounds (default 5), optional practice, manual or automatic progression, stable player slots during a game, final standings, and evening totals. There is no server, real device synchronization, persistent room, or working QR join URL.

## Current work

The local review fixed short-viewport action reachability, leave/rejoin preservation through the existing local pause mechanism, and round-deadline copy. Logic tests pass; desktop browser viewport checks are recorded in `LOCAL-REVIEW.md`. A follow-up in visible Chrome also fixed and verified automatic-result menu focus and Pause/Resume focus; see `VALIDATION.md`. Physical-phone approval remains pending.

The latest iteration separates platform entry, room, and game; adds a single-game selection view and room identity editing; saves pacing immediately; and gives nested menus Back/Close navigation. See `DECISIONS.md` for the accepted scope.

## Repository and workflow

Repository: `sellab-git/playai`. Local and remote main were verified at `4fcda993654b94cc78d79172fc6b955f3cec032a` before importing the handoff.

GitHub CLI authentication works with the system credential store, and the linked user has ADMIN permission. Restricted-shell authentication checks can incorrectly report an invalid token when that store is inaccessible. The separate connector did not list the repository; use the verified GitHub CLI route.

Use focused branches, reviewable commits, tests, and pull requests. Record accepted decisions separately from proposals. The root instructions and immutable mockup history remain unchanged. A successful push or PR must be verified before reporting it as published.

The original handoff state is preserved in `handoff/STATE.md`.
