# Filenames are budgeted per platform, at bind time, by Arroxy rather than yt-dlp

A filename template says nothing about how long its output will be, so the
length budget is resolved **per download**, once the real title, uploader, id,
playlist fields, output directory, and platform are known — not when the user
types the template. Typing-time validation keeps only the rules about what a
user may enter: a character cap and at least one distinguishing token.

Three decisions here are hard to reverse and were each chosen against a real
alternative.

**The budget counts in the platform's own unit.** macOS (APFS) and Windows
(NTFS) cap one path component at 255 **UTF-16 code units**; Linux caps it at 255
**bytes**. Measured directly on APFS: 255 CJK characters (765 bytes) write
fine, while 128 emoji (256 code units) fail with `ENAMETOOLONG`. A single byte
budget is therefore correct only on Linux and charges CJK and emoji titles a
roughly threefold penalty on the other two. We accept that the same template can
truncate differently across platforms, because the alternative — clamping
everyone to the strictest unit — takes length away from users whose filesystem
never asked for it.

**Arroxy resolves the name itself instead of delegating to yt-dlp.** yt-dlp's
`%(title).150B` truncates to a byte budget and *then* sanitizes, and sanitizing
grows the string: `:` becomes `" -"` (one character to two) and `|`, `*`, `<`,
`>` become full-width forms (one byte to three). Any cap handed to yt-dlp is
therefore advisory, not binding. Arroxy binds every token it knows to sanitized
literal text sized to fit, and leaves only fields it genuinely cannot know.

**Windows `MAX_PATH` is budgeted around, not engineered away.** The 260-character
ceiling lifts only when the registry sets `LongPathsEnabled` *and* the executable
declares `longPathAware`. yt-dlp's binary is long-path aware (PyInstaller ships
that in its default manifest) but Electron's is not, and libuv never adds the
`\\?\` prefix itself — so Arroxy's own filesystem work is capped regardless.
Shipping a manifest change would still depend on a registry value we cannot set,
so we subtract the resolved output directory from 260 and give the remainder to
the filename.

## Consequences

A token Arroxy has no value for stays a token rather than binding to empty,
because Arroxy's metadata is not always richer than yt-dlp's — binding an absent
id would turn `{title} [{id}]` into `Title []` for an extractor whose id yt-dlp
could still resolve. Playlist fields are exempt: Arroxy queues each entry as its
own single-video job, so yt-dlp has no playlist context and empty is the correct
answer there.

When a name will not fit, tokens give up length in a fixed order —
`playlist_title`, then `uploader`, then `title` — sacrificing context before
identity. `{id}` is never shortened, because playlist dedupe and M3U writing
locate files by matching `[videoId]` before the extension.

`too-long` now means only "more characters than the field accepts". Failures of
*output* length are separate reasons (`path-too-deep`, `template-cannot-fit`)
carrying their own messages, because reporting a blown byte budget as "Template
is too long." told users with an 84-character template that their template was
too long.

The reserve for suffixes grew from 6 bytes to 22, because the name on disk during
a download is longer than the finished name: yt-dlp writes
`<name>.f<format_id>.<ext>.part` for split video/audio, not just `<name>.<ext>`.
