# Playai — start here

The canonical local project is `C:\AI biznes\40. Playai`.
Open this folder for current files. Codex worktrees are temporary task checkouts,
not alternative project homes or Obsidian vaults.

| What you need | Current location |
| --- | --- |
| Latest four-game UX/UI reference | [Open the HTML mockup](prototypes/blindstop/mockups/blindstop.html) — Blindstop, Impostor, Categories, Bluff |
| Real local application | `src/` — server-owned room and one Blindstop round |
| Current status and unresolved acceptance | [docs/status.md](docs/status.md) |
| Obsidian knowledge base | [docs/index.md](docs/index.md) — open this project's `docs` folder as the vault |
| Local server instructions | [Local development](docs/production/local-development.md) |
| Live tasks | [Playai in Linear](https://linear.app/sellab/project/playai-blindstop-prototype-a5d29f2f1dfa/overview) |

## Current state — 2026-09-10

The four-game HTML mockup contains the latest prototype interaction work, including
Bluff and the cross-game consistency changes. It is the visual and interaction
reference; simulated participants are not real multiplayer.

The real application implements a local Durable Object room and one Blindstop round.
Its 43 automated tests, build, typecheck, lint and real adapter/restart checks pass,
including GitHub CI. The bounded Android host flow was exercised with a protocol guest.
**This does not establish UX/UI parity with the mockup.** The user reported substantial
differences. The screen-by-screen visual comparison is unfinished and UI acceptance
is open. Application and comparison work are paused until workspace, vault and tracker
reconciliation is complete.

Two-phone/laptop acceptance, human playtest and broader device/accessibility checks
remain open. No merge into main, public deployment or paid plan is authorized.

## Historical material

`prototypes/blindstop/archive/` contains historical snapshots and generators.
The former root `mockup.html` is now
[archive/build-kit-mockup.html](prototypes/blindstop/archive/build-kit-mockup.html).
It is an early build-kit artifact, not the current design target. Git preserves prior
versions; do not create additional “latest” or “final” copies.
