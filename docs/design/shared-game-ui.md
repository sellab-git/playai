# Shared game UI contracts

## Status and scope

This is a production-facing UI contract derived from the current standalone Blindstop
mockup and the accepted Impostor, Categories, and Bluff prototype briefs. It does not
change game rules, room policy, timeouts, or cross-game scoring. Those decisions belong
in the [production-readiness decision](../decisions/production-readiness.md).

**Currently implemented in the mockup** means local, simulated state. It is useful as
an interaction reference but does not prove socket delivery, server secrecy, reconnect,
or deadline behaviour. **Production contract** below applies once the server owns state.

## Shell and overflow

### Current incumbent

- Each game screen uses one three-row shell: a hairline-separated header, `minmax(0, 1fr)`
  body, and fixed bottom actions. The header uses left navigation, a centred truncated
  title, and an optional right menu.
- The body is the only normal scroll region. `scroll-body`, rosters, dialogs, and long
  lists hide native scrollbar rails and gutters while retaining native touch, wheel, and
  keyboard scrolling. Long-list screens keep their preparation/focal content and rows
  nonshrinking.
- The form and writing shells use visual viewport height so the bottom submit action
  remains above an open software keyboard. On short screens, content scrolls; header and
  actions stay reachable.
- Rows use stable avatar/name/value positions, ellipsise names, and preserve tabular
  numerals. Bluff answer text may wrap anywhere rather than force horizontal overflow.

### Production contract

- All game views must render through the same shell contract. A game supplies its header
  title, body content, and up to two bottom actions; it must not create a second fixed
  footer or independently scroll the page.
- The shell body has `min-height: 0; overflow-y: auto; overscroll-behavior: contain`.
  Hide scrollbar paint without disabling native scrolling or reserving a gutter. Do not
  communicate scrollability only with a visible rail.
- Keep header and footer visible at 390 x 844 and with an open keyboard. Long content,
  including 20-player candidate/result lists, scrolls between them. Preserve focused row
  and `scrollTop` across a state render when the server confirms an in-place choice.
- Truncate a header title and single-line player label; expose the full value through an
  accessible name. Permit question, answer, status, and explanatory text to wrap with
  `overflow-wrap: anywhere`. Numeric columns remain nonwrapping and tabular.
- Use the existing tokens, hairline rules, 4/6px radii, hand-drawn marks, and neutral
  ink actions. Do not add a game-specific accent, decoration, settings surface, or
  feature to solve a layout problem.

## Forms and actions

### Current incumbent

- Identity and join forms have labels, inline help, a persistent error region, one
  primary submit action in the shell footer, and an explicit `form` association.
- Categories and Bluff preserve an active draft without rerendering the focused input.
  Their keyboard-aware footer remains visible. The room-code field is one uppercase
  five-character input, allowing paste.
- Candidate and option rows use `aria-pressed` for a reversible selection. A separate
  primary action opens confirmation before the vote is cast. Submitted/waiting screens
  show the hand-drawn tick and a saved/locked message.

### Production contract

- A form action sends an intent; it does not locally commit server state. Preserve the
  typed draft while an intent is pending, after a recoverable failure, and after a state
  update that represents the same editable phase. Clear or replace it only when the
  confirmed private/public state says the phase has advanced.
- Enter submits the focused form when its primary action is enabled. Multiline fields
  keep Enter for a newline; submit remains the footer button. On validation failure,
  retain focus, place the keyed error in the alert region, and do not erase inputs.
- Selection is provisional and reversible: render it with `aria-pressed="true"`; the
  footer describes the next irreversible intent. A confirmed submission/vote is frozen
  until the server gives a later phase. Do not label a local selection as saved.
- Disable a primary action only for locally knowable validity or while its identical
  intent is pending or its acceptance is unknown. A stale server rejection routes to authoritative state and shows the
  returned keyed error; restore an action only if that state still permits it. Never silently retry into another phase.

## Delivery, stale state, and reconnect

### Production contract

The client renders the latest full server state. It may track delivery locally, but
that status cannot overwrite the game phase or invent a result.

| Local delivery state | UI treatment | Suggested i18n key |
| --- | --- | --- |
| intent pending | Keep the action unavailable; show a quiet footer status. | `delivery.sending` |
| server state confirms the intent | Freeze the action and enter the confirmed waiting/result view. | `delivery.saved` |
| definitive server rejection | Restore the applicable action only if current state permits it; retain draft/selection and show an alert. | `delivery.failed` |
| connection ended before confirmation | Preserve the local draft/selection only as a draft; show reconnecting state. | `delivery.unknown` |

- `delivery.saved` is permitted only when an authoritative acknowledgement or current server state proves acceptance.
  If the socket closes after send but before confirmation, use `delivery.unknown`, never
  a success claim. Keep irreversible actions unavailable while acceptance is unknown and resolve or retry only the original actionId after reconnect. Allow a new logical action only when authoritative state proves the original was rejected/not applied and that same phase still permits it. A visible editable draft must not create a second logical submission. Once a newer full state arrives, it wins over local pending state.
