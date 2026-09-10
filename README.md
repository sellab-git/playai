> Current production preparation: [readiness decisions](docs/decisions/production-readiness.md) and [execution gates](docs/planning/readiness-execution.md) supersede conflicting historical values below. The prototype remains local simulation; no production gate is passed.

> Current status (2026-09-10): the authorized direct Durable Object local P1 slice supports one Blindstop round. Automated tests (43), typecheck, lint, build, detector, local Wrangler HTTP/WebSocket integration, and real process restart pass; a bounded Android Emulator host flow passes with a protocol guest. Real-device/laptop, human playtest, and public deployment evidence remain open. Contract, runner, UI, UX, and logic reviews passed after corrections. See the [local room review](docs/validation/local-room-review.md) and [local development runbook](docs/production/local-development.md).

> [Project knowledge base / Obsidian vault](docs/index.md) - current scope, decisions and workflow.

# Playai — build kit

> Current work continues in [the Blindstop prototype](prototypes/blindstop/README.md).
> The later prototype decisions and [current state](prototypes/blindstop/docs/STATE.md)
> govern mockup iterations. The build kit below remains the historical production
> baseline; this does not start the application roadmap.

A design and architecture package for browser party games played by people who are in
the same room. Everything an agent (Claude Code, Codex) needs to start building,
without re-deriving decisions that have already been made.

**Playai is a room that games are loaded into.** One person creates a room on their
phone, everyone else joins with a five-character code or by scanning a QR code from the
host's screen — once, for the whole evening. The room holds the players, the host and a
running score across every game played in it. Games are loaded one at a time; between
them everyone stays put and nobody enters the code twice.

No accounts, no install, no app store. It runs in the phone's browser.

**Blindstop is the first game.** Everyone gets the same target time, say 7.00 s. The
screen shows no clock. You count in your head and tap. Smallest error wins the round;
smallest average error over 10 rounds wins the game.

Only Blindstop is built in v1, and the game picker is not built until there is a second
game to pick — but the seam both need exists from the first commit, because that is the
part that cannot be added later. `docs/ARCHITECTURE.md` is where that seam is written
down, and it is fixed decision 5.

**The product's public name is not settled.** "Playai" names the repository and the
platform in these documents; the landing screen in `mockup.html` still says
"Blindstop", which is right while there is one game and wrong the moment there are two.
Decide it before stage 3 paints that screen.

## What's in here

| File | What it is |
| --- | --- |
| `docs/SPEC.md` | Product spec — the room, the game, rules, copy, what is deliberately out of scope |
| `docs/ARCHITECTURE.md` | Runtime, the room/game seam, engine contract, clock sync, testing |
| `docs/SCREENS.md` | All 14 screens, one section each, with exact content |
| `docs/DESIGN.md` | Visual language — tokens, typography, ink rules, do/don't |
| `docs/DESIGN-BRIEF.md` | Handoff for a designer or design tool — what to read, what is fixed, what is being asked for |
| `docs/ROADMAP.md` | Staged build plan with a gate on every stage |
| `src/tokens.css` | The design tokens as CSS custom properties |
| `src/engine.ts` | The room and game contracts as TypeScript — start here |
| `mockup.html` | Standalone clickable mockup of 12 of the screens. Open on a phone. |
| `assets/avatars/*.svg` | 25 avatars, SVGO-optimised and cropped, ready to ship |
| `CLAUDE.md` | Project rules for Claude Code |
| `AGENTS.md` | Same rules for Codex |

## How to start

1. Open `mockup.html` on a phone. That is the target.
2. Read `docs/ARCHITECTURE.md`. The five decisions at the top are not up for
   renegotiation mid-build — changing any of them later means a rewrite.
3. Build stage 1 from `docs/ROADMAP.md`. Do not skip the gate at the end of it.

## Status

The repository now contains an early local P1 technical slice for one Blindstop
round. The mockup remains HTML and is not the application source. Local checks are
recorded in [the local room review](docs/validation/local-room-review.md); real-device,
human playtest, and public deployment gates remain open. Use
`docs/SCREENS.md` for content and `src/tokens.css` for styling.

Two of the fourteen screens — the evening summary and the game picker — are specified
but not drawn.

## Before this repository goes public

- **Pick a licence.** A public repository with no `LICENSE` file is all rights
  reserved by default, which may or may not be what is wanted. Decide deliberately.
- **Resolve the avatar rights.** See `docs/DESIGN.md` § Licensing: the artwork's
  provenance does not clearly grant reuse, which is fine privately and not fine
  publicly.
