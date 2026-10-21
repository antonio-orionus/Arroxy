# Arroxy

Arroxy's coding standards, commands and gotchas, for anyone working in this repository — human or agent.

## Engineering Principles

The defaults below apply to every change in this codebase.

- **Type safety throughout.** Favor strict typing, exhaustive checks, and discriminated unions. `any` is never acceptable in production code — it disables checking rather than describing a boundary. Use `unknown` instead, and narrow it as below.
- **Validate at trust transitions.** Data received from IPC, persistence, external processes, network responses, environment/configuration, browser evaluation, and untyped framework APIs enters as `unknown` when its runtime shape is not guaranteed. Convert it through an owned parser or normalizer into a named trusted type before domain logic consumes it. Parsers may accept `unknown` and use runtime checks. Runtime narrowing remains valid for typed unions, optional values, capability detection, and error normalization. Prefer schemas, type guards, contextual typing, and discriminated unions over assertions. A necessary assertion must be supported by a locally visible check or a precise documented invariant.
- **Clean architecture.** Keep concerns separated, dependencies pointing inward, business logic decoupled from frameworks and I/O. The renderer shouldn't know how the main process fetches; the main process shouldn't know which component renders.
- **Prefer mature libraries over bespoke code.** For validation, HTTP, ORM, auth, logging, and similar plumbing, reach for the production-proven, widely-adopted package before writing your own. If a mature library solves the problem, use it.
- **Reuse the domain glossary** in `GLOSSARY.md` — the canonical naming reference for the architecture. Use those terms exactly when extending or refactoring; add new entries when extracting modules instead of letting parallel vocabularies sprout.

## Repo Layout — this is a monorepo

Arroxy is a Bun workspace (`workspaces: ["packages/*"]`), not a single app:

- `src/` — the Electron app (`main` / `preload` / `renderer` / `shared`).
- `packages/yt-dlp-bridge` — yt-dlp workflow planning, argv generation, process execution, output parsing. Published as `yt-dlp-bridge` on npm; the app consumes it via `workspace:*`.
- `packages/ytdlp-errors` — structured yt-dlp error taxonomy. Published as `ytdlp-errors` on npm; `yt-dlp-bridge` depends on it.
- `packages/arroxy-control` — Control API schemas (requests, results, events, errors) and their JSON Schema export. Published as `arroxy-control` on npm, by its own `arroxy-control-v*.*.*` tag; no tag has been cut yet.

**These packages live in this repo — never clone them separately.** "Publishable package" in the tooling contract below means published *from here*, not maintained elsewhere.

Gates after touching a package:

```bash
bun run errors:check    # ytdlp-errors: typecheck + test + build + pack:dry-run
bun run bridge:check    # yt-dlp-bridge: builds ytdlp-errors first, then the same chain
bun run control:check   # arroxy-control: the same chain
```

Publishing is **not** part of the app release. Each package ships on its own annotated tag — `yt-dlp-bridge-v*.*.*`, `ytdlp-errors-v*.*.*` and `arroxy-control-v*.*.*` (`.github/workflows/publish-*.yml`), or manual `workflow_dispatch`. Pushing to `main` publishes nothing. So a package change is a separately-released change: keep it off the critical path of an app-side fix that does not need it.

A PR that changes a package never edits that package's changelog. Only the `release(packages): <pkg> <version>` PR writes the version's section, so feature PRs never conflict over it or claim a version number before the release picks one.

## Related repositories

Arroxy spans several repositories. This repo is the hub: the others consume what it builds or publishes, and none of them is a source for app code.

| Repository | Owns | Connection to this repo |
| --- | --- | --- |
| `arroxy-site` | The public site at arroxy.com: landing page and its copy in every site language | Its download links point at this repo's `releases/latest/download/<asset>`, so a release needs no step there; it deploys to Cloudflare with its own `bun run deploy` |
| `arroxy-web` (archived) | The old landing site and blog, replaced by `arroxy-site` | None: nothing new goes there, and releases no longer notify it |
| `arroxy-runtime-binaries` | Signed runtime manifests (yt-dlp, FFmpeg packages) and FFmpeg package releases | Its scheduled workflow checks out this repo and runs the manifest generator from `main`, so pin changes merged here ship without an app release |
| `arroxy-internal` (private) | Unbuilt plans, research records, maintainer notes | Linked as `.internal/`; see below |
| `scoop-bucket`, `homebrew-arroxy`, `winget-pkgs` fork | Package-manager manifests | Written only by the release pipeline here; never edit them by hand |

