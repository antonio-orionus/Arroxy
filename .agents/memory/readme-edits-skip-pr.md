---
name: readme-edits-skip-pr
description: Docs-only changes (README, dev-docs, AGENTS.md, GLOSSARY, ADRs, memory) go straight to main — no branch PR, no CodeRabbit.
metadata:
  type: feedback
---

A docs-only change is committed and pushed straight to `main`. That covers README sources and the regenerated `README.md` and `docs/readme/`, `dev-docs/`, `AGENTS.md`/`CLAUDE.md`, `GLOSSARY.md`, `DESIGN.md`, `PRODUCT.md`, `CONTRIBUTING.md`, `docs/adr/` and `.agents/memory/`. Antonio: "for readme dont need a pr, too small to bother" (2026-10-11, after a README trim was opened as PR #249), extended 2026-10-17 to all docs: "No pr push to main. Docs dont worth a pr".

**Why:** a docs edit doesn't need CodeRabbit or a 20-minute CI round, and docs ship from GitHub, not with the app.

**How to apply:** still run `bun run check` (the README build enforces locale key parity; the tooling contract scans tracked docs) and the no-attribution greps, then push to `main`. Code, scripts, workflows and config still go through a PR per [[finish-before-pr]] and the `land` flow. If a release tag is waiting on `main`'s required checks, tag first: a new commit on `main` restarts that wait.
