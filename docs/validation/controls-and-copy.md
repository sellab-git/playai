# Controls and language refinement — 2026-09-10

Base: 50930f6. Canonical workspace and Obsidian vault remain unchanged.

The user requested repeatable copy feedback, time-neutral positioning for couples
and groups anywhere, a recognizable Auto-start switch, visible manual results,
useful sharing, reference-style icons and more purposeful highlighter accents.

Copy actions retain their labels and briefly display a tick and live confirmation.
Room/game/results terminology replaces time-of-day assumptions in visible copy.
The switch and summary both use Auto-start on/off. The focus outline is inset to
avoid clipping in the scrolling body. Sharing first previews ranked room results,
with pluralized points and separate copy/native-share actions. Only text is shared;
no image card or external message was sent by the agent. Clock and door icons
restore relevant entry/recovery cues; form confirmations use hand-drawn ticks.
Pastel text emphasis is limited to personal identity, entry invitation and results.

Manual pacing is unchanged on the server: explicit host Next, plus the existing
15-minute inactivity safety deadline. New runner tests cover solo and two-player
results through alarms and persistence restoration. The UI previously sent TAP on
pointerdown; a newly rendered Next at the same position could receive its released
click. Next now requires its own deliberate press, retained across ordinary redraws;
keyboard/assistive activation remains supported. Two activation regressions cover
transferred clicks, redraws, subsequent rounds and non-pointer activation.

66 tests, typecheck, lint and build pass. Independent logic and UX source reviews
found a shared copy-status timer race; separate dialog status and button-label timers
resolve it, and both focused re-reviews pass. The optional zero-game highlight
remains for consistent focal hierarchy. Reviewers did not inspect Android.

Android confirmed the recovery door icon, labelled switch, inset field focus,
consistent Auto-start off summary, a manual round result retained for over eight
seconds until a separate Next press, final highlight, room standings, ranked
sharing preview and the same nonduplicated payload in Android sharing. The native
sheet was dismissed without sending. The isolated real adapter/restart suite passed. Physical-phone,
guest UI, large-roster, assistive-technology and human acceptance remain open.
