# yt-dlp-bridge

[![registry version](https://img.shields.io/npm/v/yt-dlp-bridge.svg)](https://www.npmjs.com/package/yt-dlp-bridge)
[![registry downloads](https://img.shields.io/npm/dm/yt-dlp-bridge.svg)](https://www.npmjs.com/package/yt-dlp-bridge)
[![CI](https://github.com/antonio-orionus/Arroxy/actions/workflows/ci.yml/badge.svg)](https://github.com/antonio-orionus/Arroxy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript library for safe, no-shell `yt-dlp` integration in Node.js services: workflow planning, argv generation, command facts, environment checks, process execution, output parsing, secret redaction, filesystem policy, and structured errors.

`yt-dlp-bridge` is intentionally app-agnostic. It is used by Arroxy and `yt-dlp-mcp-server`, but it does not own Electron token minting, binary resolution, retries, queue lifecycle, settings stores, plugin installation, or UI progress policy.

Source and contributions live in the Arroxy monorepo at [`packages/yt-dlp-bridge`](https://github.com/antonio-orionus/Arroxy/tree/main/packages/yt-dlp-bridge).

- [Install](#install)
- [Features](#features)
- [What changed in 0.5.0](#what-changed-in-050)
- [What changed in 0.4.0](#what-changed-in-040)
- [What changed in 0.3.0](#what-changed-in-030)
- [What changed in 0.2.0](#what-changed-in-020)
- [Usage](#usage)
- [API](#api)
- [Configuration](#configuration)
- [Requirements](#requirements)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Install

```bash
bun add yt-dlp-bridge
# pnpm add yt-dlp-bridge
# yarn add yt-dlp-bridge
```

Requires Node.js >= 22.13 and ESM.

## Features

- One canonical `planWorkflow(input, options?)` planner with caller-owned app inputs and managed/server schema inputs.
- Caller-owned probe/media/subtitle inputs for apps that already resolved output directories, format selection, subtitles, embeds, resume info JSON, and audio conversion policy.
- Managed schema inputs for inspect, media, audio, subtitles, thumbnail, playlist, postprocess, and expert/raw workflows that need bridge-owned normalization.
- Workflow facts for media-vs-sidecar behavior, output roots/templates, playlist sentinel scope, subtitle format, dependencies, risks, and side effects.
- Safe argv arrays instead of shell command strings.
- Managed output policy for output roots, temp roots, archive files, overwrite behavior, and parent-directory traversal checks.
- Secret redaction for auth flags, cookies, PO tokens, visitor data, proxies, signed URLs, and command previews.
- Parsers for JSON lines, format lists, subtitle lists, thumbnail lists, progress output, final output paths, and live yt-dlp output events.
- Low-level process runner using `spawn` with `shell: false`: streams whole output lines (yt-dlp's `\r` progress redraws included), keeps a bounded tail of output, and on timeout or cancel kills the whole process tree, never a reaped pid.
- A Zod schema for yt-dlp's `info_dict` (`--dump-json` / `--dump-single-json` output).
- Source-derived option catalog generated from `yt_dlp.options.create_parser`.
- ESM and TypeScript declarations.

## What changed in 0.6.2

0.6.2 requires `ytdlp-errors` 1.5.0.

- `--paths temp:`, `--load-info-json` and `--download-archive` take a path inside the run's folder as `./<path>`, and `--paths` values end in `/` (a temp root that is the output root itself is `temp:./`). yt-dlp expands these with no escape and strips `--paths` values, so since 0.6.0 a temp folder such as `<directory>/~/tmp` went to the home folder, and one ending in a space lost it. yt-dlp now names temp files `./<path>/…` in its output on POSIX; resolve them against `plan.cwd`. A variable below the folder cannot be protected there (`$NAME` or `${NAME}`; on Windows also a `%NAME%` pair, `%%` and `$$`), so `output.tempDirectory`, `loadInfoJsonPath`, a managed temp root inside the output root or a download archive that names one now throws.
- A relative cookie jar (`auth.cookiesFile`, `YTDLP_MCP_COOKIES_FILE`), `auth.netrcLocation` or plugin folder is resolved against the caller's working directory when a plan that writes files is made. Since 0.6.0 such a plan runs in its output folder, where yt-dlp looked for them instead; plans that write no files run in the caller's directory and take the path as given. Each path is read the way yt-dlp reads its flag: a cookie jar that starts with `~` or a variable goes as given, and a relative one throws when the caller's directory names a variable; a netrc that starts with `~` goes as given; plugin folders are never expanded, and the sentinel `default` goes as given. The environment check expands a leading `~` in `YTDLP_MCP_COOKIES_FILE`, and leaves `fileExists` unset for a path with a variable.

## What changed in 0.6.1

0.6.1 requires `ytdlp-errors` 1.5.0.

- `requested-formats` events carry `filesizeFromBitrate`: bitrate × duration, as yt-dlp's `filesize_from_tbr`. yt-dlp leaves `filesize_approx` empty for a fragmented (HLS/DASH manifest) stream, so this is all such a stream has before it starts. `YT_DLP_REQUESTED_FORMATS_TEMPLATE` now also prints `tbr` and the duration.
- `YtDlpDownloadProgressTracker` weighs each stream by the best size known for it (exact, an estimate from its finished fragments, `filesizeApprox`, then `filesizeFromBitrate`), and a stream with none by the mean of the others; equal shares remain only when no size is known. A stream of unknown size moves by its fragments, and the percent never goes back when a size turns out larger. Before, a small video then an HLS audio held at 50% through the audio's first fragment, then fell back.

## What changed in 0.6.0

0.6.0 contains breaking changes and requires `ytdlp-errors` 1.4.0.

- **Breaking:** a plan that writes files now carries `cwd`, and every path in its `args` is relative to it. Run it there (`runCommand(…, {cwd: plan.cwd})`): run elsewhere, the files land in the wrong folder. Create the folder first if it may not exist (`mkdir(plan.cwd, {recursive: true})`): yt-dlp used to make it through `--paths home`, and a spawn in a missing folder fails with `ENOENT`. Caller plans run in `output.directory`; `--paths home:` is gone, and `output.tempDirectory`, `-o infojson:`, the subtitle subfolder and a `resume.loadInfoJsonPath` inside the folder become relative. Managed plans run in the output root; the temp root and the download archive are relative when they are inside it. yt-dlp expands `$NAME`, `%NAME%` and `~` in every path it is given, with no escape on POSIX for `--paths`, and strips trailing spaces from `--paths` values. So a folder such as `$HOME`, `%USERPROFILE%` or `Downloads ` (trailing space) wrote somewhere else; now its name never reaches argv.
- **Breaking:** `output.tempDirectory` must be inside `output.directory`; a plan with one outside it throws.
- Caller subtitles take planned tracks: `subtitles: {tracks: [{key, auto}], format}`. Each key goes to `--sub-langs` as an exact, case-sensitive, escaped match, and the plan sets `--write-subs` only for a manual track and `--write-auto-subs` only for an automatic caption. The flags cover the whole run and yt-dlp takes a key from the manual tracks first, so a plan with both kinds should ask for an automatic caption only under a key the manual tracks lack (on YouTube, its `<lang>-orig` key). The languages form (`languages`, `writeAuto`, `autoOnly`) stays, sent as given, for a caller that cannot plan the tracks; on YouTube a bare code there also matches machine translations.
- Caller subtitles take `loadInfoJsonPath`: yt-dlp fetches the subtitle URLs stored in that info-json instead of extracting the video again (and extracts it again only if one of them fails). The URL is not passed.
- New `subtitle-listing` workflow: `-J` with `--write-subs --write-auto-subs --sub-langs all`, which fills `subtitles` and `automatic_captions` for extractors that list them only when asked (Vimeo, TikTok, Bilibili and others) and writes no files. Its JSON on stdout is what a caller plans tracks from, and what `loadInfoJsonPath` then loads. Exhaustive `switch` statements over `WorkflowPlan['kind']` need the new case.
- New `output.report`: `finalPath` has yt-dlp append the media's absolute path once every postprocessor and the move are done (`--print-to-file after_move:filepath`); `subtitles` has it append `requested_subtitles` as JSON, with each track's `filepath`, also under `--skip-download` (`after_video`). Both files must be inside `output.directory`.
- New `templateLiteral(text)`, also from the new `yt-dlp-bridge/output-template` subpath: literal text for an output template. Each `%`, `$` and `~` becomes an absent field whose default is that sign (`%(_absent|$)s`), which yt-dlp's expansion cannot see through. `%%` is not used: on Windows, ntpath pairs `%` signs, and a field before a `%%` lets a literal `%NAME%` expand.
- **Breaking:** progress is read from yt-dlp's numbers, not its human-readable `[download]  42.0% of …` line. The `progress` event no longer carries `percent`, `total`, `speed` or `eta`; it is now only the fallback for other lines (`raw`).
- Caller media, caller subtitles and managed download plans pass `--progress-template` with `YT_DLP_PROGRESS_TEMPLATE`, a prefixed JSON line per update. Caller media plans and every managed download plan (media, audio, subtitles, thumbnail and playlist) also pass `--print before_dl:` with `YT_DLP_REQUESTED_FORMATS_TEMPLATE`, one prefixed stdout line per video; caller media plans pass `--no-quiet` so that print does not silence yt-dlp's other output.
- `parseYtDlpOutputLine` emits two new event kinds: `download-progress` (`status`, `formatId`, `downloadedBytes`, `totalBytes`, `totalBytesEstimate`, `speedBps`, `etaSeconds`, `elapsedSeconds`, `fragmentIndex`, `fragmentCount`) and `requested-formats` (the streams yt-dlp is about to download, in order, with `filesize` / `filesizeApprox`). Exhaustive `switch` statements over `YtDlpOutputEvent` need the two new cases.
- New `YtDlpDownloadProgressTracker` turns those events into one percent over every stream of a video, so the audio download after the video counts instead of restarting at 0%. It also estimates the time left over all remaining streams.
- An audio conversion now converts a stream already in the target codec when the source has one (AAC 140 for m4a on YouTube, Opus 251 for opus). yt-dlp copies such a stream instead of re-encoding it, so there is no second lossy pass; `--audio-quality` does not apply to it. A stream below 96 kbps (`AUDIO_CONVERSION_COPY_MIN_KBPS`) is not worth copying: the best stream is re-encoded instead. Each tier of the source chain (the source's track, then any) tries non-DRC before DRC, and every stereo stream before Dolby surround, which libopus cannot take. The "original" track filter no longer matches a stream with no `format_note`.
- With `audio.convert`, a caller's `selection.formatSelector` (and `formatSort`) now picks the stream to convert, in place of the bridge's source chain. `--audio-format best` (`target: 'best'`) extracts the audio and keeps its codec where yt-dlp can.
- New `yt-dlp-bridge/audio-conversion` subpath: `audioConversionCopies(target, acodec)` says whether converting a stream to `target` copies it, `audioConversionCopyFilter(target)` is the `-f` filter for such a stream, `audioConversionOutcome(target, {ext, acodec})` gives the file's extension and whether the audio is kept as is, `audioCodecPreference(acodec)` ranks a codec as yt-dlp's format sorter does, and `audioConversionSourceSelector(target)` is the `-f` the planner gives a conversion that names no stream.
- An MP3 conversion also copies an MP3 stream inside an MP4 (`acodec` `mp4a.40.34`), where it used to pass it over and re-encode another one.
- A `[VideoRemuxer] Remuxing video from … to …; Destination: <path>` or `[VideoConvertor] Converting video …` line now gives its destination in the `postprocess` event; it came out without a path before, so a consumer following the file kept the pre-remux path, which yt-dlp deletes.
- A caller's directory that reaches `-o` no longer loses or expands `%` signs: a folder named `100%% done` or containing `%(id)s` keeps its name. Since every path is now relative to the plan's `cwd`, the folder text no longer reaches argv at all.

## What changed in 0.5.0

0.5.0 contains breaking changes and requires `ytdlp-errors` 1.3.0. 0.4.0 was never published; its change is listed under 0.4.0 below and ships in 0.5.0.

- **Breaking:** `CONFIG` is gone from `yt-dlp-bridge/config`. The package no longer reads `YTDLP_MCP_*` or the home directory at import: `planWorkflow` and `checkEnvironment` call `loadConfig()` when no `config` is passed, so they see the environment as it is at call time.
- **Breaking:** `parseProgress`, `ProgressEvent`, `ProgressEventPhaseSchema`/`ProgressEventPhase` and `PROGRESS_EVENT_PHASES` are removed. `parseYtDlpOutputLine` is the one progress parser: its `progress` event now also carries `total`, `speed` and `eta` from a `[download]` line.
- **Breaking:** `sanitizeMetadataItem` reads its input through the new `infoDictSchema`. A dict the schema rejects (a field of the wrong type, say) now sanitizes to `{}` instead of keeping the fields that happened to be valid. A playlist dict keeps only `id`, `title`, `webpageUrl`, `extractor`, `extractorKey` and `thumbnailCount`.
- **Breaking:** `SUBTITLE_MODES` is now ordered `sidecar`, `embed`, `subfolder`.
- New `yt-dlp-bridge/info` subpath: `infoDictSchema`, `ytDlpFormatSchema`, `ytDlpSubtitleTrackSchema`, the `InfoDict` / `VideoInfo` / `PlaylistInfo` / `MultiVideoInfo` / `UrlRedirectInfo` / `YtDlpFormat` / `YtDlpSubtitleTrack` types, and `isPlaylistLike` / `isUrlRedirect`.
- `runCommand` spawns the child as its own process group on Unix and kills the whole tree on timeout or cancel (`taskkill /T /F` on Windows), so an ffmpeg that yt-dlp forked no longer survives. It never signals a child that has already exited. New options: `onStdoutLine` / `onStderrLine` stream each whole, trimmed line as it arrives (if one throws, the child is killed and the run rejects with that error), and `logger` receives the warnings the runner absorbs. Output capture no longer copies the whole buffer on every chunk.
- New runner exports: `killProcessTree`, `splitOutputLines`, `createStreamTextReader`, `SPAWN_AS_PROCESS_GROUP`, and the `RunnerLogger`, `KillableProcess`, `StreamTextReader`, `StreamTextChunk` types.
- `toStructuredError` takes `unsupportedUrl` from the `ytdlp-errors` classifier instead of a regex of its own. A line such as `... is not a valid URL` still classifies; text that merely mentions an unsupported URL no longer does.
- `CallerMediaWorkflowInput` gains `downloadSections` (yt-dlp `--download-sections` values such as `*220-435`) and `forceKeyframesAtCuts`. A plan with sections lists ffmpeg as required and reports the cut as a side effect; an exact cut also reports the re-encode as a risk.
- `embed.chapters: false` now passes `--no-embed-chapters` (unless SponsorBlock marks segments as chapters). yt-dlp otherwise embeds chapters whenever `--add-metadata` is on.

## What changed in 0.4.0

- Requires `ytdlp-errors` 1.2.0. `toStructuredError` can now return `kind: 'outputNotWritable'` when the output folder refuses writes (permission denied, read-only drive, or a privacy-protected folder), with a suggested fix to grant write access or choose another output root.

## What changed in 0.3.0

- `parseYtDlpOutputLine` emits two new event kinds: `artifact` (a written description, info JSON, or thumbnail sidecar, with its `path`) and `transfer-retry` (yt-dlp's in-process `Got error: ... Retrying (n/m)` line, with `attempt` and `total`). `postprocess` events now carry the output `path` when yt-dlp prints one. Exhaustive `switch` statements over `YtDlpOutputEvent` need the two new cases.
- Media plans always pass `--socket-timeout`. `DownloadRetryPolicy` gains an optional `socketTimeout` (seconds), defaulting to yt-dlp's own 20s via `DEFAULT_SOCKET_TIMEOUT_SECONDS`.
- A media plan that replays `resume.loadInfoJsonPath` without an explicit `downloadRetryPolicy` now uses `INFO_JSON_DOWNLOAD_RETRY_POLICY`: 3 retries and a 15s socket timeout, so a pinned, unreachable CDN host fails in about a minute instead of about seven. Fragment retries keep the default budget. Pass `downloadRetryPolicy` to keep the previous behavior.
- `redactText`, `redactArgs`, and `excerpt` accept an optional `env` argument (default `process.env`). Setting `YTDLP_MCP_UNREDACTED=true` disables redaction and excerpt truncation for local debugging. `NODE_ENV` has no effect on redaction.

## What changed in 0.2.0

`0.2.0` keeps `planWorkflow` as the single planner, but separates the public input surface into two paths:

- Use caller-owned inputs (`ProbeWorkflowInput`, `CallerMediaWorkflowInput`, `CallerSubtitlesWorkflowInput`) when your app owns job state, output folders, format selectors, subtitle mode, resume metadata, and user-facing workflow policy.
- Use managed Zod schemas (`WorkflowDownloadInputSchema`, `WorkflowInspectInputSchema`, `WorkflowPostprocessInputSchema`, `WorkflowExpertInputSchema`) when a server integration wants the bridge to normalize config, auth, network, output roots, and yt-dlp workflow options from request-like input.

Migration notes for `0.1.x` consumers:

- If you used managed download schemas only to plan app-owned downloads, map your app job to `CallerMediaWorkflowInput` or `CallerSubtitlesWorkflowInput` instead.
- `WorkflowInputSchema` validates the managed/server schema family. Caller-owned app inputs are TypeScript interfaces, so validate local job state before mapping it into the bridge.
- Media planning now includes app-oriented resume hardening, including `--continue`, chunk sizing, temp info JSON output, and `resume.loadInfoJsonPath` planning that omits the original URL.
- Embedded subtitle planning forces the safe MKV merge container and suppresses thumbnail embedding when needed for subtitle muxing.
- App runtime decisions still stay outside the package: binary selection, token minting, retries, queue lifecycle, cancellation UI, progress display, and settings persistence remain caller-owned.

## Usage

Choose the input style based on ownership. App integrations should usually start with caller-owned inputs. MCP/server-style integrations should usually start with managed schemas.

### Plan from a caller-owned app adapter

App adapters should map local state into `WorkflowInput`, then keep app-owned orchestration outside the bridge.

```ts
import { planWorkflow, type CallerMediaWorkflowInput } from "yt-dlp-bridge";

function toWorkflowInput(job: PreparedJob): CallerMediaWorkflowInput {
  return {
    kind: "media",
    url: job.url,
    output: { directory: job.outputDir, tempDirectory: job.tempDir },
    selection: {
      formatSelector: job.formatSelector,
      mergeOutputFormat: job.mergeOutputFormat
    },
    subtitles: job.embedSubtitles
      ? { embed: true, languages: job.subtitleLanguages, writeAuto: job.writeAutoSubtitles }
      : undefined,
    embed: {
      metadata: job.embedMetadata,
      thumbnail: job.embedThumbnail,
      chapters: job.embedChapters
    },
    resume: job.infoJsonPath ? { loadInfoJsonPath: job.infoJsonPath } : undefined
  };
}

const plan = planWorkflow(toWorkflowInput(job));

console.log(plan.args);
console.log(plan.facts.sideEffects);
```

The bridge owns yt-dlp semantics such as audio conversion arguments, subtitle/embed container rules, playlist sentinel logic, dependency reasons, risk/side-effect facts, output path facts, resume argv, and redaction. The adapter owns local job models, runtime selection, retries, token minting, cancellation, progress policy, and user-facing status.

### Plan a managed workflow

Use managed schemas when a consumer accepts request-like input and wants the bridge to normalize defaults before planning a stable `yt-dlp` argv plus facts.

```ts
import { WorkflowDownloadInputSchema, planWorkflow } from "yt-dlp-bridge";
import { loadConfig } from "yt-dlp-bridge/config";

const config = loadConfig({
  YTDLP_MCP_OUTPUT_ROOT: "/srv/downloads",
  YTDLP_MCP_TEMP_ROOT: "/srv/downloads/.tmp"
});

const input = WorkflowDownloadInputSchema.parse({
  kind: "audio",
  url: "https://www.youtube.com/watch?v=BaW_jenozKc",
  postprocess: { audioFormat: "mp3" },
  output: { outputTemplate: "%(title).180B [%(id)s].%(ext)s" }
});

const plan = planWorkflow(input, {
  config,
  configFiles: { mode: "disabled" },
  plugins: { mode: "native" }
});

console.log(plan.args);
console.log(plan.redactedArgs);
console.log(plan.facts.dependencies.required);
```

Managed schemas are the runtime-validation layer for this path:

```ts
import { WorkflowInputSchema } from "yt-dlp-bridge";

const input = WorkflowInputSchema.parse(request.body);
const plan = planWorkflow(input, { config });
```

`WorkflowPlan` has this shape:

```ts
{
  kind: "probe" | "subtitle-listing" | "inspect" | "media" | "audio" | "subtitles" | "thumbnail" | "playlist" | "postprocess" | "expert",
  args: string[],
  redactedArgs: string[],
  facts: {
    isMediaDownload: boolean,
    output?: {
      directory?: string,
      tempDirectory?: string,
      outputRoot?: string,
      tempRoot?: string,
      template?: string,
      allowOverwrite?: boolean
    },
    playlistScope?: {
      requestedCount: number,
      sentinel: boolean,
      ytDlpFlag: "--playlist-end" | "--playlist-items",
      ytDlpValue: string
    },
    effectiveSubtitleFormat?: "srt" | "vtt" | "ass",
    dependencies: { required: unknown[], optional: unknown[] },
    risks: string[],
    sideEffects: string[]
  }
}
```

### Probe playlists

Probe planning owns playlist mode and sentinel range behavior.

```ts
import { planWorkflow } from "yt-dlp-bridge";

const probe = planWorkflow({
  kind: "probe",
  url: "https://www.youtube.com/playlist?list=...",
  selection: {
    playlistMode: "playlist",
    playlistScope: { items: { kind: "first", count: 50 } }
  }
});

console.log(probe.args);
console.log(probe.facts.playlistScope);
```

### Parse live yt-dlp output

Use `parseYtDlpOutputLine` to turn noisy output into stable events. App-specific adapters can map these events to progress bars, queue resume evidence, logs, or MCP notifications.

```ts
import { parseYtDlpOutputLine } from "yt-dlp-bridge/parsers";

const event = parseYtDlpOutputLine('[Merger] Merging formats into "/tmp/video.mp4"');

if (event?.kind === "merge") {
  console.log(event.path);
}
```

Plans for media downloads ask yt-dlp for structured progress. Feed it to a tracker for one percent across every stream of a merged download:

```ts
import { parseYtDlpOutputLine, YtDlpDownloadProgressTracker } from "yt-dlp-bridge/parsers";

const tracker = new YtDlpDownloadProgressTracker();

function onLine(line: string) {
  const event = parseYtDlpOutputLine(line);
  if (event?.kind === "requested-formats") tracker.setRequestedFormats(event.formats);
  if (event?.kind === "download-progress") console.log(tracker.update(event.progress).percent);
}
```

### Run a planned command

The bridge runner is low-level. It executes a command path plus argv; it does not resolve binaries or decide retries. Pass the plan's `cwd`, which must exist: the paths in its argv are relative to it. The child runs as its own process group on Unix, so it does not receive the terminal's Ctrl+C: stop it with `signal`.

```ts
import { planWorkflow } from "yt-dlp-bridge";
import { parseYtDlpOutputLine } from "yt-dlp-bridge/parsers";
import { runCommand } from "yt-dlp-bridge/runner";
import { toStructuredError } from "yt-dlp-bridge/errors";

const plan = planWorkflow({
  kind: "media",
  url: "https://www.youtube.com/watch?v=BaW_jenozKc"
});

try {
  const result = await runCommand("yt-dlp", plan.args, {
    cwd: plan.cwd,
    timeoutMs: 900_000,
    maxOutputBytes: 4 * 1024 * 1024,
    onStderrLine: line => console.log(parseYtDlpOutputLine(line))
  });
  console.log(result.stdout);
} catch (error) {
  console.error(toStructuredError(error));
}
```

### Query the option catalog

The bundled catalog is generated from `yt_dlp.options.create_parser` for yt-dlp `2026.03.17` and contains 323 upstream options.

```ts
import { UPSTREAM_OPTION_CATALOG, findOptionByFlag, listLongFlags, optionMetadata } from "yt-dlp-bridge/option-catalog";

const format = findOptionByFlag("--format");
console.log(UPSTREAM_OPTION_CATALOG.optionCount);
console.log(listLongFlags().includes("--dump-json"));
console.log(format ? optionMetadata(format) : undefined);
```

## API

Prefer the root export for workflow planning and subpaths for lower-level utilities.

| Area | Exports |
| --- | --- |
| Workflow planning | `planWorkflow`, `templateLiteral`, workflow input/plan/fact types |
| Schemas | `WorkflowInspectInputSchema`, `WorkflowDownloadInputSchema`, `WorkflowExecutionInputSchema`, `WorkflowPostprocessInputSchema`, `WorkflowExpertInputSchema`, `WorkflowInputSchema`, `ValidateWorkflowInputSchema` |
| Audio conversion | `audioConversionCopies`, `audioConversionOutcome`, `audioConversionCopyFilter`, `audioCodecPreference`, `audioConversionSourceSelector`, `isAudioFormat`, `AUDIO_CONVERSION_COPY_MIN_KBPS` from `yt-dlp-bridge/audio-conversion`; `AudioFormatSchema`, `AUDIO_FORMATS` and the `AudioFormat` type from the root |
| Config | `loadConfig` from `yt-dlp-bridge/config` |
| Environment | `checkEnvironment` from `yt-dlp-bridge/environment` |
| Filesystem policy | `resolveOutputPolicy`, `resolveManagedPath`, `ensureWithinRoot`, `isPathInside`, `isPathInsideWith`, `hasParentTraversal`, `ensureDirectory`, `readArchive` from `yt-dlp-bridge/filesystem` |
| Output templates | `templateLiteral` from `yt-dlp-bridge/output-template` (also from the root) |
| Option catalog | `UPSTREAM_OPTION_CATALOG`, `listLongFlags`, `findOptionByFlag`, `optionMetadata` from `yt-dlp-bridge/option-catalog` |
| info_dict | `infoDictSchema`, `ytDlpFormatSchema`, `ytDlpSubtitleTrackSchema`, `isPlaylistLike`, `isUrlRedirect` and the `InfoDict` family of types from `yt-dlp-bridge/info` |
| Parsers | `parseYtDlpOutputLine`, `parseJsonLines`, `sanitizeMetadataItem`, `sanitizeMetadataItems`, `paginate`, `parseFormats`, `parseSubtitles`, `parseThumbnails`, `parseFinalPaths` from `yt-dlp-bridge/parsers` |
| Runner | `runCommand`, `CommandExecutionError`, `killProcessTree`, `splitOutputLines`, `createStreamTextReader`, `SPAWN_AS_PROCESS_GROUP` from `yt-dlp-bridge/runner` |
| Redaction | `redactArgs`, `redactText`, `excerpt` from `yt-dlp-bridge/redaction` |
| Structured errors | `toStructuredError` from `yt-dlp-bridge/errors` |

Example imports:

```ts
import { planWorkflow } from "yt-dlp-bridge";
import { parseYtDlpOutputLine } from "yt-dlp-bridge/parsers";
import { runCommand } from "yt-dlp-bridge/runner";
import { redactArgs } from "yt-dlp-bridge/redaction";
```

## Configuration

`loadConfig(env?)` reads environment variables and applies conservative defaults. Pass a partial `ProcessEnv` object to override specific values.

| Variable | Default | Purpose |
| --- | --- | --- |
| `YTDLP_MCP_YTDLP_PATH` or `YTDLP_PATH` | `yt-dlp` | Path or command name for `yt-dlp`. |
| `YTDLP_MCP_FFMPEG_PATH` or `FFMPEG_PATH` | `ffmpeg` | Optional ffmpeg override for environment checks. |
| `YTDLP_MCP_FFPROBE_PATH` or `FFPROBE_PATH` | `ffprobe` | Optional ffprobe override for environment checks. |
| `YTDLP_MCP_OUTPUT_ROOT` | `~/Downloads/yt-dlp-mcp` | Managed output root. |
| `YTDLP_MCP_TEMP_ROOT` | OS temp under `yt-dlp-mcp` | Managed temp root. |
| `YTDLP_MCP_ALLOW_ARBITRARY_OUTPUT_PATHS` | `false` | Allow output paths outside the configured roots. |
| `YTDLP_MCP_ALLOW_CONFIG_FILES` | `false` | Allow user-provided cookies, netrc, and config-file inputs. |
| `YTDLP_MCP_ALLOW_PLUGIN_DIRS` | `false` | Allow user-provided plugin directory paths. |
| `YTDLP_MCP_COOKIES_FILE` | unset | Server-level cookies file. |
| `YTDLP_MCP_COOKIES_FROM_BROWSER` | unset | Server-level browser cookie source for `--cookies-from-browser`. |
| `YTDLP_MCP_ENABLE_EXPERT` | `false` | Enable higher-risk expert-mode integrations. |
| `YTDLP_MCP_TIMEOUT_MS` | `900000` | Default command timeout (ms). |
| `YTDLP_MCP_MAX_OUTPUT_BYTES` | `4194304` | Maximum retained stdout/stderr bytes. |
| `YTDLP_MCP_JS_RUNTIMES` | `deno,node,bun,quickjs` | JavaScript runtimes considered for extractor challenges. |
| `YTDLP_MCP_UNREDACTED` | `false` | Disable secret redaction and excerpt truncation. Local debugging only: logs will contain tokens, cookies, and credentials. |

## Requirements

- Node.js >= 22.13, ESM.
- `yt-dlp` installed when running yt-dlp workflows.
- `ffmpeg` and `ffprobe` for audio extraction, merge, remux, recode, segment editing, subtitle/thumbnail conversion, and embedding workflows.
- Python `yt_dlp` package, or `PYTHONPATH` pointing at a yt-dlp checkout, when regenerating or verifying the option catalog.

## Development

```bash
git clone https://github.com/antonio-orionus/Arroxy.git
cd Arroxy
mise install           # recommended; skip if you manually activated the pinned tools
bun run bootstrap
```

| Command | Description |
| --- | --- |
| `bun run --filter yt-dlp-bridge build` | Compile TypeScript and copy generated assets into `dist`. |
| `bun run --filter yt-dlp-bridge test` | Run Vitest tests. |
| `bun run --filter yt-dlp-bridge typecheck` | TypeScript check without emitting. |
| `bun run --filter yt-dlp-bridge generate:options` | Regenerate the option catalog from Python `yt_dlp`. |
| `bun run --filter yt-dlp-bridge verify:options` | Verify the catalog matches Python `yt_dlp`. |
| `bun run bridge:check` | Run the package gate used by Arroxy CI and registry publishing. |

## Troubleshooting

**`yt-dlp` is missing** - Install `yt-dlp` or set `YTDLP_MCP_YTDLP_PATH`. `checkEnvironment()` reports detected command, status, version, and notes.

**`ffmpeg`/`ffprobe` missing** - Install the binary or set `YTDLP_MCP_FFMPEG_PATH` / `YTDLP_MCP_FFPROBE_PATH`. Planning still returns dependency info so callers can surface which workflow requires the missing tool.

**`auth.cookiesFile requires YTDLP_MCP_ALLOW_CONFIG_FILES=true`** - User-provided config-file paths are blocked by default. Prefer server-level `YTDLP_MCP_COOKIES_FILE` or enable `YTDLP_MCP_ALLOW_CONFIG_FILES=true` only after reviewing the trust boundary.

**`outputTemplate must not contain parent-directory traversal`** - Relative templates cannot contain `..` segments unless `YTDLP_MCP_ALLOW_ARBITRARY_OUTPUT_PATHS=true`.

Bugs and feature requests: [GitHub Issues](https://github.com/antonio-orionus/Arroxy/issues).

## License

[MIT](LICENSE) © 2026 Antonio Orionus
