# Pre-production human playtest packet

Status: preparation only. This packet defines a repeatable human session; it contains no executed results. It supports the readiness recommendations in [the pre-production review](../research/pre-production-review.md) and supplies evidence for the future behavior recorded in [the production-readiness decision record](../decisions/production-readiness.md). It does not claim that the standalone mockup implements that baseline.

## Purpose and boundaries

The current standalone mockup has no shared room, remote phones, network transport, arbitrary content loading, synchronized deadlines, or secure private views. Therefore this packet has two modes:

- **Mode A — current mockup / facilitated session:** 4–6 people may use separate phones for individual UI tasks while the facilitator supplies paper prompts, reads the script, and uses clearly labelled local preview controls where the mockup provides them. This can assess wording, input, privacy presentation, review burden, and comprehension; it cannot prove a shared room or remote state.
- **Mode B — connected build follow-up:** use only after the lead supplies a server-connected build with independent room membership, private views, deadlines, acknowledgements, and the chosen content fixtures. This is the mode for real independent-phone multiplayer, reconnect, background, and network-fault checks.

Keep the current English UI, room identity, catalogue flow, and visual language. Do not describe Mode A preview controls as remote participants or use them to imply arbitrary content or private server delivery.

The packet is for content, pacing, comprehension, privacy, recovery, and device observations. It is not evidence of production multiplayer, server secrecy, synchronized deadlines, cross-game scoring, or physical-device acceptance until the relevant Mode B or physical gate is actually run and recorded. The future implementation baseline is [the production-readiness decision record](../decisions/production-readiness.md); this packet supplies evidence for its provisional values and does not replace that record.

### Roles

- Facilitator: reads only the script, starts and resets rounds, and records observations.
- Host participant: in Mode B, creates the room and performs host actions; in Mode A, follows the facilitator's host UI task.
- Players: in Mode B, each joins on a separate phone; in Mode A, each uses a separate phone for the assigned individual task and does not represent a connected remote player.
- Observer: may be the facilitator; records timestamps, exact confusion, device details, and whether the issue blocked progress.

Do not coach a player through a task before recording the first attempt. If a rule needs explanation, write down the exact question and the intervention. Reset between rounds only after all observations and timestamps are captured.

## Session schedule

The core Mode A rows total 82–104 minutes; reserve about two hours including a break. Capacity and device probes are separate: 43–67 minutes for one selected game, plus 20–30 minutes for each additional game paced at 8 players. Do not report follow-up rows as part of the core-session duration. Mode B can reuse the same order once the connected build exists.

| Segment | Group size | Rounds | Target | Evidence to capture |
| --- | ---: | ---: | --- | --- |
| Welcome and individual UI setup | 4–6 | 1 | 5 min | Join/create copy, code/QR comprehension where available, name/face persistence |
| Blindstop practice and short game | 4–6 | Unscored practice + 3 rounds | 8–12 min | Tap timing, Missed handling, result comprehension; facilitator timing is not network fairness evidence |
| Categories familiarisation | 4–6 | 1 | 8 min | Rules understood, draft/Stop semantics, review effort |
| Categories replay | 4–6 | 2 | 12–18 min | Content quality, duplicate handling, correction/dispute questions |
| Impostor familiarisation | 4–6 | 1 | 8–10 min | Private role/word privacy, clue queue, discussion transition |
| Impostor replay | 4–6 | 2 | 12–18 min | Clue pacing, voting comprehension, tie/absent questions |
| Bluff familiarisation | 4–6 | 1 | 8–10 min | Submission anonymity, truth/lie distinction, vote burden |
| Bluff replay | 4–6 | 2 paper/facilitated rounds | 16–18 min | Varied questions, believable lies, truth-match exceptions and vote reading |
| Core-session debrief | 4–6 | — | 5 min | Player quotes, willingness to replay/host, unresolved rules |

Follow-up probes:

