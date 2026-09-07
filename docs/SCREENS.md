# SCREENS — Playai

Fourteen screens. Six are the game loop, two are entry, two are the room, four are
edges. Open `mockup.html` alongside this file.

**Twelve of the fourteen are in the mockup.** Screens 13 and 14 — the evening summary
and the game picker — are specified here and not drawn yet. The picker is not built in
v1 at all; it is written down so the lobby is designed with a place for it rather than
around its absence.

Every in-game screen carries the same header: room code on the left, `Round N of 10`
on the right, both 12px `--ink3`. That header is the only thing telling a player where
they are — it appears on countdown, round, waiting and result.

---

## 1. Landing

Ink stopwatch (118px), title `Blindstop`, two lines of body:
`Seven seconds, no clock.` / `Closest guess wins.` — "no clock" carries the
highlighter. Two buttons at the bottom: **Create room** (primary), **Join with code**
(secondary). Caption under them: `2–8 players · a round takes 20 seconds`.

The top third is deliberately given to the drawing. Do not fill it with feature bullets.

With a second game this screen becomes the platform's landing rather than one game's,
and the title, the drawing and the two lines all change — the name on it today is a
game's, not the product's, and the product's is not decided. Nothing structural
changes. Do not build a wordmark around either name.

## 2. Join form

One screen for both paths, tabs `Create` / `Join`. Create hides the code block; name
and face survive the switch.

- Room code: 5 boxes, 1.5px `--ink` border, filled ones show the character, the next
  one is `--ln2` with a `·`
- Your name: no input box — a line of text on a 1.5px bottom border
- Pick a face: 4-up grid of tiles, selected one gets `outline: 2px --ink` with 2px
  offset. A `Shuffle` text link, because four tiles do not suggest there are more.
- Primary button: **Join room** / **Create room**

A player arriving from a scanned QR code lands here with the code already filled, on
the `Join` tab. That path is the common one at a party and must not look like an
error state.

## 3. Lobby — host

Room code at 46px with 4px letter-spacing, QR button to its right. `Players` / `5 of
8` caption row. Then rows: tile, name, and on the right either `you · host`
(highlighter) or a hand-drawn cross to remove. Last row is a dashed tile and
`Free seat`.

Primary button: **Start · 10 rounds**.

Once the room has played at least one game, two things appear:

- each player row carries their evening total, right-aligned, tabular
- a secondary text button: **End the evening**, which closes the room and shows
  screen 13 to everyone

With a second game the primary button is replaced by the picker (screen 14) and this
one keeps its shape. Leave room for that; do not centre the button against the bottom
edge in a way that only works with one control there.

Eight players fit at 44px rows with 7px gaps. Test that before changing spacing.

## 4. Lobby — player

Identical, minus every host affordance: no crosses, no start button, no end-the-evening
link. The host's row says `host` in plain caption, your own row carries the highlighter
`you`. Where the button would be: a dashed outline reading `Waiting for Artur to
start`.

Evening totals appear here too, on the same terms.

## 5. Countdown

Header, then centred: `Everyone ready`, and the digit at 110px inside a hand-drawn
ink ring. Three seconds, synchronised across devices. No input accepted.

This is the moment clock sync is visible. If the rings tick at different times on two
phones in the same room, the sync is wrong.

## 6. Round

Header, then a solid `--ink` block filling the rest of the screen. Inside, centred:
`Stop at` at 15px 60% opacity, the target at 84px, a 90px gap, and `Tap` at 30px.

**Nothing else on this screen.** No timer, no progress, no player list, no count of
who has already tapped. The player is counting in their head; every readable element
is a cost. An earlier draft had "2 people still counting" here and it was wrong.

The whole block is the tap target.

## 7. Waiting

Header, hand-drawn tick at 46px, `Locked in`, `Waiting for 2 more`. Then the player
list: those who tapped get a hand-drawn tick, those still counting are `--ink3` with
a `--bg2` tile and the caption `counting`.

