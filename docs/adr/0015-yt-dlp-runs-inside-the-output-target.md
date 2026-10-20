# yt-dlp runs inside the output target, and no folder text reaches its argv

yt-dlp runs `expandvars(expanduser(…))` over every path it is given. On the
template flags (`-o`, `--print-to-file`) it does this before filling fields, and
`%%` is a working escape there. On the plain path flags (`--paths`,
`--load-info-json`, `--cookies`) there is no escape at all on POSIX, and only
Windows' native `$$`/`%%` work. A download folder named after a set variable
(`$HOME`, `%USERPROFILE%`), or one ending in a space (`--paths` values are
stripped), silently sent files somewhere else. Each layer that built a flag
escaped the folder its own way, and every fix reached only the flags its layer
built: four fixes in three layers in one week, and `--paths` still unprotected.

Every yt-dlp run that writes files now runs with its working directory set to
the job's folder, and every path in its argv is relative to it: the temp folder,
the info-json, the subtitle subfolder, and the files yt-dlp reports into. The
folder itself, whatever characters the user gave it, never appears in argv. The
bridge's output target composes all of these flags and returns the working
directory with the plan. The one piece of literal text left, the bound file
name, is escaped without loss: `%` as `%%`, and an empty field (`%(_absent|)s`)
between a `$` and what follows it and before a leading `~`. yt-dlp's expansion
cannot see through the field, and its field substitution then removes it.

Every production spawn also passes `--ignore-config`. With no `--paths home`,
yt-dlp reads `yt-dlp.conf` from its working directory, which would now be the
download folder for every run; a user's global yt-dlp config applied to Arroxy's
downloads before this as well. It passes `--no-plugin-dirs` too: Arroxy ships
no yt-dlp plugins, and yt-dlp would otherwise import any it finds in the user's
config folders or next to its executable into every run.

Rejected:

- **Refusing folders that would expand.** It tells a user their ordinary folder
  is unusable, needs per-OS rules for what "would expand" means (only set
  variables expand), and covers the user's root folder rather than the flags.
- **Escaping per flag.** Impossible for `--paths` on POSIX.
- **Full-width look-alikes for `$` and `~`** in names (ADR 0004). Lossy, and
  unnecessary once the file name is the only literal text and has a lossless
  escape.

## Consequences

Folder and file names keep their ASCII `$`, `%` and `~`. ADR 0004's paragraph on
literal text no longer applies to folders, and file names use the lossless
escape instead of look-alikes.

Paths yt-dlp prints in its log are relative and are resolved against the working
directory; `after_move:filepath` is absolute. yt-dlp always hands FFmpeg a
`file:` prefix, so a file name starting with `-` is safe. A file a run reads from
outside the job's folder (a probe's info-json) is copied into the job's temp
folder first.

The parity oracle (`check:filename-parity`) runs real yt-dlp over every planned
flag, in folders and titles full of `$`, `%` and `~`, on both expansion passes.
