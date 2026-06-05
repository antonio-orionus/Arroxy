# Test Ownership Audit

| Area | Lives in |
| --- | --- |
| Project testing rules | `AGENTS.md` |
| Vitest suites | `tests/unit/`, `tests/renderer/`, `tests/integration/` |
| Browser-mock workbench | `tests/browser/`, `src/renderer/src/dev/` |
| Electron E2E suites | `tests/e2e/` |
| Fixture yt-dlp harness | `tests/e2e/fixtureHarness.ts`, `tests/e2e/yt-dlp-plugins/` |

## Executive summary

This audit applies the rule: do not duplicate the same acceptance behavior in unit, jsdom, browser-mock, and fixture E2E layers.

The file-level pass was too coarse. Current suite shape is healthy in one important way: most unit tests cover closed rules, parsers, argument builders, queue transitions, phase outcomes, IPC contracts, preload contracts, and process failure mechanics. Those tests should stay. But the per-test pass found a larger cleanup surface inside otherwise-legitimate files, especially tests that verify `YtDlp` args, `phasesFor`, `ProgressParser`, or pure wizard navigation by reaching through `DownloadService` or renderer feature suites.

Do not expect most cleanup to come from whole-file deletes. Expect it from deleting, moving, or narrowing individual tests within large mixed-ownership files such as `tests/unit/download-service-subs.test.ts`, `tests/renderer/wizard-subtitles.test.tsx`, `tests/renderer/wizard-sponsorblock.test.tsx`, and `tests/browser/scenario-gallery.spec.ts`.

Fixture Product E2E should become the acceptance owner for real user workflows, but not the default test type for every behavior. Use it only when the behavior needs real Electron, real IPC, real yt-dlp, filesystem output, or realistic user interaction.

Implementation status:

1. Replaced the mocked queue completion flow in `tests/browser/queue-persistence.spec.ts` with `tests/browser/queue-drawer-workbench.spec.ts` plus real Fixture Product E2E queue scenarios.
2. Added Fixture Product E2E scenarios for bulk metadata concurrency, back/next while metadata is active, queue controls during active downloads, failure/retry, subtitle soft failure, and restart persistence.
3. Strengthened weak Electron startup assertions in `tests/e2e/startup-resilience.spec.ts`.
4. Merged true lower-layer duplicate files: `tests/unit/errorClassification.test.ts` into `tests/unit/error-classification.test.ts`, and `tests/renderer/SmartDrawer.test.tsx` into `tests/renderer/smart-drawer.test.tsx`.
5. Narrowed browser-mock feedback nudge tests to visual/screenshot coverage; behavior/timer assertions stay in jsdom.
6. Added the browser-mock `bulk-stress` Scenario Workbench state for 50 bulk URL rows, long duplicate titles, missing thumbnails, mixed metadata states, and scroll screenshots.
7. Hardened `tests/integration/download-service.test.ts` by replacing mock-download wall-clock sleeps with deterministic timer advancement.

## Risk ownership matrix

