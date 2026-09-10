# Local room contract amendment

The 2026-09-10 continuation authorizes the P1 technical slice. Human and physical-device gates remain unpassed. This resolves the generic amendment required by the readiness decisions before game implementation.

`src/engine.ts` owns JSON transport types, explicit pure reduction acceptance/rejection, current host context, opaque phase tokens and game-declared awards. Runtime owns frozen rosters, instance IDs, increasing phase epochs and snapshot versions. It validates awards for exactly the roster with integer values in 0..N. Core never interprets a game's identity or fields.

Runner persists one aggregate containing room, opaque game state, recipient-safe completed projections, credential hashes, generation counters, retry outcomes and award records. Storage commit and next alarm are one adapter transaction; replies follow commit. Adapter serializes events. Aborted games have no award; completed games retain safe projections until host lobby navigation and cannot abort. Game-action outcomes remain until room cleanup.

Use Cloudflare Durable Objects directly for the initial adapter, with SQLite storage and local Wrangler, instead of adding PartyKit's additional transport layer. This refines the Cloudflare runtime integration; it does not change the room/game seam. Only one provider is implemented. Provider types stay out of engines and UI. No cloud deployment or paid plan is authorized.

Membership credentials are 256-bit opaque server-generated values returned only by same-origin admission POST. Browser stores them locally with room code, separately from correlation ID; server persists SHA-256 hashes. Recovery POST and first WebSocket authentication frame carry the credential in their body, never a URL. Require exact same-origin Origin for browser admission/recovery/WebSocket requests; HTTPS/WSS outside loopback. Credentials are not analytics data. JavaScript storage permits refresh recovery; CSP and no third-party scripts reduce exposure, but XSS remains a risk before public deployment. New socket authentication increments membership generation and invalidates the old socket. Admission by code creates a new member; recovery is separate. Device ID is never an authorization claim.

Mutating commands use stable action IDs; game commands also carry instance, phase epoch and round ID. Canonical payload comparison distinguishes equal retries from conflicts. Authenticate current connection before looking up outcomes. Rejected outcomes are retained too. Close leaves a terminal tombstone; cleanup removes aggregate including private state and credentials while preserving terminal absence. No retry creates a room. Admission, frame size and rate limits bound growth; deduplication records are not silently evicted.

Client sends intents and renders only increasing full snapshot versions. Clock replies echo t0; readiness requires a valid estimator sample. Elapsed Tap uses performance.now relative to announced future round start. Unknown delivery retains original ID and scope for authenticated retry, never creates another logical Tap.

Verification order: contract review, runner scenarios written before capabilities, pure single-round game, local provider integration, bounded UI, independent logic and UX reviews, Android Emulator. Two phones and laptop remain P1 acceptance gate.

Runtime references checked 2026-09-10: [Cloudflare local development](https://developers.cloudflare.com/durable-objects/get-started/), [SQLite storage and alarms](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/), [Vite Node prerequisites](https://vite.dev/guide/). Installed versions and evidence are recorded separately.

## Durable aggregate details

`src/room/types.ts` defines runtime-owned membership generations, game instance, frozen roster, phase epoch, retained result, outcome ledger, award ledger and current alarm scope. Aborting removes the active instance atomically and records the keyed notice; completed instances cannot take that path. Outcomes are keyed by membership ID then action ID, independent of socket generation.

Each game instance persists seed and accepted-transition counter. Every reduction receives a fresh deterministic PRNG derived from those two values. Only an accepted reduction increments the counter; retries and rejected actions consume no durable randomness. Initialization uses the seed and stream zero, then starts the transition counter at one.

Cleanup replaces the aggregate with a minimal persistent tombstone in the same Durable Object, atomically deleting member, private, credential and outcome material. The tombstone has no personal data and its room code is never reused. Creation checks for any existing record, including a tombstone; join/recovery never initialize absent storage.

The registration adapter closes over concrete JSON-compatible engine types and validates durable state through its game-owned decoder before each operation. Invalid durable state fails closed as an adapter error and is never projected. A compile-time fixture verifies the boundary without any or unchecked type coercion.

Full snapshots include the latest durable acknowledgement belonging to their authenticated recipient. This allows the client to resolve a lost direct acknowledgement by action ID without interpreting game-private fields. Pending intents whose outcome remains unknown keep their original ID/scope until the authoritative outcome is resolved; a changed phase alone is not proof of success.
