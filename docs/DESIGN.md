> Accepted refinement — 2026-09-10: time-neutral room/game/results language; labelled Auto-start switch; transient copy confirmation with reusable action labels; results preview before native sharing. Pastel highlighter backgrounds may reuse avatar tokens for personal identity, invitation copy and result emphasis. Controls and icons stay monochrome. Input focus rings sit inside the field to avoid scroll-container clipping.

> Accepted UI correction — 2026-09-10: in-app actions must use buttons or icons, never underlined text. A downward chevron expands settings inline. Nested dialogs use a header Back arrow and an X to dismiss the whole stack; omit redundant Done/Back footer buttons. Keep explicit actions only where data is committed (Save changes, Use this face). Invitation QR and room code are centered; copy controls have a visible gap. These direct user corrections supersede conflicting historical mockup controls below.

> Current implementation preparation: [production readiness](decisions/production-readiness.md) and [gate/reconciliation table](planning/readiness-execution.md) supersede conflicting historical limits and behavior below. The fixed architecture and visual language remain binding.

> Production build-kit baseline. Current prototype work starts at [Project home](index.md); later accepted prototype decisions take precedence for the mockup.

# DESIGN — Playai

The visual language is a working document, not a party poster. Black ink drawings on
white paper, hairline rules, one warm near-black, colour only as pale tint or
highlighter. The reference points are Notion's own interface and the Notion-style
illustration work it is known for.

This direction is chosen, not derived. Do not "improve" it toward a game aesthetic —
saturated buttons, big radii, mascots with round eyes and drop shadows were tried and
rejected. If a change makes it look more like a mobile game, it is wrong.

## Tokens

See `src/tokens.css`. Never hardcode a colour anywhere else.

| Token | Value | Use |
| --- | --- | --- |
| `--pg` | `#FFFFFF` | page |
| `--bg2` | `#F7F6F3` | inset areas, disabled tiles, progress track |
| `--ink` | `#37352F` | all primary text, primary button fill, drawn strokes |
| `--ink2` | `#787774` | secondary text |
| `--ink3` | `#9B9A97` | captions, disabled text |
| `--on-ink` | `#FFFFFF` | text on an ink fill |
| `--ln` | `#EDECE9` | hairline row dividers |
| `--ln2` | `#DFDEDA` | interactive borders, dashed placeholders |
| `--mark` | `#FBF3DB` | highlighter behind text |
| `--tYel/tRed/tBlu/tGrn/tPur/tOrg/tPnk/tGry` | pale tints | avatar tiles only |

Eight tiles, not five: a room holds eight players and the tile is how you tell them
apart in a list.

**The single most important value is `--ink`.** It is a warm near-black, not `#000`.
Pure black on white reads sharp and technical and kills the paper feeling.

Colour never fills a button, never colours an icon, never marks a state, and **never
identifies a game**. It appears in exactly two places: behind an avatar, and as a
highlighter behind a word.

A per-game accent colour is the obvious way to build a game picker and it is ruled out
here. A grid of coloured game tiles is the single fastest way to turn this into
something that looks like every other party-game app. Games are told apart by their
drawn mark and their name.

## Type

**Inter**, weights 400 / 500 / 600. One family, no display face.

| Role | Size | Weight |
| --- | --- | --- |
| Hero title | 46 | 600 |
| Screen title | 26 | 600 |
| Big number (target, countdown) | 84–110 | 600 |
| Body | 16–17 | 400 |
| Row label | 15–16 | 500 |
| Caption | 12 | 500, `--ink3` |

Letter-spacing `-1px` on anything 26px and up. Sentence case everywhere; no all-caps
labels.

**Every number uses `font-variant-numeric: tabular-nums`.** This app is a column of
numbers; without it the results list jitters.

## Shape

- Radius 4px on controls, 6px on tiles and blocks. Nothing larger.
- Dividers 1px `--ln`, horizontal only. No boxes around list rows, no cards, no
  shadows anywhere in the app.