| Risk | Owning strategy | Existing coverage | Previously duplicated or weak coverage | Implemented change | Priority |
| --- | --- | --- | --- | --- | --- |
| Bulk input and paste | Fixture Product E2E for real paste acceptance; unit for URL parsing | `bulk-urls.test.ts`, `wizard-clipboard-autofill.test.tsx`, `probe-orchestrator.test.tsx`, Fixture Product E2E bulk scenario | Fixture E2E previously covered only a narrow bulk path; renderer tests should not be treated as acceptance | Added 10-URL Fixture E2E with real OS paste, invalid/duplicate lines, and output file assertions; kept unit/jsdom as local rules | P0 |
| Metadata fetching | Fixture Product E2E for user-visible metadata workflow; renderer store tests for concurrency rules | `probe-orchestrator.test.tsx`, `playlist-probe-limit-selector.test.tsx`, Fixture Product E2E metadata concurrency scenario | Previously no real Electron coverage for 2-at-a-time metadata, slow probes, or early Continue | Added fixture server/probe delays and assertions for visible progress plus concurrency telemetry | P0 |
| Wizard navigation | Unit/renderer for step graph; Fixture Product E2E for real back/next under active workflow | `next-step.test.ts`, `step-navigation.test.ts`, wizard renderer tests, Fixture Product E2E bulk navigation scenario | Previously no real app scenario for navigation while bulk metadata was still changing | Added Fixture E2E back/next coverage around bulk early Continue while probes are unresolved | P1 |
| Queue controls | Unit/integration for scheduler rules; Fixture Product E2E for real active controls | `queue-transition.test.ts`, `queue-service-scheduler.test.ts`, `queue-lifecycle.test.ts`, `queue-item-card.test.tsx`, Fixture Product E2E queue controls scenario | `queue-persistence.spec.ts` previously walked a fake browser workflow to prove queue outcomes | Replaced browser mock queue workflow with real Fixture E2E pause/prioritize/cancel/pause-all/resume-all scenario | P0 |
| Failure and recovery | Unit for classification/phase rules; Fixture Product E2E for user recovery | error classification, phase tests, download-service tests, Fixture Product E2E failure/retry scenarios | Previously no deterministic real-app failure/retry workflow; duplicate error-classification unit files existed | Added Fixture E2E metadata failure, media failure, subtitle soft failure, retry; merged duplicate unit classification file | P1 |
| Persistence and restart | QueueStore/QueueService integration plus Electron startup E2E; Fixture E2E for real paused download restore | `queue-store.test.ts`, `queue-lifecycle.test.ts`, `startup-resilience.spec.ts`, Fixture Product E2E restart scenario | Seeded queue Electron test previously only asserted app root; no real paused-download restart scenario | Strengthened seeded queue assertion; added Fixture E2E paused/restart/resume scenario | P1 |
| Scale and UX stress | Browser-mock Scenario Workbench first; Fixture E2E only for one small real workflow if needed | `scenario-gallery.spec.ts`, playlist renderer tests, `bulk-stress` Scenario Workbench state | Previously no dedicated large bulk/long-title visual scenario | Added browser-mock scenario for 50 bulk URLs, long titles, missing thumbnails, mixed metadata states, and scroll screenshots | P2 |
| Startup, preload, security | Mock Electron E2E plus unit preload/window tests | `smoke.spec.ts`, `startup-resilience.spec.ts`, preload/window unit tests | No major acceptance duplication | Kept ownership; strengthened weak startup assertion | P1 |
| Binary and process supervision | Unit/fake-process tests, cold-start packaged E2E | `ytdlp-retry.test.ts`, `download-service-*`, `cold-start.spec.ts`, `warmup-service.test.ts` | `download-service.test.ts` previously used real sleeps and legacy mock-mode concurrency | Kept as DownloadService mock-mode/process-state coverage; made mock-mode timing deterministic | P2 |
| Live YouTube drift | Separate live smoke scripts only | `smoke`, `smoke:playlist`, `smoke:pot` package scripts | Not part of deterministic acceptance | Kept separate; do not gate product workflow correctness on live YouTube | P2 |

## Recommended scenario backlog

### Fixture Product E2E

- **Done — Bulk metadata concurrency and early Continue/back/next**: paste 10 fixture YouTube URLs using the OS clipboard; make metadata resolve two at a time; continue before all metadata resolves; navigate back and forward while metadata is still active; assert visible progress, selected rows, final queue items, output files, and no external network.
- **Done — Queue controls during active downloads**: use slow media routes; add at least three items; pause second, prioritize first, cancel third, pause all, resume all; assert visible queue states, final statuses, expected files, and missing cancelled output.
- **Done — Failure and retry**: include metadata failure, media failure, subtitle soft failure, and a retry that later succeeds; assert error text, retry controls, final queue state, and filesystem results.
- **Done — Restart persistence**: launch with fixture harness, start queue, pause an active item, close Electron, relaunch with same userData, resume, and assert restored state plus final output.

### Scenario Workbench

- **Done — Large bulk UX state**: 50 URL rows, long duplicate titles, missing thumbnails, mixed metadata statuses, and scrolling screenshots across mobile/tablet/desktop.
- **Done — Queue drawer states**: keep visual state hydration for running, paused-active, paused-held, done, error, and cancelled; do not walk fake downloads to reach those states.
- **Done — Feedback nudge visual**: keep visual/screenshot tests for placement and animation class; timer/dismiss behavior ownership stays in jsdom.

### Lower-layer tests

- Keep unit tests for pure decisions: URL parsing, queue transitions, progress normalization, yt-dlp args, error classification, schema validation, phase strategy, output templates, and subtitle processing.
- Keep renderer tests for store state, button enablement, serialization to IPC payloads, and local component states.
- Keep integration tests for QueueService/QueueStore and DownloadService process state, but do not describe them as product acceptance.

## Deep per-test ownership findings

The tables below list tests that should change. Unlisted tests from the per-test pass keep their current owner.

### Highest-impact cleanup