| Segment | Group size | Target | Evidence to capture |
| --- | ---: | ---: | --- |
| 8-player pace run | 8 connected participants in Mode B, or labelled fixture sheets in Mode A | 20–30 min per selected game | Queue and review burden at the upper intended small-group size |
| 20-answer load probe | 20 labelled answer options, 4–6 voters | 8–12 min | Reading, scanning, duplicate grouping, vote burden |
| Device/accessibility matrix | same participants | 15–25 min | Pass/fail and defect evidence per device/input mode |

If fewer than 8 real people are available, Mode A may use labelled fixture sheets for the load probe. Mode B may use only the connected build's explicit test fixtures. Record “simulated” beside every such result. Never describe a paper sheet or preview action as a remote participant action.

## Facilitator script and round procedure

At the start, say: “Please try to solve the task without asking for help. I will record questions and timing. In this session, paper sheets and preview controls are test fixtures, not remote participants. We will only call it a connected multiplayer result when a later build sends and acknowledges state between your phones.”

For every round:

1. Record the start time, game, round fixture, participant count, real/simulated split, and device IDs.
2. Read only the on-screen instructions. Record the first action each player takes and any question before intervention.
3. Mark the time when the last player reaches each phase. Record the time spent waiting, reading, entering, reviewing, voting, and returning to the room separately where possible.
4. In Mode B only, during a recovery probe, refresh or background exactly one named phone at the planned point. Record what the player sees, whether private information remains concealed, and whether the room can continue. In Mode A, a reload tests only the local UI state and must be labelled that way.
5. At results, ask each player for a one-sentence explanation of how points or the winner were determined. Do not correct them before recording it.
6. Ask “What would you change before playing this again?” and “Would you start a room for this?” Record exact wording.

### Observer sheet (one per round)

| Field | Entry |
| --- | --- |
| Date/build/commit |  |
| Game and fixture |  |
| Real players / simulated players |  |
| Devices and browsers |  |
| Start and end time |  |
| Phase times: preparation / input / waiting / review or vote / result |  |
| First unprompted action |  |
| Exact questions or misunderstandings |  |
| Any privacy exposure or wrong-person action |  |
| Any duplicate, stale, missing, or unsent submission |  |
| Refresh/background/rejoin point and outcome |  |
| Facilitator intervention (quote it) |  |
| Blocked progress? where and why? |  |
| Player quote about fun, pace, or clarity |  |
| Pass/fail gates triggered |  |

## Content fixtures

These are hand-authored playtest fixtures to vary the interaction. They are not a production content pack, dictionary, word bank, or claim of balance.

### Categories

Use the current four fields: Country, City, Animal, Food. Accept the prototype’s stated scoring and review semantics for observation: unique accepted 10, accepted duplicate 5, blank or rejected 0; trim and case-normalise for duplicate comparison; wrong initial letters do not earn points. Record any disagreement about whether an answer belongs in a category instead of inventing a dictionary rule.

| Round | Letter | Country | City | Animal | Food | Deliberate observation |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | B | Brazil | Berlin | bear | bread | Baseline matching the existing fixture; check whether the rule is recalled without prompting. |
| C2 | M | Mexico | Madrid | monkey | mango | Check whether players produce answers quickly and whether “city” scope is understood. |
| C3 | S | Spain | Seoul | snake | soup | Check spelling variants, duplicate answers, and host review fatigue. |
| C4 | T | Thailand | Tokyo | tiger | taco | Use only if the group still has attention; probe longer words and late entry. |

The current local mockup remains fixed to letter B. C2–C4 are paper/facilitator fixtures in Mode A and require a content-capable connected build or explicit fixture hook before they can be run in the UI. Do not use the existing preview controls to imply that M, S, or T was loaded by the app.

For each Categories round, prepare at least one duplicate pair and one blank among the fixture sheets. For C2, for example, use “mango” twice and leave one Food blank; for C3, use “Seoul” twice. The facilitator must label which sheets are simulated. Do not tell the host which answers are intended to be accepted or rejected beyond the written rules. Ask after review whether the host could make and revise a judgment without losing place.

