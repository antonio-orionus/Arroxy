# General

## Engineering Principles

The defaults below apply to every change in this codebase.

- **Type safety throughout.** Favor strict typing, exhaustive checks, and discriminated unions. `any` is never acceptable in production code — it disables checking rather than describing a boundary. Use `unknown` instead, and narrow it as below.
- **Validate at trust transitions.** Data received from IPC, persistence, external processes, network responses, environment/configuration, browser evaluation, and untyped framework APIs enters as `unknown` when its runtime shape is not guaranteed. Convert it through an owned parser or normalizer into a named trusted type before domain logic consumes it. Parsers may accept `unknown` and use runtime checks. Runtime narrowing remains valid for typed unions, optional values, capability detection, and error normalization. Prefer schemas, type guards, contextual typing, and discriminated unions over assertions. A necessary assertion must be supported by a locally visible check or a precise documented invariant.
- **Clean architecture.** Keep concerns separated, dependencies pointing inward, business logic decoupled from frameworks and I/O. The renderer shouldn't know how the main process fetches; the main process shouldn't know which component renders.
- **Prefer mature libraries over bespoke code.** For validation, HTTP, ORM, auth, logging, and similar plumbing, reach for the production-proven, widely-adopted package before writing your own. If a mature library solves the problem, use it.
- **Push back when something looks wrong.** Don't defer to the user reflexively. If a proposal looks incorrect, incomplete, or inconsistent with the codebase, name the specific reason rather than agreeing. Agreement-by-default is a failure mode.
- **Verify before you act on uncertainty.** When you're not confident about a fact, an API surface, a library's behavior, or how a piece of this codebase works, check it — read the source, check the docs, run a quick test. Assumed knowledge is the most common source of bugs.
- **Reuse the domain glossary** in `GLOSSARY.md` — the canonical naming reference for the architecture. Use those terms exactly when extending or refactoring; add new entries when extracting modules instead of letting parallel vocabularies sprout.
- Don’t fight errors! Whenever you encounter the same error 3 times, research the web (and github using gh api) and find 3-5 possible ways to fix it. Then choose the most efficient solution and implement it or stop to notify user that there is no clean fix at this point.

---

## Repo Layout — this is a monorepo

Arroxy is a Bun workspace (`workspaces: ["packages/*"]`), not a single app:

- `src/` — the Electron app (`main` / `preload` / `renderer` / `shared`).
- `packages/yt-dlp-bridge` — yt-dlp workflow planning, argv generation, process execution, output parsing. Published as `yt-dlp-bridge` on npm; the app consumes it via `workspace:*`.
- `packages/ytdlp-errors` — structured yt-dlp error taxonomy. Published as `ytdlp-errors` on npm; `yt-dlp-bridge` depends on it.

**Both packages live in this repo — never clone them separately.** "Publishable package" in the tooling contract below means published *from here*, not maintained elsewhere.

Gates after touching either package:

```bash
bun run errors:check   # ytdlp-errors: typecheck + test + build + pack:dry-run
bun run bridge:check   # yt-dlp-bridge: builds ytdlp-errors first, then the same chain
```

Publishing is **not** part of the app release. Each package ships on its own annotated tag — `yt-dlp-bridge-v*.*.*` and `ytdlp-errors-v*.*.*` (`.github/workflows/publish-*.yml`), or manual `workflow_dispatch`. Pushing to `main` publishes nothing. So a package change is a separately-released change: keep it off the critical path of an app-side fix that does not need it.

---

## Domain Glossary

Use the canonical glossary in [`GLOSSARY.md`](./GLOSSARY.md).

The glossary is the single source of terminology for this repo. Keep it implementation-free (no module names, file paths, or migration notes) and update it when vocabulary decisions change. This prevents ambiguous PR reviews and keeps architecture and UX aligned.

### ADRs

Write an ADR in `docs/adr/NNNN-slug.md` (sequential numbers) only for a decision that is hard to reverse, surprising without context, and chosen through a real trade-off. Keep it short; skip ADRs for reversible or obvious choices.

---

## Working Conventions

**No backward compatibility** — Do not prioritize migration paths, backward compatibility shims, or preserving existing implementations. Existing code can be discarded or restructured without ceremony. Skip any "keep for compat" hedging. Delete old types, old components, old state fields without re-exporting or aliasing. Refactor aggressively. No deprecation notices or transitional layers.

**schemas.ts is SSOT for all enum types.** Pattern: `z.enum([...])` → `type Foo = z.infer<…>` → `const FOOS = fooSchema.options`. Don't redeclare as TS union literals. `QUEUE_STATUS` / `STATUS_KEY` live in `schemas.ts` (not `constants.ts`). `DEFAULTS` lives in `constants.ts`.

