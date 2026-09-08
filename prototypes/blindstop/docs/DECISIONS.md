# Accepted prototype decisions

Updated 2026-09-08 after the user approved the room-level UX proposal.

## Platform, room, and game

- The platform entry leads to creating or joining a room. Playai remains the working platform name, not a newly finalized brand decision.
- The room owns participants, names, avatars, host, invitation code, and evening points. A game runs inside that room. Finals offer **Play again** (return to preparation) and **Choose another game** (return to the catalogue), controlled by the host.
- Room entry opens **Choose a game**, with compact room context and invitation access. Clicking Blindstop opens a separate preparation screen with inline settings, rules, participants and Start game. No full roster, settings or Start action competes with the catalogue. Only Blindstop is listed.
- Names and avatars are chosen on room entry and can be edited from the room menu. They persist through games and rematches in the current local room. No account or cross-refresh persistence is added.

- Guests see explicit host-waiting states and read-only preparation. The previous timed simulated start after joining has been removed. Browser review can select guest states directly; this is not synchronized multiplayer.
- Participant rows say **In room**, not Ready; no readiness action is introduced. Evening points stay in room standings and finals.

## Game progression

- 2–20 active participants; 1–20 rounds, default 5. Keep fractional targets with two decimal places.
- **Auto-start next round** is off by default in every new room. Setup changes save immediately. Rematches retain settings; a game's pacing is captured at start.
- Manual results have **Next round**, or **See final results** after the last round. They never show countdown pause/resume controls.
- Automatic results wait 8 seconds. **Pause countdown** and **Resume countdown** name precisely what they control. Opening the host's results menu pauses the countdown until an explicit resume or next action.
- The active-round header is **Round N of M**. Results use **Round N results**, and the next button has no competing round number.

## Navigation and help

- Room and game have distinct menu titles and actions.
- A nested menu view has Back and Close: Back returns one level; Close exits the whole panel. Escape returns one level, then closes the root menu. Preserve focus and parent scroll position.
- Rules appear on the preparation screen, and in Game menu while playing. Do not duplicate them with a separate question-mark button on the same screen.

## Existing visual direction retained

- Standalone HTML with embedded original faces, white background, warm ink, pale avatar tiles, restrained decoration, no device frame or reviewer panel.
- Fixed participant order during the game and round results; sorted final and evening standings. Lists scroll without visible scrollbars or indefinitely shrinking rows.
- Dedicated Tap button, a single row of equal-height bottom actions, accessible light navigation buttons, and centered timing content.
- All 25 faces remain available. English interface copy; conversation in Polish. New durable project content is English.

Original v8 decisions are preserved in `handoff/DECISIONS.md`. The separate proposals in `NEXT.md` remain proposals unless explicitly listed here.
