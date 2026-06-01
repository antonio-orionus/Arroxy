## Shell command wrapper

This repo prefers `rtk` as a token-optimized shell command proxy.

Bootstrap exception: before using `rtk`, check whether it is available:

```bash
command -v rtk
```

If available, prefix repo shell commands with `rtk`. If unavailable, run commands directly and mention that `rtk` was not found.

@/home/anton/projects/yt-download-ui/RTK.md

# General

## Engineering Principles

The defaults below apply to every change in this codebase.

- **Type safety throughout.** Favor strict typing, exhaustive checks, and discriminated unions. `any` and `unknown` are escape hatches, not load-bearing tools — if you reach for one, justify it.
- **Clean architecture.** Keep concerns separated, dependencies pointing inward, business logic decoupled from frameworks and I/O. The renderer shouldn't know how the main process fetches; the main process shouldn't know which component renders.
- **Prefer mature libraries over bespoke code.** For validation, HTTP, ORM, auth, logging, and similar plumbing, reach for the production-proven, widely-adopted package before writing your own. If a mature library solves the problem, use it.
- **Push back when something looks wrong.** Don't defer to the user reflexively. If a proposal looks incorrect, incomplete, or inconsistent with the codebase, name the specific reason rather than agreeing. Agreement-by-default is a failure mode.
- **Verify before you act on uncertainty.** When you're not confident about a fact, an API surface, a library's behavior, or how a piece of this codebase works, check it — read the source, check the docs, run a quick test. Assumed knowledge is the most common source of bugs.
- **Reuse the domain glossary** below — the canonical naming reference for the architecture. Use those terms exactly when extending or refactoring; add new entries when extracting modules instead of letting parallel vocabularies sprout.
- Don’t fight errors! Whenever you encounter the same error 3 times, research the web (and github using gh api) and find 3-5 possible ways to fix it. Then choose the most efficient solution and implement it or stop to notify user that there is no clean fix at this point.

---

## Domain Glossary

Format: `**Term** — definition. \`path\``. Add an entry when extracting a new module/abstraction.