The Flatpak repo is not a separate repository: the release pipeline publishes it to this repo's GitHub Pages. Each repo's own `AGENTS.md` covers its conventions, which differ from these.

## Domain Glossary

Use the canonical glossary in [`GLOSSARY.md`](./GLOSSARY.md).

The glossary is the single source of terminology for this repo. Keep it implementation-free (no module names, file paths, or migration notes) and update it when vocabulary decisions change. This prevents ambiguous PR reviews and keeps architecture and UX aligned.

### ADRs

Write an ADR in `docs/adr/NNNN-slug.md` (sequential numbers) only for a decision that is hard to reverse, surprising without context, and chosen through a real trade-off. Keep it short; skip ADRs for reversible or obvious choices.

## Working Conventions

**No backward compatibility** — Do not prioritize migration paths, backward compatibility shims, or preserving existing implementations. Existing code can be discarded or restructured without ceremony. Skip any "keep for compat" hedging. Delete old types, old components, old state fields without re-exporting or aliasing. Refactor aggressively. No deprecation notices or transitional layers. The one exception is data on users' machines (settings, the saved queue, profiles): when its shape changes, migrate it on load rather than dropping it.

**schemas.ts is SSOT for all enum types.** Pattern: `z.enum([...])` → `type Foo = z.infer<…>` → `const FOOS = fooSchema.options`. Don't redeclare as TS union literals. `QUEUE_STATUS` / `STATUS_KEY` live in `schemas.ts` (not `constants.ts`). `DEFAULTS` lives in `constants.ts`.

**Release flags, not long-lived branches.** Work meant for a later release merges to `main` in small PRs behind a release flag, declared in the one typed registry in `src/shared/releaseFlags.ts` and read with `isReleaseFlagOn`. A flag is on in dev, the Scenario Workbench and tests, and off in release builds; it gates only entry points (menu items, buttons, routes, IPC exposure), never the logic behind them. Turning it on for release is one tiny PR, and the flag is deleted in the release after it ships. Details: [`dev-docs/release-flags.md`](dev-docs/release-flags.md).

**TDD for non-trivial changes.** Write failing tests first, implement minimally, then refactor. Skip only for typo fixes and single-line edits.

**`bunx`, never `npx`.** Run one-off package CLIs with `bunx` (e.g. `bunx skills find <query>`, `bunx skills add <owner/repo@skill>`), even when a skill or upstream doc says `npx`. Inside this checkout `npx` fails with `EOVERRIDE` (`Override for @types/react@… conflicts with direct dependency`) because the root `overrides` apply to npm's package runner; `bunx` ignores them. `check:tooling-contract` already rejects npm-family commands in tracked tooling and docs.

**Translation workflow.** A fix or feature PR changes English only: `en.json` (keys sorted, one per line) and `readme-src/locales/en.mjs`, never `i18n/**`, non-English locale JSON or other README locales. Keep the key when the meaning stays the same; give a string a new key when its meaning or a placeholder changes. Every other locale is translated in one sync PR, the first step of a release (ADR 0017). Use the `translate-arroxy-i18n` project skill for that sync, catalog changes and i18n audits.

**One concern per PR.** Each PR makes one reviewable change and passes `bun run check` on its own, so every review reads a single idea.

- **Split along seams:** a `packages/*` change apart from the app change that uses it; a behaviour-free refactor or rename before the feature that needs it; mechanical churn (formatting, licence headers, dependency bumps, locale sync, regenerated files) apart from logic; independent features or modules as separate PRs off `main`.
- **Tests stay with their code.** Never split by layer (a code PR, then a "tests and docs" PR).
- **Keep one PR** when the pieces cannot each be green alone, and say why in its body.
- **Don't stack PRs.** Every PR branches from `main`. When one piece needs another that hasn't merged, keep both in one PR with a commit each (and say why), or start the second once the first merges. Each merge in a stack makes the next PR take `main` again, rerun CI and have its auto-merge turned on by hand, and nothing wakes anyone when its base merges.
- **The `pr-policy` check enforces these PR rules** (changelog fragment, released changelog, English only, package scope, base branch, no AI attribution). A genuine exception says why with an opt-out line in the PR body, such as `No changelog: <reason>`; the keys are in `CONTRIBUTING.md` ("PR policy").

## Agent setup

