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

## Escape hatch

`--extractor-args youtube:skip=translated_subs` stops yt-dlp emitting translation
entries at all (`get_translated_subs` gate ~4237).
