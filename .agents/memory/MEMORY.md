# Project memory index

## How Antonio wants work done

- [Finish before PR](finish-before-pr.md) — close every related follow-up (tests, locales, README, CHANGELOG) before proposing a PR.
- [Ship means merge, not release](ship-means-merge-not-release.md) — "ship"/"land" stops at the merge; release only on an explicit "release", stable only, never a beta; never ask or offer to release.
- [Orchestrator session](orchestrator-session.md) — when told to orchestrate: dispatch one session per fix, verify findings first, own the `.internal/` backlogs, unblock without asking, flag patch clusters.
- [CodeRabbit review workflow](coderabbit-review-workflow.md) — 2 reviews/hour shared and adaptive, auto reviews off: trigger behaviour PRs once on a final head after CI is green, one retry at most, never push mid-review.
- [Review learnings](review-learnings.md) — rules the dual review injects into every reviewer; add one when a refuted finding would recur.
- [No AI attribution](no-ai-attribution.md) — never add Co-Authored-By or "Generated with" lines to commits or PRs.
- [Docs edits skip the PR](readme-edits-skip-pr.md) — docs-only changes (README, dev-docs, AGENTS.md, ADRs, memory) go straight to main after `bun run check`.
- [Approve design before tests](approve-design-before-tests.md) — during UI redesigns, iterate on mocks and screenshots; tests only after the design is approved.
- [Translate at the final stage](translate-at-final-stage.md) — en only during development (`check:i18n` red is accepted); translate once, right before the PR.
- [LOC limits are architecture signals](loc-limits-are-architecture-signals.md) — never raise the LOC cap to land a change; extract a cohesive concern instead.
- [Changelog stays laconic](changelog-laconic.md) — one or two user-facing sentences per entry, no internals, no exact sizes.

## Releases and packaging

- [Winget PR copies the merged manifest](winget-pr-copies-merged-manifest.md) — fix licence, descriptions and tags in each release's Winget PR until a corrected manifest merges; quote values with ": ".
- [Dependabot never bumps overrides](dependabot-never-bumps-overrides.md) — stale `overrides` pins become the vulnerable versions; app.asar ships no node_modules.
- [macOS Gatekeeper quarantine](macos-gatekeeper-quarantine.md) — builds are ad-hoc signed ("could not verify", not "damaged"); the cask strips quarantine in `postflight_steps`.

## Test machines and environment

- [Windows VM testing](windows-vm-testing.md) — ssh into the Win11 ARM64 VM for `dist:win:dir` + `verify:startup`; bash on PATH, x64-only assets, node not bun.
- [Linux VM testing](linux-vm-testing.md) — Ubuntu ARM64 guest for Linux/Electron/GPU checks; `scripts/vm/ubu-*` launch over ssh; never log the session out.
- [Inherited ELECTRON_RUN_AS_NODE](electron-run-as-node-leak.md) — agent shells can carry it; hand-launched Electron then fails on `BrowserWindow`. Strip it.
- [macOS 26 Electron Audio Service](macos-26-electron-audio-service.md) — Electron 42 can crash-loop `audio.mojom.AudioService`; disabled out of process on Darwin 25+.
- [Linux theme portal race](linux-theme-portal-race.md) — wrong theme on first Linux launch is unexplained; read `theme:startup` logs, never repro by stopping the portal.

## Code gotchas

- [TypeScript & oxlint boundary gates](typescript-and-oxlint-boundary-gates.md) — `"types": []` does not block explicit electron imports; oxlint globs need `**`.
- [Renderer test & UI API gotchas](renderer-test-and-ui-api-gotchas.md) — base-nova takes a `render` prop, never `asChild`; no user-event, use `fireEvent`.
- [shadcn CLI writes a bogus cn import](shadcn-cli-cn-import.md) — `shadcn add` imports from "cn" and installs an unrelated package; revert deps, fix the import.
- [Download workflow map](download-workflow-map.md) — read `dev-docs/download-workflows.md` before changing how downloads start; update it with the change.
- [Probe source fixtures](probe-source-fixtures.md) — real probes of many sites as snapshots and "Real sites" scenarios; check Format-screen changes against them.
- [yt-dlp stdout corrupts scraped paths](ytdlp-stdout-drops-non-ascii.md) — four silent ENOENT failure modes; the media path now comes from `--print-to-file`.
- [YouTube auto-caption -orig tracks](youtube-auto-caption-orig-tracks.md) — bare+`-orig` ASR twins are identical, tlang translations are flaky; subtitle 429 ≠ IP block.
- [macOS ffmpeg cannot verify HTTPS](macos-ffmpeg-cannot-verify-https.md) — fixed via SSL_CERT_FILE; fixture E2E is HTTP-only, so live-smoke URL-opening ffmpeg changes.

## Visual design

- [Glow intensity policy](glow-intensity-policy.md) — home keeps the branded glow; dense screens (settings, dialogs, logs, queue) stay calm.
- [Backdrop WebGL scenes](backdrop-webgl-scenes.md) — WebGL dark aurora and light ocean scenes; without WebGL the CSS gradients take over (no Canvas2D).
