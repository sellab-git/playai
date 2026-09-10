# Blindstop screen map

Status: current standalone mockup, inspected 2026-09-08.

This map describes the screens that are actually rendered by
`prototypes/blindstop/mockups/blindstop.html`. It does not promote the wider
roadmap or the root specification's undrawn screens into implemented product
behavior.

## Route screens

| Route state | Purpose | Host primary action | Guest primary action | Transitions and back behavior |
| --- | --- | --- | --- | --- |
| `home` — Playai landing | Entry point for creating or joining a room. | **Create room** opens `form` in create mode. | **Join room** opens `form` in join mode. | No back action. The secondary action is the other room-entry path. |
| `form` — create room | Collect the local person's name and avatar before creating a room. | **Create room** validates the name and opens `catalogue`. | In join mode, enter the five-character code, name and avatar, then **Join room** opens `catalogue`. | Header back returns to `home`. Invalid name/code stays on the form and shows an error. The form's avatar chooser is a modal overlay. |
| `qrjoin` — QR-prefilled join | The same identity form with the room code supplied by the mockup's `#join` URL state. | Not a separate host flow; the create form remains available from `home`. | Confirm name/avatar with **Join room**; the code is hidden and prefilled. | Header back returns to `home`. This is a form variant, not a production QR route. |
| `catalogue` — Choose a game | Room-level screen after entry. Shows compact room code/participant context, invite access and the only listed game, Blindstop. | **Blindstop** opens `lobby` (preparation). The menu can manage the room, edit identity, show evening points, invite, or end the evening. | Waits for the host's selection; the guest has no game-selection action. | Header has no back button. The menu provides room actions; **Choose another game** from `final` also lands here. Ending the evening opens `summary`. |
| `lobby` — Blindstop preparation | Configure rounds/pacing, show the current participants, and explicitly start Blindstop. | **Start game** begins the optional first-game practice prompt or `countdown`; **Game settings** opens the settings modal. **Games** returns to `catalogue`. | Read-only settings and participant list; waits for the host's start. Preview controls can simulate host start and selection. | Header **Games** returns to `catalogue`; menu opens room/help/invite/management actions. A host can remove participants here. |
| `countdown` — round countdown | Shows the round label and target, then the three-second countdown before tapping. | Waits for countdown to reach zero; then enters `round`. Menu is available. | Same as host; the disabled **Get ready** slot is not an action. | This state is entered by starting a game or advancing a round. Leaving through the menu uses the leave flow and can produce `return`; visibility loss pauses into `paused`. |
| `round` — active timing | Hides the running clock while each person counts mentally and taps once. | **Tap** records the host's local tap; after all simulated/recorded results or the deadline, enters `roundResult`. | **Tap** records the guest's local tap; then waits in `waiting`. | Header menu is available. Only the first tap is recorded; later taps are ignored. Closest timing determines the winner. Leave/pause can lead to `return`/`paused`; the round closes after all results or target + 8 seconds. |
| `waiting` — waiting for results | Confirms the local tap (or miss) and shows which participants have recorded results without revealing values yet. | No primary action; waits for remaining participants/deadline. | No primary action; waits for the remaining taps/deadline. | Automatically enters `roundResult` when the round closes. Menu remains available. The displayed timing values are intentionally hidden until then. |
| `roundResult` — Round N results | Reveals the local error and the round ranking after all results are in. | Manual pace: **Next round**, or **See final results** on the last round. Automatic pace: countdown advances after 8 seconds; host may **Pause countdown** / **Resume countdown**. | Waits for the host's next action (or automatic advance). | Menu can open round details, overall results and rules; the host can stop the game; preview actions and leave are available. Opening the host menu pauses automatic progression until resumed or advanced. |
| `final` — game final results | Shows the Blindstop winner/overall standings and the local average/place. | **Play again** returns to `lobby` with room settings retained. **Choose another game** returns to `catalogue`. | Waits for the host's choice. | Menu can show personal stats, rules, or leave; participant management is unavailable here. The list is sorted for final standings; room membership and evening points persist. |
| `summary` — evening standings | Shows the running evening winner, totals and a short timing insight after the host ends the evening. | **Share** invokes the local share/copy fallback. **New room** returns to `form` in create mode. | Same actions in the mockup; there is no separate guest summary behavior. | No header back action. The screen is reached by confirming **End evening** from the room menu. |
| `return` — rejoin room | Displays the room code after the local person leaves a room/game and offers a way back. | **Rejoin room** returns to the saved room state (`catalogue`, `lobby`, `final`, or resumes the game where applicable). | Same. | **New room** starts a fresh create flow at `form`. Header back returns to home. The saved return destination is local mockup state. |
| `gone` — room unavailable | Error/recovery screen for a join code that does not resolve. | Not a host flow. **Try another code** returns to join `form`. | **Try another code** returns to join `form`; **Back to start** returns to `home`. | The mockup uses this when the entered code is not its preview code. |
| `full` — room full | Error/recovery screen for a full room. | Not exercised as a host route. | **Try again** returns to join `form`; **Back to start** returns to `home`. | The route renderer exists, but no normal UI action in the mockup currently drives it. |
| `playing` — game already in progress | Error/recovery screen for joining a room whose game is already running. | Not exercised as a host route. | **Try again** returns to join `form`; **Back to start** returns to `home`. | The route renderer exists, but no normal UI action in the mockup currently drives it. |
| `paused` — local game pause/reconnect | Holds the local game when the page becomes hidden or the preview simulates a disconnect. | **Continue game** restores the paused game; **Leave room** opens the leave confirmation. A simulated host handoff may change the host. | Same local controls in the preview. | **Continue game** returns to the saved game phase (`countdown`, active round, or results). **Leave room** continues to `return`. This is local pause behavior, not a synchronized connection protocol. |

