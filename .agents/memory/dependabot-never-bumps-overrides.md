---
name: dependabot-never-bumps-overrides
description: package.json overrides pin transitive deps exactly and Dependabot never bumps them, so they go stale into the vulnerable version; also, electron-builder packs every production dependency tree into app.asar.
metadata:
  type: project
---

Two things that made the vulnerability gate look unfixable (found 2026-10-08).

**Override pins go stale.** `package.json` `overrides` hold exact versions for transitive packages (`js-yaml`, `fast-uri`, `brace-expansion`, `undici` and others). Dependabot does not touch them, so each one sat at "latest at the time" and became the vulnerable version when a later advisory landed. When `bun run deps:vuln` flags a package that is in `overrides`, bump the pin to the newest patched version in the same major line that is at least 7 days old (`bunfig.toml` `minimumReleaseAge`).

**Do not delete `bun.lock` entries to force a re-resolve.** With the isolated linker it re-resolved ~220 packages and even downgraded `eslint` 10 to 9. Edit `package.json` and run `bun install`; confirm only the intended packages changed.

**`dependencies` ships.** electron-builder packs the whole production tree into `app.asar` even if nothing imports it. `shadcn` (a CLI used only for a CSS import) sat in `dependencies` from April to October and dragged express, the MCP SDK, undici, ts-morph and more into every release: 140 MB / 20k files, 80 MB / 11k files after moving it to `devDependencies`. Check with `bunx @electron/asar list` on a `dist:*:dir` build.

**Why:** the old gate audited prod and dev together, stayed red on tooling noise, and everyone stopped reading it. It now blocks only on the production tree.

**How to apply:** see `dev-docs/dependabot-triage.md` ("What the vulnerability gate blocks", "Overrides go stale") and `scripts/deps-vuln-accepted.json` for expiring exceptions.

Related: [[youtube-auto-caption-orig-tracks]].
