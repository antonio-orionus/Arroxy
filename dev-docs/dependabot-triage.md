# Dependabot Triage Algorithm

Procedure for handling a Dependabot PR. No API-billed AI review — local Claude Code only.

## Lives in

| Path | Role |
|---|---|
| `.github/dependabot.yml` | Schedule, groups, 2-day cooldown |
| `.github/workflows/ci.yml` | Lint, types, knip, madge, LOC, pin guard, tests |
| `.github/workflows/deps-vuln-gate.yml` | Vulnerability gate on any PR touching `package.json`/`bun.lock` |
| `bunfig.toml` | `minimumReleaseAge = 604800` (7d) local install floor |
| `package.json` | All deps exact-pinned (no `^`/`~`) |
| `scripts/check-dependency-pins.mjs` | Enforces pin discipline |
| `scripts/depsVuln.ts` | Vulnerability gate: fails on production advisories ≥high, lists tooling-only ones without failing |
| `scripts/deps-vuln-accepted.json` | Reasoned, expiring exceptions for advisories with no usable fix yet |
| `scripts/check-ts-max-loc.mjs` | Hard cap 800 LOC per TS file |

## Cadence

- **Version updates: weekly, Monday.** Two grouped PRs each Monday: `production` and `development` (minor + patch). Major bumps open as individual PRs same day.
- **Security advisories: immediate.** Dependabot's security-update feature ignores the weekly schedule and opens PRs as soon as a fix publishes for a known CVE affecting your tree. These are the only "critical" PRs that interrupt the weekly cadence.
- 7-day cooldown — Dependabot waits 7 days after publish before opening a version PR. Matches `bunfig.toml` `minimumReleaseAge = 604800` so CI's `bun install --frozen-lockfile` accepts the bot's chosen versions instead of blocking them as too-young. Security PRs override cooldown.
- Net effect: routine bumps land in a single Monday batch review. Security work interrupts only when an actual advisory is fixed upstream.

## Decision tree per PR

```
PR open
  │
  ├─ CI red? ────────────► Close PR. Comment why. Wait for next bump.
  │                       Reasons CI goes red:
  │                         - typecheck fail (TS types drifted)
  │                         - test fail (behavior change)
  │                         - knip dead-export (rare on dep bumps)
  │                         - madge cycle (rare on dep bumps)
  │                         - check:pins (bot snuck a range — shouldn't happen)
  │                         - check:loc (unrelated)
  │                         - deps-vuln-gate (bump kept/introduced ≥high CVE)
  │
  ├─ CI green + patch/minor + grouped ──► Local review (light).
  │                                       Merge if no surprises.
  │
  ├─ CI green + major ──► Local review (deep). Read CHANGELOG.
  │                       Build dist + manual smoke. Merge or hold.
  │
  └─ CI green + security advisory closed ──► Same as major. Read advisory.
                                              Merge same day if low-risk.
```

## Light review (patch/minor grouped PR)

```bash
gh pr checkout <num>           # check out bot's branch locally
bun install --frozen-lockfile  # match bot's lockfile
claude                          # spawn local Claude Code (subscription only)
> /review                       # quick diff review, no API cost
> # or, terser:
> read the diff vs main. for each bumped package, name any risk you see.
```

Then run sanity locally:

```bash
bun run check                  # lint + types + knip + madge + loc + pins + tests
bun run dev                    # smoke the app once
```

Merge if green + nothing surprising.

## Deep review (major bump or security PR)

Steps in order:

1. `gh pr checkout <num>`
2. `bun install --frozen-lockfile`
3. Read the package CHANGELOG for the bumped dep. Web fetch directly:
   - npm: `https://www.npmjs.com/package/<name>?activeTab=versions`
   - GitHub: `https://github.com/<owner>/<repo>/releases`
4. In `claude`:
   ```
   > read CHANGELOG / release notes for <package> from <vOLD> to <vNEW>.
   > grep my codebase for usages of <package>. flag any that touch APIs
   > changed in the release notes.
   ```
5. `bun run check` — must pass.
6. `bun run dev` — manual smoke. Test the feature surfaces that import the bumped package.
7. For build-tooling deps (electron, electron-builder, vite, tailwindcss, typescript):
   - `bun run dist:linux:dir` (fast local pack)
   - Launch the packed app from `dist/linux-unpacked/`
   - Confirm app boots, basic flow works.
8. Merge.

## Security PR (advisory-driven, e.g. fast-uri)

