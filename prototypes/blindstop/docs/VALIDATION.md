# Validation

Run `node tools/check.cjs` from the prototype directory. Node.js 18 or newer is required; no package installation is needed. The suite reads JavaScript from the current HTML, not archived extracts.

The suite covers 2/8/12/16/20-player screens, full 1/5/20-round games, target generation, settings bounds, scroll state, final sorting, automatic progression, practice, completion-first ranking, ties, zero-tap games, pause/resume, host simulation, and menu details. Additional regressions cover leave/rejoin across countdown, counting, waiting, results, paused play, and an idle lobby.

All tests passed after the local fixes. DOM and time are simulated; these results do not prove visual layout, physical touch, accessibility, or multiplayer correctness.

Browser review covered 360×640, 393×780, 430×900, and 640×360 viewports with the scenarios and measurements listed in `LOCAL-REVIEW.md`. No physical phone, software keyboard, Safari, or screen reader test was performed. Automatic-result menu focus remains an open browser check.

The original validation record is preserved in `handoff/VALIDATION.md`.
