# General

## Engineering Principles

The defaults below apply to every change in this codebase.

- **Type safety throughout.** Favor strict typing, exhaustive checks, and discriminated unions. `any` and `unknown` are escape hatches, not load-bearing tools — if you reach for one, justify it.
- **Clean architecture.** Keep concerns separated, dependencies pointing inward, business logic decoupled from frameworks and I/O. The renderer shouldn't know how the main process fetches; the main process shouldn't know which component renders.
- **Prefer mature libraries over bespoke code.** For validation, HTTP, ORM, auth, logging, and similar plumbing, reach for the production-proven, widely-adopted package before writing your own. If a mature library solves the problem, use it.
- **Push back when something looks wrong.** Don't defer to the user reflexively. If a proposal looks incorrect, incomplete, or inconsistent with the codebase, name the specific reason rather than agreeing. Agreement-by-default is a failure mode.
- **Verify before you act on uncertainty.** When you're not confident about a fact, an API surface, a library's behavior, or how a piece of this codebase works, check it — read the source, check the docs, run a quick test. Assumed knowledge is the most common source of bugs.
- **Reuse the domain glossary** in `CONTEXT.md` — the canonical naming reference for the architecture. Use those terms exactly when extending or refactoring; add new entries when extracting modules instead of letting parallel vocabularies sprout.
- Don’t fight errors! Whenever you encounter the same error 3 times, research the web (and github using gh api) and find 3-5 possible ways to fix it. Then choose the most efficient solution and implement it or stop to notify user that there is no clean fix at this point.

---

## Domain Glossary

Use the canonical glossary in [`CONTEXT.md`](./CONTEXT.md).

The glossary is the single source of terminology for this repo. Keep it implementation-free (no module names, file paths, or migration notes) and update it when vocabulary decisions change. This prevents ambiguous PR reviews and keeps architecture and UX aligned.

### What is an ADR?

An ADR (Architecture Decision Record) is a short, high-signal note for a design decision that is:

- hard to reverse,
- surprising without context,
- and chosen through a real trade-off.

Use `docs/adr/0001-slug.md` style files for those decisions. Keep them concise.

### ADR creation rules

- Create [`docs/adr/`](./docs/adr/) only when the first ADR is needed.
- Use sequential file names: `0001-...`, `0002-...`, and so on.
- Skip ADRs for reversible or obvious implementation choices.

---

## Working Conventions

**No backward compatibility** — Do not prioritize migration paths, backward compatibility shims, or preserving existing implementations. Existing code can be discarded or restructured without ceremony. Skip any "keep for compat" hedging. Delete old types, old components, old state fields without re-exporting or aliasing. Refactor aggressively. No deprecation notices or transitional layers.

**schemas.ts is SSOT for all enum types.** Pattern: `z.enum([...])` → `type Foo = z.infer<…>` → `const FOOS = fooSchema.options`. Don't redeclare as TS union literals. `QUEUE_STATUS` / `STATUS_KEY` live in `schemas.ts` (not `constants.ts`). `DEFAULTS` lives in `constants.ts`.

**TDD for non-trivial changes.** Write failing tests first, implement minimally, then refactor. Skip only for typo fixes and single-line edits.

**Translation workflow.** Use the `translate-arroxy-i18n` project skill for app locale changes, PO/POT sync, generated locale JSON, and i18n audits.

**Session scope.** Treat every agent session as scoped to the task context it was given. Other agents may be working in parallel on the same branch, so do not repair, reformat, revert, or restructure files outside your current scope just because you notice a problem there.

### Agent Skills

- **translate-arroxy-i18n** — manages app locale updates, gettext PO/POT sync, runtime locale JSON generation, and i18n audit commands. Entry point: `.agents/skills/translate-arroxy-i18n/SKILL.md`.

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

---

## Post-Task Checks

After completing any implementation task, run this single command and fix all errors caused by your change before reporting done:

```bash
bun run check   # format + lint + tooling contract + typecheck + knip + madge + package gates
```

Do not skip. A change in one file can break types, introduce dead code, or create circular imports elsewhere.

If `bun run check`, lint, typecheck, or tests report an unexpected failure that is not clearly attributable to your current task, do not try to fix it opportunistically. Capture the relevant failure, state that it appears outside the current session scope, and leave it alone so a parallel agent's in-progress work is not disrupted. Only touch unrelated files when the user explicitly expands the scope or when you can show the failure is a direct consequence of your edits.

### On-demand hygiene checks

```bash
bun run madge           # circular imports — exit 1 if any found
bun run knip:test-only  # src/ files imported only from tests/ — potential dead production code
```