- **Memory** lives in `.agents/memory/`: read `MEMORY.md` before working, and write new memories there with the same frontmatter, never in a tool's own memory. Route by audience: maintainer-only plans and notes go to `.internal/` (then `bun run internal:save`), how the maintainer runs Arroxy (reviews, merging, releasing) to `.internal/AGENTS.md`, cross-repo preferences to `~/.agents/AGENTS.md`, and everything else to `.agents/memory/`. Deep-dive references live there too, not in this file.
- **Private maintainer docs** live in the private `arroxy-internal` repo, linked as a gitignored `.internal/` by `bun run bootstrap` (or `bun run internal:sync`) when you have access. If it exists, read `.internal/README.md` too. `.internal/AGENTS.md` is the maintainer's personal layer on top of this file: `bun run agents:sync` makes every tool load it at session start, so it changes without a PR. After editing there, run `bun run internal:save`: it is a separate repo, so those edits never ride along in a PR. Tracked files never link into `.internal/`; give a one-line summary instead.
- **Agent config** is edited only in the shared sources (`AGENTS.md`, `GLOSSARY.md`, `.agents/`, `skills-lock.json`); `bun run agents:sync` generates every per-tool adapter. Install third-party skills through the Skills CLI (`bun run agents:skills:restore` after a fresh clone) and never commit their source or `.claude/skills/`. Tracked files never depend on a harness plugin (`superpowers:*`, `feature-dev:*`). Layers, and how to add a tool, skill or MCP server: [`dev-docs/agent-setup.md`](dev-docs/agent-setup.md).

## Post-Task Checks

After any implementation task, run the full gate and fix every error your change caused before reporting done. Do not skip it: a change in one file can break types, introduce dead code, or create circular imports elsewhere.

```bash
bun run check           # full gate: vp check + tests + knip + tooling contract + package gates
bunx vp check           # while iterating: format + lint + type errors + import cycles, ~5 s (--fix applies fixes)
bun run knip:test-only  # src/ files imported only from tests/: does a helper belong in tests/?
```

### Toolchain — Vite+

