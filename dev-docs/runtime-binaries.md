# Runtime binaries

| Area                         | Lives in                                            |
| ---------------------------- | --------------------------------------------------- |
| Runtime index trust roots    | `src/main/services/binary/RuntimeBinaryTrust.ts`    |
| Runtime index loading        | `src/main/services/binary/RuntimeBinaryIndexService.ts` |
| Manifest schema validation   | `src/shared/schemas.ts`, `src/shared/runtimeBinaryManifest.ts` |
| yt-dlp source facts          | `src/main/services/binary/YtDlpBinarySource.ts`     |
| Manifest generator           | `scripts/build/runtimeBinaryManifest.ts`            |
| Runtime resolver             | `src/main/services/BinaryManager.ts`                |
| Bundled fallback index       | `src/main/services/binary/BundledRuntimeBinaryIndex.ts` |
| Approved FFmpeg packages     | `src/main/services/binary/FfmpegPackagePins.ts`     |
| Local manifest dev wrapper   | `scripts/with-runtime-manifest.sh`                  |

Arroxy owns yt-dlp and FFmpeg runtime updates through a signed runtime-binary manifest. The app does not run `yt-dlp --update`, and it does not resolve upstream `latest` release URLs at runtime. FFmpeg packages are covered in [`ffmpeg-packages.md`](ffmpeg-packages.md).

## Releases and schedules

Three kinds of release reach users, each on its own trigger:

| Release | Where | Trigger | Carries | Users get it |
| ------- | ----- | ------- | ------- | ------------ |
| App (`v*`) | Arroxy | Manual tag ([`release-runbook.md`](release-runbook.md)) | The app only: no FFmpeg, no yt-dlp | Update banner, checked every 6 h |
| Runtime manifest (`runtime-YYYY.MM.DD.HHMMSS`) | `arroxy-runtime-binaries` | Daily cron at 07:17 UTC, or a manual run | Signed v1 and v2 manifests | Next app launch |
| FFmpeg packages (`ffmpeg-YYYY.MM.DD`) | `arroxy-runtime-binaries` | Manual, rare ([`ffmpeg-packages.md`](ffmpeg-packages.md)) | The packages, plus their license and source assets | Only once a manifest lists them |

The daily manifest is generated from Arroxy `main`. Its yt-dlp entries follow yt-dlp's own releases with no action from us. Its FFmpeg entries are the pins committed on `main`. So **merging a change to `FfmpegPackagePins.ts` ships that FFmpeg to every user within about 24 hours, with no app release.** Review a pin change as you would a release.

The manifest workflow lives in the other repository (`.github/workflows/publish-runtime-manifest.yml`):

