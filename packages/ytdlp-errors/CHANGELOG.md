# Changelog

## Unreleased

### Added

- `outputPathExpands` (code `YTDLP_OUTPUT_PATH_EXPANDS`): an output folder whose name yt-dlp would expand (`$NAME`, `%NAME%`, a leading `~`), so the files would land elsewhere. yt-dlp never reports it, so the classifier never returns it and `ClassifierKind` leaves it out; a host sets it from its own check before spawning.

## 1.3.0 — signals, stderr-classified unsupported URLs, output folder write failures

1.2.0 was never published; its changes ship in 1.3.0 and are listed under 1.2.0 below.

### Added

- `rateLimitEvidence(stderr)` and `rateLimitLine(stderr)`: tell an HTTP 429 (`rateLimited`) from YouTube's session or account limit (`sessionRateLimited`), and return the line that shows it. A subtitle 429 is not counted.
- `accountCookiesRejected(stderr)`: YouTube's "provided YouTube account cookies are no longer valid" warning.
- `sabrSkippedClient(line)`: the player client named in "Some {client} client https formats have been skipped as they are missing a URL".
- `RATE_LIMIT_EVIDENCE` / `RateLimitEvidence`, and the `SIGNAL_PATTERNS` table behind the new helpers.
- `unsupportedUrl` fixtures.

### Changed

- `classifyYtDlpStderr` now returns `unsupportedUrl` for yt-dlp's `Unsupported URL: …`, `No suitable extractor (…) found for URL …` and `'…' is not a valid URL` lines. It is checked first, so words in the echoed URL cannot win. These lines classified as `unknown` before (or as whatever the URL text happened to match).
- `ClassifierKind` now includes `unsupportedUrl`, so `extraPatterns` accepts it.

## 1.2.0 — output folder write failures (unpublished, shipped in 1.3.0)

### Added

- Added `outputNotWritable` for an output or temp folder that refuses writes: `Permission denied` / `Access is denied` (EACCES), `Read-only file system` (EROFS), and `Operation not permitted` (EPERM, e.g. a macOS privacy-protected folder) on yt-dlp's open-for-writing, write-data, and create-directory call sites, plus its `Cannot write ... file` messages.
- Added stable code `YTDLP_OUTPUT_NOT_WRITABLE`, metadata, README coverage, and fixture coverage.

### Changed

- `Postprocessing: Unable to create directory: [Errno 13] ...` now classifies as `outputNotWritable` instead of `postprocessFailure`. ENOSPC on the same call sites still classifies as `outOfDiskSpace`.

## 1.1.0 — missing dependency classification

### Added

- Added `missingDependency` as a first-class error kind for missing `ffmpeg` / `ffprobe`.
- Added stable code `YTDLP_MISSING_DEPENDENCY`, metadata, README coverage, and fixture coverage.

### Changed

- Classified yt-dlp's generic `unable to download video data` wrapper as `network`.
- Updated the upstream yt-dlp snapshot so no entries remain with `kind: null`.
- Hardened the upstream scan workflow for Node 24 actions, annotated tag dereferencing, and inline validation before generated PRs are opened.

## 1.0.0 — initial release

First public release. Curated regex taxonomy of yt-dlp error kinds, snapshot-anchored to the upstream source.

### Public API

- `classifyYtDlpStderr(stderr, opts?)` — pure stderr → `{ kind, raw }` classifier
- `classifyAll(stderr, opts?)` — per-line classification for `--ignore-errors` runs
- `extractLastError(stderr)` — pull the most useful single-line description
- `isPostprocessFailure(raw)` — predicate for ENOSPC-masquerading-as-ffmpeg detection
- `errorKindMetadata(kind)` — stable code, recoverability, suggested yt-dlp flags, docs URL
- `YT_DLP_ERROR_KINDS`, `YtDlpErrorKind`, `ERROR_KIND_METADATA`, `ERROR_PATTERNS`

### Kinds (15 total)

`botBlock`, `ipBlock`, `rateLimit`, `ageRestricted`, `unavailable`, `geoBlocked`, `drmProtected`, `loginRequired`, `outOfDiskSpace`, `chunkTransferFailure`, `postprocessFailure`, `parse`, `network`, `unsupportedUrl`, `unknown`.

### Upstream pin

- yt-dlp `2026.03.17` (`04d6974f502bbdfaed72c624344f262e30ad9708`)
- Weekly CI cron tracks new releases and opens PR on snapshot drift.

### Coverage

- Fixture corpus: realistic stderr blobs per kind under `tests/fixtures/yt-dlp-stderr/`.
- `data/known-yt-dlp-strings.json`: auto-extracted yt-dlp source strings, each tagged with `kind` for round-trip testing.
- `data/known-extractor-strings.json`: hand-curated YouTube / extractor-passthrough strings (those that don't originate in yt-dlp source).
- `tests/codes-golden.test.ts`: stable-code contract — any change requires a major SemVer bump.
