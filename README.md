# Playai — start here

The canonical local project is `C:\AI biznes\40. Playai`.
Open this folder for current files. Codex worktrees are temporary task checkouts,
not alternative project homes or Obsidian vaults.

| What you need | Current location |
| --- | --- |
| Latest four-game UX/UI reference | [Open the HTML mockup](prototypes/blindstop/mockups/blindstop.html) — Blindstop, Impostor, Categories, Bluff |
| Real local application | `src/` — server-owned room and complete Blindstop game |
| Current status and unresolved acceptance | [docs/status.md](docs/status.md) |
| Obsidian knowledge base | [docs/index.md](docs/index.md) — open this project's `docs` folder as the vault |
| Local server instructions | [Local development](docs/production/local-development.md) |
| Live tasks | [Playai in Linear](https://linear.app/sellab/project/playai-blindstop-prototype-a5d29f2f1dfa/overview) |

## Current state — 2026-09-10

The four-game HTML mockup contains the latest prototype interaction work, including
Bluff and the cross-game consistency changes. It is the visual and interaction
reference; simulated participants are not real multiplayer.

The real application now implements the complete Blindstop game: 1–20 rounds,
manual or automatic progression with pause, optional unscored practice, cumulative
results and retained settings for replay. The room supports shared preparation,
profile changes, invitations and evening standings. The other three game engines
remain in the HTML prototype only.

The local suite has 62 passing tests; typecheck, lint, build and the isolated real
adapter/restart suite pass. Android host evidence includes practice, two rounds,
final awards and replay. See [full Blindstop evidence](docs/validation/full-blindstop.md)
for the exact scope, independent reviews and remaining acceptance limits.

Two-phone/laptop acceptance, human playtest and broader device/accessibility checks
remain open. No merge into main, public deployment or paid plan is authorized.

## Historical material

`prototypes/blindstop/archive/` contains historical snapshots and generators.
The former root `mockup.html` is now
[archive/build-kit-mockup.html](prototypes/blindstop/archive/build-kit-mockup.html).
It is an early build-kit artifact, not the current design target. Git preserves prior
versions; do not create additional “latest” or “final” copies.
