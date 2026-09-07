# Blindstop — build kit

A design and architecture package for a browser-based party game. Everything an agent
(Claude Code, Codex) needs to start building, without re-deriving decisions that have
already been made.

**Blindstop**: everyone gets the same target time, say 7.00 s. The screen shows no
clock. You count in your head and tap. Smallest error wins the round; smallest average
error over 10 rounds wins the game. One person creates a room, the rest join with a
five-character code or by scanning a QR code from the host's screen. No accounts, no
install — it runs in the phone's browser.

**The product is a room that games are loaded into.** Blindstop is the first game. The
room holds the players, the host and a running score for the whole evening; games are
loaded into it one at a time, and between games everyone stays put — nobody enters the
code twice. Only Blindstop is built in v1, and the game picker is not built until
there is a second game to pick, but the seam it needs exists from the first commit.

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
| `assets/avatars/*.svg` | 5 avatars, SVGO-optimised, ready to ship |
| `CLAUDE.md` | Project rules for Claude Code |
| `AGENTS.md` | Same rules for Codex |

## How to start

1. Open `mockup.html` on a phone. That is the target.
2. Read `docs/ARCHITECTURE.md`. The five decisions at the top are not up for
   renegotiation mid-build — changing any of them later means a rewrite.
3. Build stage 1 from `docs/ROADMAP.md`. Do not skip the gate at the end of it.

## Status

Nothing is built yet. This is design and specification only. The mockup is HTML, not
the app — do not use it as source. Use `docs/SCREENS.md` for content and
`src/tokens.css` for styling.

Two of the fourteen screens — the evening summary and the game picker — are specified
but not drawn.

## Before this repository goes public

- **Pick a licence.** A public repository with no `LICENSE` file is all rights
  reserved by default, which may or may not be what is wanted. Decide deliberately.
- **Resolve the avatar rights.** See `docs/DESIGN.md` § Licensing: the artwork's
  provenance does not clearly grant reuse, which is fine privately and not fine
  publicly.
