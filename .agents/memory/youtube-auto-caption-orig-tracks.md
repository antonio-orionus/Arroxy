---
name: youtube-auto-caption-orig-tracks
description: YouTube automatic_captions mixes original ASR (bare code + identical -orig twin) with flaky tlang machine translations; subtitle 429s are translation-endpoint throttling, not an IP block
metadata:
  type: project
---

YouTube's `automatic_captions` map mixes two different things, and they fail differently.

## Key structure (verified live 2026-09-09, video OEryZO2kVhI, ja audio)

- Original-language ASR appears TWICE with byte-identical content: bare code (`ja`)
  plus `-orig` twin (`ja-orig`). Both URLs are `kind=asr&lang=ja` with no `tlang`;
  downloads were md5-identical (258,668 bytes).
- Every other language is an on-demand machine translation: URL carries
  `tlang=<code>` (e.g. `en` → `kind=asr&lang=ja&tlang=en`).

## yt-dlp source pins (extractor/youtube/_video.py, ~lines; local checkout may drift)

- `process_language` (~4207) builds each entry; `-orig` twin labeled ~4305
  ("returned without -orig as well for compatibility").
- ~4310: `Setting tlang=lang returns damaged subtitles` — translations are
  second-class by upstream's own admission.
- `YoutubeDL.process_subtitles` merges both maps; `_write_subtitles` raises
  `Unable to download video subtitles for '<lang>': HTTP Error 429` on fetch failure.

## Failure semantics: translation 429 ≠ IP block

Observed: `en` (tlang) → HTTP 429, while `ja`/`ja-orig` (asr) downloaded fine
from the same IP seconds before and after. So a subtitle-fetch 429 names a
translation-endpoint throttle, not `ipBlock` ("Your IP is likely being blocked").
Do not surface proxy/IP-ban guidance for subtitle failures; the SidecarSubsPhase
soft-fail (`subtitlesFailed`, video already saved) is the correct path.

## Why Arroxy's `-orig` filter is correct

`ProbeService.sanitizeSubtitleMap` with `autoCaptionRequiresOrigSuffix` keeps only
`-orig` keys for YouTube = the real generated tracks, dropping all tlang
translations (the flaky ones). Dropping the bare-code original (e.g. `ja`) is
lossless dedupe — identical bytes to its `-orig` twin.

## No escape hatch in yt-dlp

`--extractor-args youtube:skip=translated_subs` does NOT stop ASR translations.
In `_video.py` (~4237, ~4296-4313, verified on 2026.08.19) the `get_translated_subs`
gate applies only to translations of *manual* tracks (`trans_code-<lang>` keys);
every ASR caption track still yields a bare-key `tlang` entry per translation
language. A `--sub-langs` pattern cannot tell them apart either: a bare `en` is a
manual track, an identical ASR twin, or a translation, depending on the video.
So Arroxy picks exact track keys itself (`pickSubtitleTracks`, the Format
screen's rule) and sends them as `(?-i:<escaped key>)`: queueing resolves a
single video's profile codes from the probe, the subtitle phase resolves a
playlist entry's from the media run's or probe's info-json. Only a job with no
info-json at all (a subtitles-only playlist entry) still sends the code pattern.

## Subtitle source → yt-dlp flags

`SubtitleOptions.autoOnly` (set from the `auto-only` source by
`subtitleSourceOptions`) makes the bridge drop `--write-subs` and keep
`--write-auto-subs`. yt-dlp's `process_subtitles` merges manual first and lets
automatic captions fill only languages without a manual track, so without
`autoOnly` an "auto-only" choice is indistinguishable from manual-first. yt-dlp
fullmatches each `--sub-langs` entry with `re.I` (`orderedSet_from_options`), so
exact keys need the scoped `(?-i:…)` group to stay exact.
