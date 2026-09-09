> Current implementation preparation: [production readiness](decisions/production-readiness.md) and [gate/reconciliation table](planning/readiness-execution.md) supersede conflicting historical limits and behavior below. The fixed architecture and visual language remain binding.

> Production build-kit baseline. Current prototype work starts at [Project home](index.md); later accepted prototype decisions take precedence for the mockup.

# SPEC — Playai

## What this is

**Playai** — browser party games for people in the same room. One person creates a
room, everyone else joins from their own phone with a five-character code or by
scanning a QR code from the host's screen. No download, no accounts, no install.

**The product is a room that games are loaded into, not a single game.** Blindstop is
the first game. "Playai" is the platform's name in these documents and on the
repository; what the landing screen says to a player is an open decision — see
`README.md`. Everything below is written so the second one is a folder and a
registry entry, not a rewrite — but only Blindstop is built in v1, and the game picker
is not built until there is more than one game to pick.

## Blindstop, the game

Everyone in the room gets the same target: a time between 3.00 and 12.00 seconds,
picked at random per round. A shared countdown starts the round. From that moment the
screen shows no timer, no digits, nothing counting. You count in your head and tap
when you think the target has passed.

Your error is `tap_time − target`, signed. Negative means early, positive late.
Smallest absolute error wins the round. Smallest average absolute error across all
rounds wins the game.

A round ends when everyone has tapped, or after `target + 8 s`, whichever comes first.
Anyone who never tapped gets a fixed penalty error of 3.00 s for that round.

- 2 to 8 players.
- 10 rounds, fixed. Not configurable in v1.
- A round takes about 20 seconds including the countdown and the result.
- Round result auto-advances after 3 seconds. Nobody waits for the host between
  rounds — this is the single most important pacing decision in the game.

## The room

The room is the container. It holds the code, the players, the host, and the running
score for the evening. Games are loaded into it one at a time.

```
lobby ──host picks a game──▶ playing ──game ends──▶ lobby
  │                                                   │
  └──────────────── host closes ──────────────────────┴──▶ summary
```

- In the lobby, `gameId` is null and players may join and leave.
- Starting a game loads it. Its state is created fresh and is thrown away entirely
  when it ends — nothing a game wrote survives into the next one.
- Ending a game adds its points to the room's running total and returns to the lobby,
  with the same players and the same code. **Nobody enters the code twice in an
  evening.**

### The running total

Every player has a total for the evening, accumulated across every game played in the
room. A game contributes points on one shared scale — placement, so the winner of a
five-player game gets 5 points and last place gets 1 — because a game's own units are
not comparable with another's. An average error in milliseconds cannot be added to a
word score.

This is the thing that turns four separate games into one evening with a winner.

### Room code

Five characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — no `I`, `O`, `0`, `1`,
because the code gets read aloud across a room with music playing. Both entry paths
matter and neither is a fallback: scanning the QR from the host's screen is fastest for
whoever is standing next to them, and reading the code out loud is faster than six
people queueing to point a camera at one phone.

### How long a room lives

**A room lives as long as someone is in it.** It is deleted when both are true:

- more than 8 hours have passed since it was created, **and**
- no player has been seen for an hour.

A fixed two-hour life was the earlier rule and it was wrong: an evening runs longer
than that, and a room that dies mid-game takes the running total with it. A "extend
the room" button for the host was considered and rejected for the same reason — it
puts the survival of the evening on the host noticing a timer and pressing something
in the middle of a party. The system already knows whether anyone is still there,
because every phone pings; it should use that and ask nobody.

The cost is that a genuinely abandoned room lingers for an hour before it is cleaned
up. That is a few kilobytes.

Deletion removes the room and every trace of its state. **Nothing is archived.**

### Host

The host is whoever created the room. If the host is not seen for 30 seconds, host
passes to the longest-connected remaining player and the game carries on. Only the
host can start a game, remove a player, end a game, and close the room.

The host is a normal player with extra buttons — they play too. A game that needs a
non-playing narrator is out of scope until a game needs one.

### Joining, leaving, coming back

- Players join only while the room is in `lobby`. Because the room returns to the
  lobby between games, someone who arrives late waits at most one game — a few
  minutes, not the evening.
- A player who drops mid-game can rejoin and keeps their scores; their missed rounds
  score the penalty.
- The room is capped at 8 players at the join handler, not only at game start.

## Identity

No accounts, and nothing to fill in beyond a name and a face.

- **In the phone's memory**: the player's name, face and last room code. Coming back
  to a room, or to the next party, they are not typed again.
- **A device identity**: a permanent, invisible id issued on first use. Nobody signs
  up, nobody sees it, there is no screen for it.

The device identity is not a feature and it is not optional. **The one metric below
cannot be measured without it** — recognising that the phone which joined someone
else's room last week has created a room of its own tonight is the entire measurement.
Player statistics across parties come almost free once it exists, but that is a
by-product, not the reason.

It is per-device and per-browser: clearing browser data loses it, and a second phone
is a second identity. Real accounts, which would fix that, are out of scope — see
below.

Names are 1–12 characters, trimmed, filtered against a wordlist. Duplicate names in a
room get a numeric suffix.

## Copy

All UI is English. Sentence case throughout. No exclamation marks. Full strings live
in `docs/SCREENS.md` — treat that file as the source of truth for wording, and put
every string behind an i18n key from the first commit even though only `en` exists.
This includes game names and taglines, which arrive as keys on the game's manifest.

Voice: plain and short. The interface never apologises and never jokes. The only
personality in the product is in the illustration and in the round-result headline
("Mila nails it").

## Deliberately out of scope for v1

Listed so nobody adds them back by accident:

- **the game picker**, until there is a second game to pick — the room is built so it
  slots in, and building the screen before then is guessing
- settings of any kind (round count, target range, difficulty)
- a second game
- any language other than English
- **accounts**: sign-up, sign-in, cross-device identity, friend leaderboards. The
  invisible device identity above is in scope; everything a person would recognise as
  an account is not. A sign-up screen is the thickest wall between someone at a party
  and a game they can be playing in fifteen seconds, and it drags in password
  recovery, personal data and deletion-on-request behind it.
- a TV / host screen
- sound
- ads, payments, analytics beyond a single counter (see below)

## The one metric

Count, per device identity, whether a player who joined someone else's room later
creates a room themselves. **Player-to-host conversion within 30 days is the only
number that tells you whether this is worth continuing.** Everything else can wait.

Around 10% and there is something worth building on. Around 1% and no amount of extra
games, languages, accounts or polish will fix it.

## The evening summary

When the host closes the room, everyone gets a summary of the evening: the final
table, the winner, and one observation per player drawn from what the games recorded
("you go early in 7 of 10 rounds"). It can be shared to a group chat.

This is deliberately the answer to "where do my statistics go" instead of accounts.
What people want at a party is to settle who won tonight, not to look up a lifetime
average — and a summary landing in a group chat is also where the next host comes
from, which is the one thing being measured.
