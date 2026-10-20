# ytdlp-errors

[![npm](https://img.shields.io/npm/v/ytdlp-errors.svg)](https://www.npmjs.com/package/ytdlp-errors) [![CI](https://github.com/antonio-orionus/Arroxy/actions/workflows/ci.yml/badge.svg)](https://github.com/antonio-orionus/Arroxy/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Classify yt-dlp stderr into a closed taxonomy of error kinds. Zero dependencies, pure regex, ESM + CJS, snapshot-tested against upstream yt-dlp source.

```bash
bun add ytdlp-errors
# pnpm add ytdlp-errors  |  yarn add ytdlp-errors
```

Node ≥ 18. ESM + CJS dual export.

---

- [Quick start](#quick-start)
- [Why this exists](#why-this-exists)
- [Error kinds](#error-kinds)
- [API](#api)
  - [Extension hook](#extension-hook)
- [Adapter recipes](#adapter-recipes)
  - [yt-dlp-wrap](#yt-dlp-wrap)
  - [youtube-dl-exec](#youtube-dl-exec)
  - [ytdlp-nodejs](#ytdlp-nodejs)
- [Handling `unknown`](#handling-unknown)
- [Stability contract](#stability-contract)
- [Upstream sync](#upstream-sync)
- [Development](#development)
- [License](#license)

---

## Quick start

```ts
import { classifyYtDlpStderr, errorKindMetadata } from 'ytdlp-errors';

const { kind, raw } = classifyYtDlpStderr(stderrBlob);
// kind: 'botBlock' | 'ipBlock' | 'rateLimit' | 'geoBlocked' | ...

if (kind !== 'unknown') {
  const meta = errorKindMetadata(kind);
  console.log(meta.code);           // 'YTDLP_BOT_BLOCK'
  console.log(meta.suggestedFlags); // ['--cookies-from-browser', '--cookies']
  console.log(meta.recoverable);    // true
  console.log(meta.userActionable); // true
}
```

## Why this exists

Every JS/TS wrapper around yt-dlp (`yt-dlp-wrap`, `youtube-dl-exec`, `ytdlp-nodejs`, ...) hands you raw stderr and expects you to figure out whether it's a bot block, a geo block, or a disk-full error. yt-dlp emits no structured error channel — its [own README](https://github.com/yt-dlp/yt-dlp#embedding-yt-dlp) recommends Python users embed the library directly; CLI consumers are left parsing text.

This package fills the gap: a curated regex taxonomy of every error kind yt-dlp can produce, audited against the upstream source on every release, with stable codes and metadata that drive UX without locking you to any particular wrapper.

## Error kinds

| Kind | Code | Recoverable? | User-actionable? | Typical cause |
|---|---|---|---|---|
| `botBlock` | `YTDLP_BOT_BLOCK` | yes | yes | YouTube anti-bot challenge |
| `ipBlock` | `YTDLP_IP_BLOCK` | yes | yes | IP-level ban from extractor host |
| `rateLimit` | `YTDLP_RATE_LIMIT` | yes | yes | HTTP 429 or extractor throttle |
| `ageRestricted` | `YTDLP_AGE_RESTRICTED` | yes | yes | Login required to confirm age |
| `unavailable` | `YTDLP_UNAVAILABLE` | no | no | Removed / private / format gone |
| `geoBlocked` | `YTDLP_GEO_BLOCKED` | yes | yes | Region restriction |
| `drmProtected` | `YTDLP_DRM_PROTECTED` | no | no | DRM (Widevine/PlayReady) |
| `loginRequired` | `YTDLP_LOGIN_REQUIRED` | yes | yes | Subscriber-only / private |
| `outOfDiskSpace` | `YTDLP_OUT_OF_DISK_SPACE` | yes | yes | ENOSPC during write/merge |
| `outputNotWritable` | `YTDLP_OUTPUT_NOT_WRITABLE` | yes | yes | Output folder refuses writes: permission denied, read-only drive, or a privacy-protected folder |
| `chunkTransferFailure` | `YTDLP_CHUNK_TRANSFER_FAILURE` | yes | no | Ranged HTTP truncation; retries exhausted |
| `missingDependency` | `YTDLP_MISSING_DEPENDENCY` | yes | yes | Required binary such as ffmpeg is missing |
| `postprocessFailure` | `YTDLP_POSTPROCESS_FAILURE` | yes | no | ffmpeg mux/convert/remux failure |
| `parse` | `YTDLP_PARSE_FAILURE` | no | no | `--dump-json` output unparseable |
| `network` | `YTDLP_NETWORK` | yes | no | Transport-level error |
| `unsupportedUrl` | `YTDLP_UNSUPPORTED_URL` | no | yes | URL not handled by any extractor, or not a URL |
| `outputPathExpands` | `YTDLP_OUTPUT_PATH_EXPANDS` | yes | yes | Output folder name holds `$NAME`, `%NAME%` or a leading `~`, which yt-dlp expands; set by the host before spawning |
| `unknown` | `YTDLP_UNKNOWN` | no | no | No pattern matched; render `raw` |

`unsupportedUrl` is classified from yt-dlp's `Unsupported URL:`, `No suitable extractor ... found for URL` and `... is not a valid URL` lines. Hosts can also set it from their own URL validation before yt-dlp is spawned.

`outputPathExpands` is never classified: yt-dlp runs `os.path.expandvars(os.path.expanduser(…))` over `--paths` and `-o` and writes to the result without a word, so a folder named `$HOME` or `%USERPROFILE%` sends the download somewhere else. A host that checks the folder before spawning sets it.

## API

| Export | Purpose |
|---|---|
| `classifyYtDlpStderr(stderr, opts?)` | Classify a stderr blob. Returns `{ kind, raw }`. |
| `classifyAll(stderr, opts?)` | Classify each `ERROR:` line independently — use with `--ignore-errors` on playlists. |
| `extractLastError(stderr)` | Pull the most useful single-line description for logs. Returns `string \| null`. |
| `isPostprocessFailure(raw)` | Predicate for ENOSPC-masquerading-as-ffmpeg detection. |
| `rateLimitEvidence(stderr)` | Which rate limit a run shows: `'rateLimited'` (HTTP 429), `'sessionRateLimited'` (YouTube's session/account limit), or `null`. Subtitle 429s are ignored. |
| `rateLimitLine(stderr)` | The trimmed stderr line behind `rateLimitEvidence`, the session limit first. |
| `accountCookiesRejected(stderr)` | True when YouTube stopped honouring the account cookies passed to the run. |
| `sabrSkippedClient(line)` | The player client whose https formats were dropped for missing URLs (SABR), or `null`. |
| `RATE_LIMIT_EVIDENCE`, `RateLimitEvidence` | Closed enum of rate-limit evidence. |
| `errorKindMetadata(kind)` | Stable code + recoverability + suggested flags + docs URL. |
| `YT_DLP_ERROR_KINDS` | Closed enum tuple. |
| `YtDlpErrorKind` | Union type. |
| `ERROR_KIND_METADATA` | Full metadata table. |
| `ERROR_PATTERNS`, `SIGNAL_PATTERNS` | Internal regex tables (not stable — exposed for debugging only). |

### Extension hook

For site-specific patterns that don't belong upstream:

```ts
classifyYtDlpStderr(stderr, {
  extraPatterns: {
    ipBlock: /custom-site-ban-string/i,
    rateLimit: [/throttled by upstream/i, /retry-after exceeded/i]
  }
});
```

Custom patterns run **before** built-ins. Keys must be existing `ClassifierKind` values — to add a new category, open a PR.

## Adapter recipes

### `yt-dlp-wrap`

```ts
import YTDlpWrap from 'yt-dlp-wrap';
import { classifyYtDlpStderr, extractLastError } from 'ytdlp-errors';

const ytdlp = new YTDlpWrap();
const proc = ytdlp.exec(['-f', 'best', url]);
let stderr = '';
proc.on('error', (err) => { stderr += String(err); });
proc.on('close', () => {
  const { kind } = classifyYtDlpStderr(stderr);
  if (kind !== 'unknown') console.error('classified:', kind);
  else console.error('raw:', extractLastError(stderr));
});
```

### `youtube-dl-exec`

```ts
import ytdl from 'youtube-dl-exec';
import { classifyYtDlpStderr } from 'ytdlp-errors';

try {
  await ytdl(url, { format: 'best' });
} catch (err) {
  const { kind, raw } = classifyYtDlpStderr(err.stderr ?? String(err));
  console.error(kind, raw);
}
```

### `ytdlp-nodejs`

```ts
import { YtDlp } from 'ytdlp-nodejs';
import { classifyYtDlpStderr } from 'ytdlp-errors';

const ytdlp = new YtDlp();
const stream = ytdlp.stream(url);
let stderr = '';
stream.on('error', (chunk) => { stderr += chunk; });
stream.on('end', () => {
  if (stderr) console.error(classifyYtDlpStderr(stderr).kind);
});
```

## Handling `unknown`

`classifyYtDlpStderr` never throws. When no pattern matches, you get `{ kind: 'unknown', raw }`. Surface `raw` verbatim — the upstream snapshot scan opens a PR when new unrecognized strings appear, so unknowns shrink over time.

## Stability contract

- **`code` strings are public API.** Host apps key i18n strings, analytics labels, and logs on them. Golden-tested in `tests/codes-golden.test.ts`. Changing a code is a major SemVer bump.
- **`YtDlpErrorKind` is a closed enum.** Adding a kind is a minor bump; consumers' exhaustive switches will warn. Removing a kind is a major bump.
- **Regex internals are not public API.** `src/patterns.ts` and `ERROR_PATTERNS` are internal. Tweaks that don't change classification outcomes for known strings ship as patch.
- **Upstream snapshot drives audit.** `data/known-yt-dlp-strings.json` (auto-generated) and `data/known-extractor-strings.json` (curated) pin the lib to specific yt-dlp source strings. CI fails if a snapshot entry's declared `kind` stops classifying correctly.

## Upstream sync

`scripts/scan-yt-dlp-source.mjs` clones yt-dlp at the pin in `data/yt-dlp-version.json`, greps for `report_error` / `raise *Error` / `raise_*` call sites, dedupes by content hash, and appends new strings to `data/known-yt-dlp-strings.json`. Each entry carries `source` (file:line), `call` (which API emitted it), `fragment` (the string), and `kind` (`null` until triaged). The scan covers yt-dlp core, downloaders, postprocessors, `extractor/common.py`, and the YouTube extractor; other per-site extractors are skipped. `--baseline <commit>` limits additions to strings that are new since that commit.

Every Monday the `ytdlp-errors Upstream Scan` workflow checks for a new stable yt-dlp release, bumps the pin, scans with the previous pin as baseline, and opens a PR. Reviewers triage `kind: null` entries on that PR before merging.

Coverage tests (`tests/upstream-coverage.test.ts`) assert every non-null entry round-trips through `classifyYtDlpStderr` to its declared kind. Fixture blobs in `tests/fixtures/yt-dlp-stderr/` provide realistic full-stderr samples per kind.

## Development

```bash
bun run test           # run tests with vitest
bun run typecheck      # type-check without emitting
bun run build          # compile to dist/
bun run scan-upstream  # re-scan upstream yt-dlp source
```

## License

MIT © Antonio Orionus