Required Categories probes:

- One player types a valid draft and does not submit before the participant presses Stop; separately, test the host's Finish early action with blanks. Record whether each outcome is understandable and whether the draft is preserved or discarded.
- The host rejects an answer, revisits the category, and changes the judgment. Record whether provisional points and duplicate groups recalculate visibly and correctly.
- A player submits an answer with the wrong initial, extra spaces, and a case difference in separate sheets. Record the displayed reason and any player disagreement.
- At 8 and 20 sheets, record the time to scan and judge one category and the number of times the host loses their place. Do not extrapolate from one category without recording the actual sheet count.

### Impostor

Use one fixed shared word per round and assign one impostor. In Mode B, ordinary players see the word privately on their own phones; the impostor does not. In Mode A, the existing mockup can show a local role presentation but cannot prove per-player private delivery or real rejoin secrecy. Everyone gives one spoken clue without saying the word. Keep the role reminder concealed when the phone is backgrounded, refreshed, or rejoined only as a Mode B privacy probe.

| Round | Shared word | Clue-quality focus |
| --- | --- | --- |
| I1 | Lantern | Existing baseline; check whether an impostor can tell what to do and whether ordinary clues are too direct. |
| I2 | Compass | Directional associations; check whether clue order and current-speaker state are clear. |
| I3 | Apricot | Less obvious object; check whether discussion remains playable without a word-guessing finale. |
| I4 | Bicycle | Familiar object with many associations; check whether one spoken word per player feels restrictive. |

These words are test fixtures written for this packet, not a proposed production word pool. Keep participant order stable. Record the first time a player asks whether the impostor speaks first, whether a clue may repeat another clue, or whether the speaker can see the role reminder. At voting, have one round with a unique highest vote and one round with a tied highest vote if the group can do so naturally; use the preview controls only with explicit disclosure. Record whether the result explains the winning side, elimination or tie, revealed word, and vote distribution.

The current local mockup is fixed to Lantern. I2–I4 are paper/facilitator fixtures in Mode A and require a content-capable connected build or explicit fixture hook before UI execution. Do not use the existing Lantern preview to imply that Compass, Apricot, or Bicycle was delivered as a private word to separate players.

Required Impostor probes:

- The impostor backgrounds or refreshes before giving a clue. Record whether the private role stays hidden and whether the queue resumes at the correct speaker.
- One player tries to vote before the host opens voting; one confirms a vote and waits. Record whether selection and submission are distinct and understandable.
- At 8 simulated participants, record clue-queue time and the number of people asking whose turn it is. Do not claim a 20-player result from the 8-player run; use the separate load probe only to assess list and waiting burden.

### Bluff

Use the already documented question for the first live content round: “How many hearts does an octopus have?” The documented truth is three, with the fixed equivalence set described in the Bluff scope; the source is the Natural History Museum link in [the game scope](../games/bluff/prototype.md). Record the source and date/build used by the facilitator. This is a flow-validation prompt, not a finished replayable question collection.

Use the three official-source-checked questions below for paper replay; the lead independently checked their sources. They are deliberately simple control questions, not evidence that a finished Bluff content pack is surprising or entertaining. Record when prior knowledge makes inventing lies pointless and replace overly familiar prompts in the next content pass.

The existing local mockup has one fixed question and does not fetch arbitrary prompts. A paper or facilitator-led variant may read the three questions below aloud, but it cannot validate network delivery, server-side content selection, or the app's question-loading path. A deliberate network-fault probe is likewise outside this fixed local mockup; record it as not run until a build with a controllable content request and failure state exists.

### Additional source-verified question fixtures

These three short questions were checked on 2026-09-09 against official NASA or NOAA pages. They are prepared fixtures only. The “house option” is a clearly false answer for the stated question, not a second accepted answer; it is included to make a lie available for a paper/facilitated Bluff probe. For these paper prompts, trim/collapse whitespace, ignore case and accept the listed aliases with an optional final period or exclamation mark. These per-question alias sets are proposed content, not implemented by the current octopus-only app.

