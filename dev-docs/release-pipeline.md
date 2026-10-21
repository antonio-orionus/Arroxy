# Release pipeline internals

What happens after `bun run release:stable` (or, on an explicit request for a beta, `release:beta`) pushes a tag. `AGENTS.md` keeps the rules for cutting a release; [`release-runbook.md`](release-runbook.md) is the manual checklist and [`flatpak-repo.md`](flatpak-repo.md) covers the Flatpak repo.

| Lives in | What |
| --- | --- |
| `.github/workflows/release.yml` | Tag-triggered build, publish, package-manager bumps |
| `.github/workflows/release_to_winget.yml` | Winget PR on the `released` event |
| `scripts/release.sh`, `scripts/release-gate.ts` | Tag guards: branch, clean tree, version, the release commit and its required checks |

## Which commit a stable release tags

A stable tag goes on the release commit, the `release: X` commit on `main` that carries the version bump and changelog, not on `main`'s HEAD. `release.sh` waits until every check branch protection requires on `main` passed on that commit, then pushes the tag alone; work merged after it is in the next release. Nothing downstream assumes the tag is `main`'s HEAD: `verify-version` only requires the tagged commit to be reachable from `origin/main` and its `package.json` to match the tag, every later job works from the tag name, and `notify-web-release-manifest` sends only the tag.

That needs a finished run on every `main` commit, so the CI workflows (`ci.yml`, `e2e-fixtures.yml`, `e2e-cold-start.yml`, `dev-smoke.yml`, `installer-smoke.yml`, `ffmpeg-remux-matrix.yml`) cancel superseded runs only on pull requests. A push to `main` or a tag gets a concurrency group of its own (keyed by commit), so its runs neither cancel nor queue behind the next merge (`tests/scripts/workflow-concurrency.test.ts`). The heavy suites still skip a docs-only push through `.github/actions/app-changes`, when the previous `main` commit's run passed.

## Job graph

`.github/workflows/release.yml`: `verify-version` → `quality-gate` (`bun run check`) → `prepare-release` → `build` matrix (linux + mac on `ubuntu-latest`/`macos-latest`); `fetch-flatpak-source` downloads the Linux tarball from the draft release after `build` (it alone holds the write token; drafts are invisible to a read-only one), then `build-flatpak` (read-only: builds, signs the Flatpak repo with `scripts/flatpak/publish-repo.sh`, builds the bundle), then `upload-flatpak`; `publish-release` waits for `upload-flatpak`, polls for Windows assets, generates `SHA256SUMS`, then un-drafts the release. Stable tags also run `publish-scoop`, `publish-homebrew` and `publish-flatpak-repo` (GitHub Pages deploy) after `publish-release`. Read the YAML for step-level detail.

Windows is built separately via a dedicated Windows Installer workflow (smoke-testable before publish); `publish-release` polls up to 15min until the Windows Setup + Portable `.exe` artifacts appear before generating `SHA256SUMS` and un-drafting the release.

Arroxy uses GitHub immutable releases for release asset integrity and the GitHub release asset verification UI. The workflow finishes all mutable release work while the release is still a draft, then publishes/undrafts as the last step. `actions/attest` is intentionally not used for release assets; immutable releases create release attestations for the published assets, while workflow provenance attestations are a separate SLSA/build-chain concern. Keep `SHA256SUMS` for package-manager hashes and offline verification; keep updater metadata (`latest*.yml`) and blockmaps outside the checksum contract.

`.github/workflows/release_to_winget.yml` triggers on the `released` event: once `publish-release` un-drafts the release, the SHA-pinned `vedantmgoyal9/winget-releaser` action runs `komac update AntonioOrionus.Arroxy --submit` → opens a PR against `microsoft/winget-pkgs`. Microsoft reviewers merge within hours-to-a-day. Keep that third-party action pinned to a full commit SHA because it receives `WINGET_TOKEN`.

## Required GitHub repo secret

