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
| CI                                   | `ci.yml`                       | push `main` + PRs                       | `check`: the gate split across runners (all gates but the unit tests, then the tests in shards on Linux and Windows) |
| Dev Smoke                            | `dev-smoke.yml`                | PR/push `main` + dispatch               | packaged-app boot smoke (`MOCK_BACKEND`), preload/context isolation                                              |
| E2E Cold Start                       | `e2e-cold-start.yml`           | PR/push `main` + dispatch               | **PR-tier startup verification** (journey harness) + packaged runtime smoke; Linux only                          |
| E2E Fixtures                         | `e2e-fixtures.yml`             | PR/push `main` + dispatch               | fixture product E2E — acceptance for real user workflows; sharded across 4 runners                               |
| Windows Installer                    | `installer-smoke.yml`          | PR/push `main`, `v*` tags + dispatch    | Windows installer build, cold-state install, install/uninstall cycle; builds the release's Windows artifacts     |
| Flatpak Bundle                       | `flatpak.yml`                  | PR/push + dispatch                      | Flatpak build validation                                                                                         |
| Deps vuln gate                       | `deps-vuln-gate.yml`           | PRs                                     | dependency vulnerability audit                                                                                   |
| Release                              | `release.yml`                  | tag `v*`                                | verify-version → quality-gate → prepare-release → build → flatpak → publish-release, Scoop/Homebrew/web manifest |
| Publish to WinGet                    | `release_to_winget.yml`        | release published                       | komac manifest PR to `microsoft/winget-pkgs`                                                                     |
| Startup Nightly                      | `startup-nightly.yml`          | cron 03:00 UTC + dispatch               | degraded-environment startup journeys, all 3 platforms, non-blocking                                             |
| Runtime Binary Manifest Validation   | `runtime-binaries.yml`         | dispatch                                | validates signed runtime manifest generator                                                                      |
| Windows yt-dlp probe soak            | `windows-ytdlp-probe-soak.yml` | dispatch                                | probe-duration soak measurements                                                                                 |
| ytdlp-errors Upstream Scan           | `ytdlp-errors-upstream-scan.yml` | cron Mon 06:00 UTC + dispatch         | bumps the pinned yt-dlp release in `packages/ytdlp-errors/data` and adds new in-scope error strings (`kind: null`), then opens a PR for triage; skips while a scan PR is open |
| Publish yt-dlp-bridge / ytdlp-errors | `publish-*.yml`                | package tags + dispatch                 | registry publish of workspace packages                                                                           |

## Startup verification tiers

Three tiers (`pr`, `release`, `nightly`), journeys, current state and open defects live in [startup-verification.md](startup-verification.md). Decision record: the PR gate is Linux-only on purpose — [ADR 0006](../docs/adr/0006-pr-startup-gate-linux-only.md).

## Path-gated PR suites

Dev Smoke, E2E Cold Start, E2E Fixtures and Windows Installer skip a pull request that cannot affect them, and skip such a push to `main` (the FFmpeg Remux Matrix does the same with its own, narrower filter). A `changes` job asks [`.github/actions/app-changes`](../.github/actions/app-changes/action.yml) and the suite jobs run only when it says so. The action holds one list of files that cannot reach the built, packaged or running app: docs, agent tooling, translation sources, unit tests, the feedback worker. Any other file runs the suites, including a new file nobody listed. A push to `main` is compared with the commit before it, and only when the same workflow's push run on that commit passed; after a failed, cancelled or unfinished run it runs everything, so a docs push never hides a broken commit under a green gate that the release script then trusts. Tags, schedules and manual runs always run everything. `tests/scripts/app-changes-action.test.ts` pins which change sets run which suite.

The workflows still trigger on every PR; only their jobs skip. A `paths:` trigger would leave a required check pending forever. Every PR means every base branch too, not only `main`: a stacked PR is moved onto `main` when the PR below it merges, and that retarget starts no run, so a `branches: [main]` filter would leave it green but blocked until the next push. Each suite ends in a gate job that always runs ([`.github/actions/suite-gate`](../.github/actions/suite-gate/action.yml)): it fails when the filter did not run or when any suite job that had to run did not pass. Branch protection requires the gate, not the suite jobs: a skipped job counts as passing, including one skipped because a job it needs failed, so requiring `Cold-state install` directly would let a failed installer build through.

## Branch protection contract (`main`)

Required checks: `check`, `FFmpeg remux gate`, `E2E fixtures gate`, `Cold start gate`, `Windows installer gate`, `Dev smoke gate`.

`check` is CI's last job and passes only when every part passed: `gates` (`bun run check` with `CHECK_TESTS_SEPARATELY=1`, so every gate but the unit tests), the unit tests in three Linux shards, and two Windows shards. On one runner the unit tests took about 6.5 minutes while every other gate shared its CPUs, and that one job set the wait for every push.

- Required contexts must match what PR workflows actually report. Never require a context only produced by tag-only or scheduled workflows — it would block every PR forever.
- Renaming or moving a job → update protection in the same PR.
- A path-gated suite is required through its gate job, never through a suite job.
- Do **not** add `startup-gate` to branch protection — it gates `publish-release` and only runs on tags (see [ADR 0006](../docs/adr/0006-pr-startup-gate-linux-only.md)).

## Release flow

Tag `v*` (annotated, via `scripts/release.sh`) publishes to GitHub Releases, Scoop, Homebrew, Winget. Notes come from `CHANGELOG.md` (SSOT). Manual steps: `dev-docs/release-runbook.md`.
