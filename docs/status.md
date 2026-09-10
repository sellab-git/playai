# Current state — 2026-09-10

## Workspace reconciliation and UI acceptance

The canonical local project is `C:\AI biznes\40. Playai`; its `docs` directory is
the registered Obsidian vault. It has been fast-forwarded from the older Categories
checkout to the published local implementation and latest four-game mockup.
The apparent local document changes were line-ending normalization only; staging
them produced no content diff. No user content was discarded.

The current visual reference is `prototypes/blindstop/mockups/blindstop.html`,
including Bluff and cross-game interaction corrections. The early root mockup has
been moved to `prototypes/blindstop/archive/build-kit-mockup.html`. The old 6686
worktree has been unregistered and its files removed; Windows retains an empty,
locked directory. The active task's 9236 checkout is temporary, not the project home.

The user reported substantial UX/UI differences in the real application. Prior
technical tests and bounded emulator interaction did **not** compare every screen
with the current mockup and do not establish visual or interaction parity. That
comparison was interrupted and remains unfinished. Do not treat the real UI as
accepted. Further app/comparison work is paused at the user's request until the
canonical folder, Obsidian documentation and Linear are reconciled.

## Current P1 local slice

The earlier end-of-day pause is lifted for the authorized technical foundation
work. The direct Cloudflare Durable Object local slice now exists for one Blindstop
round. It covers the generic room/runner path and a local Wrangler integration
exercise; no later games have been ported, no public deployment exists, and no paid
Cloudflare plan is authorized.

Verified local evidence currently includes Node 24.14, npm 11.9, TypeScript 6.0.2,
Vite 8.2.2, Vitest 5, Wrangler 4.130.0, and the `sharp` 0.35.4 override. The
automated suite has 43 passing tests; typecheck, lint, build, and the surface
detector pass. The real Wrangler local integration script passes HTTP and WebSocket create/join, origin and
credential rejection, clock readiness, host authorization, countdown/alarm, privacy,
connection generation, equal/conflicting retries, awards, and closed-summary
scenarios. A real Wrangler process restart also passes: membership and the Start
ack are retained, overdue phases advance, and the award is applied exactly once.
The fixed development advisory is recorded as `npm audit` clean.

Evidence is still incomplete. A bounded Android Emulator host flow passes (create, round, results, reload/resume, and close) with a protocol guest. Two real phones plus a laptop, including host-browser closure
mid-round, remain unavailable, so the P1 physical acceptance gate is open. R1 human
content/pacing, P2 device/accessibility, and later-game gates remain open as well.
The contract review, generic runner review, UI review, independent Terra UX review,
and independent Sol logic review passed after corrections; reviewers supplied no
emulator evidence. See [local room review](validation/local-room-review.md) and [the
local runbook](production/local-development.md).

## Historical prototype scope

Continue the Blindstop HTML mockup in `prototypes/blindstop/mockups/blindstop.html` (repository-relative path). The user approved preserving the handoff in GitHub, reconciling documentation, and continuing tested refinements. The user subsequently approved the room-level UX update in [prototype decisions](decisions/prototype.md), including a single-game selection view and editing room identity. This does not start the full application or approve the remaining [backlog proposals](planning/backlog-notes.md).

The prototype supports 2–20 simulated players, 1–20 rounds (default 5), optional practice, manual or automatic progression, stable player slots during a game, final standings, and evening totals. There is no server, real device synchronization, persistent room, or working QR join URL.

## End-of-day handoff — 2026-09-09

The user ended work for today. No further implementation or deployment should run until they resume.

- Saved: four-game mockup and consistency pass, readiness decisions, UI contracts, runner scenarios, playtest packet, review evidence and delegation records. Cloudflare is the chosen first backend; Supabase remains a possible later migration, with provider-specific integration kept separate.
- Next session: resume with the generic production contracts and runner test harness, then a local real room plus one Blindstop round targeting Cloudflare. No backend or cloud deployment exists yet; no paid subscription was authorized.
- Sequencing clarification from the final discussion: lack of a 4–6-person group leaves gameplay/balance validation open but need not block technical foundation work. Earlier R1-as-prerequisite wording was too restrictive. Real-device and production acceptance gates remain mandatory and unpassed.
- Open acceptance: SEL-23 Bluff, SEL-15 room flow, SEL-16 physical/mobile checks, SEL-25 readiness/playtest. Do not mark these complete from source review alone.
- Delivery: PR #1 remains open and unmerged. Continue bounded Luna/Terra/Sol delegation with lead integration. App UI checks remain Android Emulator only.