Run `madge` after any refactor that moves modules or changes import boundaries. Run `knip:test-only` when reviewing whether a helper belongs in `src/` or `tests/`.

The root-owned tooling contract lives in `dev-docs/tooling-contract.md`. Do not add package-local formatter/linter configs. Publishable package runtime `workspace:*` dependencies are allowed only for local workspace packages and must pass packed metadata verification.

### Dev workflow

```bash
bun run dev        # normal dev start
bun run dev:fresh  # clear main.log then start (cross-platform)
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

Use `bun run test` (vitest), **not** `bun test` (Bun's built-in runner ignores vitest config and per-file `// @vitest-environment` directives). For a single file: `bunx vitest run --project node <path>` or `--project jsdom <path>` from repo root.

When adding idempotent IPC registration (`ipcMain.removeHandler()`, `autoUpdater.removeAllListeners()`), add the method as `vi.fn()` to the matching `vi.mock('electron')` / `vi.mock('electron-updater')` blocks — otherwise tests fail at module-load with `TypeError: X is not a function`.

---

## Arroxy Testing Architecture

Arroxy is an Electron desktop app. Do not let React/component testing habits replace product workflow validation. A bug found through real user actions such as paste, metadata loading, wizard navigation, queue controls, pause/resume/cancel, or file output must be verified through the layer that can exercise those actions in the real app.

Fixture Product E2E is the **acceptance owner for real user workflows**, not the default test type for every behavior. Keep it to a small number of strong scenarios per risk group. Local rules, rendering states, process-supervision failures, and startup/security checks still belong in their cheaper owning layers.

### Test layer ownership

- **Fast logic tests** (`tests/unit`, Vitest): use for pure rules and closed interfaces such as `QueueEvent` transition, `ProgressNormalizer`, URL parsing, yt-dlp argument construction, extractor classification, error classification, and `WizardStepGraph`. These tests should not pretend to prove a full user workflow.
- **Renderer tests** (`tests/renderer`, jsdom): use for renderer-local state and component contracts when the behavior is too small to justify a full app launch. Do not use these as acceptance tests for download, probe, queue, or filesystem workflows.
- **Scenario Workbench** (`tests/browser`, `bun run dev:mock`): use browser-mock and the scenario gallery for visual inspection, layout stress, screenshots, and fast review of many UI states. This proves how a state looks, not whether the real product workflow works.
- **Mock Electron smoke tests** (`tests/e2e` with `MOCK_BACKEND=1`): use for app shell, preload bridge, context isolation, startup resilience, and mocked persistence checks. Do not use this layer for normal download acceptance.
- **Fixture Product E2E** (`ARROXY_E2E=1`): use as the acceptance layer for real product workflows that require real Electron, real IPC, real yt-dlp, filesystem output, or realistic user interaction. This layer runs real Electron, real IPC, real `ProbeService`, real `DownloadService`, real `QueueService`, real filesystem effects, and real spawned yt-dlp, while only the video platform is deterministic through the fixture extractor plugin, local media server, and deny proxy.
- **Cold-start packaged E2E**: use for packaged binary/warmup behavior, managed binary downloads, and production bootstrapping. Keep it narrow because it is slow.
- **Live smoke tests**: use only to detect real YouTube/yt-dlp drift. They are external, flaky by nature, and must not be the acceptance gate for Arroxy product workflow correctness.

### Choosing the right test

- If the issue was discovered by manually opening the app and performing a workflow, prefer Fixture Product E2E.
- If the behavior is a pure domain rule with no UI, filesystem, process, or IPC requirement, use a fast logic test.
- If the concern is visual layout, responsive fit, empty/loading/error surfaces, or screenshot review, use the Scenario Workbench.
- If the concern is app boot, preload, or context isolation, use Mock Electron smoke tests.
- If the concern is whether real YouTube currently works, use a tiny live smoke test outside normal acceptance.

### Scenario design

Do not create one giant "everything" E2E scenario. Group product E2E by risk case so failures are local and useful:

- **Bulk input**: real clipboard paste, messy lists, invalid lines, duplicates, large lists.
- **Metadata fetching**: concurrency limits, slow probes, partial failure, late thumbnails/subtitles, user navigation while probes are still running.
- **Wizard navigation**: back/next while state is incomplete, skipped steps, preserved output/format choices.
- **Queue controls**: active downloads, priority, pause item, resume item, cancel item, pause all, resume all.
- **Failure and recovery**: failed metadata, failed media, subtitle soft failure, retry, cancel during slow stream.
- **Persistence and restart**: pending queue, paused active item, restored output folder, completed/cancelled lifecycle after app restart.
- **Scale and UX stress**: many URLs, long titles, drawer scrolling, progress churn, layout stability.

