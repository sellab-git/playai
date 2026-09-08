# Accepted prototype decisions

Updated 2026-09-08 after the user approved the room-level UX proposal.

## Platform, room, and game

- The platform entry leads to creating or joining a room. Playai remains the working platform name, not a newly finalized brand decision.
- The room owns participants, names, avatars, host, invitation code, and evening points. A game runs inside that room. Finals offer **Play again** (return to preparation) and **Choose another game** (return to the catalogue), controlled by the host.
- Room entry opens **Choose a game**, with compact room context and invitation access. Clicking Blindstop opens a separate preparation screen with one settings-summary action, participants and Start game. No full roster, settings or Start action competes with the catalogue. Only Blindstop is listed.
- Names and avatars are chosen on room entry and can be edited from the room menu. They persist through games and rematches in the current local room. No account or cross-refresh persistence is added.

- Guests see explicit host-waiting states and read-only preparation. The previous timed simulated start after joining has been removed. Browser review can select guest states directly; this is not synchronized multiplayer.
- Preparation participant rows show identity only. Repeated In room/Ready statuses and evening-point columns are omitted; no readiness action is introduced.

## Game progression

- 2–20 active participants; 1–20 rounds, default 5. Keep fractional targets with two decimal places.
- **Auto-start next round** is off by default in every new room. Setup changes save immediately. Rematches retain settings; a game's pacing is captured at start.
- Manual results have **Next round**, or **See final results** after the last round. They never show countdown pause/resume controls.
- Automatic results wait 8 seconds. **Pause countdown** and **Resume countdown** name precisely what they control. Opening the host's results menu pauses the countdown until an explicit resume or next action.
- The active-round header is **Round N of M**. Results use **Round N results**, and the next button has no competing round number.

## Navigation and help

- One preparation header contains Games, Blindstop and the menu. The menu stays at the right on catalogue, preparation and game screens. Rules and invitations are secondary menu actions; the catalogue also has a labeled invitation link.
- A nested menu view has Back and Close: Back returns one level; Close exits the whole panel. Escape returns one level, then closes the root menu. Preserve focus and parent scroll position.
- Rules are available through the menu during preparation and play. Do not duplicate them with a separate question-mark button on the same screen.

## Existing visual direction retained

- Standalone HTML with embedded original faces, white background, warm ink, pale avatar tiles, restrained decoration, no device frame or reviewer panel.
- Fixed participant order during the game and round results; sorted final and evening standings. Lists scroll without visible scrollbars or indefinitely shrinking rows.
- Dedicated Tap button, a single row of equal-height bottom actions, accessible light navigation buttons, and centered timing content.
- All 25 faces remain available. English interface copy; conversation in Polish. New durable project content is English.

Original v8 decisions are preserved in `prototypes/blindstop/docs/handoff/DECISIONS.md`. The separate proposals in [NEXT.md](../planning/backlog-notes.md) remain proposals unless explicitly listed here.

## Approved extension: one-round Impostor mockup

The user approved trying Impostor to validate private roles and voting within the existing room. This supersedes the mockup's earlier single-game catalogue restriction only. See [scope](../games/impostor/prototype.md). Preserve Blindstop and room identity. Do not add Impostor points to evening totals in this experiment. Bluff remains proposed; no production stage is started.

- Settings open in a named dialog from a summary such as **5 rounds · Manual**. Valid changes save immediately; Done returns focus to the summary.
- Leaving/rejoining completed results restores the final screen. Participant management is restricted to catalogue/preparation.
- Room recovery/error screens use Playai context; active-game pause retains Blindstop context. Explicit Preview controls can simulate host selection/start for guests.
