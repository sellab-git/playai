# Interaction simplification and solo Blindstop — 2026-09-10

Base: e5c4a1a. Canonical workspace and docs/Obsidian vault unchanged.

## Direct user corrections

Six user screenshots identified underlined Games/Invite actions, a misleading
settings chevron, redundant Done/Back controls, off-center invitation code,
joined copy controls and unclear identity editing. The user also explicitly
requested one-player play, preferring it to adding bots.

Implemented: no underlined action style; icon back navigation; inline native
settings disclosure with retained drafts and validated autosave; nested dialog
history with header Back and global X; only explicit commit actions in forms;
centered QR/code and spaced copy buttons; consistent entry copy allowing name
and avatar edits between games. Server validation still rejects profile changes
during a game. Blindstop's manifest now permits 1–20 players, with Play solo
for a one-person room. No game-specific branches were introduced in the core.

The QR encodes the actual room invitation URL (?code=...). The backend creates
and validates room codes; joining uses real HTTP/WebSocket membership.
The local 127.0.0.1 URL works in this computer/emulator setup only; it cannot
connect a friend's phone to this computer. Public sharing requires a reachable
application deployment/address, which was not authorized or performed here.

## Verification

62 tests pass. Solo runner regressions cover practice, two scored rounds, final
one-point award, replay, missed deadline/zero award, reconnect and the normal
60-second disconnected-player safety rule. Strict typecheck, ESLint and build pass.
The isolated real Wrangler admission/full-game/restart suite passes unchanged.

Separate independent reviews: backend solo behavior passed without findings;
UX source review found a disclosure-summary focus regression, fixed with a stable
ID and the existing focus restoration. Focused review confirmed this fix and found
a singular-copy encoding issue, also corrected. Reviewers did not inspect Android.

Android initial pass confirms the back icon, Play solo CTA, inline settings
expansion, menu without Done/Back footer, centered invitation and separated copy
controls. Final confirmation on the rebuilt app showed correct singular labels,
a scored solo round (8.62 s target, accepted tap, 2.41 s late), round results,
final results with exactly one point, and Play again returning to preparation.
The final independent UX source review passed after both fixes.
Physical-device, guest UI, large-roster and human acceptance remain open.
