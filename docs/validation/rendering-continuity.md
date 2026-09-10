# Rendering and settings synchronization — 2026-09-10

Status: implementation and lead verification complete for the checks below; required independent review pending because reviewer agents hit the account usage limit. This is not final UX acceptance.

## Problem and systemic change

The earlier preparation-only workaround retained some markup but still used global pending state to disable the Start button and alternate save copy. Other screens rebuilt HTML and listeners on each snapshot. Those previous continuity claims were incomplete.

The shared DOM adapter now reconciles existing nodes, skips equal subtrees, preserves focus/caret/scroll/disclosure state and replaces event handlers instead of accumulating callbacks. The room shell, game body and game footer use it. Distinct phase/round/action keys prevent an old gesture from transferring to a new action. Dialog navigation intentionally creates a new modal; ordinary matching-context updates leave it open.

Settings edits remain client drafts, separate from authoritative server snapshots. An unsent command buffer coalesces latest settings, then orders one room command behind them. Start is derived by the game preparation adapter from the latest draft, preserving game-owned practice options. Game actions are never buffered or coalesced. Active intents retain their exact action ID for retries. Failure or loss of preparation context cancels unsent work. Fast background saves do not toggle global busy state or save copy. Connection loss and unresolved delivery still display feedback.

## Verification

- 82 tests pass across 14 files, including new DOM, actual UI render and mocked transport integration tests.
- Actual preparation render: repeated draft/ack cycles preserve the Start node, its enabled appearance, save text node, input focus and expanded settings. MutationObserver records no Start mutations. A preset click sends exactly one command after repeated renders.
- The first integrated test exposed accumulated handlers (121 sends for one click); stable binding fixed this and the regression now passes.
- Transport: rapid 3/10/20 edits send first and latest only; Start follows both acknowledgements, retaining practice intent. Failed acknowledgement cancels queued edits. Reconnection retries the identical action ID; draft clears only when its matching authoritative snapshot arrives.
- Shared DOM tests cover unchanged renders, text updates, keys, retained form state, independent render islands and replacement handlers. Existing intentional-click tests remain green.
- Typecheck, lint, production build and isolated HTTP/WebSocket adapter suite pass, including real process restart and full practice/two-round flow.

## Remaining acceptance

The two requested independent reviewer assignments could not run due to account usage limits. They have not approved this diff. Keep the existing delivery issue In Review and resume logic/state and UX reviews when capacity is available. Physical-phone, Safari and facilitated multiplayer acceptance remain outstanding. The real application still implements Blindstop only; the other three games remain prototype-only.
