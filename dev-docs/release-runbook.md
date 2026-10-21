# Release runbook

| Area                      | Lives in                                |
| ------------------------- | --------------------------------------- |
| Release wrapper           | `scripts/release.sh`                    |
| Release workflow          | `.github/workflows/release.yml`         |
| Windows installer build   | `.github/workflows/installer-smoke.yml` |
| PR-tier startup gate      | `.github/workflows/e2e-cold-start.yml`  |
| Release-tier startup gate | `release.yml` `startup-gate` job        |
| Release notes (SSOT)      | `CHANGELOG.md`                          |
| Unreleased notes          | `changelog.d/` fragments                |

This is the manual checklist for cutting a release. Releases are stable and go straight from `main`; a beta is cut only when the maintainer explicitly asks for one.

## Picking the version

Bump the patch number for fixes **and** features: throughout 0.4.x even a UI redesign and six new languages shipped as patches. A minor bump only closes out a release line or marks a milestone the maintainer names.

## Release notes

User-facing release notes live in `CHANGELOG.md` at the repo root, keyed by version (`## 0.3.5`). The `publish-release` job in `release.yml` extracts the matching section, appends the auto-generated "What's Changed" PR list + Full Changelog link, and posts the combined body as the GitHub Release.

Between releases, `CHANGELOG.md` holds released versions only. Each user-facing PR adds a fragment to `changelog.d/` instead (format in [`changelog.d/README.md`](../changelog.d/README.md)), so open PRs never conflict over the changelog; `bun run check` fails on a malformed fragment or a hand-written unreleased section (`## Unreleased`, or a section newer than `package.json`).

Before tagging:

1. After the `package.json` bump, run `bun run changelog:assemble`. It writes `## <version>` at the top of `CHANGELOG.md` from the fragments (intro paragraphs, then Highlights, Fixes and Good to know, each in merge order) and deletes them. With no fragments it stops and says so instead of writing an empty section; write the section by hand only if the release has something to say.
2. Read the section over: keep each entry to one or two user-facing sentences, put the highlights in the order you want, and cut polish of features new in the same release.
3. Commit it alongside the `package.json` bump in the same `release: X.Y.Z` commit.

`bun run release:stable` refuses to tag while a fragment is left in `changelog.d/` or the version's section is missing or empty. A beta skips that check: if it has no section, the workflow logs a `::warning::` and falls back to auto-generated notes (PR titles only).

Do **not** edit GitHub Release notes directly via the web UI or `gh release edit`. The `publish-release` step runs late (after build + Windows artifact wait) and will overwrite manual edits. Fix `CHANGELOG.md`, push a fix-up commit, and re-run `publish-release`.

## Runtime binaries

Release builds download FFmpeg and yt-dlp at runtime, so an app release carries neither. FFmpeg upgrades ship on their own through the daily manifest, not through app releases ([`runtime-binaries.md`](runtime-binaries.md#releases-and-schedules)). Before tagging, confirm both still resolve for a fresh install:

1. Every URL in `src/main/services/binary/FfmpegPackagePins.ts` is a published asset: `bun scripts/build/ffmpegPackage.ts install --all --cache-root "$(mktemp -d)"` installs every target.
2. The latest `arroxy-runtime-binaries` release carries `runtime-index-v2.json` and `runtime-index-v2.sig` next to the v1 pair. Without them, new installs still get FFmpeg from the bundled pins but hold yt-dlp at the bundled stable version.

See [`ffmpeg-packages.md`](ffmpeg-packages.md).

## Branch model

- Single long-lived branch: `main`.
- Every release is a stable tag cut straight from `main`. There is no beta step and no standing pre-release line: `package.json` on `main` holds the last released version until the next `release: X.Y.Z` commit.
- Feature work happens on short-lived branches merged into `main` in small PRs. Work meant for a later release merges behind a release flag ([`release-flags.md`](release-flags.md)), off in every release build, rather than waiting on a long-lived branch. De-risk a risky change before it merges (live smoke comparisons, fixture E2E, log-only shadow mode), not with a beta.

## 1. Bump `main` to the release version

```bash
git checkout main
git pull origin main

# edit package.json: 0.3.1 -> 0.3.2
bun run changelog:assemble   # writes ## 0.3.2 from changelog.d/; read it over
bun run check
git commit -am "release: 0.3.2"
git push origin main
```

Do not tag yet.

## 2. Wait for `main` checks

The stable tag script refuses to tag until the exact `main` commit passed the required release-gate checks.

The tag workflow also runs its own `quality-gate` job (`bun run check`) before creating the draft release or building artifacts, so a manually pushed tag cannot publish from a commit that fails the full local gate.

Watch the latest `main` runs:

```bash
gh run list --branch main --limit 10
```

Wait for these checks on the version-bump commit:

- `check`
- `FFmpeg remux gate`
- `Cold start gate`
- `Windows installer gate`

Optional dry check:

```bash
bash scripts/release.sh stable --verify-only
```

## 3. Cut the stable release from `main`

Once checks are green:

```bash
git checkout main
git pull origin main
bun run release:stable
```

This creates the annotated `vX.Y.Z` tag and pushes it. The release workflows publish GitHub assets and stable package-manager updates.

Release graph summary: `release.yml` runs `verify-version` -> `quality-gate` -> `prepare-release` -> mac/linux builds -> `publish-release`; Flatpak builds after the mac/linux build and uploads separately; Scoop/Homebrew publish after `publish-release`; Winget runs from `release_to_winget.yml` when the release is un-drafted. Windows artifacts are still produced by `installer-smoke.yml` and `publish-release` waits for them before checksums and publish. The `startup-gate` job runs startup verification on all 3 platforms on every tag, alongside the builds; `publish-release` needs it, so a red gate leaves the release a draft. Fix forward and re-run the failed job, or cut a new tag.

## Optional: a beta, only when the maintainer asks for one

Cut a beta only on an explicit request for one; no release plan or rollout depends on it. A `-beta.N` tag publishes a GitHub pre-release that skips Scoop, Homebrew, Winget and the Flatpak repo and never auto-updates installed copies ([`release-pipeline.md`](release-pipeline.md#pre-release-flow-test-pipeline-wo-auto-updating-users)).

```bash
git checkout main
git pull origin main

# edit package.json: 0.3.1 -> 0.3.2-beta.1; optionally add `## 0.3.2-beta.1` to CHANGELOG.md by hand.
# Leave the fragments in changelog.d/ for the stable release to assemble.
bun run check
git commit -am "release: 0.3.2-beta.1"
git push origin main
bun run release:beta
```

Download the pre-release artifacts from GitHub Releases to test them. Afterwards, the stable release is the normal path above (`0.3.2-beta.1` -> `0.3.2`); do not leave `main` on a new pre-release version.

## Common misses

- Do not tag before the post-bump `main` checks finish.
- Do not forget `git push origin main` after the version bump.
- If `release:stable --verify-only` says a required check is missing, it usually means the current `main` commit predates that required check or the latest `main` run is still in progress.
- Tags must be annotated (`git tag -a …`). The `release.sh` wrapper enforces this; manual `git tag NAME` lightweight tags are silently skipped by `git push --follow-tags` and the release pipeline never fires. Push the tag by name (`git push origin refs/tags/vX.Y.Z`), never `--follow-tags` or `--tags`: those also push stale local tags, and GitHub creates no tag events for a push carrying more than three tags.