**TDD for non-trivial changes.** Write failing tests first, implement minimally, then refactor. Skip only for typo fixes and single-line edits.

**`bunx`, never `npx`.** Run one-off package CLIs with `bunx` (e.g. `bunx skills find <query>`, `bunx skills add <owner/repo@skill>`), even when a skill or upstream doc says `npx`. Inside this checkout `npx` fails with `EOVERRIDE` (`Override for @types/react@… conflicts with direct dependency`) because the root `overrides` apply to npm's package runner; `bunx` ignores them. `check:tooling-contract` already rejects npm-family commands in tracked tooling and docs.

**Translation workflow.** Use the `translate-arroxy-i18n` project skill for app locale changes, PO/POT sync, generated locale JSON, and i18n audits.

**Session scope.** Treat every agent session as scoped to the task context it was given. Other agents may be working in parallel on the same branch, so do not repair, reformat, revert, or restructure files outside your current scope just because you notice a problem there.

### Agent Skills

- **translate-arroxy-i18n** — manages app locale updates, gettext PO/POT sync, runtime locale JSON generation, and i18n audit commands. Entry point: `.agents/skills/translate-arroxy-i18n/SKILL.md`.
- **ship-fix** — runs the end-to-end flow for a bug fix: worktree, test-first fix, PR, CodeRabbit, CI validation, squash-merge, version bump and release, with cheaper subagents for mechanical work. Entry point: `.agents/skills/ship-fix/SKILL.md`.

---

## Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State assumptions explicitly. Ask if uncertain.
- Multiple interpretations? Present them — don't pick silently.
- Simpler approach exists? Say so. Push back when warranted.
- Unclear? Stop. Name what's confusing. Ask.

## Goal-Driven Execution

**Define success criteria. Loop until verified.** Transform tasks into verifiable goals: "Add validation" → tests for invalid inputs, then make them pass. "Fix the bug" → reproduce-test, then make it pass. "Refactor X" → tests pass before and after. For multi-step tasks, state a brief plan with a `verify:` line per step.

For multi-step tasks, use this shape:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria like "make it work" require constant clarification.

**Simplify aggressively.** If you write 200 lines and it could be 50, rewrite it. Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

---

# Project-Scoped

## Memory storage — project-scoped, not user-scoped

Persistent memory for this repo lives at `./.agents/memory/`, not in any user-scoped (`~/.claude/projects/...`) or tool-specific (`./.claude/memory/`) location. Read `MEMORY.md` in that directory for the index, and write new memories there following the same `name` / `description` / `type` frontmatter convention as the existing files. Do **not** write project facts, conventions, or references into user-scoped memory — they belong with the repo so other clones / collaborators / reset-home agents can see them.

Rarely-needed deep-dive references that bloat this file (e.g. the YouTube bot-protection research map) live as memory entries instead of inline sections here. Pull them in via memory when the symptom matches.

## Agent skills — light repo, recoverable installs

Keep installable third-party skills out of Git. Their source directories under `./.agents/skills/` are local restored state, and their recovery metadata lives in the tracked `skills-lock.json`. After a fresh clone or accidental local checkout deletion, run:

```bash
bun run agents:skills:restore
```

Only tiny project-owned, non-installable skills stay tracked under `./.agents/skills/`. Do not add `.claude/skills/` to Git; that directory is local/generated only. If a new public skill is useful for Arroxy, add it through the Skills CLI so `skills-lock.json` records the source and hash instead of committing the skill's source tree.

## Agent tooling — no tool lock-in

The repo works the same for any coding agent. Keep agent config in three layers:

1. **Shared sources (tracked, plain files):** `AGENTS.md`, `GLOSSARY.md`, `.agents/memory/`, `.agents/skills/` + `skills-lock.json`, and `.agents/mcp.json`. Edit only these.
2. **Per-tool adapters (gitignored, generated):** `.claude/skills/` links, `.mcp.json`, `.codex/config.toml`, `opencode.jsonc`. (`CLAUDE.md` is a tracked symlink to `AGENTS.md`.) `bun run agents:sync` rebuilds them (`bootstrap` and `agents:skills:restore` run it too). Codex and OpenCode read `.agents/skills` natively; only Claude Code needs the links. To add a tool, extend `scripts/agents-sync.ts`.
3. **Harness plugins (per machine, never in the repo):** Superpowers, context7, playwright, CodeGraph prompt hooks, etc. install differently in every tool — see [`dev-docs/agent-setup.md`](dev-docs/agent-setup.md). Tracked files must not depend on them: never reference plugin-namespaced skills (`superpowers:*`, `feature-dev:*`) or tool-specific tool names as requirements. If a plugin workflow matters for Arroxy, write the rule into `AGENTS.md` or a project skill.