For each risk group, add Fixture Product E2E only for behavior that needs real app wiring or realistic user interaction. Keep pure rules and local UI states in lower layers. Each Fixture Product E2E scenario should declare:

1. The user-facing risk being tested.
2. The fixture videos, delays, failures, and output directory.
3. The real user actions, preferably via mouse, keyboard, and OS clipboard.
4. The milestones that prove each workflow phase completed.
5. The final oracles: visible UI state, E2E diagnostics when needed, filesystem outputs, and deny-proxy request log.

### Workflow feedback rules

- Prefer visible UI milestones first: title appears, row count changes, progress/status changes, buttons enable/disable, queue card reaches the expected state.
- Use E2E-only diagnostics only when visible UI is insufficient. Gate diagnostics behind `ARROXY_E2E=1`; never expose them in normal packaged production.
- Use filesystem assertions for download outcomes. A completed queue item is not enough if the expected output file is missing or implausible.
- Use the deny proxy request log as an oracle. Deterministic fixture tests must fail if yt-dlp reaches non-local network.
- Avoid hardcoded sleeps. Wait for specific UI, diagnostic, process, filesystem, or network milestones.
- Capture screenshots/traces for complex scenario failures so an agent can inspect what a human would have seen.

### Anti-patterns

- Do not add unit tests to claim a real paste -> metadata -> queue -> download workflow is fixed.
- Do not duplicate the same acceptance behavior in unit, jsdom, browser-mock, and fixture E2E layers.
- Do not treat browser-mock as proof that real IPC, yt-dlp, queue scheduling, or filesystem behavior works.
- Do not use fake yt-dlp as the normal download acceptance strategy. Keep fake yt-dlp only for process-supervision failures such as spawn failure, permission denied, crash, invalid JSON, huge stderr, hang, and signal termination.
- Do not make one super scenario that covers every risk at once. Prefer grouped, realistic scenarios with clear ownership.

---

## Visual Debugging with agent-browser

Prefer `agent-browser` for browser automation, screenshots, responsive layout checks, and interactive UI dogfooding. Use Playwright only when `agent-browser` is unavailable or when the task specifically needs Playwright traces/tests or Electron `_electron.launch()`.

For renderer-only visual iteration, **use the project wrapper first**:

```bash
bun run dev:mock
bun run doctor
```

This starts the Vite renderer in `browser-mock` mode with the repo-owned defaults. `bun run doctor` reports the computed renderer URL. Full Electron automation is slower and should be reserved for Electron-specific behavior.

If browser automation needs a fixed URL, pin the port through the wrapper instead of bypassing it:

```bash
# POSIX shells
ARROXY_RENDERER_PORT=5173 bun run dev:mock

# PowerShell
$env:ARROXY_RENDERER_PORT = "5173"; bun run dev:mock
```

The renderer's `browserMock.ts` stubs `window.appApi` with simulated downloads, formats, settings when Vite runs in explicit `browser-mock` mode — no Electron needed. Electron dev and packaged builds must use the real preload bridge.

### agent-browser workflow

1. `agent-browser skills get core` before the first browser task in a session.
2. `agent-browser --session arroxy-ui --args "--no-sandbox" open http://127.0.0.1:<doctor-port>/` when Chromium sandboxing fails in the dev VM.
3. `agent-browser --session arroxy-ui set viewport 1190 768` to check breakpoint behavior.
4. `agent-browser --session arroxy-ui snapshot -i` for interactive refs.
5. `agent-browser --session arroxy-ui screenshot output/playwright/<name>.png` for review artifacts.
6. `agent-browser --session arroxy-ui console` / `agent-browser --session arroxy-ui errors` for runtime issues.
7. `agent-browser --session arroxy-ui close` after the visual pass.

### Playwright fallback

1. `browser_navigate` → the `http://127.0.0.1:<doctor-port>` URL from `bun run doctor`, then `browser_take_screenshot`.
2. Zoom for pixel inspection via `browser_evaluate`:
   ```js
   () => {
     const el = document.querySelector('.your-class');
     el.style.transform = 'scale(3)';
     el.style.transformOrigin = 'left center';
     el.style.zIndex = '999';
   };
   // screenshot, then reset: el.style.transform = ''
   ```
3. Computed styles: `window.getComputedStyle(el).paddingLeft` etc.
4. Bounding rect: `el.getBoundingClientRect()`.
5. Interaction: `browser_click`, `browser_fill_form`, `browser_type`.
6. Console errors: inspect log file from `browser_navigate` result.

### Simulating locale / region

The pre-created MCP context always reports `navigator.languages = ['en-US', 'en']`. To test locale-driven behavior (e.g. auto-redirects), spin a fresh context via `browser_run_code_unsafe`:

