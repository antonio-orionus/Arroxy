# The Format screen's pick runs yt-dlp's own selection

A download profile becomes a yt-dlp `-f` selector and `-S` sort
(`mediaIntentSpec`). Quick Download and the queue hand those strings to yt-dlp;
the Format screen pre-selects streams for the same profile. It used to do that
with a hand-written copy of yt-dlp's ranking, and the copy drifted: codec names
matched by prefix where yt-dlp uses regexes, no protocol rank, the extractor's
own sort order ignored, Opus and AAC ranked the other way round. The screen
showed one pick and Quick Download downloaded another.

The pick now evaluates the very strings yt-dlp receives, through a translation
of yt-dlp's `FormatSorter` and of the part of its selector language that
`mediaIntentSpec` writes. The probe keeps yt-dlp's raw formats and the
extractor's `_format_sort_fields` beside the display options so the translation runs
on what yt-dlp runs on. `bun run check` runs every recorded probe through a
matrix of profiles against a pinned yt-dlp (in-process, from its zipapp) and
fails on any pick the two disagree on.

Rejected: asking yt-dlp itself for each pick (`--load-info-json` with the
profile's `-f`/`-S`). It is exact by construction, but every profile switch and
every playlist row would wait on a process start, slow for the one-file
Windows build. The translation is instant and the gate makes drift visible the day a
yt-dlp change or one of our strings breaks it.

The translation is a contract to keep, not a one-off copy. Bumping the pinned yt-dlp
in the gate, adding a selector construct to `mediaIntentSpec`, or recording a
new probe source is when it is checked again; a difference is a real bug in one
of the two, never a snapshot to accept. The gate found several such bugs in the
strings we send yt-dlp itself (an audio token outranking resolution, `~=?`
filters matching missing fields, video-only profiles failing on sites with no
video-only stream), which is the main argument for keeping it.
