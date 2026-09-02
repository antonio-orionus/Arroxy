# Project memory index

- [Glow intensity policy](glow-intensity-policy.md) — home keeps the branded glow vocabulary; dense screens (settings/dialogs/logs/queue) stay calm.
- [Backdrop WebGL scenes](backdrop-webgl-scenes.md) — the app background is a scene-selected WebGL backdrop: dark aurora and light ocean, with Canvas2D fallback before CSS.
- [macOS 26 Electron Audio Service](macos-26-electron-audio-service.md) — Electron 42 can crash-loop `audio.mojom.AudioService`; disable out-of-process Audio Service on Darwin 25+.
- [Finish before PR](finish-before-pr.md) — close every related follow-up (tests, locales, README, CHANGELOG) before proposing a PR.
- [No AI attribution](no-ai-attribution.md) — never add Co-Authored-By or "Generated with" lines to commits or PRs.
- [LOC limits are architecture signals](loc-limits-are-architecture-signals.md) — never raise the LOC cap to land a change; extract a cohesive concern instead.
- [CodeRabbit review workflow](coderabbit-review-workflow.md) — trigger `@coderabbitai review` once per PR at open and never again; the quota is limited and refusals are silent.
- [Renderer test & UI API gotchas](renderer-test-and-ui-api-gotchas.md) — base-nova takes a `render` prop, never Radix `asChild`; `@testing-library/user-event` is not installed, use `fireEvent`.
- [Donation rails are crypto-only](donation-rails-are-crypto-only.md) — Ukraine residency rules out GitHub Sponsors/Ko-fi/BMAC; never suggest a fiat option.
- [TypeScript & oxlint boundary gates](typescript-and-oxlint-boundary-gates.md) — `"types": []` does not block explicit electron imports; oxlint restricted-import globs need `**`.
- [Windows VM testing](windows-vm-testing.md) — ssh into the local Win11 ARM64 VM to run `dist:win:dir` + `verify:startup` directly; gotchas: bash on PATH, x64-only inherited asset, node-not-bun for `_electron.launch`.
- [Linux VM testing](linux-vm-testing.md) — use the private Ubuntu VMware guest for Linux/Electron/runtime and GPU-specific checks; keep connection details outside the repository.
