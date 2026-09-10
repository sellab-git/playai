# Local P1 development runbook

This is the local workflow and evidence record for the P1 room plus one Blindstop
round. The direct Durable Object slice and its local integration path are now
implemented. Remaining checks and gates are stated explicitly below; this document
does not turn local evidence into production or device acceptance.

## Baseline

Use Node.js 24.14.x. The current package manifest declares Node `>=22.12`; Node
24.14 is the agreed working baseline for the P1 slice and should be recorded with
`node --version` and `npm --version`.

Install the locked dependencies with:

```text
npm ci
```

The intended dependency baseline is TypeScript 6.0.2, Vite 8.2.2, Vitest 5.0.0,
Wrangler 4.130.0, and `@cloudflare/workers-types` 5.20260910.1. TypeScript 7 is
not part of this baseline because the current ESLint TypeScript peer range does not
accept it. Keep the lockfile and the package manifest aligned when implementation
starts.

## Local loop

Run the build before starting the Worker:

```text
npm run build
npm run dev
```

The `dev` script starts Wrangler on `127.0.0.1:8787` and serves the built `dist`
assets through the Worker. The repository now has the Wrangler configuration and
Worker entrypoint needed for this local slice. A successful local run records the
exact URL, configuration, asset shell response, and room WebSocket upgrade.
The real Wrangler process-restart scenario passes: membership and the Start
acknowledgement are retained, overdue phases advance, and the award is applied
exactly once.

Do not use `wrangler deploy` in this stage. The first adapter is direct Cloudflare
Durable Objects with SQLite storage and alarms, exercised through local Wrangler;
there is no deployment or paid Cloudflare plan authorized.

## Checks

The current local evidence is:

- the automated suite: 43 passing tests;
- `npm run typecheck`, `npm run lint`, `npm run build`, and the surface detector:
  passing;
- `npm run test:integration`: passing its local Wrangler HTTP/WebSocket scenarios
  for create/join, origin and credential rejection, clock readiness, host auth,
  countdown/alarm, privacy, generation, equal/conflicting retries, awards, and the
  closed summary;
- the real Wrangler process-restart scenario: passing, including retained
  membership/Start acknowledgement, overdue phase advancement, and exactly-once
  award behavior;
- the development `sharp` advisory is fixed with the 0.35.4 override and `npm audit`
  is clean.

Run or reproduce the repository scripts in this order when changing the slice:

```text
npm run typecheck
npm run lint
npm test
npm run build
npm run test:adapter
```

`test:adapter` owns an isolated Wrangler on port 8790, runs the HTTP/WebSocket
suite and actual process restart, then removes its temporary persistence. It refuses
an occupied port. `test:integration` separately targets an already-running local
Worker on 8787. Abrupt external cancellation may leave temporary state or an owned
child process; ordinary completion and failure clean up, including Windows lock retries.

Keep the output and tool versions with the evidence record. The integration command
is expected to exercise the local Durable Object adapter and runner scenarios,
including admission and recovery credentials, retry deduplication, monotonic full
snapshots, deadlines/alarms, close/tombstone behavior, and the atomic award path.
These checks cover the local technical slice and do not pass the two-phone/laptop
P1 gate.

If code changes while `wrangler dev` is running, restart Wrangler before relying on
alarm evidence. Cloudflare documents that Durable Object alarm methods can fail
after a local hot reload. Local Wrangler also runs the Worker with `TZ=UTC`; record
that when comparing time-sensitive logs.

## Emulator and device evidence

The Android Emulator host flow passes for create, one round, results, reload/resume, and close with a protocol guest. Guest UI and broader device checks remain unverified. To point an emulator at
the local Worker, keep Wrangler bound to loopback and run:

```text
adb reverse tcp:8787 tcp:8787
```

Record the emulator name/API level, viewport and text scale, host flow, guest flow
when available, reconnect/background behavior, keyboard state, and any screenshots
or logs needed to reproduce a finding. Emulator inspection is UI evidence only. The
P1 acceptance gate still requires two real phones and a laptop, including the host
browser closing mid-round; those devices are currently unavailable and the gate
must remain open.

## Evidence categories

For each run, preserve:

- environment: commit, Node/npm versions, locked package versions, OS, emulator or
  physical-device details;
- build/tooling: `build`, typecheck, lint, unit-test, and integration-test outputs;
- local transport: Wrangler address, HTTP asset response, WebSocket admission,
  origin checks, frame-size/rate-limit observations, and reconnect attempts;
- runner correctness: room lifecycle, credential recovery, connection generations,
  action IDs and equal/conflicting retries, full snapshot ordering, phase epochs,
  alarm deadlines, and exactly-once awards;
- state/privacy: frozen roster, public/private/secret projections, safe completed
  result recovery, cleanup/tombstone behavior, and absence of credentials in URLs;
- UI/device: Android Emulator interaction and viewport notes, with real-phone and
  laptop evidence added only when those devices are available;
- gate status: pass, fail, blocked, or not run, with the missing evidence named.

Independent Sol logic and Terra UX reviews, plus the contract, runner, and UI
reviews, passed after corrections. Reviewers supplied no emulator evidence. Do not
mark P1, P2, or human playtest gates complete from source review, synthetic fixtures,
local integration, or emulator-only inspection. Later games remain out of the local
implementation scope.

## Official references checked 2026-09-10

- [Cloudflare Durable Objects getting started](https://developers.cloudflare.com/durable-objects/get-started/): local `wrangler dev`, Durable Object bindings, and SQLite class configuration.
- [Cloudflare Wrangler `dev`](https://developers.cloudflare.com/workers/wrangler/commands/workers/): local Worker execution, `--ip`, `--port`, and local runtime behavior.
- [Cloudflare SQLite-backed Durable Object Storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/): SQLite storage and alarm API details.
- [Cloudflare Durable Objects known issues](https://developers.cloudflare.com/durable-objects/platform/known-issues/#alarms-in-local-development): local alarm hot reload caveat.
- [Vite getting started](https://vite.dev/guide/): current Node.js prerequisite (20.19+ or 22.12+), which Node 24.14 satisfies.

These references describe the upstream runtime. They do not verify this repository's
implementation; local command output and the P1 acceptance evidence remain the
source of truth for this project.
