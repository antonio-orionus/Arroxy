---
name: ytdlp-stdout-drops-non-ascii
description: We learn media and sidecar paths by scraping yt-dlp's stdout; that stream corrupts them four different ways (codepage drop, split multi-byte char, split line, bare-\r framing) and every corruption fails silently as ENOENT
metadata:
  type: project
---

Arroxy learns the media path and every sidecar subtitle path by parsing yt-dlp's
stdout (`[download] Destination:`, `[info] Writing video subtitles to:` →
`ProgressParser` → `active.mediaPath` / `active.subtitlePaths`). That is a
human-facing presentation stream, not an API, and it corrupts paths **four**
independent ways. All four fail identically and silently: the path we hold was
never written, `postProcessSubtitleFiles` ENOENTs, the warning is swallowed by
design, and auto-captions keep the overlaps [[cue-overlap fix]] removes.

Found via a 2026-09-12 report — a playlist of Persian-titled videos on Windows.
Reported as "playlists break subtitles"; it is really **non-ASCII titles**, and a
**busy pipe**. Single videos break the same way.

## V1 — console codepage drops characters

`write_string()` ends in `buffer.write(s.encode(enc, 'ignore'))` with
`enc = params['encoding'] or sys.stdout.encoding or preferredencoding()`.
`'ignore'`, not `'replace'` — unencodable characters are deleted outright, no `?`
left behind. On a legacy ANSI codepage a Persian title collapses to the surviving
ASCII:

```
-o     …\NzGuL & MmdReza - ین بازی‌ها … 😂 _ … _ Couple Games.%(ext)s
stdout …\NzGuL & MmdReza -        _     _ Couple Games.en.srt
```

Fixed by pinning `--encoding utf-8` in the argv `YtDlp.spawn()` builds. It must
stay *after* the E2E harness args — `tests/unit/ytdlp-args.test.ts` asserts those
are the literal argv prefix. `params['encoding']` only reaches yt-dlp's output
paths (`write_string`, `_format_text`, the verbose banner); filenames on disk use
the filesystem encoding and cannot be renamed by it.

## V2 — multi-byte character split across a chunk boundary

`chunk.toString()` decodes each `data` event alone, so a UTF-8 sequence straddling
a pipe read becomes U+FFFD. Measured on one 88-byte line: **13 of 87 split points
corrupt it**. Note V1's fix *creates* this exposure — cp1252 output was single-byte
and structurally immune.

## V3 — line split across a chunk boundary

A pipe read caps at the highWaterMark and cuts wherever it lands. The download
path split every chunk in isolation with no carry-over, so a halved line reached
the parser as two fragments matching nothing. `ProbeService.consumeStdout` already
buffered a remainder; the download path never did.

## V4 — bare `\r` framing (the one that actually bit)

yt-dlp separates progress *redraws* with a bare `\r` (overwrite the line you just
drew) and only ends real lines with `\n`. `splitStderrLines` split on `/\r?\n/`,
which does not split a lone `\r` — so a whole burst of redraws stayed glued into
one "line", swallowing any real line flushed behind it, `Destination:` included.

Needs a busy pipe, which is why it looked like a bulk/playlist bug: the reporter's
own log shows six `[download]` lines arriving in a single `data` event.

**The E2E harness passes `--newline` for download runs and production does not**,
so E2E exercised `\n` framing while production shipped `\r`. That fidelity gap is
why this escaped. Production was left on `\r` deliberately — `splitStderrLines`
now treats every terminator as a boundary, so both framings parse identically and
there was no reason to also change yt-dlp's behavior.

## The shape of the fix

`createStreamTextReader()` in `src/main/utils/process.ts` — a `StringDecoder` plus
a held-back partial line, drained at stream end — wired into `YtDlp.spawn()` so
probe *and* download inherit it. It returns `text` and `lines` separately on
purpose: accumulated stdout/stderr must stay complete for error classification and
probe JSON parsing, while parsers must only ever see whole lines. Fixing it at the
spawn seam also fixed probe JSON decoding, where a playlist dump spans many chunks
and any non-ASCII title could mojibake.

## Gotchas met on the way

- `vi.mock('@main/utils/process')` with no factory **automocks every export** —
  new exports come back `undefined` and blow up at the call site. Use the
  `importOriginal` + spread pattern the other eight test files use.
- `waitForSpawn()` in `download-service-crash.test.ts` watches a module-level
  mock; without `vi.clearAllMocks()` it resolves on the *previous* test's spawn and
  the next test emits into a process with no listeners attached yet.

## Verified on real Windows (2026-09-12)

The fix shipped verified on macOS only, where V1 cannot reproduce. Re-checked
against a Windows 11 ARM64 VM (build 26200, console codepage **437**) driving
`yt-dlp.exe` through a pipe, exactly as Arroxy does.

V1 reproduces and the flag is what fixes it — note the characters are *deleted*,
not replaced, and the byte counts show it:

```
expected : NzGuL & MmdReza - این بازی‌ها … 😂 _ Couple Games.mp4
no flag  : NzGuL & MmdReza -   ?  _ Couple Games.mp4        (42 bytes)
--enc u8 : NzGuL & MmdReza - این بازی‌ها … 😂 _ Couple Games.mp4  (69 bytes)
```

The decisive question is not what yt-dlp *prints* but whether that matches what
it *writes* — `params['encoding']` cannot rename a file, so if the two disagreed
the ENOENT would survive the fix. Driving a real download off a local HTTP server
(no external network) they agree byte-for-byte, and the scraped path opens:

```
printed path : ...\NzGuL & MmdReza - این بازی‌ها … 😂 _ Couple Games.mp4
on disk      : NzGuL & MmdReza - این بازی‌ها … 😂 _ Couple Games.mp4
scraped path opens (no ENOENT): true
progress used bare \r framing : true
```

That last line is worth keeping: a real Windows download **does** use bare `\r`
framing, so V4 is live in production there. It is the vector the E2E harness hides
by passing `--newline`.

Reproduce with the probes in this repo's history or rebuild them in three steps:
craft an info.json with a non-ASCII title → `--print filename` with and without
`--encoding utf-8` → then a real transfer from `http://127.0.0.1` and compare the
scraped `[download] Destination:` against `readdir`.

## When this bites again

Any new code that trusts a path, title, or ID scraped from yt-dlp stdout. The
reader covers every consumer that goes through `YtDlp.spawn()`; a spawn path that
bypasses it inherits all four vectors. The structural escape — reading paths from
`--print-to-file` or the info.json instead of the log stream — was *not* taken:
the sidecar-subs spawn writes no info.json and yt-dlp has no clean per-subtitle
print field, and stdout must stay parseable for progress regardless.