- **Job** — user-initiated download identified by `DownloadJob.id` (UUID). Lifecycle: created in `DownloadService.start`, runs through Phases, finalized via `JobLifecycle.finalize`. `src/shared/types.ts`.
- **ActiveJob** — in-flight record holding `job`, `input`, `signal`/`controller`, `disposables`, mutable progress. Aliased as `ActiveDownload`. Phases push disposables onto it as resources are acquired (tempDir, yt-dlp child, ffmpeg child). `src/main/services/phases/types.ts`.
- **Phase** — pure step in the download pipeline (Preflight → Video → SidecarSubs / SubtitleOnly). Inputs `PhaseContext`, returns `PhaseOutcome` (`continue`/`completed`/`soft-failed`/`hard-failed`/`cancelled`/`paused`). `phasesFor(input)` builds the chain; `PhaseExecutor.run` drives it. `src/main/services/phases/types.ts`.
- **Disposable** — teardown callback (`() => Promise<void> | void`) registered against ActiveJob, drained LIFO by `JobLifecycle.drain` with try/catch per entry. Phases register via `ctx.register(d)` instead of inline cleanup. `src/main/services/phases/types.ts`.
- **JobLifecycle** — single coordinator for end-of-job: drain disposables, emit analytics (`download_finished`/`_cancelled`/`_failed`), persist to `RecentJobsStore`. `src/main/services/JobLifecycle.ts`.
- **QueueEvent** — closed union of state-change signals over a `QueueItem`: `started`, `progress`, `paused-active`, `paused-held`, `resumed`, `failed`, `completed`, `cancelled`, `retry-reset`. Drives `transition`. `src/shared/queueTransition.ts`.
- **QueueService** — authoritative queue-of-record on main. Owns the in-memory array, applies cap=1 scheduler (3s inter-job sleep), persists via `QueueStore`, projects to renderer via 4 IPC events: `queue:event:snapshot` (initial hydration), `Added`/`Updated`/`Removed` (incremental diffs). 8 commands flow renderer → main via `queue:cmd:*`: add, start, pause, resume, cancel, retry, clearCompleted, remove. `src/main/services/QueueService.ts`.
- **ProgressNormalizer** — pure display-progress policy for running jobs. Accepts yt-dlp progress samples, rejects low-confidence HLS bootstrap `100%` lines like `frag 0/N`, keeps progress monotonic, and caps running display below `100` until `QueueEvent.completed` marks the job done. `src/shared/progressNormalizer.ts`.
- **QueueStore** — persists the queue to `queue.json` in the user-data dir. On close: `downloading`/`paused-active` → `pending`, `cancelled` excluded. On launch: `initialize()` loads it, auto-opens drawer if non-empty, calls `maybeStartNext()`. `src/main/stores/QueueStore.ts`.
- **QueueStatus** — 7-value union: `pending` | `running` | `paused-held` | `paused-active` | `done` | `error` | `cancelled`. `paused-held` = in queue, never spawned (resume → pending). `paused-active` = had a running job, user paused (resume → re-spawn, possibly across an app restart via persisted `tempDir` + `lastJobId`). `src/shared/schemas.ts` (`queueItemStatusSchema`).
- **transition** — pure exhaustive `(QueueItem, QueueEvent) → QueueItem` switch. No I/O. New event kind without a case = compile error. `illegalTransition` guards stale signals (progress/completed/failed on a cancelled item, anything on a done item except retry). `src/shared/queueTransition.ts`.
- **YtDlpErrorKind** — closed enum of yt-dlp failure categories: `botBlock`, `ipBlock`, `rateLimit`, `ageRestricted`, `unavailable`, `geoBlocked`, `outOfDiskSpace`, `chunkTransferFailure`, `postprocessFailure`, `unsupportedUrl`, `parse`, `network`, `unknown`. Drives both analytics (`error_category` label) and i18n key lookup. Every yt-dlp failure plumbs through `classifyYtDlpStderr(stderr)` → `{ kind, raw }`; UI keys i18n off `kind`, falls through to `raw` for `'unknown'`. ProbeService adds `unsupportedUrl` for the pre-extraction signal yt-dlp emits before any pattern would match. `src/shared/ytdlp/errors.ts`.
- **LocalizedError** — `{ kind: YtDlpErrorKind; raw: string }`. Always populated; `'unknown'` covers unmatched-stderr fallback. Replaces the old `{ key, rawMessage? }` shape; QueueStore + RecentJobsStore migrate beta-shape entries on load. `src/shared/i18n/types.ts`.
- **BinaryDownloader** — HTTP fetch with range-resume, checksum verification, zip extraction with symlink-safety. Pure I/O, no policy. Exposes `parseShaLine`/`parseStandaloneSha256`/`parsePowerShellFileHash`, `sha256ForFile`, `downloadText`, `downloadFile`, `classifyDownloadError`, plus shared `HTTP_HEADERS`/`HTTP_RETRY`/`HTTP_TIMEOUT` got config. BinaryManager's strategy chain calls it for managed-binary fetches. `src/main/services/binary/BinaryDownloader.ts`.
- **BinaryProbe** — spawns binary with `--version`/`-version`, parses stdout/stderr, classifies spawn failures (ENOENT/EACCES/ETIMEDOUT/SmartScreen). Companion `whereOnPath` discovers candidates via `where`/`which`. No version-comparison policy. `src/main/services/binary/BinaryProbe.ts`.
- **BinaryManager** — resolver facade orchestrating BinaryDownloader + BinaryProbe behind the strategy chain (manualOverride → envOverride → managed → systemPath). Owns version-comparison policy, accumulates `DependencyAttempt[]`, returns `DependencyDiagnostic` per binary. Public class API preserved for callers (`YtDlp`, `WarmupService`, `diagnosticsHandlers`). `src/main/services/BinaryManager.ts`.
- **Diagnostic** — `DependencyAttempt[]` + final `DependencyDiagnostic` shape: what attempts ran, which succeeded/failed. Each failure carries a stable `FAILURE_CODE` (ARX-NNN) so users can search the repair UI codes language-independently. `src/shared/types.ts` (`DependencyDiagnostic`, `DependencyAttempt`, `DependencyFailure`, `FAILURE_CODE`).
- **NavContext** — inputs to `nextStep`: extends `StepContext` (mode, preset, extractor, hasSubtitles) with `wizardSubtitleSkipped` and `retryOrigin` so re-entry from the skip / error step lands on the right destination instead of bouncing back into subtitles. `src/renderer/src/components/wizard/nextStep.ts`.
- **FormatPicker** — pure helpers (`applyPreset`, `restoreFormatSelection`, `restoreSubtitleSelection`) + slice (`createFormatPickerSlice`) owning `wizardFormats`, `selectedVideoFormatId`, `audioSelection`, `lastConvertBitrate`, `activePreset`, plus subtitle pools (`wizardSubtitles`, `wizardAutomaticCaptions`, `wizardSubtitleLanguages`, `wizardSubtitleSkipped`, `wizardSubtitleMode`, `wizardSubtitleFormat`). Probe pipeline writes pools via shared `set()` after probe success. `src/renderer/src/store/wizard/formatPicker.ts`.
- **ProbeOrchestrator** — renderer slice owning URL → probe → format-step pipeline plus wizard step graph and playlist enumeration. Holds `wizardStep`, `wizardUrl`, `wizardExtractor`, `wizardError`, playlist fields, navigation actions (`advance`/`back`/`skipSubtitles`/`reset`). Cross-slice writes via `set()` are intentional — probe success populates format pools, subtitle pools, output prefs, dialog flags in one transition. `src/renderer/src/store/wizard/probeOrchestrator.ts`.
- **OutputConfig** — renderer slice owning "where + how the file lands": `wizardOutputDir`, `wizardSubfolderEnabled`/`Name`, SponsorBlock mode + categories, embed / sidecar output flags, and playlist M3U preference. `src/renderer/src/store/wizard/outputConfig.ts`.
- **WizardDialogs** — renderer slice for transient modal flags: `mixedUrlPromptOpen`, `mixedUrlPending`, `advancedAutoOpen`, `cookiesConfigDialogIssue`. Session-only; reset by `WizardCommands.resetAll`. `src/renderer/src/store/wizard/wizardDialogs.ts`.
- **WizardCommands** — cross-slice orchestrator helpers — currently `resetAll(set)` (applied via the `reset` action on ProbeOrchestrator). Future deep-link / snapshot replay code lands here. `src/renderer/src/store/wizard/commands.ts`.
- **FormatPrefsPersistence** — bridge between wizard state and SettingsStore. Reads format/audio/subtitle/output/embed/sponsorblock fields across the four wizard slices, writes the right shape into `common`/`single`/`playlist` Settings buckets via IPC. Lives in the wizard module (not QueueSlice) because inputs are wizard-owned, even though firing point is queue-submit/start/retry. `src/renderer/src/store/wizard/persistFormatPrefs.ts`.

