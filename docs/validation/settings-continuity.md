# Settings and dialog continuity — 2026-09-10

Base fbe0813. User corrections: avoid full-screen redraw when changing Auto-start,
avoid transitional title flashes, name the game in rules, dismiss popups from the
backdrop like X, and offer 3/5/10/15/20 round presets beside manual entry.

Preparation updates keep populated controls mounted while refreshing saved summary,
control availability, errors and save feedback. Context/player changes still render
fresh server-owned state. Cached game clients render synchronously so the temporary
fallback title/body is not displayed between updates. Game rules use manifest copy.
Backdrop dismissal requires both press and release outside, avoiding accidental
closure when a gesture starts inside. Presets keep number entry and validation.

Independent logic and UX source reviews identified stale menu-disabled state,
hidden reconnect feedback and preserving an empty panel during cold loading.
All were corrected and both final focused reviews passed. Preset pointerdown also
prevents input blur from saving/disabling the preset before its click. No core or
server behavior changed. Existing 66 tests, strict typecheck, lint and build pass.

Android confirmed fresh room creation, populated preparation, preset 10 updating
the field/summary/selection, Auto-start on updating in place, menu access after
saving, the How to play Blindstop heading, and backdrop dismissal to the unchanged
expanded settings. Suppressed the native blue label tap flash found in this pass.
The title fix is supported by synchronous-render source review; no full game
was replayed for this UI-only change.
Physical-device and user acceptance remain open.