- On reconnect, preserve visual continuity with a quiet reconnect status, request/render
  current full state, then replace the old phase without asking the player to replay an
  intent. If the current phase has passed, show a keyed explanation and route to the
  authoritative phase. Do not restore a private reveal merely because it was visible
  before disconnect/backgrounding.
- A stale action rejection is expected when another player or an alarm advances a phase.
  It must announce the keyed stale message and redraw the returned full state. The
  product decision for whether a host can pause, advance, or recover a timed phase is
  outside this contract; follow production-readiness decisions when present.

## Waiting, privacy, host, and outcomes

### Current incumbent

- Waiting uses a tick/locked mark, a personal saved message, aggregate progress where
  rules allow it, and a footer status. Blindstop conceals timing results while players
  finish. Impostor conceals roles/word after hiding, backgrounding, leave/rejoin, and
  role-reminder dismissal. Bluff conceals truth/authors until reveal.
- Non-hosts see a named host-decision status where hosts receive the primary advance or
  replay action. Preparation views have the same roster and host-gated start placement.
- Result screens place the outcome/own result and standings in the main body. Blindstop
  may show a round/overall view; Bluff places truth and standings first, then opens
  answer provenance/authors/fooled counts in a dialog.

### Production contract

- Public/private projections are distinct from server-only state. A client game view receives only
  its public view plus the authenticated player's private view. Never infer a secret
  from hidden DOM, an offscreen row, cached markup, aria labels, or a client-side game
  branch. Clear/conceal private panels on visibility loss and reconnect until the server
  reauthorizes their private view.
- A waiting view may name the current actor and show aggregate counts only when its game
  rules make them public. It must never reveal another player's unconfirmed answer,
  vote, timing, role, truth marker, or author. Use the same saved-state mark for a
  player-confirmed action across games.
- Host identity comes from room state on every full update. When it changes, replace
  host-only controls and announce the new host using a polite status. Do not preserve a
  departed host's local affordances. The selection and fallback policy for host transfer
  is a room decision and is intentionally not specified here.
- A result view answers what happened and what it means to the player before any
  expandable detail. Put shared outcome, player score/place, and standings in the main
  screen. Put audit/provenance material (for example answer authors, source, fooled
  counts, historical measurement breakdowns) behind a keyed **Details** action/dialog. Details
  must not alter results or hide the available host/participant next action. Keep the current result measurements needed to understand ranking, including Blindstop errors, in the main standings.
- Display only the game's own score units and the room total only when the authoritative
  state has applied a decided conversion. Do not imply that exploratory raw points were
  added to the evening total.

## Accessibility contract

- Give the shell footer's changing, noncritical status a single `role="status"` /
  `aria-live="polite"` region. Update it only on meaningful delivery, waiting-count,
  host, reconnect, or phase changes; do not announce every timer tick or render.
- Put validation and failed/stale-action messages in one `role="alert"` region associated
  with the relevant form/control. Announce private content only while it is intentionally
  revealed. Decorative marks and avatars are hidden from the accessibility tree unless
  their identity is otherwise unavailable.
- Use real buttons for actions, labelled controls for fields, `aria-pressed` only for
  reversible selected choices, and native dialog semantics with focus returned to the
  invoking control. Focus must remain reachable by keyboard at the last player/option in
  a long list without moving the selected row out of view.

## Required strings

All production copy is an i18n key. The following suggested English defaults cover the
new shared states; game-specific wording remains in each game namespace. Use retryAvailable only after a definitive not-applied outcome while the current phase still permits the action. Use alreadySubmitted only when the authoritative response proves an existing accepted response; otherwise use a neutral rejection.

| Key | English default |
| --- | --- |
| `delivery.sending` | Sending… |
| `delivery.saved` | Saved |
| `delivery.failed` | Could not save. |
| `delivery.retryAvailable` | Your action was not saved. Try again. |
| `action.permissionLost` | You can no longer perform that action. |
| `action.alreadySubmitted` | Your response is already saved. |
| `action.conflict` | This request could not be applied. Your saved response is unchanged. |
| `delivery.unknown` | Checking whether your action was saved… |
| `connection.reconnecting` | Reconnecting… |
| `connection.updatedPhase` | The game has moved on. |
| `action.stale` | That action is no longer available. |
| `room.hostChanged` | {name} is now the host. |
| `shared.waitingForHost` | Waiting for {name}. |
| `shared.details` | Details |

## Implementation checklist

- Reuse the shared shell, footer status region, scroll-body rules, long-list rules, and
  keyboard-aware form variant before adding a game-specific screen.
- Validate game input at `parseAction`; render its keyed rejection and the authoritative
  full state rather than adding client game-state mutation.
- Write runner tests for duplicate, late, rejected, disconnected-before-confirmed, and
  reconnect-after-phase-change intents before treating this contract as production-ready.
- Keep prototype simulation labels explicit. Do not use their local transitions as
  evidence that the production delivery/recovery contract works.
