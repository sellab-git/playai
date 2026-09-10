> Historical one-round restoration record. The later full-game extension and current evidence are in [full Blindstop](full-blindstop.md). Missing-scope statements below describe this earlier stage.

# Frontend restoration — 2026-09-10

## Reference and scope

Canonical source: `C:\AI biznes\40. Playai`. The registered Obsidian vault is
its `docs` directory. The visual reference is
`prototypes/blindstop/mockups/blindstop.html`, SHA-256
`86B390D9C5E6482257026695D7FC1F63A325CC37632C7084474397757CAE7F7B`.
The mockup was not modified or copied wholesale into the application.

The user resumed work after workspace reconciliation and authorized rebuilding the
frontend around the current reference while preserving the working backend.
The real server still supports one Blindstop round. This restoration does not
claim that all four mockup games have been ported.

## Implemented

- Separate home, create, join and retained-session presentation.
- Full 25-face chooser and preserved form drafts.
- Centered header, room menu, invitation code, identity-only preparation roster.
- Token-based geometry, typography, monochrome controls and avatar tiles.
- Large target, countdown and tap; private saved status without inventing which
  opponents submitted; own error, winner, avatars and ranked results.
- Local final-result view and server-authorized return to the room.
- Evening standings with competition ranks for ties, and confirmed room actions.
- Accessible dialog names, click/keyboard tap fallback and focus restoration.
  Countdown announcements use a persistent live region outside the rendered shell.

## Evidence

The 43 existing automated tests, TypeScript check, ESLint and production build pass.
Real local HTTP/WebSocket integration and isolated Wrangler process restart pass
again. No server/runner reducer behavior changed.

Lead Android Emulator observations of the real app on `http://127.0.0.1:8787`:
home, create, 25-face gallery, selected face retention, an eight-player preparation
roster, reload/rejoin with preserved identity, large timing target and real tap,
round result with own timing and seven missed guests, local final results, return
to the retained room, a subsequent countdown, tied evening standings and confirmed
close. Seven protocol clients joined
the real room; these are not guest UI or physical-device observations.

Earlier in this task, the same current mockup was viewed in the emulator across
home, create, catalogue, preparation/settings/practice, timing/final, and read-only
frozen countdown/waiting/result/evening/join/recovery states. Source-only independent
reviews identified layout/flow regressions; they do not count as visual evidence.

## Remaining differences and acceptance

Full visual and interaction parity is **not accepted**. Missing server-backed
scope: Impostor, Categories, Bluff, game selection, multi-round settings, practice,
automatic progression and room identity changes. Invitation currently exposes the
real room code; QR/link sharing and evening share are not implemented. Some recovery
artwork and final controls still differ from the mockup. Individual opponents'
submission status is deliberately not fabricated from an aggregate projection.

Two physical phones and a laptop, guest UI, human playtest, screen-reader timing,
keyboard-only full flow, and larger rosters remain open. The P1 physical acceptance
gate remains open. No merge, deployment or paid plan is authorized.

Independent source review corrections: keep rules behind the manifest, focus the
local final heading, remove misleading duplicate replay, update modal command
availability after acknowledgements, and use a truthful zero-game standings state.
The final independent source recheck found no remaining blockers in that scope.
Waiting presentation and assistive-technology announcements remain unverified in
the rebuilt runtime. The final CSS correction reserves the same footer metadata
height during countdown/timing and bounds the waiting tick to 32px; its build passes.

Linear project overview and SEL-25 were updated to the resumed restoration scope;
acceptance remains open. Local application: `http://127.0.0.1:8787`.
Unmodified canonical reference preview: `http://127.0.0.1:8788`.
