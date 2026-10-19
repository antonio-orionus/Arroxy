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

- It signs and validates v2 only when the generator writes one, and expects exactly the files written: 2 or 4.
- Validating v2 installs and runs the Linux FFmpeg package.
- A manual run accepts `arroxy_ref` (default `main`), to generate from an Arroxy branch before it merges. Scheduled runs always use `main`.
- Each run publishes a new release marked latest. A run that fails leaves the previous latest in place.

## Manifest versions

Two manifests are published side by side, signed with the same key:

| File                   | Read by                  | Entries                          |
| ---------------------- | ------------------------ | -------------------------------- |
| `runtime-index-v1.json` | Arroxy 0.6.2 and earlier | yt-dlp only                      |
| `runtime-index-v2.json` | current builds           | yt-dlp, plus the pinned FFmpeg packages |

v1 must never carry anything but yt-dlp: its readers parse entries with a closed schema, so one FFmpeg entry fails the whole manifest and drops them to stale yt-dlp. v2 skips entry kinds it does not recognise, so adding a kind later does not repeat this. A v2 reader also drops, and logs, any entry of a known kind it cannot use (a newer format, provider, channel, arch or host) and keeps the rest; it rejects the index only when the envelope is malformed or nothing usable is left for its platform and arch. Its rules ship frozen in every install, so this is what keeps an index change from freezing older installs on their cached copy. The generator and `validate` stay strict: any invalid entry fails them, so a bad entry is never published. Keep publishing v1 for as long as those versions are in use.

## Update model

Runtime startup resolves the latest Arroxy runtime manifest from:

```text
https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/latest/download/runtime-index-v2.json
```

That `latest` pointer is for Arroxy's manifest only, which is why FFmpeg package releases in the same repository are published with `--latest=false`. The manifest contents must list immutable upstream artifact URLs with concrete release versions, sizes, and SHA-256 hashes. Manifest validation rejects artifact URLs that contain `/latest`, requires HTTPS, and accepts yt-dlp URLs and mirrors only under the release paths of its sources (`github.com/yt-dlp/yt-dlp/releases/download/`, `github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/`, SourceForge `projects/yt-dlp.mirror`), and FFmpeg packages only as `antonio-orionus/arroxy-runtime-binaries` release assets.

Each `RuntimeBinaryIndexService` instance loads the index once and caches it in memory, including a last-known-good or bundled fallback, so an offline machine does not wait on the network for every resolve. A forced re-check (the setup screen's "Try again") invalidates it and fetches the remote index again; a fallback picked only because its caller cancelled is never kept. Otherwise a newly published manifest is picked up after restart, not by polling. Index, signature and checksum fetches have their own short deadline (`TEXT_FETCH_DEADLINE_MS`), separate from binary downloads, so a network that silently drops traffic fails over to the cached index quickly.

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
