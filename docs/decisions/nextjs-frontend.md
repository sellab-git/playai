# Next.js frontend correction — 2026-09-10

## Accepted direction and present state

The user explicitly requires Next.js and TypeScript and rejects further development of the custom imperative frontend. Use React with the Next.js App Router. This resolves the former Next.js-or-Vite choice in ARCHITECTURE.md. The frontend has now been migrated to React and the imperative renderer removed. The audited correction is implemented. The [historical audit](../validation/nextjs-layer-audit.md) preserves original findings; [current evidence](../validation/frontend-correction.md) records 103 passing tests, build/adapter/restart checks, independent reviews and Android observations. Physical-device, guest UI and human playtest gates remain open. The evidence record owns current build identity.

Canonical source remains C:\AI biznes\40. Playai. Baseline HEAD is 788ab12; existing uncommitted source/tests/docs must be preserved and assessed, never silently reset. The task worktree remains at that baseline and is not the current handoff. No new latest/final app copies.

## What is rebuilt and what is retained

| Area | Decision |
| --- | --- |
| App entry and build | Replace Vite entry with Next.js App Router, React and strict TypeScript. Pin compatible supported versions during implementation. |
| Room shell and screens | Replace string templates and imperative event binding with TSX components. Do not mount the old app inside a React wrapper. |
| Dialogs, settings, footer and roster | Shared React components with explicit props, stable identity and controlled local state. Preserve the accepted visual tokens and hand-drawn assets. |
| Browser transport | Extract socket/session/clock/outbox lifecycle from main.ts into a browser-only service with subscriptions and a React boundary. Never create sockets during render or module evaluation. |
| Server and game rules | Retain src/engine.ts, src/room, src/provider and pure Blindstop engine. Keep existing provider-independent boundaries and server-owned state. |
| Settings command buffer | Retain the delivery requirements and regression scenarios; review the uncommitted code before reuse. No generic rewriting of game-specific Start settings. |
| Imperative DOM layer | Remove morphdom, patchHtml/on helpers, template rendering and associated compatibility code at cutover. Do not carry two live renderers forward. |
| Tests | Keep runner, engine, protocol and adapter tests. Port useful DOM/transport regression scenarios to React; do not treat the old 82-test result as migration evidence. |
| Design | Current four-game HTML plus explicit subsequent user corrections is the reference. Reimplement components from observed screens; do not paste mockup markup/scripts into production. |

## State and interaction architecture

One stable room client owns the connection for the mounted room membership. Next server components provide the document/layout and static content; browser interaction and live room state stay behind a client component boundary. React Strict Mode mount/cleanup cycles must not create duplicate active connections or stale subscriptions.

Separate three kinds of state:

1. Authoritative versioned server snapshot: room, players, game phase, result and acknowledgements.
2. Local UI state: open modal and its navigation stack, expanded settings, focus and unsubmitted form input.
3. Delivery state: active intent, exact retry identity, queued latest settings and any ordered subsequent command.

A snapshot update must not recreate the entire component tree. Do not key the room shell by snapshot version, pending state or countdown seconds. Use player IDs for rosters and phase/round identity only where an interaction must truly reset. Timer updates belong near the displayed timer. Do not call router.refresh, reload, navigate or global loading for ordinary settings acknowledgements.

Settings controls respond locally; server acceptance determines saved authority. Preserve the latest draft across older acknowledgements. Keep ordinary save copy and unrelated controls stable. Display actionable failure and reconnect information. Start waits for the latest settings delivery and uses the game adapter's derived settings, including practice. A rejected prerequisite cancels the queued Start. Never queue or coalesce timing taps as settings.

Dialogs are UI state, not routes. X and backdrop dismiss the whole popup, nested Back returns within its stack, and focus returns to the trigger. Disabled/pending feedback belongs to the relevant action. Preserve keyboard, screen-reader and pointer safety, including no click-through from TAP to Next.

## Backend, origin and local development

