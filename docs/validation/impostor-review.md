# Impostor mockup review

## Clue stage and role reminder follow-up

Based on 39149cd. Lead implemented the approved ordered clue stage and concealed role reminder; no final word guess or additional settings were added. Sol independently reviewed logic/state with no confirmed defects. Terra reviewed UX/copy and found one inconsistency: rules allowed a spoken clue while the screen requested one word. Accepted and clarified both rules and scope as one spoken word per participant.

Twelve VM groups passed after behavior changes. Focused assertions cover stable speaker order, speaker/host advance permissions, preventing early voting, completion into discussion, explicit guest simulation, assigned-role reminder independent of preview overrides, and secret removal on dismissal/backgrounding. The final subsequent edit only clarifies copy.

Android emulator portrait inspection of this follow-up covered host entry, Impostor selection, role reveal/hide, Clue 1 of 8, concealed My role, word reveal, hide-and-return to the unchanged first clue, and advancement to Mila at Clue 2 of 8. Queue completion and guest controls have VM/source evidence, not a repeated emulator flow. Earlier waiting-screen and keyboard coverage limitations below remain open. No production or multiplayer validation is claimed.

Scope: working-tree extension based on f8c5986, one-round local Impostor and related documentation. Implementer: Sol; lead integrated corrections. Independent reviewers: Sol (logic/state), Terra (UX/copy).

Accepted and fixed: preparation Games action did nothing; rejoining could reveal a previously visible role; guest Impostor preview was unreachable; other votes were generated immediately without an explicit simulation action; role-preview scope was not explained. Added concealed rejoin, guest preview helpers, waiting state and nested simulation controls. Both reviewers completed focused re-review without further confirmed findings.

Rejected with rationale: a proposed pass-the-device reveal flow is not the product model. Each person uses their own phone; the local mockup represents one perspective, with explicit preview controls for alternatives.

Validation: twelve VM check groups passed after corrections, including existing Blindstop regressions, minimum/host restrictions, role concealment, vote confirmation, caught/tie outcomes, room-total preservation, guest preview, Games return and switching back to Blindstop. No production runner or real network exists.

Android emulator portrait inspection traversed the initial build: fresh host entry, two-game catalogue, preparation, concealed role, word reveal/hide, discussion, suspect selection/confirmation, result and same-room catalogue return. That loaded page predated the waiting-screen correction; do not claim visual verification of the final waiting/Preview controls screens. Those corrections have VM and source-review evidence only. The final file was refreshed to fresh entry for user review. Existing input-delivery and docked-keyboard gaps remain open. No full repeated mobile matrix was run.

Delegation pilot assessment after eleven assignments: retain bounded delegation with lead verification, but no measured cost-saving claim. The implementation required substantial lead integration; review found useful defects. Avoid assigning all shared-flow integration to a worker without a smaller checkpoint. Timing, token and cost data were unavailable.