Names, not a dot counter — so everyone knows who to shout at. Your own error stays
hidden until the result.

## 8. Round result

Header, then the round's winner: their tile at 56px, `Mila nails it` with the name
highlighted, and `0.04 s off · target 7.00`.

Below, the error scale. `early` and `late` captions at the ends. One row per player:
a 22px face chip, the name, the signed error right-aligned, then a 7px track with a
centre tick and a bar running left or right from the middle. Scale is fixed at ±1.5 s
and clamped.

The face chip is what makes this readable at a glance — without it every bar is the
same black and you are back to reading names.

Bottom: a 3px progress track and `Next round in 3s`. **Auto-advances.** No button.

## 9. Game result

The end of one game, not of the evening.

Header shows `Final`. Winner block: 64px tile, `Mila wins`, `0.19 s average error`.
Ranked list, winner's row on a `--bg2` band. Each row carries the points that row just
earned toward the evening, as a caption: `+5`. Then a blockquote — 2px left rule —
with one observation: `You go early in 7 of 10 rounds`.

Buttons: **Play again** (flex 2) and **Lobby** (flex 1). The asymmetry is the point.
`Lobby` is where another game is chosen; with one game it simply returns.

Six rows fit. With eight players, drop the winner block's subtitle before you shrink
the rows.

## 10. Return to room

Landing, with a bordered block above the buttons: caption `You're still in a room`,
the code at 28px, and `Rejoin` as an underlined link. Below it, secondary:
**Start something new**.

Shown when the phone remembers a room code that the server confirms is still alive.

## 11. Room gone

One screen, three sets of copy. Ink drawing of an open door, a title, two lines, one
primary button.

| Case | Title | Body | Button |
| --- | --- | --- | --- |
| bad or expired code | `That room is gone` | `Wrong code, or everyone left.` / `Rooms close when the last player goes.` | Back to start |
| host ended it | `The host ended the evening` | `That is the end of it.` / `Scores are not saved.` | Back to start |
| unexpected error | `Something broke` | `That is on us.` / `Try loading the app again.` | Reload |

The first row's copy changed with the room lifetime rule: a room no longer expires on
a clock the player could have been told about, so promising "two hours" would be a
lie.

## 12. Offline

Not a screen — an overlay. A solid `--ink` bar at the top of whatever is showing:
wifi icon and `No connection — reconnecting`. The content underneath keeps its layout,
but the round block loses its fill and becomes a `--ln2` outline with `--ink3` text, so
it is visibly dead without dimming the whole screen.

Reconnect silently and drop the bar. Do not throw the player out of the room.

## 13. Evening summary

**Not in the mockup.** Shown to everyone when the host ends the evening.

The final table across every game played: rank, face chip, name, total, tabular and
right-aligned. Above it the winner in the same shape as screen 9's winner block, with
`4 games` as the subtitle rather than a per-game figure. Below the table, one
blockquote per player is too many — one observation for the reader only, drawn from
what the games recorded.

Primary button: **Share**. It hands the summary to the phone's own share sheet.
Secondary: **Start a new room**.

This screen is the whole answer to "where do my statistics go", and the share button
is the only growth mechanism in the product. Design it as a thing someone would
actually send to a group chat: it is read by people who were not at the party.

## 14. Game picker

**Not in the mockup and not built in v1.** Specified so the lobby has a place for it.

Replaces the host's start button in the lobby. A vertical list of cards, one per game:
hand-drawn ink mark on the left, name and one-line tagline, then a caption row with
player range and estimated length. A card whose player range does not fit the current
room is `--ink3` with the reason as its caption — `needs 4 players` — and is not
selectable.

No colour, no emoji, no icon font: the mark is drawn in the same hand as the avatars
and the ticks. A grid of coloured game tiles is the single fastest way to turn this
product into something that looks like every other party-game app, and
`docs/DESIGN.md` rules it out.

Only the host sees the picker. Players see the current selection as plain text under
`Waiting for Artur to start`.
