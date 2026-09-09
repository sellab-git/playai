# Bluff — exploratory mockup

Accepted on 2026-09-09: after provisionally accepting Categories, the user approved the false-answer and anonymous-voting variant of Bluff. This is our proposed game, not a mechanic found under that name in the Doplay reference.

## Bounded first round

Extend the standalone HTML mockup, not the production application. Two to twenty simulated players remain in the same room. Catalogue -> preparation -> write a plausible false answer -> submission waiting -> anonymous voting -> vote waiting -> reveal and round standings. Replay returns to preparation; choosing another game preserves the room, identity and evening totals.

Use one fixed question for the first interaction review: “How many hearts does an octopus have?” The answer is three; see the [Natural History Museum](https://www.nhm.ac.uk/discover/octopuses-keep-surprising-us-here-are-eight-examples-how.html). This question validates the flow; it is not a finished replayable question collection.

## Rules and edge cases

Award 2 points for finding the truth and 1 for each player fooled by a submitted lie. Round points do not enter evening totals until the shared conversion is decided.

Accept a nonblank answer of at most 80 characters. Keep drafts without rerendering during typing. Merge identical answers after trimming, collapsing whitespace and ignoring case; treat numeric aliases consistently for the fixed question. A merged lie credits each author when another player selects it. A player cannot vote for any option matching their own submission.

The fixed truth equivalence set is `3` or `three`, optionally followed by `heart` or `hearts` and a final period or exclamation mark, ignoring case and normalized whitespace. No general semantic answer validation is claimed. A game-supplied fallback lie keeps voting possible if every submission matches the truth; identify it as added by the game at reveal.

If a submission matches the truth, conceal that fact until reveal and award its author 2 truth points at reveal. The matching option remains disabled as their own answer, exactly as a lie would. Do not add deception credit to the truth or more than 2 truth points. Explain this exception in the rules. Ensure at least one eligible choice remains in the local fixture.

Freeze submissions and votes once confirmed. Do not expose authors or truth markers before all simulated votes are recorded. Reject duplicate, stale, invalid-option and self-vote actions. Display the revealed truth and sorted round standings with tied ranks. Answer details opens a dialog containing the source, authors and fooled counts for each lie, keeping the main result focused on standings.

## Simulation and recovery

Remaining participants submit and vote only through explicitly disclosed preview controls. This manual mockup has no remote network or synchronized deadlines. Host-only actions stay guarded; guest preview progression is explicitly simulation. Preserve draft, submitted answer, vote and phase across local leave/rejoin. Keep keyboard and scrolling controls reachable using the incumbent mobile layout.

No settings, production engine, multiplayer, persistent storage, full trivia bank or evening conversion is included. Verify with VM regression checks, independent logic/state and UX/copy reviewers, and the Android Emulator. Record device and user-acceptance gaps honestly.
