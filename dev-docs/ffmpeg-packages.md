# FFmpeg packages

| Area                      | Lives in                                              |
| ------------------------- | ----------------------------------------------------- |
| Approved packages (pins)  | `src/main/services/binary/FfmpegPackagePins.ts`       |
| Package builder/installer | `scripts/build/ffmpegPackage.ts`                      |
| Upstream fetch + pins     | `scripts/build/fetch-embedded.sh`, `btbnResolver.ts`  |
| Package notice            | `build/ffmpeg-package/NOTICE.txt`                     |
| App-side installer        | `src/main/services/binary/FfmpegPackageMaterializer.ts` |
| Decision                  | ADR 0010                                              |

Release builds ship without FFmpeg. On first launch the app installs the
approved **FFmpeg package** for its platform from a release of
`antonio-orionus/arroxy-runtime-binaries`, and reuses it across app updates
until a different package is approved. Development builds and the fixture E2E
suites keep using `build/embedded/<platform>-<arch>/` and never download one.

## What a package is

One `arroxy-ffmpeg-<platform>-<arch>.tar.br` per supported target: a tar of
`ffmpeg`, `ffprobe`, the shared libraries they load (Windows DLLs, Linux
`libav*.so*` with their soname symlinks) and `NOTICE.txt`, compressed with
brotli at quality 11 with a 1 GiB window. The tar has fixed timestamps and
owners, so the same inputs give the same bytes, and a package can be rebuilt and
checked against its pinned SHA-256.

| Target       | Upstream build                                    | Size     |
| ------------ | ------------------------------------------------- | -------- |
| win32-x64    | BtbN `autobuild-2026-09-30-13-08`, 9.0 gpl-shared | 48.00 MB |
| linux-x64    | BtbN `autobuild-2026-09-30-13-08`, 9.0 gpl-shared | 50.91 MB |
| linux-arm64  | BtbN `autobuild-2026-09-30-13-08`, 9.0 gpl-shared | 44.67 MB |
| darwin-x64   | Martin Riedl 9.0.2 release (Developer ID signed)  | 27.57 MB |
| darwin-arm64 | Martin Riedl 9.0.2 release (Developer ID signed)  | 22.45 MB |

