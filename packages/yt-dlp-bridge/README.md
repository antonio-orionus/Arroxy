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
- Low-level process runner using `spawn` with `shell: false`, bounded output capture, timeouts, and structured failures.
- Source-derived option catalog generated from `yt_dlp.options.create_parser`.
- ESM and TypeScript declarations.

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
  kind: "probe" | "inspect" | "media" | "audio" | "subtitles" | "thumbnail" | "playlist" | "postprocess" | "expert",
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

### Run a planned command

The bridge runner is low-level. It executes a command path plus argv; it does not resolve binaries or decide retries.

```ts
import { planWorkflow } from "yt-dlp-bridge";
import { runCommand } from "yt-dlp-bridge/runner";
import { toStructuredError } from "yt-dlp-bridge/errors";

const plan = planWorkflow({
  kind: "media",
  url: "https://www.youtube.com/watch?v=BaW_jenozKc"
});

try {
  const result = await runCommand("yt-dlp", plan.args, {
    timeoutMs: 900_000,
    maxOutputBytes: 4 * 1024 * 1024
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
| Workflow planning | `planWorkflow`, workflow input/plan/fact types |
| Schemas | `WorkflowInspectInputSchema`, `WorkflowDownloadInputSchema`, `WorkflowExecutionInputSchema`, `WorkflowPostprocessInputSchema`, `WorkflowExpertInputSchema`, `WorkflowInputSchema`, `ValidateWorkflowInputSchema` |
| Config | `loadConfig`, `CONFIG` from `yt-dlp-bridge/config` |
| Environment | `checkEnvironment` from `yt-dlp-bridge/environment` |
| Filesystem policy | `resolveOutputPolicy`, `resolveManagedPath`, `ensureWithinRoot`, `isPathInside`, `isPathInsideWith`, `hasParentTraversal`, `ensureDirectory`, `readArchive` from `yt-dlp-bridge/filesystem` |
| Option catalog | `UPSTREAM_OPTION_CATALOG`, `listLongFlags`, `findOptionByFlag`, `optionMetadata` from `yt-dlp-bridge/option-catalog` |
| Parsers | `parseYtDlpOutputLine`, `parseJsonLines`, `sanitizeMetadataItem`, `sanitizeMetadataItems`, `paginate`, `parseFormats`, `parseSubtitles`, `parseThumbnails`, `parseProgress`, `parseFinalPaths` from `yt-dlp-bridge/parsers` |
| Runner | `runCommand`, `CommandExecutionError` from `yt-dlp-bridge/runner` |
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
