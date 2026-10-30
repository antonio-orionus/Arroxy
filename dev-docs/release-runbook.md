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

`bun run release:stable` refuses to tag a release commit that still holds a fragment in `changelog.d/`, or whose `## <version>` section is missing or empty. It reads the release commit's tree, not your checkout. The tag workflow's `quality-gate` runs the same check on a stable tag, so a tag pushed by hand without notes stops before anything is built. A beta skips that check: if it has no section, the workflow logs a `::warning::` and falls back to auto-generated notes (PR titles only).

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

## 0. Translation sync

PRs change English only (ADR 0017), so a release starts with one sync PR that translates everything open. `bun run i18n:status` shows the open entries; `gh issue list --label i18n --state open` shows translations reported wrong (skip `parked` ones, which wait on a native speaker). When both are empty, skip to step 1. Otherwise, from a fresh `main` in its own worktree:

1. `bun run i18n:sync` updates `i18n/app.pot` and merges English changes into every `i18n/locales/*.po`; changed English marks the old translation fuzzy. It needs GNU gettext's `msgmerge`. Never hand-edit generated locale JSON instead.
2. Add any product term the batch introduces to `i18n/glossary.md`.
3. Translate every untranslated and fuzzy PO entry, every `msgstr` an open `i18n` issue reports wrong (the PR closes it with `Fixes #N`), and every README key `bun run check:readme` names in `readme-src/locales/{lang}.mjs`. Edit only `msgstr`, and remove `fuzzy` only after checking the translation against the current `msgid`; keep placeholders, markup, shortcut text and product names; non-Latin-script locales write their own script.
4. `bun run i18n:compile`, then `bun readme-src/build.mjs --record-translated`, which records the English the README locales now match.
5. `bun run check:i18n:complete` and `bun run check` must pass. Open `i18n: sync translations` and land it.

`scripts/release.sh` and the `quality-gate` job both run `bun run check:i18n:complete` and refuse an untranslated release.

## 1. Bump `main` to the release version

```bash
git checkout main
git pull origin main

# edit package.json: 0.3.1 -> 0.3.2
bun run changelog:assemble   # writes ## 0.3.2 from changelog.d/; read it over
bun run check && bun run check:i18n:complete
git commit -am "release: 0.3.2"
git push origin main
```

