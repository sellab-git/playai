# DESIGN BRIEF — handing these screens to a designer

For a design tool or a designer picking this up cold. Everything needed is in this
repository; this file says what to read, in what order, what is fixed, and what is
actually being asked for.

## The product in five lines

A party game played in a room of people who are physically together. One person
creates a room on their phone, everyone else joins from their own phone with a
five-character code or by scanning a QR code. It runs in the browser — no app store,
no accounts, nothing installed.

The room is a container that games are loaded into one at a time, with a running score
across the evening. Blindstop, the first game, gives everyone the same target time —
say 7.00 seconds — shows no clock, and asks them to tap when they think it has passed.

## Read in this order

| # | File | Why |
| --- | --- | --- |
| 1 | `mockup.html` | **Open it on a phone first.** Twelve screens, clickable. This is the target, not an approximation of it. |
| 2 | `docs/DESIGN.md` | The visual language. **Binding, not advisory** — see below. |
| 3 | `docs/SCREENS.md` | All fourteen screens with exact content and copy. |
| 4 | `src/tokens.css` | Every colour, size, radius and weight. Nothing is invented outside this file. |
| 5 | `docs/SPEC.md` | Only if a screen's purpose is unclear. Product rules, not design. |

## What is actually being asked for

**Two screens need designing.** Screens 13 and 14 in `docs/SCREENS.md`:

- **13 — Evening summary.** Shown when the host ends the evening. The final table
  across every game played, a winner block, one observation, and a **Share** button.
  This is the only screen that gets seen by people who were not at the party, because
  it is designed to be sent to a group chat. It is also the product's only growth
  mechanism.
- **14 — Game picker.** Replaces the host's start button in the lobby once a second
  game exists. A vertical list of game cards. Not built in v1; designed now so the
  lobby has a place for it.

**Twelve screens do not need redesigning.** They are drawn, specified and deliberate.
Touch them only where screens 13 and 14 force a change — the lobby gains an evening
total per row and an "End the evening" link, and that is the extent of it.

If you believe one of the twelve is wrong, say so and say why. Do not quietly restyle
it.

## The constraints, and why they are not preferences

`docs/DESIGN.md` opens by saying the direction was **chosen, not derived**: saturated
buttons, big radii, mascots with round eyes and drop shadows were tried and rejected.
The failure mode of an unbriefed redesign here is entirely predictable — it comes back
looking like every other party-game app, which is the one outcome this design exists to
avoid.

Hard rules, all from `docs/DESIGN.md`:

- **No shadows. No gradients. No radius above 6px.**
- **Colour appears in exactly two places**: behind an avatar, and as a highlighter
  behind a word. Never a coloured button, never a coloured icon, never colour as a
  state indicator, and **never a per-game accent colour.** A grid of coloured game
  tiles is the fastest way to break this product's look, which makes screen 14 the
  most dangerous one in the set.
- **Hand-drawn ticks, crosses and marks.** Do not substitute Lucide, Tabler or any
  icon font. A geometrically perfect icon next to a hand-drawn face is the single
  clearest way to break the design. Each game is identified by a drawn ink mark and
  its name — nothing else.
- **`--ink` is `#37352F`, a warm near-black, not `#000`.** Pure black kills the paper
  feeling this depends on.
- **Every number gets `font-variant-numeric: tabular-nums`.** This app is a column of
  numbers; without it every list jitters.
- **Inter only**, weights 400 / 500 / 600. No display face.
- Dividers are 1px hairlines, horizontal only. No cards, no boxes around list rows.

## Canvas and delivery

- **390 × 844**, one artboard per screen. Mobile only — there is no desktop layout and
  no tablet layout.
- Every list must be checked **with eight players in it**. Eight is the room limit and
  it is where layouts break. Lobby rows are 44px with 7px gaps; the game result screen
  fits six rows comfortably and needs a stated compromise at eight.
- The primary action sits at the bottom, reachable by thumb.
- Respect the top safe-area inset — this is played on phones with notches, held badly,
  at 11 p.m.

## Copy

`docs/SCREENS.md` is the source of truth for wording and it is deliberate: sentence
case, no exclamation marks, the interface never apologises and never jokes. Propose
copy changes in text; do not improvise them into a design.

Every string in the built app comes from a translation key, English being the only
locale. That does not change what you draw, but it does mean **no string is decorative
or throwaway** — each one gets written down and translated eventually.

## Two things the design has to solve that the current set does not

1. **Dark mode does not exist and it is a real gap.** This is a game played at 11 p.m.
   and a white screen in a dark room hurts. The system is built so the fix is eight
   token values, not a redesign — warm near-white on `#191918`, same hairlines, tints
   replaced by dark tints of the same hues. If you have capacity, propose those eight
   values; if not, do not let it change any layout decision.
2. **Two icons are still from an icon font** and need hand-inked replacements: the QR
   glyph and the wifi-off glyph. Everything else is already in the right language.

## Known gaps, so they are not rediscovered

- Five avatar faces are shipped; a room holds eight players. Eight tile colours cover
  it, but the join screen's `Shuffle` link promises more faces than exist. At least
  three more are needed.
- The avatars came from a Notion-style generator whose licence does not clearly cover
  the artwork. Fine privately, not fine publicly — see `docs/DESIGN.md` § Licensing.
- Screens 13 and 14 are not in `mockup.html`. Everything else is.

## What not to decide alone

The look is settled and the screens are specified, so most decisions here are yours.
These are not:

- dropping or merging any of the fourteen screens
- changing the room or game rules to make a screen easier
- introducing a colour, a shadow, or an icon font
- anything that makes a game identifiable by colour rather than by mark and name

Raise these instead. This project has a small number of decisions that are expensive to
reverse and a large number that are cheap.
