# shadcn sourcing and maintenance workflow

Date: 2026-09-10. Scope: the accepted Playai Next.js migration and the earlier read-only process audit across projects 36 and 42.

## Current Playai installation evidence

The local CLI is pinned to 4.21.0 and the component foundation is Base UI 1.8.0. `npm exec -- shadcn info --json` identifies Next.js 16.3.4, App Router/RSC, TypeScript, Tailwind 4, base-vega, canonical paths and ten installed primitives. `components.json` retains the upstream generator icon setting, but executable Playai components use approved hand-drawn icons and the source check rejects Lucide imports.

The official project skill is installed at `.agents/skills/shadcn/SKILL.md`. `skills-lock.json` records source `shadcn/ui`, path `skills/shadcn/SKILL.md` and computed hash `d04e43ec01e921558b93bb8046c14a42a22556689a2827243df900825a4e1604`. This is installation evidence; skill availability in a future agent session depends on that client's skill discovery.

`docs/design/shadcn-components.json` inventories button, collapsible, dialog, field, input, label, separator, switch, toggle-group and toggle. Each record identifies the official registry item, retrieval date, tool versions, exact original local source and its SHA-256. `tooling/shadcn/baseline/` contains comparison fixtures captured before adaptation, not another executable UI. Hashes describe those immutable baselines, not the intentionally adapted live files.

The nonmutating command `npm exec -- shadcn add button dialog switch toggle-group input --diff` completed against the official registry. It proposes overwrites that restore upstream visual recipes, including moving button press states, link underlines, shadows, larger dialog geometry and Lucide/literal close copy. Those changes conflict with accepted Playai requirements and were not applied. CLI output limits the displayed files; use `--diff <path>` for a complete focused inspection before modifying an individual component. This probe establishes successful registry access and concrete overwrite differences, not that every installed component has no upstream changes.

`node scripts/check-ui-contract.mjs` passes for the ten imported baselines and current React source. It checks baseline hashes, complete local primitive inventory, configured foundation, approved primitive/icon imports, no imperative HTML injection in TSX, and no literal colors or selected shadow/gradient patterns in TSX. It does not parse all styling semantics, verify accessibility or establish visual parity. Wire this command into the package/CI gate alongside integration tests.

The SDK-based `npm run verify:registry` probe now connects to the pinned MCP server,
lists seven tools and successfully queries Playai's official registry for button items.
Project configuration is in `.codex/config.toml`. This does not establish that an
already-running Codex conversation has hot-loaded native tools; the CLI remains
the explicit fallback. See the [layered audit](../validation/nextjs-layer-audit.md).

The migration and Android acceptance are tracked by the current status/validation records; installation and a passing static check alone do not establish completed UI acceptance.

## Findings from Skiloq

Read directly, without changing either project:

- Project 36, HEAD `6f78ea9d238e6feb57f7e7dd3db870fb4a50e91d`: `web/README.md`, `web/components.json`, `web/package.json`, `docs/design/UI_SYSTEM.md`, source-governance review and root instructions.
- Project 42, HEAD `319dd69df3701aa80b4b78ac755a5dc957b06b03`: the same operator/configuration owners, `docs/design/implementation.md`, `docs/design/source-36-reconciliation.md`, local Button and `web/scripts/check-ui-contract.mjs`.
- Both configurations select `base-vega`, React server component support, TSX, Tailwind 4 variables and local `components/ui` aliases. This is shadcn built on Base UI, not shadcn versus Base UI. Project 42's installed CLI is 4.18.0 and Base UI is 1.7.0; these are observations, not version pins for Playai.
- Project 42 explicitly retained project 36's registry-first/overwrite-review process. The documents describe a historical failure where handwritten controls were called shadcn, and another where trimming a block removed a required parent and caused an interaction-time crash.
- Skiloq records intentional local adaptations and checks centralized token/primitive ownership through `verify:ui`. It does not claim that a clean compiler or source diff establishes working UI.

### Live read-only probe in project 42

Executed using its existing local CLI, with no installation:

```text
node node_modules/shadcn/dist/index.js info
node node_modules/shadcn/dist/index.js add button --dry-run
node node_modules/shadcn/dist/index.js diff button
node node_modules/shadcn/dist/index.js add button --diff
node scripts/check-ui-contract.mjs
```

