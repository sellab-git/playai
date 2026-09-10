# Frontend correction execution

Authorized: 2026-09-10. Source: [layered audit](../validation/nextjs-layer-audit.md).

## Intended outcome

One canonical Next.js/React/TypeScript application, with real shadcn/Base UI controls,
correct session recovery and calibrated timing, stable screen updates, and a small
generic game contract. Full existing Blindstop behavior and the approved HTML visual
language remain the acceptance target. Additional production games wait until this
foundation passes. Preserve server-owned state, pure engines and existing persistence.

## Work packages and evidence

| Package | Scope | Completion evidence | State |
| --- | --- | --- | --- |
| Correctness | A01/A02/A10: calibration, recovery, storage failure | Permanent regression cases and App/transport integration; exact retry identity | Implemented and verified |
| Structure | A04/A05/A11: screens, typed dialogs, generic contract/manifests, dead code | Strict typecheck, registration contract, no game-specific room branches | Implemented and verified |
| UI behavior | A06/A07/A08: local timer, synchronous title, shared primitive CSS, forms/focus | Continuity and keyboard tests; Android state matrix | Implemented and verified |
| Guardrails | A09: React lifecycle lint, source/CSS ownership checks | Checks detect representative forbidden regressions and pass accepted code | Implemented and verified |
| Build handoff | A03: source/export provenance, one preview command | Exact built source fingerprint matches preview; isolated adapter/restart pass | Implemented; external handoff/gates tracked below |
| Acceptance | Complete Blindstop + independent logic/UX review | Findings resolved or explicit external gate, docs/Linear/PR consistent | Implemented; external handoff/gates tracked below |

## Minimal target structure

- `src/app`: Next document and application entry.
- `src/client/screens`: existing named room/entry screens; shell coordinates navigation.
- `src/client/dialogs`: typed popup bodies and native forms where appropriate.
- `src/components/ui`: approved shadcn primitives with one token-based styling owner.
- `src/client/game-contract.ts`: game-independent frontend boundary.
- `src/games/<game>`: game engine, lightweight manifest, preparation, projection and UI.
- Room client: socket/admission/delivery authority; display timers remain local to game UI.
- `src/room` and `src/provider`: retained server state and provider boundary.

## Verification order

First prove the two audit failures are fixed. Then verify refactored boundaries and
component interactions. Once source is stable, run all source checks and a production
build, then isolated real adapter/restart scenarios without source changes or hot reload.
Inspect Android against the current HTML and accepted user corrections. Perform
independent logic and UX review of the final stable diff and recheck material fixes.
Only then identify the canonical preview as ready for user evaluation.

Physical multiple-device and human playtest gates remain explicit. No public deployment,
merge, new database or extra production game is part of this correction.

## Current execution result

The audited Next.js/React/TypeScript correction is implemented and locally verified.
Current results: **103 tests in 18 files**, strict TypeScript, React lifecycle lint,
UI guardrails and production build pass. The isolated real adapter suite passes
practice, two rounds, automatic progression/pause, replay and actual process restart.
Independent logic and UX reviews passed the corrections.

Android host observations cover recovery, settings/presets/invalid input/switch,
copy/backdrop/nested rules, practice, two manual rounds, final stats, retained-settings
replay, room totals/native sharing and identity Enter validation/submission. The
eight-player roster used protocol guests; guest UI remains a separate open gate.
Physical two-phone/laptop checks, broader accessibility/device coverage and human
playtest remain open. This is not production acceptance.

Canonical changes remain uncommitted above `788ab12`; the temporary task checkout
is still at that HEAD without the working diff. PR/Linear synchronization is not
claimed. The correction evidence owns the latest served-build identity; do not
copy a fingerprint into this document.

See [correction evidence](../validation/frontend-correction.md) for final preview identity.