| Priority | Tests | Verdict | Rightful owner | Reason |
| --- | --- | --- | --- | --- |
| P0 | `tests/unit/download-service-subs.test.ts:103,121,138,151,164,178,198,230,245,257,272,304,317,335,349,361,379,396,412,439,472,487,501,521,535,548,567,581,601,617,727,768,862,1093` | Delete | `ytdlp-args`, `yt-dlp-args-matrix`, `phase-selection`, `sidecar-subs-phase`, `subtitle-only-phase`, `progressParser`, Fixture E2E subtitle soft failure | These rows mostly re-check arg construction, phase construction, or phase outcomes through `DownloadService`. |
| P0 | `tests/unit/download-service-subs.test.ts:210,288,426,453,662,676,689,743,754,784,800,843` | Move | `PhaseExecutor`, `SubtitleOnlyPhase`, `YtDlp` args, `ProgressParser`, subtitle post-process helpers | Valuable rules, but the current owner is too high-level and makes `DownloadService` look responsible for lower-layer behavior. |
| P0 | `tests/unit/download-service-subs.test.ts:186,701` | Narrow/delete | `phase-selection`, `VideoPhase`, `SidecarSubsPhase`, `ProgressParser` | Current cases are too broad; retain only the missing seam if lower-layer coverage is incomplete. |
| P0 | `tests/unit/download-service-subs.test.ts:641,924,960,1050,1126` | Keep | `DownloadService` cross-phase process regression | These are the remaining high-value cases in the file: soft-fail finalization and real cross-phase mediaPath/ffmpeg cleanup seams. |
| P0 | `tests/unit/yt-dlp-cookies.test.ts:61,75,85,95` | Delete file after checking imports | `ytdlp-args.test.ts`, `cookies-resolver.test.ts` | Reaches through `DownloadService` only to re-check cookie flags already owned by direct arg/resolver tests. |
| P0 | `tests/unit/download-service-bot.test.ts:66,81,119,146,172` | Delete | `ytdlp-args.test.ts`, `ytdlp-retry.test.ts` | Bot-protection arg shape and retry ladder are `YtDlp` concerns, not `DownloadService` concerns. Keep `:97` for raw-error surfacing. |
| P0 | `tests/renderer/wizard-subtitles.test.tsx:182,225,236,247,258,270,280,349,461` | Delete | `restore-format-selection`, `next-step`, queued-job serialization rows in same file | Duplicates pure subtitle restoration, pure step graph, or an existing queued-job payload assertion. |
| P0 | `tests/renderer/wizard-sponsorblock.test.tsx:267,290,311,322,334,375,393` | Delete | `prepare-job`, `yt-dlp-sponsorblock` or moved `YtDlp` args, `next-step`, `wizard-format-select` | Repeats queued-job, off-collapse, step-graph, and FormatPicker invariants in the SponsorBlock feature suite. |
| P0 | `tests/browser/scenario-gallery.spec.ts:32,78,99,110` | Delete | Unit scenario fixture tests, renderer component tests, dedicated queue workbench | Scenario Workbench should render/screenshot states, not re-own alert behavior, update action policy, or queue scenario hydration. |
| P0 | `tests/browser/feedback-nudge.spec.ts:30` | Delete | `tests/renderer/feedback-nudge.test.tsx` | Exact animation class timing is jsdom-owned; browser keeps only visual placement. |
| P0 | `tests/browser/queue-drawer-workbench.spec.ts:31` | Move/delete | Renderer/QueueService clear-completed tests | Clicking fake scenario state is behavior, not visual workbench ownership. |

### Targeted unit cleanup

