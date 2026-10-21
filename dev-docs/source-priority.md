# Source priority: how a profile picks streams

**Status: built on `feat/source-priority`, not merged.** The three delivery
steps below landed together; the English copy is approved and all 30
non-English locales are translated. A download profile picks one video and one
audio stream out of everything a video offers by ranking them in a fixed
order of rules. Today that order is spread over two labels and a global
setting, and nobody can see it. This spec makes the order one owned
structure, shows it to the user, splits the file type out of the codec
choice, and moves native audio to the global + profile override pattern.
Single-video flow only. Workflow context:
[download-workflows.md](download-workflows.md). Profile-first wizard:
[interactive-download.md](interactive-download.md).

Lives in (today's code this changes):

| Area | Files |
| --- | --- |
| Profile model | `src/shared/schemas.ts` (`downloadProfileMediaSchema`, `playlistVideoCodecSchema`, `nativeAudioPreferenceSchema`), `src/shared/downloadProfiles.ts` (`BUILTIN_DOWNLOAD_PROFILES`) |
| yt-dlp mapping | `src/shared/mediaIntent.ts` (`mediaIntentSpec`, `videoIntentSpec`), `src/main/services/phases/mediaRequest.ts`, `packages/yt-dlp-bridge/src/workflow.ts` (`--merge-output-format`, `--remux-video`) |
| Interactive pick | `src/shared/profileSelection.ts` (`resolveProfileSelection`, `VIDEO_CODEC_RANK`, `compareSameHeight`), `src/shared/nativeAudioPreference.ts` |
| Result container | `src/renderer/src/store/wizard/resolveContainer.ts` |
| Profile editor | `src/renderer/src/components/wizard/DownloadProfileEditor.tsx`, `src/renderer/src/store/wizard/downloadProfileDraft.ts` |
| Format and Review | `src/renderer/src/components/wizard/StepFormatSelect.tsx`, `components/wizard/format/*`, `StepReview.tsx` |

## Why

The order exists today, just hidden. Per profile video setting:

| Rank | "Best native" | "Smart TV H.264 MP4" |
| --- | --- | --- |
| 1 | Resolution at or under the cap | H.264 codec |
| 2 | Highest fps | MP4 container |
| 3 | HDR | Resolution at or under the cap |
| 4 | Codec: AV1, VP9, HEVC, H.264 | fps, HDR, size |
| 5 | Larger file | |

Audio: the source's default or original language, then no DRC, then
stereo-compatible or surround from a **global** setting whose description
says it "controls what Best native chooses". M4A profiles take AAC.

What users hit:

1. "Best native" at 1080p on YouTube usually lands AV1 or VP9 with Opus in
   MKV or WebM. QuickTime, iMovie, Premiere, some TVs and older GPUs can't
   play it well. The file type is derived after the fact
   (`resolveContainer`) and never chosen or shown before download.
2. "Smart TV" ranks codec above resolution. That is why it caps at 1080p on
   YouTube. A sensible choice nobody can see was made.
3. No profile can say "4K, as an .mp4 file", although VP9 and AV1 copy into
   MP4 losslessly, because codec and file type are one setting.
4. The audio order lives half in the profile, half in Settings.
5. `tiers` is an array, but only `tiers[0]` is ever read.
6. The order is written twice: as the `-S` sort string in `mediaIntentSpec`
   and as hand-mirrored comparators in `profileSelection.ts`. Only a test
   keeps Quick and Interactive Download fetching the same stream.

Rival research (October 2026, ten open-source downloaders read at source,
four closed ones from docs): the apps users trust pick a compatible source
first and then **remux** (copy streams into another file type, lossless and
fast): cobalt, JDownloader, Seal, VidBee, Open Video Downloader. The apps
that re-encode by default (Parabolic for WebM/MOV/AVI, ytDownloader for any
picked format) collect "slow, worse quality, still .webm" reports. Codec,
quality and GPU encoder choices only appear in separate convert tools,
never in the download path.

## Decisions

- **D1. One owned selection order.** The ranked rules are one data
  structure built from the profile and the global settings. Three outputs
  are derived from it and never written by hand again: the yt-dlp `-S`
  sort (Quick Download, playlists later), the comparator the Interactive
  pick uses, and the readable ladder in the UI. The Interactive pick
  evaluates the same `-f`/`-S` strings through a translation of yt-dlp's sort and
  selector, and `bun run check:selection-parity` holds it to a pinned
  yt-dlp over every recorded probe, and constructed ones for shapes no
  recorded site has (ADR 0013).
- **D2. A goal, not a codec.** The profile's video choice names what the
  file is for, following the Two-Audience Rule in `DESIGN.md` (plain name,
  technical tag, tooltip):

  | Name | Tag | Picks | Tooltip (gist) |
  | --- | --- | --- | --- |
  | **Best picture** | `AV1 · VP9` | Today's "Best native" order | Sharpest at a given size. Older TVs, QuickTime and some editors can't play it. |
  | **Smart TV** | `MP4 · H.264` | Today's mp4 order | Plays on TVs, phones, WhatsApp, QuickTime and video editors. YouTube offers H.264 only up to 1080p. |

  "Best picture" rather than "Best quality": the resolution tier already
  uses "Best quality", and a profile reading "Best quality, Best quality"
  says nothing.
- **D3. File type is a separate, lossless choice** in the editor's
  Advanced section: **Auto** (default, today's behaviour), **MP4**,
  **MKV**, **WebM**. Always a remux, never a re-encode. A combination that
  would need re-encoding is disabled with the reason in its tooltip (see
  File type rules).
- **D4. Native audio is global + profile override**, like the save folder
  and the file name: the profile stores `{kind: 'default'}` (use Settings)
  or its own `compatible` / `surround`. The tag shows the effective value
  (`Stereo`, `Dolby`), the tooltip says where it comes from ("From
  Settings" or "This profile").
- **D5. Show the order.** The profile editor shows a one-line summary ("Up
  to 1080p · plays on any device · saves as .mp4") that expands into the
  full ladder. On the Format screen the Profile tag gets a `HelpTip` saying
  which rules decided this pick ("1080p: your limit · 60 fps: highest
  offered · VP9: ranked above H.264 · Stereo AAC: from Settings").
- **D6. Show the result before downloading.** The Format footer (as a
  per-download choice, see Interactive Download) and the Review format
  strip show **Saves as .mkv** with a `VP9 · Opus` tag and a
  tooltip on where it plays. `resolveContainer` already computes it.
- **D7. One tier.** `tiers: PlaylistVideoTier[]` becomes
  `tier: PlaylistVideoTier`.
- **D8. Shorter built-in names.** Specs move from names into generated
  tags (resolution, goal, file type):

  | Today | New name | Tag |
  | --- | --- | --- |
  | Smart TV MP4 Full HD 1080p | Smart TV 1080p | `MP4 · H.264` |
  | Smart TV MP4 HD 720p | Smart TV 720p | `MP4 · H.264` |
  | Smart TV MP4 SD 480p | Smart TV 480p | `MP4 · H.264` |

  The other built-ins already read as outcomes and keep their names. Ids
  stay the same, so active-profile refs and overrides keep pointing at
  them.
- **D9. Single video first.** Playlist and bulk keep
  `PlaylistSelection.codec` until they move to the profile-first model (D7
  in interactive-download.md). Quick Download uses the profile, so it gets
  the new behaviour.

## Selection order

Built per profile, best first. `≤ tier` means the tallest stream at or
under the tier, else the shortest above it with a fit notice (today's rule).

Every order starts with two rules, before the goal's own ranks:

- **Site preference.** Streams the site marks down (yt-dlp's `preference`:
  YouTube's damaged copies at -10, its 3gp at -2, TikTok's watermarked copy)
  come last. yt-dlp always sorts by this first, so a queued download needs
  no `-S` token for it; the Format pick narrows to the top preference to
  match.
- **Original, not AI-upscaled** (unless the profile's `aiUpscaled` is
  `allow`). YouTube offers some old uploads in AI-upscaled sizes (`-sr`
  format ids, noted "AI-upscaled"): taller, no real detail. `-S` can't leave
  streams out, so the queued download's selector tries every `bestvideo`
  alternative with `[format_id!$=-sr]` first and the plain selector after,
  so a video offered only upscaled still downloads.

**Best picture:** resolution ≤ tier · fps · HDR · source · codec (AV1, VP9,
HEVC, H.264) · size.

**Smart TV:** H.264 · MP4 container · resolution ≤ tier · fps · HDR · source
· size. H.264 and MP4 are filters in the selector, not `-S` fields: each
alternative is tried with H.264 in MP4, then H.264, then as it is. Under
`-S vcodec:h264` yt-dlp ranked the codecs it orders below H.264, and a stream
that names no codec, above AV1, VP9 and HEVC, and before the resolution, so a
site without H.264 gave a codec-less stream at any height. With no H.264 the
rest is yt-dlp's own order: the resolution, then AV1, VP9, HEVC before a
stream that names no codec. A constructed probe in the selection parity check
(`scripts/selection-parity/constructedProbes.ts`) holds yt-dlp to that, and
the check fails where a site offers H.264 and yt-dlp takes another codec.

**Video codec preference** (`videoCodec`, Best picture only): VP9 or H.264
first. It is a `vcodec:` limit in `-S` (`vcodec:vp9.2`, the limit yt-dlp
itself uses to prefer VP9, or `vcodec:h264`), with `res`, `fps` and `hdr`
named before it so the codec never costs height, frame rate or HDR. Every `-S`
field comes before the extractor's own sort, so the codec then ranks before
source: an H.264-first profile takes H.264 over YouTube's Premium VP9. Under a
limit yt-dlp takes that codec, then the ones it ranks below it, then the ones
above it, worst first: VP9 first is VP9, HEVC, H.264, AV1; H.264 first is
H.264, HEVC, VP9, AV1. Smart TV has no use for it (H.264 is already first),
and H.264 first never goes with WebM, which can't hold it. Saving a hand pick
records VP9 or H.264 when its height offered another codec, and drops the
preference for an AV1 pick.

**Source** is yt-dlp's `source_preference`: YouTube raises its Premium
(enhanced-bitrate) copies by 100 and lowers ones missing a PO token by 20. Its
extractor sorts `quality, res, fps, hdr:12, source, vcodec`, so the pick ranks
it before codec and a 1080p video takes the Premium VP9 over AV1, as a queued
download does. A queued download needs no `-S` token for it: the site's own
sort fields follow the `-S` ones. Other sites place it differently (TikTok
sorts `quality, codec, size, br` and marks its API copies -2; yt-dlp's
default puts it after size), so the probe keeps it only for sites whose
adapter sets `sortsSourceBeforeCodec`; elsewhere it is absent and every copy
ties on it. A missing value reads as yt-dlp's default, -1.
No H.264 on the video: the codec rank falls back to Best picture's order
with the existing `mp4-unavailable` fit notice.

**Audio, with video:** source default or original language · no DRC ·
native audio preference (effective value per D4) · AAC for Smart TV and
whenever the file type is MP4 (see below).

**Audio only:** unchanged (native best, or a conversion to mp3, m4a, opus,
wav at the profile bitrate).

## File type rules

What can be copied without re-encoding (ffmpeg 9 stream copy; the H.264 +
AAC and VP9 + Opus rows were run, the AAC rows follow the same container
rules; playback not tested):

| Streams | MP4 | MKV | WebM |
| --- | --- | --- | --- |
| H.264 + AAC | ok | ok | needs re-encode |
| VP9 or AV1 + Opus | ok, many players can't play it | ok | ok |
| VP9 or AV1 + AAC | ok | ok | needs re-encode |

So:

- **Smart TV + WebM** is disabled: "WebM can't hold H.264. Choose MKV or
  MP4."
- **Best picture + MP4** is allowed. The ladder adds "AAC audio" so the
  file stays playable in more places, and the tooltip warns that VP9 and
  AV1 in MP4 won't open in QuickTime on older Macs.
- **Best picture + WebM** prefers Opus audio. The video ranks stay as they
  are, because VP9 and AV1 already rank above H.264. When the picked streams
  can't go into WebM (H.264, AAC or Dolby among them), the Format screen
  starts on Auto with a fit notice, and the yt-dlp rule falls back to MKV
  (`webm/mkv`) so the download never fails on the container.
- **MKV** holds anything; it never changes the pick.
- **Embedded subtitles keep forcing MKV** (`EMBED_SUBTITLE_CONTAINER_EXT`,
  ADR 0002), as Review already says. With a file type of MP4 or WebM this
  is a conflict warning on Format and Review, not a silent change.
- An embedded thumbnail on a WebM merge already switches to MKV; with an
  explicit WebM it becomes the same kind of conflict warning.

yt-dlp mechanism: Auto keeps today's arguments. MP4, MKV or WebM pass
`--merge-output-format <type>` (merged downloads) and `--remux-video <type>`
(a single muxed stream). yt-dlp ignores `--remux-video` when
`--recode-video` is present, and Arroxy never passes `--recode-video` in
this design. The exact `-S` strings for the Opus and AAC ranks are
pinned test-first against yt-dlp, not guessed here.

## Profile model

```ts
media:
  | {kind: 'video-audio'; goal: 'best-picture' | 'smart-tv'; tier: PlaylistVideoTier; fileType: 'auto' | 'mp4' | 'mkv' | 'webm'; audio: {native: {kind: 'default'} | {kind: 'custom'; preference: NativeAudioPreference}}}
  | {kind: 'video-only'; goal; tier; fileType}
  // Both video kinds also carry optional `hdr` and `aiUpscaled: 'skip' | 'allow'`
  // (absent: `skip`, including profiles saved before the choice existed).
  | {kind: 'audio-only'; audio: {format; bitrateKbps?}}
  | {kind: 'subtitles-only'}
```

The video-audio `audio.format: 'best' | 'm4a'` goes away: AAC follows from
the goal and the file type (Selection order). Field names are settled in
PR 2; the domain terms (selection order, profile goal, file type, remux) are
in `GLOSSARY.md`.

Stored profiles: custom profiles, built-in overrides and queued jobs already
on disk use `codec` and `tiers`. The media schema maps them once at parse
time (a `z.preprocess`): `codec: 'mp4'` → `goal: 'smart-tv'`, `best` →
`best-picture`, `tiers[0]` → `tier`, native audio `default`. A `best` profile
whose audio was `m4a` becomes Best picture saved as **MP4**, the only way a
profile can still ask for AAC. A Smart TV profile with native audio now takes
AAC like the built-ins always did. No other compatibility layer.

The three Smart TV built-ins keep their old download folders ("Smart TV MP4
Full HD 1080p", ...) although their names are shorter, so files already
downloaded stay where playlist sync looks for them.

## UI

- **Profile editor, Video panel:** Goal (two option cards with name, tag,
  tooltip), Resolution (as today; Smart TV keeps its capped list), and an
  **Advanced** disclosure with File type and Native audio ("Use app
  setting" first). Below them, the summary line that expands into the
  ladder.
- **Format screen:** see Interactive Download below.
- **Review:** the format strip shows "Saves as" with tags; conflict
  warnings for embedded subtitles or thumbnails against an explicit file
  type.
- **Save as profile:** a manual pick saves as the closest goal and tier, as
  today; the file type saves as picked.

## Interactive Download

The Format screen keeps its layout (interactive-download.md, Screen 1).
This spec adds two controls and one word, nothing else.

**Must keep**, checked against the shipped screen:

1. "Pre-selected from **[profile ▾]**" stays a dropdown.
2. The Video + audio / Video, no audio / Audio only / Subtitles only switch.
3. The list filter chips (`HDR10 · SDR · mp4 · webm`, `webm · m4a`).
4. Video rows as today: `1920x1080` and `mp4 · 60fps · HDR10 · 235.9 MB`.
   Audio rows as today: quality bars, `webm · Opus · DRC · 134 kbps · 5.6 MB`.
5. The Profile badge stays on the row the profile picked, also after a
   manual edit.
6. The footer: Total, Back, Download, Continue (to Review, which holds Download ▾).
7. The "Changed from *profile*" row sits in the footer of Format and Review,
   only once something changed. (The "Also from *profile*" summary line and
   Review all were removed: Continue already leads to Review.)

**Added:**

- **Why this one.** A `HelpTip` on the existing Profile badge lists the
  ranks that decided the profile's pick ("1920x1080 · your limit, 60 fps ·
  highest offered, SDR · before HDR, AV1 · ranked above VP9, Stereo
  Opus · from Settings"). No panel, no permanent text. It explains the
  profile's pick, never the user's.
- **Codec in the video meta.** `mp4 · AV1 · 60fps · HDR10 · 235.9 MB`.
  Audio rows already show the codec; video rows don't, so two
  `3840x2160` rows differ only by `mp4` vs `webm` and "AV1 ranked above
  VP9" can't be matched to a row. One word in the technical layer, not a
  new tag.
- **Saves as.** `Saves as .mkv ▾` in the footer after Total, with a
  `AV1 · Opus` tag. Options: Auto (.mkv), MP4, MKV, WebM; the profile's
  value is marked "Profile".
  - It starts on the profile's file type.
  - Options follow the picked streams with the File type rules: picking
    H.264 or Dolby disables WebM, with the reason in the option.
  - The newer action wins. File type WebM, then an H.264 pick: the file
    type goes back to Auto with a one-line note ("WebM can't hold H.264,
    so the file type went back to Auto."). A stream pick is never changed
    behind the user's back.
  - It is a per-download edit: listed in the "Changed from" row, kept by
    updating the profile or saving a new one.
  - At the minimum window (720 px) or in long locales, if the footer can't
    hold it next to Back, Download and Continue, it moves into the
    summary line ("… · saves as .mkv ▾"). Decided in the Scenario
    Workbench, not guessed.
- **Why this matters today:** the `mp4` filter chip reads as "I'll get an
  .mp4 file". In the screenshot this spec was checked against, the mp4
  video merges with webm audio into an .mkv. Saves as removes that guess.

## HDR: Auto, a setting, and old installs keep HDR

Best picture used to follow yt-dlp's default sort, which ranks HDR above SDR
at the same height and frame rate. yt-dlp has no smart rule here: it reads the
format's dynamic range label and ranks DV, HDR12, HDR10+, HDR10, HLG, SDR in
that order (Dolby Vision is held back by `hdr:12`). It knows nothing about the
screen, and HDR looks washed out on one that isn't HDR, so the order is now a
setting with a profile override, like native audio:

- **Settings, "HDR video":** Auto (default for new installs), SDR, HDR. Auto
  picks HDR first only when the screen the app is on shows HDR, otherwise SDR
  first. The check is the `dynamic-range: high` media query, per window, so it
  follows the monitor the window sits on (true on the built-in XDR display of
  the test Mac). A window that cannot answer reads as SDR.
- **Profile, Advanced, "HDR video":** Use app setting (Auto, SDR or HDR), SDR,
  HDR. Only a profile's own choice is stored; absent means the app setting.
- **Order:** resolution, frame rate, then the HDR choice, then codec. A height
  only offered as HDR is still taken, so the choice never costs resolution.
  SDR first is the yt-dlp sort field `hdr:sdr`, written after `res` and `fps`
  because a field named in `-S` outranks every default; HDR first is yt-dlp's
  own order, so no field is written. Checked against yt-dlp on a synthetic
  format list.
- **Resolved when a job is built,** in the renderer, so Auto follows the screen
  at that moment. A headless smoke run has no screen and reads Auto as SDR.
- **Existing installs:** a settings file saved before the setting existed gets
  explicit HDR when it is first read, so nothing they download changes. They
  can switch to Auto or SDR in Settings. A first launch starts on Auto.
- **The tip** names the reason: "this screen shows HDR" or "this screen isn't
  HDR" under Auto; "looks right on any screen" or "richer colour on HDR
  screens" for an explicit choice.
- **Limits:** Auto reads the screen the download happens on, not where the file
  will be watched, and the same link can give a different file on another
  monitor.

## MP4 playback, measured

A Mac with AV1 hardware (M5 Pro, macOS 27) opened MP4 files built the way the
app builds them (streams copied, nothing re-encoded). QuickTime's player stack
could not decode **VP9** video in an MP4 (audio played, video "Cannot Decode"),
while H.264, **AV1** and **Opus** played. Chromium, mpv and ffmpeg played all of
them. So the Format summary and Review warn on VP9 ("won't play video in
QuickTime") and AV1 ("needs a recent Mac"), and not on Opus. Not tested: Safari
itself, Windows players, TVs, editors, Macs without AV1 hardware.

## Out of scope

- Re-encoding. If it comes, it is the last rule of the ladder ("nothing
  fits: convert, slow, may lower quality"), off by default, with its own
  ffmpeg step and progress. yt-dlp reports no progress while recoding, and
  its `--recode-video` compares extensions, not codecs (a VP9 .mp4 is
  "already mp4"), so it would need ffprobe first.
- An "Editing" goal: without re-encoding it fetches the same streams as
  Smart TV. Smart TV's tooltip names editors instead.
- "Avoid AV1": it mainly helps 2016–2020 hardware wanting more than 1080p.
  Smart TV already avoids AV1 and the codec tag shows what was fetched.
  Revisit on real reports, as an Advanced option.
- A global default file type: nothing at app level decides it today and
  Auto is the default. Move it to the global + override pattern if users
  ask for "always MP4".
- Playlist and bulk modes (D9). MOV, AVI, FLV.

## Testing

- Fast logic: building the order from profile + settings; the derived `-S`
  string per goal and file type; the comparator over recorded probes
  matching yt-dlp's own pick (parity); file-type validity and conflict
  rules; stored-profile parsing from the old shape; effective native audio.
- Renderer: editor goal cards, Advanced section, disabled combinations with
  reasons, summary line and ladder; Format `HelpTip`, codec in the video
  meta, "Saves as" options and the newer-action-wins reset; the Must keep
  list above.
- Scenario Workbench: Format with a Best picture pick, a Smart TV fallback,
  and a WebM-fit notice; editor with Advanced open, in long locales at the
  minimum window size.
- Fixture Product E2E: Quick Download with a Best picture + MP4 profile
  lands an `.mp4` and the Interactive Download with the same profile fetches
  the same streams.

## Delivery

1. **PR 1, one order, no visible change.** The selection-order structure
   and its three outputs, `tier` instead of `tiers`, the parity test.
   Behaviour stays identical; the derived `-S` strings match today's.
2. **PR 2, profile model and editor.** Goal, file type, native audio
   override, stored-profile parsing, renamed built-ins, editor UI, glossary.
3. **PR 3, show it.** Profile-badge `HelpTip`, codec in the video meta,
   the Saves as choice on Format and its line on Review, conflict
   warnings, E2E.

Translations happen once, right before PR 2 and PR 3.
