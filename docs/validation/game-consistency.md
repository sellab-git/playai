# Cross-game consistency — 2026-09-09

The user requested a joint review of Blindstop, Impostor, Categories and Bluff, specifically rejecting visible vertical scrollbars reintroduced by newer screens. Equivalent interactions must use the incumbent UI rather than a separate game-specific design.

## Findings and bounded changes

| Pattern | Finding | Resolution |
| --- | --- | --- |
| Scrolling | Rosters hid scrollbars; newer content bodies painted native rails | Shared `scroll-body` styling hides rails and gutters while preserving native touch/keyboard scrolling |
| Long lists | Impostor vote/results lacked the constrained body used by Categories and Bluff | Shared `long-list-shell` fixes the header/footer and scrolls the content, with nonshrinking list rows |
| Preparation | New games repeated their name below the shared game header | Keep the header name, compact description, settings/fixed-round summary, roster and bottom Start action |
| Waiting | Equivalent simulation controls had different labels; Impostor lacked the saved-state mark | Use Preview controls consistently for simulated waiting; keep the shared hand-drawn saved mark |
| Point results | Bluff put every revealed answer before the standings | Show truth and standings first; open Answer details in the existing dialog pattern |
| Rows | Vote/result rows differed in spacing and point-unit copy | Share row dimensions/alignment and round point units; retain avatars only where identity is public |
| Input | Bluff's draft field floated far from the question | Group question and input at the top, retaining the keyboard-aware footer shared with Categories |

## Differences retained deliberately

Blindstop needs precise timing, round progress and measured seconds; its bounded roster is already an established scrolling pattern. Impostor has private roles, spoken clues and a team outcome, not individual round points. Categories needs per-answer host validation and correction. Bluff hides answer authors until reveal and prevents voting for one's own merged answer. These are rules, not grounds for different navigation, button styling or scrollbar behavior.

## Review and verification

Terra's independent source audit identified unbounded Impostor lists and visible body scrollbars. Both findings were accepted. Final independent Sol logic/state and Terra UX/copy reviews passed with no confirmed remaining defects. All 18 VM groups pass. Source review is not device evidence.


The lead inspected 29 temporary screen fixtures in Android Emulator, spanning all four games and the 20-player Impostor vote/result lists. The fixture generator uses synthetic state and does not add controls to the shipped mockup. Lists retain scrolling with fixed actions and no visible rails. The original lower-row Impostor selection jumped to the top; the shared in-place selection helper fixes this for Impostor and Bluff. A final emulator check reached Maya by keyboard and selected that last row without moving the list, with Confirm vote still visible. Native wheel/swipe input was inconsistent in this retest, so it is not claimed as a fresh touch-scroll certification.

The revised Bluff result displays all eight standings and both actions in the emulator viewport. Its details dialog opens/closes without changing results. Categories now leads with the player's score. Preparation, saved-state marks, preview labels, vote confirmation labels and row sizes share the incumbent patterns. Timing, private roles and answer judging retain their mechanically necessary differences.

Remaining limits: generated-state inspection is not a complete end-to-end game playthrough. Physical phones, Safari, assistive technology, docked keyboards and real multiplayer remain unverified. Existing device gaps remain in SEL-16; user acceptance is pending.
