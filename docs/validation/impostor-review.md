# Impostor mockup review

Scope: working-tree extension based on f8c5986, one-round local Impostor and related documentation. Implementer: Sol; lead integrated corrections. Independent reviewers: Sol (logic/state), Terra (UX/copy).

Accepted and fixed: preparation Games action did nothing; rejoining could reveal a previously visible role; guest Impostor preview was unreachable; other votes were generated immediately without an explicit simulation action; role-preview scope was not explained. Added concealed rejoin, guest preview helpers, waiting state and nested simulation controls. Both reviewers completed focused re-review without further confirmed findings.

Rejected with rationale: a proposed pass-the-device reveal flow is not the product model. Each person uses their own phone; the local mockup represents one perspective, with explicit preview controls for alternatives.

Validation: twelve VM check groups passed after corrections, including existing Blindstop regressions, minimum/host restrictions, role concealment, vote confirmation, caught/tie outcomes, room-total preservation, guest preview, Games return and switching back to Blindstop. No production runner or real network exists.

Android emulator portrait inspection traversed the initial build: fresh host entry, two-game catalogue, preparation, concealed role, word reveal/hide, discussion, suspect selection/confirmation, result and same-room catalogue return. That loaded page predated the waiting-screen correction; do not claim visual verification of the final waiting/Preview controls screens. Those corrections have VM and source-review evidence only. The final file was refreshed to fresh entry for user review. Existing input-delivery and docked-keyboard gaps remain open. No full repeated mobile matrix was run.

Delegation pilot assessment after eleven assignments: retain bounded delegation with lead verification, but no measured cost-saving claim. The implementation required substantial lead integration; review found useful defects. Avoid assigning all shared-flow integration to a worker without a smaller checkpoint. Timing, token and cost data were unavailable.