- Interactive borders 1.5px `--ink`.
- Primary button: solid `--ink`, white text. Secondary: 1.5px `--ink` outline.
  Tertiary: underlined text, offset 3px.

## Ink drawings

Illustrations, ticks, crosses and the stopwatch are drawn with the same hand as the
avatars: stroke 2–4 in the local scale, round caps, slightly irregular paths, solid
black fills for masses like hair.

The tick and cross in `src/tokens.css`'s companion sprite are hand-drawn on purpose.
**Do not replace them with Lucide or Tabler icons.** A geometrically perfect icon next
to a hand-drawn face is the single clearest way to break this design.

Two icons in the mockup are still from an icon font and need replacing: the QR glyph
and the wifi-off glyph. Buy or draw hand-inked versions. Everything else is already
in the right language.

**Each game carries one drawn mark** — the stopwatch is Blindstop's — referenced from
its manifest by symbol id and drawn in the same hand as everything else. That mark, at
two sizes, is the whole of a game's visual identity: no colour, no emoji, no icon
font. It appears on the game picker card and nowhere else during play.

## Avatars

`assets/avatars/face-NN.svg`, twenty-five of them, SVGO-optimised with no visual
change — the set averages 4 kB against 8.9 kB raw. Do this to every avatar you add.

- Crop with `viewBox="90 90 900 900"` — the source files are `0 0 1080 1080` with a
  lot of air, and uncropped the head looks small and lost in a tile.
- **The crop was `130 130 800 800` and it was wrong across a set this size.** It fills
  the tile better on a short haircut and clips the top of the hair on about a third of
  the faces, which reads as a rendering fault rather than a crop. One viewBox has to
  work for every face in the sprite; this is the tightest one that does. Checked in a
  browser at 44px and 64px over all twenty-five before changing it.
- The generator wraps the drawing in an `feMorphology` filter that paints a white
  outline. Strip it. On a coloured tile it separates the hair from the background and
  weakens the drawing.
- The face is filled white, so any tile colour works with no adjustment.
- Ship them as one `<symbol>` sprite and `<use>` it. The same file renders at 22px in
  a result row and 64px in a winner header.
- Assign face and tile colour deterministically from the player id, and keep both
  stable for the whole room, across every game played in it. **The tile colour is the
  player's identity** — the same colour must appear in the lobby, the waiting list,
  the results and the evening summary.

**Twenty-five faces are shipped and a room holds eight players**, so the join screen's
`Shuffle` link now has something to shuffle through and no two people in a room need
share a face.

At 44px a good half of them read as the same dark silhouette — this is a set of
line drawings in one hand, not a set of distinct characters, and it does not get
better by picking harder. **The tile colour is what tells players apart in a list**;
the face is what a person picks because they like it. Assign the colour first and make
sure eight in one room are eight different colours.

### Licensing

The avatars came from a Notion-style avatar generator. Its `LICENSE.md` is MIT but
the copyright line names the author of the Next.js starter template, not the
illustrator, so it does not clearly grant rights to the artwork itself. Fine for a
personal project. **Resolve this before shipping publicly or charging for anything**:
ask the maintainer, or commission an equivalent set. The style is not protected;
specific drawings are.

## Dark mode

Not built, and it is a real gap: this is a game played at 11 p.m. and a white screen
in a dark room hurts. The system is designed so the fix is eight token values, not a
redesign. Warm near-white text on `#191918`, same hairlines, tints replaced by dark
tints of the same hues. Follow the system colour-scheme preference.

## Checklist before calling a screen done

- No colour outside avatar tiles and highlighter
- No shadow, no gradient, no radius above 6px
- All numbers tabular
- Hand-drawn icons, not icon-font icons
- Reads correctly at 390×844 with 8 players in every list
- Primary action reachable by thumb, at the bottom