`info` recognized Next.js/base-vega/Base UI and local component paths. Dry-run proposed overwriting Button and adding the `cn` dependency. `diff button` reported no updates, while `add button --diff` displayed material changes: removal of the local stationary-press adaptation, restoration of translate-on-press and transition-all, replacement of shared size tokens and addition of a link variant with underline. The probe does not establish why the two commands differ. It establishes that the old standalone diff result is insufficient as an overwrite safety gate. The local ownership check passed. No source/dependency changes were applied by this probe.

At the earlier Skiloq audit, no shadcn MCP tool was callable in that session. No shadcn entry was found in the inspected Codex MCP configuration, nor shadcn skill in the inspected agent skill directories. The project-file search did not find a project shadcn MCP configuration. These are bounded findings, not proof about other clients or past sessions.

## Tooling to establish at the Next.js foundation gate

1. Install the compatible Next.js/React/TypeScript/Tailwind foundation and an exact shadcn CLI version in the project; retain the lockfile. Check current official releases/compatibility before choosing versions. Do not copy Skiloq's historical pins blindly or execute an unpinned latest version for each maintenance operation.
2. Initialize the official shadcn configuration for Base UI. Use the base-vega family as the source starting point, subject to current CLI support. Set TSX/RSC, aliases and the actual global CSS path in `components.json`. Confirm with `shadcn info` and inspect the generated diff before adopting it.
3. Install the official shadcn agent skill from `shadcn/ui` at project scope after inspecting its source. Official documented installer form is `npx skills add shadcn/ui`; inspect its current options to select the intended agent/project scope. Record source revision. Skill instructions guide correct APIs but never override user decisions or Playai design rules.
4. Configure the official shadcn MCP service for development and verify an actual read/search against the Playai project path. Use the same pinned CLI version as the project, with an explicit working directory where supported. Configuration presence is not a connection test. Record whether the client needs reload; do not restart the user's app without coordination. Keep unrelated MCP settings intact.
5. Keep CLI access as an explicit fallback when MCP is unavailable. Obtain current official docs/registry output through CLI or official URLs, and label which method supplied the evidence. Never call MCP connected just because CLI works.

The CLI downloads component source; the skill supplies agent instructions; MCP exposes registry tools. These are different responsibilities. The running game uses local compiled components and has no shadcn registry/MCP dependency. Public official registry access does not require a private registry token. Do not add third-party registries without a concrete need.

## Component adoption, step by step

For each material component change:

1. Name the affected screen and accepted mockup/user behavior. Read its existing local component first.
2. Prefer an existing Playai component. If a standard primitive is missing, inspect the exact official shadcn item for the configured Base UI family, including its API, examples and dependency/parent requirements. Do not handwrite an imitation of an available primitive.
3. Run the pinned local CLI with the app working directory. The following commands show the required flow after installation; `<item>` is the component name, not literal shell input:

```text
npm exec -- shadcn info
npm exec -- shadcn add <item> --dry-run
npm exec -- shadcn add <item> --diff
npm exec -- shadcn add <item> --view
```

Only run npm exec after confirming the CLI exists in the locked local installation. Check that version's help before using flags. Current official docs and the Skiloq probe verify add/dry-run/diff/view; the old standalone `diff` may supplement but never replace the add overwrite preview.

4. Inspect every proposed overwrite, dependency and CSS/configuration change. Save a dated source reference and the unmodified registry item or a retrievable immutable revision/hash. A pinned CLI does not freeze a mutable remote registry.
5. Add only the needed items. Do not use `--all`, bulk reinstall, global theme apply or `--overwrite` without reviewing the concrete affected files. If an update intersects local adaptations, merge deliberately and preserve the recorded behavior.
6. Adapt centrally through tokens and the local primitive's supported variants. Build game-specific screens by composing those primitives. Preserve legal parent/child structure and behavior when removing unused block content.
7. Record provenance and intentional divergence before acceptance. Do not require zero upstream differences: our design is intentionally different. Require that every material difference has an explanation and a test/inspection where appropriate.

## Playai ownership and source inventory

