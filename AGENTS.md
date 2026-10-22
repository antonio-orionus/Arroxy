# Arroxy

Arroxy's coding standards, commands and gotchas, for anyone working in this repository — human or agent.

## Engineering Principles

- **Type safety throughout.** Strict types, exhaustive checks, discriminated unions. Never `any` in production code: use `unknown` and narrow it.
- **Validate at trust transitions.** Data from IPC, persistence, external processes, the network, environment/config, browser evaluation and untyped framework APIs enters as `unknown` when its shape is not guaranteed; an owned parser turns it into a named trusted type before domain logic sees it. Prefer schemas, type guards and discriminated unions over assertions; a necessary assertion rests on a visible check or documented invariant. Narrowing typed unions, optionals, capabilities and errors stays fine.
- **Clean architecture.** Dependencies point inward; business logic stays free of frameworks and I/O. The renderer doesn't know how main fetches; main doesn't know which component renders.
- **Mature libraries over bespoke code** for validation, HTTP, ORM, auth, logging and similar plumbing.
- **[`GLOSSARY.md`](./GLOSSARY.md) is the single source of terminology.** Use its terms exactly; add entries when extracting modules instead of parallel vocabularies.
- **ADRs** (`docs/adr/NNNN-slug.md`) only for a decision that is hard to reverse, surprising without context, and a real trade-off. Keep them short.

## Monorepo

`src/` is the Electron app. `packages/*` are consumed via `workspace:*`, never cloned separately: `yt-dlp-bridge` and `ytdlp-errors` are published to npmjs.com **from this repo**; `arroxy-control` and `arroxy-mcp` are private, in-repo only. After touching one, run its gate (`bun run errors:check`, `bridge:check`, `control:check`, `mcp:check`). Each published one publishes on its own `<pkg>-v*` tag, never with the app or a push to `main`, so keep a package change off the critical path of an app fix that doesn't need it. Only the `release(packages): <pkg> <version>` PR writes a package's changelog.