### Glossary conventions

- New shared modules go under `src/shared/` so renderer + main both import without IPC. Modules with electron/node-only deps stay in `src/main/services/` (or `src/renderer/...`) and surface their seam via re-exports of pure helpers.
- Pure helpers (no I/O) live in their own module with a fixture-driven test alongside. Pattern: `tests/fixtures/yt-dlp-stderr/<kind>/*.txt` + `tests/unit/yt-dlp-errors.test.ts`.
- Classification regexes / closed enums must stay synchronized with i18n locale entries — `i18n-contract.test.ts` enforces every locale has a string for every `YtDlpErrorKind` and `StatusKey`.

---

## Working Conventions

**No backward compatibility** — Do not prioritize migration paths, backward compatibility shims, or preserving existing implementations. Existing code can be discarded or restructured without ceremony. Skip any "keep for compat" hedging. Delete old types, old components, old state fields without re-exporting or aliasing. Refactor aggressively. No deprecation notices or transitional layers.

**schemas.ts is SSOT for all enum types.** Pattern: `z.enum([...])` → `type Foo = z.infer<…>` → `const FOOS = fooSchema.options`. Don't redeclare as TS union literals. `QUEUE_STATUS` / `STATUS_KEY` live in `schemas.ts` (not `constants.ts`). `DEFAULTS` lives in `constants.ts`.

