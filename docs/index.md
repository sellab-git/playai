# Playai knowledge base

Canonical vault: `C:\AI biznes\40. Playai\docs`. This is the vault registered in
Obsidian. Temporary Codex worktree copies are not separate maintained vaults.
The current four-game HTML reference is
[the mockup](../prototypes/blindstop/mockups/blindstop.html); the real application's
UX/UI parity is unverified. Start with the reconciliation notice in Current status.

Read [Current status](status.md), [Working agreement](working-agreement.md), and the relevant current specification before work.

App UI testing and previews: Android Emulator only, per user instruction. Do not use desktop Chrome for the app. See [testing environment](working-agreement.md#required-app-testing-environment).

Live delivery: [Playai — Blindstop Prototype in Linear](https://linear.app/sellab/project/playai-blindstop-prototype-a5d29f2f1dfa/overview).

- [Production readiness decisions](decisions/production-readiness.md)
- [Execution gates and baseline reconciliation](planning/readiness-execution.md)
- [Shared game UI contract](design/shared-game-ui.md)
- [Human playtest packet](validation/pre-production-playtest.md)
- [Runner acceptance scenarios](production/runner-acceptance.md)
- [Local P1 development runbook](production/local-development.md)
- [Local room review evidence](validation/local-room-review.md)
- [Product vision and scope](product/vision.md)
- [Blindstop screen map](games/blindstop/screens.md)
- [Blindstop rules](games/blindstop/rules.md)
- [Impostor exploratory mockup](games/impostor/prototype.md)
- [Categories exploratory mockup](games/categories/prototype.md)
- [Bluff exploratory mockup](games/bluff/prototype.md)
- [Cross-game consistency review](validation/game-consistency.md)
- [Accepted prototype decisions](decisions/prototype.md)
- [Doplay research and room-flow rationale](research/doplay-room-flow.md)
- [Pre-production readiness and current Doplay recheck](research/pre-production-review.md)
- [Doplay Impostor mechanics comparison](research/doplay-impostor.md)
- [Known issues](validation/known-issues.md), [validation evidence](validation/results.md), and [regression scenarios](validation/scenarios.md)
- [Backlog proposal record](planning/backlog-notes.md)
- [Delegation pilot](planning/delegation-pilot.md)
- [Independent agent review](review-process.md)

## Vault and source ownership

Open this docs folder as an existing Obsidian vault. Ordinary relative Markdown links work in GitHub too; no community plugin is required. Local Obsidian settings are ignored by Git.

Linear owns live task status once the project is configured. This vault owns specifications, decisions, evidence and research, not a duplicate issue board. Notes are not automatically loaded into every assistant conversation; start from this index.

## Future production reference

The uppercase build-kit files are a production baseline: [Architecture](ARCHITECTURE.md), [Spec](SPEC.md), [Roadmap](ROADMAP.md), [Screens](SCREENS.md), [Design](DESIGN.md). Their production gates have not been completed. Current mockup decisions do not imply real multiplayer.

Historical handoff files and HTML versions remain under prototypes/blindstop. Redirect notes there lead here without duplicating maintained specifications.
