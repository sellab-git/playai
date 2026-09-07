# Project rules — Blindstop

Read `README.md`, then `docs/ARCHITECTURE.md`, then `docs/ROADMAP.md` before writing
code. Build the current stage from the roadmap and stop at its gate.

## Non-negotiable

1. The server owns game state. The client sends intents and renders. It never writes
   state.
2. Game engines are pure functions. No `Date.now()`, no `Math.random()`, no I/O
   inside `reduce`. Time, randomness and the acting player come from `ctx`.
3. Three visibility layers — public, per-player private, server-only secret — exist
   from the start, even where Blindstop does not need them.
4. **The room is not the game.** Players, the host, the code and the evening's
   running total belong to the room and outlive any game. Nothing outside a game's own
   folder may read `gameId` and branch on it. Adding a game is a folder plus one
   registry entry, with no change to the core — if the core seems to need one, stop
   and say so.
5. Every user-facing string is an i18n key. English is the only locale. No literal
   copy in components, ever — game names and taglines included.
6. Colours, sizes and radii come from `src/tokens.css`. No hex values in components.

If a task seems to require breaking one of these, stop and say so rather than working
around it.

## Order of work

Write the runner's tests before adding a second feature to the runner. That layer —
sockets, storage, alarms, phase transitions — is ~250 lines and it is where the
defects are. The pure engine is the easy part and it is not where you should spend
your test budget first. The bottom of `src/engine.ts` lists the exact cases.

## Conventions

- TypeScript strict. No `any`. `npm run typecheck` is `tsc --noEmit` and runs in CI —
  the test runner uses esbuild and will not catch type errors.
- Time: `performance.now()` for measuring, never `Date.now()`. Read
  `docs/ARCHITECTURE.md` § clock synchronisation before touching the round.
- Server sends full state on every change. No diffs.
- One file per screen, named as in `docs/SCREENS.md`.
- Every input is validated at the boundary. A game's `parseAction` is that boundary
  for game actions; nothing reaches `reduce` unvalidated.
- A phase that waits on a player has a deadline. `endsAt: null` there is a deadlock.
- Commits are small and each one leaves the app runnable.

## Design

`docs/DESIGN.md` is binding, not advisory. The look is deliberate and was arrived at
by rejecting the alternatives. In particular:

- no shadows, no gradients, no radius above 6px
- colour only in avatar tiles and the highlighter — never a coloured button, never a
  coloured icon, never colour as a state indicator, and never a per-game accent
- hand-drawn ticks and crosses; do not substitute Lucide, Tabler or any icon font
- `--ink` is `#37352F`, not `#000`
- every number gets `font-variant-numeric: tabular-nums`

`mockup.html` shows the target. It is a mockup, not source — do not copy its markup
into the app.

## Out of scope

Anything not in `docs/SPEC.md`. Settings, a second game, the game picker, a second
language, sound, a TV view, accounts, payments. If you think one of them is needed,
say why instead of building it.

The invisible device identity is in scope and is not an account. Anything a person
would recognise as an account is out.

## When you are unsure

Ask. This project has a small number of decisions that are expensive to reverse and a
large number that are cheap. Guessing on the expensive ones costs a rewrite.
