# Independent agent review

Accepted by the user on 2026-09-08. Applies to Playai work from this point onward; it does not retroactively certify existing work or change shared Sellab settings.

## When review is required

Before user handoff, significant changes require a separate reviewer agent that did not implement the change. Significant includes behavior, game rules, navigation, state/recovery, multi-file implementation, and substantive specifications or workflow changes. A typo, isolated link repair or factual status update may use lead verification only; record that limited scope in the handoff. Never split a significant change into trivial pieces to avoid review.

One reviewer is the default. Changes to behavior or navigation spanning two or more screens, or changing a complete room/game flow, require two independent reviewer assignments: logic/state and UX/copy. Purely cosmetic or typographical edits do not trigger this rule solely because they appear on multiple screens; apply the significance rule above. Review may run alongside unrelated useful work, but not while the reviewed files are changing. The lead owns integration and product decisions; reviewers advise and cannot expand scope.

## Initial model routing

| Scope | Starting model |
| --- | --- |
| Documentation, links, consistency | Luna |
| Small isolated UI or logic fix | Terra |
| Navigation, room state, rounds, multi-file behavior | Sol |
| Architecture or difficult cross-cutting risks | Astra |

These are pilot choices, not measured capability rankings. Increase reviewer capability when ambiguity or risk requires it. Reviewers are separate agents even when using the same model as the implementer.

## Review cycle

1. Prepare a stable diff, requirements, acceptance criteria, relevant specifications and actual test evidence. Identify the base commit and reviewed working-tree files or exact commit. List known limits without steering the reviewer toward a desired verdict.
2. Give the reviewer read-only ownership: inspect requirements, diff and relevant surrounding code independently. No edits, commits, tracker mutations or unrelated browsing. Tests may run if they do not disrupt other work. Coordinate exclusive browser access for live checks.
3. Require evidence for each finding: severity, file/location, reproduction or reasoning, user impact and violated requirement. Distinguish confirmed defects from questions and optional suggestions. Report reviewed scope and checks not performed, even when there are no findings.
4. The lead evaluates every finding and records accepted, rejected with rationale, or deferred with owner and tracking reference. Fix confirmed defects within scope. Material correctness defects or unresolved acceptance criteria prevent acceptance handoff; report blocked/incomplete status instead. Minor explicitly documented gaps may remain for user evaluation.
5. Run relevant checks after fixes. Material fixes require focused re-review, preferably by the original reviewer. Changes after review invalidate the affected portion of review. After one ineffective correction cycle, reassess or escalate rather than loop indefinitely.
6. Record the final reviewed scope/version and outcome. Agent review never substitutes for test evidence, physical-device checks or user gameplay acceptance. Do not call unavailable review passed; retain In Review and report the gap if a required reviewer cannot run.

## Recording results

Use the existing delivery issue, not a new issue for each agent invocation. Post a concise review record with reviewer/model, reviewed commit or diff, findings and dispositions, verification, remaining limits and next owner. Use a repository review note when detail warrants it and link from Linear/PR. Keep live status only in Linear.

An issue may be In Review for agent review or user acceptance; its latest record must state which and who acts next. Done still follows the working agreement. Do not create new shared statuses or alter PR automation for this process.

Count each completed reviewer assignment once in the existing [delegation pilot](planning/delegation-pilot.md); re-review of the same assignment is a correction round, not another task. Record duration and lead effort when measured, useful findings, rejected findings and post-review escapes when discovered. Unknown cost/token/time data stays unavailable. Evaluate after ten total completed delegated assignments, including implementation and review; do not infer savings from worker speed alone.
