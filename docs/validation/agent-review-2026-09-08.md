# Independent mockup review — 2026-09-08

Baseline: c3066e0. Independent read-only reviewers: Sol (logic/state), Terra (UX/copy), and a separate detector assessment. Lead performed visible Chrome verification and implemented two bounded navigation fixes. Questions skipped: the user authorized review and confirmed-defect fixes.

## Findings and disposition

- Accepted: leaving play, using Back to home, then Join could bypass the preserved round and change the simulated player. Join now reopens the preserved return screen before changing identity. New room remains an explicit reset.
- Accepted: guest preparation omitted Games despite the documented shared header. Guests can now navigate from preparation to the catalogue; selecting and starting a game remain host-only.
- Rejected detector warning: the 2px ink border belongs to a form-error marker, not a decorative card accent. The detector used regex fallback because parser dependencies were unavailable; it did not establish computed contrast or complete accessibility coverage.
- Deferred to the existing physical/accessibility verification gap: countdown announcements and programmatic roster column relationships need assistive-technology assessment. Source concerns are not a claim that screen-reader testing passed. Track under SEL-16 with Artur/device testing and lead evidence collection.

Sol and Terra both completed focused re-review of the final HTML/test diff and found no material regressions. Nine VM check groups pass. Added coverage exercises Back -> Join -> Rejoin across five unfinished phases and guest catalogue navigation without host permissions. Final-result restoration retains its existing direct-Rejoin test; the detour was not separately automated for final results.

## Browser evidence

Visible Chrome exercised creation, selection, 20-player preparation, a full one-round manual game, final/replay, an automatic game and nested rules/menu navigation. Manual results remained after 8.5 seconds; opening automatic-result rules held the countdown paused past 8.5 seconds.

At 360x640, 430x900 and 640x360, the 20-player list reached maximum scroll, Start remained inside the viewport, and no horizontal document overflow was measured. These are browser viewport/DOM checks, not physical touch certification.

After fixes, UI clicks through Leave -> Back -> Join -> Rejoin restored the waiting screen with the identical player ID and saved tap. Guest preparation was explicitly synthesized in the local preview; clicking Games reached catalogue without a selection control. This does not verify networking or synchronized devices.

Review outcome: confirmed findings resolved; ready for user acceptance under SEL-15. Physical-phone, Safari and assistive-technology checks remain open under SEL-16. No production scope or future proposals implemented.
