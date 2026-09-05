# Section Download (Trim) — Deferred Feature

**Status: DEFERRED.** Not scoped for any milestone. This doc preserves the
omniget/yt-dlp research (verified 2026-09-05) so v1 can be built without
re-deriving it. Suggested v1 slice is at the bottom.

Download only a time range of a video (`START-END`), via yt-dlp
`--download-sections "*START-END"` (`*` = time-range mode; without it yt-dlp
reads the value as a chapter-title regex; `inf` = open end).

Arroxy-side code lives in:

- `src/shared/schemas.ts` — zod SSOT for job/wizard option enums
- `src/shared/sanitizeJobOptions.ts` — job-options validator
- `src/main/services/phases/VideoPhase.ts` — media-request construction (`sponsorBlock` passthrough at `:84,104` is the pattern to copy)
- `src/main/services/YtDlp.ts` — bridge spawn (no changes expected)
- `src/main/services/download/progressParser.ts` — progress-line parsing (consumed at `DownloadService.ts:351`)
- `src/main/services/ProbeService.ts` — duration source for clamping (`:343,390`)
- `src/shared/filenameTemplate.ts` — `{title} [{id}]` output template (`:67`)
- `src/shared/playlistMedia.ts` — `findPlayableFileName` (`:14`), consumed by `src/main/services/playlistM3u.ts:28` and `src/main/ipc/playlistHandlers.ts`
- `src/main/stores/QueueStore.ts` — job persistence (retry must preserve the new fields)
- `node_modules/yt-dlp-bridge/dist/schemas.d.ts:145` — bridge **already supports `downloadSections: string[]`**; no argv plumbing needed

Reference implementations (outside this repo, paths may rot):

- omniget @ `59319b64` (2026-08-29): `src-tauri/src/commands/downloads.rs:160-170,873-878`, `src/routes/+page.svelte:73-74,320-331,372-399,746-775,1234-1250`
- yt-dlp @ `041c6e8`: `yt_dlp/downloader/__init__.py:89`, `yt_dlp/downloader/external.py` (`-ss`/`-t` + `-c copy` at ~`:513`), `yt_dlp/YoutubeDL.py:3101-3131` (ranges × formats product), `yt_dlp/options.py:1826-1832` (`--force-keyframes-at-cuts`)

---

## 1. Mechanism

Two argv entries: `--download-sections "*START-END"`. Omniget builds the range
in `buildTimeRange()` (`+page.svelte:324-331`, defaults `0`/`inf`) and prepends
`*` in `downloads.rs:875`. For Arroxy, pass `downloadSections: ["*START-END"]`
on the bridge media request instead of raw argv.

## 2. yt-dlp behavior that shapes the UX

- Any section request reroutes through the **ffmpeg downloader**
  (`downloader/__init__.py:89`). Native pacing / concurrent-fragments settings
  don't apply to trimmed downloads. ffmpeg is already embedded, so no new
  dependency.
- Cuts are **keyframe-approximate** (stream `-c copy` with input `-ss`/`-t`;
  `external.py` ~`:513`). Exact cuts need `--force-keyframes-at-cuts`
  (full re-encode — slow; omniget doesn't use it). Label the fields
  "approximate" in the UI rather than copying omniget's silent behavior.
- Subtitles come back **full-length** — sections don't cut `.srt`/`.vtt`
  (subtitle PPs ignore `section_start/end`; the `section_*` refs in
  `postprocessor/ffmpeg.py` are split-chapters only). v1 decision needed:
  keep full subs (simplest, document it) or cut post-download.

## 3. Validation (omniget's + its gaps)

Omniget frontend regex (`+page.svelte:321`,
`/^(\d+:)?\d{1,2}:\d{1,2}(\.\d+)?$|^\d+(\.\d+)?$/`) is the right shape for
`[[H:]M:]S[.ms]`-or-seconds. Backend (`downloads.rs:160-170`) is charset-only.
**Neither side checks `start < end`** — add it (reversed ranges die in ffmpeg
with a cryptic error). **Neither clamps against duration** — Arroxy has
`ProbeService`, so reject `start >= duration` and clamp `end` to
duration/`inf`.

## 4. Scope rules (from omniget failure analysis)

- **Single download only.** Omniget gates the UI with
  `{#if content_type !== "playlist"}` (`+page.svelte:1240`) and never sends
  `timeRange` from the batch path. Do the same: disable outside single/quick
  flows. Note the backend accepts `time_range` + `playlist_items` combined
  with no guard — add the guard Arroxy-side.
- **Clear on new URL *and* on single→playlist flip.** Omniget clears on new
  input (`handleInput`, `+page.svelte:375-376`) but has a residual leak: a
  range typed before async detection resolves to playlist is still sent
  (`:758` ships `buildTimeRange()` alongside `playlistItems`). Clear clip
  state whenever the detected content flips to playlist.
- **Filename collision is the nastiest rule.** Playlist dedupe matches files
  by `[videoId]` (`filenameTemplate.ts`, `playlistMedia.ts`). A 1-min clip
  would mark the video "already downloaded" and skip the full fetch later
  (and vice versa); same class as `--no-overwrites` skipping a second range
  of the same video. Suffix trimmed outputs, e.g.
  `[videoId][10m00s-11m00s]`, or exclude clips from sync matching.
- **Composes with audio-only and SponsorBlock-remove** (ranges apply
  per-format in `YoutubeDL.py:3115`; removals are post-processors) — test
  both. **Retry must preserve the range** (omniget stores `custom_ytdlp_args`
  on the queue item, `queue.rs:189,310,1062`; Arroxy equivalent is the
  persisted job options in `QueueStore` + tempDir resume in `VideoPhase`).
- **Progress parsing**: yt-dlp normalizes ffmpeg-downloader progress lines,
  but run one real section download and watch `ProgressParser` before trusting
  it.

## 5. Suggested v1 (when un-deferred)

Single + quick download, both ends optional (default `0`/`inf`), "cuts are
approximate" hint, suffixed filenames, full-length subs documented.

- `schemas.ts` + `sanitizeJobOptions.ts`: zod-optional `clipStart`/`clipEnd`.
  (Do NOT read anything into the existing `'clip'` profile icon in
  `downloadProfileIconSchema` — it's the low-res/small-file icon from
  `downloadProfiles.ts:54,59-60`, unrelated to trim.)
- `VideoPhase`: map to `downloadSections: ["*START-END"]` next to the
  `sponsorBlock` passthrough. `YtDlp.ts` spawn needs no changes.
- i18n: new keys in `en.json`; other 23 locales fall back until translated.
- Tests: vitest for the validator (valid / invalid / reversed /
  beyond-duration); one Fixture Product E2E for a short section download
  (filesystem oracle: suffixed file exists; deny-proxy log clean). Do not
  claim the workflow with unit/jsdom tests alone (see AGENTS.md test layers).

Open questions for implementation time: confirm the "quick download" flow
name/scope still exists; decide full-subs vs cut-subs; decide suffix format.
