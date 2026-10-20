# Fixture Product E2E — scenario guide

Which test layer owns a behavior, and how to write Fixture Product E2E scenarios when the answer is that layer.

| Lives in | What |
| --- | --- |
| `tests/e2e/fixture-*.spec.ts` | Scenarios grouped by risk |
| `tests/e2e/fixtureHarness.ts` | Fixture extractor, local media server, deny proxy, diagnostics |
| `src/main/e2eHarness.ts` | `ARROXY_E2E` / `ARROXY_E2E_HEADLESS` app-side switches |

## Test layer ownership

Fixture Product E2E is the **acceptance owner for real user workflows**, not the default test type for every behavior. Keep it to a small number of strong scenarios per risk group; local rules, rendering states, process-supervision failures and startup/security checks belong in their cheaper owning layers.

- **Fast logic tests** (`tests/unit`, Vitest): pure rules and closed interfaces such as `QueueEvent` transition, progress normalization, URL parsing, yt-dlp argument construction, extractor classification, error classification, and `WizardStepGraph`. They never prove a full user workflow.
- **Renderer tests** (`tests/renderer`, jsdom): renderer-local state and component contracts too small to justify a full app launch. Never the acceptance test for download, probe, queue or filesystem workflows.
- **Probe source snapshots** (`tests/unit/probe-sources.test.ts`): real yt-dlp probes of many sites and YouTube kinds (`src/renderer/src/dev/probeSources/`, re-recorded with `bun run probe-sources:capture`) replayed through the app's own format mapping. One text file per site shows what the Format screen lists and what each built-in profile picks, so a picker, grouping or mapping change shows its effect on every kind of site as a readable diff. Read the diff before updating with `-u`; add a site whenever a report shows a new format shape. Sources marked `signIn` are captured with the dev profile's Explore session (`scripts/export-explore-cookies.cjs`; each yt-dlp run gets a fresh, deleted jar, since yt-dlp writes cookies back).
- **Scenario Workbench** (`tests/browser`, `bun run dev:mock`): browser-mock and the scenario gallery for visual inspection, layout stress, screenshots and fast review of many UI states. Proves how a state looks, not whether the workflow works.
- **Mock Electron smoke tests** (`tests/e2e` with `MOCK_BACKEND=1`): app shell, preload bridge, context isolation, startup resilience, mocked persistence. Not for normal download acceptance.
- **Fixture Product E2E** (`ARROXY_E2E=1`): real Electron, real IPC, real `ProbeService`, `DownloadService` and `QueueService`, real filesystem effects and spawned yt-dlp; only the video platform is deterministic, through the fixture extractor plugin, local media server and deny proxy.
- **Cold-start packaged E2E**: packaged binary/warmup behavior, managed binary downloads, production bootstrapping. Keep it narrow; it is slow.
- **Live smoke tests**: only to detect real YouTube/yt-dlp drift. External and flaky by nature; never the acceptance gate.

### Choosing the right test

- Found by opening the app and performing a workflow → Fixture Product E2E.
- Pure domain rule with no UI, filesystem, process or IPC requirement → fast logic test.
- Visual layout, responsive fit, empty/loading/error surfaces, screenshot review → Scenario Workbench.
- How the Format screen handles a site's format list → probe source snapshot (and its "Real sites" scenario to look at it).
- App boot, preload, context isolation → Mock Electron smoke test.
- Whether real YouTube currently works → a tiny live smoke test outside normal acceptance.

## Scenario design

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

## Workflow feedback rules

- Prefer visible UI milestones first: title appears, row count changes, progress/status changes, buttons enable/disable, queue card reaches the expected state.
- Use E2E-only diagnostics only when visible UI is insufficient. Gate diagnostics behind `ARROXY_E2E=1`; never expose them in normal packaged production.
- Use filesystem assertions for download outcomes. A completed queue item is not enough if the expected output file is missing or implausible.
- Use the deny proxy request log as an oracle. Deterministic fixture tests must fail if yt-dlp reaches non-local network.
- Avoid hardcoded sleeps. Wait for specific UI, diagnostic, process, filesystem, or network milestones.
- Capture screenshots/traces for complex scenario failures so an agent can inspect what a human would have seen.

## Anti-patterns

- Do not add unit tests to claim a real paste -> metadata -> queue -> download workflow is fixed.
- Do not duplicate the same acceptance behavior in unit, jsdom, browser-mock, and fixture E2E layers.
- Do not treat browser-mock as proof that real IPC, yt-dlp, queue scheduling, or filesystem behavior works.
- Do not use fake yt-dlp as the normal download acceptance strategy. Keep fake yt-dlp only for process-supervision failures such as spawn failure, permission denied, crash, invalid JSON, huge stderr, hang, and signal termination.
- Do not make one super scenario that covers every risk at once. Prefer grouped, realistic scenarios with clear ownership.

## Running headless

`ARROXY_E2E_HEADLESS=1` maps to `show: false` on the `BrowserWindow`, so the app runs and is fully driveable, just never paints on screen. Electron has no Chrome-style `--headless`, and `xvfb-run` only helps on Linux, so this is the portable option on macOS and Windows.

The flag only takes effect in an E2E launch — `ARROXY_E2E=1` (set by the fixture harness) or `MOCK_BACKEND=1` (set by the smoke and startup-resilience specs) — so a stray export never hides a normal launch; see `isHeadlessWindowRequested()` in `src/main/e2eHarness.ts`. Any new spec that launches the app must set one of the two, or its window shows. Specs that need a focused window (hotkey feedback, clipboard watching) skip themselves under the flag. `startup-journeys.spec.ts` drives a packaged build (`PACKAGED_EXE`) and is not covered.

The suites launch `out/main/index.js`, not the dev server, so rebuild first (`bun run build`). The build type-checks first and stops on any error (including in test files), leaving the old bundle in place, so never hide its output. The E2E global setup refuses to run when `out/main/index.js` is older than any file in `src/` (`ARROXY_E2E_ALLOW_STALE_BUILD=1` to override).