Sibling repos (site, runtime binaries, private notes, package-manager manifests) consume what this hub builds and hold no app code: [`dev-docs/README.md`](dev-docs/README.md#related-repositories).

## Working Conventions

**No backward compatibility.** Restructure freely; delete old types, components and state fields without aliases, re-exports, shims or deprecation notices. Exception: data on users' machines (settings, saved queue, profiles) is migrated on load when its shape changes.

**`schemas.ts` is the SSOT for enums:** `z.enum([...])` → `type Foo = z.infer<…>` → `const FOOS = fooSchema.options`, never a redeclared union. `QUEUE_STATUS` / `STATUS_KEY` live there; `DEFAULTS` in `constants.ts`.

**Release flags, not long-lived branches.** Work for a later release merges to `main` behind a flag in `src/shared/releaseFlags.ts` (`isReleaseFlagOn`): on in dev, the Scenario Workbench and tests, off in release builds. It gates only entry points (menus, buttons, routes, IPC exposure), never logic. [`dev-docs/release-flags.md`](dev-docs/release-flags.md).

**TDD for non-trivial changes;** skip only for typos and one-line edits.

**`bunx`, never `npx`,** even when a skill says `npx`: the root `overrides` make `npx` fail here with `EOVERRIDE`.

**Translation workflow.** A fix or feature PR changes English only: `en.json` (keys sorted, one per line) and `readme-src/locales/en.mjs`, never `i18n/**` or another locale. Keep a key when its meaning stays; a new meaning or placeholder gets a new key. One sync PR translates the rest as a release's first step (ADR 0017), with the `translate-arroxy-i18n` skill, which also owns catalog changes and i18n audits.

**One concern per PR.** Each PR makes one reviewable change and passes `bun run check` alone, so every review reads a single idea.

- **Split along seams:** a `packages/*` change apart from the app change using it; a behaviour-free refactor or rename before the feature needing it; mechanical churn (formatting, licence headers, dependency bumps, locale sync, regenerated files) apart from logic; independent features as separate PRs.
- **Same-kind mechanical changes may share a PR** when each is a few lines and none changes behaviour (several `ci:` or tooling tweaks): light review, and no behaviour change rides along. Why: on 2026-10-21, 36 of 172 PRs were under 50 lines, each paying a full CI and review cycle.
- **Tests stay with their code;** never split by layer.
- **Keep one PR** when the pieces cannot each be green alone, and say why in its body.
- **Don't stack PRs:** branch every PR from `main`. If one piece needs an unmerged other, put both in one PR with a commit each, or start the second after the first merges; nothing wakes anyone when a stack's base merges, and each merge forces the next to rerun CI and re-enable auto-merge.
- **The `pr-policy` check enforces these rules;** a genuine exception adds an opt-out line to the PR body (e.g. `No changelog: <reason>`), keys in `CONTRIBUTING.md` ("PR policy").

## Agent setup

- **Read `.agents/memory/MEMORY.md` before working;** save lessons by the routing in [`dev-docs/agent-setup.md`](dev-docs/agent-setup.md#memory), never in a tool's own memory.
- **`.internal/`** (gitignored link to the private `arroxy-internal` repo, when you have access): read its `README.md`; edits ship with `bun run internal:save`, never in a PR, and tracked files never link into it.
- **Issues** are public GitHub issues: what gets one and how, in [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md); kind and state labels, mapped to the `triage` skill's roles, in [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).
- **Agent config** is edited only in `AGENTS.md`, `GLOSSARY.md`, `.agents/` and `skills-lock.json`, then `bun run agents:sync`. Third-party skills come through the Skills CLI, never committed; tracked files never depend on a harness plugin. [`dev-docs/agent-setup.md`](dev-docs/agent-setup.md).

## Commands and checks

- **After any implementation task, run `bun run check`** and fix every error your change caused before reporting done; one file can break types, dead code or import cycles elsewhere. While iterating: `bunx vp check --fix` (~5 s).
- **Vite+ (`vp`)** owns format, lint, tests, packaging, hooks and `check`; electron-vite owns Electron dev and build. Read `node_modules/vite-plus/docs` rather than guessing flags; contract and banned tools in [`dev-docs/tooling-contract.md`](dev-docs/tooling-contract.md).
- **`bun run bootstrap` after any fresh clone or worktree;** `bun run doctor` shows readiness and dev URLs.
- **`bun run test`, never `bun test`** (Bun's runner ignores the Vitest config). Single file, imports, mock gotchas: [tooling-contract.md#tests](dev-docs/tooling-contract.md#tests).
- **Electron E2E opens a focus-stealing window:** on macOS and Windows always set `ARROXY_E2E_HEADLESS=1` (Linux uses `xvfb-run`), after `bun run build`, since suites launch `out/main/index.js`: `ARROXY_E2E_HEADLESS=1 bunx playwright test [spec] --config playwright.config.ts --workers=1`. [fixture-e2e.md#running-headless](dev-docs/fixture-e2e.md#running-headless).

## Testing architecture

A bug found through real user actions (paste, metadata, wizard, queue controls, pause/resume/cancel, file output) is verified through **Fixture Product E2E** (`ARROXY_E2E=1`), the acceptance owner for user workflows; component tests never stand in for it. Pure rules go to fast logic tests, visual states to the Scenario Workbench, boot/preload to Mock Electron smoke tests, live YouTube only to a tiny drift smoke. Read [`dev-docs/fixture-e2e.md`](dev-docs/fixture-e2e.md) before adding or reshaping a test.

## Visual debugging

Renderer-only: `bun run dev:mock`, URL from `bun run doctor`, `?scenario=<id>` for a Scenario Workbench state, `?kit` for the UI kit. Electron-specific behaviour (preload, IPC, GPU) needs the real app over CDP; backdrop or WebGL problems: `bun run gpu:probe` before touching backdrop code. Which browser, recipes, ports, locales: [`dev-docs/visual-debugging.md`](dev-docs/visual-debugging.md).

## UI

- **shadcn/ui (`base-nova`) first:** reuse or add a component (`bunx shadcn@latest add <name>`) and compose primitives (`Field`, `ToggleGroup`, `Card`, `Alert`, `Empty`, `Badge`…) before raw styled markup; custom primitives only when nothing fits or the behaviour is Arroxy-specific.
- **Never add Radix** (`@radix-ui/*`) or hand-roll `@base-ui/react/*` wrappers.
- **Tokens and variants, never arbitrary values** (a ratchet test lets one-off counts only fall). One primary action per view is `<Button variant="glow">`, secondary actions `variant="outline"`, font Poppins only. Tokens, toggles, breakpoints: [`DESIGN.md`](DESIGN.md) §7.

## Subtitle pipeline

A soft second phase (ADR 0002): phase 1 downloads media with `--no-write-subs --no-write-auto-subs`; phase 2 runs only if phase 1 exits 0 and languages were picked. A phase-2 failure emits `subtitlesFailed` and still finalizes `completed`. Embed mode muxes in phase 2 and passes `--merge-output-format mkv`; sidecar and subfolder pass no container flag. YouTube keeps only `-orig` auto captions (`sanitizeSubtitleMap`, memory `youtube-auto-caption-orig-tracks`).

## In-app updates

The user starts every update (no auto-download), and every install channel must hear of a release: [`dev-docs/in-app-updates.md`](dev-docs/in-app-updates.md).

## Releases

An annotated `v*` tag publishes to GitHub Releases, Scoop, Homebrew, Winget and the Flatpak repo; `-beta.N` is a pre-release that skips package managers and never auto-updates users. Releases are stable, cut from `main` (the only long-lived branch); a beta is never a step before a stable release.

- **A release** is the translation sync PR, then a `release: X` commit (version bump plus `bun run changelog:assemble`), then `bun run release:stable`, which tags that commit, not `main`'s HEAD, once its checks pass and every locale is translated.
- **Tag only through the wrapper:** a hand-pushed tag can silently fail to start the pipeline.
- **`CHANGELOG.md` is the release-notes source;** `publish-release` overwrites GitHub's notes, so fix the changelog and re-run that job.
- **PRs add a `changelog.d/` fragment, never edit `CHANGELOG.md`** ([`changelog.d/README.md`](changelog.d/README.md)); only the `release: X` commit adds a section.

Checklist and beta path: [`dev-docs/release-runbook.md`](dev-docs/release-runbook.md); jobs, secrets, action pinning, Flatpak key: [`dev-docs/release-pipeline.md`](dev-docs/release-pipeline.md).

## Binary distribution

Release builds bundle no third-party binaries: yt-dlp is fetched and updated at runtime (ADR 0003), ffmpeg/ffprobe come from an approved **FFmpeg package** installed once per machine (ADR 0010). [`dev-docs/binary-distribution.md`](dev-docs/binary-distribution.md).

- **FFmpeg pin changes ship without an app release:** the daily manifest is built from `main`, so a merged `FfmpegPackagePins.ts` change reaches every user within a day. Review it as a release; bump only per the [version policy](dev-docs/ffmpeg-packages.md#version-policy).
- **`ELECTRON_RUN_AS_NODE=1` goes only into the yt-dlp child environment,** never `process.env` or persisted config; keep the `runAsNode` fuse (packaged Electron is yt-dlp's Node runtime).

## READMEs

`README.md` and `docs/readme/README.{lang}.md` are generated from `readme-src/`: never edit them or their `Last updated:` stamp. A PR adds strings to `en.mjs` only and never hardcodes the locale list or count; site copy lives in `arroxy-site`. [`dev-docs/readme-pipeline.md`](dev-docs/readme-pipeline.md).