The pins in `FfmpegPackagePins.ts` are the only place a version is chosen. The
manifest generator copies them into every signed v2 binary manifest unchanged,
and the app ships them as its bundled fallback. The daily manifest job therefore
cannot change which FFmpeg users get by itself. But it reads `main`, so a merged
pin change reaches every user at the next daily run, without an app release (see
[`runtime-binaries.md`](runtime-binaries.md#releases-and-schedules)).

## How the app installs it

`BinaryManager.resolveFFmpegPair` tries, per binary: manual override → env
override → (dev only) `build/embedded` → approved packages in manifest order →
other installed packages → system `PATH`.

Rules the resolver keeps:

- **One package supplies both tools.** A package is accepted only when both
  ffmpeg and ffprobe pass their probe. If only one passes, it is dropped, and
  the next package is tried for both, so the pair never mixes two builds.
- **An installed package is reused before anything is downloaded,** but only
  for the exact entry being tried. A newer approved pin is downloaded even when
  an older version is on disk; the older one is the fallback.
- **Installed packages no index lists any more** are tried after the approved
  ones. Example: the index moved on and the new package failed to install, then
  the machine went offline. Each install records its entry, and only entries
  that pass the same rules as an index entry, for this platform and
  architecture, are tried.
- **A download is announced only once it starts,** after the installed copy
  is ruled out. Warm launches never show the setup screen.
- **A system FFmpeg comes last.** An FFmpeg on `PATH` can be too old, built
  without what Arroxy needs, or mismatched, and `-version` cannot tell. So it is
  used only when no approved package can be installed, or when the user picks
  it (see below). ADR 0010 records why.

Warmup awaits this branch. The splash shows one progress bar for the whole
setup. The package is one download, so it reports on the ffmpeg row only.

Each package installs into `runtime-cache/artifact-cache-v1/packages/<key>/`,
where the key covers the archive's SHA-256. Installation streams the verified
archive through brotli and tar, accepts exactly the files and links the manifest
lists with the listed sizes and link targets, writes everything to a staging
directory, then renames it into place. A version directory is never modified
after that: a running ffmpeg keeps its DLLs locked on Windows. After a
successful resolve, all versions except the active one and the newest previous
one are deleted. A directory that is still locked is skipped and removed on a
later launch.

An installed package is re-checked on each launch by file sizes, link targets
and executable bits, not re-hashed; the archive was hashed when it was
installed. Any package listed in a trusted manifest (remote, last-known-good or
bundled) that is already installed resolves without network access, and so
does any other installed package that passes the entry rules.

## When setup fails

The repair panel replaces the splash when a tool is still missing. "Try again"
reruns setup. "Set it up manually" opens:

- **Choose executable**, per tool. FFmpeg and FFprobe must be set together.
- **Install with Homebrew** (macOS) or **Install with WinGet** (Windows) for
  the media tools. Homebrew installs `ffmpeg`; WinGet installs `Gyan.FFmpeg`.
  Afterwards Arroxy takes ffmpeg and ffprobe from the first folder that holds
  both, and saves them as the user's chosen paths.
  - `Gyan.FFmpeg` adds its `bin` folder to the PATH saved in the registry
    instead of linking into `WinGet\Links`. The running app still has its old
    PATH, so after a WinGet install it also searches the user and machine PATH
    read from the registry. The yt-dlp WinGet install uses the same lookup.
- **A package-manager hint** on Linux. Flatpak gets no hint, because it cannot
  see what the host installs.

## Version policy

Every pin is a release build, never a master or nightly build. A June master
build from Martin Riedl crashed the MP4 muxer when it merged VP9 video and AAC
audio, which is Arroxy's most common merge. Neither yt-dlp nor its FFmpeg
fork tests FFmpeg, so the pins are the only gate.

- **Release builds only, on one major/minor everywhere.** Today that is 9.0.
  macOS uses Martin Riedl's build of the release tag. BtbN builds the head of
  the release branch (`release/9.0`), so Windows and Linux run the latest
  point release plus that branch's backported fixes, such as
  `n9.0.2-17-g2a571b6068`. Pin a month-end `autobuild-*` tag: BtbN deletes
  daily builds after a few weeks, and `fetch-embedded.sh` downloads the
  pinned tag on every fresh checkout.
- **Bump only for a new point release or a known bug.** A security fix counts
  as a known bug. A newer build alone is not a reason.
- **A master build only by exception.** Record the reason next to the pin
  (`BTBN_PINNED_RELEASE_TAG` or the Martin Riedl paths), together with the
  release that will replace it, and switch back to a release build as soon
  as that release is out.
- **Every pin change passes the FFmpeg remux matrix on every platform before
  it merges.** The matrix runs Arroxy's real merge, cut and embed commands
  against each new build. Its `FFmpeg remux gate` check runs on every PR: it
  passes at once when no file the matrix runs changed (the pins, the package
  installer and its download path, the ffmpeg spawn environment, Arroxy's
  ffmpeg arguments), and otherwise waits for and reports the matrix. The
  matrix also runs weekly, re-checking every published pin URL and the
  known-bad control.

## Approving a new FFmpeg build

Only under the version policy above; nothing tracks upstream automatically.

1. Bump the upstream pins: `BTBN_PINNED_RELEASE_TAG` in
   `scripts/build/btbnResolver.ts` and the Martin Riedl paths and SHA-256s in
   `scripts/build/fetch-embedded.sh`. Run `scripts/test-binaries/smoke-all.sh`.
2. Fetch every target into a clean `build/embedded/`:
   `bash scripts/build/fetch-embedded.sh <platform> <arch>` for each row above.
   Then run the remux matrix on the fetched build for your own machine:
   `bun scripts/ffmpeg-matrix/run.ts --ffmpeg build/embedded/<platform>-<arch>/ffmpeg`
   (`ffmpeg.exe` on Windows). It runs the binary locally, so each build can
   only be tested on a host of its own platform and architecture; the CI
   workflow covers the other targets.
   The matrix runs every ffmpeg command yt-dlp and Arroxy issue (merge, time-range cut,
   SponsorBlock removal, metadata and chapters, thumbnail, subtitles) against
   committed fixtures in YouTube's DASH, WebM and HLS-fMP4 shapes
   (`scripts/ffmpeg-matrix/generate-fixtures.ts`). A build that fails any case
   is not approved; the CI workflow `ffmpeg-remux-matrix.yml` reruns it on
   every platform's pinned package when the pins change.
3. Build every package with a new release tag (for example
   `ffmpeg-2026.12.01`; never one containing `latest`):

   ```bash
   bun scripts/build/ffmpegPackage.ts build --platform win32 --arch x64 --version <version> --tag <tag>
   ```

   Each run writes the archive and its `.entry.json` to `dist/ffmpeg-packages/`.
4. On Windows, extract the win32 package and scan it with
   `scripts/test-binaries/scan-windows-defender.ps1 -Require ffmpeg.exe,ffprobe.exe`.
   A flagged build is not approved.
5. Collect the license text, the FFmpeg source and the build recipes for each
   upstream build (see "Redistribution" below) and publish them in the same
   release.
6. Publish the release (below), then replace the entries in
   `FfmpegPackagePins.ts` with the generated `.entry.json` contents and open a
   PR. Its CI installs the published Windows package and scans it.

Keep the previous release published: users who have not updated yet still
resolve it, and the bundled fallback of every older app version points at it.

## Publishing a package release

Every client fetches its binary manifest from
`releases/latest/download/runtime-index-v*.json` in the same repository. An
FFmpeg release marked _latest_ makes that URL 404 for every user until the next
daily manifest run. So FFmpeg releases are never latest:

```bash
gh release create <tag> dist/ffmpeg-packages/*.tar.br <source and license assets> \
  --repo antonio-orionus/arroxy-runtime-binaries \
  --latest=false \
  --title "FFmpeg packages <tag>" \
  --notes-file <notes listing upstream builds, versions and source assets>

gh api repos/antonio-orionus/arroxy-runtime-binaries/releases/latest --jq '.tag_name'   # must still be runtime-*
curl -fsIL https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v1.json >/dev/null && echo ok
```

Once `FfmpegPackagePins.ts` holds the new entries (step 6), verify that every
published asset matches its pin from a clean cache. Before that, `install`
would fetch the previous pins, not the release just published:

```bash
bun scripts/build/ffmpegPackage.ts install --all --cache-root "$(mktemp -d)"
```

## The manifest publishing workflow (other repository)

`arroxy-runtime-binaries/.github/workflows/publish-runtime-manifest.yml` checks
out Arroxy and runs the generator, daily and on demand. It signs, validates and
uploads v2 whenever the generator writes one (antonio-orionus/arroxy-runtime-binaries#2).
Its schedule and inputs are in
[`runtime-binaries.md`](runtime-binaries.md#releases-and-schedules).

Without a v2 manifest, current app builds fall back to the pins they bundle.
That still installs FFmpeg, but holds yt-dlp at the bundled stable version.

## Redistribution

FFmpeg is GPLv3 in these builds. Every package release also carries:

- `LICENSE-GPLv3.txt`, taken from the FFmpeg source.
- The FFmpeg source each build was made from: a GitHub archive at the exact
  commit for BtbN builds, the ffmpeg.org release tarball for Martin Riedl's.
- The build recipe that pins every library compiled in: BtbN's
  `FFmpeg-Builds` repository archived at the build's `autobuild-*` tag, and
  each Martin Riedl build's published `versions.txt` (configure line and
  library versions). His public script repository does not tag release builds,
  so no script snapshot is attached for those.
- Release notes linking all of the above at exact commits and tags.

The libraries' own sources are not mirrored; the pinned recipes name them
exactly. `ffmpeg-2026.10.19` is the reference release. Never publish a build
whose FFmpeg commit or library versions cannot be named exactly.

## Size and traffic (0.6.2, Windows)

| Scenario                          | Before    | After                        |
| --------------------------------- | --------- | ---------------------------- |
| Setup / Portable download         | 175.51 MB | 125.87 MB (−28.3%)           |
| Fresh install, app + FFmpeg       | 175.51 MB | 168.24 MB                    |
| Existing user, first upgrade      | delta     | delta + 42.37 MB, once       |
| Later upgrades, same FFmpeg       | delta     | delta                        |
| Portable launch (VM, median of 3) | 11.10 s   | 9.09 s                       |
