# CI/CD strategy

| Lives in          |                                               |
| ----------------- | --------------------------------------------- |
| Workflows         | `.github/workflows/*.yml`                     |
| Release wrapper   | `scripts/release.sh`                          |
| Branch protection | GitHub repo settings → `main` required checks |

**Governing principle:** a job that did not observe the app reach its expected end state must not be able to report success.

## Workflow inventory

| Workflow                             | File                           | Trigger                                 | Owns                                                                                                             |
| ------------------------------------ | ------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| CI                                   | `ci.yml`                       | push (all branches, `v*` ignored) + PRs | `check` gate, windows tests                                                                                      |
| Dev Smoke                            | `dev-smoke.yml`                | PR/push `main` + dispatch               | packaged-app boot smoke (`MOCK_BACKEND`), preload/context isolation                                              |
| E2E Cold Start                       | `e2e-cold-start.yml`           | PR/push `main` + dispatch               | **PR-tier startup verification** (journey harness) + packaged runtime smoke; Linux only                          |
| E2E Fixtures                         | `e2e-fixtures.yml`             | PR/push `main` + dispatch               | fixture product E2E — acceptance for real user workflows                                                         |
| Windows Installer                    | `installer-smoke.yml`          | PR/push `main`, `v*` tags + dispatch    | Windows installer build, cold-state install, install/uninstall cycle; builds the release's Windows artifacts     |
| Flatpak Bundle                       | `flatpak.yml`                  | PR/push + dispatch                      | Flatpak build validation                                                                                         |
| Deps vuln gate                       | `deps-vuln-gate.yml`           | PRs                                     | dependency vulnerability audit                                                                                   |
| Release                              | `release.yml`                  | tag `v*`                                | verify-version → quality-gate → prepare-release → build → flatpak → publish-release, Scoop/Homebrew/web manifest |
| Publish to WinGet                    | `release_to_winget.yml`        | release published                       | komac manifest PR to `microsoft/winget-pkgs`                                                                     |
| Startup Nightly                      | `startup-nightly.yml`          | cron 03:00 UTC + dispatch               | degraded-environment startup journeys, all 3 platforms, non-blocking                                             |
| Runtime Binary Manifest Validation   | `runtime-binaries.yml`         | dispatch                                | validates signed runtime manifest generator                                                                      |
| Windows yt-dlp probe soak            | `windows-ytdlp-probe-soak.yml` | dispatch                                | probe-duration soak measurements                                                                                 |
| Publish yt-dlp-bridge / ytdlp-errors | `publish-*.yml`                | package tags + dispatch                 | npm publish of workspace packages                                                                                |

## Startup verification tiers

| Tier      | Where                        | Platforms | Blocking                                               | Journeys                                                                 |
| --------- | ---------------------------- | --------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `pr`      | E2E Cold Start               | Linux     | yes                                                    | `fresh-cold`, `warm-restart`                                             |
| `release` | `release.yml` `startup-gate` | all 3     | not yet — soak first, then wire into `prepare-release` | + `inherited-update`                                                     |
| `nightly` | Startup Nightly              | all 3     | no (reports)                                           | degraded: offline, index-off, no-GPU, contaminated PATH, corrupt profile |

Journeys are data in `scripts/startup/journeys.ts`; the runner launches the packaged app, waits for a real milestone, and a pure log oracle asserts clean logs. A missing verdict is a failure — "ran nothing" can never look like "passed". Invocation: `ARROXY_STARTUP_TIER=<tier> PACKAGED_EXE=<exe> bun run verify:startup`. Details in `dev-docs/startup-performance.md`.

## Branch protection contract (`main`)

Required checks: `check`, `Cold start (linux)`, `Cold-state install`, `1x install/uninstall cycle`.

- Required contexts must match what PR workflows actually report. Never require a context only produced by tag-only or scheduled workflows — it would block every PR forever.
- Renaming or moving a job → update protection in the same PR.
- Do **not** add `startup-gate` to protection when wiring it into `prepare-release` — it only runs on tags.
- Known drift incident (2026-08-30): stale required contexts `Cold start (windows)` / `(macos-arm64)` blocked PRs with phantom pending after the PR tier went Linux-only.

## Release flow

Tag `v*` (annotated, via `scripts/release.sh`) publishes to GitHub Releases, Scoop, Homebrew, Winget. Notes come from `CHANGELOG.md` (SSOT). Manual steps: `dev-docs/release-runbook.md`.
