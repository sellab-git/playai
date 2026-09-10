# Frontend correction evidence — 2026-09-10

Canonical source: `C:\AI biznes\40. Playai`, implementation commit
`902e6a69e6f3f267bd4e9efb76e3700b0b68ad28`, published to PR #1. This record supersedes the unresolved
source findings in the [layered audit](nextjs-layer-audit.md), while preserving that
audit as historical evidence. The [execution plan](../planning/frontend-correction.md)
defines the acceptance gates.

## Implemented correction

- Calibration gates the first captured local round start. Recovery cannot submit an
  uncalibrated zero-time tap. Actual App/transport integration verifies 5000 ms.
- Restored command delivery and HTTP admission have separate pending states. Exact
  intent identity survives retry; unavailable browser storage produces a warning
  without stopping current-tab delivery. HTTP admission/recovery has a deadline.
- Named room screens and typed popup bodies replace the oversized presentation
  coordinator. A game-independent contract and lightweight manifest bind the two
  existing registries. A test-only second descriptor exercises catalogue,
  preparation, settings, scoped actions and completion without changing room logic.
- Titles derive synchronously. Display countdowns subscribe locally rather than
  publishing a whole-room snapshot on every tick. Background settings saves retain
  the screen and footer controls.
- Ten official shadcn/Base UI primitives retain documented baselines. Shared CSS
  owns geometry; stale native-element selectors and no-op primitive options were
  removed. Settings chevrons follow Collapsible state.
- Identity editing uses a native form, associated validation and invalid-input
  focus. Nested popup Back retains the trail; X dismisses it. Copy feedback reserves
  space and remains repeatable.
- React lifecycle lint, AST/CSS source checks, baseline verification and literal
  translation-key checks augment strict TypeScript and regression tests.
- Build source fingerprints identify the served export. Building refuses an active
  preview on port 8787; `verify:preview` rejects an export from different source.
  Generated avatar staging now removes deleted assets. Obsolete Vite entry files
  and unused HTML-string QR code are removed.

React necessarily produces HTML, and Next produces an HTML export. These generated
files are not a second hand-maintained application. The approved HTML mockup and
immutable component baselines remain reference artifacts. Persisted-room backward
compatibility remains deliberate, not a legacy frontend renderer.

## Independent review

Separate logic and UX agents reviewed the stable correction diff without implementing
their reviewed changes. UX findings (nested menu trail, pointer validation focus,
typed dialog payloads) were fixed and focused rereview found no new confirmed defect.
Logic review identified recovery and initial-admission escape gaps; both were fixed
and focused rereview found no further confirmed defect. The final cosmetic participant
row-spacing fix also passed focused UX review. Reviews do not establish physical-device
acceptance.

## Verification record

103 tests passed across 18 files after the admission corrections. Strict typecheck,
React lifecycle lint, UI contract and production build passed. The isolated real
adapter suite passed admission/security/retry cases, practice plus two automatic
rounds, pause/reconnect/resume, replay, identity and an actual process-tree restart
with retained membership and exactly-once awards. The only later source change is
participant-row block spacing; UI contract and production build passed again.

Final source/export fingerprint:
`07fde14d5e9dc2444df9caaa948bb5a89cf7ce29fa4421cbe249a04f97d13f4d`.
Built at `2026-09-10T15:44:42.611Z`; `verify:preview` confirms the same source is
served at `http://127.0.0.1:8787`.

GitHub verification also passed for implementation `902e6a6`:
[push run](https://github.com/sellab-git/playai/actions/runs/34498452122) and
[PR run](https://github.com/sellab-git/playai/actions/runs/34498459426).
CodeRabbit's status explicitly says review skipped; it is not independent review
evidence. The two agent reviews described above provide the source review record.

Android host observations on Medium_Phone_API_36.1:

- Reload/rejoin; settings expansion and chevron; switch and round preset updates
  retain footer geometry; invalid 32 rounds disables Start, valid 2 restores it.
- Rules identify Blindstop; Back returns to the menu; backdrop and X dismiss.
- Invitation QR/code alignment, spaced controls and repeated copy feedback.
- Empty identity submitted with Enter shows linked validation; valid Enter saves
  and returns focus to the menu trigger.
- Unscored practice, two manual rounds, results remaining visible for over 30
  seconds until Next, final award, personal stats and replay retaining setup.
- Room standings retain one game/one point; sharing preview and native Android
  share payload use time-neutral copy and correct singular grammar. Nothing sent.
- Eight-player preparation, participant management and sharing layout using seven
  protocol guests. These guests are not guest-browser or physical-device evidence.
  Final row-spacing confirmation passed after rebuild; the last participant and
  Remove control remain reachable by scrolling.
- Closed-room summary retained all eight participants and the correct total.
  New room returned to a fresh Create form; synthetic guest clients were stopped.

The unmodified four-game reference at `http://127.0.0.1:8788` was inspected on the
same emulator: home, create, catalogue (including Bluff), preparation, practice
prompt, active timing and results. Preserve its hierarchy and visual language;
explicit user corrections supersede its underlined actions, manual settings flow
and time-of-day copy. This is a bounded visual comparison, not pixel-level parity
or complete device certification.

## Explicit limits

Only Blindstop is a production game. The three additional games remain mockup-only.
Two physical phones/laptop, human playtest and broader device/accessibility checks
remain separate gates. No production deployment, paid plan or merge is authorized.
Central translation registration is still explicit; a future additional game must
extend the existing registration boundary rather than introduce named-game branches
in room logic. Agent duration, token and cost data were not measured.
