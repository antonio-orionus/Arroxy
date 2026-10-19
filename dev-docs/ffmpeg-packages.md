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

| Target       | Upstream build                                   | Size     |
| ------------ | ------------------------------------------------ | -------- |
| win32-x64    | BtbN `autobuild-2026-08-31-13-27`, gpl-shared    | 42.37 MB |
| linux-x64    | BtbN `autobuild-2026-08-31-13-27`, gpl-shared    | 43.93 MB |
| linux-arm64  | BtbN `autobuild-2026-08-31-13-27`, gpl-shared    | 39.48 MB |
| darwin-x64   | Martin Riedl 9.0.2 release (Developer ID signed) | 27.57 MB |
| darwin-arm64 | Martin Riedl 9.0.2 release (Developer ID signed) | 22.45 MB |

The pins in `FfmpegPackagePins.ts` are the only place a version is chosen. The
manifest generator copies them into every signed v2 binary manifest unchanged,
and the app ships them as its bundled fallback. The daily manifest job therefore
cannot change which FFmpeg users get.

## How the app installs it

`BinaryManager.resolveFFmpegPair` tries, per binary: manual override → env
override → (dev only) `build/embedded` → approved packages in manifest order →
system `PATH`. Warmup awaits this branch, so the splash shows the download
progress on both the FFmpeg and FFprobe rows.

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
bundled) that is already installed resolves without network access.

## Approving a new FFmpeg build

Only for a security fix, a compatibility problem or a needed feature; nothing
tracks upstream automatically.

1. Bump the upstream pins: `BTBN_PINNED_RELEASE_TAG` in
   `scripts/build/btbnResolver.ts` and the Martin Riedl paths and SHA-256s in
   `scripts/build/fetch-embedded.sh`. Run `scripts/test-binaries/smoke-all.sh`.
2. Fetch every target into a clean `build/embedded/`:
   `bash scripts/build/fetch-embedded.sh <platform> <arch>` for each row above.
3. Build every package with a new release tag (for example
   `ffmpeg-2026.12.01`; never one containing `latest`):

   ```bash
   bun scripts/build/ffmpegPackage.ts build --platform win32 --arch x64 --version <version> --tag <tag>
   ```

   Each run writes the archive and its `.entry.json` to `dist/ffmpeg-packages/`.
4. On Windows, extract the win32 package and scan it with
   `scripts/test-binaries/scan-windows-defender.ps1 -Require ffmpeg.exe,ffprobe.exe`.
   A flagged build is not approved.
5. Collect the license texts and the exact corresponding source for each
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

Then verify that each asset matches its pin from a clean cache:

```bash
bun scripts/build/ffmpegPackage.ts install --platform <platform> --arch <arch> --cache-root "$(mktemp -d)"
```

## The manifest publishing workflow (other repository)

`arroxy-runtime-binaries/.github/workflows/publish-runtime-manifest.yml` checks
out Arroxy `main` and runs the generator. Once the first FFmpeg release is
published, it must also sign and upload v2. The changes:

- `generate` already writes `runtime-index-v2.json` next to `--out`.
- Sign v2 as well:
  `bun scripts/build/runtimeBinaryManifest.ts sign --manifest "$DIR/runtime-index-v2.json" --out "$DIR/runtime-index-v2.sig"`.
- Validate v2, which installs and runs this host's FFmpeg package:
  `bun scripts/build/runtimeBinaryManifest.ts validate --manifest "$DIR/runtime-index-v2.json" --smoke current`.
- Upload all four files and expect four assets instead of two.

Until then, current app builds find no v2 manifest and fall back to the pins
they bundle, which still installs FFmpeg but holds yt-dlp at the bundled
stable version. So the workflow change must land **before the first app
release that contains this change**.

## Redistribution

FFmpeg is GPLv3 in these builds. For every package version, the release that
holds it must also carry or link the license texts and the exact corresponding
source of that build: FFmpeg itself and the GPL dependencies compiled into it,
plus the build scripts. Upstream download pages alone do not establish that.
Never publish a build whose corresponding source cannot be obtained.

## Size and traffic (0.6.2, Windows)

| Scenario                          | Before    | After                        |
| --------------------------------- | --------- | ---------------------------- |
| Setup / Portable download         | 175.51 MB | 125.87 MB (−28.3%)           |
| Fresh install, app + FFmpeg       | 175.51 MB | 168.24 MB                    |
| Existing user, first upgrade      | delta     | delta + 42.37 MB, once       |
| Later upgrades, same FFmpeg       | delta     | delta                        |
| Portable launch (VM, median of 3) | 11.10 s   | 9.09 s                       |