| Tests | Verdict | Rightful owner | Reason |
| --- | --- | --- | --- |
| `tests/unit/progress-ui.test.ts:5` | Delete | `tests/unit/progress.test.ts:64,68,72,76` | Fully duplicates monotonic percent helper coverage. |
| `tests/unit/progress-ui.test.ts:12` | Narrow | `ProgressFormatter` unit | Keep only any uncaptured null fallback; most speed/ETA cases are already in `progress.test.ts`. |
| `tests/unit/progress-ui.test.ts:28` | Move | `tests/unit/progress.test.ts` | FFmpeg detail rule belongs with the formatter owner. |
| `tests/unit/queue-service-events.test.ts:87` | Delete | `queue-lifecycle.test.ts:116`, `queue-store.test.ts:111` | Crosses persistence/restart, already owned by integration/store tests. |
| `tests/unit/queue-service-events.test.ts:141` | Delete | `queue-service-scheduler.test.ts:631` | Pause-all success path is covered by the stronger mixed-lane case. |
| `tests/unit/queue-service-events.test.ts:239` | Narrow | `progress.test.ts`, QueueService normalizer seam | Pure HLS bootstrap values belong to `ProgressNormalizer`; keep only a wiring assertion if useful. |
| `tests/unit/queue-service-scheduler.test.ts:387` | Delete | `queue-service-scheduler.test.ts:125` | Duplicate cancel-all clears sleep-window case. |
| `tests/unit/download-service-disk-full.test.ts:102,117` | Delete | `error-classification.test.ts:98,108` | Pure classifier branches already live with the classifier. Keep/narrow `:84` as the service wiring smoke. |
| `tests/unit/phase-executor-tempdir.test.ts:72,83,93,120,142` | Delete | `phase-executor.test.ts`, `job-lifecycle.test.ts` | Outcome propagation and disposable drain behavior have canonical owners. |
| `tests/unit/phase-executor-tempdir.test.ts:103` | Move | `phase-executor.test.ts` | Paused-leaves-disposables is useful but belongs in the main PhaseExecutor suite. |
| `tests/unit/phase-selection.test.ts:62,70,78,86` | Delete | `phase-selection.test.ts:28` | No-subtitle edge variants duplicate the no-subs phase construction rule. |
| `tests/unit/video-phase.test.ts:235` | Narrow | `VideoPhase` | Current fixture is equivalent to no-subs; if kept, actually pass an empty array to prove that branch. |
| `tests/unit/yt-dlp-args-matrix.test.ts:80,204` | Delete | `ytdlp-args.test.ts:419`, `yt-dlp-args-matrix.test.ts:63` | One row is misleading and duplicates embed flags; one is a subset of the audioConvert matrix. |
| `tests/unit/ytdlp-args-paths.test.ts:74` | Narrow | `ytdlp-args.test.ts:232,294` | Keep only no-`--paths`; default output template is already covered. |
| `tests/unit/yt-dlp-sponsorblock.test.ts:85,102,119,135` | Move | `ytdlp-args.test.ts` | Valuable SponsorBlock arg cases, but should not reach through `DownloadService`. |
| `tests/unit/yt-dlp-sponsorblock.test.ts:150,183` | Delete | moved direct arg tests / `sanitize-job-options` | Duplicates off-mode or is vacuous because the helper never passes `_sb`. |
| `tests/unit/yt-dlp-sponsorblock.test.ts:166` | Move | `SidecarSubsPhase` request mapping | Whether subtitle phases omit SponsorBlock belongs to phase request construction. |
| `tests/unit/probe-service.test.ts:291` | Narrow | `ProbeService` pass-through + `ytdlp-args` exact flags | ProbeService should prove mode forwarding, not exact yt-dlp flags. |
| `tests/unit/probe-service.test.ts:310` | Delete | `ytdlp-args.test.ts:125` | Default flag absence is a `YtDlp` probe arg rule. |
| `tests/unit/binary-manager.test.ts:8,14,19,24,29,38,44,49,54,59,66` | Move | `BinaryDownloader` tests | SHA/range/download helpers are not `BinaryManager` facade behavior. |
| `tests/unit/binary-manager-classify.test.ts:25,29,33,37,41,45,51,57,63,69,75,80` | Move | `BinaryProbe` tests | Probe-error classification belongs with `BinaryProbe`. |
| `tests/unit/binary-manager-platform.test.ts:106,110,118` | Move | `BinaryProbe` tests | PATH fallback candidates live with probe/path discovery, not managed asset policy. |
| `tests/unit/prepare-job.test.ts:140,166` | Narrow | `prepareJob` delegation smoke + `playlist-presets` exact spec | Keep only that `prepareJob` delegates; exact selector/convert details belong to `playlistPresetSpec`. |
| `tests/unit/prepare-job.test.ts:178` | Delete | `playlist-presets.test.ts:33` | Pure duplicate of MP4 preset sort/merge spec. |
| `tests/unit/playlist-media.test.ts:28` | Move | `playlist-m3u.test.ts` | The assertion is about `buildM3u` sanitizing EXTINF titles, not the media helper alone. |
| `tests/unit/sanitize-job-options.test.ts:57` | Narrow/rename | `sanitizeJobOptions` | Test name says conflict but asserts no conflict for `opus`; keep but fix the name. |
| `tests/unit/step-navigation.test.ts:63,80,86,91` | Delete | `next-step.test.ts` | Traversal cases duplicate the canonical `nextStep` suite. |
| `tests/unit/step-navigation.test.ts:67,71,76` | Move | `next-step.test.ts` | Bulk traversal cases are useful but belong with the traversal owner. |
| `tests/unit/install-channel-contract.test.ts:42` | Delete | `install-channel-contract.test.ts:35` | Command validity is already included in the stronger action-shape test. |
| `tests/unit/ipc-handlers.test.ts:161,181,197,219` | Delete | `DownloadEventBridge.test.ts:87,106,123,141` | Progress throttle policy moved behind `DownloadEventBridge`; IPC tests should not duplicate it. |
| `tests/unit/preload-contract.test.ts:65` | Delete | `preload-contract.test.ts:58` | Stale name and duplicate body call `downloads.probe`. |
| `tests/unit/updater-handlers.test.ts:212,333` | Delete | `updater-handlers.test.ts:221,324` | Handler registration and pre-delay negative case are covered by stronger behavior tests. |
| `tests/unit/updater-handlers.test.ts:341` | Narrow | `updater-handlers.test.ts:80` | Fold `currentVersion` into the payload test instead of a separate row. |

