> Current implementation preparation: [production readiness](decisions/production-readiness.md) and [gate/reconciliation table](planning/readiness-execution.md) supersede conflicting historical limits and behavior below. The fixed architecture and visual language remain binding.

> Production build-kit baseline. Current prototype work starts at [Project home](index.md); later accepted prototype decisions take precedence for the mockup.

# ROADMAP — Playai

Stages are sequential. Each has a gate. Do not start the next stage until the gate
passes — the gates are the whole point of this file.

## Stage 1 — Room and one round, end to end

Room create, join by code, lobby, countdown, round, waiting, result, back to lobby.
One game, no polish. Clock sync implemented properly from the start.

Also in this stage because retrofitting them is expensive:

- **the room/game seam** — room state and game state separate, one registry, the game
  reached only through the contract in `src/engine.ts`. No picker: one game, and the
  start button starts it. The seam, not the screen.
- **the device identity** — issued and stored on first use. Stage 5 cannot be run
  without it and it cannot be backfilled.
- i18n keys for every string, the token file, CI running typecheck + test.

**Gate:** two phones and a laptop in one room. The host closes their browser
mid-round. The round still completes and host passes to someone else.

## Stage 2 — Tests for the runner

Local Durable Object. The case list is at the bottom of `src/engine.ts`: double tap,
tap after phase close, tap from a non-member, concurrent alarms, host leaving
mid-round, room deletion cleaning up everything, returning to the lobby without losing
room totals, clock offset estimation with spiky RTT.

This comes before more features, not after. The runner is where the defects are and it
is around 250 lines — it is cheap now and expensive later. Every item on that list is
a defect someone else shipped.

**Gate:** tests run in CI on push and fail the build.

## Stage 3 — All the screens, real design

Everything in `docs/SCREENS.md` except the game picker: the token system applied,
avatars as a sprite, hand-drawn ticks and crosses, the edge screens, the offline
overlay, the evening summary with its share button. PWA manifest, and a screen wake
lock so a phone put down for twenty seconds does not drop out of a round.

**Gate:** someone who has never seen it can join from a QR code and play a full
session without you saying a word.

## Stage 4 — A real party

Five or six people, an evening, drinks. You do not fix anything live and you do not
explain the rules. You watch and write down what happens.

**Gate:** the notes from that evening are the backlog. Work through them before
anything else. If a mechanic simply did not land, cut it rather than tune it.

## Stage 5 — Measure

Ship it somewhere and get a hundred sessions. Count one thing: the share of players
who later create a room themselves within 30 days, keyed on the device identity built
in stage 1.

**Gate and the real decision point.** Around 10% and you have something worth building
on. Around 1% and no amount of extra games, languages or polish will fix it — change
the product or stop. Find this out before building anything in stage 6.

## Stage 6 — Only after stage 5 says yes

**The second game, which is the real test of the contract.** A folder under
`src/games/` and one registry entry, with no change to the core. If it takes more than
two days, the contract is wrong and fixing it now — with two games — is still cheap.
It never gets cheaper.

The game picker ships with it, because that is the first moment there is something to
pick.

Then a second language, in full, measuring how long it actually takes. Then, and only
then, anything about money or accounts.

## Two rules that override the plan

**Finish three games properly before adding a fourth, and finish one language properly
before adding a second.** Scope in this category grows faster than the foundation
under it. That is how comparable projects end up with eight games, 18k lines and no
tests on the layer that actually breaks.

**Anything not in `docs/SPEC.md` is out of scope.** Settings screens, difficulty
levels, sound, a TV view, accounts — all reasonable, none of them needed to find out
whether people want to play this twice.
