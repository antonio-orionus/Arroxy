# Release runbook

| Area                      | Lives in                                |
| ------------------------- | --------------------------------------- |
| Release wrapper           | `scripts/release.sh`                    |
| Release commit and checks | `scripts/release-gate.ts`               |
| Release workflow          | `.github/workflows/release.yml`         |
| Windows installer build   | `.github/workflows/installer-smoke.yml` |
| PR-tier startup gate      | `.github/workflows/e2e-cold-start.yml`  |
| Release-tier startup gate | `release.yml` `startup-gate` job        |
| Release notes (SSOT)      | `CHANGELOG.md`                          |

This is the manual checklist for cutting a release. Releases are stable and go straight from `main`; a beta is cut only when the maintainer explicitly asks for one.

## Picking the version

Bump the patch number for fixes **and** features: throughout 0.4.x even a UI redesign and six new languages shipped as patches. A minor bump only closes out a release line or marks a milestone the maintainer names.

## Release notes

User-facing release notes live in `CHANGELOG.md` at the repo root, keyed by version (`## 0.3.5`). The `publish-release` job in `release.yml` extracts the matching section, appends the auto-generated "What's Changed" PR list + Full Changelog link, and posts the combined body as the GitHub Release.

Before tagging:

1. Open `CHANGELOG.md`, add a new `## <version>` section at the top in the same shape as the previous entry (look at `## 0.3.4` for tone — friendly user-facing prose grouped by feature category).
2. Commit alongside the `package.json` bump in the same `release: X.Y.Z` commit.

If you skip step 1, the workflow logs a `::warning::` and falls back to pure auto-generated notes (PR titles only). The release still publishes — it just looks lazy.

Do **not** edit GitHub Release notes directly via the web UI or `gh release edit`. The `publish-release` step runs late (after build + Windows artifact wait) and will overwrite manual edits. Fix `CHANGELOG.md`, push a fix-up commit, and re-run `publish-release`.

## Runtime binaries

Release builds download FFmpeg and yt-dlp at runtime, so an app release carries neither. FFmpeg upgrades ship on their own through the daily manifest, not through app releases ([`runtime-binaries.md`](runtime-binaries.md#releases-and-schedules)). Before tagging, confirm both still resolve for a fresh install:

1. Every URL in `src/main/services/binary/FfmpegPackagePins.ts` is a published asset: `bun scripts/build/ffmpegPackage.ts install --all --cache-root "$(mktemp -d)"` installs every target.
2. The latest `arroxy-runtime-binaries` release carries `runtime-index-v2.json` and `runtime-index-v2.sig` next to the v1 pair. Without them, new installs still get FFmpeg from the bundled pins but hold yt-dlp at the bundled stable version.

See [`ffmpeg-packages.md`](ffmpeg-packages.md).

## Branch model

- Single long-lived branch: `main`.
- Every release is a stable tag cut straight from `main`. There is no beta step and no standing pre-release line: `package.json` on `main` holds the last released version until the next `release: X.Y.Z` commit.
- Feature work happens on short-lived feature branches merged into `main` when ready. De-risk a risky change before it merges (live smoke comparisons, fixture E2E, log-only shadow mode), not with a beta.

## 1. Bump `main` to the release version

```bash
git checkout main
git pull origin main

# edit package.json: 0.3.1 -> 0.3.2, and add `## 0.3.2` to CHANGELOG.md
bun run check
git commit -am "release: 0.3.2"
git push origin main
```

This `release: 0.3.2` commit is the **release commit**: the tag goes on it, and on nothing else. Its subject must be exactly `release: <version>` (a squash-merged PR's ` (#N)` suffix is accepted).

## 2. Cut the stable release

Right after the push, without waiting:

```bash
bun run release:stable
```

The script finds the release commit on `origin/main`, waits for every check branch protection requires on `main` to pass on that commit (today `check`, `FFmpeg remux gate`, `E2E fixtures gate`, `Cold start gate`, `Windows installer gate`, `Dev smoke gate`), then creates the annotated `vX.Y.Z` tag on it and pushes only the tag. PRs merged after the release commit do not matter: they are not in the release, and their runs are not waited on. CI on `main` never cancels a run, so the release commit always gets a verdict.

While checks run it prints which ones it is still waiting on every 30 seconds, for up to 60 minutes (`RELEASE_CHECKS_TIMEOUT_MINUTES` changes the limit). It refuses at once if a required check failed, was cancelled or was skipped: fix it on `main` and cut a new release commit, or re-run a flaky job (`gh run rerun <id> --failed`) and run `release:stable` again. Local `main` may be behind `origin/main`, but not ahead: the release commit must be pushed first. The version comes from `origin/main`'s `package.json`.

Dry check, which looks once and does not wait or tag:

```bash
bash scripts/release.sh stable --verify-only
```

The tag workflow also runs its own `quality-gate` job (`bun run check`) before creating the draft release or building artifacts, so a manually pushed tag cannot publish from a commit that fails the full local gate.

Release graph summary: `release.yml` runs `verify-version` -> `quality-gate` -> `prepare-release` -> mac/linux builds -> `publish-release`; Flatpak builds after the mac/linux build and uploads separately; Scoop/Homebrew publish after `publish-release`; Winget runs from `release_to_winget.yml` when the release is un-drafted. Windows artifacts are still produced by `installer-smoke.yml` and `publish-release` waits for them before checksums and publish. The `startup-gate` job runs startup verification on all 3 platforms on every tag, alongside the builds; `publish-release` needs it, so a red gate leaves the release a draft. Fix forward and re-run the failed job, or cut a new tag.

## Optional: a beta, only when the maintainer asks for one

Cut a beta only on an explicit request for one; no release plan or rollout depends on it. A `-beta.N` tag publishes a GitHub pre-release that skips Scoop, Homebrew, Winget and the Flatpak repo and never auto-updates installed copies ([`release-pipeline.md`](release-pipeline.md#pre-release-flow-test-pipeline-wo-auto-updating-users)).

```bash
git checkout main
git pull origin main

# edit package.json: 0.3.1 -> 0.3.2-beta.1, add `## 0.3.2-beta.1` to CHANGELOG.md
bun run check
git commit -am "release: 0.3.2-beta.1"
git push origin main
bun run release:beta
```

Download the pre-release artifacts from GitHub Releases to test them. Afterwards, the stable release is the normal path above (`0.3.2-beta.1` -> `0.3.2`); do not leave `main` on a new pre-release version.

## Common misses

- Do not forget `git push origin main` after the version bump; `release:stable` refuses while local `main` is ahead of `origin/main`.
- `no 'release: X' commit` means the version bump was committed under another subject. Tag a new version from a correctly titled commit rather than renaming a pushed one.
- A required check that is missing until the time limit usually means the release commit predates that check, or its workflow never started; `gh run list --commit <sha>` shows what ran.
- Tags must be annotated (`git tag -a …`). The `release.sh` wrapper enforces this; manual `git tag NAME` lightweight tags are silently skipped by `git push --follow-tags` and the release pipeline never fires. Push the tag by name (`git push origin refs/tags/vX.Y.Z`), never `--follow-tags` or `--tags`: those also push stale local tags, and GitHub creates no tag events for a push carrying more than three tags.