### Renderer/jsdom cleanup

| Tests | Verdict | Rightful owner | Reason |
| --- | --- | --- | --- |
| `tests/renderer/app.test.tsx:36,55,102` | Narrow | App composition / renderer store | Avoid proving real shell/input availability or mocked queue completion; E2E/smaller suites own those. |
| `tests/renderer/feedback-nudge.test.tsx:173,195` | Narrow | Feedback nudge behavior + footer URL owner | Keep dismissal/timer state; static URL and browser visual class coverage belong elsewhere. |
| `tests/renderer/radio-option.test.tsx:46,67` | Narrow | RadioOption | Merge duplicated disabled keyboard/callback coverage. |
| `tests/renderer/smart-drawer.test.tsx:37,106` | Delete | SmartDrawer focused branches | Sleep-banner negative assertion is dead UI; three-active aggregate duplicates the two-active branch. |
| `tests/renderer/splash-greeting.test.tsx:6,11` | Move | Unit/pure helper | Pure greeting gate does not need jsdom. |
| `tests/renderer/update-banner.test.tsx:12,23,34,39,45,52` | Move | Unit/pure `resolveAction` policy | Pure channel policy should live outside DOM tests. |
| `tests/renderer/update-banner.test.tsx:78,85` | Narrow | UpdateBanner branch smoke + moved `resolveAction` unit | Exact platform policy belongs to `resolveAction`; component needs representative branches only. |
| `tests/renderer/update-banner.test.tsx:92,113,189` | Delete | moved `resolveAction`, existing command UI case, any banner render | Duplicates install policy, duplicates command-copy path, or only asserts a test id. |
| `tests/renderer/update-notification.test.tsx:143,254` | Delete | `UpdateBanner`, `updater-handlers`, `resolveAction` | Duplicates prop rendering/main payload/platform policy. |
| `tests/renderer/update-notification.test.tsx:231` | Narrow | App update hook | Merge with the download-click test. |
| `tests/renderer/restore-format-selection.test.ts` | Move file | `tests/unit/` | Pure `FormatPicker` restoration helpers; keep most rows, delete duplicates at `:133` and `:143`. |
| `tests/renderer/wizard-sponsorblock.test.tsx:346,357` | Move | `next-step.test.ts` | Missing useful backward traversal cases. |
| `tests/renderer/wizard-sponsorblock.test.tsx:369,381,387` | Move | `wizard-format-select.test.tsx` / FormatPicker suite | FormatPicker preset sync rules are in the wrong feature suite. |
| `tests/renderer/wizard-sponsorblock.test.tsx:414` | Narrow | StepSponsorBlock UI | Current assertion checks wrapper presence, not the actual mode options. |
| `tests/renderer/wizard-subtitles.test.tsx:214` | Keep but narrow expectation | Store integration smoke | Keep one subtitle-restore integration smoke; pure variants remain in restored helper tests. |
| `tests/renderer/wizard-clipboard-autofill.test.tsx:241` | Delete | `:225`, `:367`, Fixture E2E bulk paste | It composes prompt handoff and manual confirm already covered, while real clipboard acceptance is E2E. |
| `tests/renderer/playlist-probe-limit-selector.test.tsx:205` | Delete | `:163`, Fixture E2E bulk | Lower-risk duplicate of enabled Continue behavior. |
| `tests/renderer/playlist-regressions.test.tsx:133,162,257` | Narrow | Renderer serialization smoke + output-template unit | Exact template strings are unit-owned; keep only serialization intent if needed. |
| `tests/renderer/playlist-regressions.test.tsx:308` | Delete | `schemas.test.ts`, `DEFAULTS`, `:284` false opt-out | Default `writeM3u=true` is already SSOT-owned; renderer false-propagation is stronger. |
| `tests/renderer/preset-pipeline.test.ts:39,59,68,109,114` | Move | `tests/unit/` pipeline/helper tests | This file is a Node/pure pipeline test under the renderer folder. |
| `tests/renderer/preset-pipeline.test.ts:76,85` | Delete | `restore-format-selection.test.ts:121` | Audio-only native/fallback cases are already covered by restoration helper tests. |

### Browser-mock and E2E naming cleanup

| Tests | Verdict | Rightful owner | Reason |
| --- | --- | --- | --- |
| `tests/browser/feedback-nudge.spec.ts:17` | Narrow | Browser visual + renderer timer tests | Browser should assert visible placement, not own the timer/message behavior. |
| `tests/e2e/fixture-download.spec.ts:140,177` | Narrow wording | Fixture harness smoke | Keep as harness preconditions, but do not count them as product workflow acceptance. |
| `tests/integration/download-service.test.ts:88,101` | Delete | `download-service-cancel.test.ts` | Legacy mock-mode concurrency/targeted-cancel assertions are covered by stronger process tests. |

