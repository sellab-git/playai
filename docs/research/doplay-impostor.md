# Doplay Impostor source comparison

Inspected source at commit `d7a9bef3616a33e85a3ab575e3956504e5d4b413`; no multiplayer session was played. Findings describe code, not verified live behavior.

Sources: [engine](https://github.com/w84kubus/doplay/blob/d7a9bef3616a33e85a3ab575e3956504e5d4b413/src/games/impostor/engine.ts), [player view](https://github.com/w84kubus/doplay/blob/d7a9bef3616a33e85a3ab575e3956504e5d4b413/src/games/impostor/PlayerView.tsx), [settings](https://github.com/w84kubus/doplay/blob/d7a9bef3616a33e85a3ab575e3956504e5d4b413/src/games/impostor/manifest.ts), [word data](https://github.com/w84kubus/doplay/blob/d7a9bef3616a33e85a3ab575e3956504e5d4b413/src/games/impostor/data/words.ts).

## Observed implementation

- Flow: private role -> confirmation -> clue round(s) -> discussion -> vote -> optional caught-impostor word guess -> result -> next round/end.
- Role is shown while pressing the card and hidden on release or pointer leave. A separate remembered action confirms; confirmation count is shown. A similar reminder is available during clues/discussion.
- Voice mode supplies a randomized speaking order; current speaker or host advances it. Text mode collects one clue of up to 30 characters from each player per clue round.
- Defaults: one impostor, category hint, one clue round, text mode, 90-second discussion, post-ejection guessing enabled, three game rounds. Optional settings include 1–3 impostors and several hint types.
- Distribution has a 90-second deadline; clue duration scales with group size; voting has 60 seconds. A caught impostor gets 30 seconds to guess when enabled. Ties/no votes award the round to impostors.
- Scores: winning ordinary players +1 each; impostors +2 for surviving or +3 for guessing. These are Doplay's rules, not approved Playai scoring.
- There are 34 manually written word entries. Each contains a word, category, descriptive hint and related alternatives. Random selection has no used-word exclusion in the inspected assignment function.
- The private view excludes the secret word for an impostor; public word and roles are withheld until results. However, public vote tallies are exposed during voting and candidate buttons can show current totals. Do not copy that if Playai wants an independent secret ballot.

## Proposed Playai direction, not yet approved

Borrow a clear clue-giving stage with a current-speaker indicator for an in-person group, confirmation that the role was read, and a concealed role reminder. Consider press-and-hold only with accessible alternatives. Start with one impostor and one spoken clue per person, then host-controlled discussion/voting. Keep votes hidden until voting closes. Try the caught-impostor guessing finale separately; it may discourage overly revealing clues but adds another phase. Do not import the full settings matrix or scoring before playtesting.

The current Playai mockup is unchanged by this research; its simpler rules still apply.
