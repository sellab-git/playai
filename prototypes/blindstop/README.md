# Blindstop prototype

The current deliverable is `mockups/blindstop.html`, a standalone interactive HTML mockup with embedded assets. It is not a production multiplayer application.

## Run and check

From this directory:

```sh
python -m http.server 8000 --bind 127.0.0.1
node tools/check.cjs
```

Open http://127.0.0.1:8000/mockups/blindstop.html. The current title is Playai · Blindstop. The room-level UX decisions are in `docs/DECISIONS.md`; validation evidence is in `docs/VALIDATION.md`.

## Sources of truth

- `docs/STATE.md`: current scope and working status.
- `docs/DECISIONS.md`: accepted product and interface decisions.
- `docs/GAME-RULES.md`: implemented game rules.
- `docs/KNOWN-ISSUES.md`: limitations and unresolved checks.
- `docs/NEXT.md`: immediate work and separately identified proposals.
- `docs/VALIDATION.md` and `docs/LOCAL-REVIEW.md`: evidence and test limits.

Later prototype decisions supersede conflicting root specifications for this prototype only. Root architecture documents remain the baseline for future production work. See the reconciliation table in `docs/LOCAL-REVIEW.md`.

`history/` and `archive/` are historical assets, not the current build pipeline. `docs/handoff/` preserves the original versions of documentation updated during local onboarding. `MANIFEST.json` records the original handoff checksums and is intentionally not regenerated.

Conversation is in Polish. New documentation, code, copy, commits, and GitHub tracking are in English. Root `AGENTS.md` must remain intact.
