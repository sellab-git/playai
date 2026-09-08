# Impostor — exploratory mockup

Status: user approved a one-round prototype after reviewing the proposed game choices. This extends the HTML mockup only; it does not start the production roadmap or approve Bluff implementation.

## Purpose

Check whether the existing room supports private information, conversation away from the phone, voting, and switching games without choosing a name/avatar or joining again. Preserve the established visual language. Do not redesign the platform as part of this experiment.

## Bounded flow

Catalogue -> preparation -> private role/word -> one spoken word as a clue per participant -> discussion -> vote -> reveal/result -> preparation or catalogue.

Approved follow-up after the Doplay comparison: introduce a distinct clue stage and a concealed reminder of the assigned role during clues/discussion. Each participant gives one spoken word as a clue without saying the word. The interface identifies the current speaker; the speaker or host advances the queue. Keep participant order stable. After the last clue, move to discussion. Voting remains a separate host action. The reminder must not reset progress or expose a role through Back, dismissal, backgrounding or rejoin.

One participant is the impostor and does not know the shared word. Other participants receive the word privately. Participants discuss without revealing the word directly, then vote for a suspect. The interface must make revealing and hiding private information explicit, distinguish selecting a vote from submitting it, and explain the outcome.

Implemented local sample: 3–20 participants, one round, fixed word Lantern, one fixed other participant as impostor. The local view defaults to an ordinary player. Each player is intended to use their own phone; this is not a pass-the-device flow. Host opens voting after discussion. A confirmed vote enters waiting; Preview controls explicitly simulate remaining votes. A unique highest vote total eliminates that participant; a tie eliminates nobody. The impostor wins unless eliminated. No word-guessing finale or elimination rounds are included.

Preview controls also expose the impostor role presentation and a return to the assigned role, plus guest host-action simulation. Preview role changes only the displayed perspective, not the round's assignment. Leaving/rejoining or backgrounding conceals the role. These are UI safeguards, not production secrecy. There are no simulated phase deadlines in this manual exploratory flow; production waiting phases will require them.

Room code, host, membership, identities and existing evening totals survive this flow. This experimental game awards no evening points: cross-game scoring is a separate decision, not a side effect of adding a second mockup. Blindstop rules and scoring remain unchanged.

## Limits

This is local simulation with embedded state, not secure role delivery or synchronized voting across phones. Preview controls must distinguish simulated actions from actions of real participants. Production secrecy needs server-owned private views; hiding text in HTML is not security.

Bluff remains a proposed next experiment. Full game balancing, content packs, multiple-round options and production implementation are outside this iteration.

## Clarity follow-up

Approved: private guidance differs by role and covers the impostor speaking first. Public clue instructions remain role-neutral. Waiting shows the actual number of submitted ballots, without selections; the local preview advances remaining ballots explicitly. Results identify the winning side, explain elimination or a tie, reveal the word and retain vote distribution. Play again remains primary for the host; another game remains secondary. No word pool or additional settings were added.
