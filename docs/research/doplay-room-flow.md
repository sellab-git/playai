# Room flow reconsideration — 2026-09-08

Status: approved by the user and implemented in the local mockup. This records the research and direction; DECISIONS.md describes current behavior. Game mechanics are unchanged.

## Research

No standalone competitor analysis was found in the current Playai documentation or handoff. Root README, ARCHITECTURE and SCREENS establish a persistent room, but do not resolve the current screen hierarchy.

Doplay was inspected at commit `d7a9bef3616a33e85a3ab575e3956504e5d4b413`: room page, LobbyGames, EntryForm, GameShell, session store, room types, reset route and stopwatch settings. Its public landing was inspected in visible Chrome. No multiplayer session was played; lobby findings are from source.

- [Doplay source](https://github.com/w84kubus/doplay/tree/d7a9bef3616a33e85a3ab575e3956504e5d4b413): `src/app/pokoj/[code]/page.tsx` combines participants, invitations, games and records. `src/components/game/LobbyGames.tsx` combines selection, rules, settings and start. Selection stays local to the host until start; guests see a waiting message. Copying this composition would not address the user's concern.
- `src/components/EntryForm.tsx` chooses identity before room entry. `src/lib/store/session.ts` remembers nickname/avatar and active room in localStorage independently of the game.
- `src/app/api/rooms/[code]/reset/route.ts` clears game fields and returns to lobby while preserving membership and records. GameShell's final action invokes that reset, not an immediate replay.
- [Jackbox](https://www.jackboxgames.com/how-to-play): select a game, gather players in its lobby, then start. Borrow the separation of selection and preparation, not its shared host-screen requirement.
- [AirConsole](https://airconsole.zendesk.com/hc/en-us/articles/360015054759-How-can-I-change-a-game): explicit Change Game returns to the catalogue; only the master controller selects. Its [controller guidance](https://documentation.airconsole.com/smartphones-as-controllers) recommends only currently needed inputs. Its TV/controller architecture is not our target.

## Diagnosis

The current Your room screen simultaneously presents an already selected game, settings, rules, participant statuses, evening points and Start. Choose game opens a dialog whose Play Blindstop button just dismisses it. Selection has no meaningful destination. Renaming Lobby did not fix that hierarchy.

Room data ownership does not require showing every room property on every screen.

## Proposed screens

Entry -> create/join with name and avatar -> Choose a game -> Blindstop preparation -> play -> results.

**Choose a game:** primary content is the actual game list, currently Blindstop only. A game entry opens preparation directly. No extra chooser modal or continue button. No settings, round counts, Ready statuses, full roster or Start action. Compact room code, participant count and invitation access remain in the header, so a host can invite before selecting. Full room details and evening standings are secondary menu content.

**Blindstop preparation:** game title, Back to games, one rules entry, visible round count and Auto-start next round control, immediate saving, stable scrollable participant list and fixed Start game action. Omit evening-point columns. Fewer than two players prevents start with a clear reason but allows preparation/inviting. Membership does not imply a readiness action: do not label everyone Ready without one. No new readiness feature.

**Guest views:** before selection, Waiting for {host} to choose a game; after selection, game title, read-only settings, participants, rules and Waiting for {host} to start. Only the host selects or starts. Selection changes the group's preparation view but never starts a round. This is proposed preview behavior; real synchronized selection remains future server work.

**Results:** Play again returns to the same game's preparation with retained settings. Choose another game returns to the catalogue. Both preserve code, identity, membership and evening points. These are group transitions controlled by the host; guests see waiting copy. Optional first-game practice keeps its existing skip behavior.

**Navigation:** menu Back returns one panel level; X dismisses it. During active play, changing games uses explicit end-game confirmation. Leave room remains separate from changing games. Avoid the ambiguous Lobby label.

## Boundaries and verification

Identity is chosen once before entry and editable through room details outside active play. Cross-refresh/device memory is a separate future decision. Keep the established ink/white visual style, stable avatars, scoring and manual/automatic round logic. No second game, account, backend, sound or TV screen.

Later implementation must check 2/20 participants, short-screen roster scrolling and reachable actions; host/guest selection and waiting states; manual results without countdown; Back/X focus; replay returning to preparation; game selection returning to catalogue; identity/points preservation without double-awarding. No changes to other NEXT proposals.