```js
async (page) => {
  const context = await page
    .context()
    .browser()
    .newContext({
      locale: 'hi-IN',
      timezoneId: 'Asia/Kolkata',
      extraHTTPHeaders: { 'Accept-Language': 'hi-IN,hi;q=0.9,en;q=0.5' }
    });
  const p = await context.newPage();
  await p.goto('https://arroxy.orionus.dev/');
  await p.waitForTimeout(1500); // let inline redirect script fire
  const result = { url: p.url(), title: await p.title() };
  await context.close();
  return result;
};
```

### Wizard walkthrough via mock

- Step 1 (URL): any `youtube.com` URL → "Fetch formats →" (1.4s mock delay)
- Step 2 (Format): auto-loads mock formats with filesizes
- Step 3 (Save): radio picker; "Custom…" returns a random mock path
- Step 4 (Confirm): "Pull it! ↓" triggers simulated download
- Drawer: click "Download Queue" header to expand; progress updates every 500ms
- Update banner in `browser-mock` mode is scenario-only. Use `?scenario=update-direct` for the default install flow, or `update-scoop` / `update-homebrew` / `update-winget` / `update-portable` / `update-flatpak` to preview channel-specific UX. Normal scenarios emit no update event.

### Electron GPU / Backdrop debugging

`bun run dev:mock` proves renderer visuals in the browser, **not** Electron GPU behavior. Host Chrome can show the WebGL backdrop while `bun run dev` falls back because Electron runs inside the VM / Electron Chromium stack.

When Electron logs `webgl: disabled_off` and `glImplementationParts: '(gl=none,angle=none)'`, the renderer has no usable GL/ANGLE backend. If `bun run gpu:probe:force` still reports the same values, do not keep tweaking `ignore-gpu-blocklist` — the blocker is VM/driver/sandbox level.

Use the probes before changing backdrop code:

```bash
bun run gpu:probe          # Electron default GPU status
bun run gpu:probe:force    # adds ignore-gpu-blocklist + enable-gpu-rasterization
bun run gpu:probe:swiftshader # forces SwiftShader and checks a real hidden WebGL canvas
bun run profile:backdrop     # browser-side FPS / fallback profiler
bun run profile:backdrop:weak # forced software + 2 reported cores + 4x CPU throttle
```

On the Ubuntu VMware dev VM observed on 2026-06-09, Xorg had VMware DRI2/DRI3 direct rendering enabled, but Electron/Chrome still logged `MESA-LOADER: failed to open dri_gbm.so: Permission denied` and `WebGL1 blocklisted`. `gpu:probe:force` stayed `gl=none`, while `gpu:probe:swiftshader` enabled WebGL through `ANGLE ... SwiftShader`. Use `bun run dev:swiftshader` only for VM visual iteration; it is CPU WebGL and intentionally opt-in via `ARROXY_BACKDROP_SOFTWARE=1`.

Backdrop fallback is adaptive, not screenshot-based: `AppBackdrop` chooses the dark aurora or light ocean scene, then `CanvasSceneHost` probes WebGL on a scratch canvas first, rejects software renderers unless `backdropSoftware=1` / `ARROXY_BACKDROP_SOFTWARE=1` opts in, then draws the selected scene's static Canvas2D fallback at the current viewport size. The component keeps separate WebGL and Canvas2D canvases because once a canvas owns a WebGL context it cannot be reused for Canvas2D. In the no-GPU Electron fallback path, do not redraw Canvas2D during live window resize; stretch the existing bitmap and redraw once after resize settles. Use `backdropDebug=1` or `localStorage.backdropDebug = '1'` to log fallback mode decisions, resize scheduling, draw timing, and backing-store sizes. CSS gradients are only the last fallback when Canvas2D is unavailable.

If testing Electron sandbox as the GPU blocker, the local Electron helper may need setuid before `bun run gpu:probe:sandbox` / `bun run dev:sandbox`:

```bash
sudo chown root:root node_modules/.bun/electron@42.3.0/node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/.bun/electron@42.3.0/node_modules/electron/dist/chrome-sandbox
```

---

## shadcn/ui Configuration

Config (style, aliases, icon library, CSS entry) lives in `components.json`. Runtime deps already present: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

shadcn/ui is the primary source for renderer UI primitives. Before inventing custom controls, panels, form layouts, option groups, empty states, callouts, badges, or grouped inputs, first reuse an installed shadcn component or install the needed component through the shadcn CLI. Prefer composition of shadcn primitives (`Field`, `InputGroup`, `ButtonGroup`, `ToggleGroup`, `Card`, `Alert`, `Empty`, `Separator`, `Badge`, etc.) over raw styled `div`/`button` markup. Custom primitives are acceptable only when shadcn has no fitting component or the component encodes Arroxy-specific product behavior.

