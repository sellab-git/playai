# Next.js migration: layered audit and correction plan

Date: 2026-09-10. Status: **not accepted as a clean foundation for additional games**.
Canonical workspace: `C:\AI biznes\40. Playai`.
Reviewed baseline: `788ab12a1a95aea44e4c91cc711ffe1994eefa7c` plus the current uncommitted migration.
The temporary task checkout has the same HEAD but does not contain the canonical uncommitted migration.

This audit records evidence and a proposed correction sequence. It does not implement the corrections or certify production readiness.

## Verdict and exact migration boundary

The running frontend really uses Next.js App Router, React and strict TypeScript. `src/app/page.tsx` renders the React application; it does not embed the previous renderer. The old Vite entry, `index.html`, string-based screens, imperative UI event binding and morphdom layer have been removed from the working tree. The Next frontend is statically exported and served by the same Cloudflare Worker as HTTP/WebSocket room operations. This is a valid Next architecture; using Server Actions, SSR or additional routes solely to claim broader framework use would not improve this game.

Nevertheless, the migration is not complete in the acceptance sense: there are two reproduced functional blockers, stale renderer artifacts, weak screen boundaries, incomplete styling/API adaptation and inconsistent build/documentation handoff.

| Question | Verified answer |
| --- | --- |
| Is there still an executable HTML-template renderer? | No active HTML injection/template mounting path found in `src`. |
| Is there any old markup-related code? | Yes: unused `qrMarkup()` returns an SVG string in `src/client/sharing.ts:7`; dead native details/switch/dialog CSS remains. |
| Is Vite still the app framework? | No. `src/client/env.d.ts:1` still references Vite types and should be removed. Transitive Vite used by Vitest is a separate, legitimate test dependency. |
| Should JSX, SVG and generated HTML disappear? | No. JSX is normal React; native semantic elements and hand-drawn SVG are appropriate. Next must generate HTML. The reference mockup remains separately under `prototypes`. |
| Is shadcn real? | Yes: ten official Base UI-backed components, original baselines, source inventory and installed CLI/skill. |
| Is shadcn used consistently enough? | No: overlapping control CSS, incomplete identity form composition and unsupported inherited variant props need correction. |
| Should all shadcn features be installed? | No. Use only components that solve actual interaction/accessibility needs. Do not add menus, toasts, forms libraries or extra state libraries merely for coverage. |
| Are the other three games implemented? | No. Only Blindstop has a real engine; the four-game HTML is the product reference. |

## Evidence and limits

- Re-ran `npm run typecheck`, `npm run lint`, `npm run verify:ui`, and `npm test`: all pass; **86 tests in 15 files**.
- `git diff --check`: no whitespace errors; Git reports expected CRLF normalization notices.
- The Impeccable static source detector returned zero findings. This did not detect the functional or stale-selector defects below; it is not acceptance evidence by itself.
- `scripts/probe-shadcn-mcp.mjs` connected to the pinned local shadcn MCP server, listed seven tools, read Playai's registry and successfully searched official button items. Project Codex configuration exists. This SDK probe does not prove this already-running conversation has hot-loaded native shadcn tools; CLI access remains an explicit fallback.
- Existing production Next export and real Worker response were previously verified, including matching inline-script CSP hashes. This audit did not rebuild or deploy the application.
- Complete adapter acceptance is **unconfirmed**: the initial HTTP/WebSocket suite passed; the earlier full-game run timed out, and the subsequent full-game/restart rerun had no retained final result before interruption. Do not inherit a pass from the pre-migration build or assume the timeout was only hot reload.
- Three independent read-only assignments covered architecture, state/logic and shadcn/accessibility source. Reviewers did not implement the migration. Root reviewed findings and observed Android.
- Android Chrome observations in this audit: catalogue, preparation collapsed/expanded, menu and invitation. Expanded settings retain a down-pointing chevron; invitation QR/code are centered and copy buttons have spacing. No visible link underlines were present in this sample.
- This is **not** complete visual parity evidence: every game phase, guest UI, keyboard/TalkBack, text scaling, eight-player layouts and multiple physical devices still require acceptance checks.
- Two additional temporary diagnostic tests reproduced the P1 defects below. Both passed by asserting the defective current behavior, then were removed. They are not counted as passing product regressions in the 86-test suite.

## Findings

### A01 — P1: time measurement is incorrect after fresh recovery into a round

`src/games/blindstop/GameScreen.tsx:136` captures the local round start before clock readiness is established. `src/client/room-client.ts:99–125` publishes the game snapshot after resetting the estimator, before the clock response. The stored start is never replaced for the same round after calibration.

Reproduction: render the active round uncalibrated; then supply a calibrated local start of 1000 ms and `performance.now()` of 6000 ms. The current TAP sends **0 ms**, not the expected **5000 ms**, because the initial epoch-based start produces a negative elapsed duration that is clamped to zero.

Correction: expose explicit clock readiness to the game contract, capture the round start only once calibration is valid, and preserve that calibrated capture across later interruptions. Add fresh reload/rejoin and countdown-calibration regression cases. Do not change scoring to compensate for a client clock defect.

