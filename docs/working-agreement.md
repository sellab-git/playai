# Working agreement

## Sources of truth

- Linear: live issue status, priority, dependencies, milestone progress.
- Repository Markdown / Obsidian: product truth, rules, screen map, decisions, research, verification.
- GitHub: mockup/source, tests, commits and reviewable PRs. Do not create a second GitHub Issues backlog.
- Conversation: discussion; durable outcomes must be recorded in the appropriate source.

English for all durable work. User conversation may be Polish. Keep root AGENTS.md intact. Preserve history; distinguish Accepted, Proposed and Superseded decisions. Keep current local behavior, explicit simulation, and future production behavior separate.

## Delivery

Read index, status, relevant specification and the issue. Keep one primary issue in progress. Define problem, scope and acceptance criteria. For a significant UX change, review one representative screen and its transitions before expanding the design. Check the full screen map when navigation changes.

Implement a bounded change, run relevant checks, review results, update affected knowledge, commit/push and link evidence in Linear. Use portable GitHub links and issue URLs, not machine-specific paths in Linear.

Use native Backlog -> Todo -> In Progress -> In Review -> Done. No duplicate Ready/Review statuses. A blocked issue records the external action and next owner. User-facing changes awaiting playtest remain In Review; passing tests is not UX acceptance. Done requires acceptance criteria, verification, committed/pushed changes and accurate documentation.

## Shared Linear coordination

Use Sellab workspace and the existing Sellab team. Name projects `Product — Deliverable/Stage`; the current target is `Playai — Blindstop Prototype`, with project label Product: Playai. Keep projects bounded so completed work can archive. Do not create a separate Playai team.

The Diggai task reported migration completion on 2026-09-08 and verified [Sellab workflow settings](https://linear.app/sellab/settings/teams/SEL/workflow): one-month auto-archive, inactivity-based auto-cancellation disabled, PR merge to In Review, and parent/sub-issue auto-close disabled. Product project labels Diggai and Playai exist. The Free plan remains active. These checks were performed by the migration task, not independently repeated here.

Blocked status has a reported UI inconsistency: creation reports it already exists, but neither settings nor the issue picker exposes it. Do not retry creation. Keep blocked work in its current non-completed status, use native blocking relations for issue dependencies, and prominently record `Blocked`, the reason, and next-action owner in the description for external blockers.

The Free plan counts 250 non-archived issues across the workspace; completed issues still count until archived. Verified in Linear's plan screen on 2026-09-08. Review capacity around 180–200; never delete history merely to recover capacity.

## Delegation execution

The user approved explicit delegation to Luna, Terra and Sol for bounded tasks. Use short relevant context, an exclusive output path and a measurable result. Parent reviews all outputs. Keep architecture, whole-flow UX and final acceptance here. See [pilot log](planning/delegation-pilot.md). Evaluate after ten actual delegated tasks, not after ten tool calls. Record unavailable cost/token data as unavailable, never estimates disguised as measurements.