Keep the accepted Cloudflare Durable Objects backend. Next.js is the frontend framework; this instruction does not authorize a Firebase/Supabase migration. Durable room ownership, alarms and WebSockets remain in the backend, not in a Next page request or browser timer.

Before UI migration, prove the frontend/backend connection using a single browser-facing origin with HTTP and WebSocket routing to the local services. Preserve the adapter's exact Origin checks and opaque body/frame credentials; do not disable origin validation to make development work. Verify upgrade forwarding, forwarded URL/origin handling, recovery and reconnect in an integration test. Choose and document the local routing mechanism at that gate; do not assume an HTTP-only proxy handles WebSocket upgrades. Hosting/public deployment remains a separate unapproved step.

## Migration order and acceptance gates

1. Preserve the baseline and current edits, establish Next.js build/typecheck/test configuration, and verify browser-only transport initialization and same-origin HTTP/WebSocket routing.
2. Implement one complete representative flow: entry, room preparation, round presets/manual input, Auto-start, invite/menu/rules and Start. Compare visually in Android Emulator against the current HTML and explicit user corrections. Test rapid edits, delayed/out-of-order acknowledgements, errors, reconnect and focus retention before expanding.
3. Port the full existing Blindstop flow: practice, countdown, tap, waiting, manual/automatic round results, pause, final standings/details, replay, room totals/sharing and identity editing between games. Preserve room/game registration boundaries.
4. Run existing backend/adapter checks and new React integration regressions. Validate development Strict Mode and production build. Inspect the complete flow in Android Emulator. Obtain independent logic/state and UX reviews of a stable diff; previous reviews do not cover this migration.
5. Switch the canonical local command and preview to Next.js, remove the obsolete Vite frontend/DOM renderer/dependencies, update README/architecture/status/Linear/PR and synchronize the task checkout. Do not expose two ambiguous current application URLs.

The four-game mockup defines the extensible UI reference. Only Blindstop is presently implemented as a real engine; this correction does not silently expand backend scope to the other three games. Android host roster coverage includes eight protocol participants; physical-device, guest UI and human acceptance remain open.

## Sources checked

- [Next.js server/client component boundary](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React component identity and state retention](https://react.dev/learn/preserving-and-resetting-state)
- [Cloudflare Durable Objects WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)

These explain supported mechanisms, not proof of this application's performance. The intended behavior must be tested in the migrated app.


## Accepted component foundation: shadcn/ui

The user requested shadcn as the basis for the Next.js rebuild. Use shadcn/ui
components in the React frontend, adding only the components needed by the flow:
Button, Input, Label, Switch, Collapsible and Dialog initially. Component source
lives in the project and is adapted centrally to the existing design tokens.
Tailwind/shadcn semantic variables must reference the canonical token values, not
create a competing palette or spacing system.

Preserve the HTML reference, hand-drawn icons, avatar artwork, ink colour,
restrained highlighters, no shadows/gradients and maximum 6px radii. Do not accept
shadcn default styling or bundled icon choices as a design override. Keep i18n
keys in app components. Verify modal focus, keyboard handling, X/backdrop closure,
switch semantics and touch interactions after customization.

shadcn supplies editable component foundations; application state, command
ordering, server authority and rendering continuity remain application
responsibilities. This records the chosen foundation; current correction evidence records its
installation and local validation, with external acceptance kept separate. Official references: [introduction](https://ui.shadcn.com/docs),
[Next.js setup](https://ui.shadcn.com/docs/installation/next),
[theming](https://ui.shadcn.com/docs/theming).


## Registry-first delivery procedure

Follow [shadcn sourcing and maintenance](../design/shadcn-workflow.md), audited
against projects 36/42 and current official sources. Select the Base UI foundation;
install real official components, inspect add overwrite diffs, record local
adaptations, and establish CLI/skill/MCP access at the foundation gate. These
setup steps have since been implemented and probed. The correction passed local
checks and independent reviews; external acceptance remains open as recorded in
[current evidence](../validation/frontend-correction.md).
