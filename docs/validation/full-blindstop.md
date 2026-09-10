# Full Blindstop implementation — 2026-09-10

## Source and accepted scope

Canonical workspace: `C:\AI biznes\40. Playai`; its `docs` folder is the Obsidian
vault. Base commit: `994af8b6dca0e82742f61c2372f938a99adb5391`. Current reference:
`prototypes/blindstop/mockups/blindstop.html`, SHA-256
`86B390D9C5E6482257026695D7FC1F63A325CC37632C7084474397757CAE7F7B`.
The reference remains unmodified. No parallel latest/final copy was created.

The user explicitly authorized the complete Blindstop game after the historical
one-round restriction was explained. This covers the complete Blindstop lifecycle,
not implementation of Impostor, Categories or Bluff. Those engines remain in the
HTML prototype only. No merge, public deployment or paid plan is authorized.

## Implemented behavior

- Server-owned shared preparation and validated 1–20 rounds, manual/automatic pace.
- Optional fixed-target practice with no history contribution or evening points.
- Pure target generation, countdown, private tap delivery, public submission flags,
  per-round results, host Next, automatic progression and pause/resume preserving
  remaining time across reloads.
- Cumulative ranking by completed rounds then quantized mean absolute error,
  competition ranks, missed taps and exactly-once final evening awards.
- Retained setup and room totals across replay; generic catalogue navigation.
- Room profile edits, participant management, invitation QR/link and evening share.
- Legacy one-round state/command compatibility; completed old results remain usable.
- Generic gamesStarted count suppresses repeated first-time practice offers after
  abort/restart. No game ID branching was introduced in the room core.

Manual/paused results retain the architecture-required 15-minute safety deadline.
This differs from an indefinitely paused standalone mockup and prevents abandoned
server games from deadlocking. Automatic results use eight seconds initially;
resume retains the remainder. Clients render projections and send intents only.

## Verification

Local checks pass: 60 tests across nine files, TypeScript strict check, ESLint and
production build. The isolated Wrangler adapter suite passes admission/authentication,
clock readiness, alarm transitions, retries, privacy and awards; the new full-game
scenario passes practice plus two automatic rounds, pause/reconnect/resume, final-only
points, replay setup and profile editing. An actual Wrangler process restart passes
retained membership, original Start acknowledgement, overdue progression and a
single award record. Unit restoration tests also cover active multi-round state.

Android Emulator (`Medium_Phone_API_36.1`, Chrome), real app at `127.0.0.1:8787`:
create A, choose Blindstop, change five rounds to two manual rounds, practice prompt,
real practice tap and unscored result, real round one tap/results/details, round two
tap/private waiting, last-round results, final ranking/awards, Play again and retained
two-round setup. Room NHLTK used one protocol guest. The guest missed round two after
a development hot reload disconnected its helper; the UI correctly displayed Missed
and ranked the player with two completed taps above that guest. This is not a second
physical phone or guest-UI test. Automated adapter evidence was obtained separately
without hot reload.

The unmodified reference was viewed on the same emulator at `127.0.0.1:8788`,
including home, create, catalogue, preparation and settings. Earlier reference
countdown/waiting/results/final observations are recorded in the historical
[frontend restoration](frontend-restoration.md). Source and visual observations
prompted restoration of the preparation label/chevron and Off/On settings row.

## Independent review

Separate read-only assignments covered backend logic/state and frontend UX/copy.
Reviewers did not implement their reviewed scope. Accepted corrections included:
legacy:true validation, old completed result navigation, one-time menu pause,
avatar draft/cancel behavior, invalid settings retained on Done, roster scroll/focus
captured before shell replacement, and persisted remaining automatic countdown.
Focused UX re-review passed. Backend focused re-review also passed, including 12 focused tests. Reviewer source checks are not visual or device evidence.

## Acceptance boundaries

Full four-game parity is not implemented. Physical two-phone/laptop acceptance,
guest UI, human playtest, large-roster emulator interaction, QR camera scanning,
actual outbound share and assistive-technology checks remain open. Source review
and automated checks do not establish user UX acceptance. Track these in SEL-15,
SEL-16 and SEL-25; do not mark Done solely because this implementation passes tests.

Final rebuilt-frontend Android check: rejoin recovered the retained room; preparation label/chevron and settings layout were observed against the current reference. The Off/On control updated its explanation immediately and saved Automatic pace back to preparation.

Published implementation: `bfd7be0`. Final Android invitation inspection confirmed a generated QR for the current room and the invite-link button changed to Copied. No camera scan or outbound share was performed. Linear project overview and SEL-25/SEL-15/SEL-16 were synchronized with this scope and evidence; their acceptance gates remain open.