- `src/tokens.css` remains the canonical token-value owner. Next global CSS maps shadcn semantic variables to those values; it must not define a competing palette.
- The React UI primitive directory owns shared Button, Input, Switch, Dialog and Collapsible behavior/styling. Product screens do not introduce independent size/state recipes for those controls.
- Start with Button, Input, Label/Field, Switch, Collapsible and Dialog only as required by the representative flow. Inspect RadioGroup or ToggleGroup semantics for mutually exclusive round presets, rather than assuming every pressed-looking button is a toggle.
- The current HTML reference and explicit user corrections own visual/product behavior. Do not copy Skiloq's Lucide icons, shadows, blur, motion, fonts, breakpoints or desktop workflow. Preserve Playai hand-drawn icons, restrained highlight colors, no gradients/shadows, radius at most 6px, i18n and tabular numbers.
- TAP, timers, results and room networking remain game/application responsibilities. A general button primitive does not prove timing accuracy or prevent all input races.

The first imported component creates `docs/design/shadcn-components.json`, maintained as one machine-readable source inventory. Each entry records component name, local path, official registry URL, base/style, CLI and foundation versions, retrieval date, baseline hash/revision, intentional adaptations and relevant verification. Store immutable imported baselines under one dedicated tooling directory if an upstream revision is not retrievable. These are comparison fixtures, not alternate executable app copies. The current Playai inventory now records the ten imported primitives listed above.

## Ongoing comparisons and updates

Use three-way reasoning: imported original -> our local component, and imported original -> current official component. This separates our approved visual changes from new upstream changes. Review behavior/security/dependency changes first, then preserve local adaptations.

Check the affected component before every modification, before accepting dependency upgrades and before a release. A future scheduled check may open a reviewable report, but this request does not create an automation. Never auto-overwrite local sources or auto-merge updates. Package updates alone do not update copied component source.

If registry access fails, report the comparison as unavailable. An unavailable online check is not a clean bill of health. Known local work can still be inspected/tested, but do not claim upstream currency.

## Automated and observed acceptance

Implement a Playai-specific `verify:ui` check alongside the first real primitives, then include it in CI. Do not copy Skiloq's product-specific string checks wholesale. Enforce source inventory coverage, a single foundation, canonical token ownership and approved primitive imports. Catch accidental return of imperative screen rendering, unapproved icon libraries, shadows/gradients and local overrides of shared control geometry, with explicit reviewed exceptions where necessary. Treat static checks as guardrails, not complete accessibility or visual proof.

Component and React integration tests cover keyboard/focus, switch/preset state, dialog X/backdrop closure and focus return, disabled/error states, rapid settings saves, old acknowledgements, reconnect, duplicate actions and Strict Mode lifecycle cleanup. Existing game/runner/adapter tests remain required. Build validation must not corrupt the active preview's output directory; use the framework's verified output isolation or a coordinated stop/build/restart.

Inspect real controls in Android Emulator, following Playai's existing environment rule. Compare with the current mockup and user corrections. Exercise press/release, focus, keyboard, open/closed, invalid, disabled and slow/failing network states; confirm settings do not flash unrelated controls. Physical phones and multiplayer acceptance remain separate gates. Independent logic/state and UX review is required for the migration; account usage limits previously prevented those reviewers, so do not inherit a passed review.

For each meaningful change record briefly: affected screen; local owner; official item/date/version; dry-run and overwrite findings; intentional adaptations; tests and Android observations; remaining gaps. Mechanical copy edits need only proportionate evidence, not a repeated full audit.

## Setup completion checklist

- [x] Local Next.js foundation and components.json recognized by the pinned CLI.
- [x] CLI installed locally at recorded version 4.21.0.
- [x] Official shadcn skill installed at project scope with a lock record; future session discovery remains client-specific.
- [x] MCP actual registry query succeeds through the SDK probe; CLI fallback recorded.
- [x] Ten official components imported with immutable baselines and explicit adaptation inventory.
- [x] Source-contract script passes locally and runs in package/CI configuration; its limited scope is documented in the audit.
- [x] Representative flow compared in Android; independent reviews recorded in [correction evidence](../validation/frontend-correction.md). Broader device/user gates remain open.

The earlier audit performed no application changes. The current installation evidence above supersedes that historical limitation; application acceptance remains a separate gate.

## Official references checked

- https://ui.shadcn.com/docs/cli — current install preview and source inspection flags.
- https://ui.shadcn.com/docs/mcp — registry tools, client configuration and connection verification.
- https://ui.shadcn.com/docs/skills — official project-aware agent skill.
- https://ui.shadcn.com/docs/theming — semantic variable customization.
- https://base-ui.com/react/overview/about — unstyled component foundation.