---

## Post-Task Checks

After completing any implementation task, run this single command and fix all errors caused by your change before reporting done:

```bash
bun run check   # vp check (format + lint + types + import cycles) + tests + knip + tooling contract + package gates
```

Do not skip. A change in one file can break types, introduce dead code, or create circular imports elsewhere.

If `bun run check`, lint, typecheck, or tests report an unexpected failure that is not clearly attributable to your current task, do not try to fix it opportunistically. Capture the relevant failure, state that it appears outside the current session scope, and leave it alone so a parallel agent's in-progress work is not disrupted. Only touch unrelated files when the user explicitly expands the scope or when you can show the failure is a direct consequence of your edits.

### Fast static check

```bash
bunx vp check           # format + lint + type errors + import cycles, ~5 s
bunx vp check --fix     # same, and apply formatter and lint fixes
bun run knip:test-only  # src/ files imported only from tests/ — potential dead production code
```

Use `vp check` while iterating; `bun run check` is the full gate before reporting done. Run `knip:test-only` when reviewing whether a helper belongs in `src/` or `tests/`.

### Toolchain — Vite+

Formatting, linting, tests, library packaging, staged-file checks, commit hooks and the `check` task runner all come from [Vite+](https://viteplus.dev) (`vp`), configured in the root `vite.config.ts`. Run it as `bunx vp <command>` or through the `bun run` scripts. Its docs for the installed version live at `node_modules/vite-plus/docs`; read them rather than guessing flags, and use `bunx vp toolchain` to see bundled tool versions. electron-vite still owns the Electron dev and build. `vp check` type-checks through the TypeScript 7 toolchain; the publishable packages still type-check and build with `tsc`. Do not bring back Biome, Madge as a gate, husky, lint-staged, concurrently or tsup. The root `oxlint`, `oxlint-tsgolint` and `@oxlint/plugins` pins must match the versions `vite-plus` bundles; bump them together with `vite-plus`.

The root-owned tooling contract lives in `dev-docs/tooling-contract.md`. Do not add package-local formatter/linter configs. Publishable package runtime `workspace:*` dependencies are allowed only for local workspace packages and must pass packed metadata verification.

### Dev workflow

```bash
bun run dev        # normal dev start
bun run dev:fresh  # clear main.log then start (cross-platform)
bun run dev:anon   # own profile (<userData>-anon): Explore signed out every launch, no first-run gates, no cookies
bun run doctor     # inspect checkout readiness and selected dev paths/ports
```

### Fresh checkout / worktree bootstrap

Worktree creation is tool-owned. After any fresh clone or worktree created by another harness, run:

```bash
bun run bootstrap
```

`bun run bootstrap` prepares the checkout. Dev launchers use per-checkout ports and `ELECTRON_USER_DATA` so multiple checkouts can run in parallel.

Use `bun run doctor` to inspect the selected renderer port, Electron user data path, temp path, and required local artifacts.

Use `bun run repair` for a non-destructive checkout repair when dependencies, Electron payloads, Playwright browsers, or embedded ffmpeg/ffprobe artifacts are missing or stale.

### Test runner

Use `bun run test` (vitest), **not** `bun test` (Bun's built-in runner ignores vitest config and per-file `// @vitest-environment` directives). For a single file: `bunx vp test run --project node <path>` or `--project jsdom <path>` from repo root. Test files import from `vite-plus/test`, not `vitest`.

When adding idempotent IPC registration (`ipcMain.removeHandler()`, `autoUpdater.removeAllListeners()`), add the method as `vi.fn()` to the matching `vi.mock('electron')` / `vi.mock('electron-updater')` blocks — otherwise tests fail at module-load with `TypeError: X is not a function`.

### Run Electron E2E without stealing focus

Electron E2E launches a real app window, which steals focus and interrupts whoever is at the keyboard. **Always set `ARROXY_E2E_HEADLESS=1`** when running these locally:

```bash
ARROXY_E2E_HEADLESS=1 bunx playwright test tests/e2e/fixture-workflows.spec.ts --config playwright.config.ts --workers=1
ARROXY_E2E_HEADLESS=1 bunx playwright test tests/e2e/fixture-workflows.spec.ts --config playwright.config.ts --workers=1 -g "<test name>"
```

The flag only takes effect together with `ARROXY_E2E=1` (which the fixture harness already sets) — see `isHeadlessWindowRequested()` in `src/main/e2eHarness.ts`. It maps to `show: false` on the `BrowserWindow`, so the app runs and is fully driveable, just never paints on screen. Electron has no Chrome-style `--headless`, and `xvfb-run` only helps on Linux, so this is the portable option on macOS and Windows.

Rebuild first (`bun run build`) — the E2E suites launch `out/main/index.js`, not the dev server. Never hide the build's output: it type-checks first and stops on any error (including in test files), leaving the old bundle in place. The E2E global setup refuses to run when `out/main/index.js` is older than any file in `src/` (`ARROXY_E2E_ALLOW_STALE_BUILD=1` to override).

---

## Arroxy Testing Architecture

Arroxy is an Electron desktop app: do not let React/component testing habits replace product workflow validation. A bug found through real user actions (paste, metadata loading, wizard navigation, queue controls, pause/resume/cancel, file output) must be verified through the layer that can exercise those actions in the real app: **Fixture Product E2E** (`ARROXY_E2E=1`) is the acceptance owner for real user workflows. Pure rules go to fast logic tests, visual states to the Scenario Workbench, boot/preload to Mock Electron smoke tests, and live YouTube only ever to a tiny drift smoke test, never the acceptance gate.

The layer-ownership table, how to choose a layer, and how to design a scenario (risk groups, milestones, oracles, anti-patterns) are in [`dev-docs/fixture-e2e.md`](dev-docs/fixture-e2e.md). Read it before adding or reshaping a test.

---

## Visual Debugging

For renderer-only visual work, start the browser-mock renderer through the project wrapper and read its URL from `doctor`:

```bash
bun run dev:mock
bun run doctor
```

`browserMock.ts` stubs `window.appApi` only in this explicit `browser-mock` mode; Electron dev and packaged builds always use the real preload bridge. The gallery lists every Scenario Workbench state (`?scenario=<id>`, ids in `src/renderer/src/dev/browserMockScenarios.ts`) and `?kit` opens the UI kit. Update-banner scenarios (`update-direct`, `update-scoop`, `update-homebrew`, `update-winget`, `update-portable`, `update-flatpak`) are the only ones that emit an update event. Prefer `agent-browser` for interactive checks and screenshots; Playwright only for traces, tests, or `_electron.launch()`.

Electron-specific behavior (real preload, IPC, GPU) needs the real app: `REMOTE_DEBUGGING_PORT=9333 bun run dev`, then attach over CDP. Backdrop or WebGL problems in Electron: run `bun run gpu:probe` before touching backdrop code. Port pinning, CDP attach, the agent-browser and Playwright recipes, locale simulation, and the GPU/backdrop fallback model are in [`dev-docs/visual-debugging.md`](dev-docs/visual-debugging.md).

---

## shadcn/ui Configuration

shadcn/ui (`base-nova`, config in `components.json`) is the primary source for renderer UI primitives. Reuse an installed component or install one with `bunx shadcn@latest add <component>` before inventing controls, panels, form layouts, option groups, empty states, callouts or badges; prefer composing primitives (`Field`, `InputGroup`, `ButtonGroup`, `ToggleGroup`, `Card`, `Alert`, `Empty`, `Separator`, `Badge`) over raw styled markup. Custom primitives only when shadcn has no fit or the component encodes Arroxy-specific behavior.

- **Do not add Radix** (`@radix-ui/*`) or assume it is available; never hand-roll `@base-ui/react/*` wrappers.
- **One-off styling is ratcheted** by `tests/unit/ui-consistency-ratchet.test.ts`: counts may only go down. Use a primitive variant or token instead of an arbitrary value.
- **Segmented controls own their layout**: never style a `ToggleGroupItem` at the call site; use `shape="chip"` plus `flex-wrap` for short tokens, and `wrap-anywhere`, not `break-words`.
- Review primitive changes in the UI Kit (`bun run dev:mock`, then `/?kit`).

The token list, ratchet baseline command, toggle rules and translation-width tests are in [`DESIGN.md`](DESIGN.md) §7.

---

## Brand / Visual

**Font:** Poppins (`@fontsource/poppins`, weights 400/500/600/700); don't reintroduce Outfit or Geist. Use tokens and variants from `src/renderer/src/styles.css`, never arbitrary values: one primary action per view is `<Button variant="glow">`, selected surfaces `bg-primary/12`, muted labels `text-subtle-foreground`, small type `text-caption`, back/secondary buttons `variant="outline"` (see `DESIGN.md`).

Breakpoints are Tailwind v4's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536), no overrides. The Electron window's minimum is 720×760 and default 1024×860 (`WINDOW_*` in `src/shared/constants.ts`), so `<640px` is browser-mock/test coverage only.

---

## Subtitle Pipeline

Subtitles are a soft second phase (ADR 0002): phase 1 downloads media with `--no-write-subs --no-write-auto-subs`; phase 2 runs only if phase 1 exits 0 and languages were picked. A phase-2 failure emits `subtitlesFailed` and still finalizes as `completed`. Embed mode also uses phase 2, then muxes with ffmpeg and passes `--merge-output-format mkv`; sidecar and subfolder modes pass no container flag. `sanitizeSubtitleMap` (`ProbeService.ts`) keeps only `-orig` automatic captions for sites whose `autoCaptionRequiresOrigSuffix` is set (YouTube); see memory `youtube-auto-caption-orig-tracks`.

---

## In-App Update Notifications

`electron-updater` checks 5 s after launch and every 6 h after, announcing each version once; auto-download is **off**, the user starts every update. Every install channel must hear of a release. `resolveAction(channel, platform)` picks the banner's action per install channel (copy-command for Scoop/Homebrew/Flatpak, download link for portable and macOS, the GitHub release for the Linux tarball, "Install & Restart" otherwise). Channel table, IPC and the Linux AppImage gate: [`dev-docs/in-app-updates.md`](dev-docs/in-app-updates.md).

---

## Release Pipeline

Pushing an annotated `v*` tag publishes to GitHub Releases, Scoop, Homebrew Cask, Winget and Arroxy's own Flatpak repo in one go; a `-beta.N` suffix makes a pre-release that skips the package managers and never auto-updates installed copies. Both are cut from `main`, the only long-lived branch.

- **When the user says "release X":** run `bun run check`, add the `## X` section to `CHANGELOG.md`, commit `release: X` with the `package.json` bump, then run `bun run release:beta` or `bun run release:stable` yourself. Don't hand the script back to the user.
- **Tags must be annotated and pushed alone** (the wrapper does both): `git push --follow-tags` silently skips lightweight tags, and also pushes any stale local tags; GitHub fires no tag events when one push carries more than three tags, so the pipeline never starts.
- **`CHANGELOG.md` is the release-notes source.** Never edit GitHub release notes in the web UI or with `gh release edit`; `publish-release` overwrites them. Fix the changelog and re-run that job.

Checklist, beta-then-stable sequence and manual fallback: [`dev-docs/release-runbook.md`](dev-docs/release-runbook.md). Job graph, secrets, Winget, external repos and shipped assets: [`dev-docs/release-pipeline.md`](dev-docs/release-pipeline.md). Keep third-party actions that receive a token pinned to a full commit SHA, and never rotate the Flatpak signing key casually ([`dev-docs/flatpak-repo.md`](dev-docs/flatpak-repo.md)).

---

## Binary distribution strategy

Release builds bundle no third-party binaries. yt-dlp is fetched and updated at runtime (ADR 0003); ffmpeg/ffprobe come from an approved **FFmpeg package**, installed once per machine and kept across app updates (ADR 0010). FFmpeg versions change only by editing the committed pins in `FfmpegPackagePins.ts`, and the daily manifest is generated from `main`, so a merged pin change reaches every user within a day without an app release: review it as a release. FFmpeg releases in `arroxy-runtime-binaries` must be published with `--latest=false`, and FFmpeg entries go only in the v2 manifest, never v1. Dev builds and fixture E2E use `build/embedded/`. Keep the `runAsNode` fuse: the packaged Electron is yt-dlp's Node runtime, and `ELECTRON_RUN_AS_NODE=1` goes **only** into the yt-dlp child environment, never `process.env` or persisted config. `scripts/test-binaries/` must stay tracked. Strategy and licensing: [`dev-docs/binary-distribution.md`](dev-docs/binary-distribution.md); packages, approval and publishing: [`dev-docs/ffmpeg-packages.md`](dev-docs/ffmpeg-packages.md).

---

## Updating Public-Facing Content (READMEs)

`README.md` and every `README.{lang}.md` are **generated** from `readme-src/` by `node readme-src/build.mjs`: never edit them, or their `Last updated:` stamp, directly. Every new string goes into every locale (the build fails on key-parity drift), and the locale list or count is never hardcoded anywhere. Landing-site copy lives in the `arroxy-web` repo. Adding a feature line, the canonical locale lists, and regenerating screenshots: [`dev-docs/readme-pipeline.md`](dev-docs/readme-pipeline.md).