### A02 — P1: pending delivery can lock both recovery actions

`room-client.ts:221–241` restores unresolved intents and computes `model.pending=true`, but waits for explicit resume before opening the socket. `App.tsx:86` disables both recovery buttons from that same flag.

Reproduction: valid saved membership plus an unresolved `leave` intent, followed by successful recovery lookup. Both **Rejoin room** and **New room** are disabled. A queued Start barrier has the same control dependency.

Correction: distinguish admission/recovery activity from command delivery. Recovery must allow reconnecting to resolve an existing action, or explicitly clearing local recovery state. Preserve exact action IDs during retries. Test pending gameplay, pending leave, settings plus queued Start, and unavailable recovery endpoints.

### A03 — P1: source, preview and handoff do not identify one accepted version

At audit time, `src/client/App.tsx` was last written at **13:44:41 UTC**, while `out/index.html` was built at **13:43:51 UTC**. The preview serves `out`, so it does not include the final source edits made after that build. A current source test pass is not proof that the user sees that source.

README, status, architecture and migration decision also still said Vite was running or migration had not started. Those current-state statements are corrected by this audit record, but the broader handoff remains uncommitted and unsynchronized with the task checkout/PR.

Correction: one build/preview workflow that stops or isolates the serving output during build and restarts only on success; record source/build provenance and expose it through a developer diagnostic, not normal product UI. Reconcile documentation, canonical checkout, PR and Linear against the same tested revision. Do not claim remote synchronization until verified.

### A04 — P2: screen and dialog code remains a compressed monolith

`App.tsx:33–120` combines entry, recovery, forms, catalogue, preparation, room summary, game integration, footer and navigation. `RoomDialogs.tsx:46–66` similarly contains many long conditional branches. `RoomDialogState.kind` is an unrestricted string, allowing invalid states to become runtime fallbacks.

Correction: meaningful files for the existing screens, a small room shell/coordinator, a discriminated dialog state union and a few named dialog bodies. Format readable TSX. Do not replace this with a generic navigation framework, schema-generated forms or many trivial wrapper files.

### A05 — P2: the future-game boundary still depends on Blindstop

`react-games.tsx:3,8` imports the generic screen prop interface from Blindstop. App imports the server engine registry for manifests. Frontend game modules are eager imports. The catalogue draws Clock for every game instead of using its manifest mark. Shared avatar/identity rendering is duplicated inside `GameScreen.tsx:88–107`; room standings use a Blindstop-specific translation key.

Correction: a generic typed frontend game contract; lightweight manifests and descriptor-owned title, rules, setup and mark; lazy game UI loading with a stable shell; common identity presentation. Bind registrations through tests. Keep game rules in game folders. Measure actual bundle contents before claiming engine code or all modules are necessarily shipped by the bundler.

### A06 — P2: title and timer state still have unnecessarily broad ownership

`GameScreen.tsx:138` writes the parent title in an effect; `App.tsx:80` reads that separately stored title. A phase transition can commit with the previous title before the effect corrects it. This is a source-established intermediate state, not a measured visible flash in this audit.

`room-client.ts:41–46,203–207` creates a new full UI model on countdown ticks; App subscribes to that whole model. React retains DOM identity, so this does not prove full reload or visible flicker. It does mean timer display still reconciles the whole application, contrary to the accepted local-timer design.

Correction: derive screen metadata synchronously through the game descriptor and subscribe the time display near the timer. Profile before introducing broad memoization. Keep authoritative full server snapshots as required; local render subscription granularity is a different concern.

### A07 — P2: old CSS and new primitive styles have overlapping ownership

`styles.css:164` targets `<details open><summary>`, but the current shadcn Collapsible renders a button with expanded state. The chevron therefore never rotates; confirmed in Android.

Input geometry is defined by `.field input`, `.round-setting`, and `.playai-input`; native switch and dialog selectors survive alongside new Base UI selectors. `styles.css` and `app/globals.css` both define control behavior.

Correction: one owner for shared primitive geometry/state, token values in `tokens.css`, screen CSS only for layout. Remove proven-dead selectors, map actual Base UI states, and retain focus rings that do not clip. Review copy-status placement too: hiding its empty region and centering a size-changing popup is a potential layout jump, not a confirmed capture in this audit.

### A08 — P2: identity forms are not fully composed or validated accessibly

`RoomDialogs.tsx:60` uses a standalone input plus button handler instead of a native form. Enter does not submit identity edits. Empty-name feedback is not linked to the input with invalid/described semantics. Entry forms use some Field components but retain older recipes.

Correction: a simple native form with official FieldGroup/Field/FieldLabel/FieldError, linked errors and explicit Save. Define focus after validation and nested face selection. No form-state dependency is justified by these few fields alone.

### A09 — P2: existing passing checks miss integration and lifecycle failures

Current tests separately exercise mocked RoomApp models, the transport service and GameScreen. They do not connect the actual App/room-client/clock/recovery seam that produced A01/A02. ESLint has JS/TypeScript recommended rules but no React hooks/Next lifecycle rules. The UI contract scans TSX only, ignoring executable TS/JS and CSS.