**Do not add Radix.** This project does **not** use `@radix-ui/*` — the `base-nova` registry doesn't depend on Radix primitives. Don't add Radix deps or assume Radix is available.

**Install via CLI:** `bunx shadcn@latest add <component>` (style: `base-nova`). Never hand-roll `@base-ui/react/*` wrappers. After install, modify freely to match app style.

---

## Brand / Visual

**Font:** Poppins (`@fontsource/poppins`, weights 400/500/600/700). Don't reintroduce Outfit or Geist.

**CSS tokens** (`src/renderer/src/styles.css`): `--border-strong` (darker border), `--text-subtle` (muted label), dark mode `--border: hsla(0,0%,100%,0.07)`.

**Glow patterns:** primary buttons `shadow-[0_4px_14px_var(--brand-glow)]`, active radio `shadow-[0_0_0_2px_var(--brand-dim)]`, section labels `text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]`, back/ghost buttons `border-[1.5px] border-[var(--border-strong)]`.

## Layout Breakpoints

Arroxy uses Tailwind v4 default mobile-first breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px. There are no custom Tailwind breakpoint overrides.

The real Electron window has min size `720x680` and default size `900x760`, so production normally starts above `sm` and around `md`; `<640px` is mainly browser-mock/test coverage.

---

## Subtitle Pipeline

Two-phase download: (1) video + audio with `--no-write-subs --no-write-auto-subs`; (2) subs only if phase 1 exits 0 and `subtitleLanguages` non-empty (`--skip-download --write-subs --sub-langs <langs>`). Phase 2 failure is **soft** — emit `subtitlesFailed`, finalize as `completed`; video is kept. Embed mode still uses phase 2: `SidecarSubsPhase(true)` fetches subtitles, then muxes them into the saved video with ffmpeg.

`FormatProbeService.sanitizeSubtitleMap()` filters `automatic_captions` to `-orig` keys only (actual cached auto-captions). Without this, hundreds of live-translation-request keys appear and hit rate limits.

Container format is NOT a subtitle concern: `subtitleMode === 'embed'` passes `--merge-output-format mkv`; sidecar/subfolder pass nothing.

---

## In-App Update Notifications

`electron-updater` v6, GitHub provider. Auto-download is **disabled** — user initiates everything. Main calls `autoUpdater.checkForUpdates()` 5s after launch and emits `updater:available` to the renderer with `{ version, currentVersion, installChannel }`. Per-platform `installChannel` detection (flatpak/scoop/homebrew/portable/direct) lives in `src/main/installChannel.ts`. Subtlety: `direct` intentionally absorbs Winget — at runtime indistinguishable from a direct NSIS install, NSIS auto-update works either way.

Renderer shows `<UpdateBanner>` between title bar and content area; `resolveAction(channel, platform)` picks the UX:

- `scoop` → copy-command for `scoop update arroxy`
- `homebrew` → copy-command for `brew upgrade --cask arroxy`
- `portable` → "Download ↗" link to https://arroxy.orionus.dev/ (NSIS auto-update can't run from a %TEMP% extract)
- `direct` on darwin → "Download ↗" link to https://arroxy.orionus.dev/ (DMG is unsigned, can't self-update)
- `direct` on win/linux (and `winget`) → "Install & Restart" button → invokes `updater:install` → main calls `downloadUpdate()` → on `update-downloaded` calls `quitAndInstall(false, true)`

### Known gap: Linux tar.gz never sees the banner

On Linux, electron-updater's default updater is `AppImageUpdater` (no `package-type` file shipped — we only build AppImage + tar.gz). `AppImageUpdater.isUpdaterActive()` returns `false` when `process.env.APPIMAGE` is unset, which silently short-circuits `AppUpdater.checkForUpdates()` (returns `null`, logs `"APPIMAGE env is not defined, current application is not an AppImage"`, never emits `update-available`). So tar.gz Linux users get **no update banner at all** — not an error, just silence. Verified in `node_modules/electron-updater/out/AppImageUpdater.js:17-28` and `AppUpdater.js:253-256`.

**Decision: do not fix.** Audience is small (most Linux users get AppImage or Flatpak). Fixing would require bypassing electron-updater for this case and hitting `https://api.github.com/repos/antonio-orionus/Arroxy/releases/latest` directly to drive our own `updater:available` IPC.

### IPC + types

