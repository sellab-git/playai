# Known issues and verification gaps

## Confirmed limitations

- Local simulation only: no networking, server schedule, clock synchronization, or restoration after refresh.
- The embedded QR represents a room code rather than a working join URL. Clipboard and sharing behavior depend on browser support and origin.
- Visibility loss freezes local simulation; this is not the rule for a disconnected player in a real room.
- Historical participants with points remain visible as Left when preview size is reduced.
- CSS contains accumulated historical overrides. Avoid broad cleanup until it can preserve the accepted appearance.

## Open checks

- Physical phone touch, on-screen keyboard, safe areas, Safari, and screen reader behavior.
- Remaining membership and host edge cases. The preview is not a full room lifecycle implementation.
- Avatar artwork rights before product publication; the handoff does not resolve licensing.

## Resolved in the local review

- Focus loss after automatic-result menu rerenders and Pause/Resume. Verified in visible Chrome through Playwright MCP; see [VALIDATION.md](results.md).

- Bottom actions outside the viewport at 640×360.
- Leave/Rejoin abandoning an unfinished game instead of resuming the local preview.
- Paused-screen Back/Lobby paths silently abandoning the game.
- Rule copy failing to mention early completion when everyone has tapped.

See [LOCAL-REVIEW.md](handoff-review.md) for reproduction, fixes, and exact validation scope. Original handoff risks are preserved in `prototypes/blindstop/docs/handoff/KNOWN-ISSUES.md`.
