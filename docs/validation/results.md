# Validation

Run `node tools/check.cjs` from the prototype directory. Node.js 18 or newer is required; no package installation is needed. The suite reads JavaScript from the current HTML, not archived extracts.

The suite covers 2/8/12/16/20-player screens, full 1/5/20-round games, target generation, settings bounds, scroll state, final sorting, automatic progression, practice, completion-first ranking, ties, zero-tap games, pause/resume, host simulation, and menu details. Additional regressions cover leave/rejoin across countdown, counting, waiting, results, paused play, and an idle lobby.

All tests passed after the local fixes. DOM and time are simulated; these results do not prove visual layout, physical touch, accessibility, or multiplayer correctness.

Browser review covered 360×640, 393×780, 430×900, and 640×360 viewports with the scenarios and measurements listed in [LOCAL-REVIEW.md](handoff-review.md). No physical phone, software keyboard, Safari, or screen reader test was performed.

The original validation record is preserved in `prototypes/blindstop/docs/handoff/VALIDATION.md`.

## Automatic-result menu follow-up — 2026-09-08

Verified through Playwright MCP in a separate visible Chrome window with 20 preview players. Before the fix, Escape closed Options but left focus on BODY. Rendering now restores the corresponding action button, and opening details when results are already paused avoids another unnecessary render.

Browser assertions passed for Escape returning focus to Options; Round details and Overall standings returning focus after Close; remaining paused for 9 seconds after menu dismissal; Resume restarting the countdown (observed 7 seconds remaining); Pause and Resume retaining button focus; and manually advancing to and completing the next round. The browser was left on paused round-2 results for user review.

Both bottom buttons share their top edge and height, and fit within the viewport: y=580–630 at 360×640, y=719–771 at 393×780, and y=300–350 at 640×360. `node tools/check.cjs` also passes. The design detector again used its limited regex fallback and reported only the existing ink error border.

## Room-level UX review — 2026-09-08

The user-approved mockup now separates platform entry, room identity, game selection, and play. Regression tests cover immediate setup saving, manual pacing captured at game start, unnumbered Next round actions, identity and evening-point preservation across games, fresh-room defaults, and nested menu restoration.

Visible Chrome checks through Playwright MCP passed with 20 preview participants at 360×640, 393×780, 430×900, and 640×360. The room roster scrolls and bottom actions fit within the viewport. A manual round remained on its results after 9 seconds with no pause/countdown controls. Automatic results stayed paused after reading a nested menu and resumed only on explicit Resume countdown. Back restored the parent menu; Escape moved back one level and then closed, restoring menu-button focus. Editing a name/avatar and returning after a completed game preserved identity and evening points. Only one rules entry appears on the room screen.

`node tools/check.cjs` and `git diff --check` pass. The design detector used its regex fallback because optional parser dependencies were unavailable; its only finding was the existing ink error border. Physical-device and assistive-technology checks remain open.


## Separate catalogue and preparation — 2026-09-08

Visible Chrome via Playwright MCP: created a room, changed preview membership to 20, selected Blindstop, edited inline rounds, completed one manual game, returned through replay preparation and then the catalogue. Identity, game count and evening points were unchanged by those navigation actions. Manual results had no countdown control. Guest catalogue/preparation were inspected using explicit local state simulation: no select/start or editable settings controls, with host-waiting copy. Room participants -> Back -> Escape restored the menu then focused its invoker.

Preparation viewport checks: 360x640, 393x780, 430x900, 640x360. Document height matched each viewport; Start bottom edges were 630, 771, 888 and 350 pixels. All 20 rows existed and the roster scrolled. In short landscape the preparation body also scrolls so settings remain reachable. Screenshots inspected at phone and short landscape sizes. VM regressions additionally cover host-only transitions, catalogue leave/rejoin, and replay preserving identity/points. Tests do not prove real multiplayer or physical-device behavior.


## Full-flow clarity review — 2026-09-08

See FLOW-REVIEW.md for coverage and simulated-state limits. The navigation regression suite passes, including final leave/rejoin and explicit guest host-simulation. Preparation now uses a settings summary/editor; earlier inline-settings descriptions above are historical validation records.

Final browser confirmation also passed for QR-link identity entry and guest waiting, automatic results pausing for rules and resuming to final, nested Escape navigation, dialog accessible naming, and settings dismissal restoring focus to its summary. Chrome is left on preparation with 5 manual rounds.
# Knowledge migration verification — 2026-09-08

All eight VM check groups passed after the documentation migration. No mockup code changed. Visible Chrome smoke checks followed Playai entry, room creation, game selection and preparation at 390x844; preparation showed the default five manual rounds. This is a limited repeat check, not a new full-flow or physical-phone certification. Earlier full-flow evidence remains below.
