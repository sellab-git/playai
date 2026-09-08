# Validation

Run `node tools/check.cjs` from the prototype directory. Node.js 18 or newer is required; no package installation is needed. The suite reads JavaScript from the current HTML, not archived extracts.

The suite covers 2/8/12/16/20-player screens, full 1/5/20-round games, target generation, settings bounds, scroll state, final sorting, automatic progression, practice, completion-first ranking, ties, zero-tap games, pause/resume, host simulation, and menu details. Additional regressions cover leave/rejoin across countdown, counting, waiting, results, paused play, and an idle lobby.

All tests passed after the local fixes. DOM and time are simulated; these results do not prove visual layout, physical touch, accessibility, or multiplayer correctness.

Browser review covered 360×640, 393×780, 430×900, and 640×360 viewports with the scenarios and measurements listed in `LOCAL-REVIEW.md`. No physical phone, software keyboard, Safari, or screen reader test was performed.

The original validation record is preserved in `handoff/VALIDATION.md`.

## Automatic-result menu follow-up — 2026-09-08

Verified through Playwright MCP in a separate visible Chrome window with 20 preview players. Before the fix, Escape closed Options but left focus on BODY. Rendering now restores the corresponding action button, and opening details when results are already paused avoids another unnecessary render.

Browser assertions passed for Escape returning focus to Options; Round details and Overall standings returning focus after Close; remaining paused for 9 seconds after menu dismissal; Resume restarting the countdown (observed 7 seconds remaining); Pause and Resume retaining button focus; and manually advancing to and completing the next round. The browser was left on paused round-2 results for user review.

Both bottom buttons share their top edge and height, and fit within the viewport: y=580–630 at 360×640, y=719–771 at 393×780, and y=300–350 at 640×360. `node tools/check.cjs` also passes. The design detector again used its limited regex fallback and reported only the existing ink error border.