Correction: add cross-layer recovery/start tests, React lifecycle lint, focus/keyboard acceptance and source ownership checks covering relevant executable files/styles. Use syntax-aware checks where regex is unreliable. Do not turn arbitrary stylistic constraints into brittle tests.

### A10 — P2 robustness risk: storage failure can interrupt transmission

`room-client.ts:58,71–72` mutates pending state and writes session storage synchronously before transmission. A storage exception can abort that path. This is established from the code path, but not reproduced in this audit.

Correction: a small contained storage adapter with an explicit best-effort/failure policy, and tests for thrown reads/writes. Do not silently promise recovery when persistence failed.

### A11 — P3: stale code and unsupported component API remain

- Remove unused SVG-string `qrMarkup()` and Vite type reference. Keep actual React QR generation.
- ToggleGroup exposes spacing and sets `--gap`, but CSS fixes the gap independently. Switch/toggle expose size or variant options without corresponding behavior. Narrow the API or implement needed token-backed variants.
- Keep original shadcn baselines as comparison fixtures; they are not duplicate running applications. Keep generated `out` and avatar staging ignored; ensure staging also handles removed source assets.
- Audit central message registration and use typed keys where feasible; the existing `t(key: string)` silently falls back to a generic error on an unknown key.
- Do not remove legacy persisted-room compatibility until its storage migration/retirement policy is decided.

## Layer assessment

| Layer | Assessment | Action |
| --- | --- | --- |
| Next entry/build | Real migration; preview provenance incomplete | A03 |
| React composition/state | Working but oversized coordinator, duplicated derived state | A04–A06 |
| TypeScript/contracts | Strict compiler; shared boundary and dialog/i18n typing need improvement | A05, A09, A11 |
| shadcn/Base UI | Authentic sources; inconsistent adaptation and inherited no-op API | A07, A08, A11 |
| Transport/recovery/clock | Exact retries and queueing retained; two reproduced blockers | A01, A02, A10 |
| Pure engines/room runner | No new confirmed backend defect in reviewed scope; retain server authority, validation, projections and idempotency | Regression preservation |
| Provider/security | Same-origin Worker/SQLite Durable Objects, origin/credential checks and hashed hydration CSP retained | Adapter/restart gate; not a production security certification |
| UX/UI/accessibility | Core visual language retained; chevron defect and incomplete form/focus acceptance | A07–A09 |
| Tests/governance | 86 pass but coverage misses critical seams; static detector passes despite real defects | A09 |
| Docs/versioning/extensibility | Current-state drift and no accepted common foundation | A03–A05 |

Audit rubric, provisional source/sample-only: accessibility 2/4, performance 2/4, responsive behavior 2/4, token/theming consistency 3/4, implementation integrity 2/4 — **11/20**. This is a triage score, not WCAG, performance or cross-device certification. Dark mode is not an accepted requirement and is not penalized.

## Ordered correction plan and gates

### 1. Restore correctness and reliable recovery

Address A01/A02 first, followed by contained storage-failure handling. Promote the diagnostic reproductions into permanent regression tests that assert correct outcomes. Gate: real App/transport integration recovers with unresolved actions, waits for valid clock calibration and records correct elapsed time exactly once.

### 2. Establish the smallest reusable application structure

Extract existing screens and typed dialogs, move the game contract outside Blindstop, share identity rendering, and provide manifest-driven metadata/marks. Remove obsolete Vite/QR artifacts. Gate: another test-only game descriptor can use the generic contract without editing room logic or adding named-game branches. No second production game is required for this gate.

### 3. Finish shared controls and rendering behavior

Consolidate CSS, correct Collapsible state, narrow primitive variants, complete the native identity form, derive titles without effects and isolate timer display subscriptions. Gate: no unrelated DOM mutation during settings saves; stable heading/footer geometry; keyboard/pointer interactions and copy feedback work without unintended navigation or avoidable layout movement.

### 4. Validate the complete Blindstop experience against the reference

Run a screen/state matrix: entry/create/join/recovery; catalogue/preparation/presets/manual invalid input/switch; invitation/copy/QR; menu/rules/identity/participants; practice/countdown/tap/waiting; manual and auto result/pause/resume; final/details/replay; room totals/share/close; offline/rejoin/host change. Inspect on Android with the current HTML plus explicit user corrections. Include a guest and eight-player layout. Keep two physical phones/laptop and human playtest as separate acceptance gates.

### 5. Hand off one verified version

Run typecheck, lifecycle lint, source contracts, unit/integration and isolated real adapter/restart suites. Build the exact reviewed source, verify served build identity, repeat targeted independent reviews after material fixes, then update canonical docs, Linear and PR together. Retain incomplete external acceptance explicitly. No public deployment, merge or paid plan is included.

## What not to rewrite or add

Retain the pure engine, room runner, visibility layers, server-owned transitions, exact retries and same-origin backend. Do not introduce Redux/Zustand, a form library, a new database or Next server features without a concrete requirement. shadcn is a component foundation, not a replacement for application architecture. The objective is less duplicated state and fewer ownership boundaries, not maximum library usage.
