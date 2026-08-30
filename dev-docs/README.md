# dev-docs/

Internal engineering docs — feature designs, architecture notes, system maps.

**Not** to be confused with:

- `readme-src/` — README source-of-truth (English + 20 locales).
- `CLAUDE.md` / `AGENTS.md` — agent operating notes (tracked, but keep detail here and link out).

Public landing site (`arroxy.orionus.dev`) lives in a separate repo: [`antonio-orionus/arroxy-web`](https://github.com/antonio-orionus/arroxy-web). Don't put landing content here.

## Convention

- One Markdown file per feature/topic. Kebab-case filename: `share-feature.md`, `release-pipeline.md`.
- Begin each doc with a "lives in" file table that lists the source paths the doc references. Makes refactor-driven rot easy to spot.
- Treat these as living documents — when shipping a refactor that touches a file mentioned here, update the doc in the same PR.
- For one-off design specs that won't outlive the work, prefer `docs/superpowers/specs/YYYY-MM-DD-*.md` (planning skill default) so they don't pile up here.

## Index

- [ci-cd-strategy.md](ci-cd-strategy.md) — Single source of truth for CI/CD: every workflow with trigger and ownership, the startup-verification tiers, and `main`'s branch-protection contract.
- [in-app-browser-spec.md](in-app-browser-spec.md) — Explore tab: embedded browser with YouTube sign-in, session cookies handed to yt-dlp. Covers the non-negotiable user-agent rule, cookie handoff, rollout behind a flag with Legacy frozen, and the untested cross-platform matrix.
- [dependabot-triage.md](dependabot-triage.md) — Algorithm for handling Dependabot PRs. Decision tree, light vs deep review steps, local Claude Code only (no API billing), comment cheatsheet.
- [custom-quick-presets-spec.md](custom-quick-presets-spec.md) — Quick presets design spec.
- [release-runbook.md](release-runbook.md) — Manual maintainer checklist for beta validation and stable tagging, both cut from `main`.
- [runtime-binaries.md](runtime-binaries.md) — Signed runtime-binary manifest model for yt-dlp nightly/stable selection, immutable artifact validation, local dev commands, and runtime fallback order.
- [share-feature.md](share-feature.md) — Share button + periodic prompts + telemetry. Covers the dialog, all 5 manual entry points, the time/milestone triggers, persisted settings, and i18n.
- [startup-performance.md](startup-performance.md) — Why startup takes as long as it does. Warm vs cold measurements, the ~15s PyInstaller/security-scan probe and why it recurs on every yt-dlp bump, what 0.4.8 changed, how to read the warmup log lines, and how to reproduce any of it.
- [test-ownership-audit.md](test-ownership-audit.md) — Risk-owned test strategy audit. Maps current tests to the right layer and lists duplicate acceptance coverage to refactor.
- [tooling-contract.md](tooling-contract.md) — The root-owned tooling contract behind `bun run check` (format, lint, typecheck, knip, madge, package gates). Do not add package-local formatter/linter configs.
- [tooling-migration-audit.md](tooling-migration-audit.md) — Tailwind, ESLint, Prettier, Biome, and Oxlint audit. Includes measured Biome coverage loss and replacement options for lost rules.