**TDD for non-trivial changes.** Write failing tests first, implement minimally, then refactor. Skip only for typo fixes and single-line edits.

**Translation gate.** Edit `en` locale only first. Do not dispatch the `translate` skill or per-locale agents until the user explicitly approves the English copy. Plan approval is not translation authority.

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

---

# Project-Scoped

## Memory storage — project-scoped, not user-scoped

Persistent memory for this repo lives at `/home/anton/projects/yt-download-ui/.claude/memory/`, not in the user-scoped (`~/.claude/projects/...`) location. Read `MEMORY.md` in that directory for the index, and write new memories there following the same `name` / `description` / `type` frontmatter convention as the existing files. Do **not** write project facts, conventions, or references into user-scoped memory — they belong with the repo so other clones / collaborators / reset-home agents can see them.

Rarely-needed deep-dive references that bloat this file (e.g. the YouTube bot-protection research map) live as memory entries instead of inline sections here. Pull them in via memory when the symptom matches.

---

## Post-Task Checks

After completing any implementation task, run this single command and fix all errors before reporting done:

```bash
bun run check   # lint + typecheck + knip + madge (circular imports)
```

Do not skip. A change in one file can break types, introduce dead code, or create circular imports elsewhere.

### On-demand hygiene checks

```bash
bun run madge           # circular imports — exit 1 if any found
bun run knip:test-only  # src/ files imported only from tests/ — potential dead production code
```

Run `madge` after any refactor that moves modules or changes import boundaries. Run `knip:test-only` when reviewing whether a helper belongs in `src/` or `tests/`.

### Dev workflow

```bash
bun run dev        # normal dev start
bun run dev:fresh  # clear main.log then start (cross-platform)
```

### Worktree workflow

Use the repo bootstrap script instead of raw `git worktree add`:

```bash
bun run worktree codex/my-feature [../yt-download-ui-my-feature]
```

It creates the worktree, runs `bun install`, verifies Electron's generated `path.txt` + `dist/electron` payload, repairs it from the source checkout if Bun reports "no changes" but Electron is half-installed, and fetches embedded ffmpeg/ffprobe. Raw worktrees are easy to leave broken because Git does not copy ignored runtime artifacts and `bun install` may skip Electron postinstall repair.

### Test runner

