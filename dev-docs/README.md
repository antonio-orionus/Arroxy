# dev-docs/

Internal engineering docs — feature designs, architecture notes, system maps.

**Not** to be confused with:

- `readme-src/` — README source-of-truth (English + 20 locales).
- `CLAUDE.md` / `AGENTS.md` — agent-only operating notes (gitignored).

Public landing site (`arroxy.orionus.dev`) lives in a separate repo: [`antonio-orionus/arroxy-web`](https://github.com/antonio-orionus/arroxy-web). Don't put landing content here.

## Convention

- One Markdown file per feature/topic. Kebab-case filename: `share-feature.md`, `release-pipeline.md`.
- Begin each doc with a "lives in" file table that lists the source paths the doc references. Makes refactor-driven rot easy to spot.
- Treat these as living documents — when shipping a refactor that touches a file mentioned here, update the doc in the same PR.
- For one-off design specs that won't outlive the work, prefer `docs/superpowers/specs/YYYY-MM-DD-*.md` (planning skill default) so they don't pile up here.

## Index

- [dependabot-triage.md](dependabot-triage.md) — Algorithm for handling Dependabot PRs. Decision tree, light vs deep review steps, local Claude Code only (no API billing), comment cheatsheet.
- [release-runbook.md](release-runbook.md) — Manual maintainer checklist for beta validation and stable tagging, both cut from `main`.
- [share-feature.md](share-feature.md) — Share button + periodic prompts + telemetry. Covers the dialog, all 5 manual entry points, the time/milestone triggers, persisted settings, and i18n.
- [test-ownership-audit.md](test-ownership-audit.md) — Risk-owned test strategy audit. Maps current tests to the right layer and lists duplicate acceptance coverage to refactor.
- [tooling-migration-audit.md](tooling-migration-audit.md) — Tailwind, ESLint, Prettier, Biome, and Oxlint audit. Includes measured Biome coverage loss and replacement options for lost rules.
