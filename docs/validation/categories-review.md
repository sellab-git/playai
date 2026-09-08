# Categories mockup review

Implementation base: 2d703e5. Scope: [one-round Categories](../games/categories/prototype.md). Worker: Sol, with lead integration. Delivery: [SEL-17](https://linear.app/sellab/issue/SEL-17/build-and-review-the-categories-mockup).

## Scope review

Terra identified ambiguity between per-category and per-answer approval. Accepted: the host judges each participant's answer individually, then confirms the category. Lead also clarified that Stop ends writing rather than waiting for every participant to press Stop, and that result copy should describe separate round points without internal implementation language.

## Final review and verification

Independent Sol logic review found three defects: backgrounding entered Blindstop pause/resume; early-finish confirmation lacked its own host guard; Stop lacked a readiness guard at the action boundary. Terra found inconsistent global-stop semantics. Lead corrected all four: manual Categories stays outside Blindstop timing, guards run at transitions, and all fixture sheets are frozen at Stop/early finish. Both focused re-reviews confirmed resolution with no further material findings.

Thirteen VM groups passed, including Categories normalized duplicate scoring, wrong-letter/blank/rejected answers, host guards, replay, local leave/rejoin, unchanged evening totals, background preservation and frozen sheets. The source review covers guest preview; it is not guest emulator evidence.

Android emulator portrait inspection covered fresh host entry, three-game catalogue, preparation, four-field entry (brazil, berlin, bear, bread), Stop, eight locked sheets, explicit preview disclosure, per-answer rejection, all four category confirmations and result. Rejecting the local country answer produced 15 points versus 20 for the unchanged fixture examples. Lists and final actions were visible for eight participants. Choose another game returned to the same room and three-game catalogue. No repeated 20-player or landscape matrix was run.

Open limitation: Android handwriting input overlays most of the bottom Stop control while editing. Its upper edge remained clickable and completed the round. Docked keyboard behavior, physical touch and guest/device checks remain open; do not claim full mobile acceptance. No server or real remote submission was tested.
