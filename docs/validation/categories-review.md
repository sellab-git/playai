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

## Clarity refinement — 2026-09-09

Base: c31b230. Approved scope: provisional answer points/reasons, descending competition standings with ties, host correction of earlier categories before finalization, and writing progress/global-stop help. Review and final scores share categoryBreakdown; Previous preserves all judgments. No scoring rules, rounds, settings or evening totals changed.

Independent Sol logic/state review found no confirmed defects. Terra UX/copy review found a P2: judging a lower row reset scroll and focus to the first player. Accepted and fixed by restoring the review body position and the exact player control after rerender. Both focused re-reviews passed. Fourteen VM groups pass, with added checks for actual input-listener updates without form replacement, completion/reversion hints, per-answer reasons, duplicate recalculation, correction/rejoin, guest and finalized-state guards, descending order, tied ranks and exact row focus/scroll. Diff whitespace checks passed. These tests remain a VM complement to UI inspection, not multiplayer evidence.

Android Emulator Medium_Phone_API_36.1, Chrome, eight-player host flow: verified empty/partial filled count and completed global-stop hint; Stop locked the sheets. Local keyboard test entries were B/Y/Y/B, not meaningful game answers. Reviewed unique, duplicate, wrong-letter, blank and rejected explanations. Scrolled down and rejected Noah's Brazil: his score became 0, Mila's Brazil became 10, and the visible scroll position stayed unchanged. Confirmed City, used Previous, verified the saved rejection, restored Noah and saw both Brazil answers return to 5. Continued through Animal/Food and Show results. Rejected local Food; results placed seven 20-point fixtures jointly first and the local 10-point player eighth. All eight result rows and footer actions were visible. This verifies layout and transitions, not dictionary validation. Emulator is restored to fresh entry for Artur.

The floating on-screen keyboard can cover fields or Stop depending on its position; dismissing it exposes the controls. Handwriting-toolbar clearance remains verified. Docked keyboard, guest UI, 20-player Categories, assistive technology and physical-device checks remain open under SEL-16. Artur owns gameplay acceptance in SEL-17. No new large test matrix was run.
