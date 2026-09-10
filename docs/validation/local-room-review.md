# Local room review — 2026-09-10

This record covers the implemented P1 local slice: one direct Cloudflare Durable
Object room and one Blindstop round. It is technical evidence, not a production,
human-playtest, or physical-device acceptance record.

**Acceptance correction:** the user reported substantial UX/UI differences from the
latest four-game HTML mockup. The bounded host interaction below is functional
evidence only. A visual screen-by-screen parity review was not completed, and the
real UI is not accepted. App work is paused for workspace/vault/tracker reconciliation.

## Verified

- Environment: Node 24.14, npm 11.9, TypeScript 6.0.2, Vite 8.2.2, Vitest 5,
  Wrangler 4.130.0, and `sharp` 0.35.4 via the fixed override.
- Automated suite: 43 tests across runner, engine, clock, protocol, and security pass.
- Tooling: typecheck, lint, build, and the surface detector pass.
- Local Wrangler integration: `scripts/local-integration.mjs` passes HTTP and
  WebSocket create/join, origin rejection, credential rejection, clock readiness,
  host authorization, countdown/alarm, privacy projections, membership generation,
  equal and conflicting retries, awards, and closed-summary behavior.
- Process restart: the real Wrangler restart scenario passes, retaining membership
  and the Start acknowledgement, advancing overdue phases, and awarding exactly
  once.
- Dependency hygiene: the development `sharp` advisory is fixed and `npm audit` is
  clean.
- Published implementation: commit `38cb536` on PR #1. GitHub Actions
  [run 34440814904](https://github.com/sellab-git/playai/actions/runs/34440814904)
  passes installation, typecheck, lint, all 43 tests, build, and the isolated real
  adapter/restart harness on Ubuntu with Node 24. This confirms CI execution as
  well as the local Windows evidence.

The implementation uses the direct Durable Object adapter selected by the local
contract. No PartyKit transport, second provider, public deployment, or paid plan is
part of this slice. No later game has been ported.

## Evidence and remaining gates

| Area | Status | Required evidence |
| --- | --- | --- |
| Process restart | Pass | Membership and Start acknowledgement retained; overdue phases advanced; award applied exactly once. |
| Android Emulator UI | Bounded host flow pass | Medium_Phone_API_36.1, Android Chrome, 410×939 captured emulator window at default scale. Name entry, create, lobby with a protocol guest, Start, tap acceptance, result, retained totals, reload/resume, and confirmed evening close observed against localhost:8787. |
| Real devices | Not available | Two real phones and a laptop, including host browser closure mid-round. |
| R1 human playtest | Not run | 4–6 participants, varied content, pacing, and winner/points comprehension. |
| Final contract review | Pass | Sol accepted the four corrected findings. |
| Final runner review | Pass | Sol passed after earliest-overdue-deadline corrections. |
| Final UI review | Pass | Terra passed after entry button, grid, async result binding, pending state, and hidden-name interpolation corrections. |
| Independent UX review | Pass | Terra passed after host interpolation/XSS, snapshot pending, duplicate avatar labels, and session-copy corrections; no emulator evidence. |
| Independent logic review | Pass | Sol passed after earliest-alarm ordering and name-wordlist corrections; no emulator evidence. |

## Gate interpretation

The local checks establish the bounded P1 technical slice. They do not pass P1 because
the two-phone/laptop host-disconnect evidence is still incomplete. They
do not pass R1 or P2. Source review, local integration, and emulator
inspection cannot substitute for the missing human and physical-device evidence.

The lead used supported Computer Use on the Android Emulator only for app UI.
The second participant was a WebSocket test client, not a second device or guest UI.
The emulator exposed an invisible Confirm label caused by a CSS background override;
the corrected ink button was independently reviewed and visually retested before
closing the evening. The final summary column allocation was also corrected.
Large text, docked keyboard, guest UI, background recovery, and physical timing
accuracy were not verified. The captured window size is not a measured CSS viewport.

`npm run test:adapter` passes end to end: it creates isolated temporary local
persistence, runs the real HTTP/WebSocket suite, stops the owned Wrangler process
tree, restarts it, verifies retained state and overdue transitions, and cleans up.
This is a local runtime restart, not a deployed Cloudflare restart test. Windows
cleanup retries temporary file locks. Abrupt external termination can bypass cleanup;
the harness refuses an already occupied integration port on the next run.
