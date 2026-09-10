# Regression scenarios

Use the current [screen map](../games/blindstop/screens.md) and [game rules](../games/blindstop/rules.md). Record actual execution separately from this checklist.

| Scenario | Acceptance |
| --- | --- |
| Create / join / QR identity | Valid entry reaches catalogue; invalid input has recovery; identity belongs to the room. |
| Host / guest | Only host chooses/starts; guest waits; preview simulation is explicitly labeled. |
| Preparation, 2 and 20 people | All participants reachable; stable avatar order; Start and settings reachable on phone and short landscape. |
| Manual rounds | No auto pause/countdown control; results wait for host. |
| Automatic rounds | Menu pauses host countdown; explicit resume advances once; pacing stays frozen for game. |
| Menu and keyboard | Back returns one level; X closes; focus returns to invoker/destination. |
| Finals and replay | Replay opens preparation; changing game opens catalogue; identity/points retained without double award. |
| Leave / rejoin | Saved phase/taps or completed results restored locally. |
| Room full / gone / active-game entry | Simulated edge screens provide accurate recovery; do not claim server validation. |

Run node prototypes/blindstop/tools/check.cjs from the repository root. This covers logic only. Browser checks do not replace physical touch, keyboard-on-phone, Safari or screen-reader verification.
