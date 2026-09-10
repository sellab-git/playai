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

The audited Next.js/React/TypeScript correction is implemented and locally verified.
Current results: **103 tests in 18 files**, strict TypeScript, React lifecycle lint,
UI guardrails and production build pass. The isolated real adapter suite passes
practice, two rounds, automatic progression/pause, replay and actual process restart.
Independent logic and UX reviews passed the corrections.

Android host observations cover recovery, settings/presets/invalid input/switch,
copy/backdrop/nested rules, practice, two manual rounds, final stats, retained-settings
replay, room totals/native sharing and identity Enter validation/submission. The
eight-player roster used protocol guests; guest UI remains a separate open gate.
Physical two-phone/laptop checks, broader accessibility/device coverage and human
playtest remain open. This is not production acceptance.

Implementation commit `902e6a6` is published on [PR #1](https://github.com/sellab-git/playai/pull/1).
The temporary 9236 checkout was fast-forwarded to that implementation commit.
Both GitHub verification jobs passed for that implementation. Linear SEL-25 and
PR #1 record the corrected architecture, verification and remaining acceptance gates.
The correction evidence owns the latest served-build identity.

See [current correction evidence](docs/validation/frontend-correction.md).

The four-game HTML mockup contains the latest prototype interaction work, including
Bluff and the cross-game consistency changes. It is the visual and interaction
reference; simulated participants are not real multiplayer.

The real application now implements the complete Blindstop game: 1–20 rounds,
manual or automatic progression with pause, optional unscored practice, cumulative
results and retained settings for replay. The room supports shared preparation,
profile changes, invitations and room standings. The other three game engines
remain in the HTML prototype only.

Earlier [full Blindstop evidence](docs/validation/full-blindstop.md) describes the previous frontend and remains historical.

Two-phone/laptop acceptance, human playtest and broader device/accessibility checks
remain open. No merge into main, public deployment or paid plan is authorized.

## Historical material

`prototypes/blindstop/archive/` contains historical snapshots and generators.
The former root `mockup.html` is now
[archive/build-kit-mockup.html](prototypes/blindstop/archive/build-kit-mockup.html).
It is an early build-kit artifact, not the current design target. Git preserves prior
versions; do not create additional “latest” or “final” copies.