| Secret                    | Used by            | Scope                                                        |
| ------------------------- | ------------------ | ------------------------------------------------------------ |
| `WINGET_TOKEN`            | all 3 publish jobs | classic PAT, `public_repo` + `workflow`                      |
| `FLATPAK_GPG_PRIVATE_KEY` | `build-flatpak`    | signs the Flatpak repo; must match `flatpak/repo-signing-key.asc` |

Despite the name, this single token authenticates Scoop, Homebrew, **and** Winget pushes (needs `public_repo` to push to external bucket/tap repos and to fork `microsoft/winget-pkgs`). Rotate every 90 days.

## Initial Winget submission (one-time, done)

The `vedantmgoyal9/winget-releaser` action can only **update** an existing winget package, not create one. For Arroxy this was done once via [komac](https://github.com/russellbanks/Komac) (`komac new AntonioOrionus.Arroxy …`) → submitted PR [microsoft/winget-pkgs#365414](https://github.com/microsoft/winget-pkgs/pull/365414). Future tag pushes auto-bump the existing manifest with no manual work.

If we ever change the PackageIdentifier, repeat that one-time submission for the new identifier and update `release_to_winget.yml`.

### The `--winget` installer switch

The action takes no manifest fields: komac regenerates the installer entries and carries every root-level field (`Scope`, `InstallModes`, `InstallerSwitches`) forward from the previous version's manifest. The manifest needs a root-level

```yaml
InstallerSwitches:
  Custom: --winget
```

which WinGet passes on every `winget install` and `winget upgrade`; `build/installer.nsh` turns it into the `winget` install channel ([in-app-updates.md](in-app-updates.md)). It has to be added by hand once, on the automated PR of the first release whose installer contains `build/installer.nsh` (push a commit to that PR's branch in the `antonio-orionus/winget-pkgs` fork before it merges). Check later release PRs still carry it; if a manifest ever loses it, add it back the same way.

## External repos this pipeline writes to

- [`antonio-orionus/scoop-bucket`](https://github.com/antonio-orionus/scoop-bucket) — single `bucket/arroxy.json` manifest, auto-bumped per release
- [`antonio-orionus/homebrew-arroxy`](https://github.com/antonio-orionus/homebrew-arroxy) — single `Casks/arroxy.rb` cask with `on_arm`/`on_intel` stanzas, auto-bumped per release
- [`microsoft/winget-pkgs`](https://github.com/microsoft/winget-pkgs) — community repo; PRs land at `manifests/a/AntonioOrionus/Arroxy/<version>/`
- This repo's GitHub Pages — Arroxy's Flatpak repo at https://antonio-orionus.github.io/Arroxy/flatpak/, replaced by every stable release (`publish-flatpak-repo`). See [`flatpak-repo.md`](flatpak-repo.md); never rotate its signing key casually — installed copies reject updates signed by another key.

GitHub Releases ships: NSIS installer, portable `.exe`, arm64 DMG, x64 DMG, AppImage, tar.gz source, and a Flatpak bundle (stable bundles carry the Flatpak repo as their remote, so `flatpak update` works after installing one). No Snap. An AUR `arroxy-bin` package (repackaging the x64 tar.gz, auto-published like Scoop/Homebrew) is on the roadmap for Arch/Omarchy users, blocked until AUR reopens new-account registration (closed as of 2026-10).

## Pre-release flow (test pipeline w/o auto-updating users)

Only when the maintainer explicitly asks for a beta; releases normally go stable straight from `main` ([`release-runbook.md`](release-runbook.md)). Tag w/ semver pre-release suffix (e.g. `v0.4.0-beta.1`):

- electron-builder marks the GitHub Release `prerelease: true` automatically (semver `-` suffix triggers it).
- electron-updater queries `/releases/latest` (excludes pre-releases) → existing user installs do **not** auto-update.
- `release.yml` `publish-scoop`/`publish-homebrew` jobs guard `if: !contains(github.ref_name, '-')` so beta tags don't bump public package managers.
- Winget skipped automatically — `release_to_winget.yml` triggers on `released` event which excludes pre-releases by GitHub API design.
- Manually download the artifact from the GitHub Release page to validate.
- When ready: bump to plain semver (`v0.4.0`), tag annotated, push.

**NSIS installer:** pin `electron-builder ≥ 26.9.0` (26.8.x has a `multiUser.nsh:35` buffer over-read on cold-heap). Drop `build/installer.nsh`. Any future custom NSIS `Page custom` callback must open with `${If} ${Silent} \n Abort \n ${EndIf}`. Note: the registry `latest` dist-tag is broken `26.8.1`; pin from `next` channel — `bun update --latest` silently downgrades.

## Download size: what was measured and deferred

Moving FFmpeg out of the installers ([ADR 0010](../docs/adr/0010-ffmpeg-is-a-managed-package-installed-once.md)) cut every download by 30–35%. The remaining compression options were measured on the first build without FFmpeg (2026-10-19, local Apple M5 Pro build, decimal MB) and all are deferred. Each keeps the app's files byte-identical; none changes what ships.

| Download | Now | Option | After | Saved | Cost |
| --- | ---: | --- | ---: | ---: | --- |
| `Arroxy-mac-arm64.dmg` | 133.34 | LZMA (`ULMO`) | 101.42 | 23.9% | Copying the app out of the DMG: ~1 s → 5–7 s |
| `Arroxy-mac-x64.dmg` | 140.07 | LZMA (`ULMO`) | 112.77 | 19.5% | Same; real Intel Macs untested, likely slower |
| `Arroxy-linux-x64.tar.gz` | 125.99 | `tar.xz` (level 5) | 93.98 | 25.4% | Extract 0.4 s → 2.9 s; renames the asset |
| `Arroxy-linux-x64.AppImage` | 122.28 | squashfs zstd 22, 1 MiB blocks | ≈112.07 | ≈8.4% | Custom mksquashfs step; launch speed and update size untested |
| Chromium locales not in the app's languages | | drop 26 of 55 | | ≈4% macOS, ≈1% Linux | Explore's browser UI language changes for those OS languages |
| `Arroxy-linux-x64.flatpak` | | none | | 0 | Already compressed (0.6.2: 148 MB against a 194 MB tar.gz of the same app); `flatpak update` fetches only changes |

Why each is deferred, and what reopens it:

- **LZMA DMG.** The one worth doing: the largest saving on a widely used download, and the asset name stays the same. The trade: users below roughly 50 Mbps finish sooner, faster connections lose a few seconds, and Homebrew installs and updates pay the same decode cost because brew mounts the DMG. Every stable electron-builder 26 rejects `dmg.format: "ULMO"` at schema validation, although the dmgbuild it bundles supports the format. Only 27.0.0-alpha accepts it. **Revisit when electron-builder 27 is stable**: then it is `"format": "ULMO"` under `dmg`, with no patch and no post-build conversion. ULMO needs macOS 10.15+, below Arroxy's floor. The macOS updater never reads the DMG blockmap (see [`in-app-updates.md`](in-app-updates.md)). After the change, verify that the DMG mounts and that `codesign --verify --deep --strict` passes on the mounted app.
- **`tar.xz`.** 366 downloads across all stable releases, against ~4.5k for the DMGs. The rename touches `electron-builder.json5`, `release.yml` (`SHA256SUMS`, the Flatpak source jobs, the release-notes badge), `flatpak.yml` (which resolves the latest stable's tarball, so it would fail until a stable ships the new name), the READMEs, `tests/unit/release-asset-names.test.ts` and the `arroxy-site` download links. It would also 404 every existing `latest/download/Arroxy-linux-x64.tar.gz` link. Revisit only if tarball downloads grow, for example with the AUR package. If it ships, keep level 5: level 9 saves 2 MB more and takes 2.4× as long to compress.
- **AppImage zstd 22.** electron-builder hardcodes the mksquashfs arguments, so this needs a repack step that regenerates the embedded blockmap. Larger blocks mean more decompression for every random read, which can slow launch. They can also enlarge differential updates, since the AppImage is the one Linux channel that self-updates. Revisit only with launch-time and update-size measurements on a real x64 Linux machine.
- **Locale filtering.** A product decision, not a build setting. Too small a saving to risk Explore's browser language.

Windows was settled separately and is not to be revisited: stronger NSIS compression slowed portable start and cost Setup its differential updates.
