# Release runbook

| Area                      | Lives in                                |
| ------------------------- | --------------------------------------- |
| Release wrapper           | `scripts/release.sh`                    |
| Release workflow          | `.github/workflows/release.yml`         |
| Windows installer build   | `.github/workflows/installer-smoke.yml` |
| PR-tier startup gate      | `.github/workflows/e2e-cold-start.yml`  |
| Release-tier startup gate | `release.yml` `startup-gate` job        |
| Release notes (SSOT)      | `CHANGELOG.md`                          |

This is the manual checklist for cutting a stable release.

## Release notes

User-facing release notes live in `CHANGELOG.md` at the repo root, keyed by version (`## 0.3.5-beta.1`). The `publish-release` job in `release.yml` extracts the matching section, appends the auto-generated "What's Changed" PR list + Full Changelog link, and posts the combined body as the GitHub Release.

Before tagging:

1. Open `CHANGELOG.md`, add a new `## <version>` section at the top in the same shape as the previous entry (look at `## 0.3.4` for tone — friendly user-facing prose grouped by feature category).
2. Commit alongside the `package.json` bump in the same `release: X.Y.Z` commit.

If you skip step 1, the workflow logs a `::warning::` and falls back to pure auto-generated notes (PR titles only). The release still publishes — it just looks lazy.

Do **not** edit GitHub Release notes directly via the web UI or `gh release edit`. The `publish-release` step runs late (after build + Windows artifact wait) and will overwrite manual edits. Fix `CHANGELOG.md`, push a fix-up commit, and re-run `publish-release`.

## Branch model

- Single long-lived branch: `main`.
- Beta and stable tags both cut from `main`.
- Feature work happens on short-lived feature branches merged into `main` when ready.

## 1. Final beta from `main`

Before promoting to stable, cut and test a beta from `main`.

```bash
git checkout main
git pull origin main

# package.json must be a beta version, e.g. 0.3.2-beta.13
bun run release:beta
```

Download the prerelease artifacts from GitHub Releases and smoke-test the app.

## 2. Bump `main` to stable

```bash
# edit package.json: 0.3.2-beta.13 -> 0.3.2
bun run check
git commit -am "release: 0.3.2"
git push origin main
```

Do not tag yet.

## 3. Wait for `main` checks

The stable tag script refuses to tag until the exact `main` commit passed the required release-gate checks.

The tag workflow also runs its own `quality-gate` job (`bun run check`) before creating the draft release or building artifacts, so a manually pushed tag cannot publish from a commit that fails the full local gate.

Watch the latest `main` runs:

```bash
gh run list --branch main --limit 10
```

Wait for these checks on the stable version-bump commit:

- `check`
- `Cold start (linux)`
- `Cold-state install`
- `1x install/uninstall cycle`

Optional dry check:

```bash
bash scripts/release.sh stable --verify-only
```

## 4. Cut stable release from `main`

Once checks are green:

```bash
git checkout main
git pull origin main
bun run release:stable
```

This creates the annotated `vX.Y.Z` tag and pushes it. The release workflows publish GitHub assets and stable package-manager updates.

Release graph summary: `release.yml` runs `verify-version` -> `quality-gate` -> `prepare-release` -> mac/linux builds -> `publish-release`; Flatpak builds after the mac/linux build and uploads separately; Scoop/Homebrew publish after `publish-release`; Winget runs from `release_to_winget.yml` when the release is un-drafted. Windows artifacts are still produced by `installer-smoke.yml` and `publish-release` waits for them before checksums and publish. The `startup-gate` job runs startup verification on all 3 platforms on every tag — not yet blocking; see `dev-docs/ci-cd-strategy.md`.

## 5. Start the next beta line

Bump `package.json` to the next pre-release on `main`:

```bash
# edit package.json: 0.3.2 -> 0.3.3-beta.1
git commit -am "release: start 0.3.3-beta.1"
git push origin main
```

## Common misses

- Do not tag stable before the post-bump `main` checks finish.
- Do not forget `git push origin main` after the stable version bump.
- If `release:stable --verify-only` says a required check is missing, it usually means the current `main` commit predates that required check or the latest `main` run is still in progress.
- Tags must be annotated (`git tag -a …`). The `release.sh` wrapper enforces this; manual `git tag NAME` lightweight tags are silently skipped by `git push --follow-tags` and the release pipeline never fires.