## Implemented overlays and nested flows

These are modal states over a route screen, not additional routes. They are part
of the current interaction surface and are included here so the back behavior is
unambiguous.

- The room/game menu is available from `catalogue`, `lobby`, `countdown`,
  `round`, `waiting`, `roundResult`, and `final`. It can open rules, invite,
  room participants, identity editing, evening standings, settings/management,
  stop/end-evening confirmations, or leave confirmation according to the host
  and route. Nested menu views have **Back** and **Close**. Escape goes back one
  level, then closes the root menu; focus and scroll position are restored.
- Identity editing opens from the room menu in `catalogue`/`lobby`: edit name,
  choose one of 25 faces, and save. A face gallery also opens from the create or
  join form. These changes affect the local simulated room identity.
- Preparation settings open from the host's settings summary in `lobby`.
  Rounds are 1–20 and pacing is manual or automatic; valid changes save
  immediately. Guests see the resulting summary but cannot edit it.
- The first host start may show a practice confirmation. **Practice** runs one
  unscored round; the host then explicitly starts the real game from its results; **Start without practice** starts
  the real game. Practice is not offered again on a rematch.
- Round result details, overall results, personal stats, room participants and
  evening standings are read-only dialogs. Invite shows a QR image, room code and
  copy action. Share uses the browser share API when available, then copy or a
  text fallback.
- Destructive or leaving actions use confirmation dialogs: stop a game, end the
  evening, remove a participant, or leave the room. Confirming leave preserves a
  local return destination and opens `return`.

## Simulation boundary

The current file is a standalone HTML mockup, not a multiplayer client. It keeps
room and game state in browser memory, uses the fixed preview room code `K7QMX`,
and seeds a local roster of simulated players. Other players' taps are generated
by deterministic local timers; preview controls can select guest states, simulate
host start/selection, disconnect, and host handoff. No server, socket, durable
room, real cross-device synchronization, working QR join URL, or production
reconnect protocol exists in this screen map.

The screen transitions and copy above therefore describe the reviewable local
interaction model. Production must move room/game ownership to the server and
replace preview-only guest and bot transitions with validated network intents and
server broadcasts. The mockup's `paused` screen should not be read as proof that
one person's real connection loss pauses a shared game.

## Verification record

- Source read: `prototypes/blindstop/mockups/blindstop.html`,
  `prototypes/blindstop/docs/DECISIONS.md`, `prototypes/blindstop/README.md`,
  `prototypes/blindstop/docs/STATE.md`, and `prototypes/blindstop/docs/GAME-RULES.md`.
- Screen route names were checked against the mockup's renderer and action
  handlers, including the edge states and modal actions.
- The VM suite was run by the delegated author and passed. The parent corrected menu scope, practice progression, recovery labels and first-tap wording against source.
- This task did not run a browser or claim real multiplayer behavior. The source
  is a standalone mockup; visual/touch behavior and production synchronization
  remain outside this document's verification.
- Work window (UTC): started 2026-09-08T07:06:21Z; ended 2026-09-08T07:07:29Z.