This `release: 0.3.2` commit is the **release commit**: the tag goes on it, and on nothing else. Its subject must be exactly `release: <version>` (a squash-merged PR's `(#N)` suffix after it is accepted). Until the version is tagged, the newest `release: 0.3.2` commit on `origin/main` is the release commit, so a release commit is redone by committing a new one on top (below).

Push it as the head of its push, with nothing committed after it: GitHub runs push workflows on a push's head commit only, so a release commit pushed under later commits never gets its required checks. `release:stable` spots that from main's push history and stops at once; redo the release commit.

If the push is rejected because a PR merged meanwhile, pull it in and fold any fragment it brought into the section, still in the unpushed release commit:

```bash
git pull --rebase origin main
bun run changelog:assemble   # adds new fragments to ## 0.3.2; says so when there are none
git add -A && git commit --amend --no-edit
git push origin main
```

## 2. Cut the stable release

Right after the push, without waiting:

```bash
bun run release:stable
```

The script finds the release commit on `origin/main`, waits for every check branch protection requires on `main` to pass on that commit (listed in [`ci-cd-strategy.md`](ci-cd-strategy.md#branch-protection-contract-main)), then creates the annotated `vX.Y.Z` tag on it and pushes only the tag. PRs merged after the release commit do not matter: they are not in the release, and their runs are not waited on. CI on `main` never cancels a run, so the release commit always gets a verdict.

While checks run it prints which ones it is still waiting on every 30 seconds, for up to 60 minutes (`RELEASE_CHECKS_TIMEOUT_MINUTES` changes the limit). It refuses at once if a required check failed, was cancelled or was skipped: re-run a flaky job (`gh run rerun <id> --failed`) and run `release:stable` again, or fix it on `main` and redo the release commit. Local `main` may be behind `origin/main`, but not ahead: the release commit must be pushed first. The version comes from `origin/main`'s `package.json`.

### Redo a release commit

Keep the version. Bumping to the next one instead would leave this version's notes out of every GitHub release, since `publish-release` posts only the tagged version's section. Once the fix is on `main`:

```bash
git checkout main
git pull origin main
bun run changelog:assemble   # adds fragments merged since to ## 0.3.2, keeping your edits
git add -A && git commit --allow-empty -m "release: 0.3.2"
git push origin main
bun run release:stable       # tags the newest release: 0.3.2 commit
```

`changelog:assemble` extends an existing section only while its version has no tag, locally or on `origin`; for a tagged version it stops and keeps the fragments.

Dry check, which looks once and does not wait or tag:

```bash
bash scripts/release.sh stable --verify-only
```

The tag workflow also runs its own `quality-gate` job (`bun run check`) before creating the draft release or building artifacts, so a manually pushed tag cannot publish from a commit that fails the full local gate.

Release graph summary: `release.yml` runs `verify-version` -> `quality-gate` -> `prepare-release` -> mac/linux builds -> `publish-release`; Flatpak builds after the mac/linux build and uploads separately; Scoop/Homebrew publish after `publish-release`; Winget runs from `release_to_winget.yml` when the release is un-drafted. Windows artifacts are still produced by `installer-smoke.yml` and `publish-release` waits for them before checksums and publish. The `startup-gate` job runs startup verification on all 3 platforms on every tag, alongside the builds; `publish-release` needs it, so a red gate leaves the release a draft. Fix forward and re-run the failed job, or cut a new tag.

## Optional: a beta, only when the maintainer asks for one

Cut a beta only on an explicit request for one; no release plan or rollout depends on it. A `-beta.N` tag publishes a GitHub pre-release that skips Scoop, Homebrew, Winget and the Flatpak repo and never auto-updates installed copies ([`release-pipeline.md`](release-pipeline.md#pre-release-flow-test-pipeline-wo-auto-updating-users)).

Land the translation sync first ([step 0](#0-translation-sync)): `release:beta` runs `check:i18n:complete` on the commit it tags, as a stable release does, and refuses an untranslated one.

```bash
git checkout main
git pull origin main

# edit package.json: 0.3.1 -> 0.3.2-beta.1
# Leave the fragments in changelog.d/ for the stable release to assemble.
bun run check && bun run check:i18n:complete
git commit -am "release: 0.3.2-beta.1"
git push origin main
bun run release:beta
```

Do not add a `## 0.3.2-beta.1` section to `CHANGELOG.md`: the stable release assembles the same fragments into `## 0.3.2`, so the changelog would list every entry twice. Without a section, the beta's release notes fall back to the PR titles, with a `::warning::` in the workflow log.

The beta pushes `main` and its tag together, atomically. If the push is rejected (main moved), the script deletes the local tag again: `git pull --rebase origin main` and run `release:beta` again.

Download the pre-release artifacts from GitHub Releases to test them. Afterwards, the stable release is the normal path above (`0.3.2-beta.1` -> `0.3.2`); do not leave `main` on a new pre-release version.

## Common misses

- Do not forget `git push origin main` after the version bump; `release:stable` refuses while local `main` is ahead of `origin/main`.
- `no 'release: X' commit` means the version bump was committed under another subject. Commit a correctly titled `release: X` on top rather than renaming a pushed one.
- A required check that is missing until the time limit usually means the release commit predates that check, or its workflow never started; `gh run list --commit <sha>` shows what ran. A release commit pushed under later commits is caught before the wait.
- A rejected tag push leaves no local tag behind: fix the cause and run the release again. When origin cannot confirm the tag is absent, the script keeps it and says how to check.
- Tags must be annotated (`git tag -a …`). The `release.sh` wrapper enforces this; manual `git tag NAME` lightweight tags are silently skipped by `git push --follow-tags` and the release pipeline never fires. Push the tag by name (`git push origin refs/tags/vX.Y.Z`), never `--follow-tags` or `--tags`: those also push stale local tags, and GitHub creates no tag events for a push carrying more than three tags.