Dependabot opens these tagged with the GHSA ID. Treat as deep review **plus**:

1. Read the advisory text. Confirm the vulnerable code path exists in your usage (often the vuln is in a sub-API you don't call).
2. If you don't call the vulnerable path, you can still merge for hygiene — no urgency.
3. If you do call it, prioritize merge over feature work.
4. `bun run deps:vuln` post-merge to confirm the advisory drops out of the audit.

## What the vulnerability gate blocks

`bun run deps:vuln` audits the **production** tree (`bun audit --prod`), which is what the packaged app ships, and fails on advisories at or above `high`. Findings that exist only in build and test tooling are printed as a count per package but never fail the gate. A gate that is permanently red over tooling gets ignored, which is how a CLI's whole dependency tree once shipped inside the app unnoticed.

- **Keep the production tree honest.** A package the app does not load at runtime belongs in `devDependencies`. electron-builder packs every production dependency and its transitive tree into `app.asar` whether or not the code imports it. After moving or adding a dependency, check the packed archive: `bun run dist:mac:arm64:dir`, then `bunx @electron/asar list dist/mac-arm64/Arroxy.app/Contents/Resources/app.asar`.
- **Accepting an advisory.** Only when no fixed version can be installed yet, for example because it is inside the 7-day release-age window, or when the vulnerable code path is provably unreachable. Add an entry to `scripts/deps-vuln-accepted.json` with the GHSA id, package, a reason, and an `expires` date. An entry stops accepting on its expiry date and the gate fails again. An entry that no longer matches anything is reported so it gets removed.
- **Tooling-only findings** are still worth clearing when a parent bump or a safe override allows it. They are tracked, not enforced.

## Overrides go stale

`package.json` `overrides` pin transitive packages to exact versions, usually to land a security fix before a parent releases. **Dependabot never bumps an override.** Each pin sits at whatever was latest when it was written and becomes the vulnerable version once a newer advisory lands. When the gate flags a package that appears in `overrides`, bump the pin to the newest patched version in the same major line that is at least 7 days old, then run `bun install` and confirm only that package changed in `bun.lock`.

Do not delete lockfile entries to force a re-resolve. With this repo's isolated linker it re-resolves a large part of the tree and produces unrelated lockfile churn.

## Tricky cases

- **Lockfile-only PR.** Bot bumps a transitive that isn't in `package.json`. CI passes, no behavior change expected, but malware vector. Treat as light review. `bun pm why <pkg>` to see who pulled it in.
- **Peer-dep mismatch.** Bot bumps `react` but not `react-dom` (or vice versa). Install will warn. Hold PR, ask Dependabot to retry once the matching bump publishes, or merge both manually via `gh pr merge --rebase` after pairing.
- **Native binding bump.** electron, sqlite, better-sqlite3, sharp. Always smoke the packed build, not just dev mode.
- **electron-builder patch.** Always run `bun run dist:linux:dir` and at least eyeball the NSIS config diff for Windows.
- **Bot can't fix a vuln.** Sometimes the upstream package has no patched version yet. Comment `@dependabot ignore this minor version` on the PR; revisit weekly.

## Comments to use on Dependabot PRs

```
@dependabot rebase         # bot re-bases on main
@dependabot recreate       # bot regenerates the PR from scratch (fresh resolution)
@dependabot merge          # bot merges (CI green required)
@dependabot squash and merge
@dependabot ignore this dependency       # never bump this package
@dependabot ignore this major version    # ignore only this major
@dependabot ignore this minor version    # ignore only this minor (use for unfixed CVEs)
@dependabot reopen         # reopens a closed PR
@dependabot close          # closes the PR
```

## When NOT to merge

- CI red.
- CHANGELOG mentions breaking change AND your code uses that surface.
- Major bump of electron, react, typescript, tailwind without doing the deep review steps.
- Build-tooling bump that you can't smoke-test the packed app for.
- Advisory PR where the bot couldn't actually fix the vuln (read PR body — sometimes Dependabot opens "no fix available" PRs as notices).

## What this avoids

- Auto-merge of bot PRs (no `dependabot[bot]` in `CODEOWNERS`, no auto-merge workflow). Every dep change is human-reviewed.
- Paid AI review services. All review is local Claude Code on subscription.
- Surprise upgrades — exact pins + lockfile commits mean `bun install` on a fresh clone gets the byte-for-byte same tree until you merge a Dependabot PR.