## Actionable refactor backlog

| Priority | File(s) | Action | Status | Reason |
| --- | --- | --- | --- | --- |
| P0 | `tests/browser/queue-persistence.spec.ts` | Replace/narrow | Done — deleted and replaced by `tests/browser/queue-drawer-workbench.spec.ts` | It used browser-mock to walk a fake download workflow, but browser-mock cannot prove real queue/download/filesystem behavior. |
| P0 | `tests/e2e/fixture-download.spec.ts`, `tests/e2e/fixtureHarness.ts` | Expand | Done | Added bulk metadata concurrency, early Continue, back/next under active metadata, output assertions, and deny-proxy assertions. |
| P0 | `tests/e2e/fixture-download.spec.ts`, `tests/e2e/fixtureHarness.ts` | Expand | Done | Added queue control scenario with slow media, pause/prioritize/cancel/pause-all/resume-all, visible milestones, output assertions, and deny-proxy assertions. |
| P1 | `tests/e2e/startup-resilience.spec.ts` | Expand | Done | Seeded queue startup now asserts drawer/card/status hydration. |
| P1 | `tests/unit/errorClassification.test.ts`, `tests/unit/error-classification.test.ts` | Merge/delete | Done | Unique injected `DiskProbe` coverage was merged into the kebab-case file; duplicate casing file was deleted. |
| P1 | `tests/renderer/SmartDrawer.test.tsx`, `tests/renderer/smart-drawer.test.tsx` | Merge/delete | Done | The capitalized file's assertion was moved into the existing lower-case SmartDrawer suite. |
| P1 | `tests/browser/feedback-nudge.spec.ts` | Narrow | Done | Browser-mock now owns visual placement/screenshot coverage only; jsdom owns timer/dismiss behavior. |
| P1 | `tests/e2e/fixture-download.spec.ts`, `tests/e2e/fixtureHarness.ts` | Expand | Done | Added metadata failure, media failure, subtitle soft failure, and successful retry coverage. |
| P1 | `tests/e2e/fixture-download.spec.ts`, `tests/e2e/fixtureHarness.ts` | Expand | Done | Added paused-active restart persistence and resume-after-relaunch coverage. |
| P2 | `tests/browser/scenario-gallery.spec.ts` | Rename/narrow wording | Done | Scenario Workbench checks use screen/workbench wording and include the `bulk-stress` large bulk state. |
| P2 | `tests/integration/download-service.test.ts` | Narrow/harden | Done | DownloadService mock-mode/process-state coverage no longer waits on long wall-clock sleeps. |
| P2 | `tests/browser/queue-persistence.spec.ts` | Rename if retained | Done — not retained | The misleading persistence file was deleted rather than renamed. |
| P0 | `tests/unit/download-service-subs.test.ts` | Per-test prune/move | Pending | File-level owner is too broad. Keep only true DownloadService cross-phase/process regressions; move lower-layer parser/arg/phase cases and delete duplicates. |
| P0 | `tests/unit/yt-dlp-cookies.test.ts`, `tests/unit/yt-dlp-sponsorblock.test.ts`, `tests/unit/download-service-bot.test.ts` | Delete/move duplicate arg tests | Pending | Cookie, SponsorBlock, and bot retry arg behavior should be direct `YtDlp` / retry coverage, not tested through `DownloadService`. |
| P0 | `tests/renderer/wizard-subtitles.test.tsx`, `tests/renderer/wizard-sponsorblock.test.tsx` | Per-test prune/move | Pending | Delete duplicate pure step graph / restoration / stale start assertions; move missing FormatPicker and `nextStep` cases to owner suites. |
| P1 | `tests/browser/scenario-gallery.spec.ts`, `tests/browser/feedback-nudge.spec.ts`, `tests/browser/queue-drawer-workbench.spec.ts` | Per-test narrow | Pending | Browser-mock should own visual/workbench states, not component policy or fake workflow behavior. |
| P1 | `tests/unit/progress-ui.test.ts`, `tests/unit/queue-service-events.test.ts`, `tests/unit/queue-service-scheduler.test.ts` | Delete/move duplicates | Pending | Consolidate progress formatting and queue scheduler/event assertions under their canonical owners. |
| P1 | `tests/renderer/update-banner.test.tsx`, `tests/renderer/update-notification.test.tsx`, `tests/unit/ipc-handlers.test.ts`, `tests/unit/updater-handlers.test.ts`, `tests/unit/preload-contract.test.ts` | Per-test prune/move | Pending | Move pure update action policy to unit and delete duplicate/stale IPC/preload/updater rows. |
| P2 | `tests/renderer/preset-pipeline.test.ts`, `tests/renderer/restore-format-selection.test.ts`, `tests/renderer/splash-greeting.test.tsx` | Move pure tests to `tests/unit/` | Pending | These are pure/helper tests and do not need renderer/jsdom ownership. |