## Current work

Hosting preference accepted: Cloudflare first, with a possible near-term migration to Supabase. Keep provider integration separate from game rules and UI; do not build both backends now or promise a one-day migration. See [the recorded decision](decisions/production-readiness.md#hosting-choice-and-migration-intent). This is a documentation-only record of the user decision, verified by the lead; no runtime behavior changed.

The user authorized completing pre-production readiness sequentially with cheaper-model delegation. A production decision record, shared UI contract, runner acceptance cases and human playtest packet are prepared; independent Sol/Terra final reviews passed after corrections; local links and whitespace checks passed. See [review evidence](validation/readiness-review.md). This selects future behavior without claiming the local prototype implements it. The user currently has no group available. The next external evidence is the facilitated 4–6-person content/pacing test; production stage 1 and physical multiplayer gates are not passed. Start with [execution gates](planning/readiness-execution.md).

Bluff is implemented as the fourth one-round mockup: false answers, anonymous voting, truth reveal and 2/1 round scoring. The user-requested consistency pass unifies all four games' preparation, waiting, scrolling, voting and results patterns. Eighteen VM groups and two independent final reviews pass; 29 synthetic screen states were inspected in Android Emulator, including targeted lower-row selection and compact Bluff results. User acceptance and existing physical-device gaps remain open. See [Bluff evidence](validation/bluff-review.md), [consistency findings](validation/game-consistency.md) and [SEL-23](https://linear.app/sellab/issue/SEL-23/build-and-review-the-bluff-mockup).

Categories clarity refinement adds provisional points/reasons, ranked ties, Previous correction and input progress/global-stop help. Fourteen VM groups pass; independent Sol/Terra reviews and focused re-reviews pass after correcting row scroll/focus. Android emulator eight-player host flow verified the changes through ranked results; floating-keyboard overlay and the existing device gaps remain. See [current evidence](validation/categories-review.md).

Categories is implemented as the third standalone mockup: one fixed-letter round, four fields, frozen answers, per-answer host review and 10/5/0 round points. Thirteen VM groups pass; independent logic and UX re-reviews confirmed corrections. Android emulator host flow reached the result. A targeted visual-viewport fix keeps Stop visible above Android handwriting input, verified in the emulator and independently reviewed by Terra; guest, docked-keyboard and physical-device gaps remain. See [Categories evidence](validation/categories-review.md) and [SEL-17](https://linear.app/sellab/issue/SEL-17/build-and-review-the-categories-mockup).

The user provisionally accepted Categories for this stage and explicitly approved the Bluff false-answer/voting variant. See [Bluff scope](games/bluff/prototype.md) and [SEL-23](https://linear.app/sellab/issue/SEL-23/build-and-review-the-bluff-mockup). Drawing is deferred. Shared evening conversion and Impostor points remain unresolved; new games do not silently add raw points to the existing evening totals.

Impostor clarity follow-up: private role-specific instructions, submitted-vote count, explicit winner and revealed word in results. Twelve VM groups and independent Sol/Terra reviews passed. Android emulator host flow verified the updated waiting and result screens, including explicit remaining-vote simulation. Guest and keyboard gaps remain; see the latest review section.

The approved Impostor follow-up now inserts an ordered one-word spoken clue from each participant before discussion. The current speaker or host advances the queue. A concealed My role reminder is available during clues and discussion without losing progress. Independent logic and UX reviews completed; one copy inconsistency was corrected. Focused emulator inspection confirmed reminder reveal/hide and the next speaker. See [review evidence](validation/impostor-review.md).

The one-round Impostor mockup is implemented alongside Blindstop. It preserves the room and does not award evening points. Logic/state and UX/copy review corrections are complete; twelve VM groups pass. See [review and exact emulator coverage](validation/impostor-review.md). The host waiting/preview screens have now been inspected in the Android emulator. User gameplay acceptance and guest/device gaps remain open; no production readiness is claimed.

The user considers the current Blindstop flow satisfactory for this stage and approved trying a minimal Impostor mockup before production implementation. The purpose is to validate private roles, voting and the persistent room across different mechanics. See [Impostor scope](games/impostor/prototype.md). This is not approval of full multiplayer, resolution of device-test gaps, or production implementation of Bluff.

Android emulator review covers 20-player scrolling, settings validation, manual one-round completion, automatic progression, nested rules Back, and final leave/rejoin. Some automated clicks only focus controls; root cause remains open. No app-code fix was justified. See [exact coverage and remaining checks](validation/results.md). The emulator is left at fresh entry; SEL-15 acceptance and SEL-16 device verification remain open.

Independent Sol/Terra review resolved two navigation defects: returning through Home -> Join now preserves the local player/game, and guests can return from preparation to catalogue without host permissions. Focused re-review and nine VM groups passed; [review evidence](validation/agent-review-2026-09-08.md) records exact browser coverage and open device/accessibility gaps. SEL-15 remains for user acceptance.

The local review fixed short-viewport action reachability, leave/rejoin preservation through the existing local pause mechanism, and round-deadline copy. Logic tests pass; desktop browser viewport checks are recorded in [LOCAL-REVIEW.md](validation/handoff-review.md). A follow-up in visible Chrome also fixed and verified automatic-result menu focus and Pause/Resume focus; see [VALIDATION.md](validation/results.md). Physical-phone approval remains pending.

The earlier room-flow iteration separates the room catalogue from Blindstop preparation. The catalogue contains only game selection and compact room context; preparation contains a settings summary/editor, participants and Start. Replay returns to preparation; Choose another game returns to the catalogue. Room identity, points and nested Back/Close navigation are preserved. See [DECISIONS.md](decisions/prototype.md) for the accepted scope.

## Repository and workflow

Repository: `sellab-git/playai`. Local and remote main were verified at `4fcda993654b94cc78d79172fc6b955f3cec032a` before importing the handoff.

GitHub CLI authentication works with the system credential store, and the linked user has ADMIN permission. Restricted-shell authentication checks can incorrectly report an invalid token when that store is inaccessible. The separate connector did not list the repository; use the verified GitHub CLI route.

Use focused branches, reviewable commits, tests, and pull requests. Record accepted decisions separately from proposals. The root instructions and immutable mockup history remain unchanged. A successful push or PR must be verified before reporting it as published.

The original handoff state is preserved in `prototypes/blindstop/docs/handoff/STATE.md`.

The full-flow clarity review simplified the shared navigation and fixed final-result return, final-screen participant management, and keyboard destination focus. See [flow review](validation/flow-review.md).

## Knowledge and tracker setup

Maintained knowledge now lives in the `docs` Obsidian vault; former prototype documentation paths redirect here. Historical handoff and HTML snapshots remain unchanged. Start at [the index](index.md).

Created and verified on 2026-09-08: [Playai — Blindstop Prototype](https://linear.app/sellab/project/playai-blindstop-prototype-a5d29f2f1dfa/overview), in Sellab team, with Product: Playai label. Initial project status is In Progress. Milestone: Complete flow ready for playtest.

Initial issue import (live status now belongs to Linear):
- [SEL-15: Review and accept the room-to-game mockup flow](https://linear.app/sellab/issue/SEL-15/review-and-accept-the-room-to-game-mockup-flow), created In Review.
- [SEL-16: Verify mobile interaction and 20-player layout](https://linear.app/sellab/issue/SEL-16/verify-mobile-interaction-and-20-player-layout), created Todo.

Both issues belong to the milestone and are assigned to Artur Pawlowski for product/device acceptance; the implementation agent records evidence and fixes confirmed defects. No future proposal was imported as implemented. Preserve the shared settings and use the documented Blocked fallback. See [working agreement](working-agreement.md).
