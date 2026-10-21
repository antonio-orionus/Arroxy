# Interactive Download: Format + Review, profile-first, with clips

**Status: built.** Format + Review (PR 1) and part of video (PR 2). The single-video Interactive
Download flow goes from up to seven screens to two, starts from a download
profile instead of the preset strip, and gains "part of video" downloads.
Workflow context: [download-workflows.md](download-workflows.md). Clip
research: [section-download.md](section-download.md).

Lives in (today's code this changes):

| Area | Files |
| --- | --- |
| Step graph | `src/renderer/src/store/wizard/wizardStepGraph.ts`, `src/shared/schemas.ts` (`wizardStepNameSchema`) |
| Format screen | `src/renderer/src/components/wizard/StepFormatSelect.tsx`, `components/wizard/format/*` (`VideoColumn`, `AudioColumn`, `FormatFooter`, `VideoPartControls`, `BotWallNotice`) |
| Other steps | `StepSponsorBlock.tsx`, `StepOutput.tsx`, `StepFolderConfirm.tsx`, `StepConfirm.tsx` |
| Selection state | `store/wizard/formatPicker.ts`, `probeResultProjection.ts`, `persistFormatPrefs.ts`, `resolveContainer.ts`, `store/formatSelectionView.ts` |
| Review and submit | `store/wizard/downloadReviewProjection.ts`, `queueSubmission.ts`, `src/shared/prepareJob.ts`, `src/shared/sanitizeJobOptions.ts` |
| Profiles | `src/shared/downloadProfiles.ts`, `src/shared/mediaIntent.ts` |
| Clips | `packages/yt-dlp-bridge/src/workflow.ts` (`CallerMediaWorkflowInput`), `src/main/services/phases/VideoPhase.ts`, `src/main/services/ProbeService.ts`, `src/shared/filenameTemplate.ts`, `src/shared/playlistMedia.ts` |

## Why

Someone who presses **Interactive Download** has just passed on the Quick
Download button, which already names the active profile. They want to see
what this video offers (18 video streams and 30 audio tracks is normal on
YouTube: resolutions, fps, HDR, codecs, dubbed languages, Dolby, DRC) or to
change something for this one download. Today that costs:

- up to six Continue clicks (Formats, Subtitles, SponsorBlock, Output,
  Folder, Confirm);
- a preset strip whose names collide with profile names and mean something
  else ("Small file" is the lowest stream as a preset, ≤480p as a profile);
- an invisible memory: format, subtitles, SponsorBlock, extras and folder
  silently carry over from the last download, some of it YouTube-only, and
  every folder pick rewrites the global default folder.

## Decisions

- **D1. Profiles replace presets.** The preset strip, `presetSchema` and its
  helpers are deleted. The wizard starts from the active download profile,
  so pressing Download without changes produces what Quick Download would.
  Profile behaviour wins where the two differ (small-file is ≤480p;
  subtitles-only starts with the profile's languages).
- **D2. The probe is the content, the profile is the pre-selection.** Every
  option shown comes from the probe, with today's full lists. The profile
  only decides what starts selected, and a "Profile" tag marks it.
- **D3. Picking a profile in the wizard is per-download.** It never changes
  the active profile that Quick Download uses.
- **D4. No silent memory.** Edits apply to this download only. The wizard
  stops writing `settings.single.*` and the `common.last*` fields; keeping a
  set of edits is an explicit **Save as profile**. After a download with
  edits, one toast offers it.
- **D5. Two screens: Format, then Review.** Review is today's Confirm with
  rows that open in place. Download works from both screens.
- **D6. Part of video lives on the Format screen**, single mode only, never in
  a profile.
- **D7. Playlist and bulk modes are unchanged here.** Moving
  `playlistPresets` to the same profile-first model is a follow-up.

## Flow

```text
URL ─► 1 Format ─► 2 Review
         │            │
         └─ Download ─┴─ Download / Add to queue
```

The stepper shows URL, Format, Review. Review's Back and "Change format"
return to Format.
Back on Format returns to URL (or to Explore when the run started there).
Error screens stay as they are. The loading screen offers **Cancel**: at once
in dev builds, after 120 s for users (a slow site, not a stuck app, is the
usual reason to wait).

## Screen 1: Format

Top to bottom:

1. **Video card**: thumbnail, title, site, duration, best quality, audio
   language count, chapter count. A **Whole video / Part** switch (see
   Part of video). Hidden in Subtitles mode.
2. **Profile line**: "Pre-selected from *<profile>*", a pencil that edits
   the profile in place, and the Profile tag ("Why this one"). Picking
   another profile re-applies it. When the user changed more than the
   streams, a dialog names what changed ("You changed subtitles and
   extras") and offers **Keep my changes** or **Reset all**; the new profile
   picks the streams either way. Stream-only edits apply without asking.
3. **Type switch: Video + audio / Video, no audio / Audio only / Subtitles
   only**, named as in the profile editor. Replaces the preset strip, the
   video list's "Audio only" row and the subtitles-only preset.
   - Video + audio: the video list and audio list.
   - Video, no audio: only streams without audio of their own, and no
     audio list. The audio pick is set aside and comes back (language, DRC,
     bitrate) on Video + audio.
   - Coming back to video from Audio only or Subtitles only lands on the
     profile's pick; a profile with no video ranks by the default profile
     (Balanced 720p), never by "tallest first".
   - Audio: the audio list including conversions (mp3, m4a, opus, wav) and
     the bitrate strip (128/192/256/320). Conversions appear only here.
   - Subtitles: the subtitle language picker takes the place of both lists
     (selected chips, Clear all, search, uploaded vs auto-generated
     sections, SRT/VTT/ASS, in the folder vs `subtitles/` subfolder).
   - Audio-only sources (`isAudioOnlySource`) lock the switch to Audio.
4. **Lists**: one video line per resolution, with a column per dynamic
   range (HDR, then SDR) and, inside it, per codec (AV1, VP9, HEVC, H.264),
   so H.264 or VP9 at a height stays reachable and a codec sits in the
   same column on every line. A stream whose codec the site doesn't name
   joins a named codec's chip at its height, else shares one last column
   labelled by file type. Where a height has a silent and a muxed copy of a
   codec, the silent one shows; "with audio" is said only when the list
   mixes both kinds. Sizes the site doesn't give are estimated from bitrate
   × duration; a stream with no size at all is named "Unknown size".
   The audio list keeps quality badges, DRC twins, the language picker and
   the "Keep as-is / Built-in audio" row for muxed video.
   **Markers** say what yt-dlp's notes say about a stream: AI upscaled,
   Enhanced bitrate, Damaged, Watermarked and Spatial audio as chip tags;
   AI dubbed and Audio description next to the language name; 360° / VR
   once on the video card.
5. **Fit notices** (amber, above the lists) when the profile can't be
   honoured on this video, e.g. "Your profile asks for 1080p. This video
   only goes up to 480p, so 480p is selected." or "Your profile asks for
   English subtitles. This video has none." The fallback row is tagged
   "Closest to profile".
6. **Bot-wall notice** with Retry and "Enable cookies & retry", as today
   (`BotWallNotice`). A retry keeps the user's edits.
7. **Footer warnings**: the MP4 playback caveat and conflict warnings
   (thumbnail can't be embedded, subtitles can't go inside audio), because
   Download can skip Review.
8. **Changes row** (also on Review), only once the run differs from its
   profile: "Changed from *<profile>*: subtitles, extras" with icon buttons
   to update that profile, save a new one, or undo.
9. **Footer**: total size (video **plus** audio, scaled to the part when
   clipping), Back, a plain **Download** shortcut, and the highlighted
   **Continue** to Review. A user who keeps pressing the highlighted button
   passes Review, where the subtitles, extras (thumbnail, description),
   folder and file name are; Review opens with Extras unfolded. Continue is
   disabled only for what Format fixes (no stream, an invalid part,
   Subtitles only with no language); Download also for an invalid folder
   or file name.

Review's footer holds the split **Download ▾** button whose menu holds
"Add to queue without starting". Download is the priority lane, Add to
queue the normal lane.

## Profile → selection

A new pure resolver replaces `applyPreset` / `restoreFormatSelection`: given
the profile and the probe, return the selection plus the fit notices.
The ranking it follows is specified in
[source-priority.md](source-priority.md). It starts with the site's own
preference (yt-dlp's `preference`: damaged, watermarked and fallback copies
come last, as in yt-dlp's own sort) and, unless the profile allows them,
leaves out AI-upscaled streams; both rules show in "Why this one".

- Video: the highest group at or below the profile's tier; if none, the
  lowest group above it, with a fit notice. `mp4` profiles prefer
  H.264/AAC in MP4 when the video has them, else fall back with a notice.
- Audio: `preferredNativeAudioId` with the user's `nativeAudioPreference`,
  as today; muxed video keeps "Keep as-is".
- Audio-only profile: best native audio; muxed-only sources convert to mp3
  at the profile bitrate (default 192), as the audio-only preset does today.
- Subtitles: the profile's languages intersected with the video's tracks
  (auto-captions only where the profile allows them); missing ones produce
  a fit notice.
- SponsorBlock, embed options, folder, subfolder and filename come straight
  from the profile (`resolveDownloadProfile`, `resolveDownloadProfileOutputDir`).
- The resolved selection uses concrete format ids, so sizes and the review
  are exact. A Fixture Product E2E checks that Download from the Format
  screen fetches the same stream as Quick Download with the same profile.

"Changed from profile" is the diff between the current selection and the
resolver's output. It drives the Review bar and the after-download toast.

## Screen 2: Review

- Format strip: thumbnail, title, the chosen streams in one line, and
  "Change format" back to Format.
- Rows, each opening in place (one open at a time; its header closes it):
  - **Subtitles**: the same picker as Subtitles mode plus Next to video /
    Inside the video / `subtitles/` folder. "Inside the video" notes that the
    file becomes .mkv, and the file name row updates.
  - **SponsorBlock** (YouTube only, hidden when nothing has video): Off /
    Mark / Remove and the seven categories.
  - **Extras**: embed chapters, metadata, thumbnail; write description,
    thumbnail file.
  - **Save to**: today's location cards, Custom folder picker, subfolder
    switch and name validation. Download stays disabled while the subfolder
    name is invalid or no folder is set. Picks no longer write the global
    default folder (D4).
  - **File name**: the profile's filename setting, editable for this
    download.
- **Changes row** in the footer (shared with Format): update the profile
  (a dialog shows each changed area before and after; Extras lists only
  what is added or removed; a built-in profile is saved as its override,
  restorable in the Profiles tab), save as a new profile, or undo.
- **One-time callout** for users with downloads behind them: all the other
  settings are on this page now. Opening a row dismisses it.
- Conflict warnings, "nothing to download", double-submit guard and the
  submit-error path stay as in today's Confirm.

## Part of video

Built on [section-download.md](section-download.md); the bridge work there
comes first.

- Switch on the video card. Opens: a range bar with chapter marks, Start and
  End fields (`[[H:]M:]S` or seconds), chapter chips that set both ends, and
  **Exact cut (re-encodes, slower)**, off by default with the hint that cuts
  land on the nearest keyframe.
- A `t=` in the link is **offered** ("Your link starts at 3:52 · Use as
  start"), never applied silently: shared links often carry `t` only as a
  resume point. `youtubeCanonicalAddress` and the URL cleaner keep `t`;
  parse `754`, `12m34s`, `1h2m3s`.
- Validation: start < end, both within the duration; Download is disabled
  otherwise.
- Sizes in the lists and the total scale linearly to the range and are
  labelled as estimates.
- File name gets a range suffix **after** the id:
  `Title [id] [3m40s-7m15s].mp4`. `findPlayableFileName` needs `[id]`
  directly before the extension, so playlist sync never mistakes a part for
  the whole video. The suffix is appended to the final template, custom
  templates included.
- Subtitles mode disables Part (subtitles always cover the whole video);
  with Video or Audio, subtitles stay full-length and the row says so.
- SponsorBlock is not offered for a part. yt-dlp does not shift embedded
  chapters to a part (verified in the clip E2E: a 3 s part got the whole
  video's 0–8 s chapters), so a part embeds none. yt-dlp also embeds
  chapters with `--add-metadata` unless told not to, so the bridge passes
  `--no-embed-chapters` for an explicit `chapters: false`.
- A part never replays its own saved info-json on Retry or resume: yt-dlp
  writes it after applying the section (`section_start`, shortened
  `duration`), and loading it with the same section cuts a second time. It
  loads the probe's info-json instead.
- The range is cleared on a new URL and when the link resolves to a
  playlist; it is stored on the job so Retry and restart keep it.
- Clipped downloads go through yt-dlp's ffmpeg downloader, so download
  connections and pacing do not apply; say so next to the Part switch.
- Probe results gain yt-dlp's `chapters` in `ProbeService`.

## Must keep (regression checklist)

Each item is a test or a review checkbox for the PRs below.

1. Subtitles-only downloads stay one screen with search and auto-caption
   handling (Subtitles mode).
2. A video with subtitles advertises them before Download (summary line).
3. Start now vs add to queue (split button).
4. One control for audio-only (type switch); conversions only under Audio.
5. Muxed video keeps "Keep as-is"; no double audio.
6. Audio-only sources lock to Audio.
7. Bot-wall notice, Retry, cookies retry; retry keeps edits.
8. Conflict warnings visible on Format, not only Review.
9. "Inside the video" subtitles produce .mkv and the UI says so.
10. Folder picker, Custom, subfolder validation, disabled Download on
    invalid input.
11. Explore runs return to Explore on Back.
12. Native audio preference (Dolby/DRC) honoured by the resolver.
13. Minimum window 720×680: lists scroll, footer stays visible.
14. Non-YouTube sites get the profile too (today they get bare defaults).

Behaviour changes users will notice (accepted): no carry-over of the last
download's choices, folder picks are per-download, small-file means ≤480p.

## Deleted

`PresetStrip`, `presetSchema` / `Preset` / `PRESETS`, `presetTraits.ts`,
`applyPreset`, `restoreFormatSelection`, `activePreset` state,
`persistFormatPrefs` (wizard writes), `settings.single` and the
`common.last*` wizard fields, the unread `preset` field on queued jobs,
"Skip to confirm", "Skip for this video", the separate SponsorBlock, Output
and Folder steps, the `presets.*` locale keys (the "Subtitles only" label
moves to a neutral key). `GLOSSARY.md` drops **Preset**. No migration of the
removed settings.

## Testing

- Fast logic: the profile resolver (tiers, mp4 preference, fallbacks, fit
  notices, muxed and audio-only sources, subtitle intersection, parity with
  the profile's format selector), the "changed from profile" diff, the range
  parser and validator, the filename suffix.
- Renderer: Format and Review screens, type switch, fit notices, split
  button, rows opening in place, Save as profile.
- Scenario Workbench: Format (many formats, many audio tracks, HDR), fit
  notice, Subtitles mode, Part, Review with a row open; check at 720×680
  and in long locales.
- Fixture Product E2E: URL → Format → Download with the profile's pick (file
  on disk); one edit through Review (subtitles) with Save as profile; one
  real part download (suffixed file exists, deny-proxy log clean, Retry
  keeps the range).

## Delivery

1. **PR 1, profile-first Format + Review.** Resolver first (test-first),
   then the two screens, then the deletions. Updates
   `download-workflows.md`, `GLOSSARY.md` and the README screenshots.
2. **PR 2, part of video.** Bridge first: `downloadSections` and
   `forceKeyframesAtCuts` on `CallerMediaWorkflowInput` with bridge tests
   (`bun run bridge:check`); the app uses it via `workspace:*`, publishing
   the package is a separate release. Then probe chapters, job field,
   VideoPhase mapping, UI, E2E.

Each PR changes English only; the release sync translates (ADR 0017).

## Out of scope

- Playlist and bulk wizard (D7), Quick Download, hotkey, Explore's quick
  path: no clip, no change.
- Cutting subtitles to the part.
- Remembering edits other than through profiles.
