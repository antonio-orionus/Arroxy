# dev-docs/

Internal engineering docs — feature designs, architecture notes, system maps.

**Not** to be confused with:

- `readme-src/` — README source of truth (English plus every supported locale; see [readme-pipeline.md](readme-pipeline.md)).
- `AGENTS.md` (with `CLAUDE.md` as a symlink) — agent operating notes (tracked, but keep detail here and link out).

Public landing site (`orionus.dev/arroxy/`) lives in a separate repo: [`antonio-orionus/arroxy-web`](https://github.com/antonio-orionus/arroxy-web). Don't put landing content here.

## Convention

- One Markdown file per feature/topic. Kebab-case filename: `share-feature.md`, `release-pipeline.md`.
- Begin each doc with a "lives in" file table that lists the source paths the doc references. Makes refactor-driven rot easy to spot.
- Treat these as living documents — when shipping a refactor that touches a file mentioned here, update the doc in the same PR.
- For one-off design specs and implementation plans that won't outlive the work, prefer `docs/superpowers/specs/YYYY-MM-DD-*.md` and `docs/superpowers/plans/YYYY-MM-DD-*.md` (planning skill defaults) so they don't pile up here. **`docs/superpowers/` is gitignored** — those files exist only in the checkout that wrote them. Any agent on the same machine can read them by path; to hand a plan across machines, put its essentials in the PR description or issue. Anything that must outlive the work belongs here or in an ADR instead.

## Index

- [agent-setup.md](agent-setup.md) — Tool-neutral agent config: shared `.agents/` sources, `bun run agents:sync` adapters for Claude Code / Codex / OpenCode, and per-tool plugin installs (Superpowers, CodeGraph hook).
- [binary-distribution.md](binary-distribution.md) — Embedded ffmpeg/ffprobe vs runtime yt-dlp (strategy table), the Electron-as-Node rule, how the embed is fetched, verified, packed and located at runtime, license attribution, and the upstream-source smoke scripts.
- [ci-cd-strategy.md](ci-cd-strategy.md) — Single source of truth for CI/CD: every workflow with trigger and ownership, the startup-verification tiers, and `main`'s branch-protection contract.
- [dependabot-triage.md](dependabot-triage.md) — Algorithm for handling Dependabot PRs. Decision tree, light vs deep review steps, local Claude Code only (no API billing), comment cheatsheet.
- [download-workflows.md](download-workflows.md) — Map of every path that ends in the download queue (URL tab, wizard modes and steps, Quick Download, bulk, hotkey, Explore, attention rows, retry, restore), the five settings sources, where profiles and wizard selections become job options and where they duplicate, bridge options the app can't reach yet, and where the single flow is heading. Read before changing a workflow.
- [download-smoke.md](download-smoke.md) — Headless download smoke: runs the production download request for one YouTube link with one input varied (cookies, proxy, profile, player clients), stops at format selection, and reports why a quality was picked. Includes the Windows matrix script.
- [dual-deploy-plan.md](dual-deploy-plan.md) — Program-level plan for shipping Arroxy in two distribution modes: settled core/shell decisions, the port cut list (§5), and the tranche map.
- [explore-memory.md](explore-memory.md) — Explore idle unload: which pages are released after the tab is left and how they come back, what a restore keeps and loses, and native macOS/Windows memory measurements (hidden vs closed, the lingering renderer, reopen cost).
- [fixture-e2e.md](fixture-e2e.md) — Which test layer owns a behavior and how to choose it, then how to write Fixture Product E2E scenarios: risk groups, what each scenario declares, milestones and oracles, anti-patterns.
- [flatpak-repo.md](flatpak-repo.md) — Arroxy's own Flatpak repo on GitHub Pages: how releases sign and publish it, the bundle that carries it, the signing key (never rotate casually), and how the banner and `flatpak update` use it.
- [heartbeat.md](heartbeat.md) — Anonymous daily heartbeat to a self-hosted Counterscale on Cloudflare: what is sent, how app fields map onto the dashboard, deploy steps, and the local end-to-end test.
- [in-app-browser-spec.md](in-app-browser-spec.md) — Explore tab: embedded browser with YouTube sign-in whose session cookies yt-dlp uses only when a job needs an account. Covers the non-negotiable user-agent rule, per-spawn cookie handoff, the measured cross-platform sign-in matrix and cookie-freshness results, and design decisions D1–D6 (on-demand escalation, inline sign-in, on-by-default rollout, `explore` cookie mode, site-adapter seam). Research record: [`youtube-auth-research.md`](youtube-auth-research.md).
- [in-app-updates.md](in-app-updates.md) — Update banner: the launch and periodic checks, the per-install-channel action table, IPC and types, and how Flatpak and tar.gz installs get past electron-updater's AppImage gate.
- [interactive-download.md](interactive-download.md) — Decided spec for single-video Interactive Download: two screens (Format, Review) pre-selected from the active profile, presets retired, "part of video" clips, the must-keep regression checklist, tests and the two-PR delivery.
- [linux-vm-testing.md](linux-vm-testing.md) — Scripted Linux packaging checks on the Ubuntu ARM64 VM: one-command AppImage in-app update test (loopback-only `ARROXY_UPDATE_FEED_URL`), arm64 Flatpak build from the release manifest, and window identity (`app_id` / `StartupWMClass`) measurement.
- [readme-pipeline.md](readme-pipeline.md) — How the public READMEs are generated from `readme-src/`: per-locale sources, the date stamp and key-parity build, adding a feature line, canonical locale lists, and regenerating the screenshots.
- [release-pipeline.md](release-pipeline.md) — What a pushed tag runs: job graph, Windows hand-off, immutable releases, secrets, Winget, external repos, shipped assets, pre-releases and NSIS pinning.
- [release-runbook.md](release-runbook.md) — Manual maintainer checklist for beta validation and stable tagging, both cut from `main`.
- [runtime-binaries.md](runtime-binaries.md) — Signed runtime-binary manifest model for yt-dlp nightly/stable selection, immutable artifact validation, local dev commands, and runtime fallback order.
- [section-download.md](section-download.md) — Trim/section-download research, scheduled as "part of video" in interactive-download.md. Preserves the omniget + yt-dlp research (mechanism, validation gaps, scope rules, bridge `downloadSections` integration, v1 slice) so it can be built without re-deriving it.
- [share-feature.md](share-feature.md) — Share button + periodic prompts. Covers the dialog, all 5 manual entry points, the milestone trigger, persisted settings, and i18n.
- [source-priority.md](source-priority.md) — Decided spec for how a download profile picks streams: one owned selection order behind yt-dlp's sort, the Interactive pick and the UI ladder; Best picture vs Smart TV goals; a lossless file type choice; native audio as global + profile override; rival research and the three-PR delivery.
- [startup-performance.md](startup-performance.md) — Why startup takes as long as it does. Warm vs cold measurements, the ~15s PyInstaller/security-scan probe and why it recurs on every yt-dlp bump, what 0.4.8 changed, how to read the warmup log lines, and how to reproduce any of it.
- [startup-verification.md](startup-verification.md) — Startup-verification program: current tier status, the nine design decisions and their rationale, open defects, and incidents.
- [tooling-contract.md](tooling-contract.md) — The root-owned tooling contract behind `bun run check` (`vp check`, tests, knip, package gates). Do not add package-local formatter/linter configs.
- [visual-debugging.md](visual-debugging.md) — browser-mock and Electron CDP inspection, agent-browser and Playwright recipes, locale simulation, and the GPU/backdrop fallback model.