## File-level ownership appendix

This appendix is intentionally coarse. The deep per-test findings above override any broad "Keep" verdict below.

### Browser-mock Playwright

| File | Verdict | Action |
| --- | --- | --- |
| `tests/browser/feedback-nudge.spec.ts` | Narrowed | Keeps visual/screenshot coverage only; jsdom owns timer/dismiss behavior. |
| `tests/browser/queue-drawer-workbench.spec.ts` | Replacement added | Owns queue drawer visual/workbench state after deleting `queue-persistence.spec.ts`. |
| `tests/browser/scenario-gallery.spec.ts` | Kept/expanded | Keeps workbench scenario health and screenshots; includes `bulk-stress` large bulk state. |

### Electron E2E

| File | Verdict | Action |
| --- | --- | --- |
| `tests/e2e/cold-start.spec.ts` | Keep | Owns packaged cold-start and managed binary warmup. |
| `tests/e2e/fixture-download.spec.ts` | Expanded | Owns grouped product acceptance scenarios for bulk metadata/navigation, queue controls, retry/recovery, subtitle soft failure, and restart persistence. |
| `tests/e2e/fixtureHarness.ts` | Expanded support | Provides fixture delays/failures/telemetry needed by new scenarios. |
| `tests/e2e/smoke.spec.ts` | Keep | Owns shell, preload, context isolation, and basic interactivity. |
| `tests/e2e/startup-resilience.spec.ts` | Expanded | Seeded queue hydration now asserts drawer/card/status. |
| `tests/e2e/yt-dlp-plugins/` | Kept/expanded support | Plugin seam now supports local fixture metadata failures through the fixture server. |

### Integration

| File | Verdict | Action |
| --- | --- | --- |
| `tests/integration/download-service.test.ts` | Kept/hardened | Owns DownloadService mock-mode state with deterministic timer advancement instead of wall-clock sleeps. |
| `tests/integration/queue-lifecycle.test.ts` | Keep | Owns QueueService + QueueStore restart semantics with real persistence and fake downloads. |

### Renderer/jsdom

| File | Verdict | Action |
| --- | --- | --- |
| `tests/renderer/SmartDrawer.test.tsx` | Deleted after merge | The single assertion moved into `smart-drawer.test.tsx`. |
| `tests/renderer/app.test.tsx` | Kept/narrowed wording | Owns shell/App composition and local preload submission wiring; store/fixture tests own actual workflows. |
| `tests/renderer/feedback-nudge.test.tsx` | Keep | Owns feedback nudge behavior/timers. |
| `tests/renderer/footer-feedback.test.tsx` | Keep | Owns footer button IPC/clipboard behavior. |
| `tests/renderer/playlist-defects.test.tsx` | Keep | Owns playlist renderer regression and serialization rules. |
| `tests/renderer/playlist-presets-order.test.tsx` | Keep | Owns playlist preset UI ordering/default state. |
| `tests/renderer/playlist-probe-limit-selector.test.tsx` | Keep | Owns local playlist cap and bulk metadata display state. |
| `tests/renderer/playlist-regressions.test.tsx` | Keep | Owns renderer serialization/regression rules, including bulk queue item construction. |
| `tests/renderer/playlist-scope-control.test.tsx` | Keep | Owns scoped playlist reload UI state and inline errors. |
| `tests/renderer/preset-pipeline.test.ts` | Move/delete per test | Pure pipeline/helper tests belong under `tests/unit/`; two audio-only fallback rows are duplicates. |
| `tests/renderer/probe-orchestrator.test.tsx` | Kept | Owns store orchestration rules; do not expand into user acceptance. |
| `tests/renderer/queue-item-card.test.tsx` | Keep | Owns queue card visual states and button callbacks. |
| `tests/renderer/radio-option.test.tsx` | Keep | Owns reusable control behavior. |
| `tests/renderer/restore-format-selection.test.ts` | Move per file | Pure format/subtitle restoration helper coverage belongs under `tests/unit/`; delete duplicate rows noted above. |
| `tests/renderer/smart-drawer.test.tsx` | Kept/merged | Single SmartDrawer suite. |
| `tests/renderer/splash-greeting.test.tsx` | Move | Pure greeting gate belongs under `tests/unit/`. |
| `tests/renderer/splash-screen.test.tsx` | Keep | Owns splash overlay local behavior. |
| `tests/renderer/system-shell-actions.test.tsx` | Keep | Owns shell action error logging. |
| `tests/renderer/update-banner.test.tsx` | Keep/narrow | Owns component rendering and local copy/callback states; pure `resolveAction` policy should move to unit. |
| `tests/renderer/update-notification.test.tsx` | Keep/narrow | Owns renderer update event wiring; delete duplicate version/platform-policy rows. |
| `tests/renderer/wizard-audio-source.test.tsx` | Keep | Owns audio-only source propagation. |
| `tests/renderer/wizard-clipboard-autofill.test.tsx` | Keep | Owns clipboard watcher dialog and bulk dialog local state. Real paste acceptance belongs in fixture E2E. |
| `tests/renderer/wizard-cookies-config.test.tsx` | Keep | Owns cookies/settings guard UI. |
| `tests/renderer/wizard-format-select.test.tsx` | Keep | Owns format/audio selection interaction rules. |
| `tests/renderer/wizard-persist-scope.test.tsx` | Keep | Owns settings persistence scope. |
| `tests/renderer/wizard-sponsorblock.test.tsx` | Keep/prune per test | Owns SponsorBlock state, serialization, and local UI; duplicate `nextStep`, FormatPicker, and stale start assertions should move/delete. |
| `tests/renderer/wizard-subtitles.test.tsx` | Keep/prune per test | Owns subtitle state, serialization, and local UI; duplicate pure restoration/step graph/stale start assertions should delete. |

