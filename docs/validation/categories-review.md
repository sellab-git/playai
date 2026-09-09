# Categories mockup review

Implementation base: 2d703e5. Scope: [one-round Categories](../games/categories/prototype.md). Worker: Sol, with lead integration. Delivery: [SEL-17](https://linear.app/sellab/issue/SEL-17/build-and-review-the-categories-mockup).

## Scope review

Terra identified ambiguity between per-category and per-answer approval. Accepted: the host judges each participant's answer individually, then confirms the category. Lead also clarified that Stop ends writing rather than waiting for every participant to press Stop, and that result copy should describe separate round points without internal implementation language.

## Final review and verification

Independent Sol logic review found three defects: backgrounding entered Blindstop pause/resume; early-finish confirmation lacked its own host guard; Stop lacked a readiness guard at the action boundary. Terra found inconsistent global-stop semantics. Lead corrected all four: manual Categories stays outside Blindstop timing, guards run at transitions, and all fixture sheets are frozen at Stop/early finish. Both focused re-reviews confirmed resolution with no further material findings.

Thirteen VM groups passed, including Categories normalized duplicate scoring, wrong-letter/blank/rejected answers, host guards, replay, local leave/rejoin, unchanged evening totals, background preservation and frozen sheets. The source review covers guest preview; it is not guest emulator evidence.

Android emulator portrait inspection covered fresh host entry, three-game catalogue, preparation, four-field entry (brazil, berlin, bear, bread), Stop, eight locked sheets, explicit preview disclosure, per-answer rejection, all four category confirmations and result. Rejecting the local country answer produced 15 points versus 20 for the unchanged fixture examples. Lists and final actions were visible for eight participants. Choose another game returned to the same room and three-game catalogue. No repeated 20-player or landscape matrix was run.

Open limitation: Android handwriting input overlays most of the bottom Stop control while editing. Its upper edge remained clickable and completed the round. Docked keyboard behavior, physical touch and guest/device checks remain open; do not claim full mobile acceptance. No server or real remote submission was tested.

## Keyboard follow-up — 2026-09-09

Base: 68ec8d5. A focused change gives only the Categories writing shell the visual viewport height and a scrollable body. The resize handler changes a CSS property without rerendering inputs or changing game state.

Android Emulator Medium_Phone_API_36.1, Chrome: reproduced the handwriting toolbar overlapping the bottom of Stop. After reloading the worktree-served update and entering Categories as host, focusing Country displayed the same toolbar with the entire Stop button visible above it. This was a targeted layout check, not another full scoring flow. Automated emulator input remained inconsistent; no new docked-keyboard, guest, 20-player Categories or physical-device coverage is claimed.

Independent Terra review of the stable HTML diff found no concrete defects. Source review confirmed focused inputs/drafts are not replaced and the change is limited to writing layout. All 13 existing VM groups and diff whitespace checks passed. The VM has no visualViewport stub, so it does not exercise the new browser API branch. Optional future browser coverage was suggested, not added to this bounded mockup fix. Artur owns Categories gameplay acceptance; SEL-16 retains device follow-up.