| ID | Question to read | Truth and normalized aliases | Clearly false house option | Official source (checked 2026-09-09) |
| --- | --- | --- | --- | --- |
| B2 | What gas do plants take in during photosynthesis? | `carbon dioxide`; `carbon dioxide gas`; `CO2`; `co2` | `oxygen` | [NASA Science — The Carbon Cycle](https://science.nasa.gov/earth/earth-observatory/the-carbon-cycle/) |
| B3 | Which is the largest ocean basin on Earth? | `Pacific`; `Pacific Ocean`; `the Pacific`; `the Pacific Ocean` | `Atlantic Ocean` | [NOAA Ocean Service — What is the largest ocean basin on Earth?](https://oceanservice.noaa.gov/facts/biggestocean.html) |
| B4 | What is the largest known volcano in the Solar System? | `Olympus Mons`; `Olympus Mons on Mars` | `Mauna Loa` | [NASA Science — Olympus Mons](https://science.nasa.gov/photojournal/olympus-mons/) |

For B2, NASA states that plants absorb carbon dioxide during photosynthesis; oxygen is the resulting false house option. For B3, NOAA identifies the Pacific as the largest ocean basin and the Atlantic as second. For B4, NASA identifies Olympus Mons as the largest known volcano in the Solar System; Mauna Loa is retained only as a plausible Earth-volcano lie and must not be treated as the truth for this wording. Do not broaden any alias set during the session without recording the proposed rule and assigning it to the lead for a decision.

### Additional-content execution log

All rows below are prepared for a future facilitated run and are explicitly **Not run**. No timing, votes, fooled counts, or comprehension result is implied.

| Fixture | Delivery mode | Status | Result / notes |
| --- | --- | --- | --- |
| B2 — carbon dioxide | Paper/facilitator only unless a content-capable build is supplied | Not run |  |
| B3 — Pacific Ocean | Paper/facilitator only unless a content-capable build is supplied | Not run |  |
| B4 — Olympus Mons | Paper/facilitator only unless a content-capable build is supplied | Not run |  |

The three fixtures do not replace the fixed octopus round in the current local mockup. They become app-executable only after the lead supplies a build or fixture hook that can represent each question and its truth aliases. A future network-fault row must also remain **Not run** until that hook exposes a deterministic request failure and a user-visible recovery state.

Required Bluff answer fixtures for the octopus prompt:

| Fixture | Submitted answer | Purpose |
| --- | --- | --- |
| Truth A | 3 | Numeric truth alias. |
| Truth B | three hearts. | Normalised truth alias; conceal truth status until reveal. |
| Lie A | 2 | Plausible false answer. |
| Lie B | 4 | Plausible false answer. |
| Lie C | two | A distinct text form under the incumbent rules; do not claim that `2` and `two` merge unless a future lie-normalization rule explicitly adds that equivalence. |
| Long answer | A sea creature with two hearts, one for each gill | 80-character field and reading burden; count actual characters before use. |

For a facilitated paper round, collect one answer per player on an anonymous slip, then have the facilitator copy/merge options in a neutral order and collect private ballots. Distribute Impostor roles privately on folded cards. For Categories use one sheet per player and review together. These paper actions use no shared app state. Use preview controls only for the incumbent fixed individual UI flow; they cannot enter arbitrary other-player answers. At reveal, check that truth points, fooled-player credits, merged authors, fallback-lie behavior, and the “cannot vote for your own submission” rule are explained. Record whether players understand that selecting an answer and submitting a vote are separate actions.

For the 20-answer load probe, use the table above plus repeated, clearly labelled fixture variants. These are load-only submissions, not new facts. Record the exact number of options shown, time to read them, time to decide, whether identical answers merge, whether authors remain anonymous before reveal, and whether the voter can keep track without a facilitator narrating.

## Pace and capacity gates

Record wall-clock time and waiting time for both 4–6 and 8-player conditions. The target is evidence, not a pre-decided pass based on a stopwatch number.

| Gate | Pass condition | Fail evidence |
| --- | --- | --- |
| 4–6-player first round | Every player can state the task and reach the next phase without facilitator explanation after the first read. | Two or more players take a wrong primary action, or the facilitator must explain a core rule to continue. |
| 4–6 replay | A round completes without a deadlock, lost draft, lost role, or unexplained result. | Any player or host is blocked until reset or manual state repair. |
| 8-player pace | Waiting is observable and attributable; the host can complete the flow without losing their place. | More than one phase requires repeated verbal roll-call or the host cannot finish review/voting without a workaround. |
| 20-answer Bluff probe | Anonymous options remain scannable; voting, duplicate merging, and reveal remain comprehensible. | Participants cannot distinguish options, authors leak before reveal, or the observer cannot record a reliable choice within the planned probe. |
| Repetition | At least 3 varied rounds per game are completed or the facilitator records the exact reason for stopping. | A game is abandoned for pace, confusion, or fatigue without a recorded cause. |

Do not convert these observations into a new player cap or scoring formula during the session. Mark the recommendation as “needs decision record” if the evidence suggests 8 or 20 should differ by game.

## Physical-device and accessibility matrix

Run the checks on real phones where available. Use Android Emulator for app UI inspection per the working agreement; do not use desktop Chrome or desktop mobile emulation for Playai testing. VM/source checks can support preparation, but cannot close this physical-device gate. Record model, OS, browser version, viewport orientation, text-size setting, keyboard, assistive technology, and whether the check was real or simulated.

| Check | Android phone | iPhone/Safari | Docked keyboard | Large text / zoom | Screen reader / keyboard access | Result and evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Join by code and name entry |  |  |  |  |  |  |
| Join by QR, if available |  |  |  |  |  |  |
| Categories four-field entry and Stop remains reachable |  |  |  |  |  |  |
| Categories long name and review list |  |  |  |  |  |  |
| Impostor private role/word reveal and hide |  |  |  |  |  |  |
| Impostor clue queue and voting list |  |  |  |  |  |  |
| Bluff 80-character answer and anonymous options |  |  |  |  |  |  |
| Small-height viewport / landscape rotation |  |  |  |  |  |  |
| Refresh during writing, waiting, and private-information phase |  |  |  |  |  |  |
| Background and return to the app |  |  |  |  |  |  |
| Offline/reconnect indication and acknowledged submission |  |  |  |  |  |  |
| Fixed action remains reachable while content scrolls |  |  |  |  |  |  |
| Focus order, labels, announcements, and no trapped focus |  |  |  |  |  |  |

Accessibility pass criteria are task-based: a player can identify the current instruction, enter or select an answer, submit it, hear or see the saved/failed state, and return from a dialog or background without help. A visual-only check is insufficient for the screen-reader column. Record the exact control, announcement, or focus failure and whether it blocks play.

## End-of-session acceptance record

Complete this record before calling the session useful:

| Decision area | Evidence collected | Recommendation | Owner / follow-up |
| --- | --- | --- | --- |
| Categories review limit and dispute semantics |  |  |  |
| Impostor clue queue and voting burden |  |  |  |
| Bluff answer/vote burden at 8 and 20 options |  |  |  |
| Draft submission and remote Stop outcome |  |  |  |
| Missing answer, missing vote, absent clue giver |  |  |  |
| Refresh/background/rejoin privacy |  |  |  |
| Android physical gate |  |  |  |
| iPhone physical gate |  |  |  |
| Docked keyboard and large-text gate |  |  |  |
| Screen-reader and keyboard gate |  |  |  |
| Cross-game points and incomplete-game policy |  |  |  |

The session passes the readiness recommendation only when its raw notes, participant count, real/simulated split, device matrix, and failed gates are attached to the follow-up decision record. Empty cells mean “not tested,” never “passed.”