### Unit

| File group | Verdict | Action |
| --- | --- | --- |
| Queue rules: `queue-transition`, `queue-store`, `queue-service-events`, `queue-service-scheduler`, `QueueEventBridge` | Keep | Own closed queue rules and scheduler invariants. |
| Download/process rules: `download-service-*`, `video-phase`, `sidecar-subs-phase`, `subtitle-only-phase`, `phase-*`, `preflight-phase`, `job-lifecycle` | Keep/prune per test | Own process supervision, phase outcomes, cleanup, cancellation, ENOSPC, bot-block, and subtitle behavior. Large mixed suites should defer arg/parser/phase selection rows to canonical owners. |
| yt-dlp rules: `ytdlp-args`, `ytdlp-args-paths`, `yt-dlp-args-matrix`, `ytdlp-playlist-args`, `yt-dlp-cookies`, `yt-dlp-sponsorblock`, `ytdlp-retry`, `extractor-predicates`, `probe-service*` | Keep/prune per test | Own argument construction, retry ladder, probe parsing, and extractor classification. Cookie/SponsorBlock tests currently routed through `DownloadService` should move/delete. |
| Parsing/data rules: `bulk-urls`, `clean-url`, `schemas`, `prepare-job`, `sanitize-job-options`, `format-map`, `quality-sorter`, `resolve-container`, `output-template`, `subfolder`, `progress*`, `subtitle-*`, `vtt-dedupe`, `srt-dedupe`, `cue-dedupe`, `playlist-*` | Keep | Own deterministic pure transformations. |
| App platform rules: `binary-manager*`, `warmup-service`, `e2e-harness`, `ipc-handlers`, `preload-*`, `renderer-bootstrap`, `window-lifecycle`, `tray-manager`, `updater-handlers`, `install-channel*`, `shell-open-external`, `shutdown`, `electron-vite-config`, `before-build-arch`, `release-asset-names` | Keep | Own platform, startup, preload, updater, packaging, and lifecycle decisions. |
| UI/workbench helpers: `browser-mock-knobs`, `browser-mock-scenarios`, `progress-ui`, `format-selection-view`, `next-step`, `step-navigation` | Keep/prune per test | Own local navigation/workbench/helper rules. `progress-ui` and traversal rows in `step-navigation` need consolidation into canonical suites. |
| Analytics/i18n/settings: `analytics-*`, `i18n*`, `settings-store`, `failure-code-stability`, `bulk-logger`, `cookies-resolver`, `token-service`, `utils` | Keep | Own contracts and non-workflow support behavior. |
| `tests/unit/error-classification.test.ts` | Kept/merged | Single `classifyYtDlpFailure` suite, including injected `DiskProbe` cases. |
| `tests/unit/errorClassification.test.ts` | Deleted after merge | Duplicate casing file removed. |

### Shared test support

| File group | Verdict | Action |
| --- | --- | --- |
| `tests/__mocks__/`, `tests/shared/`, `tests/setup.ts`, `tests/vitest-jest-dom.d.ts` | Keep | Shared harness/support files, not acceptance tests. |
| `tests/fixtures/subtitles/` | Keep | Golden subtitle fixtures for parser/dedupe tests. |

## Acceptance criteria for the refactor phase

- After each deletion or narrowing, the owning higher- or lower-layer test must already exist and pass.
- Browser-mock specs must not walk a fake download solely to claim product completion.
- Fixture Product E2E scenarios must assert visible UI milestones, final queue state, filesystem outputs, and deny-proxy logs.
- Unit and renderer tests must remain for pure rules and local state even when an E2E scenario covers the broader workflow.
- `rtk bun run check` must pass after every refactor slice.