Use `bun run test` (vitest), **not** `bun test` (Bun's built-in runner ignores vitest config and per-file `// @vitest-environment` directives). For a single file: `bunx vitest run --project node <path>` or `--project jsdom <path>` from repo root.

When adding idempotent IPC registration (`ipcMain.removeHandler()`, `autoUpdater.removeAllListeners()`), add the method as `vi.fn()` to the matching `vi.mock('electron')` / `vi.mock('electron-updater')` blocks — otherwise tests fail at module-load with `TypeError: X is not a function`.

---

## Visual Debugging with Playwright

Run the renderer standalone via Vite for fast visual iteration; full Electron via Playwright `_electron.launch()` works but is slow.

```bash
# From project root — uses src/renderer/vite.config.mjs (aliases + Tailwind + React)
npx vite src/renderer --port 5173 --mode browser-mock
```

The renderer's `browserMock.ts` stubs `window.appApi` with simulated downloads, formats, settings when Vite runs in explicit `browser-mock` mode — no Electron needed. Electron dev and packaged builds must use the real preload bridge.

### MCP workflow

1. `browser_navigate` → `http://localhost:5173`, then `browser_take_screenshot`.
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
- Update banner in `browser-mock` mode: fires after 3s with `{ version: '1.2.0', currentVersion: '0.0.1', installChannel: 'direct' }`. Edit `browserMock.ts` to preview other channel UX (`scoop`/`homebrew` = copy-cmd; `winget` = install button on any platform).

---

## shadcn/ui Configuration

Config (style, aliases, icon library, CSS entry) lives in `components.json`. Runtime deps already present: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.

**Do not add Radix.** This project does **not** use `@radix-ui/*` — the `base-nova` registry doesn't depend on Radix primitives. Don't add Radix deps or assume Radix is available.

**Install via CLI:** `npx shadcn@latest add <component>` (style: `base-nova`). Never hand-roll `@base-ui/react/*` wrappers. After install, modify freely to match app style.

---

## Brand / Visual

**Font:** Poppins (`@fontsource/poppins`, weights 400/500/600/700). Don't reintroduce Outfit or Geist.

**CSS tokens** (`src/renderer/src/styles.css`): `--border-strong` (darker border), `--text-subtle` (muted label), dark mode `--border: hsla(0,0%,100%,0.07)`.

**Glow patterns:** primary buttons `shadow-[0_4px_14px_var(--brand-glow)]`, active radio `shadow-[0_0_0_2px_var(--brand-dim)]`, section labels `text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]`, back/ghost buttons `border-[1.5px] border-[var(--border-strong)]`.

---

## Subtitle Pipeline

Two-phase download: (1) video + audio with `--no-write-subs --no-write-auto-subs`; (2) subs only if phase 1 exits 0 and `subtitleLanguages` non-empty (`--skip-download --write-subs --sub-langs <langs>`). Phase 2 failure is **soft** — emit `subtitlesFailed`, finalize as `completed`; video is kept. Embed mode is the exception: subs ride phase 1.

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

IPC channel names live in `IPC_CHANNELS` (`@shared/ipc`); payload types (`InstallChannel`, `UpdateAvailablePayload`) live in `@shared/types`. `resolveAction` is the pure helper at `src/renderer/src/components/updateBannerAction.ts` — extracted from `UpdateBanner.tsx` so the component file only exports a component (react-refresh requirement). Renderer `browser-mock` mode at `src/renderer/src/browserMock.ts` simulates an `updater:available` event after 3s.

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

**NSIS installer:** pin `electron-builder ≥ 26.9.0` (26.8.x has a `multiUser.nsh:35` buffer over-read on cold-heap). Drop `build/installer.nsh`. Any future custom NSIS `Page custom` callback must open with `${If} ${Silent} \n Abort \n ${EndIf}`. Note: npm `latest` dist-tag is broken `26.8.1`; pin from `next` channel — `bun update --latest` silently downgrades.

### Release notes — CHANGELOG.md is SSOT

Release notes are hand-written in `CHANGELOG.md` and keyed by version (e.g. `## 0.3.5-beta.1`). The `publish-release` job in `release.yml` extracts the matching section, appends the auto-generated "What's Changed" PR list + Full Changelog link, and posts the combined body as the GitHub Release notes.

**Before tagging a release**, add a new `## <version>` section at the top of `CHANGELOG.md` in the same shape as the previous entry. Tone is friendly user-facing prose grouped by feature (look at `## 0.3.4` as the reference). If no matching section exists, the workflow falls back to pure auto-generated notes and emits a `::warning::` — the release will still publish but the body will only be the PR list.

Do **not** edit GitHub Release notes directly via the web UI or `gh release edit`. The `publish-release` step runs late in the pipeline and will overwrite manual edits made before it. Edit `CHANGELOG.md` instead and push a fix-up commit; re-running `publish-release` rewrites the notes from the file.

### Pre-release checks

**Before committing the release bump**, run the full local gate and fix any failures. A broken release commit fails CI and the tag-side `quality-gate` in `release.yml` now blocks publishing before any artifacts are built:

```bash
bun run check      # lint + typecheck + knip + madge + LOC + pins + i18n + tests
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

`.github/workflows/release.yml`: `verify-version` → `quality-gate` (`bun run check`) → `prepare-release` → `build` matrix (linux + mac on `ubuntu-latest`/`macos-latest`); `build-flatpak` starts after `build`, then `upload-flatpak`; `publish-release` waits for `upload-flatpak`, polls for Windows assets, generates `SHA256SUMS`, attests and verifies user-facing release assets, then un-drafts the release. Stable tags also run `publish-scoop`, `publish-homebrew`, and `notify-web-release-manifest` after `publish-release`. Read the YAML for step-level detail.

Windows is built separately via a dedicated Windows Installer workflow (smoke-testable before publish); `publish-release` polls up to 15min until the Windows Setup + Portable `.exe` artifacts appear before generating `SHA256SUMS` and un-drafting the release.

`publish-release` uses GitHub artifact attestations for user-facing downloads only: Setup `.exe`, Portable `.exe`, both DMGs, AppImage, tar.gz, Flatpak, and `SHA256SUMS`. It intentionally excludes updater metadata (`latest*.yml`) and blockmaps. To verify a downloaded asset locally, install a recent GitHub CLI and run `gh attestation verify <asset> -R antonio-orionus/Arroxy`. Attestations are provenance, not code signing, and do not replace electron-updater's release metadata checks.

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

Arroxy ships four third-party binaries. They split into two camps based on update cadence:

| Binary           | Strategy                                        | Source                                                | Why                                                                                            |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| ffmpeg + ffprobe | **Embedded at build time** via `extraResources` | BtbN GPL builds (Win/Linux), Martin-Riedl GPL (macOS) | Static codec semantics; pair coherence solved by construction                                  |
| yt-dlp           | Runtime-fetched                                 | GitHub `yt-dlp/yt-dlp(-nightly-builds)`               | Ships fixes ~weekly w/ YouTube bot-protection cycle; can't bundle and ship app release per fix |
| deno             | Runtime-fetched                                 | GitHub `denoland/deno`                                | Used for nsig signature decoding; ~120 MB embed cost too high for AppImage                     |

### How embed works

- `scripts/build/fetch-embedded.sh <platform> <arch>` — fetches + verifies SHA + extracts ffmpeg+ffprobe (and Linux `libav*.so*` siblings) into `build/embedded/<platform>-<arch>/`. Reuses smoke-all.sh helpers via `scripts/test-binaries/_lib.sh`.
- `build/beforeBuild.mjs` — electron-builder lifecycle hook, fires once per `(platform, arch)` build. Calls fetch-embedded.sh.
- `electron-builder.json5` — per-platform `extraResources` with `${arch}` substitution copies the fetched binaries into `<resources>/` of the packed app.
- Runtime: `BinaryManager.getFfmpegPath()` returns `process.resourcesPath/ffmpeg(.exe)` in prod, `build/embedded/<host>/ffmpeg(.exe)` in dev. `app.isPackaged` branches.
- Linux only: BtbN's shared build expects `libav*.so.*` siblings; `spawnYtDlp` + `spawnFFmpeg` + `probeBinary` all inject `LD_LIBRARY_PATH=<dir>` at spawn time. No rpath patching needed.

### License attribution

`THIRD_PARTY_NOTICES.txt` ships at `<resources>/` via top-level `extraResources`. Covers ffmpeg (GPLv3), yt-dlp (Unlicense), deno (MIT). Arroxy stays MIT — spawn ≠ link, no GPL propagation into our code.

### Smoke parity

`scripts/test-binaries/smoke-all.sh` validates every BinaryManager source URL still works. Run before bumping fetch-embedded.sh asset names. **`scripts/test-binaries/` directory must stay tracked** — an earlier `.gitignore` rule `test-binaries/` accidentally matched it. Now anchored: `**/build/embedded/` (build output) and `/test-binaries/` (smoke output, root only).

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
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
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
| Package Managers | pnpm, npm, npx                 | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.

<!-- /rtk-instructions -->
