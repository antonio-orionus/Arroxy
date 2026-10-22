# Project memory index

## Rules for changes

- [Review learnings](review-learnings.md) — rules the dual review injects into every reviewer and CodeRabbit reads as a guideline; add one when a refuted finding would recur.
- [LOC limits are architecture signals](loc-limits-are-architecture-signals.md) — never raise the LOC cap to land a change; extract a cohesive concern instead.
- [Changelog stays laconic](changelog-laconic.md) — one or two user-facing sentences per fragment or entry, no internals, no exact sizes.

## Releases and packaging

- [Dependabot never bumps overrides](dependabot-never-bumps-overrides.md) — stale `overrides` pins become the vulnerable versions; app.asar ships no node_modules.
- [macOS Gatekeeper quarantine](macos-gatekeeper-quarantine.md) — builds are ad-hoc signed ("could not verify", not "damaged"); the cask strips quarantine in `postflight_steps`.

## Test machines and environment

- [Windows VM testing](windows-vm-testing.md) — ssh into the Win11 ARM64 VM for `dist:win:dir` + `verify:startup`; bash on PATH, x64-only assets, node not bun.
- [Live YouTube request budget](live-youtube-request-budget.md) — ~40 fresh-profile loads in an hour got Antonio's IP a 429 captcha; a handful of loads, one persistent profile, stop at the first captcha.
- [Linux VM testing](linux-vm-testing.md) — Ubuntu ARM64 guest for Linux/Electron/GPU checks; `scripts/vm/ubu-*` launch over ssh; never log the session out.
- [Inherited ELECTRON_RUN_AS_NODE](electron-run-as-node-leak.md) — agent shells can carry it; hand-launched Electron then fails on `BrowserWindow`. Strip it.
- [macOS 26 Electron Audio Service](macos-26-electron-audio-service.md) — Electron (seen on 42) can crash-loop `audio.mojom.AudioService`; disabled out of process on Darwin 25+.
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