IPC channel names live in `IPC_CHANNELS` (`@shared/ipc`); payload types (`InstallChannel`, `UpdateAvailablePayload`) live in `@shared/types`. `resolveAction` is the pure helper at `src/renderer/src/components/updateBannerAction.ts` — extracted from `UpdateBanner.tsx` so the component file only exports a component (react-refresh requirement). Renderer `browser-mock` mode at `src/renderer/src/browserMock.ts` simulates an `updater:available` event only for explicit update scenarios.

---

## Release Pipeline

Pushing a `v*` tag publishes to **four channels in one go**: GitHub Releases, Scoop, Homebrew Cask, Winget. No per-release manual steps.

### Branch + tag conventions

- **`main`** = sole long-lived branch. Both beta (`v*-beta.N`) and stable (`v*`) tags cut from here. Feature work happens on short-lived feature branches merged into `main` when ready.
- **Tags must be annotated** (`git tag -a NAME -m "..."`), not lightweight. `git push --follow-tags` only pushes annotated tags — lightweight tags get silently skipped, the release pipeline never fires. Lesson learned the hard way.

### Pre-release flow (test pipeline w/o auto-updating users)

Tag w/ semver pre-release suffix (e.g. `v0.4.0-beta.1`):

- electron-builder marks the GitHub Release `prerelease: true` automatically (semver `-` suffix triggers it).
- electron-updater queries `/releases/latest` (excludes pre-releases) → existing user installs do **not** auto-update.
- `release.yml` `publish-scoop`/`publish-homebrew` jobs guard `if: !contains(github.ref_name, '-')` so beta tags don't bump public package managers.
- Winget skipped automatically — `release_to_winget.yml` triggers on `released` event which excludes pre-releases by GitHub API design.
- Manually download the artifact from the GitHub Release page to validate.
- When ready: bump to plain semver (`v0.4.0`), tag annotated, push.

**NSIS installer:** pin `electron-builder ≥ 26.9.0` (26.8.x has a `multiUser.nsh:35` buffer over-read on cold-heap). Drop `build/installer.nsh`. Any future custom NSIS `Page custom` callback must open with `${If} ${Silent} \n Abort \n ${EndIf}`. Note: the registry `latest` dist-tag is broken `26.8.1`; pin from `next` channel — `bun update --latest` silently downgrades.

### Release notes — CHANGELOG.md is SSOT

Release notes are hand-written in `CHANGELOG.md` and keyed by version (e.g. `## 0.3.5-beta.1`). The `publish-release` job in `release.yml` extracts the matching section, appends the auto-generated "What's Changed" PR list + Full Changelog link, and posts the combined body as the GitHub Release notes.

**Before tagging a release**, add a new `## <version>` section at the top of `CHANGELOG.md` in the same shape as the previous entry. Tone is friendly user-facing prose grouped by feature (look at `## 0.3.4` as the reference). If no matching section exists, the workflow falls back to pure auto-generated notes and emits a `::warning::` — the release will still publish but the body will only be the PR list.

Do **not** edit GitHub Release notes directly via the web UI or `gh release edit`. The `publish-release` step runs late in the pipeline and will overwrite manual edits made before it. Edit `CHANGELOG.md` instead and push a fix-up commit; re-running `publish-release` rewrites the notes from the file.

### Pre-release checks

**Before committing the release bump**, run the full local gate and fix any failures. A broken release commit fails CI and the tag-side `quality-gate` in `release.yml` now blocks publishing before any artifacts are built:

```bash
bun run check      # format + lint + tooling contract + typecheck + knip + madge + package gates
```

Do not skip. A type error, dead export, circular import, stale locale key, or test failure that slips into a release tag breaks the remote release gate.

### Trigger

Use the wrapper scripts — they enforce branch, version-shape, clean tree, no-duplicate-tag, annotated tag, and `--follow-tags` in one shot. Refuses every footgun that has bitten before. See `scripts/release.sh`.

**When user says "release X":** run checks → commit → `bun run release:beta` (or `release:stable`) autonomously. Do not stop and ask the user to run the script themselves.

```bash
# beta
git checkout main
# bump package.json: e.g. 0.3.1-beta.3 → 0.3.1-beta.4
git commit -am "release: 0.3.1-beta.4"
bun run release:beta   # tags + pushes

# stable
git checkout main
# bump package.json: e.g. 0.3.1-beta.4 → 0.3.1
git commit -am "release: 0.3.1"
bun run release:stable
```

Manual fallback if the script is unavailable:

```bash
# package.json version must match tag exactly. annotated tag required.
git tag -a v0.4.0 -m "release 0.4.0"
git push --follow-tags
```

### Job graph

