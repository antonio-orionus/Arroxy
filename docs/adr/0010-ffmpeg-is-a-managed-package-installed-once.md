# FFmpeg is a managed package, installed once and kept across app updates

Supersedes ADR 0003's decision to embed FFmpeg in release builds.

FFmpeg, FFprobe and their libraries made up 49.64 MB of the 175.51 MB Windows
download, and Windows is about 90% of users. Release builds now ship without them.
The app installs one approved FFmpeg package per machine at first launch, during
the same warmup that already downloads yt-dlp, and reuses it across app updates
until a different package is approved. Measured on 0.6.2, this makes Setup and
Portable 28.3% smaller (125.87 MB). The Windows package itself is 42.37 MB. Every
Portable launch is also about 2 s faster, because the launcher no longer unpacks
~170 MB of FFmpeg to `%TEMP%` each time.

ADR 0003's reasoning about update cadence still holds. FFmpeg changes rarely, so
it is not tracked or updated automatically. Approved packages are committed pins.
The daily job that publishes the signed binary manifest copies them unchanged,
so a package changes only through a reviewed commit, never by itself. The pin
set is also what the app ships as its offline fallback.

## Considered options

- **Keep embedding FFmpeg.** No first-launch download, but every user pays 50 MB
  on every fresh download for tools that never change between app releases.
- **A narrower custom FFmpeg build.** Smaller, but yt-dlp invokes FFmpeg beyond
  Arroxy's own calls, so which codecs are safe to drop cannot be tested
  exhaustively, and we would own a build pipeline.
- **Prefer an FFmpeg already on the system, and download only when there is
  none.** It would save Homebrew and Linux users one 25–45 MB download, once
  per machine. But a system FFmpeg that passes our checks can still fail a
  download partway through, possibly months later after a distro or Homebrew
  update. That bug is hard to reproduce and lasts, which a one-time saving
  does not justify. The approved package comes first. A system FFmpeg is the
  fallback, or the user's explicit choice through "Set it up manually".
- **Per-operation readiness instead of gating the splash.** Nearly every
  download needs FFmpeg (separate-stream merging is the default), so it would
  gate almost everything at a large UI cost. The splash already gates on
  FFmpeg and shows download progress.

## Consequences

- A package is an archive we build and publish ourselves, in the
  `arroxy-runtime-binaries` repository, from the same upstream builds we
  embedded before. The FFmpeg version no longer depends on what an upstream
  host still keeps. FFmpeg releases there must never be marked latest:
  every client fetches the manifest through that repository's `/latest`
  release.
- Arroxy 0.6.2 and earlier reject a manifest containing any entry other than
  yt-dlp. So FFmpeg lives in a second manifest (v2), and v1 stays published
  with yt-dlp only for as long as those versions are in use. v2 skips entry kinds
  it does not know, so the next new kind does not repeat this.
- Existing users download the package once when they upgrade to the first
  release without bundled FFmpeg, on top of the differential app update.
- Each approved version installs into its own directory and is never modified.
  The active version and one previous version are kept, and older ones are
  removed once nothing holds them.
- The first launch needs network access, as it already did for yt-dlp. A
  machine that has installed a package runs offline from then on.
- An FFmpeg change no longer waits for an app release. The daily manifest is
  generated from `main`, so merging a pin change ships it to every user within
  about a day. A pin change is reviewed as a release.
