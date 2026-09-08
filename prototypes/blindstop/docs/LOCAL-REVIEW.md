# Local prototype review — 2026-09-08

The working directory is the existing repository with origin
`https://github.com/sellab-git/playai.git`. The handoff folder was already present
and untracked. This review changes only the prototype; no commit, push, backend,
or production application work was performed. Root `AGENTS.md` and the historical
mockups remain unchanged.

## Specification reconciliation

For this mockup, the user's later handoff decisions take precedence over the older
root specifications. Production architecture remains a separate future concern.

| Earlier repository baseline | Current prototype direction |
| --- | --- |
| 2–8 players | 2–20 players, scrolling lists without shrinking rows indefinitely |
| 10 rounds | 1–20 rounds, default 5 |
| Average error determines the game winner; missing a tap incurs a 3.00 s penalty | Completed rounds first, then rounded average absolute error; missed taps are explicit |
| Automatic progression after 3 seconds | Host starts by default; optional 8-second automatic progression with pause |
| Original results screens | Stable player slots during the game; details and overall values in the menu; sorted final and evening tables |
| Underlined tertiary actions | Button controls and a single bottom action row |
| Settings outside the original v1 scope | Existing round-count and pacing settings are part of the authorized mockup |
| Root `mockup.html` is the reference | `mockups/blindstop.html` is current; `history/mockup-v8.html` preserves the handoff baseline |
| Roadmap starts a server-backed application | Current request explicitly continues standalone HTML mockups |

The white background, warm ink, avatar tints, original faces, compact radii,
English copy keys, and tabular numbers remain the incumbent visual direction.
The room/game separation remains a product requirement; the local simulation is
not evidence of the production architecture being implemented.

## Confirmed defects fixed

- At 640×360, the shell's minimum height pushed bottom actions below the viewport.
  Short viewports now retain the action row, shrink the scrolling roster, and let
  overflowing body content scroll. Portrait layouts retain their existing sizing.
- Leaving an unfinished game and choosing Rejoin previously returned to the lobby
  and discarded progression. Rejoin now resumes the existing local pause mechanism,
  preserving the round and recorded taps. Back and the secondary action on the
  paused screen use the leave confirmation instead of silently abandoning the game.
  This remains a frozen local preview, not reconnecting to a running server room.
- The rules said the round closes 8 seconds after the target even though it can
  close earlier. Copy now states both conditions. The existing paused-seat message
  also uses a copy key instead of a literal template string.

## Validation performed

`node tools/check.cjs` passes, including its existing 2/8/12/16/20-player scenarios,
1/5/20-round games, scoring, ties, missed taps, practice, auto progression, and
scroll-state checks. Added regressions exercise leave/rejoin during countdown,
counting, waiting, results, and an already paused game, plus an idle-room return.
These tests use a fake DOM and clock.

Browser checks used the Codex in-app browser, served only on localhost:

- Portrait viewports 360×640, 393×780, and 430×900; landscape 640×360.
- Create form, name entry, gallery of all 25 faces, selecting and saving a face,
  default 8-player lobby, 20-player lobby, and a fresh 2-player lobby.
- At 360×640 with 20 players, the page stayed 640px high. The list scrolled to
  player 20 using the keyboard without a visible scrollbar. Waiting and round
  results retained the same slot order, scroll offset, and list bounds
  (top 222px, bottom approximately 541px).
- Dedicated Tap via pointer and Space, manual next/final progression, automatic
  one-round final progression, rematch, and the final table's sorted order.
- Overall standings dialog, personal final statistics, and Escape closing a
  manually paced menu with focus returning to Options.
- Browser reproduction of the old leave/rejoin bug, followed by verification that
  the corrected path returns to Locked in in the same round with the tap preserved.
- After the short-screen fix, the 640×360 page measured 360px high; the Start game
  button occupied y=300–350 and the 20-player list remained scrollable.
- No warning/error entries in the final browser log query.

The mechanical design detector ran with missing HTML-parser dependencies and fell
back to regex checks. Its only reported finding was the pre-existing ink border
on form errors, not a colored card accent. It did not verify contrast or selectors.

## Still requires work or user evaluation

- Physical phone touch behavior, on-screen keyboard, safe areas, Safari, and screen
  reader behavior were not tested by this desktop viewport review.
- Browser verification of focus restoration after automatic-result menu rerenders
  remains incomplete; VM tests do verify that opening the menu pauses progression.
- The broader membership/host lifecycle remains a local simulation. Historical
  participants with points remain visible as Left after reducing preview size.
- Historical CSS overrides remain; this pass deliberately avoids a broad rewrite.
- The proposals in `NEXT.md` are unchanged and remain unimplemented/unapproved.
  The narrow rejoin repair does not implement the proposed full room lifecycle.
- No real multiplayer, persistent rooms, working QR join, or deployment is claimed.

This note updates the verification status recorded at handoff in `STATE.md`,
`KNOWN-ISSUES.md`, and `VALIDATION.md`; those historical statements describe v8
before this local review.