`.github/workflows/release.yml`: `verify-version` → `quality-gate` (`bun run check`) → `prepare-release` → `build` matrix (linux + mac on `ubuntu-latest`/`macos-latest`); `build-flatpak` starts after `build`, then `upload-flatpak`; `publish-release` waits for `upload-flatpak`, polls for Windows assets, generates `SHA256SUMS`, then un-drafts the release. Stable tags also run `publish-scoop`, `publish-homebrew`, and `notify-web-release-manifest` after `publish-release`. Read the YAML for step-level detail.

Windows is built separately via a dedicated Windows Installer workflow (smoke-testable before publish); `publish-release` polls up to 15min until the Windows Setup + Portable `.exe` artifacts appear before generating `SHA256SUMS` and un-drafting the release.

Arroxy uses GitHub immutable releases for release asset integrity and the GitHub release asset verification UI. The workflow finishes all mutable release work while the release is still a draft, then publishes/undrafts as the last step. `actions/attest` is intentionally not used for release assets; immutable releases create release attestations for the published assets, while workflow provenance attestations are a separate SLSA/build-chain concern. Keep `SHA256SUMS` for package-manager hashes and offline verification; keep updater metadata (`latest*.yml`) and blockmaps outside the checksum contract.

`.github/workflows/release_to_winget.yml` triggers on the `released` event: once `publish-release` un-drafts the release, the SHA-pinned `vedantmgoyal9/winget-releaser` action runs `komac update AntonioOrionus.Arroxy --submit` → opens a PR against `microsoft/winget-pkgs`. Microsoft reviewers merge within hours-to-a-day. Keep that third-party action pinned to a full commit SHA because it receives `WINGET_TOKEN`.

### Required GitHub repo secret

| Secret         | Used by            | Scope                                   |
| -------------- | ------------------ | --------------------------------------- |
| `WINGET_TOKEN` | all 3 publish jobs | classic PAT, `public_repo` + `workflow` |

Despite the name, this single token authenticates Scoop, Homebrew, **and** Winget pushes (needs `public_repo` to push to external bucket/tap repos and to fork `microsoft/winget-pkgs`). Rotate every 90 days.

### Initial Winget submission (one-time, done)