Formatting, linting, tests, library packaging, commit hooks and the `check` runner come from [Vite+](https://viteplus.dev) (`vp`, configured in the root `vite.config.ts`); electron-vite still owns the Electron dev and build. Read `node_modules/vite-plus/docs` rather than guessing flags. Do not bring back Biome, Madge as a gate, husky, lint-staged, concurrently or tsup, and bump the root `oxlint`, `oxlint-tsgolint` and `@oxlint/plugins` pins together with `vite-plus`. The rest of the contract (package-local configs, `workspace:*` dependencies, the TypeScript toolchains): [`dev-docs/tooling-contract.md`](dev-docs/tooling-contract.md).

### Dev workflow

```bash
bun run dev        # normal dev start
bun run dev:fresh  # clear main.log then start (cross-platform)
bun run dev:anon   # own profile (<userData>-anon): Explore signed out every launch, no first-run gates, no cookies
bun run doctor     # inspect checkout readiness and selected dev paths/ports
```

### Fresh checkout / worktree bootstrap

```bash
bun run bootstrap   # after any fresh clone or worktree; per-checkout ports and ELECTRON_USER_DATA let checkouts run in parallel
bun run repair      # non-destructive fix for missing or stale dependencies, Electron payloads, Playwright browsers, embedded ffmpeg/ffprobe
```

### Test runner

Use `bun run test` (vitest), **not** `bun test` (Bun's built-in runner ignores vitest config and per-file `// @vitest-environment` directives). For a single file: `bunx vp test run --project node <path>` or `--project jsdom <path>` from repo root. Test files import from `vite-plus/test`, not `vitest`.

When adding idempotent IPC registration (`ipcMain.removeHandler()`, `autoUpdater.removeAllListeners()`), add the method as `vi.fn()` to the matching `vi.mock('electron')` / `vi.mock('electron-updater')` blocks — otherwise tests fail at module-load with `TypeError: X is not a function`.

### Run Electron E2E without stealing focus

Electron E2E launches a real app window, which steals focus and interrupts whoever is at the keyboard. **Always set `ARROXY_E2E_HEADLESS=1`** when running these locally on macOS or Windows — for the whole suite or one spec (Linux runs under `xvfb-run` instead: a hidden window there draws no frames):

```bash
ARROXY_E2E_HEADLESS=1 bunx playwright test --config playwright.config.ts --workers=1
ARROXY_E2E_HEADLESS=1 bunx playwright test tests/e2e/fixture-workflows.spec.ts --config playwright.config.ts --workers=1 -g "<test name>"
```

Any new spec that launches the app must set `ARROXY_E2E=1` or `MOCK_BACKEND=1`, or the flag is ignored and its window shows. Rebuild first (`bun run build`): the suites launch `out/main/index.js`, not the dev server, and refuse a stale build. Never hide the build's output; it stops on any type error and leaves the old bundle in place. How the flag works and which specs skip under it: [`dev-docs/fixture-e2e.md`](dev-docs/fixture-e2e.md#running-headless).

## Arroxy Testing Architecture

Arroxy is an Electron desktop app: do not let React/component testing habits replace product workflow validation. A bug found through real user actions (paste, metadata loading, wizard navigation, queue controls, pause/resume/cancel, file output) must be verified through the layer that can exercise those actions in the real app: **Fixture Product E2E** (`ARROXY_E2E=1`) is the acceptance owner for real user workflows. Pure rules go to fast logic tests, visual states to the Scenario Workbench, boot/preload to Mock Electron smoke tests, and live YouTube only ever to a tiny drift smoke test, never the acceptance gate.

The layer-ownership table, how to choose a layer, and how to design a scenario (risk groups, milestones, oracles, anti-patterns) are in [`dev-docs/fixture-e2e.md`](dev-docs/fixture-e2e.md). Read it before adding or reshaping a test.

## Visual Debugging

For renderer-only visual work, start the browser-mock renderer through the project wrapper and read its URL from `doctor`:

```bash
bun run dev:mock
bun run doctor
```

`?scenario=<id>` opens any Scenario Workbench state (ids in `src/renderer/src/dev/browserMockScenarios.ts`) and `?kit` the UI kit; browser-mock never stands in for the real preload bridge. In the Claude desktop app, check it with the built-in browser; other agents, and attaching to the real Electron app, use `agent-browser`; Playwright only for traces, tests, or `_electron.launch()`.

Electron-specific behavior (real preload, IPC, GPU) needs the real app: `REMOTE_DEBUGGING_PORT=9333 bun run dev`, then attach over CDP. Backdrop or WebGL problems in Electron: run `bun run gpu:probe` before touching backdrop code. Port pinning, CDP attach, which browser to use and its recipes, locale simulation, and the GPU/backdrop fallback model are in [`dev-docs/visual-debugging.md`](dev-docs/visual-debugging.md).

## shadcn/ui Configuration

shadcn/ui (`base-nova`, config in `components.json`) is the primary source for renderer UI primitives. Reuse an installed component or install one with `bunx shadcn@latest add <component>` before inventing controls, panels, form layouts, option groups, empty states, callouts or badges; prefer composing primitives (`Field`, `InputGroup`, `ButtonGroup`, `ToggleGroup`, `Card`, `Alert`, `Empty`, `Separator`, `Badge`) over raw styled markup. Custom primitives only when shadcn has no fit or the component encodes Arroxy-specific behavior.

- **Do not add Radix** (`@radix-ui/*`) or assume it is available; never hand-roll `@base-ui/react/*` wrappers.
- **One-off styling is ratcheted** by `tests/unit/ui-consistency-ratchet.test.ts`: counts may only go down. Use a primitive variant or token instead of an arbitrary value.
- **Segmented controls own their layout**: never style a `ToggleGroupItem` at the call site; use `shape="chip"` plus `flex-wrap` for short tokens, and `wrap-anywhere`, not `break-words`.
- Review primitive changes in the UI Kit (`bun run dev:mock`, then `/?kit`).

The token list, ratchet baseline command, toggle rules and translation-width tests are in [`DESIGN.md`](DESIGN.md) §7.

## Brand / Visual

**Font:** Poppins (`@fontsource/poppins`, weights 400/500/600/700); don't reintroduce Outfit or Geist. Use tokens and variants from `src/renderer/src/styles.css`, never arbitrary values: one primary action per view is `<Button variant="glow">`, selected surfaces `bg-primary/12`, muted labels `text-subtle-foreground`, small type `text-caption`, back/secondary buttons `variant="outline"` (see `DESIGN.md`).

Breakpoints are Tailwind v4's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536), no overrides. The Electron window's minimum is 720×760 and default 1024×860 (`WINDOW_*` in `src/shared/constants.ts`), so `<640px` is browser-mock/test coverage only.

## Subtitle Pipeline

Subtitles are a soft second phase (ADR 0002): phase 1 downloads media with `--no-write-subs --no-write-auto-subs`; phase 2 runs only if phase 1 exits 0 and languages were picked. A phase-2 failure emits `subtitlesFailed` and still finalizes as `completed`. Embed mode also uses phase 2, then muxes with ffmpeg and passes `--merge-output-format mkv`; sidecar and subfolder modes pass no container flag. `sanitizeSubtitleMap` (`ProbeService.ts`) keeps only `-orig` automatic captions for sites whose `autoCaptionRequiresOrigSuffix` is set (YouTube); see memory `youtube-auto-caption-orig-tracks`.

## In-App Update Notifications

The user starts every update (auto-download is off), and every install channel must hear of a release. Check timing, per-channel actions (`resolveAction`) and the Linux AppImage gate: [`dev-docs/in-app-updates.md`](dev-docs/in-app-updates.md).

## Release Pipeline

Pushing an annotated `v*` tag publishes to GitHub Releases, Scoop, Homebrew Cask, Winget and Arroxy's own Flatpak repo in one go; a `-beta.N` suffix makes a pre-release that skips the package managers and never auto-updates installed copies. Releases are stable and cut straight from `main`, the only long-lived branch; a beta is never a step before a stable release.

- **A release** is the translation sync PR, then a `release: X` commit (version bump plus `bun run changelog:assemble`), then `bun run release:stable`, which tags that commit, not `main`'s HEAD, once its required checks pass and every locale in it is translated.
- **Tags go through the wrapper**, which makes them annotated and pushes each one alone; a hand-pushed tag can silently fail to start the pipeline.
- **`CHANGELOG.md` is the release-notes source.** Never edit GitHub release notes in the web UI or with `gh release edit`; `publish-release` overwrites them. Fix the changelog and re-run that job.
- **PRs write changelog fragments, never `CHANGELOG.md`.** A user-facing PR adds one `changelog.d/<slug>.<kind>.md` ([`changelog.d/README.md`](changelog.d/README.md)), so open PRs never conflict over the changelog; only the `release: X` commit adds a section, and `bun run check` rejects any other. Editing a section already released stays allowed.

Checklist, the optional beta path and manual fallback: [`dev-docs/release-runbook.md`](dev-docs/release-runbook.md). Job graph, secrets, Winget, external repos and shipped assets: [`dev-docs/release-pipeline.md`](dev-docs/release-pipeline.md). Keep third-party actions that receive a token pinned to a full commit SHA, and never rotate the Flatpak signing key casually ([`dev-docs/flatpak-repo.md`](dev-docs/flatpak-repo.md)).

## Binary distribution strategy

Release builds bundle no third-party binaries: yt-dlp is fetched and updated at runtime (ADR 0003), and ffmpeg/ffprobe come from an approved **FFmpeg package** installed once per machine (ADR 0010).

- **FFmpeg pin changes ship without an app release.** Versions change only through `FfmpegPackagePins.ts`, and the daily manifest is generated from `main`, so a merged pin change reaches every user within a day: review it as a release, and bump only as the [version policy](dev-docs/ffmpeg-packages.md#version-policy) allows.
- **`ELECTRON_RUN_AS_NODE=1` goes only into the yt-dlp child environment**, never `process.env` or persisted config. Keep the `runAsNode` fuse: the packaged Electron is yt-dlp's Node runtime.

Strategy, dev binaries and licensing: [`dev-docs/binary-distribution.md`](dev-docs/binary-distribution.md); packages, approval, publishing and the v1/v2 manifests: [`dev-docs/ffmpeg-packages.md`](dev-docs/ffmpeg-packages.md), [`dev-docs/runtime-binaries.md`](dev-docs/runtime-binaries.md).

## Updating Public-Facing Content (READMEs)

`README.md` and every `docs/readme/README.{lang}.md` are **generated** from `readme-src/` by `node readme-src/build.mjs`: never edit them, or their `Last updated:` stamp, directly. A PR adds new strings to `en.mjs` only: a missing key renders the English string, and the release sync translates it (`--strict`, in `check:i18n:complete`, fails on key-parity drift). The locale list or count is never hardcoded anywhere. Site copy lives in the `arroxy-site` repo. Adding a feature line, the canonical locale lists, and regenerating screenshots: [`dev-docs/readme-pipeline.md`](dev-docs/readme-pipeline.md).