- Arroxy's generator and validator run in a job with a read-only token and no secrets. Signing uses `openssl` in a job that never runs Arroxy code, and only the publish job can write. The workflow pins the public key from `RuntimeBinaryTrust.ts` and fails when the two differ, so a key rotation updates both.
- Every release carries exactly v1 and v2, each with its `.sig`. A run missing either fails.
- Before signing, every download URL must be on a known source (yt-dlp's GitHub releases, its SourceForge mirror, or the `ffmpeg-*` releases there). A new yt-dlp source needs that list updated too.
- Validating v2 installs and runs the Linux FFmpeg package.
- A manual run accepts `arroxy_ref` (default `main`). Any other ref creates a draft release only, for checking an Arroxy branch before it merges. Scheduled runs always use `main`.
- Each run from `main` publishes a new release marked latest, then checks that `/releases/latest/download/` serves its files with valid signatures. A run that fails before publishing leaves the previous latest in place.

## Manifest versions

Two manifests are published side by side, signed with the same key:

| File                   | Read by                  | Entries                          |
| ---------------------- | ------------------------ | -------------------------------- |
| `runtime-index-v1.json` | Arroxy 0.6.2 and earlier | yt-dlp only                      |
| `runtime-index-v2.json` | current builds           | yt-dlp, plus the pinned FFmpeg packages |

v1 must never carry anything but yt-dlp: its readers parse entries with a closed schema, so one FFmpeg entry fails the whole manifest and drops them to stale yt-dlp. v2 skips entry kinds it does not recognise, so adding a kind later does not repeat this. Keep publishing v1 for as long as those versions are in use.

## Update model

Runtime startup resolves the latest Arroxy runtime manifest from:

```text
https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v2.json
```

That `latest` pointer is for Arroxy's manifest only, which is why FFmpeg package releases in the same repository are published with `--latest=false`. The manifest contents must list immutable upstream artifact URLs with concrete release versions, sizes, and SHA-256 hashes. Manifest validation rejects artifact URLs that contain `/latest`, requires HTTPS, and allowlists provider hosts.

Each `RuntimeBinaryIndexService` instance loads the index once and caches it in memory. A newly published signed remote manifest is therefore picked up by a fresh app/service run, normally after restart, not by polling during an existing session.

## yt-dlp candidate order

The build-time manifest generator resolves and verifies yt-dlp artifacts in this order:

1. GitHub nightly: `yt-dlp/yt-dlp-nightly-builds`
2. GitHub stable: `yt-dlp/yt-dlp`
3. SourceForge stable mirror: `yt-dlp.mirror`

For each source, the generator reads the release's `SHA2-256SUMS`, records the artifact size and SHA-256, and emits raw executable entries for:

| Platform | Arch        | Asset name              | Executable path |
| -------- | ----------- | ----------------------- | --------------- |
| Windows  | x64, arm64  | `yt-dlp.exe`            | `yt-dlp.exe`    |
| macOS    | x64, arm64  | `yt-dlp_macos`          | `yt-dlp`        |
| Linux    | x64         | `yt-dlp_linux`          | `yt-dlp`        |
| Linux    | arm64       | `yt-dlp_linux_aarch64`  | `yt-dlp`        |

`runtimeEntriesForCurrentTarget` filters entries to the current OS/architecture without reordering them, so the manifest order is the runtime fallback order.

## Runtime fallback chain

`BinaryManager.resolveYtDlp()` tries candidates in this order:

1. Manual override from settings.
2. `ARROXY_YT_DLP_PATH`.
3. Approved runtime manifest entries, in manifest order.
4. Valid managed artifact cache entries, newest installed first.
5. System `PATH` as the last resort.

The runtime index source order is separate:

1. Signed local manifest override (`ARROXY_RUNTIME_INDEX_FILE` + `ARROXY_RUNTIME_INDEX_SIG_FILE`; optional `ARROXY_RUNTIME_INDEX_PUBLIC_KEY_FILE`).
2. Signed remote Arroxy manifest.
3. Last-known-good cached manifest.
4. Bundled fallback index.

Step 2's URLs can be overridden for debugging with `ARROXY_RUNTIME_INDEX_URL` and `ARROXY_RUNTIME_INDEX_SIG_URL`. Setting either to `off` or `0` disables the remote fetch entirely, which drops the chain to the last-known-good manifest when one exists and to the bundled index otherwise — the quickest way to measure how much of startup the remote index fetch accounts for. Measured on macOS arm64 it is worth about 2.0s of the yt-dlp resolve branch.

The bundled fallback index is intentionally narrow: pinned GitHub stable yt-dlp entries plus the approved FFmpeg packages. It exists to keep first-run dependency resolution possible when the remote manifest cannot be fetched or verified.

## Startup timing in the log

`main.log` records the shape of every warmup. Each resolve branch emits `Warmup branch settled` with its `branch` and `elapsedMs` when it finishes, and the run ends with `Warmup completed` carrying `totalMs`, per-branch `branches`, and `gatedBy` — the branch that actually held completion open.

Read them together when a startup is reported as slow:

- `gatedBy` names the branch to investigate; the others finished earlier and are not the cause.
- A branch that logged no `Warmup branch settled` line at all never finished. The `Warmup completed` summary is written at the end, so a hang produces settled lines for the branches that did complete and silence for the one that did not.
- The token branch is not awaited and therefore never appears as `gatedBy`. Its `branches.token` entry stays `0` when it had not settled by the time warmup completed, which is expected rather than a fault — the first YouTube probe mints on demand.

## Local development

Useful commands:

```bash
bun run runtime-manifest:generate
bun run runtime-manifest:validate
bun run runtime-manifest:sign
bun run runtime-manifest:local
bun run dev:runtime-manifest
bun run dev:local-manifest
```

Use `dev:local-manifest` when changing generator behavior and testing the app against a freshly generated signed local manifest. `generate` writes v1 to `--out` and v2 next to it (`--out-v2` overrides); `local` writes and signs v2, the file current builds read.