The `vedantmgoyal9/winget-releaser` action can only **update** an existing winget package, not create one. For Arroxy this was done once via [komac](https://github.com/russellbanks/Komac) (`komac new AntonioOrionus.Arroxy …`) → submitted PR [microsoft/winget-pkgs#365414](https://github.com/microsoft/winget-pkgs/pull/365414). Future tag pushes auto-bump the existing manifest with no manual work.

If we ever change the PackageIdentifier, repeat that one-time submission for the new identifier and update `release_to_winget.yml`.

### External repos this pipeline writes to

- [`antonio-orionus/scoop-bucket`](https://github.com/antonio-orionus/scoop-bucket) — single `bucket/arroxy.json` manifest, auto-bumped per release
- [`antonio-orionus/homebrew-arroxy`](https://github.com/antonio-orionus/homebrew-arroxy) — single `Casks/arroxy.rb` cask with `on_arm`/`on_intel` stanzas, auto-bumped per release
- [`microsoft/winget-pkgs`](https://github.com/microsoft/winget-pkgs) — community repo; PRs land at `manifests/a/AntonioOrionus/Arroxy/<version>/`

GitHub Releases ships: NSIS installer, portable `.exe`, arm64 DMG, x64 DMG, AppImage, tar.gz source, and a Flatpak bundle. No Snap / AUR — community can maintain those if demand appears.

---

## Binary distribution strategy

Arroxy ships three third-party binaries. They split into two camps based on update cadence:

| Binary           | Strategy                                        | Source                                                | Why                                                                                            |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| ffmpeg + ffprobe | **Embedded at build time** via `extraResources` | BtbN GPL builds (Win/Linux), Martin-Riedl GPL (macOS) | Static codec semantics; pair coherence solved by construction                                  |
| yt-dlp           | Runtime-fetched                                 | GitHub `yt-dlp/yt-dlp(-nightly-builds)`               | Ships fixes ~weekly w/ YouTube bot-protection cycle; can't bundle and ship app release per fix |

### Electron-as-Node security note

`electron-builder.json5` intentionally keeps the `runAsNode` fuse enabled because Arroxy uses its packaged Electron executable as yt-dlp's Node runtime. `ELECTRON_RUN_AS_NODE=1` must only be added to the yt-dlp child-process environment, never to `process.env` or persisted config. Packaged runtime smoke tests assert this fuse behavior, Node >=22, child-env isolation, managed yt-dlp selection, and bundled EJS availability.

### How embed works

- `scripts/build/fetch-embedded.sh <platform> <arch>` — fetches + verifies SHA + extracts ffmpeg+ffprobe (and Linux `libav*.so*` siblings) into `build/embedded/<platform>-<arch>/`. Reuses smoke-all.sh helpers via `scripts/test-binaries/_lib.sh`.
- `build/beforeBuild.mjs` — electron-builder lifecycle hook, fires once per `(platform, arch)` build. Calls fetch-embedded.sh.
- `electron-builder.json5` — per-platform `extraResources` with `${arch}` substitution copies the fetched binaries into `<resources>/` of the packed app.
- Runtime: `BinaryManager.getFfmpegPath()` returns `process.resourcesPath/ffmpeg(.exe)` in prod, `build/embedded/<host>/ffmpeg(.exe)` in dev. `app.isPackaged` branches.
- Linux only: BtbN's shared build expects `libav*.so.*` siblings; `spawnYtDlp` + `spawnFFmpeg` + `probeBinary` all inject `LD_LIBRARY_PATH=<dir>` at spawn time. No rpath patching needed.

### License attribution

`THIRD_PARTY_NOTICES.txt` ships at `<resources>/` via top-level `extraResources`. Covers ffmpeg (GPLv3) and yt-dlp (Unlicense). Arroxy stays MIT — spawn ≠ link, no GPL propagation into our code.

### Smoke parity

`scripts/test-binaries/smoke-all.sh` validates upstream binary source availability for runtime manifest automation and embedded ffmpeg/ffprobe fetches. Run before bumping fetch-embedded.sh asset names or runtime manifest source facts. **`scripts/test-binaries/` directory must stay tracked** — an earlier `.gitignore` rule `test-binaries/` accidentally matched it. Now anchored: `**/build/embedded/` (build output) and `/test-binaries/` (smoke output, root only).

---

## Updating Public-Facing Content (READMEs)

README files (English + 20 locales) are **generated** — never edit them directly. Source-of-truth:

| Source                                              | Generates                        | Command                     |
| --------------------------------------------------- | -------------------------------- | --------------------------- |
| `readme-src/strings.mjs` + `readme-src/template.md` | `README.md` + `README.{lang}.md` | `node readme-src/build.mjs` |

The build script validates **key parity** — if any locale is missing a key that `en` has (or has an extra key), the build fails loudly. Every new string must be translated into every supported language.

The landing site (`arroxy.orionus.dev`) lives in a separate repo: [antonio-orionus/arroxy-web](https://github.com/antonio-orionus/arroxy-web). Don't update landing copy from here — open a PR there instead.

### Adding a new feature

1. Add `what_N` (next in sequence) to every locale object in `readme-src/strings.mjs`, then add `- {{what_N}}` to `readme-src/template.md`.
2. Run `node readme-src/build.mjs` and confirm `✓` for every locale.
3. Commit the source files **and** the regenerated `README*.md` files together.

### Locales in scope — source of truth

Do **not** hardcode the locale list or count anywhere in code, docs, or memory. Read from the canonical sources:

| Surface                        | Canonical list                                                        | Type                                                                                      |
| ------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Renderer + main process (i18n) | `SUPPORTED_LANGS` in [`src/shared/schemas.ts`](src/shared/schemas.ts) | `SupportedLang` (re-exported from [`src/shared/i18n/types.ts`](src/shared/i18n/types.ts)) |
| README build                   | `LOCALES` in [`readme-src/strings.mjs`](readme-src/strings.mjs)       | —                                                                                         |

Both must stay in lockstep with the landing-site locale list in the `arroxy-web` repo. The `en` locale is the canonical reference; the build script and the `WidenStrings<EnTranslation>` type (see `src/shared/i18n/types.ts`) diff every other locale against it.

### What NOT to edit directly

- `README.md`, `README.es.md`, `README.de.md`, … — generated from `readme-src/`

---

<!-- rtk-instructions v2 -->

# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)

```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)

```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)

```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)

```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)

```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk bun run <script>    # Compact Bun script output
rtk bunx <cmd>          # Compact Bun package-exec output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)

```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)

```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)

```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)

```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands

```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category         | Commands                       | Typical Savings |
| ---------------- | ------------------------------ | --------------- |
| Tests            | vitest, playwright, cargo test | 90-99%          |
| Build            | next, tsc, lint, prettier      | 70-87%          |
| Git              | status, log, diff, add, commit | 59-80%          |
| GitHub           | gh pr, gh run, gh issue        | 26-87%          |
| Package Managers | pnpm, bun, bunx                | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.

<!-- /rtk-instructions -->

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tools** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them. `codegraph_node` returns one symbol's source + callers, or reads a whole file with line numbers. If the tools are listed but deferred, load them by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` and `codegraph node <symbol-or-file>` print the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
